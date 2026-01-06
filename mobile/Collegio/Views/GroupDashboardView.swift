import SwiftUI

struct GroupDashboardView: View {
    @StateObject private var viewModel = GroupDashboardViewModel()
    @State private var selectedTab: DashboardTab = .requests
    @State private var showEditSheet = false
    
    enum DashboardTab: String, CaseIterable {
        case requests = "Requests"
        case members = "Members"
    }
    
    var body: some View {
        NavigationStack {
            ZStack {
                GradientBackground()
                
                VStack(spacing: 0) {
                    // Stats Header - Always show for testing
                    statsHeader
                    
                    // Tab Selector
                    tabSelector
                    
                    // Content
                    tabContent
                }
            }
            .navigationTitle(viewModel.group?.name ?? "My Group")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                if viewModel.isAdmin {
                    ToolbarItem(placement: .primaryAction) {
                        Button {
                            showEditSheet = true
                        } label: {
                            Image(systemName: "gear")
                        }
                    }
                }
            }
            .task {
                await viewModel.loadGroup()
            }
            .sheet(isPresented: $showEditSheet) {
                EditGroupSheet(
                    group: viewModel.group,
                    onSave: { name, description, budget in
                        Task {
                            await viewModel.updateGroup(name: name, description: description, budget: budget)
                        }
                        showEditSheet = false
                    }
                )
            }
        }
    }
    
    // MARK: - Stats Header
    private var statsHeader: some View {
        HStack(spacing: 16) {
            StatCard(
                title: "Members",
                value: "\(viewModel.group?.members?.count ?? 0)",
                icon: "person.2.fill"
            )
            
            StatCard(
                title: "Requests",
                value: "\(viewModel.pendingRequests.count)",
                icon: "person.badge.plus"
            )
        }
        .padding()
    }
    
    // MARK: - Tab Selector
    private var tabSelector: some View {
        HStack(spacing: 0) {
            ForEach(DashboardTab.allCases, id: \.self) { tab in
                Button {
                    withAnimation(.spring(response: 0.3)) {
                        selectedTab = tab
                    }
                } label: {
                    Text(tab.rawValue)
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(
                            selectedTab == tab
                                ? Color.collegioOrange
                                : Color.clear
                        )
                        .foregroundStyle(selectedTab == tab ? .white : .secondary)
                }
                .buttonStyle(.plain)
            }
        }
        .background(Color.white.opacity(0.1))
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .padding(.horizontal)
    }
    
    // MARK: - Tab Content
    @ViewBuilder
    private var tabContent: some View {
        ScrollView {
            VStack(spacing: 12) {
                switch selectedTab {
                case .requests:
                    requestsContent
                case .members:
                    membersContent
                }
            }
            .padding()
            .padding(.bottom, 100)
        }
    }
    
    // MARK: - Requests Content
    private var requestsContent: some View {
        Group {
            if !viewModel.isAdmin {
                infoCard(
                    icon: "lock.fill",
                    title: "Admin Only",
                    subtitle: "Only the group admin can manage join requests."
                )
            } else if viewModel.pendingRequests.isEmpty {
                infoCard(
                    icon: "bell.fill",
                    title: "No Pending Requests",
                    subtitle: "When someone wants to join, they'll appear here."
                )
            } else {
                ForEach(viewModel.pendingRequests) { request in
                    JoinRequestRow(
                        request: request,
                        onAccept: {
                            Task {
                                await viewModel.handleRequest(requestId: request.id, action: "accept")
                            }
                        },
                        onReject: {
                            Task {
                                await viewModel.handleRequest(requestId: request.id, action: "reject")
                            }
                        }
                    )
                }
            }
        }
    }
    
    // MARK: - Members Content
    private var membersContent: some View {
        Group {
            if let members = viewModel.group?.members, !members.isEmpty {
                ForEach(members) { member in
                    MemberRow(
                        member: member,
                        isAdmin: member.id == viewModel.group?.admin
                    )
                }
            } else {
                infoCard(
                    icon: "person.3.fill",
                    title: "No Members",
                    subtitle: "Invite roommates to join your group."
                )
            }
        }
    }
    
    // MARK: - No Group View
    private var noGroupView: some View {
        VStack(spacing: 20) {
            Image(systemName: "person.3.fill")
                .font(.system(size: 60))
                .foregroundStyle(Color.collegioOrange.opacity(0.5))
            
            Text("No Group Yet")
                .font(.title2.bold())
            
            Text("Create or join a roommate group to access the dashboard.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)
            
            NavigationLink(destination: GroupCreationView()) {
                Text("Create Group")
                    .font(.headline)
                    .foregroundStyle(.white)
                    .padding(.horizontal, 24)
                    .padding(.vertical, 12)
                    .background(Color.collegioOrange)
                    .clipShape(Capsule())
            }
        }
        .frame(maxHeight: .infinity)
    }
    
    // MARK: - Info Card
    private func infoCard(icon: String, title: String, subtitle: String) -> some View {
        VStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 40))
                .foregroundStyle(.secondary)
            Text(title)
                .font(.headline)
            Text(subtitle)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 40)
        .glassCard()
    }
}

