import SwiftUI

struct JoinGroupView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var inviteCode = ""
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var joinedGroup: RoommateGroup?
    @State private var showSuccess = false
    
    var body: some View {
        NavigationStack {
            ZStack {
                GradientBackground()
                
                ScrollView {
                    VStack(spacing: 32) {
                        // Header illustration
                        VStack(spacing: 16) {
                            Image(systemName: "person.crop.rectangle.stack.fill")
                                .font(.system(size: 60))
                                .foregroundStyle(
                                    LinearGradient(
                                        colors: [Color.collegioOrange, Color.collegioOrange.opacity(0.7)],
                                        startPoint: .topLeading,
                                        endPoint: .bottomTrailing
                                    )
                                )
                                .padding(.top, 40)
                            
                            Text("Join a Group")
                                .font(.title.bold())
                            
                            Text("Enter the 6-character invite code shared by your group admin")
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                                .multilineTextAlignment(.center)
                                .padding(.horizontal, 24)
                        }
                        
                        // Code Input
                        VStack(spacing: 16) {
                            TextField("INVITE CODE", text: $inviteCode)
                                .font(.system(.title2, design: .monospaced, weight: .bold))
                                .multilineTextAlignment(.center)
                                .textInputAutocapitalization(.characters)
                                .autocorrectionDisabled()
                                .padding()
                                .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 16))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 16)
                                        .stroke(Color.collegioOrange.opacity(inviteCode.isEmpty ? 0.3 : 0.8), lineWidth: 2)
                                )
                                .onChange(of: inviteCode) { _, newValue in
                                    // Limit to 6 characters and uppercase
                                    if newValue.count > 6 {
                                        inviteCode = String(newValue.prefix(6))
                                    }
                                    inviteCode = inviteCode.uppercased()
                                    // Clear error when user types
                                    errorMessage = nil
                                }
                            
                            if let error = errorMessage {
                                HStack(spacing: 6) {
                                    Image(systemName: "exclamationmark.triangle.fill")
                                        .font(.caption)
                                    Text(error)
                                        .font(.caption)
                                }
                                .foregroundStyle(.red)
                                .padding(.horizontal)
                                .transition(.opacity.combined(with: .move(edge: .top)))
                            }
                        }
                        .padding(.horizontal, 24)
                        
                        // Join Button
                        Button {
                            Task { await joinGroup() }
                        } label: {
                            HStack(spacing: 8) {
                                if isLoading {
                                    ProgressView()
                                        .tint(.white)
                                } else {
                                    Image(systemName: "arrow.right.circle.fill")
                                    Text("Join Group")
                                        .fontWeight(.semibold)
                                }
                            }
                            .foregroundStyle(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(
                                canJoin ? Color.collegioOrange : Color.gray.opacity(0.4),
                                in: Capsule()
                            )
                        }
                        .disabled(!canJoin || isLoading)
                        .padding(.horizontal, 24)
                        
                        // Help text
                        VStack(spacing: 8) {
                            Text("Don't have a code?")
                                .font(.subheadline.bold())
                            Text("Ask your group admin to generate an invite code from their Group Dashboard.")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                                .multilineTextAlignment(.center)
                        }
                        .padding(.horizontal, 32)
                        .padding(.top, 8)
                        
                        Spacer(minLength: 40)
                    }
                }
            }
            .navigationTitle("Join Group")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") { dismiss() }
                }
            }
            .alert("Welcome! 🎉", isPresented: $showSuccess) {
                Button("Let's Go") { dismiss() }
            } message: {
                if let group = joinedGroup {
                    Text("You've joined \(group.name)! Head to Roommates to see your group.")
                }
            }
        }
    }
    
    private var canJoin: Bool {
        inviteCode.count == 6
    }
    
    private func joinGroup() async {
        isLoading = true
        errorMessage = nil
        
        do {
            let group = try await GroupService.shared.joinGroupByCode(code: inviteCode)
            joinedGroup = group
            showSuccess = true
        } catch let error as APIError {
            withAnimation {
                switch error {
                case .serverError(let message):
                    errorMessage = message
                default:
                    errorMessage = "Something went wrong. Please try again."
                }
            }
        } catch {
            withAnimation {
                errorMessage = "Network error. Please check your connection."
            }
        }
        
        isLoading = false
    }
}

#Preview {
    JoinGroupView()
}
