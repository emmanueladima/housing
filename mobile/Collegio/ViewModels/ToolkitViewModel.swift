import Foundation

@MainActor
class ToolkitViewModel: ObservableObject {
    @Published var group: RoommateGroup?
    @Published var isLoading = false
    @Published var error: String?
    @Published var showAddSheet = false
    @Published var addingType: AddingType = .chore
    
    enum AddingType {
        case chore, expense, rule, event
    }
    
    private let groupService = GroupService.shared
    
    func loadGroup() async {
        isLoading = true
        do {
            group = try await groupService.getMyGroup()
        } catch {
            // User might not be in a group - that's okay
            print("No group found: \(error.localizedDescription)")
            group = nil
        }
        isLoading = false
    }
    
    // MARK: - Chores
    
    func addChore(title: String, frequency: String) async {
        guard let groupId = group?.id else { return }
        do {
            let request = CreateChoreRequest(title: title, assignedTo: nil, dueDate: nil, frequency: frequency)
            group = try await groupService.addChore(groupId: groupId, request: request)
        } catch {
            self.error = error.localizedDescription
        }
    }
    
    func toggleChore(choreId: String, completed: Bool) async {
        guard let groupId = group?.id else { return }
        do {
            group = try await groupService.updateChore(groupId: groupId, choreId: choreId, completed: completed)
        } catch {
            self.error = error.localizedDescription
        }
    }
    
    func deleteChore(choreId: String) async {
        guard let groupId = group?.id else { return }
        do {
            group = try await groupService.deleteChore(groupId: groupId, choreId: choreId)
        } catch {
            self.error = error.localizedDescription
        }
    }
    
    // MARK: - Expenses
    
    func addExpense(title: String, amount: Double, category: String) async {
        guard let groupId = group?.id else { return }
        do {
            // Use current user as paidBy - this would need proper user context
            let request = CreateExpenseRequest(title: title, amount: amount, paidBy: "", splitAmong: nil, category: category)
            group = try await groupService.addExpense(groupId: groupId, request: request)
        } catch {
            self.error = error.localizedDescription
        }
    }
    
    func settleExpense(expenseId: String) async {
        guard let groupId = group?.id else { return }
        do {
            group = try await groupService.updateExpense(groupId: groupId, expenseId: expenseId, status: "settled")
        } catch {
            self.error = error.localizedDescription
        }
    }
    
    // MARK: - Rules
    
    func addRule(text: String, category: String) async {
        guard let groupId = group?.id else { return }
        do {
            let request = CreateRuleRequest(text: text, category: category)
            group = try await groupService.addRule(groupId: groupId, request: request)
        } catch {
            self.error = error.localizedDescription
        }
    }
    
    // MARK: - Events
    
    func addEvent(title: String, date: Date, type: String) async {
        guard let groupId = group?.id else { return }
        do {
            let dateFormatter = ISO8601DateFormatter()
            let request = CreateEventRequest(title: title, date: dateFormatter.string(from: date), type: type, description: nil)
            group = try await groupService.addEvent(groupId: groupId, request: request)
        } catch {
            self.error = error.localizedDescription
        }
    }
}
