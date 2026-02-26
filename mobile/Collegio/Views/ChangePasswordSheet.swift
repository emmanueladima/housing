import SwiftUI

struct ChangePasswordSheet: View {
    @Environment(\.dismiss) private var dismiss
    @State private var currentPassword = ""
    @State private var newPassword = ""
    @State private var confirmPassword = ""
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var showSuccess = false
    @State private var showCurrentPassword = false
    @State private var showNewPassword = false
    
    var body: some View {
        NavigationStack {
            ZStack {
                GradientBackground()
                
                ScrollView {
                    VStack(spacing: 24) {
                        // Header Icon
                        Image(systemName: "lock.rotation")
                            .font(.system(size: 50))
                            .foregroundStyle(Color.collegioOrange)
                            .padding(.top, 20)
                        
                        Text("Update your password to keep your account secure.")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal)
                        
                        // Form Fields
                        VStack(spacing: 16) {
                            // Current Password
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Current Password")
                                    .font(.subheadline.bold())
                                
                                HStack {
                                    if showCurrentPassword {
                                        TextField("Enter current password", text: $currentPassword)
                                    } else {
                                        SecureField("Enter current password", text: $currentPassword)
                                    }
                                    
                                    Button(action: { showCurrentPassword.toggle() }) {
                                        Image(systemName: showCurrentPassword ? "eye.slash" : "eye")
                                            .foregroundStyle(.secondary)
                                    }
                                }
                                .padding()
                                .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
                            }
                            
                            // New Password
                            VStack(alignment: .leading, spacing: 8) {
                                Text("New Password")
                                    .font(.subheadline.bold())
                                
                                HStack {
                                    if showNewPassword {
                                        TextField("Enter new password", text: $newPassword)
                                    } else {
                                        SecureField("Enter new password", text: $newPassword)
                                    }
                                    
                                    Button(action: { showNewPassword.toggle() }) {
                                        Image(systemName: showNewPassword ? "eye.slash" : "eye")
                                            .foregroundStyle(.secondary)
                                    }
                                }
                                .padding()
                                .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
                                
                                // Password strength indicator
                                if !newPassword.isEmpty {
                                    HStack(spacing: 4) {
                                        ForEach(0..<4, id: \.self) { i in
                                            RoundedRectangle(cornerRadius: 2)
                                                .fill(i < passwordStrength ? strengthColor : Color.gray.opacity(0.3))
                                                .frame(height: 4)
                                        }
                                    }
                                    
                                    Text(strengthText)
                                        .font(.caption)
                                        .foregroundStyle(strengthColor)
                                }
                            }
                            
                            // Confirm Password
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Confirm New Password")
                                    .font(.subheadline.bold())
                                
                                SecureField("Re-enter new password", text: $confirmPassword)
                                    .padding()
                                    .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
                                
                                if !confirmPassword.isEmpty && newPassword != confirmPassword {
                                    HStack(spacing: 4) {
                                        Image(systemName: "xmark.circle.fill")
                                            .font(.caption)
                                        Text("Passwords do not match")
                                            .font(.caption)
                                    }
                                    .foregroundStyle(.red)
                                }
                            }
                        }
                        .padding()
                        .glassCard()
                        
                        // Error Message
                        if let error = errorMessage {
                            HStack(spacing: 8) {
                                Image(systemName: "exclamationmark.triangle.fill")
                                Text(error)
                            }
                            .font(.subheadline)
                            .foregroundStyle(.red)
                            .padding()
                            .frame(maxWidth: .infinity)
                            .background(.red.opacity(0.1), in: RoundedRectangle(cornerRadius: 12))
                        }
                        
                        // Submit Button
                        Button(action: { Task { await changePassword() } }) {
                            HStack(spacing: 8) {
                                if isLoading {
                                    ProgressView()
                                        .tint(.white)
                                } else {
                                    Image(systemName: "checkmark.shield.fill")
                                    Text("Update Password")
                                }
                            }
                            .font(.headline)
                            .foregroundStyle(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(canSubmit ? Color.collegioOrange : Color.gray.opacity(0.5), in: RoundedRectangle(cornerRadius: 14))
                        }
                        .disabled(!canSubmit || isLoading)
                    }
                    .padding()
                    .padding(.bottom, 40)
                }
            }
            .navigationTitle("Change Password")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Cancel") { dismiss() }
                }
            }
            .alert("Password Updated", isPresented: $showSuccess) {
                Button("OK") { dismiss() }
            } message: {
                Text("Your password has been changed successfully.")
            }
        }
    }
    
    // MARK: - Validation
    
    private var canSubmit: Bool {
        !currentPassword.isEmpty &&
        newPassword.count >= 6 &&
        newPassword == confirmPassword
    }
    
    private var passwordStrength: Int {
        var strength = 0
        if newPassword.count >= 6 { strength += 1 }
        if newPassword.count >= 10 { strength += 1 }
        if newPassword.rangeOfCharacter(from: .uppercaseLetters) != nil &&
           newPassword.rangeOfCharacter(from: .lowercaseLetters) != nil { strength += 1 }
        if newPassword.rangeOfCharacter(from: .decimalDigits) != nil ||
           newPassword.rangeOfCharacter(from: .punctuationCharacters) != nil { strength += 1 }
        return strength
    }
    
    private var strengthColor: Color {
        switch passwordStrength {
        case 1: return .red
        case 2: return .orange
        case 3: return .yellow
        case 4: return .green
        default: return .gray
        }
    }
    
    private var strengthText: String {
        switch passwordStrength {
        case 1: return "Weak"
        case 2: return "Fair"
        case 3: return "Good"
        case 4: return "Strong"
        default: return ""
        }
    }
    
    // MARK: - Action
    
    private func changePassword() async {
        isLoading = true
        errorMessage = nil
        
        do {
            try await APIService.shared.changePassword(
                currentPassword: currentPassword,
                newPassword: newPassword
            )
            showSuccess = true
        } catch let error as APIError {
            errorMessage = error.localizedDescription
        } catch {
            errorMessage = "An unexpected error occurred."
        }
        
        isLoading = false
    }
}

#Preview {
    ChangePasswordSheet()
}
