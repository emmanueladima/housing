import SwiftUI

// MARK: - Create Post View (Full Multi-Step Form like Website)
struct CreatePostView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var step = 1
    @State private var isLoading = false
    
    // Form Data
    @State private var selectedChannel: PostChannel?
    @State private var selectedIntent: PostIntent?
    @State private var title = ""
    @State private var postDescription = ""
    @State private var price = ""
    @State private var budgetMin = ""
    @State private var budgetMax = ""
    @State private var location = ""
    @State private var tags: [String] = []
    @State private var tagInput = ""
    
    var body: some View {
        NavigationStack {
            ZStack {
                GradientBackground()
                
                VStack(spacing: 0) {
                    // Progress Bar
                    progressBar
                    
                    // Content
                    ScrollView {
                        VStack(spacing: 24) {
                            if step == 1 {
                                channelSelectionStep
                            } else if step == 2 {
                                detailsStep
                            } else {
                                previewStep
                            }
                        }
                        .padding()
                    }
                    
                    // Footer
                    footerButtons
                }
            }
            .navigationTitle(step == 1 ? "New Post" : step == 2 ? "Details" : "Preview")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") { dismiss() }
                }
            }
        }
    }
    
    // MARK: - Progress Bar
    private var progressBar: some View {
        HStack(spacing: 8) {
            ForEach(1...3, id: \.self) { s in
                RoundedRectangle(cornerRadius: 4)
                    .fill(s <= step ? Color.collegioOrange : Color.gray.opacity(0.3))
                    .frame(height: 4)
            }
        }
        .padding()
    }
    
    // MARK: - Step 1: Channel & Intent Selection
    private var channelSelectionStep: some View {
        VStack(alignment: .leading, spacing: 24) {
            // Channel Selection
            VStack(alignment: .leading, spacing: 12) {
                Text("Channel")
                    .font(.headline)
                
                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                    ForEach(PostChannel.allCases, id: \.self) { channel in
                        ChannelButton(
                            channel: channel,
                            isSelected: selectedChannel == channel,
                            action: {
                                withAnimation(.spring(response: 0.3)) {
                                    selectedChannel = channel
                                    // Auto-select first intent if only one
                                    let intents = channel.availableIntents
                                    if intents.count == 1 {
                                        selectedIntent = intents.first
                                    } else {
                                        selectedIntent = nil
                                    }
                                }
                            }
                        )
                    }
                }
            }
            
            // Intent Selection (shows after channel selected)
            if let channel = selectedChannel {
                VStack(alignment: .leading, spacing: 12) {
                    Text("Intent")
                        .font(.headline)
                    
                        ForEach(channel.availableIntents, id: \.self) { intent in
                            IntentButton(
                                intent: intent,
                                isSelected: selectedIntent == intent,
                                action: { selectedIntent = intent }
                            )
                        }
                }
                .transition(.move(edge: .bottom).combined(with: .opacity))
            }
        }
    }
    
    // MARK: - Step 2: Details
    private var detailsStep: some View {
        VStack(alignment: .leading, spacing: 20) {
            // Title
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("Title")
                        .font(.headline)
                    Spacer()
                    Text("\(title.count)/100")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                
                TextField("What are you posting about?", text: $title)
                    .textFieldStyle(.plain)
                    .padding()
                    .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
                    .onChange(of: title) { _, newValue in
                        if newValue.count > 100 { title = String(newValue.prefix(100)) }
                    }
            }
            
            // Description
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("Description")
                        .font(.headline)
                    Spacer()
                    Text("\(postDescription.count)/2000")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                
                TextEditor(text: $postDescription)
                    .frame(height: 120)
                    .padding(8)
                    .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
                    .onChange(of: postDescription) { _, newValue in
                        if newValue.count > 2000 { postDescription = String(newValue.prefix(2000)) }
                    }
            }
            
            // Price/Budget (context-dependent)
            if selectedIntent == .selling || selectedIntent == .offering {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Price ($)")
                        .font(.headline)
                    
                    TextField("0", text: $price)
                        .keyboardType(.numberPad)
                        .textFieldStyle(.plain)
                        .padding()
                        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
                }
            } else if selectedIntent == .lookingFor {
                HStack(spacing: 12) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Min Budget")
                            .font(.subheadline.weight(.medium))
                        TextField("$0", text: $budgetMin)
                            .keyboardType(.numberPad)
                            .textFieldStyle(.plain)
                            .padding()
                            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
                    }
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Max Budget")
                            .font(.subheadline.weight(.medium))
                        TextField("$1000", text: $budgetMax)
                            .keyboardType(.numberPad)
                            .textFieldStyle(.plain)
                            .padding()
                            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
                    }
                }
            }
            
            // Location
            VStack(alignment: .leading, spacing: 8) {
                Text("Location / Area")
                    .font(.headline)
                
                TextField("e.g. Near campus, Downtown", text: $location)
                    .textFieldStyle(.plain)
                    .padding()
                    .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
            }
            
            // Tags
            VStack(alignment: .leading, spacing: 8) {
                Text("Tags (max 5)")
                    .font(.headline)
                
                HStack {
                    TextField("Add a tag", text: $tagInput)
                    
                    Button(action: addTag) {
                        Image(systemName: "plus.circle.fill")
                            .font(.title2)
                            .foregroundStyle(Color.collegioOrange)
                    }
                    .disabled(tags.count >= 5 || tagInput.isEmpty)
                }
                
                if !tags.isEmpty {
                    FlowLayout(spacing: 8) {
                        ForEach(tags, id: \.self) { tag in
                            TagChip(tag: tag) {
                                tags.removeAll { $0 == tag }
                            }
                        }
                    }
                }
            }
        }
    }
    
    // MARK: - Step 3: Preview
    private var previewStep: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Review Your Post")
                .font(.headline)
            
            VStack(alignment: .leading, spacing: 12) {
                PreviewRow(label: "Channel", value: selectedChannel?.label ?? "")
                PreviewRow(label: "Intent", value: selectedIntent?.label ?? "")
                PreviewRow(label: "Title", value: title)
                PreviewRow(label: "Description", value: String(postDescription.prefix(100)) + (postDescription.count > 100 ? "..." : ""))
                if !price.isEmpty {
                    PreviewRow(label: "Price", value: "$\(price)")
                }
                if !location.isEmpty {
                    PreviewRow(label: "Location", value: location)
                }
                if !tags.isEmpty {
                    PreviewRow(label: "Tags", value: tags.joined(separator: ", "))
                }
            }
            .padding()
            .glassCard()
        }
    }
    
    // MARK: - Footer Buttons
    private var footerButtons: some View {
        HStack {
            if step > 1 {
                Button(action: { withAnimation { step -= 1 } }) {
                    HStack {
                        Image(systemName: "arrow.left")
                        Text("Back")
                    }
                    .font(.headline)
                    .foregroundStyle(.primary)
                    .padding()
                }
            }
            
            Spacer()
            
            if step < 3 {
                Button(action: handleNext) {
                    HStack {
                        Text("Next")
                        Image(systemName: "arrow.right")
                    }
                    .font(.headline)
                    .foregroundStyle(.white)
                    .padding(.horizontal, 24)
                    .padding(.vertical, 14)
                    .background(Color.collegioOrange, in: Capsule())
                }
                .disabled(!canProceed)
            } else {
                Button(action: submitPost) {
                    HStack {
                        Text(isLoading ? "Posting..." : "Create Post")
                        Image(systemName: "checkmark")
                    }
                    .font(.headline)
                    .foregroundStyle(.white)
                    .padding(.horizontal, 24)
                    .padding(.vertical, 14)
                    .background(Color.collegioOrange, in: Capsule())
                }
                .disabled(isLoading)
            }
        }
        .padding()
        .background(.ultraThinMaterial)
    }
    
    // MARK: - Helpers
    private var canProceed: Bool {
        switch step {
        case 1: return selectedChannel != nil && selectedIntent != nil
        case 2: return title.count >= 10 && postDescription.count >= 20
        default: return true
        }
    }
    
    private func handleNext() {
        withAnimation(.spring(response: 0.3)) {
            step += 1
        }
    }
    
    private func addTag() {
        guard !tagInput.isEmpty, tags.count < 5 else { return }
        tags.append(tagInput.trimmingCharacters(in: .whitespaces))
        tagInput = ""
    }
    
    private func submitPost() {
        isLoading = true
        // TODO: Submit to API
        DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
            isLoading = false
            dismiss()
        }
    }
}

