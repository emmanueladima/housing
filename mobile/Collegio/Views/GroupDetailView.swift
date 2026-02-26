import SwiftUI

struct GroupDetailView: View {
    let group: RoommateGroup
    @StateObject private var viewModel = GroupDetailViewModel()
    @State private var showJoinSheet = false
    @State private var showEditSheet = false
    @State private var currentGroup: RoommateGroup?
    @State private var joinMessage = ""
    
    // Check if current user is the admin
    private var isAdmin: Bool {
        guard let userId = AuthManager.shared.user?.id else { return false }
        return userId == group.admin
    }
    
    private var displayGroup: RoommateGroup {
        currentGroup ?? group
    }
    
    var body: some View {
        ZStack {
            GradientBackground()
            
            ScrollView {
                VStack(spacing: 24) {
                    // Header
                    headerSection
                    
                    // Stats
                    statsSection
                    
                    // Description
                    if let description = group.description, !description.isEmpty {
                        descriptionSection(description)
                    }
                    
                    // Members
                    membersSection
                    
                    // Vibes
                    if let vibes = group.vibe, !vibes.isEmpty {
                        vibesSection(vibes)
                    }
                    
                    // Action Button
                    actionButton
                }
                .padding()
                .padding(.bottom, 100)
            }
        }
        .navigationTitle(group.name)
        .navigationBarTitleDisplayMode(.inline)
        .sheet(isPresented: $showJoinSheet) {
            joinRequestSheet
        }
        .alert("Success!", isPresented: $viewModel.showSuccess) {
            Button("OK") {}
        } message: {
            Text("Your request to join has been sent!")
        }
        .alert("Error", isPresented: $viewModel.showError) {
            Button("OK") {}
        } message: {
            Text(viewModel.error ?? "Something went wrong")
        }
        .sheet(isPresented: $showEditSheet) {
            EditGroupView(group: displayGroup) { updatedGroup in
                currentGroup = updatedGroup
            }
        }
        .toolbar {
            if isAdmin {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        showEditSheet = true
                    } label: {
                        Image(systemName: "pencil.circle")
                            .font(.title3)
                            .foregroundStyle(Color.collegioOrange)
                    }
                }
            }
        }
    }
    
    // MARK: - Header
    private var headerSection: some View {
        VStack(spacing: 12) {
            // Group Avatar
            Circle()
                .fill(Color.collegioOrange.opacity(0.2))
                .frame(width: 80, height: 80)
                .overlay {
                    Image(systemName: "person.3.fill")
                        .font(.title)
                        .foregroundStyle(Color.collegioOrange)
                }
            
            Text(group.name)
                .font(.title2.bold())
            
            if let lookingFor = group.lookingFor {
                Text("Looking for \(lookingFor)")
                    .font(.subheadline)
                    .foregroundStyle(Color.collegioOrange)
            }
        }
    }
    
    // MARK: - Stats
    private var statsSection: some View {
        HStack(spacing: 16) {
            statCard(title: "Members", value: "\(group.members?.count ?? 0)", icon: "person.2.fill")
            
            if let budget = group.budget?.max {
                statCard(title: "Budget", value: "$\(budget)", icon: "dollarsign.circle.fill")
            }
        }
    }
    
    private func statCard(title: String, value: String, icon: String) -> some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundStyle(Color.collegioOrange)
            Text(value)
                .font(.title3.bold())
            Text(title)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .glassCard()
    }
    
    // MARK: - Description
    private func descriptionSection(_ text: String) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("About")
                .font(.headline)
            Text(text)
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .glassCard()
    }
    
    // MARK: - Members
    private var membersSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Members")
                .font(.headline)
            
            if let members = group.members, !members.isEmpty {
                ForEach(members) { member in
                    HStack(spacing: 12) {
                        Circle()
                            .fill(Color.collegioOrange.opacity(0.2))
                            .frame(width: 44, height: 44)
                            .overlay {
                                Text(member.firstName?.prefix(1) ?? "?")
                                    .font(.headline)
                                    .foregroundStyle(Color.collegioOrange)
                            }
                        
                        VStack(alignment: .leading, spacing: 2) {
                            Text("\(member.firstName ?? "") \(member.lastName ?? "")")
                                .font(.subheadline.bold())
                            if member.id == group.admin {
                                Text("Admin")
                                    .font(.caption)
                                    .foregroundStyle(Color.collegioOrange)
                            }
                        }
                        
                        Spacer()
                    }
                }
            } else {
                Text("No members yet")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .glassCard()
    }
    
    // MARK: - Vibes
    private func vibesSection(_ vibes: [String]) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Vibe")
                .font(.headline)
            
            FlowLayout(spacing: 8) {
                ForEach(vibes, id: \.self) { vibe in
                    Text(vibe)
                        .font(.caption.bold())
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(Color.collegioOrange.opacity(0.2))
                        .foregroundStyle(Color.collegioOrange)
                        .clipShape(Capsule())
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .glassCard()
    }
    
    // MARK: - Action Button
    private var actionButton: some View {
        Button {
            showJoinSheet = true
        } label: {
            HStack {
                Image(systemName: "person.badge.plus")
                Text("Request to Join")
            }
            .font(.headline)
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity)
            .padding()
            .background(Color.collegioOrange)
            .clipShape(RoundedRectangle(cornerRadius: 16))
        }
    }
    
    // MARK: - Join Request Sheet
    private var joinRequestSheet: some View {
        NavigationStack {
            Form {
                Section("Message (Optional)") {
                    TextField("Introduce yourself...", text: $joinMessage, axis: .vertical)
                        .lineLimit(3...6)
                }
                
                Section {
                    Text("The group admin will review your request and decide whether to accept you.")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            .navigationTitle("Join Request")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        showJoinSheet = false
                    }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Send") {
                        Task {
                            await viewModel.requestToJoin(groupId: group.id, message: joinMessage.isEmpty ? nil : joinMessage)
                            showJoinSheet = false
                        }
                    }
                    .disabled(viewModel.isLoading)
                }
            }
        }
        .presentationDetents([.medium])
    }
}

// MARK: - ViewModel
@MainActor
class GroupDetailViewModel: ObservableObject {
    @Published var isLoading = false
    @Published var error: String?
    @Published var showError = false
    @Published var showSuccess = false
    
    private let groupService = GroupService.shared
    
    func requestToJoin(groupId: String, message: String?) async {
        isLoading = true
        error = nil
        
        do {
            try await groupService.requestToJoin(groupId: groupId, message: message)
            showSuccess = true
        } catch {
            self.error = error.localizedDescription
            showError = true
        }
        
        isLoading = false
    }
}

#Preview {
    NavigationStack {
        GroupDetailView(group: RoommateGroup(
            id: "1",
            name: "The Study Hub",
            description: "We're a group of engineering students looking for chill roommates.",
            members: nil,
            admin: "1",
            joinRequests: nil,
            chores: nil,
            expenses: nil,
            houseRules: nil,
            sharedEvents: nil,
            budget: Budget(min: 500, max: 800),
            vibe: ["Quiet", "Studious", "Clean"],
            lookingFor: "2 more",
            createdAt: nil
        ))
    }
}
