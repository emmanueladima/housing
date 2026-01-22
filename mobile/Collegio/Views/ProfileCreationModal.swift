import SwiftUI

struct ProfileCreationModal: View {
    @Environment(\.dismiss) private var dismiss
    @State private var currentStep = 1
    @State private var isLoading = false
    
    // Form Data
    @State private var age = ""
    @State private var gender = ""
    @State private var major = ""
    @State private var bio = ""
    @State private var cleanliness: Double = 5
    @State private var noiseLevel: Double = 5
    @State private var bedtime: Double = 23
    @State private var wakeTime: Double = 8
    @State private var budgetMin: Double = 500
    @State private var budgetMax: Double = 1500
    @State private var selectedVibes: Set<String> = []
    @State private var guestFrequency: Double = 3
    @State private var hasPets = false
    @State private var petAllergies = false
    @State private var smoking = false
    @State private var drinking = false
    @State private var lookingForRoommate = true
    
    private let genderOptions = ["Male", "Female", "Non-binary", "Other", "Prefer not to say"]
    
    // Dynamic vibes from API (default fallback)
    @State private var vibeOptions = [
        "Chill", "Social", "Studious", "Party", "Quiet", "Artsy",
        "Outdoorsy", "Night Owl", "Early Bird", "Fitness", "Gamer", "Foodie",
        "Music Lover", "Movie Buff", "Pet Lover", "Traveler", "Homebody",
        "Clean Freak", "Minimalist", "Eco-Friendly"
    ]
    
    private let steps = [
        (num: 1, label: "Basics", icon: "person.fill", color: Color.collegioOrange),
        (num: 2, label: "Habits", icon: "moon.fill", color: Color.blue),
        (num: 3, label: "Vibe", icon: "face.smiling.fill", color: Color.purple),
        (num: 4, label: "Review", icon: "checkmark.circle.fill", color: Color.teal)
    ]
    
