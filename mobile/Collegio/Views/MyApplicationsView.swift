import SwiftUI

struct MyApplicationsView: View {
    @State private var selectedTab = 0
    @State private var applications: [ApplicationData] = []
    @State private var isLoading = true
    @State private var errorMessage: String?
    @State private var withdrawingId: String?
    @State private var showWithdrawConfirm = false
    @State private var selectedWithdrawId: String?
    @Environment(\.colorScheme) private var colorScheme
    
    // Adaptive colors
    private var textPrimary: Color { colorScheme == .dark ? .white : .primary }
    private var textSecondary: Color { colorScheme == .dark ? .white.opacity(0.7) : .secondary }
    
    var activeApplications: [ApplicationData] {
        applications.filter { $0.statusEnum.isActive }
    }
    
    var pastApplications: [ApplicationData] {
        applications.filter { !$0.statusEnum.isActive }
    }
    
    var body: some View {
        ZStack {
            GradientBackground()
            
            VStack(spacing: 0) {
                // Segmented Tabs
                HStack(spacing: 12) {
                    TabPillAdaptive(title: "Active (\(activeApplications.count))", isSelected: selectedTab == 0) {
                        selectedTab = 0
                    }
                    TabPillAdaptive(title: "Past", isSelected: selectedTab == 1) {
                        selectedTab = 1
                    }
                }
                .padding()
                
                // Content
                if isLoading {
                    Spacer()
                    ProgressView("Loading applications...")
                        .foregroundStyle(textSecondary)
                    Spacer()
                } else if let error = errorMessage {
                    Spacer()
                    VStack(spacing: 12) {
                        Image(systemName: "exclamationmark.triangle")
                            .font(.system(size: 40))
                            .foregroundStyle(.secondary)
                        Text(error)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                        Button("Retry") {
                            Task { await loadApplications() }
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(Color.collegioOrange)
                    }
                    Spacer()
                } else {
                    TabView(selection: $selectedTab) {
                        applicationsList(activeApplications, emptyMessage: "No active applications").tag(0)
                        applicationsList(pastApplications, emptyMessage: "No past applications").tag(1)
                    }
                    .tabViewStyle(.page(indexDisplayMode: .never))
                }
            }
        }
        .navigationTitle("My Applications")
        .navigationBarTitleDisplayMode(.large)
        .refreshable {
            await loadApplications()
        }
        .task {
            await loadApplications()
        }
        .alert("Withdraw Application?", isPresented: $showWithdrawConfirm) {
            Button("Cancel", role: .cancel) { selectedWithdrawId = nil }
            Button("Withdraw", role: .destructive) {
                if let id = selectedWithdrawId {
                    Task { await withdrawApplication(id: id) }
                }
            }
        } message: {
            Text("This action cannot be undone. The landlord will be notified.")
        }
    }
    
    @ViewBuilder
    private func applicationsList(_ apps: [ApplicationData], emptyMessage: String) -> some View {
        if apps.isEmpty {
            VStack(spacing: 16) {
                Image(systemName: "doc.text.magnifyingglass")
                    .font(.system(size: 48))
                    .foregroundStyle(textSecondary)
                
                Text(emptyMessage)
                    .font(.title3.bold())
                    .foregroundStyle(textPrimary)
                
                Text("Applications you submit will appear here")
                    .font(.subheadline)
                    .foregroundStyle(textSecondary)
                
                NavigationLink(destination: HomeView()) {
                    HStack(spacing: 8) {
                        Image(systemName: "magnifyingglass")
                        Text("Browse Listings")
                    }
                    .font(.headline)
                    .foregroundStyle(.white)
                    .padding(.horizontal, 24)
                    .padding(.vertical, 14)
                    .background(Color.collegioOrange, in: RoundedRectangle(cornerRadius: 12))
                }
                .padding(.top, 8)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        } else {
            ScrollView {
                LazyVStack(spacing: 16) {
                    ForEach(apps) { app in
                        ApplicationCardView(
                            application: app,
                            isWithdrawing: withdrawingId == app.id,
                            onWithdraw: {
                                selectedWithdrawId = app.id
                                showWithdrawConfirm = true
                            }
                        )
                    }
                }
                .padding()
                .padding(.bottom, 40)
            }
        }
    }
    
    private func loadApplications() async {
        isLoading = applications.isEmpty
        errorMessage = nil
        
        do {
            applications = try await APIService.shared.getMyApplications()
        } catch {
            if applications.isEmpty {
                errorMessage = "Failed to load applications"
            }
        }
        
        isLoading = false
    }
    
    private func withdrawApplication(id: String) async {
        withdrawingId = id
        
        do {
            try await APIService.shared.withdrawApplication(id: id)
            // Refresh
            await loadApplications()
        } catch {
            // Error handling — could show alert
        }
        
        withdrawingId = nil
        selectedWithdrawId = nil
    }
}

// MARK: - Tab Pill (Adaptive)
struct TabPillAdaptive: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void
    @Environment(\.colorScheme) private var colorScheme
    
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.subheadline.bold())
                .foregroundStyle(isSelected ? Color.collegioOrange : (colorScheme == .dark ? .white.opacity(0.7) : .secondary))
                .padding(.horizontal, 20)
                .padding(.vertical, 10)
                .background {
                    if isSelected {
                        Capsule()
                            .fill(colorScheme == .dark ? AnyShapeStyle(.white) : AnyShapeStyle(Color(.systemBackground)))
                            .overlay(Capsule().stroke(Color.collegioOrange, lineWidth: 2))
                    } else {
                        Capsule()
                            .fill(.thinMaterial)
                    }
                }
        }
    }
}