// MARK: - Post Channel Enum (Matches Website)
enum PostChannel: String, CaseIterable {
    case housing, subleases, roommates, furniture, studyGroups = "study-groups", misc
    
    var label: String {
        switch self {
        case .housing: return "Housing"
        case .subleases: return "Subleases"
        case .roommates: return "Roommates"
        case .furniture: return "Furniture"
        case .studyGroups: return "Study Groups"
        case .misc: return "Misc"
        }
    }
    
    var icon: String {
        switch self {
        case .housing: return "house.fill"
        case .subleases: return "key.fill"
        case .roommates: return "person.2.fill"
        case .furniture: return "bag.fill"
        case .studyGroups: return "book.fill"
        case .misc: return "ellipsis.circle.fill"
        }
    }
    
    var color: Color {
        switch self {
        case .housing: return .orange
        case .subleases: return .teal
        case .roommates: return .blue
        case .furniture: return .purple
        case .studyGroups: return .green
        case .misc: return .gray
        }
    }
    
    var availableIntents: [PostIntent] {
        switch self {
        case .housing: return [.lookingFor, .offering]
        case .subleases: return [.lookingFor, .offering]
        case .roommates: return [.lookingFor, .offering]
        case .furniture: return [.selling, .lookingFor]
        case .studyGroups: return [.lookingFor, .offering, .announcement]
        case .misc: return [.lookingFor, .offering, .announcement]
        }
    }
}

