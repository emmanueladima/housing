import Foundation

// MARK: - API Configuration
enum APIConfig {
    // Production backend URL
    static let baseURL = "https://collegio-backend-j053.onrender.com/api"
}

// MARK: - API Error
enum APIError: Error, LocalizedError {
    case invalidURL
    case noData
    case decodingError
    case serverError(String)
    case unauthorized
    
    var errorDescription: String? {
        switch self {
        case .invalidURL: return "Invalid URL"
        case .noData: return "No data received"
        case .decodingError: return "Failed to decode response"
        case .serverError(let message): return message
        case .unauthorized: return "Please log in again"
        }
    }
}

// MARK: - API Service
class APIService {
    static let shared = APIService()
    
    private let decoder: JSONDecoder = {
        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        decoder.dateDecodingStrategy = .iso8601
        return decoder
    }()
    
    private var authToken: String? {
        get { UserDefaults.standard.string(forKey: "authToken") }
        set { UserDefaults.standard.set(newValue, forKey: "authToken") }
    }
    
    // MARK: - Generic Request
    private func request<T: Decodable>(_ endpoint: String, method: String = "GET", body: Data? = nil) async throws -> T {
        guard let url = URL(string: "\(APIConfig.baseURL)\(endpoint)") else {
            throw APIError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        if let token = authToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        if let body = body {
            request.httpBody = body
        }
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.serverError("Invalid response")
        }
        
        if httpResponse.statusCode == 401 {
            throw APIError.unauthorized
        }
        
        guard (200...299).contains(httpResponse.statusCode) else {
            // Try to parse error message from backend
            var errorMessage = "Server error: \(httpResponse.statusCode)"
            if let errorJson = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
               let backendError = errorJson["error"] as? String {
                errorMessage = backendError
                print("❌ Backend error: \(backendError)")
            } else if let rawString = String(data: data, encoding: .utf8) {
                print("❌ Raw error response: \(rawString)")
            }
            throw APIError.serverError(errorMessage)
        }
        
        do {
            return try decoder.decode(T.self, from: data)
        } catch {
            print("Decoding error: \(error)")
            throw APIError.decodingError
        }
    }
    
    // MARK: - Public Authenticated Request (for use by other services)
    func authenticatedRequest<T: Decodable>(_ endpoint: String, method: String = "GET", body: Data? = nil) async throws -> T {
        try await request(endpoint, method: method, body: body)
    }
    
    // MARK: - Listings API
    func getListings() async throws -> [Listing] {
        struct ListingsResponse: Decodable {
            let success: Bool
            let listings: [Listing]
        }
        let response: ListingsResponse = try await request("/listings")
        return response.listings
    }
    
    func getListing(id: String) async throws -> Listing {
        struct ListingResponse: Decodable {
            let success: Bool
            let listing: Listing
        }
        let response: ListingResponse = try await request("/listings/\(id)")
        return response.listing
    }
    
    // MARK: - Auth API
    func login(email: String, password: String) async throws -> User {
        struct LoginRequest: Encodable {
            let email: String
            let password: String
        }
        
        struct LoginResponse: Decodable {
            let token: String
            let user: User
        }
        
        let body = try JSONEncoder().encode(LoginRequest(email: email, password: password))
        let response: LoginResponse = try await request("/auth/login", method: "POST", body: body)
        
        self.authToken = response.token
        return response.user
    }
    
    func signup(
        firstName: String,
        lastName: String,
        email: String,
        password: String,
        phone: String,
        school: String,
        graduationYear: Int
    ) async throws {
        struct SignupRequest: Encodable {
            let firstName: String
            let lastName: String
            let email: String
            let password: String
            let phone: String
            let school: String
            let graduationYear: Int
        }
        
        struct SignupResponse: Decodable {
            let success: Bool
            let message: String?
        }
        
        let body = try JSONEncoder().encode(SignupRequest(
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password,
            phone: phone,
            school: school,
            graduationYear: graduationYear
        ))
        let _: SignupResponse = try await request("/auth/signup", method: "POST", body: body)
    }
    
    func getCurrentUser() async throws -> User {
        try await request("/auth/me")
    }
    
    func resendVerification() async throws {
        struct EmptyResponse: Decodable {
            let success: Bool?
        }
        let _: EmptyResponse = try await request("/auth/resend-verification", method: "POST")
    }
    
    func logout() {
        authToken = nil
    }
    
    func forgotPassword(email: String) async throws {
        struct ForgotPasswordRequest: Encodable {
            let email: String
        }
        
        struct ForgotPasswordResponse: Decodable {
            let success: Bool
            let message: String?
        }
        
        let body = try JSONEncoder().encode(ForgotPasswordRequest(email: email))
        let _: ForgotPasswordResponse = try await request("/auth/forgot-password", method: "POST", body: body)
    }
    
