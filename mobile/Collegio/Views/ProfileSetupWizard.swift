import SwiftUI

struct ProfileSetupWizard: View {
    @Environment(\.dismiss) private var dismiss
    @StateObject private var authManager = AuthManager.shared
    @State private var currentStep = 1
    @State private var isLoading = false
    @State private var isLoadingProfile = true
    @State private var errorMessage: String?
    
    // Existing profile (for editing)
    @State private var existingProfile: LifestyleProfile?
    
    // Form Data
    @State private var age = ""
    @State private var gender = ""
    @State private var major = ""
    @State private var bio = ""
    @State private var cleanliness: Double = 5
    @State private var noiseLevel: Double = 5
    @State private var bedtime: Double = 23
    @State private var wakeTime: Double = 8
    @State private var budgetMin: Double = 400
    @State private var budgetMax: Double = 1000
    @State private var selectedVibes: Set<String> = []
    @State private var hasPets = false
    @State private var petAllergies = false
    @State private var smoking = false
    @State private var drinking = false
    @State private var lookingForRoommate = false
    
    private let genderOptions = ["Male", "Female", "Non-binary", "Prefer not to say"]
    
    // Same vibes as website
    // Dynamic vibes from API (default fallback)
    @State private var vibesOptions = [
        "Chill", "Social", "Studious", "Party", "Quiet", "Artsy",
        "Outdoorsy", "Night Owl", "Early Bird", "Fitness", "Gamer", "Foodie",
        "Music Lover", "Movie Buff", "Pet Lover", "Traveler", "Homebody",
        "Clean Freak", "Minimalist", "Eco-Friendly", "Spiritual", "Adventurous"
    ]
    
    // Major options for dropdown
    private let majorOptions = [
        "Computer Science", "Engineering", "Business", "Biology", "Psychology",
        "Communications", "Nursing", "Education", "Arts", "Mathematics",
        "Economics", "Political Science", "Chemistry", "Physics", "English",
        "History", "Sociology", "Marketing", "Finance", "Management",
        "Environmental Science", "Architecture", "Music", "Theater", "Other"
    ]
    
    // Beige background color matching app
    private let beigeBackground = Color(red: 0.894, green: 0.886, blue: 0.867)
    
    var body: some View {
        ZStack {
            // Beige background matching app
            beigeBackground
                .ignoresSafeArea()
            
            if isLoadingProfile {
                VStack {
                    ProgressView("Loading profile...")
                        .tint(Color.collegioOrange)
                }
            } else {
                VStack(spacing: 0) {
                    // Header with close button
                    HStack {
                        Button { dismiss() } label: {
                            Image(systemName: "xmark")
                                .font(.title3)
                                .foregroundStyle(.gray)
                        }
                        Spacer()
                    }
                    .padding(.horizontal)
                    .padding(.top, 10)
                    
                    // CollegioLogo at top
                    Image("CollegioLogo")
                        .resizable()
                        .scaledToFit()
                        .frame(height: 50)
                        .padding(.top, 10)
                    
                    // Progress Header
                    progressHeader
                        .padding(.top, 12)
                    
                    // Step Content
                    ScrollView {
                        VStack(spacing: 24) {
                            stepContent
                        }
                        .padding(24)
                        .padding(.bottom, 100)
                    }
                    
                    // Navigation Buttons
                    navigationButtons
                }
            }
        }
        .task {
            await loadVibes()
            await loadExistingProfile()
        }
    }
    
