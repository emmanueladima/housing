import SwiftUI

struct RoommatesView: View {
    @State private var selectedTab = 0
    
    var body: some View {
        NavigationStack {
            ZStack {
                GradientBackground()
                
                VStack(spacing: 0) {
                    // Segmented Control
                    Picker("View", selection: $selectedTab) {
                        Text("Solo").tag(0)
                        Text("Groups").tag(1)
                    }
                    .pickerStyle(.segmented)
                    .padding()
                    
                    // Content
                    if selectedTab == 0 {
                        soloProfilesList
                    } else {
                        groupsList
                    }
                }
            }
            .navigationTitle("Roommates")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button(action: {}) {
                        Image(systemName: "slider.horizontal.3")
                    }
                }
            }
        }
    }
    
    // MARK: - Solo Profiles List
    private var soloProfilesList: some View {
        ScrollView {
            LazyVStack(spacing: 16) {
                ForEach(0..<5) { index in
                    NavigationLink(destination: RoommateDetailsView(profile: LifestyleProfile.sample)) {
                        RoommateCard(profile: LifestyleProfile.sample)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal)
            .padding(.bottom, 100)
        }
    }
    
    // MARK: - Groups List
    private var groupsList: some View {
        ScrollView {
            LazyVStack(spacing: 16) {
                ForEach(0..<3) { index in
                    GroupCard(memberCount: index + 2, lookingFor: 4 - index - 2)
                }
            }
            .padding(.horizontal)
            .padding(.bottom, 100)
        }
    }
}

// MARK: - Roommate Card
struct RoommateCard: View {
    let profile: LifestyleProfile
    
    var body: some View {
        HStack(spacing: 16) {
            // Avatar
            Circle()
                .fill(Color.collegioOrange.opacity(0.2))
                .frame(width: 60, height: 60)
                .overlay {
                    Text(profile.user?.initials ?? "??")
                        .font(.title2.bold())
                        .foregroundStyle(Color.collegioOrange)
                }
            
            // Info
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(profile.user?.fullName ?? "Anonymous")
                        .font(.headline)
                    
                    Spacer()
                    
                    // Age badge instead of matchScore
                    if let age = profile.age {
                        Text("\(age)yo")
                            .font(.subheadline.bold())
                            .foregroundStyle(.green)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(.green.opacity(0.15), in: Capsule())
                    }
                }
                
                if let bio = profile.bio {
                    Text(bio)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .lineLimit(2)
                }
                
                // Tags - using new field names
                HStack(spacing: 8) {
                    if let sleep = profile.sleepTime {
                        TagView(text: sleep, icon: "moon.fill")
                    }
                    if let noise = profile.noiseLevel {
                        TagView(text: "\(noise)/10", icon: "speaker.wave.2.fill")
                    }
                }
            }
        }
        .padding(16)
        .glassCard()
    }
}


// MARK: - Group Card
struct GroupCard: View {
    let memberCount: Int
    let lookingFor: Int
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                // Member Avatars (overlapping)
                HStack(spacing: -12) {
                    ForEach(0..<memberCount, id: \.self) { i in
                        Circle()
                            .fill(Color.collegioBlue.opacity(0.3))
                            .frame(width: 40, height: 40)
                            .overlay {
                                Text("M\(i+1)")
                                    .font(.caption.bold())
                            }
                            .overlay(Circle().stroke(.white, lineWidth: 2))
                    }
                }
                
                Spacer()
                
                VStack(alignment: .trailing) {
                    Text("Looking for \(lookingFor) more")
                        .font(.subheadline.bold())
                        .foregroundStyle(Color.collegioOrange)
                }
            }
            
            Text("Budget: $500 - $800/mo")
                .font(.subheadline)
                .foregroundStyle(.secondary)
            
            HStack(spacing: 8) {
                TagView(text: "Near Campus", icon: "location.fill")
                TagView(text: "Quiet", icon: "speaker.slash.fill")
            }
        }
        .padding(16)
        .glassCard()
    }
}

// MARK: - Tag View Component
struct TagView: View {
    let text: String
    let icon: String?
    
    init(text: String, icon: String? = nil) {
        self.text = text
        self.icon = icon
    }
    
    var body: some View {
        HStack(spacing: 4) {
            if let icon = icon {
                Image(systemName: icon)
                    .font(.caption2)
            }
            Text(text)
                .font(.caption)
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(.ultraThinMaterial, in: Capsule())
    }
}

#Preview {
    RoommatesView()
}

#Preview("Dark Mode") {
    RoommatesView()
        .preferredColorScheme(.dark)
}
