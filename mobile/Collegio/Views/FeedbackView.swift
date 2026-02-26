import SwiftUI

// MARK: - Feedback Board View
struct FeedbackView: View {
    @StateObject private var viewModel = FeedbackViewModel()
    @State private var showCreateFeedback = false
    
    var body: some View {
        ZStack {
            GradientBackground()
            
            VStack(spacing: 0) {
                // Header
                headerView
                
                // Feedback List
                if viewModel.isLoading && viewModel.feedbackItems.isEmpty {
                    Spacer()
                    ProgressView()
                    Text("Loading feedback...")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .padding(.top, 8)
                    Spacer()
                } else if viewModel.feedbackItems.isEmpty {
                    emptyState
                } else {
                    feedbackList
                }
            }
        }
        .navigationTitle("Feedback Board")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button(action: { showCreateFeedback = true }) {
                    Image(systemName: "plus.circle.fill")
                        .font(.title3)
                        .foregroundStyle(Color.collegioOrange)
                }
            }
        }
        .sheet(isPresented: $showCreateFeedback) {
            CreateFeedbackView { _, _ in
                // Reload after submission
                Task { await viewModel.loadFeedback() }
            }
        }
        .task {
            await viewModel.loadFeedback()
        }
    }
    
    // MARK: - Header
    private var headerView: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Help us improve Collegio!")
                .font(.headline)
            Text("Share your ideas, report bugs, or request features. Upvote items you'd like to see implemented.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(.ultraThinMaterial)
    }
    
    // MARK: - Empty State
    private var emptyState: some View {
        VStack(spacing: 16) {
            Spacer()
            Image(systemName: "lightbulb")
                .font(.system(size: 60))
                .foregroundStyle(Color.collegioOrange.opacity(0.5))
            
            Text("No Feedback Yet")
                .font(.title2.bold())
            
            Text("Be the first to share your thoughts!")
                .font(.subheadline)
                .foregroundStyle(.secondary)
            
            Button(action: { showCreateFeedback = true }) {
                Text("Submit Feedback")
                    .font(.headline)
                    .foregroundStyle(.white)
                    .padding(.horizontal, 24)
                    .padding(.vertical, 12)
                    .background(Color.collegioOrange, in: Capsule())
            }
            Spacer()
        }
    }
    
    // MARK: - Feedback List
    private var feedbackList: some View {
        ScrollView {
            LazyVStack(spacing: 12) {
                ForEach(viewModel.feedbackItems) { item in
                    FeedbackCard(
                        item: item,
                        onUpvote: {
                            Task { await viewModel.toggleUpvote(for: item.id) }
                        }
                    )
                }
            }
            .padding()
        }
        .refreshable {
            await viewModel.loadFeedback()
        }
    }
}

// MARK: - Feedback Card
struct FeedbackCard: View {
    let item: FeedbackItem
    let onUpvote: () -> Void
    
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            // Upvote Button
            VStack(spacing: 4) {
                Button(action: onUpvote) {
                    VStack(spacing: 4) {
                        Image(systemName: item.hasUpvoted ? "arrow.up.circle.fill" : "arrow.up.circle")
                            .font(.title2)
                            .foregroundStyle(item.hasUpvoted ? Color.collegioOrange : .secondary)
                        Text("\(item.upvotes)")
                            .font(.subheadline.bold())
                            .foregroundStyle(item.hasUpvoted ? Color.collegioOrange : .primary)
                    }
                }
                .buttonStyle(.plain)
            }
            .frame(width: 50)
            
            // Content
            VStack(alignment: .leading, spacing: 8) {
                // Category Badge
                HStack {
                    Text(item.category.rawValue)
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(item.category.color)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(item.category.color.opacity(0.15), in: Capsule())
                    
                    Spacer()
                    
                    if item.status == .planned {
                        Text("Planned")
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(.green)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(.green.opacity(0.15), in: Capsule())
                    } else if item.status == .inProgress {
                        Text("In Progress")
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(.blue)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(.blue.opacity(0.15), in: Capsule())
                    }
                }
                
                Text(item.title)
                    .font(.headline)
                
                Text(item.description)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .lineLimit(3)
                
                // Footer
                HStack {
                    Text(item.authorName)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    
                    Text("•")
                        .foregroundStyle(.secondary)
                    
                    Text(item.timeAgo)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
        }
        .padding()
        .glassCard()
    }
}

