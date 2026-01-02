import SwiftUI

// MARK: - Post Comment Model (local to this view)
struct PostComment: Identifiable {
    let id: String
    let author: User?
    let content: String
    let createdAt: Date
}

struct CommunityPostDetailView: View {
    let post: CommunityPost
    @State private var isLiked: Bool
    @State private var likesCount: Int
    @State private var comments: [PostComment] = []
    @State private var commentsCount: Int
    @State private var newComment = ""
    @FocusState private var isCommentFocused: Bool
    @Environment(\.dismiss) private var dismiss
    @Environment(\.colorScheme) private var colorScheme
    
    // Adaptive colors
    private var textPrimary: Color { colorScheme == .dark ? .white : .primary }
    private var textSecondary: Color { colorScheme == .dark ? .white.opacity(0.7) : .secondary }
    
    init(post: CommunityPost) {
        self.post = post
        _isLiked = State(initialValue: post.isLiked ?? false)
        _likesCount = State(initialValue: post.likesCount)
        _commentsCount = State(initialValue: post.commentsCount)
    }
    
    var body: some View {
        ZStack {
            GradientBackground()
            
            VStack(spacing: 0) {
                ScrollView {
                    VStack(alignment: .leading, spacing: 20) {
                        // Channel & Intent Badge
                        HStack(spacing: 8) {
                            Text(post.channel.capitalized)
                                .font(.caption.bold())
                                .foregroundStyle(.white)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 6)
                                .background(Color.collegioOrange, in: Capsule())
                            
                            if let intent = post.intent {
                                Text(intent.capitalized)
                                    .font(.caption)
                                    .foregroundStyle(textSecondary)
                                    .padding(.horizontal, 10)
                                    .padding(.vertical, 5)
                                    .background {
                                        Capsule()
                                            .fill(.thinMaterial)
                                    }
                            }
                        }
                        
                        // Author Info
                        HStack(spacing: 12) {
                            Circle()
                                .fill(Color.collegioOrange.opacity(0.2))
                                .frame(width: 44, height: 44)
                                .overlay {
                                    Text(post.author?.initials ?? "??")
                                        .font(.subheadline.bold())
                                        .foregroundStyle(Color.collegioOrange)
                                }
                            
                            VStack(alignment: .leading, spacing: 2) {
                                Text(post.author?.fullName ?? "Anonymous")
                                    .font(.subheadline.bold())
                                    .foregroundStyle(textPrimary)
                                
                                Text(post.createdAt, style: .relative)
                                    .font(.caption)
                                    .foregroundStyle(textSecondary)
                            }
                            
                            Spacer()
                            
                            Menu {
                                Button("Report", systemImage: "flag") {}
                                Button("Share", systemImage: "square.and.arrow.up") {}
                            } label: {
                                Image(systemName: "ellipsis")
                                    .foregroundStyle(textSecondary)
                                    .padding(8)
                            }
                        }
                        
                        // Title
                        Text(post.title)
                            .font(.title2.bold())
                            .foregroundStyle(textPrimary)
                        
                        // Content
                        Text(post.content)
                            .font(.body)
                            .foregroundStyle(textSecondary)
                            .lineSpacing(4)
                        
                        // Action Bar
                        actionBar
                        
                        Divider()
                            .background(textSecondary.opacity(0.3))
                        
                        // Comments Section
                        commentsSection
                    }
                    .padding()
                    .padding(.bottom, 80)
                }
                
                // Fixed Comment Input
                commentInputBar
            }
        }
        .navigationTitle("Post")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await loadComments()
        }
    }
    
    // MARK: - Action Bar
    private var actionBar: some View {
        HStack(spacing: 24) {
            Button(action: {
                withAnimation(.spring(response: 0.3)) {
                    isLiked.toggle()
                    likesCount += isLiked ? 1 : -1
                }
            }) {
                HStack(spacing: 6) {
                    Image(systemName: isLiked ? "heart.fill" : "heart")
                        .foregroundStyle(isLiked ? .red : textSecondary)
                    Text("\(likesCount)")
                        .font(.subheadline)
                        .foregroundStyle(textSecondary)
                }
            }
            
            Button(action: { isCommentFocused = true }) {
                HStack(spacing: 6) {
                    Image(systemName: "bubble.left")
                        .foregroundStyle(textSecondary)
                    Text("\(commentsCount)")
                        .font(.subheadline)
                        .foregroundStyle(textSecondary)
                }
            }
            
            Button(action: { /* Share */ }) {
                Image(systemName: "square.and.arrow.up")
                    .foregroundStyle(textSecondary)
            }
            
            Spacer()
        }
        .padding(.vertical, 8)
    }
    
    // MARK: - Comments Section
    private var commentsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Comments (\(commentsCount))")
                .font(.headline)
                .foregroundStyle(textPrimary)
            
            if comments.isEmpty {
                Text("No comments yet. Be the first!")
                    .font(.subheadline)
                    .foregroundStyle(textSecondary)
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding(.vertical, 24)
            } else {
                ForEach(comments) { comment in
                    CommentRowAdaptive(comment: comment)
                }
            }
        }
    }
    
    // MARK: - Comment Input Bar
    private var commentInputBar: some View {
        HStack(spacing: 12) {
            TextField("Write a comment...", text: $newComment)
                .textFieldStyle(.plain)
                .padding(12)
                .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 12))
                .focused($isCommentFocused)
            
            Button(action: submitComment) {
                Image(systemName: "arrow.up.circle.fill")
                    .font(.title)
                    .foregroundStyle(newComment.isEmpty ? .gray : Color.collegioOrange)
            }
            .disabled(newComment.isEmpty)
        }
        .padding()
        .background(.thinMaterial)
    }
    
    private func loadComments() async {
        comments = [
            PostComment(id: "c1", author: nil, content: "Great post! Very helpful.", createdAt: Date().addingTimeInterval(-3600)),
            PostComment(id: "c2", author: nil, content: "I'm interested, please DM me!", createdAt: Date().addingTimeInterval(-1800))
        ]
    }
    
    private func submitComment() {
        guard !newComment.trimmingCharacters(in: .whitespaces).isEmpty else { return }
        
        let comment = PostComment(
            id: UUID().uuidString,
            author: nil,
            content: newComment,
            createdAt: Date()
        )
        
        withAnimation {
            comments.append(comment)
            commentsCount += 1
            newComment = ""
        }
        
        isCommentFocused = false
    }
}

