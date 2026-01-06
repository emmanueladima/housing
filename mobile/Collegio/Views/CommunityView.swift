import SwiftUI

struct CommunityView: View {
    @StateObject private var viewModel = CommunityViewModel()
    @State private var showCreatePost = false
    
    let channels = ["All", "Housing", "Roommates", "Marketplace", "Events", "General"]
    
    var body: some View {
        NavigationStack {
            ZStack {
                GradientBackground()
                
                VStack(spacing: 0) {
                    channelPills
                    postsFeed
                }
                
                // Floating Add Button (FAB)
                VStack {
                    Spacer()
                    HStack {
                        Spacer()
                        floatingAddButton
                    }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 16)
                }
            }
            .navigationTitle("Community")
            .task {
                await viewModel.fetchPosts()
            }
            .refreshable {
                await viewModel.fetchPosts()
            }
            .sheet(isPresented: $showCreatePost) {
                CreatePostView()
            }
        }
    }
    
    // MARK: - Floating Add Button (FAB)
    private var floatingAddButton: some View {
        Button(action: { showCreatePost = true }) {
            Image(systemName: "plus")
                .font(.title2.weight(.semibold))
                .foregroundStyle(.white)
                .frame(width: 56, height: 56)
                .background {
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: [Color.collegioOrange, Color.collegioOrangeDark],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .shadow(color: Color.collegioOrange.opacity(0.4), radius: 12, x: 0, y: 6)
                }
        }
        .buttonStyle(.plain)
    }
    
    // MARK: - Channel Pills
    private var channelPills: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 10) {
                ForEach(channels, id: \.self) { channel in
                    Button(action: {
                        withAnimation(.spring(response: 0.3)) {
                            viewModel.selectedChannel = channel.lowercased()
                            Task { await viewModel.fetchPosts() }
                        }
                    }) {
                        HStack(spacing: 8) {
                            channelIcon(for: channel)
                            Text(channel)
                        }
                        .filterPill(isActive: viewModel.selectedChannel == channel.lowercased())
                    }
                }
            }
            .padding(.horizontal)
        }
        .padding(.vertical, 12)
    }
    
    private func channelIcon(for channel: String) -> some View {
        let iconName: String
        switch channel.lowercased() {
        case "housing": iconName = "house.fill"
        case "roommates": iconName = "person.2.fill"
        case "marketplace": iconName = "cart.fill"
        case "events": iconName = "calendar"
        case "general": iconName = "bubble.left.and.bubble.right.fill"
        default: iconName = "square.grid.2x2.fill"
        }
        return Image(systemName: iconName).font(.caption)
    }
    
    // MARK: - Posts Feed
    private var postsFeed: some View {
        Group {
            if viewModel.isLoading && viewModel.posts.isEmpty {
                VStack {
                    Spacer()
                    ProgressView()
                    Text("Loading posts...")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .padding(.top, 8)
                    Spacer()
                }
            } else {
                ScrollView {
                    LazyVStack(spacing: 16) {
                        ForEach(viewModel.posts) { post in
                            NavigationLink(destination: CommunityPostDetailView(post: post)) {
                                CommunityPostCard(post: post)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(.horizontal)
                    .padding(.bottom, 100)
                }
            }
        }
    }
}

// MARK: - Community Post Card
struct CommunityPostCard: View {
    let post: CommunityPost
    @State private var isLiked: Bool
    @State private var showReportSheet = false
    
    init(post: CommunityPost) {
        self.post = post
        _isLiked = State(initialValue: post.isLiked ?? false)
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Header
            HStack {
                Circle()
                    .fill(Color.collegioBlue.opacity(0.2))
                    .frame(width: 36, height: 36)
                    .overlay {
                        Text(post.author?.initials ?? "?")
                            .font(.headline)
                            .foregroundStyle(Color.collegioBlue)
                    }
                
                VStack(alignment: .leading, spacing: 2) {
                    Text(post.author?.fullName ?? "Anonymous")
                        .font(.subheadline.bold())
                    Text(timeAgoString(from: post.createdAt))
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                
                Spacer()
                
                // Channel Badge
                Text(post.channel.capitalized)
                    .font(.caption2.weight(.semibold))
                    .foregroundStyle(.secondary)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(.secondary.opacity(0.1), in: Capsule())
            }
            
            // Content
            Text(post.title)
                .font(.headline)
            
            Text(post.content)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .lineLimit(3)
            
            // Actions
            HStack(spacing: 24) {
                Button(action: { isLiked.toggle() }) {
                    HStack(spacing: 6) {
                        Image(systemName: isLiked ? "heart.fill" : "heart")
                            .foregroundStyle(isLiked ? .red : .secondary)
                        Text("\(post.likesCount + (isLiked && !(post.isLiked ?? false) ? 1 : 0))")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                }
                
                Button(action: {}) {
                    HStack(spacing: 6) {
                        Image(systemName: "bubble.left")
                        Text("\(post.commentsCount)")
                            .font(.subheadline)
                    }
                    .foregroundStyle(.secondary)
                }
                
                Spacer()
                
                // Report Menu
                Menu {
                    Button(role: .destructive) {
                        showReportSheet = true
                    } label: {
                        Label("Report Post", systemImage: "exclamationmark.triangle")
                    }
                } label: {
                    Image(systemName: "ellipsis")
                        .foregroundStyle(.secondary)
                }
            }
        }
        .padding(16)
        .glassCard()
        .sheet(isPresented: $showReportSheet) {
            PostReportSheet(postId: post.id)
        }
    }
    
    private func timeAgoString(from date: Date) -> String {
        let interval = Date().timeIntervalSince(date)
        if interval < 3600 {
            return "\(Int(interval / 60))m ago"
        } else if interval < 86400 {
            return "\(Int(interval / 3600))h ago"
        } else {
            return "\(Int(interval / 86400))d ago"
        }
    }
}



#Preview {
    CommunityView()
}

#Preview("Dark Mode") {
    CommunityView()
        .preferredColorScheme(.dark)
}
