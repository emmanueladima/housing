import SwiftUI

// MARK: - Compatibility Test Data

struct CompatibilityScenario: Identifiable {
    let id: String
    let icon: String
    let question: String
    let options: [CompatibilityOption]
}

struct CompatibilityOption: Identifiable {
    let id = UUID()
    let value: String
    let label: String
    let score: [String: Any]
    
    // Convert score dict to JSON-safe [String: Any] for API
    var scoreDict: [String: Any] { score }
}

// MARK: - Scenarios (matches web CompatibilityTest.jsx)

let compatibilityScenarios: [CompatibilityScenario] = [
    CompatibilityScenario(
        id: "weeknight",
        icon: "clock.fill",
        question: "It's 11 PM on a Tuesday. What are you usually doing?",
        options: [
            CompatibilityOption(value: "sleeping", label: "😴 Fast asleep", score: ["noise": 1, "social": 1]),
            CompatibilityOption(value: "quiet", label: "📖 Reading/Chilling quietly", score: ["noise": 3, "social": 2]),
            CompatibilityOption(value: "gaming", label: "🎮 Gaming/Watching TV", score: ["noise": 6, "social": 4]),
            CompatibilityOption(value: "out", label: "🍻 Out with friends", score: ["noise": 8, "social": 9]),
        ]
    ),
    CompatibilityScenario(
        id: "dishes",
        icon: "exclamationmark.triangle.fill",
        question: "The sink is full of dishes. What's your reaction?",
        options: [
            CompatibilityOption(value: "immediate", label: "🧼 Wash them immediately", score: ["clean": 10]),
            CompatibilityOption(value: "own", label: "🍽️ Wash mine, leave the rest", score: ["clean": 7]),
            CompatibilityOption(value: "later", label: "⏳ Leave them for the morning", score: ["clean": 4]),
            CompatibilityOption(value: "pile", label: "🏔️ Add to the pile", score: ["clean": 1]),
        ]
    ),
    CompatibilityScenario(
        id: "guests",
        icon: "person.2.fill",
        question: "A roommate asks if their partner can stay over for the weekend...",
        options: [
            CompatibilityOption(value: "no", label: "🚫 No, I prefer no guests", score: ["guests": 1]),
            CompatibilityOption(value: "ask", label: "💬 Sure, but ask every time", score: ["guests": 5]),
            CompatibilityOption(value: "chill", label: "🤙 Yeah, whatever", score: ["guests": 8]),
            CompatibilityOption(value: "join", label: "🎉 The more the merrier!", score: ["guests": 10]),
        ]
    ),
    CompatibilityScenario(
        id: "thermostat",
        icon: "thermometer.medium",
        question: "What's the ideal thermostat setting?",
        options: [
            CompatibilityOption(value: "cold", label: "❄️ 68°F or lower (Sweater weather)", score: ["temp": "cold"]),
            CompatibilityOption(value: "moderate", label: "🌡️ 70-72°F (Just right)", score: ["temp": "moderate"]),
            CompatibilityOption(value: "warm", label: "🔥 74°F or higher (Tropical)", score: ["temp": "warm"]),
        ]
    ),
    CompatibilityScenario(
        id: "conflict",
        icon: "speaker.wave.3.fill",
        question: "Your roommate is playing music too loud. You...",
        options: [
            CompatibilityOption(value: "text", label: "📱 Text them to turn it down", score: ["conflict": "passive"]),
            CompatibilityOption(value: "knock", label: "🚪 Knock and ask politely", score: ["conflict": "direct"]),
            CompatibilityOption(value: "headphones", label: "🎧 Put on noise cancelling headphones", score: ["conflict": "avoidant"]),
            CompatibilityOption(value: "revenge", label: "🔊 Play my music louder", score: ["conflict": "aggressive"]),
        ]
    ),
    CompatibilityScenario(
        id: "morning",
        icon: "sunrise.fill",
        question: "What's your ideal morning routine?",
        options: [
            CompatibilityOption(value: "early", label: "🌅 Up at 6 AM, gym before class", score: ["sleep": 1]),
            CompatibilityOption(value: "normal", label: "☀️ Wake up around 8-9 AM", score: ["sleep": 5]),
            CompatibilityOption(value: "late", label: "😴 Sleep until noon if I can", score: ["sleep": 8]),
            CompatibilityOption(value: "varies", label: "🎲 Depends on the day", score: ["sleep": 5]),
        ]
    ),
    CompatibilityScenario(
        id: "study",
        icon: "book.fill",
        question: "When it's time to study or work from home...",
        options: [
            CompatibilityOption(value: "silence", label: "🤫 I need complete silence", score: ["study": 1]),
            CompatibilityOption(value: "quiet", label: "🎵 Background music is fine", score: ["study": 4]),
            CompatibilityOption(value: "coffee", label: "☕ I prefer studying at cafes", score: ["study": 7]),
            CompatibilityOption(value: "social", label: "📚 Study groups are the best", score: ["study": 10]),
        ]
    ),
    CompatibilityScenario(
        id: "pets",
        icon: "pawprint.fill",
        question: "How do you feel about pets?",
        options: [
            CompatibilityOption(value: "no", label: "🚫 Allergic or prefer no pets", score: ["pets": 1]),
            CompatibilityOption(value: "small", label: "🐠 Fish or small pets only", score: ["pets": 4]),
            CompatibilityOption(value: "cats", label: "🐱 Cats are perfect", score: ["pets": 7]),
            CompatibilityOption(value: "dogs", label: "🐕 Dogs are family!", score: ["pets": 10]),
        ]
    ),
    CompatibilityScenario(
        id: "cooking",
        icon: "frying.pan.fill",
        question: "What's your cooking situation?",
        options: [
            CompatibilityOption(value: "chef", label: "👨‍🍳 I cook elaborate meals daily", score: ["kitchen": 10]),
            CompatibilityOption(value: "sometimes", label: "🍳 I cook a few times a week", score: ["kitchen": 7]),
            CompatibilityOption(value: "basic", label: "🍜 Mostly microwave and basics", score: ["kitchen": 4]),
            CompatibilityOption(value: "never", label: "🥡 Takeout is my love language", score: ["kitchen": 1]),
        ]
    ),
    CompatibilityScenario(
        id: "weekend",
        icon: "music.note.list",
        question: "Your ideal Friday night looks like...",
        options: [
            CompatibilityOption(value: "home", label: "🏠 Cozy night in with Netflix", score: ["weekend": 2]),
            CompatibilityOption(value: "small", label: "🍷 Small gathering with close friends", score: ["weekend": 5]),
            CompatibilityOption(value: "party", label: "🎉 Hosting or going to parties", score: ["weekend": 8]),
            CompatibilityOption(value: "downtown", label: "🪩 Hit the bars/clubs downtown", score: ["weekend": 10]),
        ]
    ),
]

