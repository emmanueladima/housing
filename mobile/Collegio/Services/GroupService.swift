import Foundation

// MARK: - Group Models

struct RoommateGroup: Codable, Identifiable {
    let id: String
    let name: String
    let description: String?
    let members: [GroupMember]?
    let admin: String
    let joinRequests: [JoinRequest]?
    let chores: [Chore]?
    let expenses: [Expense]?
    let houseRules: [HouseRule]?
    let sharedEvents: [SharedEvent]?
    let budget: Budget?
    let vibe: [String]?
    let lookingFor: String?
    let createdAt: String?
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case name, description, members, admin, joinRequests
        case chores, expenses, houseRules, sharedEvents
        case budget, vibe, lookingFor, createdAt
    }
}

struct GroupMember: Codable, Identifiable {
    let id: String
    let firstName: String?
    let lastName: String?
    let email: String?
    let profileImage: String?
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case firstName, lastName, email, profileImage
    }
}

struct Budget: Codable {
    let min: Int?
    let max: Int?
}

struct JoinRequest: Codable, Identifiable {
    let id: String
    let user: GroupMember?
    let message: String?
    let status: String
    let createdAt: String?
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case user, message, status, createdAt
    }
}

struct Chore: Codable, Identifiable {
    let id: String
    let title: String
    let assignedTo: String?
    let dueDate: String?
    let completed: Bool
    let frequency: String?
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case title, assignedTo, dueDate, completed, frequency
    }
}

struct Expense: Codable, Identifiable {
    let id: String
    let title: String
    let amount: Double
    let paidBy: String?
    let splitAmong: [String]?
    let date: String?
    let category: String?
    let status: String
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case title, amount, paidBy, splitAmong, date, category, status
    }
}

struct HouseRule: Codable, Identifiable {
    let id: String
    let text: String
    let category: String?
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case text, category
    }
}

struct SharedEvent: Codable, Identifiable {
    let id: String
    let title: String
    let date: String
    let type: String?
    let description: String?
    let createdBy: String?
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case title, date, type, description, createdBy
    }
}

// MARK: - Request Bodies

struct CreateGroupRequest: Encodable {
    let name: String
    let description: String?
    let budget: Budget?
    let vibe: [String]?
    let lookingFor: String?
}

struct JoinRequestBody: Encodable {
    let message: String?
}

struct HandleJoinRequestBody: Encodable {
    let action: String // "accept" or "reject"
}

struct JoinByCodeResponse: Decodable {
    let success: Bool
    let message: String
    let group: RoommateGroup
}

struct CreateChoreRequest: Encodable {
    let title: String
    let assignedTo: String?
    let dueDate: String?
    let frequency: String?
}

struct UpdateChoreRequest: Encodable {
    let completed: Bool?
}

struct CreateExpenseRequest: Encodable {
    let title: String
    let amount: Double
    let paidBy: String
    let splitAmong: [String]?
    let category: String?
}

struct UpdateExpenseRequest: Encodable {
    let status: String?
}

struct CreateRuleRequest: Encodable {
    let text: String
    let category: String?
}

struct CreateEventRequest: Encodable {
    let title: String
    let date: String
    let type: String?
    let description: String?
}

// MARK: - GroupService

class GroupService {
    static let shared = GroupService()
    private let api = APIService.shared
    private let baseEndpoint = "/roommate-groups"
    
    private let encoder: JSONEncoder = {
        let encoder = JSONEncoder()
        return encoder
    }()
    
    // MARK: - Group CRUD
    
    func getMyGroup() async throws -> RoommateGroup {
        try await api.authenticatedRequest("\(baseEndpoint)/my-group")
    }
    
    func getAllGroups() async throws -> [RoommateGroup] {
        try await api.authenticatedRequest(baseEndpoint)
    }
    
    func getGroup(id: String) async throws -> RoommateGroup {
        try await api.authenticatedRequest("\(baseEndpoint)/\(id)")
    }
    
    func createGroup(_ request: CreateGroupRequest) async throws -> RoommateGroup {
        let body = try encoder.encode(request)
        return try await api.authenticatedRequest(baseEndpoint, method: "POST", body: body)
    }
    
    func updateGroup(id: String, request: CreateGroupRequest) async throws -> RoommateGroup {
        let body = try encoder.encode(request)
        return try await api.authenticatedRequest("\(baseEndpoint)/\(id)", method: "PUT", body: body)
    }
    
    func deleteMyGroup() async throws {
        let _: EmptyResponse = try await api.authenticatedRequest("\(baseEndpoint)/my-group", method: "DELETE")
    }
    
    // MARK: - Join by Invite Code
    
    func joinGroupByCode(code: String) async throws -> RoommateGroup {
        let response: JoinByCodeResponse = try await api.authenticatedRequest("\(baseEndpoint)/join/\(code.uppercased())", method: "POST")
        return response.group
    }
    
    // MARK: - Join Requests
    
    func requestToJoin(groupId: String, message: String?) async throws {
        let body = try encoder.encode(JoinRequestBody(message: message))
        let _: EmptyResponse = try await api.authenticatedRequest("\(baseEndpoint)/\(groupId)/request-join", method: "POST", body: body)
    }
    
    func getJoinRequests(groupId: String) async throws -> [JoinRequest] {
        try await api.authenticatedRequest("\(baseEndpoint)/\(groupId)/requests")
    }
    
    func handleJoinRequest(groupId: String, requestId: String, action: String) async throws {
        let body = try encoder.encode(HandleJoinRequestBody(action: action))
        let _: EmptyResponse = try await api.authenticatedRequest("\(baseEndpoint)/\(groupId)/requests/\(requestId)", method: "PUT", body: body)
    }
    