    // MARK: - Lifestyle Profiles API
    func getLifestyleProfiles() async throws -> [LifestyleProfile] {
        struct ProfilesResponse: Decodable {
            let success: Bool
            let profiles: [LifestyleProfile]
        }
        let response: ProfilesResponse = try await request("/lifestyle-profiles/all")
        return response.profiles
    }
    
    func getMyLifestyleProfile() async throws -> LifestyleProfile {
        struct ProfileResponse: Decodable {
            let success: Bool
            let profile: LifestyleProfile
        }
        let response: ProfileResponse = try await request("/lifestyle-profiles/me")
        return response.profile
    }
    
    func createLifestyleProfile(
        age: Int,
        gender: String,
        major: String,
        bio: String,
        cleanliness: Int,
        noiseLevel: Int,
        sleepTime: String,
        wakeTime: String,
        budgetMin: Int,
        budgetMax: Int,
        vibeTags: [String],
        hasPets: Bool,
        petAllergies: Bool,
        smoking: Bool,
        drinking: Bool,
        lookingForRoommate: Bool
    ) async throws {
        struct ProfileRequest: Encodable {
            let age: Int
            let gender: String
            let bio: String
            let cleanliness: Int
            let noiseLevel: Int
            let sleepTime: String
            let wakeTime: String
            let budgetMin: Int
            let budgetMax: Int
            let vibeTags: [String]
            let hasPets: Bool
            let petAllergies: Bool
            let smoking: String
            let drinking: Bool  // Backend expects Bool, not String
            let lookingForRoommate: Bool
        }
        
        struct ProfileResponse: Decodable {
            let success: Bool?
        }
        
        // Map gender to backend enum format
        let genderValue: String
        switch gender.lowercased() {
        case "male": genderValue = "male"
        case "female": genderValue = "female"
        case "non-binary": genderValue = "non-binary"
        default: genderValue = "prefer-not-to-say"
        }
        
        let body = try JSONEncoder().encode(ProfileRequest(
            age: age,
            gender: genderValue,
            bio: bio,
            cleanliness: cleanliness,
            noiseLevel: noiseLevel,
            sleepTime: sleepTime,
            wakeTime: wakeTime,
            budgetMin: budgetMin,
            budgetMax: budgetMax,
            vibeTags: vibeTags,
            hasPets: hasPets,
            petAllergies: petAllergies,
            smoking: smoking ? "regular" : "non-smoker",
            drinking: drinking,  // Send as Bool
            lookingForRoommate: lookingForRoommate
        ))
        
        let _: ProfileResponse = try await request("/lifestyle-profiles/me", method: "PUT", body: body)
    }

    // MARK: - Resources API
    func getVibeTags() async throws -> [String] {
        struct ConstantsResponse: Decodable {
            let success: Bool
            let vibeTags: [String]
        }
        let response: ConstantsResponse = try await request("/lifestyle-profiles/constants")
        return response.vibeTags
    }
    
    // MARK: - Community API
    func getCommunityPosts(channel: String? = nil) async throws -> [CommunityPost] {
        struct PostsResponse: Decodable {
            let success: Bool
            let posts: [CommunityPost]
        }
        let endpoint = channel != nil ? "/community/posts?channel=\(channel!)" : "/community/posts"
        let response: PostsResponse = try await request(endpoint)
        return response.posts
    }
    
    // MARK: - Messages API
    func getConversations() async throws -> [Conversation] {
        // Backend returns array directly
        try await request("/messages/conversations")
    }
    
    func getMessages(threadId: String) async throws -> [Message] {
        struct MessagesResponse: Decodable {
            let success: Bool
            let messages: [Message]
        }
        let response: MessagesResponse = try await request("/messages/\(threadId)")
        return response.messages
    }
    
    // MARK: - Favorites API
    func getFavorites() async throws -> [Listing] {
        struct FavoritesResponse: Decodable {
            let success: Bool
            let listings: [Listing]  // Backend returns "listings" not "favorites"
        }
        let response: FavoritesResponse = try await request("/listings/favorites")
        return response.listings
    }
    
    func toggleFavorite(listingId: String) async throws -> Bool {
        struct ToggleResponse: Decodable {
            let success: Bool
            let isFavorited: Bool  // Backend returns "isFavorited" not "isFavorite"
        }
        let response: ToggleResponse = try await request("/listings/\(listingId)/favorite", method: "POST")
        return response.isFavorited
    }
    