// MARK: - Post Intent Enum
enum PostIntent: String, CaseIterable {
    case lookingFor = "looking-for"
    case offering
    case selling
    case announcement
    
    var label: String {
        switch self {
        case .lookingFor: return "Looking For"
        case .offering: return "Offering"
        case .selling: return "Selling"
        case .announcement: return "Announcement"
        }
    }
    
    var description: String {
        switch self {
        case .lookingFor: return "You need something"
        case .offering: return "You have something"
        case .selling: return "For sale"
        case .announcement: return "Just sharing"
        }
    }
    
    var color: Color {
        switch self {
        case .lookingFor: return .blue
        case .offering: return .green
        case .selling: return .orange
        case .announcement: return .gray
        }
    }
}

// MARK: - Channel Button
struct ChannelButton: View {
    let channel: PostChannel
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(alignment: .leading, spacing: 8) {
                Image(systemName: channel.icon)
                    .font(.title2)
                    .foregroundStyle(channel.color)
                Text(channel.label)
                    .font(.subheadline.weight(.semibold))
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding()
            .background(isSelected ? channel.color.opacity(0.15) : Color.gray.opacity(0.1))
            .overlay {
                RoundedRectangle(cornerRadius: 16)
                    .stroke(isSelected ? channel.color : Color.clear, lineWidth: 2)
            }
            .clipShape(RoundedRectangle(cornerRadius: 16))
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Intent Button
struct IntentButton: View {
    let intent: PostIntent
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(alignment: .leading, spacing: 4) {
                Text(intent.label)
                    .font(.subheadline.weight(.semibold))
                Text(intent.description)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding()
            .background(isSelected ? intent.color.opacity(0.15) : Color.gray.opacity(0.1))
            .overlay {
                RoundedRectangle(cornerRadius: 16)
                    .stroke(isSelected ? intent.color : Color.clear, lineWidth: 2)
            }
            .clipShape(RoundedRectangle(cornerRadius: 16))
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Tag Chip
struct TagChip: View {
    let tag: String
    let onRemove: () -> Void
    
    var body: some View {
        HStack(spacing: 4) {
            Text(tag)
                .font(.caption.weight(.medium))
            Button(action: onRemove) {
                Image(systemName: "xmark.circle.fill")
                    .font(.caption)
            }
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 6)
        .background(Color.collegioOrange.opacity(0.15), in: Capsule())
        .foregroundStyle(Color.collegioOrange)
    }
}

// MARK: - Preview Row
struct PreviewRow: View {
    let label: String
    let value: String
    
    var body: some View {
        HStack(alignment: .top) {
            Text(label + ":")
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(.secondary)
            Text(value)
                .font(.subheadline)
        }
    }
}

// MARK: - Flow Layout (for tags)
struct FlowLayout: Layout {
    var spacing: CGFloat = 8
    
    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = arrangedSubviews(proposal: proposal, subviews: subviews)
        return result.size
    }
    
    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = arrangedSubviews(proposal: proposal, subviews: subviews)
        for (index, origin) in result.origins.enumerated() {
            subviews[index].place(at: CGPoint(x: bounds.minX + origin.x, y: bounds.minY + origin.y), proposal: .unspecified)
        }
    }
    
    private func arrangedSubviews(proposal: ProposedViewSize, subviews: Subviews) -> (size: CGSize, origins: [CGPoint]) {
        var origins: [CGPoint] = []
        var x: CGFloat = 0
        var y: CGFloat = 0
        var maxY: CGFloat = 0
        
        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if x + size.width > (proposal.width ?? .infinity), x > 0 {
                x = 0
                y = maxY + spacing
            }
            origins.append(CGPoint(x: x, y: y))
            x += size.width + spacing
            maxY = max(maxY, y + size.height)
        }
        
        return (CGSize(width: proposal.width ?? x, height: maxY), origins)
    }
}

#Preview {
    CreatePostView()
}