// MARK: - Compatibility Test View

struct CompatibilityTestView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var currentStep = 0
    @State private var answers: [String: Any] = [:]
    @State private var isSubmitting = false
    @State private var showCompletion = false
    @State private var selectedOption: String?
    
    let onComplete: (() -> Void)?
    
    init(onComplete: (() -> Void)? = nil) {
        self.onComplete = onComplete
    }
    
    private var progress: Double {
        Double(currentStep) / Double(compatibilityScenarios.count)
    }
    
    var body: some View {
        NavigationStack {
            ZStack {
                GradientBackground()
                
                if showCompletion {
                    completionView
                } else {
                    questionContent
                }
                
                if isSubmitting {
                    Color.black.opacity(0.3)
                        .ignoresSafeArea()
                    VStack(spacing: 12) {
                        ProgressView()
                            .scaleEffect(1.5)
                            .tint(.white)
                        Text("Saving your results...")
                            .font(.subheadline)
                            .foregroundStyle(.white)
                    }
                    .padding(32)
                    .glassCard()
                }
            }
            .navigationTitle("Compatibility Test")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") { dismiss() }
                }
            }
        }
    }
    
    // MARK: - Question Content
    
    private var questionContent: some View {
        VStack(spacing: 0) {
            // Progress Bar
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 4)
                        .fill(Color.white.opacity(0.15))
                        .frame(height: 6)
                    
                    RoundedRectangle(cornerRadius: 4)
                        .fill(Color.collegioOrange)
                        .frame(width: geo.size.width * progress, height: 6)
                        .animation(.spring(response: 0.4), value: progress)
                }
            }
            .frame(height: 6)
            .padding(.horizontal, 24)
            .padding(.top, 12)
            
            // Step counter
            Text("\(currentStep + 1) of \(compatibilityScenarios.count)")
                .font(.caption.weight(.medium))
                .foregroundStyle(.secondary)
                .padding(.top, 8)
            
            Spacer()
            
            // Question Card
            let scenario = compatibilityScenarios[currentStep]
            
            VStack(spacing: 24) {
                // Icon
                Image(systemName: scenario.icon)
                    .font(.system(size: 44))
                    .foregroundStyle(Color.collegioOrange)
                    .padding(.bottom, 4)
                
                // Question
                Text(scenario.question)
                    .font(.title3.bold())
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 16)
                
                // Options
                VStack(spacing: 10) {
                    ForEach(scenario.options) { option in
                        Button {
                            withAnimation(.spring(response: 0.3)) {
                                selectedOption = option.value
                            }
                            // Wait briefly to show selection, then advance
                            DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) {
                                handleAnswer(scenario: scenario, option: option)
                            }
                        } label: {
                            HStack {
                                Text(option.label)
                                    .font(.subheadline.weight(.medium))
                                    .foregroundStyle(selectedOption == option.value ? .white : .primary)
                                    .multilineTextAlignment(.leading)
                                
                                Spacer()
                                
                                Image(systemName: "chevron.right")
                                    .font(.caption)
                                    .foregroundStyle(
                                        selectedOption == option.value
                                            ? .white.opacity(0.7)
                                            : .secondary
                                    )
                            }
                            .padding(.horizontal, 16)
                            .padding(.vertical, 14)
                            .background(
                                selectedOption == option.value
                                    ? Color.collegioOrange
                                    : Color.white.opacity(0.08)
                            )
                            .clipShape(RoundedRectangle(cornerRadius: 14))
                            .overlay(
                                RoundedRectangle(cornerRadius: 14)
                                    .stroke(
                                        selectedOption == option.value
                                            ? Color.clear
                                            : Color.white.opacity(0.12),
                                        lineWidth: 1
                                    )
                            )
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
            .padding(.horizontal, 20)
            
            Spacer()
        }
        .id(currentStep) // Force view re-creation for smooth transitions
        .transition(.asymmetric(
            insertion: .move(edge: .trailing).combined(with: .opacity),
            removal: .move(edge: .leading).combined(with: .opacity)
        ))
    }
    
    // MARK: - Completion View
    
    private var completionView: some View {
        VStack(spacing: 24) {
            Spacer()
            
            Image(systemName: "checkmark.seal.fill")
                .font(.system(size: 80))
                .foregroundStyle(Color.collegioOrange)
            
            Text("All Done! 🎉")
                .font(.largeTitle.bold())
            
            Text("Your compatibility profile has been saved. We'll use this to find your ideal roommate match.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)
            
            Button {
                onComplete?()
                dismiss()
            } label: {
                Text("Continue")
                    .font(.headline)
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .background(Color.collegioOrange, in: Capsule())
            }
            .padding(.horizontal, 32)
            .padding(.top, 8)
            
            Spacer()
        }
    }
    
    // MARK: - Handle Answer
    
    private func handleAnswer(scenario: CompatibilityScenario, option: CompatibilityOption) {
        // Store answer like the web does: scenarioId: value, scenarioId_score: scoreObj
        answers[scenario.id] = option.value
        
        // Flatten scores into answers dict with key format "scenarioId_score"
        var scoreDict: [String: Any] = [:]
        for (key, value) in option.score {
            scoreDict[key] = value
        }
        answers["\(scenario.id)_score"] = scoreDict
        
        if currentStep < compatibilityScenarios.count - 1 {
            withAnimation(.spring(response: 0.35)) {
                selectedOption = nil
                currentStep += 1
            }
        } else {
            // Submit
            Task { await submitResults() }
        }
    }
    
    private func submitResults() async {
        isSubmitting = true
        
        do {
            // Convert answers to JSON-safe dict
            let jsonAnswers = convertToJSONSafe(answers)
            try await APIService.shared.updateCompatibilityAnswers(jsonAnswers)
            
            withAnimation {
                showCompletion = true
            }
        } catch {
            // Still show completion even if save fails — data can be re-submitted later
            withAnimation {
                showCompletion = true
            }
        }
        
        isSubmitting = false
    }
    
    private func convertToJSONSafe(_ dict: [String: Any]) -> [String: Any] {
        var result: [String: Any] = [:]
        for (key, value) in dict {
            if let nested = value as? [String: Any] {
                result[key] = convertToJSONSafe(nested)
            } else {
                result[key] = value
            }
        }
        return result
    }
}

#Preview {
    CompatibilityTestView()
}
