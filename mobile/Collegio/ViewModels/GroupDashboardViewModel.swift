import Foundation

@MainActor
class GroupDashboardViewModel: ObservableObject {
    @Published var group: RoommateGroup?
    @Published var isLoading = false
    @Published var error: String?
    
    private let groupService = GroupService.shared
    
    var isAdmin: Bool {
        guard let group = group else { return false }
        // Compare admin ID with current user
        // For now, assume we need to check this from AuthManager
        return true // Simplified - should check against current user ID
    }
    
    var pendingRequests: [JoinRequest] {
        group?.joinRequests?.filter { $0.status == "pending" } ?? []
    }
    
    func loadGroup() async {
        isLoading = true
        do {
            group = try await groupService.getMyGroup()
        } catch {
            print("No group found: \(error.localizedDescription)")
            group = nil
        }
        isLoading = false
    }
    
    func handleRequest(requestId: String, action: String) async {
        guard let groupId = group?.id else { return }
        do {
            try await groupService.handleJoinRequest(groupId: groupId, requestId: requestId, action: action)
            await loadGroup() // Refresh
        } catch {
            self.error = error.localizedDescription
        }
    }
    
    func updateGroup(name: String, description: String?, budget: Int?) async {
        guard let groupId = group?.id else { return }
        do {
            let budgetObj = budget != nil ? Budget(min: 0, max: budget) : nil
            let request = CreateGroupRequest(
                name: name,
                description: description,
                budget: budgetObj,
                vibe: group?.vibe,
                lookingFor: group?.lookingFor
            )
            group = try await groupService.updateGroup(id: groupId, request: request)
        } catch {
            self.error = error.localizedDescription
        }
    }
}