    var body: some View {
        NavigationStack {
            ZStack {
                GradientBackground()
                
                VStack(spacing: 0) {
                    // Step Indicator
                    stepIndicator
                    
                    // Content
                    TabView(selection: $currentStep) {
                        basicsStep.tag(1)
                        habitsStep.tag(2)
                        vibeStep.tag(3)
                        reviewStep.tag(4)
                    }
                    .tabViewStyle(.page(indexDisplayMode: .never))
                    .animation(.easeInOut, value: currentStep)
                    
                    // Navigation Buttons
                    navigationButtons
                }
            }
            .navigationTitle("Create Profile")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") { dismiss() }
                }
            }
        .task {
            await loadVibes()
        }
        }
    }
    
    // MARK: - Step Indicator
    private var stepIndicator: some View {
        HStack(spacing: 0) {
            ForEach(steps, id: \.num) { step in
                HStack(spacing: 8) {
                    ZStack {
                        Circle()
                            .fill(currentStep >= step.num ? step.color : Color(.systemGray5))
                            .frame(width: 32, height: 32)
                        
                        Image(systemName: step.icon)
                            .font(.caption.bold())
                            .foregroundStyle(currentStep >= step.num ? .white : .secondary)
                    }
                    
                    if step.num < 4 {
                        Rectangle()
                            .fill(currentStep > step.num ? step.color : Color(.systemGray5))
                            .frame(height: 2)
                    }
                }
            }
        }
        .padding()
    }
    
    // MARK: - Step 1: Basics
    private var basicsStep: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                Text("Let's Start with the Basics")
                    .font(.title2.bold())
                
                // Age & Gender
                HStack(spacing: 16) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Age").font(.subheadline.bold())
                        TextField("e.g. 21", text: $age)
                            .keyboardType(.numberPad)
                            .textFieldStyle(.plain)
                            .padding()
                            .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 12))
                    }
                    
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Gender").font(.subheadline.bold())
                        Menu {
                            ForEach(genderOptions, id: \.self) { option in
                                Button(option) { gender = option }
                            }
                        } label: {
                            HStack {
                                Text(gender.isEmpty ? "Select..." : gender)
                                    .foregroundStyle(gender.isEmpty ? .secondary : .primary)
                                Spacer()
                                Image(systemName: "chevron.down")
                                    .foregroundStyle(.secondary)
                            }
                            .padding()
                            .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 12))
                        }
                    }
                }
                
                // Major
                VStack(alignment: .leading, spacing: 8) {
                    Text("Major / Field of Study").font(.subheadline.bold())
                    TextField("e.g. Computer Science", text: $major)
                        .textFieldStyle(.plain)
                        .padding()
                        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 12))
                }
                
                // Bio
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Text("Bio").font(.subheadline.bold())
                        Spacer()
                        Text("\(bio.count)/200")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    TextEditor(text: $bio)
                        .frame(minHeight: 100)
                        .scrollContentBackground(.hidden)
                        .padding()
                        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 12))
                        .onChange(of: bio) { _, newValue in
                            if newValue.count > 200 {
                                bio = String(newValue.prefix(200))
                            }
                        }
                }
                
                // Actively Looking
                Toggle(isOn: $lookingForRoommate) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Looking for a Roommate")
                            .font(.subheadline.bold())
                        Text("Show my profile to potential matches")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
                .tint(Color.collegioOrange)
            }
            .padding()
        }
    }
    
    // MARK: - Step 2: Habits
    private var habitsStep: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 28) {
                Text("Your Lifestyle Habits")
                    .font(.title2.bold())
                
                // Cleanliness
                SliderSection(
                    title: "Cleanliness",
                    icon: "sparkles",
                    value: $cleanliness,
                    range: 1...10,
                    step: 1,
                    labels: ["Relaxed", "Moderate", "Spotless"]
                )
                
                // Noise Level
                SliderSection(
                    title: "Noise Level",
                    icon: "speaker.wave.2.fill",
                    value: $noiseLevel,
                    range: 1...10,
                    step: 1,
                    labels: ["Silent", "Moderate", "Loud"]
                )
                
                // Sleep Schedule
                VStack(alignment: .leading, spacing: 16) {
                    Label("Sleep Schedule", systemImage: "moon.fill")
                        .font(.subheadline.bold())
                    
                    HStack {
                        VStack(alignment: .leading) {
                            Text("Bedtime")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                            Text("\(Int(bedtime)):00")
                                .font(.title3.bold())
                        }
                        
                        Slider(value: $bedtime, in: 20...28, step: 1)
                            .tint(Color.collegioOrange)
                        
                        VStack(alignment: .trailing) {
                            Text("Wake Up")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                            Text("\(Int(wakeTime)):00")
                                .font(.title3.bold())
                        }
                    }
                    
                    Slider(value: $wakeTime, in: 5...12, step: 1)
                        .tint(Color.collegioOrange)
                }
                .padding()
                .glassCard()
                
                // Guest Frequency
                SliderSection(
                    title: "Guest Frequency",
                    icon: "person.2.fill",
                    value: $guestFrequency,
                    range: 1...5,
                    step: 1,
                    labels: ["Never", "Sometimes", "Often"]
                )
                
                // Budget
                VStack(alignment: .leading, spacing: 16) {
                    Label("Budget Range", systemImage: "dollarsign.circle.fill")
                        .font(.subheadline.bold())
                    
                    HStack {
                        Text("$\(Int(budgetMin))")
                        Spacer()
                        Text("$\(Int(budgetMax))")
                    }
                    .font(.title3.bold())
                    
                    // Note: SwiftUI doesn't have a native range slider, using two sliders
                    VStack(spacing: 8) {
                        Slider(value: $budgetMin, in: 0...2000, step: 50)
                        Slider(value: $budgetMax, in: 0...3000, step: 50)
                    }
                    .tint(Color.collegioOrange)
                }
                .padding()
                .glassCard()
            }
            .padding()
        }
    }
    
    // MARK: - Step 3: Vibe
    private var vibeStep: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                Text("What's Your Vibe?")
                    .font(.title2.bold())
                
                Text("Select tags that describe you")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                
                FlowLayout(spacing: 10) {
                    ForEach(vibeOptions, id: \.self) { vibe in
                        Button(action: {
                            if selectedVibes.contains(vibe) {
                                selectedVibes.remove(vibe)
                            } else {
                                selectedVibes.insert(vibe)
                            }
                        }) {
                            Text(vibe)
                                .font(.subheadline.weight(.medium))
                                .foregroundStyle(selectedVibes.contains(vibe) ? .white : .primary)
                                .padding(.horizontal, 16)
                                .padding(.vertical, 10)
                                .background(
                                    selectedVibes.contains(vibe) ? Color.collegioOrange : Color(.systemGray6),
                                    in: Capsule()
                                )
                        }
                        .buttonStyle(.plain)
                    }
                }
                
                Divider()
                    .padding(.vertical)
                
                // Lifestyle Toggles
                VStack(spacing: 16) {
                    ModalToggleRow(label: "I have pets", icon: "pawprint.fill", isOn: $hasPets)
                    ModalToggleRow(label: "Pet allergies", icon: "allergens", isOn: $petAllergies)
                    ModalToggleRow(label: "Smoker", icon: "smoke.fill", isOn: $smoking)
                    ModalToggleRow(label: "Social drinker", icon: "wineglass.fill", isOn: $drinking)
                }
            }
            .padding()
        }
    }
    
    // MARK: - Step 4: Review
    private var reviewStep: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                Text("Review Your Profile")
                    .font(.title2.bold())
                
                // Summary Card
                VStack(alignment: .leading, spacing: 16) {
                    HStack {
                        Circle()
                            .fill(Color.collegioOrange.opacity(0.2))
                            .frame(width: 60, height: 60)
                            .overlay {
                                Image(systemName: "person.fill")
                                    .font(.title2)
                                    .foregroundStyle(Color.collegioOrange)
                            }
                        
                        VStack(alignment: .leading) {
                            Text("\(age.isEmpty ? "?" : age) • \(gender.isEmpty ? "Not set" : gender)")
                                .font(.headline)
                            Text(major.isEmpty ? "No major set" : major)
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }
                    }
                    
                    if !bio.isEmpty {
                        Text(bio)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    
                    Divider()
                    
                    reviewRow(icon: "sparkles", label: "Cleanliness", value: "\(Int(cleanliness))/10")
                    reviewRow(icon: "speaker.wave.2.fill", label: "Noise Level", value: "\(Int(noiseLevel))/10")
                    reviewRow(icon: "moon.fill", label: "Sleep", value: "\(Int(bedtime)):00 - \(Int(wakeTime)):00")
                    reviewRow(icon: "dollarsign.circle.fill", label: "Budget", value: "$\(Int(budgetMin)) - $\(Int(budgetMax))")
                    
                    if !selectedVibes.isEmpty {
                        Divider()
                        
                        Text("Vibes")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                        
                        FlowLayout(spacing: 6) {
                            ForEach(Array(selectedVibes), id: \.self) { vibe in
                                Text(vibe)
                                    .font(.caption.bold())
                                    .foregroundStyle(Color.collegioOrange)
                                    .padding(.horizontal, 10)
                                    .padding(.vertical, 5)
                                    .background(Color.collegioOrange.opacity(0.15), in: Capsule())
                            }
                        }
                    }
                }
                .padding()
                .glassCard()
            }
            .padding()
        }
    }
    
    private func reviewRow(icon: String, label: String, value: String) -> some View {
        HStack {
            Image(systemName: icon)
                .foregroundStyle(Color.collegioOrange)
                .frame(width: 24)
            Text(label)
                .foregroundStyle(.secondary)
            Spacer()
            Text(value)
                .fontWeight(.medium)
        }
        .font(.subheadline)
    }
    
    // MARK: - Navigation Buttons
    private var navigationButtons: some View {
        HStack(spacing: 16) {
            if currentStep > 1 {
                Button(action: { withAnimation { currentStep -= 1 } }) {
                    HStack {
                        Image(systemName: "arrow.left")
                        Text("Back")
                    }
                    .font(.headline)
                    .foregroundStyle(.primary)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 14))
                }
            }
            
            Button(action: {
                if currentStep < 4 {
                    withAnimation { currentStep += 1 }
                } else {
                    saveProfile()
                }
            }) {
                HStack {
                    Text(currentStep == 4 ? "Save Profile" : "Next")
                    if currentStep < 4 {
                        Image(systemName: "arrow.right")
                    }
                }
                .font(.headline)
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(Color.collegioOrange, in: RoundedRectangle(cornerRadius: 14))
            }
        }
        .padding()
    }
    
    private func saveProfile() {
        isLoading = true
        // TODO: Implement API call to save profile
        dismiss()
    }
    
    private func loadVibes() async {
        do {
            let vibes = try await APIService.shared.getVibeTags()
            if !vibes.isEmpty {
                vibeOptions = vibes
            }
        } catch {
            print("⚠️ Failed to load vibes in modal: \(error)")
        }
    }
}

