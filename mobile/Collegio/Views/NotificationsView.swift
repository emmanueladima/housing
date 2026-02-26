import SwiftUI

// MARK: - Notification Model
struct NotificationItem: Codable, Identifiable {
    let id: String
    let userId: String?
    let type: String
    let title: String?
    let content: String
    let link: String?
    let relatedId: String?
    let isRead: Bool
    let icon: String?
    let createdAt: String?
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case userId, type, title, content, link, relatedId, isRead, icon, createdAt
    }
    
    var displayIcon: String {
        switch type {
        case "message": return "bubble.left.fill"
        case "match": return "heart.fill"
        case "application": return "doc.text.fill"
        case "new_listing": return "house.fill"
        case "tour": return "calendar"
        case "review": return "star.fill"
        case "community_reply": return "arrowshape.turn.up.left.fill"
        case "system_announcement": return "megaphone.fill"
        default: return "bell.fill"
        }
    }
    
    var iconColor: Color {
        switch type {
        case "message": return .blue
        case "match": return .pink
        case "application": return .green
        case "new_listing": return Color.collegioOrange
        case "tour": return .purple
        case "review": return .yellow
        case "community_reply": return .teal
        case "system_announcement": return Color.collegioOrange
        default: return .gray
        }
    }
    
    var timeAgo: String {
        guard let dateStr = createdAt else { return "" }
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        guard let date = formatter.date(from: dateStr) else {
            // Try without fractional seconds
            formatter.formatOptions = [.withInternetDateTime]
            guard let date = formatter.date(from: dateStr) else { return "" }
            return relativeTime(from: date)
        }
        return relativeTime(from: date)
    }
    
    private func relativeTime(from date: Date) -> String {
        let interval = Date().timeIntervalSince(date)
        if interval < 60 { return "Just now" }
        if interval < 3600 { return "\(Int(interval / 60))m ago" }
        if interval < 86400 { return "\(Int(interval / 3600))h ago" }
        if interval < 604800 { return "\(Int(interval / 86400))d ago" }
        return "\(Int(interval / 604800))w ago"
    }
}

struct UnreadCountResponse: Decodable {
    let count: Int
}

// MARK: - Notification Service

class NotificationService {
    static let shared = NotificationService()
    private let api = APIService.shared
    private let baseEndpoint = "/notifications"
    
    func fetchNotifications() async throws -> [NotificationItem] {
        try await api.authenticatedRequest(baseEndpoint)
    }
    
    func getUnreadCount() async throws -> Int {
        let response: UnreadCountResponse = try await api.authenticatedRequest("\(baseEndpoint)/unread-count")
        return response.count
    }
    
    func markAsRead(id: String) async throws {
        let _: EmptyResponse = try await api.authenticatedRequest("\(baseEndpoint)/\(id)/read", method: "PATCH")
    }
    
    func markAllAsRead() async throws {
        let _: EmptyResponse = try await api.authenticatedRequest("\(baseEndpoint)/read-all", method: "PATCH")
    }
    
    func deleteNotification(id: String) async throws {
        let _: EmptyResponse = try await api.authenticatedRequest("\(baseEndpoint)/\(id)", method: "DELETE")
    }
}

// MARK: - Notifications ViewModel

@MainActor
class NotificationsViewModel: ObservableObject {
    @Published var notifications: [NotificationItem] = []
    @Published var isLoading = false
    @Published var unreadCount = 0
    @Published var errorMessage: String?
    
    private let service = NotificationService.shared
    
    func loadNotifications() async {
        isLoading = true
        errorMessage = nil
        
        do {
            notifications = try await service.fetchNotifications()
            unreadCount = notifications.filter { !$0.isRead }.count
        } catch {
            errorMessage = "Failed to load notifications"
        }
        
        isLoading = false
    }
    
    func fetchUnreadCount() async {
        do {
            unreadCount = try await service.getUnreadCount()
        } catch {
            // Silently fail — badge just won't show
        }
    }
    
