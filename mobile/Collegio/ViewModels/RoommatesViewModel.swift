import Foundation

@MainActor
class RoommatesViewModel: ObservableObject {
    @Published var groups: [RoommateGroup] = []
    @Published var profiles: [LifestyleProfile] = []
    @Published var isLoadingGroups = false
    @Published var isLoadingProfiles = false
    @Published var error: String?
    
    private let groupService = GroupService.shared
    private let apiService = APIService.shared
    
    func loadGroups() async {
        isLoadingGroups = true
        do {
            groups = try await groupService.getAllGroups()
        } catch {
            print("Error loading groups: \(error.localizedDescription)")
            // Keep empty array on error
        }
        isLoadingGroups = false
    }
    
    func loadProfiles() async {
        isLoadingProfiles = true
        do {
            profiles = try await apiService.getLifestyleProfiles()
        } catch {
            print("Error loading profiles: \(error.localizedDescription)")
            // Keep empty array on error
        }
        isLoadingProfiles = false
    }
}
