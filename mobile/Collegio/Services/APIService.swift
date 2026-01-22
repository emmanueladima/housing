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
        struct VibesResponse: Decodable {
            let success: Bool
            let vibes: [String]
        }
        let response: VibesResponse = try await request("/resources/vibes")
        return response.vibes
    }
    
    // MARK: - Community API
    func getCommunityPosts(channel: String? = nil) async throws -> [CommunityPost] {
        let endpoint = channel != nil ? "/community/posts?channel=\(channel!)" : "/community/posts"
        return try await request(endpoint)
    }
    
    // MARK: - Messages API
    func getConversations() async throws -> [Conversation] {
        try await request("/messages/conversations")
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
}
