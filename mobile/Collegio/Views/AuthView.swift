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
    
    // Admin exception for .edu requirement
    private let adminEmail = "admin@collegio.us"
    
    // Beige background to match app
    private let beigeBackground = Color(red: 0.894, green: 0.886, blue: 0.867)
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Beige background
                beigeBackground
                    .ignoresSafeArea()
                
                // Content positioned at top, not centered
                VStack(spacing: 0) {
                    // Collegio logo with transparent background - LARGE
                    Image("CollegioLogo")
                        .resizable()
                        .scaledToFit()
                        .frame(height: 200) // Much larger logo
                        .padding(.top, 20)
                    
                    // Auth Card - directly below logo, no gap
                    authCard
                        .padding(.horizontal, 24)
                        .padding(.top, 0) // No gap
                    
                    Spacer()
                    
                    // Terms
                    Text("By continuing, you agree to our Terms of Service and Privacy Policy")
                        .font(.caption)
                        .foregroundStyle(Color(white: 0.4))
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
            .background(Color(white: 0.92))
            .clipShape(RoundedRectangle(cornerRadius: 14))
            
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
                    Button("Forgot Password?") { }
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
        .background(Color.white)
        .clipShape(RoundedRectangle(cornerRadius: 24))
        .shadow(color: .black.opacity(0.08), radius: 20, x: 0, y: 10)
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

// MARK: - Dark Placeholder Text Field (Higher Contrast)
struct DarkPlaceholderTextField: View {
    let placeholder: String
    @Binding var text: String
    var icon: String = ""
    var keyboardType: UIKeyboardType = .default
    var autocapitalization: TextInputAutocapitalization = .sentences
    
    var body: some View {
        HStack(spacing: 12) {
            if !icon.isEmpty {
                Image(systemName: icon)
                    .foregroundStyle(Color(white: 0.45))
                    .frame(width: 20)
            }
            
            TextField("", text: $text, prompt: Text(placeholder).foregroundStyle(Color(white: 0.5)))
                .keyboardType(keyboardType)
                .textInputAutocapitalization(autocapitalization)
                .foregroundStyle(Color.black)
        }
        .padding()
        .background(Color(white: 0.96))
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color(white: 0.82), lineWidth: 1))
    }
}

// MARK: - Dark Placeholder Secure Field
struct DarkPlaceholderSecureField: View {
    let placeholder: String
    @Binding var text: String
    @Binding var showPassword: Bool
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: "lock")
                .foregroundStyle(Color(white: 0.45))
                .frame(width: 20)
            
            if showPassword {
                TextField("", text: $text, prompt: Text(placeholder).foregroundStyle(Color(white: 0.5)))
                    .textInputAutocapitalization(.never)
                    .foregroundStyle(Color.black)
            } else {
                SecureField("", text: $text, prompt: Text(placeholder).foregroundStyle(Color(white: 0.5)))
                    .foregroundStyle(Color.black)
            }
            
            Button { showPassword.toggle() } label: {
                Image(systemName: showPassword ? "eye.slash" : "eye")
                    .foregroundStyle(Color.collegioOrange)
            }
        }
        .padding()
        .background(Color(white: 0.96))
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color(white: 0.82), lineWidth: 1))
    }
}

#Preview { AuthView() }
