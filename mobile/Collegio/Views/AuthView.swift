import SwiftUI

struct AuthView: View {
    @StateObject private var authManager = AuthManager.shared
    @State private var isLoginMode = true
    @State private var email = ""
    @State private var password = ""
    @State private var firstName = ""
    @State private var lastName = ""
    @State private var phone = ""
    @State private var school = ""
    @State private var graduationYear = ""
    @State private var showPassword = false
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var showSignupSuccess = false
    @State private var showForgotPassword = false
    @Environment(\.colorScheme) private var colorScheme
    
    // Admin exception for .edu requirement
    private let adminEmail = "admin@collegio.us"
    

    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // White in light mode, black in dark mode
                // Adaptive background
                GradientBackground()
                
                // Content positioned at top, not centered
                VStack(spacing: 0) {
                    // BeigeCover logo
                    Image("CollegioLogo")
                        .resizable()
                        .scaledToFit()
                        .frame(height: 200) // Large logo
                        .padding(.top, 40)
                    
                    // Auth Card - directly below logo, no gap
                    authCard
                        .padding(.horizontal, 24)
                        .padding(.top, 20)
                    
                    Spacer()
                    
                    // Terms
                    Text("By continuing, you agree to our Terms of Service and Privacy Policy")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 40)
                        .padding(.bottom, 30)
                }
            }
        }
        .alert("Account Created!", isPresented: $showSignupSuccess) {
            Button("OK") { isLoginMode = true }
        } message: {
            Text("Please check your email to verify your account before logging in.")
        }
        .sheet(isPresented: $showForgotPassword) {
            ForgotPasswordSheet()
        }
    }
    
    // MARK: - Auth Card
    private var authCard: some View {
        VStack(spacing: 20) {
            // Mode Toggle
            HStack(spacing: 0) {
                Button {
                    withAnimation(.spring(response: 0.3)) {
                        isLoginMode = true
                        errorMessage = nil
                    }
                } label: {
                    Text("Sign In")
                        .font(.headline)
                        .foregroundStyle(isLoginMode ? .white : Color(white: 0.4))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(isLoginMode ? Color.collegioOrange : Color.clear)
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                }
                
                Button {
                    withAnimation(.spring(response: 0.3)) {
                        isLoginMode = false
                        errorMessage = nil
                    }
                } label: {
                    Text("Sign Up")
                        .font(.headline)
                        .foregroundStyle(!isLoginMode ? .white : Color(white: 0.4))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(!isLoginMode ? Color.collegioOrange : Color.clear)
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                }
            }
            .padding(4)
            .glassEffect(.regular.interactive(), in: RoundedRectangle(cornerRadius: 14))
            
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
            
            // Form Fields
            VStack(spacing: 16) {
                if !isLoginMode {
                    HStack(spacing: 12) {
                        DarkPlaceholderTextField(placeholder: "First Name", text: $firstName, icon: "person")
                        DarkPlaceholderTextField(placeholder: "Last Name", text: $lastName, icon: "person")
                    }
                }
                
                DarkPlaceholderTextField(
                    placeholder: "Email (.edu required)",
                    text: $email,
                    icon: "envelope",
                    keyboardType: .emailAddress,
                    autocapitalization: .never
                )
                
                DarkPlaceholderSecureField(placeholder: "Password", text: $password, showPassword: $showPassword)
                
                if !isLoginMode {
                    DarkPlaceholderTextField(placeholder: "Phone", text: $phone, icon: "phone", keyboardType: .phonePad)
                    DarkPlaceholderTextField(placeholder: "School (e.g. Oregon State University)", text: $school, icon: "building.columns")
                    DarkPlaceholderTextField(placeholder: "Graduation Year (e.g. 2026)", text: $graduationYear, icon: "calendar", keyboardType: .numberPad)
                }
            }
            
            // Forgot Password (Login only)
            if isLoginMode {
                HStack {
                    Spacer()
                    Button("Forgot Password?") { showForgotPassword = true }
                        .font(.caption.bold())
                        .foregroundStyle(Color.collegioOrange)
                }
            }
            
            // Submit Button
            Button {
                Task { await handleSubmit() }
            } label: {
                HStack {
                    if isLoading { ProgressView().tint(.white) }
                    Text(isLoginMode ? "Sign In" : "Create Account")
                        .font(.headline)
                }
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(isFormValid ? Color.collegioOrange : Color.collegioOrange.opacity(0.5))
                .clipShape(RoundedRectangle(cornerRadius: 14))
            }
            .disabled(isLoading || !isFormValid)
        }
        .padding(24)
        .glassEffect(.regular.interactive(), in: RoundedRectangle(cornerRadius: 24))
    }
    
    private var isFormValid: Bool {
        if isLoginMode {
            return !email.isEmpty && !password.isEmpty
        } else {
            let isValidEmail = email.hasSuffix(".edu") || email.lowercased() == adminEmail
            return !email.isEmpty && !password.isEmpty && !firstName.isEmpty && !lastName.isEmpty && !phone.isEmpty && !school.isEmpty && !graduationYear.isEmpty && isValidEmail
        }
    }
    
    private func handleSubmit() async {
        isLoading = true
        errorMessage = nil
        
        do {
            if isLoginMode {
                try await authManager.login(email: email, password: password)
            } else {
                guard email.hasSuffix(".edu") || email.lowercased() == adminEmail else {
                    errorMessage = "Please use a .edu email address"
                    isLoading = false
                    return
                }
                
                guard let year = Int(graduationYear), year >= 2024 && year <= 2035 else {
                    errorMessage = "Please enter a valid graduation year (2024-2035)"
                    isLoading = false
                    return
                }
                
                try await authManager.signup(
                    firstName: firstName, lastName: lastName, email: email,
                    password: password, phone: phone, school: school, graduationYear: year
                )
                showSignupSuccess = true
            }
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }
}

