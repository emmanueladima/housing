import SwiftUI

struct ProfileView: View {
    @StateObject private var viewModel = ProfileViewModel()
    @AppStorage("isDarkMode") private var isDarkMode = false
    @State private var showLogoutAlert = false
    @State private var showDeleteAlert = false
    @State private var showProfileSetup = false
    @State private var showCompatibilityTest = false
    @State private var showJoinGroup = false
    
    var body: some View {
        NavigationStack {
            ZStack {
                GradientBackground()
                
                ScrollView {
                    VStack(spacing: 24) {
                        // Profile Header
                        profileHeader
                        
                        // Menu Grid
                        menuGrid
                        
                        // Settings
                        settingsSection
                        
                        // Logout Button
                        logoutButton
                    }
                    .padding()
                    .padding(.bottom, 100)
                }
            }
            .navigationTitle("Profile")
            .navigationBarTitleDisplayMode(.inline)
            .task {
                await viewModel.fetchProfileData()
            }
        }
        .alert("Log Out", isPresented: $showLogoutAlert) {
            Button("Cancel", role: .cancel) {}
            Button("Log Out", role: .destructive) {}
        } message: {
            Text("Are you sure you want to log out?")
        }
        .alert("Delete Account", isPresented: $showDeleteAlert) {
            Button("Cancel", role: .cancel) {}
            Button("Delete", role: .destructive) {
                // TODO: Implement account deletion
            }
        } message: {
            Text("This will permanently delete your account and all data. This action cannot be undone.")
        }
        .fullScreenCover(isPresented: $showProfileSetup) {
            ProfileSetupWizard()
        }
        .sheet(isPresented: $showCompatibilityTest) {
            CompatibilityTestView()
        }
        .sheet(isPresented: $showJoinGroup) {
            JoinGroupView()
        }
    }
    
