import SwiftUI

// MARK: - Favorites Manager (App-wide Observable)
@MainActor
class FavoritesManager: ObservableObject {
    static let shared = FavoritesManager()
    
    @Published private(set) var favoriteListingIds: Set<String> = []
    @Published private(set) var favoriteListings: [Listing] = []
    @Published private(set) var isLoading = false
    @Published var lastError: String? = nil
    
    private init() {}
    
    // Load all favorites from backend
    func loadFavorites() async {
        isLoading = true
        lastError = nil
        do {
            let favorites = try await APIService.shared.getFavorites()
            favoriteListings = favorites
            favoriteListingIds = Set(favorites.map { $0.id })
            print("✅ Loaded \(favorites.count) favorites")
        } catch {
            lastError = error.localizedDescription
            print("❌ Failed to load favorites: \(error)")
        }
        isLoading = false
    }
    
    // Check if a listing is favorited
    func isFavorite(_ listingId: String) -> Bool {
        favoriteListingIds.contains(listingId)
    }
    
    // Toggle favorite status
    func toggleFavorite(for listingId: String) async {
        lastError = nil
        
        // Optimistic update first
        let wasAlreadyFavorite = favoriteListingIds.contains(listingId)
        
        if wasAlreadyFavorite {
            favoriteListingIds.remove(listingId)
            favoriteListings.removeAll { $0.id == listingId }
        } else {
            favoriteListingIds.insert(listingId)
        }
        
        // Now call API
        do {
            let serverSaysIsFavorite = try await APIService.shared.toggleFavorite(listingId: listingId)
            print("✅ Server response - isFavorited: \(serverSaysIsFavorite)")
            
            // Trust the server response - update to match
            if serverSaysIsFavorite {
                favoriteListingIds.insert(listingId)
                // Reload favorites to get the full Listing object
                await loadFavorites()
            } else {
                favoriteListingIds.remove(listingId)
                favoriteListings.removeAll { $0.id == listingId }
            }
        } catch {
            // On error, revert to previous state
            lastError = error.localizedDescription
            print("❌ Toggle failed: \(error)")
            
            // Revert the optimistic update
            if wasAlreadyFavorite {
                favoriteListingIds.insert(listingId)
                // Reload to restore the listing
                await loadFavorites()
            } else {
                favoriteListingIds.remove(listingId)
            }
        }
    }
}
