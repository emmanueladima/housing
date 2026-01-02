import SwiftUI

struct RoommateDetailsView: View {
    let profile: LifestyleProfile
    @State private var isSaved = false
    @Environment(\.dismiss) private var dismiss
    @Environment(\.colorScheme) private var colorScheme
    
    // Adaptive text color
    private var textPrimary: Color { colorScheme == .dark ? .white : .primary }
    private var textSecondary: Color { colorScheme == .dark ? .white.opacity(0.7) : .secondary }
    
    var body: some View {
        ZStack {
            GradientBackground()
            
            ScrollView {
                VStack(spacing: 24) {
                    profileHeader
                    actionButtons
                    aboutSection
                    lifestyleSection
                    vibeTagsSection
                    budgetSection
                }
                .padding()
                .padding(.bottom, 40)
            }
        }
        .navigationTitle("Roommate Profile")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button(action: { /* Share */ }) {
                    Image(systemName: "square.and.arrow.up")
                        .foregroundStyle(Color.collegioOrange)
                }
            }
        }
    }
    
    // MARK: - Profile Header
    private var profileHeader: some View {
        VStack(spacing: 16) {
            ZStack(alignment: .bottomTrailing) {
                Circle()
                    .fill(Color.collegioOrange.opacity(0.2))
                    .frame(width: 120, height: 120)
                    .overlay {
                        if let imageUrl = profile.user?.profileImage, let url = URL(string: imageUrl) {
                            AsyncImage(url: url) { image in
                                image.resizable().aspectRatio(contentMode: .fill)
                            } placeholder: {
                                Text(profile.user?.initials ?? "??")
                                    .font(.largeTitle.bold())
                                    .foregroundStyle(Color.collegioOrange)
                            }
                            .frame(width: 116, height: 116)
                            .clipShape(Circle())
                        } else {
                            Text(profile.user?.initials ?? "??")
                                .font(.largeTitle.bold())
                                .foregroundStyle(Color.collegioOrange)
                        }
                    }
                
                Text("85%")
                    .font(.caption.bold())
                    .foregroundStyle(.white)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(Color.green, in: Capsule())
            }
            
            VStack(spacing: 4) {
                Text(profile.user?.fullName ?? "Anonymous")
                    .font(.title2.bold())
                    .foregroundStyle(textPrimary)
                
                if let age = profile.age {
                    Text("\(age) years old")
                        .font(.subheadline)
                        .foregroundStyle(textSecondary)
                }
            }
        }
        .padding(.vertical)
    }
    
    // MARK: - Action Buttons
    private var actionButtons: some View {
        HStack(spacing: 16) {
            Button(action: { /* Message */ }) {
                HStack(spacing: 8) {
                    Image(systemName: "message.fill")
                    Text("Message")
                }
                .font(.headline)
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(Color.collegioOrange, in: RoundedRectangle(cornerRadius: 14))
            }
            
            Button(action: {
                withAnimation { isSaved.toggle() }
            }) {
                HStack(spacing: 8) {
                    Image(systemName: isSaved ? "heart.fill" : "heart")
                    Text(isSaved ? "Saved" : "Save")
                }
                .font(.headline)
                .foregroundStyle(isSaved ? .red : textPrimary)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background {
                    RoundedRectangle(cornerRadius: 14)
                        .fill(colorScheme == .dark ? AnyShapeStyle(.ultraThinMaterial) : AnyShapeStyle(.regularMaterial))
                }
            }
        }
    }
    
    // MARK: - About Section
    private var aboutSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("About")
                .font(.headline)
                .foregroundStyle(textPrimary)
            
            Text(profile.bio ?? "No bio provided yet.")
                .font(.subheadline)
                .foregroundStyle(textSecondary)
                .lineLimit(5)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .glassCard()
    }
    
    // MARK: - Lifestyle Section
    private var lifestyleSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Lifestyle")
                .font(.headline)
                .foregroundStyle(textPrimary)
            
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                LifestyleItemAdaptive(icon: "sparkles", title: "Cleanliness", value: "\(profile.cleanliness ?? 5)/10")
                LifestyleItemAdaptive(icon: "moon.fill", title: "Sleep", value: profile.sleepTime ?? "Unknown")
                LifestyleItemAdaptive(icon: "speaker.wave.2.fill", title: "Noise", value: "\(profile.noiseLevel ?? 5)/10")
                LifestyleItemAdaptive(icon: "person.2.fill", title: "Guests", value: (profile.guestsFrequency ?? "sometimes").capitalized)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .glassCard()
    }
    
    // MARK: - Vibe Tags Section
    private var vibeTagsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Vibe")
                .font(.headline)
                .foregroundStyle(textPrimary)
            
            if let vibes = profile.vibeTags, !vibes.isEmpty {
                FlowLayout(spacing: 8) {
                    ForEach(vibes, id: \.self) { vibe in
                        Text(vibe)
                            .font(.caption.bold())
                            .foregroundStyle(Color.collegioOrange)
                            .padding(.horizontal, 14)
                            .padding(.vertical, 8)
                            .background(Color.collegioOrange.opacity(0.15), in: Capsule())
                    }
                }
            } else {
                Text("No vibe tags set")
                    .font(.subheadline)
                    .foregroundStyle(textSecondary)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .glassCard()
    }
    
    // MARK: - Budget Section
    private var budgetSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Budget")
                .font(.headline)
                .foregroundStyle(textPrimary)
            
            HStack {
                Image(systemName: "dollarsign.circle.fill")
                    .font(.title2)
                    .foregroundStyle(Color.collegioOrange)
                
                if let min = profile.budgetMin, let max = profile.budgetMax {
                    Text("$\(Int(min)) - $\(Int(max))/mo")
                        .font(.title3.bold())
                        .foregroundStyle(textPrimary)
                } else {
                    Text("Not specified")
                        .font(.subheadline)
                        .foregroundStyle(textSecondary)
                }
                
                Spacer()
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .glassCard()
    }
}

// MARK: - Lifestyle Item (Adaptive)
struct LifestyleItemAdaptive: View {
    let icon: String
    let title: String
    let value: String
    @Environment(\.colorScheme) private var colorScheme
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundStyle(Color.collegioOrange)
                .frame(width: 28)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.caption)
                    .foregroundStyle(colorScheme == .dark ? .white.opacity(0.6) : .secondary)
                Text(value)
                    .font(.subheadline.bold())
                    .foregroundStyle(colorScheme == .dark ? .white : .primary)
            }
            
            Spacer()
        }
        .padding(12)
        .background {
            RoundedRectangle(cornerRadius: 12)
                .fill(colorScheme == .dark ? AnyShapeStyle(.ultraThinMaterial.opacity(0.5)) : AnyShapeStyle(.regularMaterial))
        }
    }
}

#Preview {
    NavigationStack {
        RoommateDetailsView(profile: LifestyleProfile.sample)
    }
}