// MARK: - Stat Card
struct StatCard: View {
    let title: String
    let value: String
    let icon: String
    
    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundStyle(Color.collegioOrange)
            Text(value)
                .font(.title.bold())
            Text(title)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .glassCard()
    }
}

// MARK: - Join Request Row
struct JoinRequestRow: View {
    let request: JoinRequest
    let onAccept: () -> Void
    let onReject: () -> Void
    
    var body: some View {
        HStack(spacing: 12) {
            // Avatar
            Circle()
                .fill(Color.collegioOrange.opacity(0.2))
                .frame(width: 50, height: 50)
                .overlay {
                    Text(request.user?.firstName?.prefix(1) ?? "?")
                        .font(.title2.bold())
                        .foregroundStyle(Color.collegioOrange)
                }
            
            // Info
            VStack(alignment: .leading, spacing: 4) {
                Text("\(request.user?.firstName ?? "Unknown") \(request.user?.lastName ?? "")")
                    .font(.headline)
                if let message = request.message, !message.isEmpty {
                    Text("\"\(message)\"")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .lineLimit(2)
                }
            }
            
            Spacer()
            
            // Actions
            HStack(spacing: 8) {
                Button {
                    onReject()
                } label: {
                    Image(systemName: "xmark")
                        .font(.headline)
                        .foregroundStyle(.red)
                        .padding(10)
                        .background(Color.red.opacity(0.1))
                        .clipShape(Circle())
                }
                
                Button {
                    onAccept()
                } label: {
                    Image(systemName: "checkmark")
                        .font(.headline)
                        .foregroundStyle(.green)
                        .padding(10)
                        .background(Color.green.opacity(0.1))
                        .clipShape(Circle())
                }
            }
        }
        .padding()
        .glassCard()
    }
}

// MARK: - Member Row
struct MemberRow: View {
    let member: GroupMember
    let isAdmin: Bool
    
    var body: some View {
        HStack(spacing: 12) {
            // Avatar
            if let imageUrl = member.profileImage, let url = URL(string: imageUrl) {
                AsyncImage(url: url) { image in
                    image.resizable().aspectRatio(contentMode: .fill)
                } placeholder: {
                    Circle().fill(Color.gray.opacity(0.3))
                }
                .frame(width: 50, height: 50)
                .clipShape(Circle())
            } else {
                Circle()
                    .fill(Color.collegioOrange.opacity(0.2))
                    .frame(width: 50, height: 50)
                    .overlay {
                        Text(member.firstName?.prefix(1) ?? "?")
                            .font(.title2.bold())
                            .foregroundStyle(Color.collegioOrange)
                    }
            }
            
            // Info
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text("\(member.firstName ?? "Unknown") \(member.lastName ?? "")")
                        .font(.headline)
                    if isAdmin {
                        Text("Admin")
                            .font(.caption.bold())
                            .padding(.horizontal, 8)
                            .padding(.vertical, 2)
                            .background(Color.collegioOrange.opacity(0.2))
                            .foregroundStyle(Color.collegioOrange)
                            .clipShape(Capsule())
                    }
                }
                if let email = member.email {
                    Text(email)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            
            Spacer()
        }
        .padding()
        .glassCard()
    }
}

// MARK: - Edit Group Sheet
struct EditGroupSheet: View {
    @Environment(\.dismiss) private var dismiss
    let group: RoommateGroup?
    let onSave: (String, String?, Int?) -> Void
    
    @State private var name: String = ""
    @State private var description: String = ""
    @State private var budget: String = ""
    
    var body: some View {
        NavigationStack {
            Form {
                Section("Group Details") {
                    TextField("Group Name", text: $name)
                    TextField("Description", text: $description, axis: .vertical)
                        .lineLimit(3...6)
                }
                
                Section("Budget") {
                    TextField("Max Budget per Person", text: $budget)
                        .keyboardType(.numberPad)
                }
            }
            .navigationTitle("Edit Group")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        onSave(name, description.isEmpty ? nil : description, Int(budget))
                    }
                    .disabled(name.isEmpty)
                }
            }
            .onAppear {
                name = group?.name ?? ""
                description = group?.description ?? ""
                budget = group?.budget?.max != nil ? "\(group!.budget!.max!)" : ""
            }
        }
    }
}

#Preview {
    GroupDashboardView()
}
