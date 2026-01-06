import SwiftUI

// MARK: - Safety Center View
struct SafetyCenterView: View {
    var body: some View {
        ZStack {
            GradientBackground()
            
            ScrollView {
                VStack(spacing: 20) {
                    // Report Section
                    NavigationLink(destination: ReportView()) {
                        SafetyCard(
                            icon: "exclamationmark.shield.fill",
                            title: "Report an Issue",
                            description: "Report scams, inappropriate content, or harassment",
                            color: .red
                        )
                    }
                    .buttonStyle(.plain)
                    
                    // Safety Tips Section
                    NavigationLink(destination: SafetyTipsView()) {
                        SafetyCard(
                            icon: "lightbulb.fill",
                            title: "Safety Tips",
                            description: "Learn how to stay safe while finding housing",
                            color: .yellow
                        )
                    }
                    .buttonStyle(.plain)
                }
                .padding()
                .padding(.bottom, 100)
            }
        }
        .navigationTitle("Safety Center")
        .navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - Safety Card
struct SafetyCard: View {
    let icon: String
    let title: String
    let description: String
    let color: Color
    
    var body: some View {
        HStack(spacing: 16) {
            Image(systemName: icon)
                .font(.title)
                .foregroundStyle(color)
                .frame(width: 50)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.headline)
                Text(description)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            
            Spacer()
            
            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding()
        .glassCard()
    }
}

// MARK: - Report View
struct ReportView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var reportType: ReportType = .listing
    @State private var reason: ReportReason = .scam
    @State private var details = ""
    @State private var targetId = ""
    @State private var isSubmitting = false
    @State private var showSuccess = false
    @State private var error: String?
    
    enum ReportType: String, CaseIterable {
        case listing = "Listing"
        case user = "User"
        case post = "Community Post"
        case message = "Message"
        
        var apiValue: String {
            switch self {
            case .listing: return "listing"
            case .user: return "user"
            case .post: return "post"
            case .message: return "message"
            }
        }
    }
    
    enum ReportReason: String, CaseIterable {
        case scam = "Scam or Fraud"
        case inappropriate = "Inappropriate Content"
        case harassment = "Harassment"
        case misleading = "Misleading Information"
        case other = "Other"
        
        var apiValue: String {
            switch self {
            case .scam: return "scam"
            case .inappropriate: return "inappropriate"
            case .harassment: return "harassment"
            case .misleading: return "misleading"
            case .other: return "other"
            }
        }
    }
    
    var body: some View {
        ZStack {
            GradientBackground()
            
            ScrollView {
                VStack(spacing: 24) {
                    // What are you reporting?
                    VStack(alignment: .leading, spacing: 12) {
                        Text("What are you reporting?")
                            .font(.headline)
                        
                        ForEach(ReportType.allCases, id: \.self) { type in
                            Button {
                                reportType = type
                            } label: {
                                HStack {
                                    Image(systemName: reportType == type ? "circle.fill" : "circle")
                                        .foregroundStyle(reportType == type ? Color.collegioOrange : .secondary)
                                    Text(type.rawValue)
                                        .foregroundStyle(.primary)
                                    Spacer()
                                }
                                .padding()
                                .background(reportType == type ? Color.collegioOrange.opacity(0.1) : Color.white.opacity(0.05))
                                .clipShape(RoundedRectangle(cornerRadius: 12))
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    
                    // Reason
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Why are you reporting this?")
                            .font(.headline)
                        
                        ForEach(ReportReason.allCases, id: \.self) { r in
                            Button {
                                reason = r
                            } label: {
                                HStack {
                                    Image(systemName: reason == r ? "checkmark.circle.fill" : "circle")
                                        .foregroundStyle(reason == r ? Color.collegioOrange : .secondary)
                                    Text(r.rawValue)
                                        .foregroundStyle(.primary)
                                    Spacer()
                                }
                                .padding()
                                .background(reason == r ? Color.collegioOrange.opacity(0.1) : Color.white.opacity(0.05))
                                .clipShape(RoundedRectangle(cornerRadius: 12))
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    
                    // Details
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Additional Details")
                            .font(.headline)
                        
                        TextEditor(text: $details)
                            .frame(height: 120)
                            .padding(12)
                            .scrollContentBackground(.hidden)
                            .background(Color.white.opacity(0.1), in: RoundedRectangle(cornerRadius: 12))
                            .overlay {
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(Color.white.opacity(0.2), lineWidth: 1)
                            }
                            .overlay {
                                if details.isEmpty {
                                    Text("Describe the issue in detail...")
                                        .foregroundStyle(.secondary)
                                        .padding(16)
                                        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
                                        .allowsHitTesting(false)
                                }
                            }
                    }
                    
                    if let error {
                        Text(error)
                            .font(.caption)
                            .foregroundStyle(.red)
                    }
                    
                    // Submit Button
                    Button {
                        Task { await submitReport() }
                    } label: {
                        HStack {
                            if isSubmitting {
                                ProgressView().tint(.white)
                            }
                            Text(isSubmitting ? "Submitting..." : "Submit Report")
                        }
                        .font(.headline)
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.red)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                    }
                    .disabled(isSubmitting)
                }
                .padding()
                .padding(.bottom, 100)
            }
        }
        .navigationTitle("Report an Issue")
        .navigationBarTitleDisplayMode(.inline)
        .alert("Report Submitted", isPresented: $showSuccess) {
            Button("OK") { dismiss() }
        } message: {
            Text("Thank you for helping keep Collegio safe. We'll review your report shortly.")
        }
    }
    
    private func submitReport() async {
        isSubmitting = true
        error = nil
        
        do {
            try await ReportService.shared.createReport(
                type: reportType.apiValue,
                reason: reason.apiValue,
                details: details
            )
            showSuccess = true
        } catch {
            self.error = "Failed to submit report. Please try again."
        }
        
        isSubmitting = false
    }
}

// MARK: - Safety Tips View
struct SafetyTipsView: View {
    var body: some View {
        ZStack {
            GradientBackground()
            
            ScrollView {
                VStack(spacing: 16) {
                    SafetyTipCard(
                        icon: "dollarsign.circle.fill",
                        title: "Avoiding Housing Scams",
                        tips: [
                            "Never send money before seeing the property in person",
                            "Verify the landlord's identity and ownership",
                            "Be wary of prices that seem too good to be true",
                            "Use secure payment methods with buyer protection",
                            "Never wire money or use gift cards as payment"
                        ],
                        color: .green
                    )
                    
                    SafetyTipCard(
                        icon: "person.2.fill",
                        title: "Meeting Roommates Safely",
                        tips: [
                            "Meet in a public place first",
                            "Tell a friend or family member about your meeting",
                            "Trust your instincts - if something feels off, leave",
                            "Video chat before meeting in person",
                            "Check references and social media profiles"
                        ],
                        color: .blue
                    )
                    
                    SafetyTipCard(
                        icon: "checkmark.shield.fill",
                        title: "Verifying Listings",
                        tips: [
                            "Look for verified landlord badges",
                            "Check if the listing has reviews from past tenants",
                            "Search the address online for more information",
                            "Request a video tour if you can't visit in person",
                            "Ask for the lease before signing anything"
                        ],
                        color: .purple
                    )
                    
                    SafetyTipCard(
                        icon: "creditcard.fill",
                        title: "Secure Payments",
                        tips: [
                            "Use official payment methods through the app",
                            "Get receipts for all payments",
                            "Never pay the full lease upfront",
                            "Verify the landlord's bank details independently",
                            "Keep records of all financial transactions"
                        ],
                        color: .orange
                    )
                }
                .padding()
                .padding(.bottom, 100)
            }
        }
        .navigationTitle("Safety Tips")
        .navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - Safety Tip Card
struct SafetyTipCard: View {
    let icon: String
    let title: String
    let tips: [String]
    let color: Color
    @State private var isExpanded = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Button {
                withAnimation(.spring(response: 0.3)) {
                    isExpanded.toggle()
                }
            } label: {
                HStack {
                    Image(systemName: icon)
                        .font(.title2)
                        .foregroundStyle(color)
                    
                    Text(title)
                        .font(.headline)
                        .foregroundStyle(.primary)
                    
                    Spacer()
                    
                    Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            .buttonStyle(.plain)
            
            if isExpanded {
                VStack(alignment: .leading, spacing: 10) {
                    ForEach(tips, id: \.self) { tip in
                        HStack(alignment: .top, spacing: 10) {
                            Image(systemName: "checkmark.circle.fill")
                                .font(.caption)
                                .foregroundStyle(color)
                                .padding(.top, 2)
                            Text(tip)
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }
                    }
                }
                .padding(.top, 4)
            }
        }
        .padding()
        .glassCard()
    }
}

// MARK: - Report Service
class ReportService {
    static let shared = ReportService()
    private let encoder = JSONEncoder()
    
    struct CreateReportRequest: Encodable {
        let type: String
        let reason: String
        let details: String
        let targetId: String
    }
    
    struct ReportResponse: Decodable {
        let success: Bool?
    }
    
    func createReport(type: String, reason: String, details: String, targetId: String = "general") async throws {
        let requestBody = CreateReportRequest(type: type, reason: reason, details: details, targetId: targetId)
        let bodyData = try encoder.encode(requestBody)
        
        let _: ReportResponse = try await APIService.shared.authenticatedRequest(
            "/reports",
            method: "POST",
            body: bodyData
        )
    }
}

// MARK: - Listing Report Sheet (Quick Report)
struct ListingReportSheet: View {
    let listingId: String
    @Environment(\.dismiss) private var dismiss
    @State private var reason: ReportView.ReportReason = .scam
    @State private var details = ""
    @State private var isSubmitting = false
    @State private var showSuccess = false
    
    var body: some View {
        NavigationStack {
            ZStack {
                GradientBackground()
                
                ScrollView {
                    VStack(spacing: 24) {
                        Text("Why are you reporting this listing?")
                            .font(.headline)
                            .frame(maxWidth: .infinity, alignment: .leading)
                        
                        ForEach(ReportView.ReportReason.allCases, id: \.self) { r in
                            Button {
                                reason = r
                            } label: {
                                HStack {
                                    Image(systemName: reason == r ? "checkmark.circle.fill" : "circle")
                                        .foregroundStyle(reason == r ? Color.collegioOrange : .secondary)
                                    Text(r.rawValue)
                                        .foregroundStyle(.primary)
                                    Spacer()
                                }
                                .padding()
                                .background(reason == r ? Color.collegioOrange.opacity(0.1) : Color.white.opacity(0.05))
                                .clipShape(RoundedRectangle(cornerRadius: 12))
                            }
                            .buttonStyle(.plain)
                        }
                        
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Additional Details (Optional)")
                                .font(.subheadline)
                            
                            TextEditor(text: $details)
                                .frame(height: 100)
                                .padding(12)
                                .scrollContentBackground(.hidden)
                                .background(Color.white.opacity(0.1), in: RoundedRectangle(cornerRadius: 12))
                                .overlay {
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(Color.white.opacity(0.2), lineWidth: 1)
                                }
                        }
                        
                        Button {
                            Task { await submitReport() }
                        } label: {
                            HStack {
                                if isSubmitting {
                                    ProgressView().tint(.white)
                                }
                                Text(isSubmitting ? "Submitting..." : "Submit Report")
                            }
                            .font(.headline)
                            .foregroundStyle(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.red)
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                        }
                        .disabled(isSubmitting)
                    }
                    .padding()
                }
            }
            .navigationTitle("Report Listing")
            .navigationBarTitleDisplayMode(.inline)
        }
        .presentationDetents([.medium, .large])
        .presentationDragIndicator(.visible)
        .alert("Report Submitted", isPresented: $showSuccess) {
            Button("OK") { dismiss() }
        } message: {
            Text("Thank you for helping keep Collegio safe.")
        }
    }
    
    private func submitReport() async {
        isSubmitting = true
        do {
            try await ReportService.shared.createReport(
                type: "listing",
                reason: reason.apiValue,
                details: details,
                targetId: listingId
            )
            showSuccess = true
        } catch {
            // Handle error silently for now
        }
        isSubmitting = false
    }
}

// MARK: - Post Report Sheet
struct PostReportSheet: View {
    let postId: String
    @Environment(\.dismiss) private var dismiss
    @State private var reason: ReportView.ReportReason = .inappropriate
    @State private var details = ""
    @State private var isSubmitting = false
    @State private var showSuccess = false
    
    var body: some View {
        NavigationStack {
            ZStack {
                GradientBackground()
                
                ScrollView {
                    VStack(spacing: 24) {
                        Text("Why are you reporting this post?")
                            .font(.headline)
                            .frame(maxWidth: .infinity, alignment: .leading)
                        
                        ForEach(ReportView.ReportReason.allCases, id: \.self) { r in
                            Button {
                                reason = r
                            } label: {
                                HStack {
                                    Image(systemName: reason == r ? "checkmark.circle.fill" : "circle")
                                        .foregroundStyle(reason == r ? Color.collegioOrange : .secondary)
                                    Text(r.rawValue)
                                        .foregroundStyle(.primary)
                                    Spacer()
                                }
                                .padding()
                                .background(reason == r ? Color.collegioOrange.opacity(0.1) : Color.white.opacity(0.05))
                                .clipShape(RoundedRectangle(cornerRadius: 12))
                            }
                            .buttonStyle(.plain)
                        }
                        
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Additional Details (Optional)")
                                .font(.subheadline)
                            
                            TextEditor(text: $details)
                                .frame(height: 100)
                                .padding(12)
                                .scrollContentBackground(.hidden)
                                .background(Color.white.opacity(0.1), in: RoundedRectangle(cornerRadius: 12))
                                .overlay {
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(Color.white.opacity(0.2), lineWidth: 1)
                                }
                        }
                        
                        Button {
                            Task { await submitReport() }
                        } label: {
                            HStack {
                                if isSubmitting {
                                    ProgressView().tint(.white)
                                }
                                Text(isSubmitting ? "Submitting..." : "Submit Report")
                            }
                            .font(.headline)
                            .foregroundStyle(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.red)
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                        }
                        .disabled(isSubmitting)
                    }
                    .padding()
                }
            }
            .navigationTitle("Report Post")
            .navigationBarTitleDisplayMode(.inline)
        }
        .presentationDetents([.medium, .large])
        .presentationDragIndicator(.visible)
        .alert("Report Submitted", isPresented: $showSuccess) {
            Button("OK") { dismiss() }
        } message: {
            Text("Thank you for helping keep Collegio safe.")
        }
    }
    
    private func submitReport() async {
        isSubmitting = true
        do {
            try await ReportService.shared.createReport(
                type: "post",
                reason: reason.apiValue,
                details: details,
                targetId: postId
            )
            showSuccess = true
        } catch {
            // Handle error silently
        }
        isSubmitting = false
    }
}

// MARK: - Message Report Sheet
struct MessageReportSheet: View {
    let conversationId: String
    @Environment(\.dismiss) private var dismiss
    @State private var reason: ReportView.ReportReason = .harassment
    @State private var details = ""
    @State private var isSubmitting = false
    @State private var showSuccess = false
    
    var body: some View {
        NavigationStack {
            ZStack {
                GradientBackground()
                
                ScrollView {
                    VStack(spacing: 24) {
                        Text("Why are you reporting this conversation?")
                            .font(.headline)
                            .frame(maxWidth: .infinity, alignment: .leading)
                        
                        ForEach(ReportView.ReportReason.allCases, id: \.self) { r in
                            Button {
                                reason = r
                            } label: {
                                HStack {
                                    Image(systemName: reason == r ? "checkmark.circle.fill" : "circle")
                                        .foregroundStyle(reason == r ? Color.collegioOrange : .secondary)
                                    Text(r.rawValue)
                                        .foregroundStyle(.primary)
                                    Spacer()
                                }
                                .padding()
                                .background(reason == r ? Color.collegioOrange.opacity(0.1) : Color.white.opacity(0.05))
                                .clipShape(RoundedRectangle(cornerRadius: 12))
                            }
                            .buttonStyle(.plain)
                        }
                        
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Additional Details (Optional)")
                                .font(.subheadline)
                            
                            TextEditor(text: $details)
                                .frame(height: 100)
                                .padding(12)
                                .scrollContentBackground(.hidden)
                                .background(Color.white.opacity(0.1), in: RoundedRectangle(cornerRadius: 12))
                                .overlay {
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(Color.white.opacity(0.2), lineWidth: 1)
                                }
                        }
                        
                        Button {
                            Task { await submitReport() }
                        } label: {
                            HStack {
                                if isSubmitting {
                                    ProgressView().tint(.white)
                                }
                                Text(isSubmitting ? "Submitting..." : "Submit Report")
                            }
                            .font(.headline)
                            .foregroundStyle(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.red)
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                        }
                        .disabled(isSubmitting)
                    }
                    .padding()
                }
            }
            .navigationTitle("Report Conversation")
            .navigationBarTitleDisplayMode(.inline)
        }
        .presentationDetents([.medium, .large])
        .presentationDragIndicator(.visible)
        .alert("Report Submitted", isPresented: $showSuccess) {
            Button("OK") { dismiss() }
        } message: {
            Text("Thank you for helping keep Collegio safe.")
        }
    }
    
    private func submitReport() async {
        isSubmitting = true
        do {
            try await ReportService.shared.createReport(
                type: "message",
                reason: reason.apiValue,
                details: details,
                targetId: conversationId
            )
            showSuccess = true
        } catch {
            // Handle error silently
        }
        isSubmitting = false
    }
}

#Preview {
    NavigationStack {
        SafetyCenterView()
    }
}