    // MARK: - Load Existing Profile
    private func loadExistingProfile() async {
        isLoadingProfile = true
        do {
            let profile = try await APIService.shared.getMyLifestyleProfile()
            existingProfile = profile
            
            // Pre-fill form fields
            if let profileAge = profile.age {
                age = String(profileAge)
            }
            if let profileGender = profile.gender {
                gender = profileGender.capitalized
            }
            if let profileBio = profile.bio {
                bio = profileBio
            }
            if let c = profile.cleanliness {
                cleanliness = Double(c)
            }
            if let n = profile.noiseLevel {
                noiseLevel = Double(n)
            }
            if let bMin = profile.budgetMin {
                budgetMin = bMin
            }
            if let bMax = profile.budgetMax {
                budgetMax = bMax
            }
            if let vibes = profile.vibeTags {
                selectedVibes = Set(vibes)
            }
            hasPets = profile.hasPets ?? false
            petAllergies = profile.petAllergies ?? false
            smoking = profile.smoking == "regular" || profile.smoking == "occasional"
            drinking = profile.drinking ?? false
            lookingForRoommate = profile.lookingForRoommate ?? false
            
            // Parse sleep/wake times
            if let sleep = profile.sleepTime, let hour = Int(sleep.prefix(2)) {
                bedtime = Double(hour)
            }
            if let wake = profile.wakeTime, let hour = Int(wake.prefix(2)) {
                wakeTime = Double(hour)
            }
            
            print("✅ Loaded existing profile for editing")
        } catch {
            // No existing profile, start fresh
            print("ℹ️ No existing profile, starting fresh: \(error)")
        }
        isLoadingProfile = false
    }

    private func loadVibes() async {
        do {
            let vibes = try await APIService.shared.getVibeTags()
            if !vibes.isEmpty {
                vibesOptions = vibes
                print("✅ Loaded \(vibes.count) dynamic vibe tags")
            }
        } catch {
            print("⚠️ Failed to load dynamic vibes: \(error). Using defaults.")
        }
    }
    
    // MARK: - Progress Header
    private var progressHeader: some View {
        VStack(spacing: 12) {
            Text("Create Your Profile")
                .font(.title2.bold())
                .foregroundStyle(Color.black)
            
            HStack(spacing: 8) {
                ForEach(1...4, id: \.self) { step in
                    VStack(spacing: 4) {
                        ZStack {
                            Circle()
                                .fill(step <= currentStep ? Color.collegioOrange : Color(white: 0.75))
                                .frame(width: 32, height: 32)
                            
                            if step < currentStep {
                                Image(systemName: "checkmark")
                                    .font(.caption.bold())
                                    .foregroundStyle(.white)
                            } else {
                                Text("\(step)")
                                    .font(.caption.bold())
                                    .foregroundStyle(step <= currentStep ? .white : Color(white: 0.4))
                            }
                        }
                        
                        Text(stepLabel(for: step))
                            .font(.caption2)
                            .foregroundStyle(step <= currentStep ? Color.black : Color(white: 0.5))
                    }
                    
                    if step < 4 {
                        Rectangle()
                            .fill(step < currentStep ? Color.collegioOrange : Color(white: 0.75))
                            .frame(height: 2)
                            .frame(maxWidth: 30)
                            .padding(.bottom, 16)
                    }
                }
            }
            .padding(.horizontal, 20)
        }
    }
    
    private func stepLabel(for step: Int) -> String {
        switch step {
        case 1: return "Basics"
        case 2: return "Habits"
        case 3: return "Vibe"
        case 4: return "Review"
        default: return ""
        }
    }
    
    // MARK: - Step Content
    @ViewBuilder
    private var stepContent: some View {
        switch currentStep {
        case 1: basicsStep
        case 2: habitsStep
        case 3: vibeStep
        case 4: reviewStep
        default: EmptyView()
        }
    }
    
    // MARK: - Step 1: Basics
    private var basicsStep: some View {
        VStack(alignment: .leading, spacing: 20) {
            VStack(alignment: .leading, spacing: 8) {
                Label("Age", systemImage: "person.fill")
                    .font(.subheadline.bold())
                    .foregroundStyle(Color.black)
                
                TextField("", text: $age, prompt: Text("Your age").foregroundStyle(Color(white: 0.5)))
                    .keyboardType(.numberPad)
                    .foregroundStyle(Color.black)
                    .padding()
                    .background(Color.white)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                    .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color(white: 0.8), lineWidth: 1))
            }
            
