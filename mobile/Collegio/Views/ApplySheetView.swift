import SwiftUI

struct ApplySheetView: View {
    let listing: Listing
    @Environment(\.dismiss) private var dismiss
    @State private var moveInDate = Date().addingTimeInterval(30 * 24 * 60 * 60) // Default: 30 days from now
    @State private var selectedLeaseTerm: LeaseTerm = .academicYear
    @State private var coverLetter = ""
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var showSuccess = false
    @State private var step = 1
    
    var body: some View {
        NavigationStack {
            ZStack {
                GradientBackground()
                
                VStack(spacing: 0) {
                    // Progress Indicator
                    HStack(spacing: 8) {
                        ForEach(1...2, id: \.self) { s in
                            RoundedRectangle(cornerRadius: 4)
                                .fill(s <= step ? Color.collegioOrange : Color.gray.opacity(0.3))
                                .frame(height: 4)
                        }
                    }
                    .padding()
                    
                    ScrollView {
                        VStack(spacing: 24) {
                            if step == 1 {
                                detailsStep
                            } else {
                                reviewStep
                            }
                        }
                        .padding()
                        .padding(.bottom, 100)
                    }
                    
                    // Footer
                    footerButtons
                }
            }
            .navigationTitle("Apply to Listing")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Cancel") { dismiss() }
                }
            }
            .alert("Application Submitted!", isPresented: $showSuccess) {
                Button("Done") { dismiss() }
            } message: {
                Text("Your application has been submitted. You'll receive updates on its status.")
            }
        }
    }
    
    // MARK: - Step 1: Details
    
    private var detailsStep: some View {
        VStack(alignment: .leading, spacing: 20) {
            // Listing Preview
            HStack(spacing: 12) {
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.gray.opacity(0.2))
                    .frame(width: 60, height: 60)
                    .overlay {
                        Image(systemName: "house.fill")
                            .foregroundStyle(.secondary)
                    }
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(listing.title)
                        .font(.headline)
                        .lineLimit(1)
                    Text(listing.formattedPrice + "/mo")
                        .font(.subheadline)
                        .foregroundStyle(Color.collegioOrange)
                }
                
                Spacer()
            }
            .padding()
            .glassCard()
            
            // Move-in Date
            VStack(alignment: .leading, spacing: 8) {
                Text("Preferred Move-in Date")
                    .font(.headline)
                
                DatePicker("", selection: $moveInDate, in: Date()..., displayedComponents: .date)
                    .datePickerStyle(.graphical)
                    .tint(Color.collegioOrange)
                    .padding()
                    .glassCard()
            }
            
            // Lease Term
            VStack(alignment: .leading, spacing: 12) {
                Text("Lease Term")
                    .font(.headline)
                
                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                    ForEach(LeaseTerm.allCases) { term in
                        Button(action: { selectedLeaseTerm = term }) {
                            Text(term.displayName)
                                .font(.subheadline.bold())
                                .foregroundStyle(selectedLeaseTerm == term ? .white : .primary)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 14)
                                .background {
                                    if selectedLeaseTerm == term {
                                        RoundedRectangle(cornerRadius: 12)
                                            .fill(Color.collegioOrange)
                                    } else {
                                        RoundedRectangle(cornerRadius: 12)
                                            .fill(.ultraThinMaterial)
                                    }
                                }
                        }
                    }
                }
            }
            
            // Cover Letter
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("Message to Landlord")
                        .font(.headline)
                    Spacer()
                    Text("Optional")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                
                TextEditor(text: $coverLetter)
                    .scrollContentBackground(.hidden)
                    .frame(minHeight: 120)
                    .padding()
                    .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
                    .overlay(alignment: .topLeading) {
                        if coverLetter.isEmpty {
                            Text("Tell the landlord about yourself, why you're interested...")
                                .font(.subheadline)
                                .foregroundStyle(.tertiary)
                                .padding(.leading, 20)
                                .padding(.top, 24)
                                .allowsHitTesting(false)
                        }
                    }
                
                Text("\(coverLetter.count)/2000")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity, alignment: .trailing)
                    .onChange(of: coverLetter) { _, newValue in
                        if newValue.count > 2000 { coverLetter = String(newValue.prefix(2000)) }
                    }
            }
        }
    }
    
    // MARK: - Step 2: Review
    
    private var reviewStep: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Review Your Application")
                .font(.title3.bold())
            
            VStack(spacing: 12) {
                reviewRow(label: "Listing", value: listing.title)
                reviewRow(label: "Move-in Date", value: moveInDate.formatted(date: .abbreviated, time: .omitted))
                reviewRow(label: "Lease Term", value: selectedLeaseTerm.displayName)
                
                if !coverLetter.isEmpty {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Message")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                        Text(coverLetter)
                            .font(.subheadline)
                            .lineLimit(5)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.vertical, 4)
                }
            }
            .padding()
            .glassCard()
            
            // Error
            if let error = errorMessage {
                HStack(spacing: 8) {
                    Image(systemName: "exclamationmark.triangle.fill")
                    Text(error)
                }
                .font(.subheadline)
                .foregroundStyle(.red)
                .padding()
                .frame(maxWidth: .infinity)
                .background(.red.opacity(0.1), in: RoundedRectangle(cornerRadius: 12))
            }
            
            // Disclaimer
            HStack(spacing: 8) {
                Image(systemName: "info.circle.fill")
                    .foregroundStyle(Color.collegioOrange)
                Text("By submitting, you agree to share your profile information with the landlord.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            .padding()
            .glassCard()
        }
    }
    
    // MARK: - Review Row
    
    private func reviewRow(label: String, value: String) -> some View {
        HStack {
            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
            Spacer()
            Text(value)
                .font(.subheadline.bold())
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
                    .padding(.horizontal, 20)
                    .padding(.vertical, 14)
                    .background(.ultraThinMaterial, in: Capsule())
                }
            }
            
            Spacer()
            
            Button(action: {
                if step < 2 {
                    withAnimation { step += 1 }
                } else {
                    Task { await submitApplication() }
                }
            }) {
                HStack(spacing: 8) {
                    if isLoading {
                        ProgressView()
                            .tint(.white)
                    } else {
                        Text(step < 2 ? "Review" : "Submit Application")
                        Image(systemName: step < 2 ? "arrow.right" : "paperplane.fill")
                    }
                }
                .font(.headline)
                .foregroundStyle(.white)
                .padding(.horizontal, 24)
                .padding(.vertical, 14)
                .background(Color.collegioOrange, in: Capsule())
            }
            .disabled(isLoading)
        }
        .padding()
        .background(.ultraThinMaterial)
    }
    
    // MARK: - Submit
    
    private func submitApplication() async {
        isLoading = true
        errorMessage = nil
        
        do {
            let _ = try await APIService.shared.submitApplication(
                listingId: listing.id,
                moveInDate: moveInDate,
                leaseTerm: selectedLeaseTerm.rawValue,
                coverLetter: coverLetter.isEmpty ? nil : coverLetter
            )
            showSuccess = true
        } catch let error as APIError {
            errorMessage = error.localizedDescription
        } catch {
            errorMessage = "Failed to submit application. Please try again."
        }
        
        isLoading = false
    }
}

