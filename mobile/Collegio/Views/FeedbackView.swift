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
            CreateFeedbackView { newFeedback in
                viewModel.addFeedback(newFeedback)
            }
        }
        .onAppear {
            viewModel.loadSampleData()
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
                        onUpvote: { viewModel.toggleUpvote(for: item.id) }
                    )
                }
            }
            .padding()
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
    @State private var title = ""
    @State private var description = ""
    @State private var selectedCategory: FeedbackCategory = .feature
    
    let onSubmit: (FeedbackItem) -> Void
    
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
                    
                    // Title
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Title")
                            .font(.headline)
                        
                        TextField("Brief summary of your feedback", text: $title)
                            .textFieldStyle(.plain)
                            .padding()
                            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
                    }
                    
                    // Description
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Description")
                            .font(.headline)
                        
                        TextEditor(text: $description)
                            .frame(height: 150)
                            .padding(8)
                            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
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
                        let feedback = FeedbackItem(
                            id: UUID().uuidString,
                            title: title,
                            description: description,
                            category: selectedCategory,
                            authorId: "current-user",
                            authorName: "You",
                            upvotes: 0,
                            hasUpvoted: false,
                            status: .open,
                            createdAt: Date()
                        )
                        onSubmit(feedback)
                        dismiss()
                    }
                    .fontWeight(.semibold)
                    .disabled(title.isEmpty || description.isEmpty)
                }
            }
        }
        .presentationDetents([.large])
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
        if interval < 3600 {
            return "\(Int(interval / 60))m ago"
        } else if interval < 86400 {
            return "\(Int(interval / 3600))h ago"
        } else {
            return "\(Int(interval / 86400))d ago"
        }
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
}

enum FeedbackStatus {
    case open, planned, inProgress, completed
}

// MARK: - Feedback ViewModel
@MainActor
class FeedbackViewModel: ObservableObject {
    @Published var feedbackItems: [FeedbackItem] = []
    @Published var isLoading = false
    
    func loadSampleData() {
        feedbackItems = [
            FeedbackItem(
                id: "1",
                title: "Dark mode improvements",
                description: "Would love to see better contrast in dark mode, especially on the listings cards.",
                category: .improvement,
                authorId: "user1",
                authorName: "Alex M.",
                upvotes: 23,
                hasUpvoted: false,
                status: .planned,
                createdAt: Date().addingTimeInterval(-86400)
            ),
            FeedbackItem(
                id: "2",
                title: "Push notifications for messages",
                description: "It would be great to get notified when a landlord responds to my inquiry.",
                category: .feature,
                authorId: "user2",
                authorName: "Jordan K.",
                upvotes: 45,
                hasUpvoted: true,
                status: .inProgress,
                createdAt: Date().addingTimeInterval(-172800)
            ),
            FeedbackItem(
                id: "3",
                title: "Filter not working on mobile",
                description: "The distance filter doesn't seem to apply when searching for listings near campus.",
                category: .bug,
                authorId: "user3",
                authorName: "Sam W.",
                upvotes: 8,
                hasUpvoted: false,
                status: .open,
                createdAt: Date().addingTimeInterval(-3600)
            ),
        ]
    }
    
    func toggleUpvote(for id: String) {
        if let index = feedbackItems.firstIndex(where: { $0.id == id }) {
            feedbackItems[index].hasUpvoted.toggle()
            feedbackItems[index].upvotes += feedbackItems[index].hasUpvoted ? 1 : -1
        }
    }
    
    func addFeedback(_ item: FeedbackItem) {
        feedbackItems.insert(item, at: 0)
    }
}

#Preview {
    NavigationStack {
        FeedbackView()
    }
}