            // Gender - Dropdown Menu
            VStack(alignment: .leading, spacing: 8) {
                Label("Gender", systemImage: "person.2.fill")
                    .font(.subheadline.bold())
                    .foregroundStyle(Color.black)
                
                Menu {
                    ForEach(genderOptions, id: \.self) { option in
                        Button(option) { gender = option }
                    }
                } label: {
                    HStack {
                        Text(gender.isEmpty ? "Select gender..." : gender)
                            .foregroundStyle(gender.isEmpty ? Color(white: 0.45) : Color.black)
                        Spacer()
                        Image(systemName: "chevron.down")
                            .foregroundStyle(Color.collegioOrange)
                    }
                    .padding()
                    .background(Color.white)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                    .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color(white: 0.8), lineWidth: 1))
                }
            }
            
            // Major - Dropdown like website
            VStack(alignment: .leading, spacing: 8) {
                Label("Major", systemImage: "book.fill")
                    .font(.subheadline.bold())
                    .foregroundStyle(Color.black)
                
                Menu {
                    ForEach(majorOptions, id: \.self) { option in
                        Button(option) { major = option }
                    }
                } label: {
                    HStack {
                        Text(major.isEmpty ? "Select your major..." : major)
                            .foregroundStyle(major.isEmpty ? Color(white: 0.45) : Color.black)
                        Spacer()
                        Image(systemName: "chevron.down")
                            .foregroundStyle(Color.collegioOrange)
                    }
                    .padding()
                    .background(Color.white)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                    .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color(white: 0.8), lineWidth: 1))
                }
            }
            
            // Bio
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Label("Bio", systemImage: "text.alignleft")
                        .font(.subheadline.bold())
                        .foregroundStyle(Color.black)
                    Spacer()
                    Text("\(bio.count)/200")
                        .font(.caption)
                        .foregroundStyle(Color(white: 0.5))
                }
                
                TextEditor(text: $bio)
                    .frame(height: 100)
                    .padding(12)
                    .scrollContentBackground(.hidden)
                    .background(Color.white)
                    .foregroundStyle(Color.black)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                    .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color(white: 0.8), lineWidth: 1))
                    .onChange(of: bio) { _, newValue in
                        if newValue.count > 200 { bio = String(newValue.prefix(200)) }
                    }
            }
        }
    }
    
    // MARK: - Step 2: Habits
    private var habitsStep: some View {
        VStack(alignment: .leading, spacing: 24) {
            // Cleanliness
            HighContrastSliderCard(title: "Cleanliness", icon: "sparkles", value: $cleanliness, range: 1...10, leftLabel: "Relaxed", rightLabel: "Spotless")
            
            // Noise Level
            HighContrastSliderCard(title: "Noise Tolerance", icon: "speaker.wave.2.fill", value: $noiseLevel, range: 1...10, leftLabel: "Quiet", rightLabel: "Loud OK")
            
            // Sleep Schedule - Circular Dial
            CircularSleepDial(bedtime: $bedtime, wakeTime: $wakeTime)
            
            // Budget Range - Dual Handle Slider
            RangeSliderCard(
                title: "Budget Range",
                icon: "dollarsign.circle.fill",
                lowValue: $budgetMin,
                highValue: $budgetMax,
                range: 200...3000,
                step: 50,
                prefix: "$",
                suffix: ""
            )
        }
    }
    
    private func formatTime(_ hour: Double) -> String {
        let h = Int(hour) % 24
        let ampm = h >= 12 ? "PM" : "AM"
        let displayHour = h > 12 ? h - 12 : (h == 0 ? 12 : h)
        return "\(displayHour):00 \(ampm)"
    }
    
    // MARK: - Step 3: Vibe
    private var vibeStep: some View {
        VStack(alignment: .leading, spacing: 20) {
            // Vibes Selection
            VStack(alignment: .leading, spacing: 12) {
                Label("Your Vibe (select all that apply)", systemImage: "sparkle")
                    .font(.subheadline.bold())
                    .foregroundStyle(Color.black)
                
                FlowLayout(spacing: 10) {
                    ForEach(vibesOptions, id: \.self) { vibe in
                        Button {
                            if selectedVibes.contains(vibe) {
                                selectedVibes.remove(vibe)
                            } else {
                                selectedVibes.insert(vibe)
                            }
                        } label: {
                            Text(vibe)
                                .font(.subheadline)
                                .padding(.horizontal, 14)
                                .padding(.vertical, 8)
                                .background(selectedVibes.contains(vibe) ? Color.collegioOrange : Color.white)
                                .foregroundStyle(selectedVibes.contains(vibe) ? .white : Color.black)
                                .clipShape(Capsule())
                                .overlay(Capsule().stroke(selectedVibes.contains(vibe) ? Color.clear : Color(white: 0.8), lineWidth: 1))
                        }
                    }
                }
            }
            
            Divider()
            
            // Lifestyle Toggles
            VStack(spacing: 12) {
                HighContrastToggleRow(title: "I have pets", icon: "pawprint.fill", isOn: $hasPets)
                HighContrastToggleRow(title: "I have pet allergies", icon: "allergens", isOn: $petAllergies)
                HighContrastToggleRow(title: "I smoke", icon: "smoke.fill", isOn: $smoking)
                HighContrastToggleRow(title: "I drink socially", icon: "wineglass.fill", isOn: $drinking)
                HighContrastToggleRow(title: "Looking for roommate", icon: "person.2.fill", isOn: $lookingForRoommate)
            }
        }
    }
    
    // MARK: - Step 4: Review
    private var reviewStep: some View {
        VStack(alignment: .leading, spacing: 20) {
            Text("Review Your Profile")
                .font(.headline)
                .foregroundStyle(Color.black)
            
            // Basics
            HighContrastReviewSection(title: "Basics") {
                HighContrastReviewRow(label: "Age", value: age.isEmpty ? "Not set" : age)
                HighContrastReviewRow(label: "Gender", value: gender.isEmpty ? "Not set" : gender)
                HighContrastReviewRow(label: "Major", value: major.isEmpty ? "Not set" : major)
            }
            
            // Habits
            HighContrastReviewSection(title: "Habits") {
                HighContrastReviewRow(label: "Cleanliness", value: "\(Int(cleanliness))/10")
                HighContrastReviewRow(label: "Noise Tolerance", value: "\(Int(noiseLevel))/10")
                HighContrastReviewRow(label: "Bedtime", value: formatTime(bedtime))
                HighContrastReviewRow(label: "Wake Time", value: formatTime(wakeTime))
                HighContrastReviewRow(label: "Budget", value: "$\(Int(budgetMin)) - $\(Int(budgetMax))")
            }
            
            // Vibe
            HighContrastReviewSection(title: "Vibe") {
                if selectedVibes.isEmpty {
                    Text("No vibes selected")
                        .font(.subheadline)
                        .foregroundStyle(Color(white: 0.5))
                } else {
                    FlowLayout(spacing: 6) {
                        ForEach(Array(selectedVibes), id: \.self) { vibe in
                            Text(vibe)
                                .font(.caption)
                                .padding(.horizontal, 10)
                                .padding(.vertical, 5)
                                .background(Color.collegioOrange.opacity(0.15))
                                .foregroundStyle(Color.collegioOrange)
                                .clipShape(Capsule())
                        }
                    }
                }
                
                HighContrastReviewRow(label: "Has Pets", value: hasPets ? "Yes" : "No")
                HighContrastReviewRow(label: "Pet Allergies", value: petAllergies ? "Yes" : "No")
                HighContrastReviewRow(label: "Smoking", value: smoking ? "Yes" : "No")
                HighContrastReviewRow(label: "Drinking", value: drinking ? "Yes" : "No")
                HighContrastReviewRow(label: "Looking for Roommate", value: lookingForRoommate ? "Yes" : "No")
            }
            
            // Error
            if let error = errorMessage {
                Text(error)
                    .font(.caption)
                    .foregroundStyle(.red)
                    .padding(12)
                    .background(Color.red.opacity(0.1))
                    .clipShape(RoundedRectangle(cornerRadius: 8))
            }
        }
    }
    
    // MARK: - Navigation Buttons
    private var navigationButtons: some View {
        HStack(spacing: 16) {
            if currentStep > 1 {
                Button {
                    withAnimation(.spring(response: 0.3)) {
                        currentStep -= 1
                    }
                } label: {
                    HStack {
                        Image(systemName: "arrow.left")
                        Text("Back")
                    }
                    .font(.headline)
                    .foregroundStyle(Color.collegioOrange)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .background(Color.white)
                    .clipShape(RoundedRectangle(cornerRadius: 14))
                    .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color.collegioOrange, lineWidth: 2))
                }
            }
            
            Button {
                if currentStep < 4 {
                    withAnimation(.spring(response: 0.3)) {
                        currentStep += 1
                    }
                } else {
                    Task { await submitProfile() }
                }
            } label: {
                HStack {
                    if isLoading {
                        ProgressView().tint(.white)
                    }
                    Text(currentStep == 4 ? "Complete" : "Next")
                    if currentStep < 4 {
                        Image(systemName: "arrow.right")
                    }
                }
                .font(.headline)
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(Color.collegioOrange)
                .clipShape(RoundedRectangle(cornerRadius: 14))
            }
            .disabled(isLoading)
        }
        .padding(20)
        .background(beigeBackground)
    }
    
    // MARK: - Submit
    private func submitProfile() async {
        isLoading = true
        errorMessage = nil
        
        // Format times as HH:00 (2-digit hours)
        let sleepHour = Int(bedtime) % 24
        let wakeHour = Int(wakeTime) % 24
        let sleepTimeFormatted = String(format: "%02d:00", sleepHour)
        let wakeTimeFormatted = String(format: "%02d:00", wakeHour)
        
        do {
            try await APIService.shared.createLifestyleProfile(
                age: Int(age) ?? 0,
                gender: gender,
                major: major,
                bio: bio,
                cleanliness: Int(cleanliness),
                noiseLevel: Int(noiseLevel),
                sleepTime: sleepTimeFormatted,
                wakeTime: wakeTimeFormatted,
                budgetMin: Int(budgetMin),
                budgetMax: Int(budgetMax),
                vibeTags: Array(selectedVibes),
                hasPets: hasPets,
                petAllergies: petAllergies,
                smoking: smoking,
                drinking: drinking,
                lookingForRoommate: lookingForRoommate
            )
            
            authManager.markProfileComplete()
            dismiss() // Close the wizard on success
        } catch {
            errorMessage = "Error: \(error.localizedDescription)"
            print("❌ Profile save error: \(error)")
        }
        
        isLoading = false
    }
}

