import SwiftUI

struct EmailVerificationView: View {
    @StateObject private var authManager = AuthManager.shared
    @State private var isResending = false
    @State private var showResendSuccess = false
    @State private var errorMessage: String?
    
    var body: some View {
        ZStack {
            // Background
            LinearGradient(
                colors: [
                    Color(red: 0.12, green: 0.14, blue: 0.20),
                    Color(red: 0.08, green: 0.10, blue: 0.16)
                ],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()
            
            VStack(spacing: 32) {
                Spacer()
                
                // Icon
                ZStack {
                    Circle()
                        .fill(Color.collegioOrange.opacity(0.2))
                        .frame(width: 120, height: 120)
                    
                    Image(systemName: "envelope.badge")
                        .font(.system(size: 50))
                        .foregroundStyle(Color.collegioOrange)
                }
                
                // Title
                VStack(spacing: 12) {
                    Text("Check Your Email")
                        .font(.title.bold())
                        .foregroundStyle(.white)
                    
                    Text("We've sent a verification link to your email. Please click the link to verify your account.")
                        .font(.subheadline)
                        .foregroundStyle(.white.opacity(0.7))
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 40)
                }
                
                // Error Message
                if let error = errorMessage {
                    Text(error)
                        .font(.caption)
                        .foregroundStyle(.red)
                        .padding(12)
                        .background(Color.red.opacity(0.1))
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                }
                
                // Success Message
                if showResendSuccess {
                    HStack(spacing: 8) {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundStyle(.green)
                        Text("Verification email sent!")
                            .foregroundStyle(.green)
                    }
                    .font(.subheadline)
                    .padding(12)
                    .background(Color.green.opacity(0.1))
                    .clipShape(RoundedRectangle(cornerRadius: 8))
                }
                
                VStack(spacing: 16) {
                    // Resend Button
                    Button {
                        Task { await resendVerification() }
                    } label: {
                        HStack {
                            if isResending {
                                ProgressView()
                                    .tint(.white)
                            }
                            Text("Resend Verification Email")
                        }
                        .font(.headline)
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(Color.collegioOrange)
                        .clipShape(RoundedRectangle(cornerRadius: 14))
                    }
                    .disabled(isResending)
                    
                    // I've Verified Button
                    Button {
                        Task { await authManager.refreshUser() }
                    } label: {
                        Text("I've Verified My Email")
                            .font(.headline)
                            .foregroundStyle(Color.collegioOrange)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(Color.collegioOrange.opacity(0.15))
                            .clipShape(RoundedRectangle(cornerRadius: 14))
                            .overlay {
                                RoundedRectangle(cornerRadius: 14)
                                    .stroke(Color.collegioOrange.opacity(0.3), lineWidth: 1)
                            }
                    }
                    
                    // Back to Login
                    Button {
                        authManager.logout()
                    } label: {
                        Text("Back to Login")
                            .font(.subheadline)
                            .foregroundStyle(.white.opacity(0.7))
                    }
                    .padding(.top, 8)
                }
                .padding(.horizontal, 24)
                
                Spacer()
            }
        }
    }
    
    private func resendVerification() async {
        isResending = true
        errorMessage = nil
        showResendSuccess = false
        
        do {
            try await authManager.resendVerification()
            showResendSuccess = true
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isResending = false
    }
}

#Preview {
    EmailVerificationView()
}
