import Foundation
import SwiftUI

// MARK: - Profile ViewModel
@MainActor
class ProfileViewModel: ObservableObject {
    @Published var user: User?
    @Published var lifestyleProfile: LifestyleProfile?
    @Published var completionPercentage: Double = 0.0
    @Published var isLoading = false
    @Published var completionTasks: [String] = [] // What's missing
    @Published var savedCount: Int = 0
    @Published var applicationsCount: Int = 0
    
    func fetchProfileData() async {
        isLoading = true
        
        // 1. Fetch User (if not passed in, but safer to re-fetch)
        do {
            self.user = try await APIService.shared.getCurrentUser()
        } catch {
            print("Error fetching user: \(error)")
        }
        
        // 2. Fetch Lifestyle Profile
        do {
            self.lifestyleProfile = try await APIService.shared.getMyLifestyleProfile()
        } catch {
            print("Error fetching lifestyle profile: \(error)")
            // It's okay if it fails (user might not have created one yet)
            self.lifestyleProfile = nil
        }
        
        // 3. Get favorites count from FavoritesManager
        await FavoritesManager.shared.loadFavorites()
        savedCount = FavoritesManager.shared.favoriteListings.count
        
        // 4. Get applications count (TODO: implement when applications API is available)
        applicationsCount = 0 // Will be fetched from applications API when implemented
        
        calculateCompletion()
        isLoading = false
    }
    
    private func calculateCompletion() {
        var score = 0.0
        var tasks: [String] = []
        
        // 1. User Fields (20%)
        if let u = user {
            if u.profileImage != nil && !u.profileImage!.isEmpty {
                score += 10
            } else {
                tasks.append("Upload a profile picture")
            }
            
            if u.isVerified ?? false {
                score += 10
            } else {
                tasks.append("Verify your student email")
            }
        }
        
        // 2. Lifestyle Profile (80%)
        if let lp = lifestyleProfile {
            // Basics (20%)
            if let bio = lp.bio, !bio.isEmpty { score += 10 } else { tasks.append("Add a bio") }
            if (lp.age != nil && lp.gender != nil) { score += 10 } else { tasks.append("Set age and gender") }
            
            // Habits (40%)
            var habitsScore = 0.0
            if lp.cleanliness != nil { habitsScore += 5 }
            if lp.noiseLevel != nil { habitsScore += 5 }
            if lp.sleepTime != nil { habitsScore += 5 }
            if lp.guestsFrequency != nil { habitsScore += 5 }
            if lp.smoking != nil { habitsScore += 5 }
            if lp.drinking != nil { habitsScore += 5 }
            if lp.hasPets != nil { habitsScore += 5 }
            if lp.budgetMin != nil || lp.budgetMax != nil { habitsScore += 5 }
            score += habitsScore
            
            if habitsScore < 40 { tasks.append("Complete lifestyle habits") }
            
            // Personality (20%)
            if let vibes = lp.vibeTags, !vibes.isEmpty { score += 10 } else { tasks.append("Add vibe tags") }
            if let interests = lp.interests, !interests.isEmpty { score += 10 } else { tasks.append("Add interests") }
            
        } else {
            // No profile yet
            tasks.append(contentsOf: [
                "Create roommate profile",
                "Add a bio",
                "Set preferences"
            ])
        }
        
        self.completionPercentage = min(score, 100.0)
        self.completionTasks = tasks
    }
}