    func markAsRead(_ notification: NotificationItem) async {
        do {
            try await service.markAsRead(id: notification.id)
            if let index = notifications.firstIndex(where: { $0.id == notification.id }) {
                // Reload to get updated state
                await loadNotifications()
            }
        } catch {}
    }
    
    func markAllAsRead() async {
        do {
            try await service.markAllAsRead()
            await loadNotifications()
        } catch {}
    }
    
    func deleteNotification(_ notification: NotificationItem) async {
        do {
            try await service.deleteNotification(id: notification.id)
            notifications.removeAll { $0.id == notification.id }
            unreadCount = notifications.filter { !$0.isRead }.count
        } catch {}
    }
}

// MARK: - Notifications View

struct NotificationsView: View {
    @StateObject private var viewModel = NotificationsViewModel()
    
    var body: some View {
        ZStack {
            GradientBackground()
            
            if viewModel.isLoading && viewModel.notifications.isEmpty {
                VStack(spacing: 12) {
                    ProgressView()
                    Text("Loading notifications...")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
            } else if viewModel.notifications.isEmpty {
                emptyState
            } else {
                notificationList
            }
        }
        .navigationTitle("Notifications")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            if !viewModel.notifications.isEmpty {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        Task { await viewModel.markAllAsRead() }
                    } label: {
                        Text("Read All")
                            .font(.subheadline.weight(.medium))
                            .foregroundStyle(Color.collegioOrange)
                    }
                }
            }
        }
        .task {
            await viewModel.loadNotifications()
        }
    }
    
    // MARK: - Empty State
    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "bell.slash")
                .font(.system(size: 56))
                .foregroundStyle(Color.collegioOrange.opacity(0.4))
            
            Text("No Notifications")
                .font(.title2.bold())
            
            Text("You're all caught up! We'll notify you when something happens.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)
        }
    }
    
    // MARK: - Notification List
    private var notificationList: some View {
        ScrollView {
            LazyVStack(spacing: 8) {
                ForEach(viewModel.notifications) { notification in
                    NotificationRow(notification: notification)
                        .onTapGesture {
                            Task { await viewModel.markAsRead(notification) }
                        }
                        .swipeActions(edge: .trailing) {
                            Button(role: .destructive) {
                                Task { await viewModel.deleteNotification(notification) }
                            } label: {
                                Label("Delete", systemImage: "trash")
                            }
                        }
                }
            }
            .padding()
        }
        .refreshable {
            await viewModel.loadNotifications()
        }
    }
}

// MARK: - Notification Row
struct NotificationRow: View {
    let notification: NotificationItem
    
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            // Icon
            ZStack {
                Circle()
                    .fill(notification.iconColor.opacity(0.15))
                    .frame(width: 44, height: 44)
                
                Image(systemName: notification.displayIcon)
                    .font(.body)
                    .foregroundStyle(notification.iconColor)
            }
            
            // Content
            VStack(alignment: .leading, spacing: 4) {
                if let title = notification.title {
                    Text(title)
                        .font(.subheadline.bold())
                        .lineLimit(1)
                }
                
                Text(notification.content)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .lineLimit(2)
                
                Text(notification.timeAgo)
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }
            
            Spacer()
            
            // Unread indicator
            if !notification.isRead {
                Circle()
                    .fill(Color.collegioOrange)
                    .frame(width: 8, height: 8)
                    .padding(.top, 6)
            }
        }
        .padding(12)
        .background(
            notification.isRead
                ? AnyShapeStyle(.ultraThinMaterial)
                : AnyShapeStyle(Color.collegioOrange.opacity(0.05))
        )
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(notification.isRead ? Color.clear : Color.collegioOrange.opacity(0.15), lineWidth: 1)
        )
    }
}

#Preview {
    NavigationStack {
        NotificationsView()
    }
}
