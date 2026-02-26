import SwiftUI

struct EditGroupView: View {
    @Environment(\.dismiss) private var dismiss
    let group: RoommateGroup
    let onSave: (RoommateGroup) -> Void
    
    @State private var name: String = ""
    @State private var description: String = ""
    @State private var budgetMin: String = ""
    @State private var budgetMax: String = ""
    @State private var lookingFor: String = ""
    @State private var vibes: [String] = []
    @State private var newVibeTag: String = ""
    
    @State private var isLoading = false
    @State private var errorMessage: String?
    
    // Available vibe options
    private let vibeOptions = ["Quiet", "Studious", "Clean", "Social", "Party", "Night Owl", "Early Bird", "Chill", "Active", "Creative"]
    
    var body: some View {
        NavigationStack {
            ZStack {
                GradientBackground()
                
                ScrollView {
                    VStack(spacing: 20) {
                        // Error Message
                        if let error = errorMessage {
                            Text(error)
                                .font(.caption)
                                .foregroundStyle(.red)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 8)
                                .background(Color.red.opacity(0.1))
                                .clipShape(RoundedRectangle(cornerRadius: 8))
                        }
                        
                        // Group Name
                        formSection(title: "Group Name", icon: "person.3.fill") {
                            TextField("Enter group name", text: $name)
                                .textFieldStyle(.plain)
                        }
                        
                        // Description
                        formSection(title: "Description", icon: "text.alignleft") {
                            TextField("Describe your group...", text: $description, axis: .vertical)
                                .lineLimit(3...6)
                                .textFieldStyle(.plain)
                        }
                        
                        // Budget
                        formSection(title: "Budget Range", icon: "dollarsign.circle") {
                            HStack(spacing: 16) {
                                VStack(alignment: .leading, spacing: 4) {
                                    Text("Min")
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                    HStack {
                                        Text("$")
                                            .foregroundStyle(.secondary)
                                        TextField("0", text: $budgetMin)
                                            .keyboardType(.numberPad)
                                            .textFieldStyle(.plain)
                                    }
                                }
                                
                                VStack(alignment: .leading, spacing: 4) {
                                    Text("Max")
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                    HStack {
                                        Text("$")
                                            .foregroundStyle(.secondary)
                                        TextField("0", text: $budgetMax)
                                            .keyboardType(.numberPad)
                                            .textFieldStyle(.plain)
                                    }
                                }
                            }
                        }
                        
                        // Looking For Dropdown
                        formSection(title: "Looking For", icon: "magnifyingglass") {
                            Picker("Looking For", selection: $lookingFor) {
                                Text("Not looking").tag("")
                                Text("1 more roommate").tag("1 more")
                                Text("2 more roommates").tag("2 more")
                                Text("3 more roommates").tag("3 more")
                                Text("4+ more roommates").tag("4+ more")
                            }
                            .pickerStyle(.menu)
                            .tint(Color.collegioOrange)
                            .frame(maxWidth: .infinity, alignment: .leading)
                        }
                        
                        // Vibes
                        formSection(title: "Vibe Tags", icon: "sparkles") {
                            VStack(alignment: .leading, spacing: 12) {
                                // Current tags
                                if !vibes.isEmpty {
                                    FlowLayout(spacing: 8) {
                                        ForEach(vibes, id: \.self) { vibe in
                                            HStack(spacing: 4) {
                                                Text(vibe)
                                                    .font(.caption.bold())
                                                Button {
                                                    vibes.removeAll { $0 == vibe }
                                                } label: {
                                                    Image(systemName: "xmark.circle.fill")
                                                        .font(.caption)
                                                }
                                            }
                                            .padding(.horizontal, 10)
                                            .padding(.vertical, 6)
                                            .background(Color.collegioOrange.opacity(0.2))
                                            .foregroundStyle(Color.collegioOrange)
                                            .clipShape(Capsule())
                                        }
                                    }
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                }
                                
                                // Add tags
                                Text("Tap to add:")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                                
                                FlowLayout(spacing: 8) {
                                    ForEach(vibeOptions.filter { !vibes.contains($0) }, id: \.self) { option in
                                        Button {
                                            if vibes.count < 5 {
                                                vibes.append(option)
                                            }
                                        } label: {
                                            Text(option)
                                                .font(.caption)
                                                .padding(.horizontal, 10)
                                                .padding(.vertical, 6)
                                                .background(Color(.systemGray5))
                                                .foregroundStyle(.primary)
                                                .clipShape(Capsule())
                                        }
                                    }
                                }
                                .frame(maxWidth: .infinity, alignment: .leading)
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)
                        }
                        
                        // Save Button
                        Button {
                            Task { await saveChanges() }
                        } label: {
                            HStack {
                                if isLoading {
                                    ProgressView()
                                        .tint(.white)
                                }
                                Text("Save Changes")
                                    .font(.headline)
                            }
                            .foregroundStyle(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(Color.collegioOrange)
                            .clipShape(RoundedRectangle(cornerRadius: 14))
                        }
                        .disabled(isLoading || name.isEmpty)
                        .padding(.top, 8)
                    }
                    .padding()
                    .padding(.bottom, 40)
                }
            }
            .navigationTitle("Edit Group")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Cancel") { dismiss() }
                        .foregroundStyle(Color.collegioOrange)
                }
            }
            .onAppear { loadGroupData() }
        }
    }
    
    // MARK: - Form Section
    private func formSection<Content: View>(title: String, icon: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 8) {
                Image(systemName: icon)
                    .foregroundStyle(Color.collegioOrange)
                Text(title)
                    .font(.headline)
            }
            
            content()
                .padding()
                .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
    
    // MARK: - Load Data
    private func loadGroupData() {
        name = group.name
        description = group.description ?? ""
        budgetMin = group.budget?.min != nil ? "\(group.budget!.min!)" : ""
        budgetMax = group.budget?.max != nil ? "\(group.budget!.max!)" : ""
        lookingFor = group.lookingFor ?? ""
        vibes = group.vibe ?? []
    }
    
    // MARK: - Save
    private func saveChanges() async {
        isLoading = true
        errorMessage = nil
        
        let budget = Budget(
            min: Int(budgetMin),
            max: Int(budgetMax)
        )
        
        let request = CreateGroupRequest(
            name: name,
            description: description.isEmpty ? nil : description,
            budget: budget,
            vibe: vibes.isEmpty ? nil : vibes,
            lookingFor: lookingFor.isEmpty ? nil : lookingFor
        )
        
        do {
            let updatedGroup = try await GroupService.shared.updateGroup(id: group.id, request: request)
            await MainActor.run {
                onSave(updatedGroup)
                dismiss()
            }
        } catch {
            await MainActor.run {
                errorMessage = error.localizedDescription
            }
        }
        
        await MainActor.run { isLoading = false }
    }
}

#Preview {
    EditGroupView(
        group: RoommateGroup(
            id: "1",
            name: "The Study Hub",
            description: "We're a group of engineering students.",
            members: nil,
            admin: "1",
            joinRequests: nil,
            chores: nil,
            expenses: nil,
            houseRules: nil,
            sharedEvents: nil,
            budget: Budget(min: 500, max: 800),
            vibe: ["Quiet", "Studious"],
            lookingFor: "2 more",
            createdAt: nil
        ),
        onSave: { _ in }
    )
}
