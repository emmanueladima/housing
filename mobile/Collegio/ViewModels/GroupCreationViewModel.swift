import Foundation

@MainActor
class GroupCreationViewModel: ObservableObject {
    @Published var currentStep = 1
    @Published var isLoading = false
    @Published var error: String?
    @Published var showError = false
    
    // Step 1: Basics
    @Published var name = ""
    @Published var description = ""
    
    // Step 2: Logistics
    @Published var budget = ""
    @Published var lookingFor = 1
    
    // Step 3: Vibes
    @Published var selectedVibes: Set<String> = []
    
    static let vibeOptions = [
        "Quiet", "Social", "Studious", "Night Owl",
        "Early Bird", "Clean Freak", "Chill", "Active",
        "Homebody", "Adventurous", "Pet-Friendly", "420-Friendly"
    ]
    
    private let groupService = GroupService.shared
    
    var canProceed: Bool {
        switch currentStep {
        case 1:
            return !name.isEmpty
        case 2:
            return true // Budget is optional
        case 3:
            return true // Vibes are optional
        case 4:
            return !name.isEmpty
        default:
            return false
        }
    }
    
    func toggleVibe(_ vibe: String) {
        if selectedVibes.contains(vibe) {
            selectedVibes.remove(vibe)
        } else {
            selectedVibes.insert(vibe)
        }
    }
    
    func createGroup() async {
        isLoading = true
        error = nil
        
        do {
            let budgetValue = Int(budget)
            let budgetObj = budgetValue != nil ? Budget(min: 0, max: budgetValue) : nil
            
            let request = CreateGroupRequest(
                name: name,
                description: description.isEmpty ? nil : description,
                budget: budgetObj,
                vibe: selectedVibes.isEmpty ? nil : Array(selectedVibes),
                lookingFor: "\(lookingFor) more"
            )
            
            _ = try await groupService.createGroup(request)
        } catch {
            self.error = error.localizedDescription
            self.showError = true
        }
        
        isLoading = false
    }
}
