import SwiftUI

// MARK: - Auth Manager (App-wide Observable)
@MainActor
class AuthManager: ObservableObject {
    static let shared = AuthManager()
    
    @Published private(set) var isAuthenticated = false
    @Published private(set) var user: User?
    @Published private(set) var isLoading = true
    @Published private(set) var needsEmailVerification = false
    @Published private(set) var needsProfileSetup = false
    @Published var error: String?
    
    private init() {
        // Check auth on init
        Task { await checkAuth() }
    }
    
    // MARK: - Check Stored Auth
    func checkAuth() async {
        isLoading = true
        
        // Check if we have a stored token
        guard UserDefaults.standard.string(forKey: "authToken") != nil else {
            isLoading = false
            isAuthenticated = false
            return
        }
        
        // Validate token by fetching current user
        do {
            let fetchedUser = try await APIService.shared.getCurrentUser()
            self.user = fetchedUser
            self.isAuthenticated = true
            self.needsEmailVerification = !(fetchedUser.isVerified ?? true)
            self.needsProfileSetup = !(fetchedUser.hasLifestyleProfile ?? false)
            print("✅ Auth restored - User: \(fetchedUser.fullName)")
        } catch {
            print("❌ Auth check failed: \(error)")
            // Token invalid, clear it
            logout()
        }
        
        isLoading = false
    }
    
    // MARK: - Login
    func login(email: String, password: String) async throws {
        isLoading = true
        error = nil
        
        defer { isLoading = false } // Always reset loading state
        
        do {
            let loggedInUser = try await APIService.shared.login(email: email, password: password)
            self.user = loggedInUser
            self.isAuthenticated = true
            self.needsEmailVerification = !(loggedInUser.isVerified ?? true)
            self.needsProfileSetup = !(loggedInUser.hasLifestyleProfile ?? false)
            print("✅ Login successful - User: \(loggedInUser.fullName)")
        } catch let apiError as APIError {
            self.error = apiError.localizedDescription
            throw apiError
        } catch {
            self.error = error.localizedDescription
            throw error
        }
    }
    
    // MARK: - Signup
    func signup(
        firstName: String,
        lastName: String,
        email: String,
        password: String,
        phone: String,
        school: String,
        graduationYear: Int
    ) async throws {
        isLoading = true
        error = nil
        
        do {
            try await APIService.shared.signup(
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: password,
                phone: phone,
                school: school,
                graduationYear: graduationYear
            )
            // After signup, user needs to verify email
            self.needsEmailVerification = true
            print("✅ Signup successful - verification email sent")
        } catch let apiError as APIError {
            self.error = apiError.localizedDescription
            throw apiError
        } catch {
            self.error = error.localizedDescription
            throw error
        }
        
        isLoading = false
    }
    
    // MARK: - Logout
    func logout() {
        APIService.shared.logout()
        user = nil
        isAuthenticated = false
        needsEmailVerification = false
        needsProfileSetup = false
        error = nil
        print("👋 Logged out")
    }
    
    // MARK: - Refresh User
    func refreshUser() async {
        do {
            let freshUser = try await APIService.shared.getCurrentUser()
            self.user = freshUser
            self.needsEmailVerification = !(freshUser.isVerified ?? true)
            self.needsProfileSetup = !(freshUser.hasLifestyleProfile ?? false)
        } catch {
            print("❌ Failed to refresh user: \(error)")
        }
    }
    
    // MARK: - Mark Profile Complete
    func markProfileComplete() {
        needsProfileSetup = false
        if var updatedUser = user {
            updatedUser.hasLifestyleProfile = true
            user = updatedUser
        }
    }
    
    // MARK: - Resend Verification
    func resendVerification() async throws {
        try await APIService.shared.resendVerification()
    }
}