// MARK: - Comment Row (Adaptive)
struct CommentRowAdaptive: View {
    let comment: PostComment
    @Environment(\.colorScheme) private var colorScheme
    
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Circle()
                .fill(Color.collegioOrange.opacity(0.2))
                .frame(width: 36, height: 36)
                .overlay {
                    Text(comment.author?.initials ?? "??")
                        .font(.caption.bold())
                        .foregroundStyle(Color.collegioOrange)
                }
            
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(comment.author?.fullName ?? "Anonymous")
                        .font(.subheadline.bold())
                        .foregroundStyle(colorScheme == .dark ? .white : .primary)
                    
                    Text("•")
                        .foregroundStyle(.secondary)
                    
                    Text(comment.createdAt, style: .relative)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                
                Text(comment.content)
                    .font(.subheadline)
                    .foregroundStyle(colorScheme == .dark ? .white.opacity(0.9) : .primary)
            }
            
            Spacer()
        }
        .padding(12)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 12))
    }
}

#Preview {
    NavigationStack {
        CommunityPostDetailView(post: CommunityPost(
            id: "1",
            authorId: "u1",
            author: User.sample,
            channel: "housing",
            intent: "looking-for",
            title: "Looking for a 2BR apartment near campus",
            content: "Hey everyone! I'm looking for a 2-bedroom apartment within walking distance of campus. My budget is around $1,200/month. I'm clean, quiet, and respectful. Moving in January. Let me know if you have any leads!",
            likesCount: 12,
            commentsCount: 3,
            createdAt: Date().addingTimeInterval(-7200),
            isLiked: false
        ))
    }
}
