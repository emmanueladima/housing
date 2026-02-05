import SwiftUI

struct RoommatesView: View {
    @StateObject private var viewModel = RoommatesViewModel()
    @State private var selectedTab = 0
    @State private var showCreateGroup = false
    @State private var searchText = ""
    
    // Filtered profiles based on search
    var filteredProfiles: [LifestyleProfile] {
        if searchText.isEmpty {
            return viewModel.profiles
        }
        return viewModel.profiles.filter { profile in
            let name = profile.user?.fullName.lowercased() ?? ""
            let bio = profile.bio?.lowercased() ?? ""
            let query = searchText.lowercased()
            return name.contains(query) || bio.contains(query)
        }
    }
    
    var body: some View {
        NavigationStack {
            ZStack {
                GradientBackground()
                
                VStack(spacing: 0) {
                    // Search Bar
                    HStack(spacing: 12) {
                        Image(systemName: "magnifyingglass")
                            .foregroundStyle(.secondary)
                        TextField("Search by name or bio...", text: $searchText)
                            .textFieldStyle(.plain)
                    }
                    .padding(12)
                    .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
                    .padding(.horizontal)
                    .padding(.top, 8)
                    
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
                } else if filteredProfiles.isEmpty {
                    emptyState(icon: "person.2", title: searchText.isEmpty ? "No Profiles Yet" : "No Results", subtitle: searchText.isEmpty ? "Be the first to create a roommate profile!" : "Try a different search")
                } else {
                    ForEach(filteredProfiles) { profile in
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
                // Member Avatars (overlapping) - use orange gradient
                HStack(spacing: -12) {
                    ForEach(Array((group.members ?? []).prefix(3).enumerated()), id: \.offset) { index, member in
                        Circle()
                            .fill(
                                LinearGradient(
                                    colors: [Color.collegioOrange, Color.collegioOrangeDark],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )
                            .frame(width: 40, height: 40)
                            .overlay {
                                Text(member.firstName?.prefix(1) ?? "?")
                                    .font(.caption.bold())
                                    .foregroundStyle(.white)
                            }
                            .overlay(Circle().stroke(.white.opacity(0.3), lineWidth: 2))
                    }
                }
                
                Spacer()
                
                // Looking for badge - orange
                if let lookingFor = group.lookingFor {
                    HStack(spacing: 4) {
                        Text("\(lookingFor)")
                            .font(.subheadline.bold())
                        Image(systemName: "graduationcap.fill")
                            .font(.caption2)
                    }
                    .foregroundStyle(.white)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 5)
                    .background(Color.collegioOrange, in: Capsule())
                }
            }
            
            Text(group.name)
                .font(.headline)
            
            if let budget = group.budget?.max {
                Text("Budget: Up to $\(budget)/mo")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            
            // Lifestyle/preference tags - use dark/gray styling for non-vibe tags
            HStack(spacing: 8) {
                // Budget range - dark style
                if let budget = group.budget, let min = budget.min, let max = budget.max {
                    LifestyleTag(icon: "dollarsign.circle.fill", text: "$\(min)-\(max)", color: .secondary)
                }
            }
            
            // Vibe tags - orange styling
            if let vibes = group.vibe, !vibes.isEmpty {
                HStack(spacing: 8) {
                    ForEach(vibes.prefix(3), id: \.self) { vibe in
                        Text(vibe)
                            .font(.caption2.weight(.medium))
                            .foregroundStyle(Color.collegioOrange)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(Color.collegioOrange.opacity(0.12), in: Capsule())
                    }
                }
            }
        }
        .padding(16)
        .glassCard()
    }
}

// MARK: - Roommate Card (Redesigned)
struct RoommateCard: View {
    let profile: LifestyleProfile
    @Environment(\.colorScheme) private var colorScheme
    
    // Use consistent orange theming
    private var accentColor: Color {
        return Color.collegioOrange
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Top Section with Avatar and Name
            HStack(spacing: 14) {
                // Gradient Avatar
                ZStack {
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: [accentColor, accentColor.opacity(0.6)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 56, height: 56)
                    
                    Text(profile.user?.initials ?? "??")
                        .font(.title3.bold())
                        .foregroundStyle(.white)
                }
                
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text(profile.user?.fullName ?? "Anonymous")
                            .font(.headline)
                            .foregroundStyle(.primary)
                        
                        Spacer()
                        
                        // Age + School Badge
                        if let age = profile.age {
                            HStack(spacing: 4) {
                                Text("\(age)")
                                    .font(.subheadline.bold())
                                Image(systemName: "graduationcap.fill")
                                    .font(.caption2)
                            }
                            .foregroundStyle(.white)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 5)
                            .background(accentColor, in: Capsule())
                        }
                    }
                    
                    // Bio snippet
                    if let bio = profile.bio, !bio.isEmpty {
                        Text(bio)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                            .lineLimit(2)
                    }
                }
            }
            .padding(16)
            
            // Divider with gradient
            Rectangle()
                .fill(
                    LinearGradient(
                        colors: [accentColor.opacity(0.3), accentColor.opacity(0.1), .clear],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .frame(height: 2)
            
            // Bottom Section - Lifestyle Tags (use subtle dark/gray styling)
            HStack(spacing: 10) {
                // Sleep Time - dark styling
                if let sleep = profile.sleepTime {
                    LifestyleTag(icon: "bed.double.fill", text: sleep, color: .secondary)
                }
                
                // Noise Level - dark styling
                if let noise = profile.noiseLevel {
                    LifestyleTag(icon: "speaker.wave.2.fill", text: "\(noise)/10", color: .secondary)
                }
                
                // Cleanliness - dark styling
                if let clean = profile.cleanliness {
                    LifestyleTag(icon: "hands.and.sparkles.fill", text: "\(clean)/10", color: .secondary)
                }
                
                Spacer()
                
                // Message hint
                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundStyle(.tertiary)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            
            // Interests/Vibes (if available)
            if let vibes = profile.vibeTags, !vibes.isEmpty {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 6) {
                        ForEach(vibes.prefix(4), id: \.self) { vibe in
                            Text(vibe)
                                .font(.caption2.weight(.medium))
                                .foregroundStyle(accentColor)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(accentColor.opacity(0.12), in: Capsule())
                        }
                    }
                    .padding(.horizontal, 16)
                }
                .padding(.bottom, 12)
            }
        }
        .background {
            RoundedRectangle(cornerRadius: 16)
                .fill(.ultraThinMaterial)
                .overlay {
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(accentColor.opacity(0.2), lineWidth: 1)
                }
        }
    }
}

// MARK: - Lifestyle Tag Component
struct LifestyleTag: View {
    let icon: String
    let text: String
    let color: Color
    
    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: icon)
                .font(.caption2)
            Text(text)
                .font(.caption.weight(.medium))
        }
        .foregroundStyle(color)
        .padding(.horizontal, 8)
        .padding(.vertical, 5)
        .background(color.opacity(0.12), in: Capsule())
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