    // MARK: - Profile Header
    private var profileHeader: some View {
        HStack(spacing: 20) {
            // Avatar with Progress
            VStack(spacing: 8) {
                ZStack {
                    // Progress Ring
                    Circle()
                        .stroke(Color.gray.opacity(0.2), lineWidth: 4)
                        .frame(width: 90, height: 90)
                    
                    Circle()
                        .trim(from: 0, to: viewModel.completionPercentage / 100.0)
                        .stroke(Color.collegioOrange, style: StrokeStyle(lineWidth: 4, lineCap: .round))
                        .frame(width: 90, height: 90)
                        .rotationEffect(.degrees(-90))
                        .animation(.easeOut(duration: 1.0), value: viewModel.completionPercentage)
                    
                    // Avatar Image/Placeholder - check lifestyle profile photo first
                    if let photoUrl = viewModel.lifestyleProfile?.photo, let url = URL(string: photoUrl) {
                        AsyncImage(url: url) { image in
                            image.resizable().aspectRatio(contentMode: .fill)
                        } placeholder: {
                            ProgressView()
                        }
                        .frame(width: 76, height: 76)
                        .clipShape(Circle())
                    } else if let imageUrl = viewModel.user?.profileImage, let url = URL(string: imageUrl) {
                        AsyncImage(url: url) { image in
                            image.resizable().aspectRatio(contentMode: .fill)
                        } placeholder: {
                            ProgressView()
                        }
                        .frame(width: 76, height: 76)
                        .clipShape(Circle())
                    } else {
                        Circle()
                            .fill(Color.gray.opacity(0.15))
                            .frame(width: 76, height: 76)
                            .overlay {
                                Text(viewModel.user?.initials ?? "")
                                    .font(.title.bold())
                                    .foregroundStyle(.secondary)
                            }
                    }
                }
                
                // Percentage Badge (below avatar)
                Text("\(Int(viewModel.completionPercentage))%")
                    .font(.caption.bold())
                    .foregroundStyle(.white)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 5)
                    .background(Capsule().fill(Color.black))
            }
            
            // Info & Action
            VStack(alignment: .leading, spacing: 8) {
                HStack(spacing: 6) {
                    if viewModel.isLoading {
                        Text("Loading...")
                            .font(.title2.bold())
                    } else {
                        Text(viewModel.user?.fullName ?? "Guest")
                            .font(.title2.bold())
                    }
                    
                    if viewModel.user?.isVerified == true {
                        Image(systemName: "checkmark.seal.fill")
                            .foregroundStyle(.green)
                    }
                }
                
                Button(action: { showProfileSetup = true }) {
                    HStack(spacing: 6) {
                        Image(systemName: "sparkles")
                        Text(viewModel.completionPercentage >= 100 ? "Edit Profile" : "Complete Profile")
                    }
                    .font(.subheadline.bold())
                    .foregroundStyle(.white)
                    .padding(.horizontal, 20)
                    .padding(.vertical, 12)
                    .background(Capsule().fill(Color.collegioOrange))
                }
                .buttonStyle(.plain)
            }
            
            Spacer()
        }
        .padding(.horizontal)
        .padding(.top)
    }
    
    private var menuGrid: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
            NavigationLink(destination: SavedListingsView()) {
                ProfileCard(title: "Saved\nListings", icon: "heart.fill", color: .collegioOrange, count: viewModel.savedCount)
            }
            .buttonStyle(.plain)
            
            NavigationLink(destination: MyApplicationsView()) {
                ProfileCard(title: "My\nApplications", icon: "doc.text.fill", color: .collegioOrange, count: viewModel.applicationsCount)
            }
            .buttonStyle(.plain)
            
            NavigationLink(destination: RoommateProfileView()) {
                ProfileCard(title: "Roommate\nProfile", icon: "person.2.fill", color: .collegioOrange)
            }
            .buttonStyle(.plain)
            
            NavigationLink(destination: MyListingsView()) {
                ProfileCard(title: "My\nListings", icon: "house.fill", color: .collegioOrange, count: 0)
            }
            .buttonStyle(.plain)
            
            // NEW: Toolkit
            NavigationLink(destination: ToolkitView()) {
                ProfileCard(title: "Roommate\nToolkit", icon: "hammer.fill", color: .collegioOrange)
            }
            .buttonStyle(.plain)
            
            // NEW: My Group
            NavigationLink(destination: GroupDashboardView()) {
                ProfileCard(title: "My\nGroup", icon: "person.3.fill", color: .collegioOrange)
            }
            .buttonStyle(.plain)
            
            // Compatibility Test
            Button { showCompatibilityTest = true } label: {
                ProfileCard(title: "Compatibility\nTest", icon: "checkmark.seal.fill", color: .collegioOrange)
            }
            .buttonStyle(.plain)
            
            // Join Group
            Button { showJoinGroup = true } label: {
                ProfileCard(title: "Join\nGroup", icon: "person.crop.rectangle.stack.fill", color: .collegioOrange)
            }
            .buttonStyle(.plain)
        }
        .padding(.horizontal)
    }
    
    // MARK: - Settings Section
    private var settingsSection: some View {
        VStack(spacing: 0) {
            // Dark Mode Toggle
            HStack {
                Image(systemName: "moon.fill")
                    .font(.title3)
                    .foregroundStyle(.indigo)
                    .frame(width: 32)
                
                Text("Dark Mode")
                    .font(.body)
                
                Spacer()
                
                Toggle("", isOn: $isDarkMode)
                    .labelsHidden()
            }
            .padding()
            
            Divider().padding(.leading, 56)
            
            NavigationLink(destination: NotificationsView()) {
                MenuRow(icon: "bell.fill", title: "Notifications", color: .orange)
            }
            .buttonStyle(.plain)
            Divider().padding(.leading, 56)
            
            // Privacy & Security Link
            NavigationLink(destination: PrivacySecurityView()) {
                HStack {
                    Image(systemName: "lock.fill")
                        .font(.title3)
                        .foregroundStyle(.gray)
                        .frame(width: 32)
                    
                    Text("Privacy & Security")
                        .font(.body)
                        .foregroundStyle(.primary)
                    
                    Spacer()
                    
                    Image(systemName: "chevron.right")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                .padding()
                .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            
            // Feedback Board Link
            NavigationLink(destination: FeedbackView()) {
                HStack {
                    Image(systemName: "lightbulb.fill")
                        .font(.title3)
                        .foregroundStyle(.yellow)
                        .frame(width: 32)
                    
                    Text("Feedback Board")
                        .font(.body)
                        .foregroundStyle(.primary)
                    
                    Spacer()
                    
                    Image(systemName: "chevron.right")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                .padding()
                .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            
            Divider().padding(.leading, 56)
            
            // Safety Center Link
            NavigationLink(destination: SafetyCenterView()) {
                HStack {
                    Image(systemName: "shield.fill")
                        .font(.title3)
                        .foregroundStyle(.teal)
                        .frame(width: 32)
                    
                    Text("Safety Center")
                        .font(.body)
                        .foregroundStyle(.primary)
                    
                    Spacer()
                    
                    Image(systemName: "chevron.right")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                .padding()
                .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
        }
        .glassCard()
    }
    
    // MARK: - Logout Button
    private var logoutButton: some View {
        VStack(spacing: 12) {
            Button(action: { showLogoutAlert = true }) {
                HStack {
                    Spacer()
                    Text("Log Out")
                        .font(.headline)
                        .foregroundStyle(.red)
                    Spacer()
                }
                .padding()
                .glassCard()
            }
            
            Button(action: { showDeleteAlert = true }) {
                HStack {
                    Spacer()
                    Text("Delete Account")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                    Spacer()
                }
                .padding(.vertical, 8)
            }
        }
    }
}

// MARK: - Stat Item
struct StatItem: View {
    let value: String
    let label: String
    
    var body: some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.title2.bold())
                .foregroundStyle(Color.collegioOrange)
            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
    }
}

// MARK: - Profile Grid Card
struct ProfileCard: View {
    let title: String
    let icon: String
    let color: Color
    var count: Int? = nil
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: icon)
                    .font(.title2)
                    .foregroundStyle(color)
                    .frame(width: 40, height: 40)
                    .background(color.opacity(0.1), in: Circle())
                
                Spacer()
                
                if let count = count {
                    Text("\(count)")
                        .font(.headline)
                        .foregroundStyle(.primary)
                }
            }
            
            Text(title)
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(.primary)
                .lineLimit(2)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding()
        .frame(maxWidth: .infinity, minHeight: 120, alignment: .leading)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 20))
        .overlay {
            RoundedRectangle(cornerRadius: 20)
                .stroke(Color.white.opacity(0.1), lineWidth: 1)
        }
    }
}

// MARK: - Menu Row (for Settings items)
struct MenuRow: View {
    let icon: String
    let title: String
    let color: Color
    
    var body: some View {
        HStack {
            Image(systemName: icon)
                .font(.title3)
                .foregroundStyle(color)
                .frame(width: 32)
            
            Text(title)
                .font(.body)
            
            Spacer()
            
            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding()
        .contentShape(Rectangle())
    }
}

#Preview {
    ProfileView()
}

#Preview("Dark Mode") {
    ProfileView()
        .preferredColorScheme(.dark)
}
