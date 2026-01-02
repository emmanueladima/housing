import SwiftUI

struct RoommateProfileView: View {
    @StateObject private var viewModel = ProfileViewModel()
    @State private var showEditSheet = false
    
    var body: some View {
        ZStack {
            GradientBackground()
            
            ScrollView {
                VStack(spacing: 24) {
                    // Profile Preview Card
                    profilePreviewCard
                    
                    // Compatibility Test
                    compatibilitySection
                    
                    // Preferences Summary
                    preferencesSection
                }
                .padding()
            }
        }
        .navigationTitle("Roommate Profile")
        .navigationBarTitleDisplayMode(.large)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button("Edit") {
                    showEditSheet = true
                }
                .foregroundStyle(Color.collegioOrange)
            }
        }
        .sheet(isPresented: $showEditSheet) {
            ProfileCreationModal()
        }
        .task {
            await viewModel.fetchProfileData()
        }
    }
    
    // MARK: - Profile Preview Card
    private var profilePreviewCard: some View {
        VStack(spacing: 16) {
            // Avatar
            Circle()
                .fill(Color.collegioOrange.opacity(0.2))
                .frame(width: 80, height: 80)
                .overlay {
                    Text(viewModel.user?.initials ?? "??")
                        .font(.title.bold())
                        .foregroundStyle(Color.collegioOrange)
                }
            
            VStack(spacing: 4) {
                Text(viewModel.user?.fullName ?? "Your Name")
                    .font(.title2.bold())
                
                if let bio = viewModel.lifestyleProfile?.bio {
                    Text(bio)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                        .lineLimit(3)
                }
            }
            
            // Vibe Tags
            if let vibes = viewModel.lifestyleProfile?.vibeTags, !vibes.isEmpty {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(vibes, id: \.self) { vibe in
                            Text(vibe)
                                .font(.caption.bold())
                                .foregroundStyle(Color.collegioOrange)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 6)
                                .background(Color.collegioOrange.opacity(0.15), in: Capsule())
                        }
                    }
                }
            }
        }
        .padding(24)
        .frame(maxWidth: .infinity)
        .glassCard()
    }
    
    // MARK: - Compatibility Section
    private var compatibilitySection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Compatibility Test")
                .font(.headline)
            
            HStack {
                Image(systemName: "person.2.wave.2.fill")
                    .font(.title2)
                    .foregroundStyle(Color.collegioOrange)
                
                VStack(alignment: .leading, spacing: 4) {
                    Text("Find Your Perfect Match")
                        .font(.subheadline.bold())
                    Text("Take the test to improve your roommate matches")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .foregroundStyle(.secondary)
            }
            .padding()
            .glassCard()
        }
    }
    
    // MARK: - Preferences Section
    private var preferencesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Your Preferences")
                .font(.headline)
            
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                if let sleep = viewModel.lifestyleProfile?.sleepTime {
                    PreferenceItem(icon: "moon.fill", title: "Sleep", value: sleep)
                }
                
                if let cleanliness = viewModel.lifestyleProfile?.cleanliness {
                    PreferenceItem(icon: "sparkles", title: "Cleanliness", value: "\(cleanliness)/10")
                }
                
                if let noise = viewModel.lifestyleProfile?.noiseLevel {
                    PreferenceItem(icon: "speaker.wave.2.fill", title: "Noise", value: "\(noise)/10")
                }
                
                if let guests = viewModel.lifestyleProfile?.guestsFrequency {
                    PreferenceItem(icon: "person.2.fill", title: "Guests", value: guests.capitalized)
                }
            }
        }
    }
}

// MARK: - Preference Item
struct PreferenceItem: View {
    let icon: String
    let title: String
    let value: String
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.body)
                .foregroundStyle(Color.collegioOrange)
                .frame(width: 24, height: 24)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Text(value)
                    .font(.subheadline.bold())
            }
            
            Spacer()
        }
        .padding(12)
        .glassCard()
    }
}

#Preview {
    NavigationStack {
        RoommateProfileView()
    }
}
