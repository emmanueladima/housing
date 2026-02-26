import Foundation
import SwiftUI

// MARK: - Filter Models
struct ListingFilters {
    var minPrice: Int = 0
    var maxPrice: Int = 5000
    var bedrooms: Int = 0
    var bathrooms: Int = 0
    var placeType: PlaceType = .any
    var verifiedLandlord: Bool = false
    var utilitiesIncluded: Bool = false
    var sublease: Bool = false
    var petFriendly: Bool = false
    var hasWifi: Bool = false
    var hasLaundry: Bool = false
    var hasParking: Bool = false
    var hasDishwasher: Bool = false
    var hasAC: Bool = false
    var hasFurnished: Bool = false
}

enum PlaceType: String, CaseIterable {
    case any = "Any type"
    case room = "Room"
    case entireHome = "Entire home"
}

// MARK: - Listings ViewModel
@MainActor
class ListingsViewModel: ObservableObject {
    @Published var listings: [Listing] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    func fetchListings() async {
        isLoading = true
        errorMessage = nil
        
        do {
            listings = try await APIService.shared.getListings()
        } catch {
            errorMessage = error.localizedDescription
            listings = [] // Don't use sample data - causes invalid ID errors
        }
        
        isLoading = false
    }
}

// MARK: - Community ViewModel
@MainActor
class CommunityViewModel: ObservableObject {
    @Published var posts: [CommunityPost] = []
    @Published var selectedChannel: String = "all"
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    let channels = ["all", "housing", "roommates", "marketplace", "events", "general"]
    
    func fetchPosts() async {
        isLoading = true
        errorMessage = nil
        
        do {
            let channel = selectedChannel == "all" ? nil : selectedChannel
            posts = try await APIService.shared.getCommunityPosts(channel: channel)
        } catch {
            errorMessage = error.localizedDescription
            posts = [] // Don't use sample data
        }
        
        isLoading = false
    }
}

// MARK: - Messages ViewModel  
@MainActor
class MessagesViewModel: ObservableObject {
    @Published var conversations: [Conversation] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    func fetchConversations() async {
        isLoading = true
        errorMessage = nil
        
        do {
            conversations = try await APIService.shared.getConversations()
        } catch {
            errorMessage = error.localizedDescription
            conversations = []
        }
        
        isLoading = false
    }
}

// MARK: - Auth ViewModel
@MainActor
class AuthViewModel: ObservableObject {
    @Published var currentUser: User?
    @Published var isAuthenticated = false
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    init() {
        // Check if we have a stored token
        if UserDefaults.standard.string(forKey: "authToken") != nil {
            Task { await checkAuth() }
        }
    }
    
    func checkAuth() async {
        isLoading = true
        do {
            currentUser = try await APIService.shared.getCurrentUser()
            isAuthenticated = true
        } catch {
            isAuthenticated = false
            currentUser = nil
        }
        isLoading = false
    }
    
    func login(email: String, password: String) async {
        isLoading = true
        errorMessage = nil
        
        do {
            currentUser = try await APIService.shared.login(email: email, password: password)
            isAuthenticated = true
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    func logout() {
        APIService.shared.logout()
        currentUser = nil
        isAuthenticated = false
    }
}

// MARK: - Sample Community Posts
extension CommunityPost {
    static let samples: [CommunityPost] = [
        CommunityPost(
            id: "1",
            authorId: "user1",
            author: User.sample,
            channel: "housing",
            intent: "seeking",
            title: "Looking for Fall 2024 Housing",
            content: "Anyone know of good 2BR apartments near campus?",
            likesCount: 12,
            commentsCount: 5,
            createdAt: Date(),
            isLiked: false
        ),
        CommunityPost(
            id: "2",
            authorId: "user2",
            author: nil,
            channel: "roommates",
            intent: "offering",
            title: "Room Available in 3BR House",
            content: "Looking for a clean, quiet roommate starting January.",
            likesCount: 8,
            commentsCount: 3,
            createdAt: Date().addingTimeInterval(-3600),
            isLiked: true
        )
    ]
}
