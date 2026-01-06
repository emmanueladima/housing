import SwiftUI

struct RoommatesView: View {
    @StateObject private var viewModel = RoommatesViewModel()
    @State private var selectedTab = 0
    @State private var showCreateGroup = false
    
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
                
                // Floating Create Group Button (only in Groups tab)
                if selectedTab == 1 {
                    VStack {
                        Spacer()
                        HStack {
                            Spacer()
                            NavigationLink(destination: GroupCreationView()) {
                                Image(systemName: "plus")
                                    .font(.title2.bold())
                                    .foregroundStyle(.white)
                                    .frame(width: 56, height: 56)
                                    .background(Color.collegioOrange)
                                    .clipShape(Circle())
                                    .shadow(color: Color.collegioOrange.opacity(0.4), radius: 8, y: 4)
                            }
                            .padding(.trailing, 20)
                            .padding(.bottom, 16)
                        }
                    }
                }
            }
            .navigationTitle("Roommates")
            .task {
                await viewModel.loadProfiles()
                await viewModel.loadGroups()
            }
        }
    }
    
    // MARK: - Solo Profiles List
    private var soloProfilesList: some View {
        ScrollView {
            LazyVStack(spacing: 16) {
                if viewModel.isLoadingProfiles {
                    ProgressView()
                        .padding(.top, 40)
                } else if viewModel.profiles.isEmpty {
                    emptyState(icon: "person.2", title: "No Profiles Yet", subtitle: "Be the first to create a roommate profile!")
                } else {
                    ForEach(viewModel.profiles) { profile in
                        NavigationLink(destination: RoommateDetailsView(profile: profile)) {
                            RoommateCard(profile: profile)
                        }
                        .buttonStyle(.plain)
                    }
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
                if viewModel.isLoadingGroups {
                    ProgressView()
                        .padding(.top, 40)
                } else if viewModel.groups.isEmpty {
                    emptyState(icon: "person.3", title: "No Groups Yet", subtitle: "Create a group to find roommates together!")
                } else {
                    ForEach(viewModel.groups) { group in
                        NavigationLink(destination: GroupDetailView(group: group)) {
                            GroupCardView(group: group)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
            .padding(.horizontal)
            .padding(.bottom, 100)
        }
    }
    
    private func emptyState(icon: String, title: String, subtitle: String) -> some View {
        VStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 50))
                .foregroundStyle(.secondary)
            Text(title)
                .font(.headline)
            Text(subtitle)
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .padding(.top, 60)
    }
}

// MARK: - Group Card View (Updated to use real data)
struct GroupCardView: View {
    let group: RoommateGroup
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                // Member Avatars (overlapping)
                HStack(spacing: -12) {
                    ForEach(Array((group.members ?? []).prefix(3).enumerated()), id: \.offset) { index, member in
                        Circle()
                            .fill(Color.collegioBlue.opacity(0.3))
                            .frame(width: 40, height: 40)
                            .overlay {
                                Text(member.firstName?.prefix(1) ?? "?")
                                    .font(.caption.bold())
                            }
                            .overlay(Circle().stroke(.white, lineWidth: 2))
                    }
                }
                
                Spacer()
                
                if let lookingFor = group.lookingFor {
                    Text("Looking for \(lookingFor)")
                        .font(.subheadline.bold())
                        .foregroundStyle(Color.collegioOrange)
                }
            }
            
            Text(group.name)
                .font(.headline)
            
            if let budget = group.budget?.max {
                Text("Budget: Up to $\(budget)/mo")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            
            if let vibes = group.vibe, !vibes.isEmpty {
                HStack(spacing: 8) {
                    ForEach(vibes.prefix(3), id: \.self) { vibe in
                        TagView(text: vibe)
                    }
                }
            }
        }
        .padding(16)
        .glassCard()
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