// MARK: - High Contrast Slider Card
struct HighContrastSliderCard: View {
    let title: String
    let icon: String
    @Binding var value: Double
    let range: ClosedRange<Double>
    let leftLabel: String
    let rightLabel: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Label(title, systemImage: icon)
                    .font(.subheadline.bold())
                    .foregroundStyle(Color.black)
                Spacer()
                Text("\(Int(value))/\(Int(range.upperBound))")
                    .font(.headline)
                    .foregroundStyle(Color.collegioOrange)
            }
            
            Slider(value: $value, in: range, step: 1)
                .tint(Color.collegioOrange)
            
            HStack {
                Text(leftLabel)
                    .font(.caption)
                    .foregroundStyle(Color(white: 0.5))
                Spacer()
                Text(rightLabel)
                    .font(.caption)
                    .foregroundStyle(Color(white: 0.5))
            }
        }
        .padding()
        .background(Color.white)
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(Color(white: 0.85), lineWidth: 1))
    }
}

// MARK: - High Contrast Toggle Row
struct HighContrastToggleRow: View {
    let title: String
    let icon: String
    @Binding var isOn: Bool
    
    var body: some View {
        HStack {
            Image(systemName: icon)
                .foregroundStyle(Color.collegioOrange)
                .frame(width: 24)
            Text(title)
                .foregroundStyle(Color.black)
            Spacer()
            Toggle("", isOn: $isOn)
                .tint(Color.collegioOrange)
        }
        .padding()
        .background(Color.white)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color(white: 0.85), lineWidth: 1))
    }
}

// MARK: - High Contrast Review Section
struct HighContrastReviewSection<Content: View>: View {
    let title: String
    @ViewBuilder let content: Content
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.subheadline.bold())
                .foregroundStyle(Color.collegioOrange)
            
            VStack(alignment: .leading, spacing: 8) {
                content
            }
            .padding()
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color.white)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color(white: 0.85), lineWidth: 1))
        }
    }
}

// MARK: - High Contrast Review Row
struct HighContrastReviewRow: View {
    let label: String
    let value: String
    
    var body: some View {
        HStack {
            Text(label)
                .foregroundStyle(Color(white: 0.5))
            Spacer()
            Text(value)
                .fontWeight(.medium)
                .foregroundStyle(Color.black)
        }
        .font(.subheadline)
    }
}

// MARK: - Wizard TextField Modifier
extension View {
    func wizardTextField() -> some View {
        self
            .padding()
            .background(Color.white)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color(white: 0.85), lineWidth: 1))
    }
}

#Preview {
    ProfileSetupWizard()
}
