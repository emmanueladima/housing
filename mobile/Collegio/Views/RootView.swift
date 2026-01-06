import SwiftUI

/// RootView manages the authentication flow:
/// 1. Loading → Check auth state
/// 2. Not authenticated → AuthView (login/signup)
/// 3. Not verified → EmailVerificationView
/// 4. No profile → ProfileSetupWizard
/// 5. Authenticated + verified + profile → ContentView
struct RootView: View {
    @StateObject private var authManager = AuthManager.shared
    
    var body: some View {
        Group {
            if authManager.isLoading {
                // Loading state
                loadingView
            } else if !authManager.isAuthenticated {
                // Not logged in
                AuthView()
            } else if authManager.needsEmailVerification {
                // Logged in but not verified
                EmailVerificationView()
            } else if authManager.needsProfileSetup {
                // Verified but no profile
                ProfileSetupWizard()
            } else {
                // Fully authenticated
                ContentView()
            }
        }
        .animation(.easeInOut(duration: 0.3), value: authManager.isAuthenticated)
        .animation(.easeInOut(duration: 0.3), value: authManager.needsEmailVerification)
        .animation(.easeInOut(duration: 0.3), value: authManager.needsProfileSetup)
    }
    
    private var loadingView: some View {
        ZStack {
            Color(red: 0.894, green: 0.886, blue: 0.867)
                .ignoresSafeArea()
            
            VStack(spacing: 20) {
                Image("CollegioLogo")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 100, height: 100)
                
                ProgressView()
                    .tint(Color.collegioOrange)
            }
        }
    }
}

#Preview {
    RootView()
}
