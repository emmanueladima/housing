import SwiftUI

struct SavedListingsView: View {
    @State private var selectedTab = 0
    @State private var savedListings: [Listing] = []
    @State private var savedRoommates: [LifestyleProfile] = []
    @State private var isLoading = true
    
    var body: some View {
        ZStack {
            GradientBackground()
            
            VStack(spacing: 0) {
                // Segmented Control
                Picker("Saved Items", selection: $selectedTab) {
                    Text("Listings").tag(0)
                    Text("Roommates").tag(1)
                }
                .pickerStyle(.segmented)
                .padding()
                
                // Content
                if isLoading {
                    Spacer()
                    ProgressView("Loading...")
                    Spacer()
                } else {
                    TabView(selection: $selectedTab) {
                        listingsTab.tag(0)
                        roommatesTab.tag(1)
                    }
                    .tabViewStyle(.page(indexDisplayMode: .never))
                }
            }
        }
        .navigationTitle("Saved")
        .navigationBarTitleDisplayMode(.large)
        .task {
            await loadSavedItems()
        }
    }
    
    // MARK: - Listings Tab
    private var listingsTab: some View {
        Group {
            if savedListings.isEmpty {
                VStack(spacing: 16) {
                    Image(systemName: "heart.slash")
                        .font(.system(size: 48))
                        .foregroundStyle(.secondary)
                    
                    Text("No Saved Listings")
                        .font(.title2.bold())
                    
                    Text("Listings you save will appear here")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else {
                ScrollView {
                    LazyVStack(spacing: 16) {
                        ForEach(savedListings) { listing in
                            ListingCard(listing: listing)
                        }
                    }
                    .padding()
                    .padding(.bottom, 100)
                }
            }
        }
    }
    
    // MARK: - Roommates Tab
    private var roommatesTab: some View {
        Group {
            if savedRoommates.isEmpty {
                VStack(spacing: 16) {
                    Image(systemName: "person.2.slash")
                        .font(.system(size: 48))
                        .foregroundStyle(.secondary)
                    
                    Text("No Saved Roommates")
                        .font(.title2.bold())
                    
                    Text("Roommate profiles you save will appear here")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else {
                ScrollView {
                    LazyVStack(spacing: 16) {
                        ForEach(savedRoommates) { profile in
                            SavedRoommateCard(profile: profile)
                        }
                    }
                    .padding()
                    .padding(.bottom, 100)
                }
            }
        }
    }
    
    private func loadSavedItems() async {
        // TODO: Implement API calls to fetch saved listings and roommates
        try? await Task.sleep(nanoseconds: 500_000_000)
        isLoading = false
        // For now, show empty states
    }
}

// MARK: - Saved Roommate Card
struct SavedRoommateCard: View {
    let profile: LifestyleProfile
    @State private var isSaved = true
    
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
                    
                    Button(action: {
                        withAnimation {
                            isSaved.toggle()
                        }
                    }) {
                        Image(systemName: isSaved ? "heart.fill" : "heart")
                            .foregroundStyle(isSaved ? .red : .secondary)
                    }
                }
                
                if let bio = profile.bio {
                    Text(bio)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .lineLimit(2)
                }
                
                // Tags
                HStack(spacing: 8) {
                    if let vibes = profile.vibeTags, !vibes.isEmpty {
                        ForEach(vibes.prefix(3), id: \.self) { vibe in
                            Text(vibe)
                                .font(.caption)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(.ultraThinMaterial, in: Capsule())
                        }
                    }
                }
            }
        }
        .padding(16)
        .glassCard()
    }
}

#Preview {
    NavigationStack {
        SavedListingsView()
    }
}
