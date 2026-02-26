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
                    
                    if let lastMessageAt = conversation.lastMessageAt {
                        Text(timeAgoString(from: lastMessageAt))
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
                
                HStack {
                    Text(conversation.lastMessage ?? "No messages yet")
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

// MARK: - Chat View
struct ChatView: View {
    let conversation: Conversation
    @State private var messages: [Message] = []
    @State private var messageText = ""
    @State private var isLoading = true
    @State private var showReportSheet = false
    @FocusState private var isInputFocused: Bool
    
    private var currentUserId: String? {
        UserDefaults.standard.string(forKey: "userId")
    }
    
    var body: some View {
        ZStack {
            GradientBackground()
            
            VStack(spacing: 0) {
                if isLoading {
                    Spacer()
                    ProgressView()
                        .scaleEffect(1.2)
                    Text("Loading messages...")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .padding(.top, 8)
                    Spacer()
                } else if messages.isEmpty {
                    Spacer()
                    VStack(spacing: 12) {
                        Image(systemName: "bubble.left.and.bubble.right")
                            .font(.system(size: 40))
                            .foregroundStyle(.secondary)
                        Text("No messages yet")
                            .font(.headline)
                        Text("Start the conversation!")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    Spacer()
                } else {
                    // Messages List
                    ScrollViewReader { proxy in
                        ScrollView {
                            LazyVStack(spacing: 12) {
                                ForEach(Array(messages.enumerated()), id: \.element.id) { index, message in
                                    let previousMessage = index > 0 ? messages[index - 1] : nil
                                    MessageBubble(
                                        message: message,
                                        isFromCurrentUser: message.sender?.id == currentUserId,
                                        previousMessage: previousMessage
                                    )
                                    .id(message.id)
                                }
                            }
                            .padding()
                        }
                        .onChange(of: messages.count) { _, _ in
                            if let lastMessage = messages.last {
                                withAnimation {
                                    proxy.scrollTo(lastMessage.id, anchor: .bottom)
                                }
                            }
                        }
                    }
                }
                
                // Message Input
                HStack(spacing: 12) {
                    TextField("Type a message...", text: $messageText)
                        .padding(12)
                        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 20))
                        .focused($isInputFocused)
                    
                    Button(action: sendMessage) {
                        Image(systemName: "paperplane.fill")
                            .font(.title3)
                            .foregroundStyle(.white)
                            .padding(12)
                            .background(messageText.isEmpty ? Color.gray : Color.collegioOrange, in: Circle())
                    }
                    .disabled(messageText.isEmpty)
                }
                .padding()
                .background(.ultraThinMaterial)
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
        .task {
            await loadMessages()
        }
    }
    
    private func loadMessages() async {
        isLoading = true
        do {
            messages = try await APIService.shared.getMessages(threadId: conversation.id)
        } catch {
            print("Error loading messages: \(error)")
        }
        isLoading = false
    }
    
    private func sendMessage() {
        guard !messageText.trimmingCharacters(in: .whitespaces).isEmpty else { return }
        
        // Optimistic update - add message locally
        let newMessage = Message(
            id: UUID().uuidString,
            threadId: conversation.id,
            sender: nil, // Will be populated by backend
            content: messageText,
            createdAt: Date(),
            attachments: nil
        )
        messages.append(newMessage)
        messageText = ""
        isInputFocused = false
        
        // TODO: Send to backend
    }
}

// MARK: - Message Bubble
struct MessageBubble: View {
    let message: Message
    let isFromCurrentUser: Bool
    var previousMessage: Message? = nil
    
    // Show timestamp only if gap > 5 minutes from previous message
    private var shouldShowTimestamp: Bool {
        guard let previous = previousMessage else {
            return true // Always show for first message
        }
        let timeGap = message.createdAt.timeIntervalSince(previous.createdAt)
        return timeGap > 300 // 5 minutes = 300 seconds
    }
    
    var body: some View {
        HStack {
            if isFromCurrentUser { Spacer() }
            
            VStack(alignment: isFromCurrentUser ? .trailing : .leading, spacing: 4) {
                Text(message.content)
                    .padding(12)
                    .background(isFromCurrentUser ? Color.collegioOrange : Color(.systemGray5))
                    .foregroundStyle(isFromCurrentUser ? .white : .primary)
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                
                if shouldShowTimestamp {
                    Text(message.createdAt.formatted(date: .omitted, time: .shortened))
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
            }
            
            if !isFromCurrentUser { Spacer() }
        }
    }
}

// MARK: - New Message View
struct NewMessageView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var searchText = ""
    @State private var searchResults: [User] = []
    @State private var isSearching = false
    @State private var searchTask: Task<Void, Never>?
    @State private var selectedUser: User?
    @State private var navigateToChat = false
    
    var body: some View {
        NavigationStack {
            ZStack {
                GradientBackground()
                
                VStack(spacing: 0) {
                    // Search Field
                    HStack(spacing: 12) {
                        Image(systemName: "magnifyingglass")
                            .foregroundStyle(.secondary)
                        TextField("Search by name or username...", text: $searchText)
                            .autocorrectionDisabled()
                            .textInputAutocapitalization(.never)
                        
                        if isSearching {
                            ProgressView()
                                .scaleEffect(0.8)
                        } else if !searchText.isEmpty {
                            Button {
                                searchText = ""
                                searchResults = []
                            } label: {
                                Image(systemName: "xmark.circle.fill")
                                    .foregroundStyle(.secondary)
                            }
                        }
                    }
                    .padding()
                    .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
                    .padding(.horizontal)
                    .padding(.top, 8)
                    
                    // Results
                    if !searchResults.isEmpty {
                        ScrollView {
                            LazyVStack(spacing: 12) {
                                ForEach(searchResults, id: \.id) { user in
                                    Button {
                                        selectedUser = user
                                        navigateToChat = true
                                    } label: {
                                        UserSearchRow(user: user)
                                    }
                                    .buttonStyle(.plain)
                                }
                            }
                            .padding(.horizontal)
                            .padding(.top, 16)
                        }
                    } else if !searchText.isEmpty && !isSearching {
                        // No results
                        VStack(spacing: 12) {
                            Image(systemName: "person.slash")
                                .font(.system(size: 50))
                                .foregroundStyle(.secondary)
                            Text("No users found")
                                .font(.headline)
                                .foregroundStyle(.secondary)
                            Text("Try a different name or username")
                                .font(.subheadline)
                                .foregroundStyle(.tertiary)
                        }
                        .frame(maxHeight: .infinity)
                    } else {
                        // Empty state
                        VStack(spacing: 12) {
                            Image(systemName: "person.crop.circle.badge.plus")
                                .font(.system(size: 50))
                                .foregroundStyle(.secondary)
                            Text("Search for a user")
                                .font(.headline)
                                .foregroundStyle(.secondary)
                            Text("Start typing to find people")
                                .font(.subheadline)
                                .foregroundStyle(.tertiary)
                        }
                        .frame(maxHeight: .infinity)
                    }
                }
            }
            .navigationTitle("New Message")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Cancel") { dismiss() }
                        .foregroundStyle(Color.collegioOrange)
                }
            }
            .onChange(of: searchText) { _, newValue in
                performDebouncedSearch(query: newValue)
            }
            .navigationDestination(isPresented: $navigateToChat) {
                if let user = selectedUser {
                    // Create a temporary conversation object for the chat
                    ChatView(conversation: Conversation(
                        id: "new-\(user.id)",
                        participants: [user],
                        lastMessage: nil,
                        lastMessageAt: nil,
                        unreadCount: 0,
                        type: "direct"
                    ))
                    .onAppear { dismiss() }
                }
            }
        }
        .presentationDetents([.large])
    }
    
    private func performDebouncedSearch(query: String) {
        // Cancel previous search
        searchTask?.cancel()
        
        guard query.count >= 2 else {
            searchResults = []
            return
        }
        
        searchTask = Task {
            // Debounce 500ms
            try? await Task.sleep(nanoseconds: 500_000_000)
            
            guard !Task.isCancelled else { return }
            
            await MainActor.run { isSearching = true }
            
            do {
                let results = try await APIService.shared.searchUsers(query: query)
                await MainActor.run {
                    if !Task.isCancelled {
                        searchResults = results
                    }
                }
            } catch {
                print("❌ Search error: \(error)")
            }
            
            await MainActor.run { isSearching = false }
        }
    }
}

// MARK: - User Search Row
struct UserSearchRow: View {
    let user: User
    
    var body: some View {
        HStack(spacing: 14) {
            // Avatar
            Circle()
                .fill(Color.collegioOrange.opacity(0.2))
                .frame(width: 50, height: 50)
                .overlay {
                    Text(user.initials)
                        .font(.headline.bold())
                        .foregroundStyle(Color.collegioOrange)
                }
            
            VStack(alignment: .leading, spacing: 4) {
                Text(user.fullName)
                    .font(.headline)
                
                if let username = user.username {
                    Text("@\(username)")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
            }
            
            Spacer()
            
            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundStyle(.tertiary)
        }
        .padding(16)
        .glassCard()
    }
}

#Preview {
    MessagesView()
}

#Preview("Dark Mode") {
    MessagesView()
        .preferredColorScheme(.dark)
}