    // MARK: - Chores
    
    func addChore(groupId: String, request: CreateChoreRequest) async throws -> RoommateGroup {
        let body = try encoder.encode(request)
        return try await api.authenticatedRequest("\(baseEndpoint)/\(groupId)/chores", method: "POST", body: body)
    }
    
    func updateChore(groupId: String, choreId: String, completed: Bool) async throws -> RoommateGroup {
        let body = try encoder.encode(UpdateChoreRequest(completed: completed))
        return try await api.authenticatedRequest("\(baseEndpoint)/\(groupId)/chores/\(choreId)", method: "PUT", body: body)
    }
    
    func deleteChore(groupId: String, choreId: String) async throws -> RoommateGroup {
        try await api.authenticatedRequest("\(baseEndpoint)/\(groupId)/chores/\(choreId)", method: "DELETE")
    }
    
    // MARK: - Expenses
    
    func addExpense(groupId: String, request: CreateExpenseRequest) async throws -> RoommateGroup {
        let body = try encoder.encode(request)
        return try await api.authenticatedRequest("\(baseEndpoint)/\(groupId)/expenses", method: "POST", body: body)
    }
    
    func updateExpense(groupId: String, expenseId: String, status: String) async throws -> RoommateGroup {
        let body = try encoder.encode(UpdateExpenseRequest(status: status))
        return try await api.authenticatedRequest("\(baseEndpoint)/\(groupId)/expenses/\(expenseId)", method: "PUT", body: body)
    }
    
    func deleteExpense(groupId: String, expenseId: String) async throws -> RoommateGroup {
        try await api.authenticatedRequest("\(baseEndpoint)/\(groupId)/expenses/\(expenseId)", method: "DELETE")
    }
    
    // MARK: - Rules
    
    func addRule(groupId: String, request: CreateRuleRequest) async throws -> RoommateGroup {
        let body = try encoder.encode(request)
        return try await api.authenticatedRequest("\(baseEndpoint)/\(groupId)/rules", method: "POST", body: body)
    }
    
    // MARK: - Timeline Events
    
    func addEvent(groupId: String, request: CreateEventRequest) async throws -> RoommateGroup {
        let body = try encoder.encode(request)
        return try await api.authenticatedRequest("\(baseEndpoint)/\(groupId)/events", method: "POST", body: body)
    }
    
    func deleteEvent(groupId: String, eventId: String) async throws -> RoommateGroup {
        try await api.authenticatedRequest("\(baseEndpoint)/\(groupId)/events/\(eventId)", method: "DELETE")
    }
}

// Helper for endpoints that return empty or success-only responses
struct EmptyResponse: Decodable {}

// MARK: - Checklist Models

struct ChecklistItem: Codable, Identifiable {
    let id: String
    let text: String
    let completed: Bool
    let category: String?
    let order: Int?
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case text, completed, category, order
    }
}

struct PersonalChecklist: Codable {
    let id: String?
    let items: [ChecklistItem]
    let notCreated: Bool?
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case items, notCreated
    }
}

struct InitChecklistRequest: Encodable {
    let useTemplate: Bool
}

struct UpdateChecklistRequest: Encodable {
    let items: [ChecklistItemUpdate]
}

struct ChecklistItemUpdate: Encodable {
    let _id: String
    let text: String
    let completed: Bool
    let category: String?
    let order: Int?
}

struct AddChecklistItemRequest: Encodable {
    let text: String
    let category: String
}

// MARK: - ChecklistService

class ChecklistService {
    static let shared = ChecklistService()
    private let api = APIService.shared
    private let baseEndpoint = "/checklists"
    
    private let encoder: JSONEncoder = {
        let encoder = JSONEncoder()
        return encoder
    }()
    
    // Get personal checklist
    func getPersonalChecklist() async throws -> PersonalChecklist {
        try await api.authenticatedRequest("\(baseEndpoint)/personal")
    }
    
    // Initialize checklist with template or empty
    func initPersonalChecklist(useTemplate: Bool) async throws -> PersonalChecklist {
        let body = try encoder.encode(InitChecklistRequest(useTemplate: useTemplate))
        return try await api.authenticatedRequest("\(baseEndpoint)/personal/init", method: "POST", body: body)
    }
    
    // Update entire checklist
    func updatePersonalChecklist(items: [ChecklistItem]) async throws -> PersonalChecklist {
        let updates = items.map { ChecklistItemUpdate(_id: $0.id, text: $0.text, completed: $0.completed, category: $0.category, order: $0.order) }
        let body = try encoder.encode(UpdateChecklistRequest(items: updates))
        return try await api.authenticatedRequest("\(baseEndpoint)/personal", method: "PUT", body: body)
    }
    
    // Add new item
    func addPersonalItem(text: String, category: String) async throws -> PersonalChecklist {
        let body = try encoder.encode(AddChecklistItemRequest(text: text, category: category))
        return try await api.authenticatedRequest("\(baseEndpoint)/personal/items", method: "POST", body: body)
    }
    
    // Delete item
    func deletePersonalItem(itemId: String) async throws -> PersonalChecklist {
        try await api.authenticatedRequest("\(baseEndpoint)/personal/items/\(itemId)", method: "DELETE")
    }
    
    // Reset to template
    func resetPersonalChecklist() async throws -> PersonalChecklist {
        try await api.authenticatedRequest("\(baseEndpoint)/personal/reset", method: "POST")
    }
}

