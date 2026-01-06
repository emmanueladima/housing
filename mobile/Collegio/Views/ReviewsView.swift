import SwiftUI

// MARK: - Review Model
struct Review: Identifiable, Codable {
    let id: String
    let reviewer: Reviewer?
    let rating: Int
    let reviewText: String
    let categoryRatings: CategoryRatings?
    let createdAt: String
    let helpful: Int?
    
    struct Reviewer: Codable {
        let firstName: String?
        let lastName: String?
        let profileImage: String?
    }
    
    struct CategoryRatings: Codable {
        let cleanliness: Int?
        let accuracy: Int?
        let communication: Int?
        let value: Int?
    }
    
    var reviewerName: String {
        if let first = reviewer?.firstName {
            return "\(first) \(reviewer?.lastName?.first.map(String.init) ?? "")."
        }
        return "Anonymous"
    }
    
    var formattedDate: String {
        // Simple date formatting
        let isoFormatter = ISO8601DateFormatter()
        isoFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        
        if let date = isoFormatter.date(from: createdAt) {
            let formatter = DateFormatter()
            formatter.dateStyle = .medium
            return formatter.string(from: date)
        }
        return createdAt
    }
}

// MARK: - Reviews Service
class ReviewService {
    static let shared = ReviewService()
    private let encoder = JSONEncoder()
    
    struct CreateReviewRequest: Encodable {
        let listingId: String
        let rating: Int
        let reviewText: String
    }
    
    struct ReviewsResponse: Decodable {
        let success: Bool?
        let reviews: [Review]?
    }
    
    struct SingleReviewResponse: Decodable {
        let success: Bool?
        let review: Review?
    }
    
    func getListingReviews(listingId: String) async throws -> [Review] {
        let response: ReviewsResponse = try await APIService.shared.authenticatedRequest(
            "/reviews/listing/\(listingId)",
            method: "GET"
        )
        return response.reviews ?? []
    }
    
    func createReview(listingId: String, rating: Int, reviewText: String) async throws -> Review {
        let requestBody = CreateReviewRequest(listingId: listingId, rating: rating, reviewText: reviewText)
        let bodyData = try encoder.encode(requestBody)
        
        let response: SingleReviewResponse = try await APIService.shared.authenticatedRequest(
            "/reviews",
            method: "POST",
            body: bodyData
        )
        guard let review = response.review else {
            throw APIError.decodingError
        }
        return review
    }
    
    func deleteReview(reviewId: String) async throws {
        struct DeleteResponse: Decodable { let success: Bool? }
        let _: DeleteResponse = try await APIService.shared.authenticatedRequest(
            "/reviews/\(reviewId)",
            method: "DELETE"
        )
    }
}

// MARK: - Reviews ViewModel
@MainActor
class ListingReviewsViewModel: ObservableObject {
    @Published var reviews: [Review] = []
    @Published var isLoading = false
    @Published var error: String?
    
    var averageRating: Double {
        guard !reviews.isEmpty else { return 0 }
        let sum = reviews.reduce(0) { $0 + $1.rating }
        return Double(sum) / Double(reviews.count)
    }
    
    func loadReviews(for listingId: String) async {
        isLoading = true
        do {
            reviews = try await ReviewService.shared.getListingReviews(listingId: listingId)
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }
}

// MARK: - Review Card
struct ReviewCard: View {
    let review: Review
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Header
            HStack(spacing: 12) {
                // Avatar
                Circle()
                    .fill(Color.collegioOrange.opacity(0.2))
                    .frame(width: 40, height: 40)
                    .overlay {
                        Text(String(review.reviewerName.prefix(1)))
                            .font(.headline)
                            .foregroundStyle(Color.collegioOrange)
                    }
                
                VStack(alignment: .leading, spacing: 2) {
                    Text(review.reviewerName)
                        .font(.subheadline.weight(.semibold))
                    Text(review.formattedDate)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                
                Spacer()
                
                // Stars
                HStack(spacing: 2) {
                    ForEach(1...5, id: \.self) { star in
                        Image(systemName: star <= review.rating ? "star.fill" : "star")
                            .font(.caption)
                            .foregroundStyle(star <= review.rating ? .yellow : .secondary)
                    }
                }
            }
            
            // Review Text
            Text(review.reviewText)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .lineLimit(4)
        }
        .padding()
        .glassCard()
    }
}