// MARK: - Application Card View
struct ApplicationCardView: View {
    let application: ApplicationData
    let isWithdrawing: Bool
    let onWithdraw: () -> Void
    @Environment(\.colorScheme) private var colorScheme
    
    private var textPrimary: Color { colorScheme == .dark ? .white : .primary }
    private var textSecondary: Color { colorScheme == .dark ? .white.opacity(0.7) : .secondary }
    
    private var listingTitle: String { application.listingId?.title ?? "Listing" }
    private var listingAddress: String { application.listingId?.address ?? "Address unavailable" }
    private var listingRent: Int? { application.listingId?.rent }
    private var listingImage: String? { application.listingId?.images?.first }
    
    private var daysSince: Int {
        guard let date = application.formattedDate else { return 0 }
        return Calendar.current.dateComponents([.day], from: date, to: Date()).day ?? 0
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Image / Placeholder Header
            ZStack(alignment: .bottomLeading) {
                if let imageUrl = listingImage, let url = URL(string: imageUrl) {
                    AsyncImage(url: url) { image in
                        image.resizable().aspectRatio(contentMode: .fill)
                    } placeholder: {
                        placeholderImage
                    }
                } else {
                    placeholderImage
                }
            }
            .frame(height: 120)
            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
            
            VStack(alignment: .leading, spacing: 10) {
                // Title & Status
                HStack {
                    Text(listingTitle)
                        .font(.headline)
                        .foregroundStyle(textPrimary)
                        .lineLimit(1)
                    
                    Spacer()
                    
                    HStack(spacing: 4) {
                        Image(systemName: application.statusEnum.icon)
                            .font(.caption2)
                        Text(application.statusEnum.displayName)
                            .font(.caption.bold())
                    }
                    .foregroundStyle(.white)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 5)
                    .background(statusColor, in: Capsule())
                }
                
                // Address
                HStack(spacing: 4) {
                    Image(systemName: "mappin.circle.fill")
                        .font(.caption2)
                    Text(listingAddress)
                        .font(.caption)
                }
                .foregroundStyle(textSecondary)
                
                // Rent & Applied Time
                HStack {
                    if let rent = listingRent {
                        Text("$\(rent)/mo")
                            .font(.title3.bold())
                            .foregroundStyle(Color.collegioOrange)
                    }
                    
                    Spacer()
                    
                    HStack(spacing: 4) {
                        Image(systemName: "clock")
                            .font(.caption2)
                        Text("Applied \(daysSince == 0 ? "today" : "\(daysSince)d ago")")
                            .font(.caption)
                    }
                    .foregroundStyle(textSecondary)
                }
                
                // Tour info if scheduled
                if let tour = application.tourScheduled, tour.date != nil {
                    HStack(spacing: 6) {
                        Image(systemName: "calendar.badge.clock")
                            .foregroundStyle(.purple)
                        Text("Tour: \(tour.date ?? "") at \(tour.time ?? "")")
                            .font(.caption.bold())
                            .foregroundStyle(.purple)
                        if tour.confirmed == true {
                            Image(systemName: "checkmark.circle.fill")
                                .font(.caption)
                                .foregroundStyle(.green)
                        }
                    }
                    .padding(.vertical, 4)
                }
                
                // Action Buttons
                HStack(spacing: 12) {
                    if application.statusEnum == .submitted || application.statusEnum == .underReview {
                        Button(action: onWithdraw) {
                            HStack(spacing: 4) {
                                if isWithdrawing {
                                    ProgressView()
                                        .scaleEffect(0.7)
                                } else {
                                    Image(systemName: "arrow.uturn.left")
                                        .font(.caption)
                                }
                                Text("Withdraw")
                            }
                            .font(.subheadline.bold())
                            .foregroundStyle(.red)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 10)
                            .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 10))
                            .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.red.opacity(0.5), lineWidth: 1))
                        }
                        .disabled(isWithdrawing)
                    }
                    
                    if let response = application.landlordResponse, let msg = response.message, !msg.isEmpty {
                        HStack(spacing: 4) {
                            Image(systemName: "envelope.fill")
                                .font(.caption)
                            Text("Has Response")
                        }
                        .font(.caption.bold())
                        .foregroundStyle(Color.collegioOrange)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(Color.collegioOrange.opacity(0.15), in: Capsule())
                    }
                }
            }
            .padding(14)
        }
        .glassCard()
    }
    
    private var statusColor: Color {
        switch application.statusEnum {
        case .submitted: return .blue
        case .underReview: return .yellow
        case .interviewScheduled: return .purple
        case .approved: return .green
        case .rejected: return .red
        case .withdrawn: return .gray
        }
    }
    
    private var placeholderImage: some View {
        Rectangle()
            .fill(LinearGradient(colors: [Color.gray.opacity(0.3), Color.gray.opacity(0.5)], startPoint: .topLeading, endPoint: .bottomTrailing))
            .overlay {
                Image(systemName: "house.fill")
                    .font(.title)
                    .foregroundStyle(colorScheme == .dark ? .white.opacity(0.4) : .secondary)
            }
    }
}

#Preview {
    NavigationStack {
        MyApplicationsView()
    }
}
