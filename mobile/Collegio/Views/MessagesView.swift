import SwiftUI

struct MessagesView: View {
    @StateObject private var viewModel = MessagesViewModel()
    @State private var showNewMessage = false
    
    var body: some View {
        NavigationStack {
            ZStack {
                GradientBackground()
                
                if viewModel.isLoading && viewModel.conversations.isEmpty {
                    VStack {
                        ProgressView()
                        Text("Loading messages...")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                            .padding(.top, 8)
                    }
                } else if viewModel.conversations.isEmpty {
                    emptyState
                } else {
                    conversationsList
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
            .navigationTitle("Messages")
            .task {
                await viewModel.fetchConversations()
            }
            .refreshable {
                await viewModel.fetchConversations()
            }
            .sheet(isPresented: $showNewMessage) {
                NewMessageView()
            }
        }
    }
    
    // MARK: - Floating Add Button (FAB)
    private var floatingAddButton: some View {
        Button(action: { showNewMessage = true }) {
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
    
    // MARK: - Empty State
    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "bubble.left.and.bubble.right")
                .font(.system(size: 60))
                .foregroundStyle(.secondary)
            
            Text("No Messages Yet")
                .font(.title2.bold())
            
            Text("Start a conversation with a landlord or potential roommate")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)
            
            Button(action: { showNewMessage = true }) {
                Text("New Message")
                    .font(.headline)
                    .foregroundStyle(.white)
                    .padding(.horizontal, 24)
                    .padding(.vertical, 12)
                    .background(Color.collegioOrange, in: Capsule())
            }
        }
    }
    
    // MARK: - Conversations List
    private var conversationsList: some View {
        ScrollView {
            LazyVStack(spacing: 12) {
                ForEach(viewModel.conversations) { conversation in
                    NavigationLink(destination: ChatView(conversation: conversation)) {
                        ConversationRowView(conversation: conversation)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal)
            .padding(.top, 8)
            .padding(.bottom, 100)
        }
    }
}

// MARK: - Conversation Row
struct ConversationRowView: View {
    let conversation: Conversation
    
    var otherParticipant: User? {
        conversation.participants.first
    }
    
    var body: some View {
        HStack(spacing: 14) {
            // Avatar
            Circle()
                .fill(Color.collegioOrange.opacity(0.2))
                .frame(width: 56, height: 56)
                .overlay {
                    Text(otherParticipant?.initials ?? "?")
                        .font(.title2.bold())
                        .foregroundStyle(Color.collegioOrange)
                }
            
            // Content
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(otherParticipant?.fullName ?? "Unknown")
                        .font(.headline)
                        .lineLimit(1)
                    
                    Spacer()
                    
                    if let lastMessage = conversation.lastMessage {
                        Text(timeAgoString(from: lastMessage.createdAt))
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
                
                HStack {
                    Text(conversation.lastMessage?.content ?? "No messages yet")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                    
                    Spacer()
                    
                    if conversation.unreadCount > 0 {
                        Text("\(conversation.unreadCount)")
                            .font(.caption.bold())
                            .foregroundStyle(.white)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(Color.collegioOrange, in: Capsule())
                    }
                }
            }
        }
        .padding(16)
        .glassCard()
    }
    
    private func timeAgoString(from date: Date) -> String {
        let interval = Date().timeIntervalSince(date)
        if interval < 60 {
            return "now"
        } else if interval < 3600 {
            return "\(Int(interval / 60))m"
        } else if interval < 86400 {
            return "\(Int(interval / 3600))h"
        } else {
            return "\(Int(interval / 86400))d"
        }
    }
}

// MARK: - Chat View (Placeholder)
struct ChatView: View {
    let conversation: Conversation
    @State private var messageText = ""
    @State private var showReportSheet = false
    
    var body: some View {
        ZStack {
            GradientBackground()
            
            VStack {
                // Messages would go here
                Spacer()
                
                Text("Chat with \(conversation.participants.first?.fullName ?? "User")")
                    .foregroundStyle(.secondary)
                
                Spacer()
                
                // Message Input
                HStack(spacing: 12) {
                    TextField("Type a message...", text: $messageText)
                        .padding(12)
                        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 20))
                    
                    Button(action: {}) {
                        Image(systemName: "paperplane.fill")
                            .font(.title3)
                            .foregroundStyle(.white)
                            .padding(12)
                            .background(Color.collegioOrange, in: Circle())
                    }
                }
                .padding()
            }
        }
        .navigationTitle(conversation.participants.first?.fullName ?? "Chat")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Menu {
                    Button(role: .destructive) {
                        showReportSheet = true
                    } label: {
                        Label("Report Conversation", systemImage: "exclamationmark.triangle")
                    }
                } label: {
                    Image(systemName: "ellipsis.circle")
                        .foregroundStyle(Color.collegioOrange)
                }
            }
        }
        .sheet(isPresented: $showReportSheet) {
            MessageReportSheet(conversationId: conversation.id)
        }
    }
}

// MARK: - New Message View
struct NewMessageView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var searchText = ""
    
    var body: some View {
        NavigationStack {
            ZStack {
                GradientBackground()
                
                VStack(spacing: 20) {
                    // Search
                    HStack(spacing: 12) {
                        Image(systemName: "magnifyingglass")
                            .foregroundStyle(.secondary)
                        TextField("Search users...", text: $searchText)
                    }
                    .padding()
                    .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
                    .padding(.horizontal)
                    
                    // Recent contacts would go here
                    VStack {
                        Image(systemName: "person.crop.circle.badge.plus")
                            .font(.system(size: 50))
                            .foregroundStyle(.secondary)
                        Text("Search for a user to start a conversation")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    .frame(maxHeight: .infinity)
                }
            }
            .navigationTitle("New Message")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Cancel") { dismiss() }
                }
            }
        }
        .presentationDetents([.large])
    }
}

#Preview {
    MessagesView()
}

#Preview("Dark Mode") {
    MessagesView()
        .preferredColorScheme(.dark)
}