// MARK: - Write Review Sheet
struct WriteReviewSheet: View {
    let listingId: String
    let onComplete: () -> Void
    @Environment(\.dismiss) private var dismiss
    @State private var rating = 0
    @State private var reviewText = ""
    @State private var isSubmitting = false
    @State private var error: String?
    
    var body: some View {
        NavigationStack {
            ZStack {
                GradientBackground()
                
                ScrollView {
                    VStack(spacing: 24) {
                        // Star Rating
                        VStack(spacing: 12) {
                            Text("How was your experience?")
                                .font(.headline)
                            
                            HStack(spacing: 12) {
                                ForEach(1...5, id: \.self) { star in
                                    Button {
                                        rating = star
                                    } label: {
                                        Image(systemName: star <= rating ? "star.fill" : "star")
                                            .font(.system(size: 32))
                                            .foregroundStyle(star <= rating ? .yellow : .secondary)
                                    }
                                }
                            }
                            
                            Text(ratingLabel)
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }
                        .padding(.top, 20)
                        
                        // Review Text
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Your Review")
                                .font(.headline)
                            
                            TextEditor(text: $reviewText)
                                .frame(height: 150)
                                .padding(12)
                                .scrollContentBackground(.hidden)
                                .background(Color.white.opacity(0.1), in: RoundedRectangle(cornerRadius: 12))
                                .overlay {
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(Color.white.opacity(0.2), lineWidth: 1)
                                }
                                .overlay {
                                    if reviewText.isEmpty {
                                        Text("Share your experience with this property...")
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
                            Task { await submitReview() }
                        } label: {
                            HStack {
                                if isSubmitting {
                                    ProgressView()
                                        .tint(.white)
                                }
                                Text(isSubmitting ? "Submitting..." : "Submit Review")
                            }
                            .font(.headline)
                            .foregroundStyle(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(canSubmit ? Color.collegioOrange : Color.gray)
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                        }
                        .disabled(!canSubmit || isSubmitting)
                    }
                    .padding()
                    .padding(.bottom, 50)
                }
            }
            .navigationTitle("Write a Review")
            .navigationBarTitleDisplayMode(.inline)
        }
        .presentationDetents([.medium, .large])
        .presentationDragIndicator(.visible)
    }
    
    private var canSubmit: Bool {
        rating > 0 && !reviewText.trimmingCharacters(in: .whitespaces).isEmpty
    }
    
    private var ratingLabel: String {
        switch rating {
        case 1: return "Poor"
        case 2: return "Fair"
        case 3: return "Good"
        case 4: return "Very Good"
        case 5: return "Excellent"
        default: return "Tap to rate"
        }
    }
    
    private func submitReview() async {
        isSubmitting = true
        error = nil
        
        do {
            _ = try await ReviewService.shared.createReview(
                listingId: listingId,
                rating: rating,
                reviewText: reviewText
            )
            onComplete()
            dismiss()
        } catch {
            self.error = "Failed to submit review. Please try again."
        }
        
        isSubmitting = false
    }
}

// MARK: - All Reviews View
struct AllReviewsView: View {
    let reviews: [Review]
    
    var body: some View {
        ZStack {
            GradientBackground()
            
            ScrollView {
                LazyVStack(spacing: 12) {
                    ForEach(reviews) { review in
                        ReviewCard(review: review)
                    }
                }
                .padding()
                .padding(.bottom, 100)
            }
        }
        .navigationTitle("All Reviews")
        .navigationBarTitleDisplayMode(.inline)
    }
}

#Preview {
    NavigationStack {
        AllReviewsView(reviews: [])
    }
}
