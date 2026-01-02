import SwiftUI

struct MyApplicationsView: View {
    @State private var selectedTab = 0
    @State private var applications: [RentalApplication] = []
    @State private var isLoading = true
    @Environment(\.colorScheme) private var colorScheme
    
    // Adaptive colors
    private var textPrimary: Color { colorScheme == .dark ? .white : .primary }
    private var textSecondary: Color { colorScheme == .dark ? .white.opacity(0.7) : .secondary }
    
    var activeApplications: [RentalApplication] {
        applications.filter { $0.status != .rejected && $0.status != .withdrawn }
    }
    
    var pastApplications: [RentalApplication] {
        applications.filter { $0.status == .rejected || $0.status == .withdrawn }
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
        .task {
            await loadApplications()
        }
    }
    
    @ViewBuilder
    private func applicationsList(_ apps: [RentalApplication], emptyMessage: String) -> some View {
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
                        ApplicationCardAdaptive(application: app)
                    }
                }
                .padding()
                .padding(.bottom, 40)
            }
        }
    }
    
    private func loadApplications() async {
        try? await Task.sleep(nanoseconds: 800_000_000)
        
        applications = [
            RentalApplication(
                id: "1",
                listing: ApplicationListing(id: "l1", title: "Modern Studio Apt", address: "123 College Ave", rent: 1200, imageUrl: nil),
                status: .underReview,
                appliedDate: Date().addingTimeInterval(-172800),
                moveInDate: Date().addingTimeInterval(2592000)
            ),
            RentalApplication(
                id: "2",
                listing: ApplicationListing(id: "l2", title: "2 Bedroom Shared House", address: "456 University St", rent: 850, imageUrl: nil),
                status: .submitted,
                appliedDate: Date().addingTimeInterval(-432000),
                moveInDate: Date().addingTimeInterval(2592000)
            ),
            RentalApplication(
                id: "3",
                listing: ApplicationListing(id: "l3", title: "Luxury Condo", address: "789 Downtown Blvd", rent: 1500, imageUrl: nil),
                status: .approved,
                appliedDate: Date().addingTimeInterval(-604800),
                moveInDate: Date().addingTimeInterval(1296000)
            )
        ]
        
        isLoading = false
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

// MARK: - Application Models
struct RentalApplication: Identifiable {
    let id: String
    let listing: ApplicationListing
    let status: RentalApplicationStatus
    let appliedDate: Date
    let moveInDate: Date
    var landlordMessage: String?
    var tourDate: Date?
}

struct ApplicationListing: Identifiable {
    let id: String
    let title: String
    let address: String
    let rent: Int
    let imageUrl: String?
}

enum RentalApplicationStatus: String, CaseIterable {
    case submitted = "Submitted"
    case underReview = "Under Review"
    case interviewScheduled = "Interview"
    case approved = "Approved"
    case rejected = "Rejected"
    case withdrawn = "Withdrawn"
    
    var color: Color {
        switch self {
        case .submitted: return .blue
        case .underReview: return .yellow
        case .interviewScheduled: return .purple
        case .approved: return .green
        case .rejected: return .red
        case .withdrawn: return .gray
        }
    }
    
    var icon: String {
        switch self {
        case .submitted: return "doc.text.fill"
        case .underReview: return "eye.fill"
        case .interviewScheduled: return "calendar"
        case .approved: return "checkmark.circle.fill"
        case .rejected: return "xmark.circle.fill"
        case .withdrawn: return "arrow.uturn.left"
        }
    }
}

// MARK: - Application Card (Adaptive)
struct ApplicationCardAdaptive: View {
    let application: RentalApplication
    @Environment(\.colorScheme) private var colorScheme
    
    private var textPrimary: Color { colorScheme == .dark ? .white : .primary }
    private var textSecondary: Color { colorScheme == .dark ? .white.opacity(0.7) : .secondary }
    
    var daysSince: Int {
        Calendar.current.dateComponents([.day], from: application.appliedDate, to: Date()).day ?? 0
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Image / Placeholder Header
            ZStack(alignment: .bottomLeading) {
                if let imageUrl = application.listing.imageUrl, let url = URL(string: imageUrl) {
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
                    Text(application.listing.title)
                        .font(.headline)
                        .foregroundStyle(textPrimary)
                        .lineLimit(1)
                    
                    Spacer()
                    
                    HStack(spacing: 4) {
                        Image(systemName: application.status.icon)
                            .font(.caption2)
                        Text(application.status.rawValue)
                            .font(.caption.bold())
                    }
                    .foregroundStyle(.white)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 5)
                    .background(application.status.color, in: Capsule())
                }
                
                // Address
                HStack(spacing: 4) {
                    Image(systemName: "mappin.circle.fill")
                        .font(.caption2)
                    Text(application.listing.address)
                        .font(.caption)
                }
                .foregroundStyle(textSecondary)
                
                // Rent & Applied Time
                HStack {
                    Text("$\(application.listing.rent)/mo")
                        .font(.title3.bold())
                        .foregroundStyle(Color.collegioOrange)
                    
                    Spacer()
                    
                    HStack(spacing: 4) {
                        Image(systemName: "clock")
                            .font(.caption2)
                        Text("Applied \(daysSince == 0 ? "today" : "\(daysSince)d ago")")
                            .font(.caption)
                    }
                    .foregroundStyle(textSecondary)
                }
                
                // Action Buttons
                HStack(spacing: 12) {
                    Button(action: { /* View listing */ }) {
                        Text("View Listing")
                            .font(.subheadline.bold())
                            .foregroundStyle(textPrimary)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 10)
                            .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 10))
                    }
                    
                    if application.status == .approved {
                        Button(action: { /* View lease */ }) {
                            Text("View Lease")
                                .font(.subheadline.bold())
                                .foregroundStyle(.white)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 10)
                                .background(Color.green, in: RoundedRectangle(cornerRadius: 10))
                        }
                    } else if application.status == .submitted || application.status == .underReview {
                        Button(action: { /* Withdraw */ }) {
                            Text("Withdraw")
                                .font(.subheadline.bold())
                                .foregroundStyle(.red)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 10)
                                .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 10))
                                .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.red.opacity(0.5), lineWidth: 1))
                        }
                    }
                }
            }
            .padding(14)
        }
        .glassCard()
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