// MARK: - Slider Section
struct SliderSection: View {
    let title: String
    let icon: String
    @Binding var value: Double
    let range: ClosedRange<Double>
    let step: Double
    let labels: [String]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Label(title, systemImage: icon)
                    .font(.subheadline.bold())
                Spacer()
                Text("\(Int(value))")
                    .font(.title3.bold())
                    .foregroundStyle(Color.collegioOrange)
            }
            
            Slider(value: $value, in: range, step: step)
                .tint(Color.collegioOrange)
            
            HStack {
                ForEach(labels, id: \.self) { label in
                    if label == labels.first {
                        Text(label).font(.caption).foregroundStyle(.secondary)
                    }
                    if label != labels.first && label != labels.last {
                        Spacer()
                        Text(label).font(.caption).foregroundStyle(.secondary)
                    }
                    if label == labels.last {
                        Spacer()
                        Text(label).font(.caption).foregroundStyle(.secondary)
                    }
                }
            }
        }
        .padding()
        .glassCard()
    }
}

// MARK: - Modal Toggle Row
struct ModalToggleRow: View {
    let label: String
    let icon: String
    @Binding var isOn: Bool
    
    var body: some View {
        Toggle(isOn: $isOn) {
            Label(label, systemImage: icon)
                .font(.subheadline)
        }
        .tint(Color.collegioOrange)
        .padding()
        .glassCard()
    }
}

#Preview {
    ProfileCreationModal()
}
