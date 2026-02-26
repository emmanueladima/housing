import SwiftUI

struct ForgotPasswordSheet: View {
    @Environment(\.dismiss) private var dismiss
    @State private var email = ""
    @State private var isLoading = false
    @State private var showSuccess = false
    @State private var errorMessage: String?
    
    var body: some View {
        NavigationStack {
            ZStack {
                GradientBackground()
                
                VStack(spacing: 24) {
                    // Icon
                    Image(systemName: "lock.rotation")
                        .font(.system(size: 60))
                        .foregroundStyle(Color.collegioOrange)
                        .padding(.top, 40)
                    
                    // Title
                    Text("Reset Password")
                        .font(.title.bold())
                    
                    Text("Enter your email and we'll send you a link to reset your password.")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                        .fixedSize(horizontal: false, vertical: true)
                        .padding(.horizontal, 24)
                    
                    // Error Message
                    if let error = errorMessage {
                        Text(error)
                            .font(.caption)
                            .foregroundStyle(.red)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 8)
                            .background(Color.red.opacity(0.1))
                            .clipShape(RoundedRectangle(cornerRadius: 8))
                    }
                    
                    // Email Field
                    DarkPlaceholderTextField(
                        placeholder: "Email",
                        text: $email,
                        icon: "envelope",
                        keyboardType: .emailAddress,
                        autocapitalization: .never
                    )
                    .padding(.horizontal, 24)
                    
                    // Submit Button
                    Button {
                        Task { await sendResetLink() }
                    } label: {
                        HStack {
                            if isLoading {
                                ProgressView()
                                    .tint(.white)
                            }
                            Text("Send Reset Link")
                                .font(.headline)
                        }
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(email.isEmpty ? Color.collegioOrange.opacity(0.5) : Color.collegioOrange)
                        .clipShape(RoundedRectangle(cornerRadius: 14))
                    }
                    .disabled(isLoading || email.isEmpty)
                    .padding(.horizontal, 24)
                    
                    Spacer()
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Cancel") { dismiss() }
                        .foregroundStyle(Color.collegioOrange)
                }
            }
            .alert("Check Your Email", isPresented: $showSuccess) {
                Button("OK") { dismiss() }
            } message: {
                Text("If an account exists with this email, you'll receive a password reset link shortly.")
            }
        }
        .presentationDetents([.medium])
    }
    
    private func sendResetLink() async {
        isLoading = true
        errorMessage = nil
        
        do {
            try await AuthManager.shared.forgotPassword(email: email)
            showSuccess = true
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
}

#Preview {
    ForgotPasswordSheet()
}