    // MARK: - Community Posts API
    func likePost(postId: String) async throws -> (isLiked: Bool, likesCount: Int) {
        struct LikeResponse: Decodable {
            let success: Bool
            let isLiked: Bool
            let likesCount: Int
        }
        let response: LikeResponse = try await request("/community/posts/\(postId)/like", method: "POST")
        return (response.isLiked, response.likesCount)
    }
    
    // MARK: - User Search API
    func searchUsers(query: String) async throws -> [User] {
        struct SearchResponse: Decodable {
            let success: Bool
            let users: [User]
        }
        let encodedQuery = query.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? query
        let response: SearchResponse = try await request("/users/search?q=\(encodedQuery)")
        return response.users
    }
    
    // MARK: - Compatibility Test API
    func updateCompatibilityAnswers(_ answers: [String: Any]) async throws {
        // Convert [String: Any] to JSON Data manually since Encodable can't handle Any
        let jsonData = try JSONSerialization.data(withJSONObject: ["compatibilityAnswers": answers])
        
        struct ProfileResponse: Decodable {
            let success: Bool?
        }
        let _: ProfileResponse = try await request("/lifestyle-profiles/me", method: "PUT", body: jsonData)
    }
    
    // MARK: - Feedback API
    func getFeedback(page: Int = 1) async throws -> FeedbackListResponse {
        try await request("/feedback?page=\(page)")
    }
    
    func submitFeedback(text: String, category: String) async throws -> FeedbackAPIItem {
        let body = try JSONEncoder().encode(["text": text, "category": category])
        return try await request("/feedback", method: "POST", body: body)
    }
    
    func toggleFeedbackLike(feedbackId: String) async throws -> FeedbackAPIItem {
        try await request("/feedback/\(feedbackId)/like", method: "POST")
    }
    
    // MARK: - Account Management API
    
    func changePassword(currentPassword: String, newPassword: String) async throws {
        struct ChangePasswordRequest: Encodable {
            let currentPassword: String
            let newPassword: String
        }
        struct ChangePasswordResponse: Decodable {
            let success: Bool
            let message: String?
        }
        let body = try JSONEncoder().encode(ChangePasswordRequest(currentPassword: currentPassword, newPassword: newPassword))
        let _: ChangePasswordResponse = try await request("/auth/change-password", method: "POST", body: body)
    }
    
    func deleteAccount(password: String) async throws {
        struct DeleteAccountRequest: Encodable {
            let password: String
        }
        struct DeleteAccountResponse: Decodable {
            let success: Bool
            let message: String?
        }
        let body = try JSONEncoder().encode(DeleteAccountRequest(password: password))
        let _: DeleteAccountResponse = try await request("/auth/account", method: "DELETE", body: body)
    }
    
    // MARK: - Applications API
    
    func submitApplication(listingId: String, moveInDate: Date, leaseTerm: String, coverLetter: String?) async throws -> ApplicationSubmitResponse {
        struct SubmitRequest: Encodable {
            let listingId: String
            let moveInDate: String
            let leaseTerm: String
            let coverLetter: String?
        }
        let formatter = ISO8601DateFormatter()
        let body = try JSONEncoder().encode(SubmitRequest(
            listingId: listingId,
            moveInDate: formatter.string(from: moveInDate),
            leaseTerm: leaseTerm,
            coverLetter: coverLetter
        ))
        return try await request("/applications", method: "POST", body: body)
    }
    
    func getMyApplications() async throws -> [ApplicationData] {
        let response: ApplicationResponse = try await request("/applications")
        return response.applications
    }
    
    func withdrawApplication(id: String) async throws {
        struct WithdrawResponse: Decodable {
            let success: Bool
            let message: String?
        }
        let _: WithdrawResponse = try await request("/applications/\(id)/withdraw", method: "PATCH")
    }
}

// MARK: - Feedback API Models
struct FeedbackListResponse: Decodable {
    let feedback: [FeedbackAPIItem]
    let pagination: FeedbackPagination?
}

struct FeedbackPagination: Decodable {
    let page: Int
    let limit: Int
    let total: Int
    let pages: Int
}

struct FeedbackAPIItem: Decodable, Identifiable {
    let id: String
    let user: FeedbackUser?
    let text: String
    let category: String
    let likes: [String]?
    let status: String
    let createdAt: String?
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case user, text, category, likes, status, createdAt
    }
    
    var likeCount: Int { likes?.count ?? 0 }
}

struct FeedbackUser: Decodable {
    let id: String?
    let firstName: String?
    let lastName: String?
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case firstName, lastName
    }
    
    var displayName: String {
        [firstName, lastName].compactMap { $0 }.joined(separator: " ")
    }
}