// MARK: - Liquid Glass Text Field
struct DarkPlaceholderTextField: View {
    let placeholder: String
    @Binding var text: String
    var icon: String = ""
    var keyboardType: UIKeyboardType = .default
    var autocapitalization: TextInputAutocapitalization = .sentences
    @Environment(\.colorScheme) private var colorScheme
    
    var body: some View {
        HStack(spacing: 12) {
            if !icon.isEmpty {
                Image(systemName: icon)
                    .foregroundStyle(.secondary)
                    .frame(width: 20)
            }
            
            TextField("", text: $text, prompt: Text(placeholder).foregroundStyle(.secondary))
                .keyboardType(keyboardType)
                .textInputAutocapitalization(autocapitalization)
                .foregroundStyle(.primary)
        }
        .padding()
        .glassEffect(.regular.interactive(), in: RoundedRectangle(cornerRadius: 12))
    }
}

// MARK: - Liquid Glass Secure Field
struct DarkPlaceholderSecureField: View {
    let placeholder: String
    @Binding var text: String
    @Binding var showPassword: Bool
    @Environment(\.colorScheme) private var colorScheme
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: "lock")
                .foregroundStyle(.secondary)
                .frame(width: 20)
            
            if showPassword {
                TextField("", text: $text, prompt: Text(placeholder).foregroundStyle(.secondary))
                    .textInputAutocapitalization(.never)
                    .foregroundStyle(.primary)
            } else {
                SecureField("", text: $text, prompt: Text(placeholder).foregroundStyle(.secondary))
                    .foregroundStyle(.primary)
            }
            
            Button { showPassword.toggle() } label: {
                Image(systemName: showPassword ? "eye.slash" : "eye")
                    .foregroundStyle(Color.collegioOrange)
            }
        }
        .padding()
        .glassEffect(.regular.interactive(), in: RoundedRectangle(cornerRadius: 12))
    }
}

#Preview { AuthView() }
