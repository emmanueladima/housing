import SwiftUI

struct GroupCreationView: View {
    @Environment(\.dismiss) private var dismiss
    @StateObject private var viewModel = GroupCreationViewModel()
    
    var body: some View {
        NavigationStack {
            ZStack {
                GradientBackground()
                
                VStack(spacing: 0) {
                    // Progress Indicator
                    progressIndicator
                    
                    // Step Content
                    stepContent
                        .padding()
                    
                    Spacer()
                    
                    // Navigation Buttons
                    navigationButtons
                }
            }
            .navigationTitle("Create Group")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
            }
            .alert("Error", isPresented: $viewModel.showError) {
                Button("OK") {}
            } message: {
                Text(viewModel.error ?? "Something went wrong")
            }
        }
    }
    
    // MARK: - Progress Indicator
    private var progressIndicator: some View {
        HStack(spacing: 8) {
            ForEach(1...4, id: \.self) { step in
                Capsule()
                    .fill(step <= viewModel.currentStep ? Color.collegioOrange : Color.white.opacity(0.2))
                    .frame(height: 4)
            }
        }
        .padding(.horizontal)
        .padding(.vertical, 12)
    }
    
    // MARK: - Step Content
    @ViewBuilder
    private var stepContent: some View {
        switch viewModel.currentStep {
        case 1:
            step1Basics
        case 2:
            step2Logistics
        case 3:
            step3Vibes
        case 4:
            step4Review
        default:
            EmptyView()
        }
    }
    
    // MARK: - Step 1: Basics
    private var step1Basics: some View {
        VStack(spacing: 24) {
            stepHeader(
                icon: "person.3.fill",
                title: "Let's start with the basics",
                subtitle: "Give your group a name and description"
            )
            
            VStack(alignment: .leading, spacing: 8) {
                Text("Group Name")
                    .font(.subheadline.bold())
                    .foregroundStyle(.secondary)
                TextField("e.g., The Study Hub", text: $viewModel.name)
                    .textFieldStyle(.roundedBorder)
            }
            
            VStack(alignment: .leading, spacing: 8) {
                Text("Description")
                    .font(.subheadline.bold())
                    .foregroundStyle(.secondary)
                TextField("Tell others about your group...", text: $viewModel.description, axis: .vertical)
                    .textFieldStyle(.roundedBorder)
                    .lineLimit(3...6)
            }
        }
    }
    
    // MARK: - Step 2: Logistics
    private var step2Logistics: some View {
        VStack(spacing: 24) {
            stepHeader(
                icon: "dollarsign.circle.fill",
                title: "Budget & Preferences",
                subtitle: "Help roommates know if they're a fit"
            )
            
            VStack(alignment: .leading, spacing: 8) {
                Text("Max Budget per Person")
                    .font(.subheadline.bold())
                    .foregroundStyle(.secondary)
                TextField("$0", text: $viewModel.budget)
                    .textFieldStyle(.roundedBorder)
                    .keyboardType(.numberPad)
            }
            
            VStack(alignment: .leading, spacing: 8) {
                Text("Looking For")
                    .font(.subheadline.bold())
                    .foregroundStyle(.secondary)
                Picker("Roommates needed", selection: $viewModel.lookingFor) {
                    ForEach(1...5, id: \.self) { num in
                        Text("\(num) more").tag(num)
                    }
                }
                .pickerStyle(.segmented)
            }
        }
    }
    
    // MARK: - Step 3: Vibes
    private var step3Vibes: some View {
        VStack(spacing: 24) {
            stepHeader(
                icon: "sparkles",
                title: "What's your vibe?",
                subtitle: "Select tags that describe your group"
            )
            
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 100))], spacing: 12) {
                ForEach(GroupCreationViewModel.vibeOptions, id: \.self) { vibe in
                    Button {
                        viewModel.toggleVibe(vibe)
                    } label: {
                        Text(vibe)
                            .font(.subheadline.bold())
                            .padding(.horizontal, 16)
                            .padding(.vertical, 10)
                            .frame(maxWidth: .infinity)
                            .background(
                                viewModel.selectedVibes.contains(vibe)
                                    ? Color.collegioOrange
                                    : Color.white.opacity(0.1)
                            )
                            .foregroundStyle(
                                viewModel.selectedVibes.contains(vibe)
                                    ? .white
                                    : .primary
                            )
                            .clipShape(Capsule())
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }
    
    // MARK: - Step 4: Review
    private var step4Review: some View {
        VStack(spacing: 24) {
            stepHeader(
                icon: "checkmark.circle.fill",
                title: "Review Your Group",
                subtitle: "Make sure everything looks good"
            )
            
            VStack(alignment: .leading, spacing: 16) {
                reviewRow(label: "Name", value: viewModel.name)
                reviewRow(label: "Description", value: viewModel.description.isEmpty ? "None" : viewModel.description)
                reviewRow(label: "Budget", value: viewModel.budget.isEmpty ? "Not set" : "$\(viewModel.budget)/person")
                reviewRow(label: "Looking For", value: "\(viewModel.lookingFor) more roommates")
                reviewRow(label: "Vibes", value: viewModel.selectedVibes.isEmpty ? "None" : viewModel.selectedVibes.joined(separator: ", "))
            }
            .padding()
            .glassCard()
        }
    }
    
    // MARK: - Navigation Buttons
    private var navigationButtons: some View {
        HStack(spacing: 16) {
            if viewModel.currentStep > 1 {
                Button {
                    withAnimation {
                        viewModel.currentStep -= 1
                    }
                } label: {
                    HStack {
                        Image(systemName: "chevron.left")
                        Text("Back")
                    }
                    .font(.headline)
                    .foregroundStyle(.primary)
                    .padding(.horizontal, 24)
                    .padding(.vertical, 14)
                    .background(.ultraThinMaterial)
                    .clipShape(Capsule())
                }
            }
            
            Spacer()
            
            Button {
                if viewModel.currentStep < 4 {
                    withAnimation {
                        viewModel.currentStep += 1
                    }
                } else {
                    Task {
                        await viewModel.createGroup()
                        if viewModel.error == nil {
                            dismiss()
                        }
                    }
                }
            } label: {
                HStack {
                    Text(viewModel.currentStep == 4 ? "Create" : "Next")
                    if viewModel.currentStep < 4 {
                        Image(systemName: "chevron.right")
                    }
                }
                .font(.headline)
                .foregroundStyle(.white)
                .padding(.horizontal, 24)
                .padding(.vertical, 14)
                .background(viewModel.canProceed ? Color.collegioOrange : Color.gray)
                .clipShape(Capsule())
            }
            .disabled(!viewModel.canProceed || viewModel.isLoading)
        }
        .padding()
        .background(.ultraThinMaterial)
    }
    
    // MARK: - Helpers
    private func stepHeader(icon: String, title: String, subtitle: String) -> some View {
        VStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 50))
                .foregroundStyle(Color.collegioOrange)
            
            Text(title)
                .font(.title2.bold())
            
            Text(subtitle)
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .multilineTextAlignment(.center)
        .padding(.bottom)
    }
    
    private func reviewRow(label: String, value: String) -> some View {
        HStack {
            Text(label)
                .font(.subheadline)
                .foregroundStyle(.secondary)
            Spacer()
            Text(value)
                .font(.subheadline.bold())
                .multilineTextAlignment(.trailing)
        }
    }
}

#Preview {
    GroupCreationView()
}