// MARK: - Create Feedback View
struct CreateFeedbackView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var text = ""
    @State private var selectedCategory: FeedbackCategory = .feature
    @State private var isSubmitting = false
    @State private var errorMessage: String?
    
    let onSubmit: (String, String) -> Void
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    // Category
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Category")
                            .font(.headline)
                        
                        HStack(spacing: 10) {
                            ForEach(FeedbackCategory.allCases, id: \.self) { category in
                                Button(action: { selectedCategory = category }) {
                                    Text(category.rawValue)
                                        .font(.subheadline.weight(.medium))
                                        .padding(.horizontal, 16)
                                        .padding(.vertical, 10)
                                        .background(selectedCategory == category ? category.color : Color.gray.opacity(0.2))
                                        .foregroundStyle(selectedCategory == category ? .white : .primary)
                                        .clipShape(Capsule())
                                }
                            }
                        }
                    }
                    
                    // Feedback Text
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Your Feedback")
                            .font(.headline)
                        
                        TextEditor(text: $text)
                            .frame(height: 150)
                            .padding(8)
                            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
                    }
                    
                    if let error = errorMessage {
                        Text(error)
                            .font(.caption)
                            .foregroundStyle(.red)
                    }
                }
                .padding()
            }
            .background(GradientBackground())
            .navigationTitle("Submit Feedback")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Submit") {
                        Task { await submitFeedback() }
                    }
                    .fontWeight(.semibold)
                    .disabled(text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || isSubmitting)
                }
            }
        }
        .presentationDetents([.large])
    }
    
    private func submitFeedback() async {
        isSubmitting = true
        errorMessage = nil
        
        do {
            let _ = try await APIService.shared.submitFeedback(
                text: text.trimmingCharacters(in: .whitespacesAndNewlines),
                category: selectedCategory.apiValue
            )
            onSubmit(text, selectedCategory.apiValue)
            dismiss()
        } catch {
            errorMessage = "Failed to submit feedback. Please try again."
        }
        
        isSubmitting = false
    }
}

// MARK: - Feedback Models
struct FeedbackItem: Identifiable {
    let id: String
    let title: String
    let description: String
    let category: FeedbackCategory
    let authorId: String
    let authorName: String
    var upvotes: Int
    var hasUpvoted: Bool
    let status: FeedbackStatus
    let createdAt: Date
    
    var timeAgo: String {
        let interval = Date().timeIntervalSince(createdAt)
        if interval < 60 { return "Just now" }
        if interval < 3600 {
            return "\(Int(interval / 60))m ago"
        } else if interval < 86400 {
            return "\(Int(interval / 3600))h ago"
        } else {
            return "\(Int(interval / 86400))d ago"
        }
    }
    
    /// Create from API response
    static func from(_ apiItem: FeedbackAPIItem, currentUserId: String?) -> FeedbackItem {
        let category = FeedbackCategory.from(apiItem.category)
        let status = FeedbackStatus.from(apiItem.status)
        
        // Parse date
        var date = Date()
        if let dateStr = apiItem.createdAt {
            let formatter = ISO8601DateFormatter()
            formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
            if let parsed = formatter.date(from: dateStr) {
                date = parsed
            } else {
                formatter.formatOptions = [.withInternetDateTime]
                if let parsed = formatter.date(from: dateStr) {
                    date = parsed
                }
            }
        }
        
        return FeedbackItem(
            id: apiItem.id,
            title: apiItem.text,
            description: "",
            category: category,
            authorId: apiItem.user?.id ?? "",
            authorName: apiItem.user?.displayName ?? "Anonymous",
            upvotes: apiItem.likeCount,
            hasUpvoted: apiItem.likes?.contains(currentUserId ?? "") ?? false,
            status: status,
            createdAt: date
        )
    }
}

enum FeedbackCategory: String, CaseIterable {
    case feature = "Feature"
    case bug = "Bug"
    case improvement = "Improvement"
    
    var color: Color {
        switch self {
        case .feature: return .purple
        case .bug: return .red
        case .improvement: return .blue
        }
    }
    
    var apiValue: String {
        switch self {
        case .feature: return "feature"
        case .bug: return "bug"
        case .improvement: return "improvement"
        }
    }
    
    static func from(_ string: String) -> FeedbackCategory {
        switch string.lowercased() {
        case "bug": return .bug
        case "improvement": return .improvement
        default: return .feature
        }
    }
}

enum FeedbackStatus {
    case open, planned, inProgress, completed
    
    static func from(_ string: String) -> FeedbackStatus {
        switch string.lowercased() {
        case "planned": return .planned
        case "in_progress", "inprogress": return .inProgress
        case "completed": return .completed
        default: return .open
        }
    }
}

// MARK: - Feedback ViewModel
@MainActor
class FeedbackViewModel: ObservableObject {
    @Published var feedbackItems: [FeedbackItem] = []
    @Published var isLoading = false
    
    private let api = APIService.shared
    
    private var currentUserId: String? {
        UserDefaults.standard.string(forKey: "userId")
    }
    
    func loadFeedback() async {
        isLoading = true
        
        do {
            let response = try await api.getFeedback()
            feedbackItems = response.feedback.map { FeedbackItem.from($0, currentUserId: currentUserId) }
        } catch {
            print("Failed to load feedback: \(error)")
        }
        
        isLoading = false
    }
    
    func toggleUpvote(for id: String) async {
        // Optimistic update
        if let index = feedbackItems.firstIndex(where: { $0.id == id }) {
            feedbackItems[index].hasUpvoted.toggle()
            feedbackItems[index].upvotes += feedbackItems[index].hasUpvoted ? 1 : -1
        }
        
        do {
            let _ = try await api.toggleFeedbackLike(feedbackId: id)
        } catch {
            // Revert on failure
            if let index = feedbackItems.firstIndex(where: { $0.id == id }) {
                feedbackItems[index].hasUpvoted.toggle()
                feedbackItems[index].upvotes += feedbackItems[index].hasUpvoted ? 1 : -1
            }
        }
    }
}

#Preview {
    NavigationStack {
        FeedbackView()
    }
}
