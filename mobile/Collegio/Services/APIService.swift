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
            throw APIError.serverError("Server error: \(httpResponse.statusCode)")
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
    
    func getCurrentUser() async throws -> User {
        try await request("/auth/me")
    }
    
    func logout() {
        authToken = nil
    }
    
    // MARK: - Lifestyle Profiles API
    func getLifestyleProfiles() async throws -> [LifestyleProfile] {
        try await request("/lifestyle-profiles/all")
    }
    
    func getMyLifestyleProfile() async throws -> LifestyleProfile {
        try await request("/lifestyle-profiles/me")
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
}
