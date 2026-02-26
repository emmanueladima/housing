import Foundation

// MARK: - Application Models (for API communication)

struct ApplicationResponse: Decodable {
    let success: Bool
    let applications: [ApplicationData]
}

struct SingleApplicationResponse: Decodable {
    let success: Bool
    let application: ApplicationData
}

struct ApplicationSubmitResponse: Decodable {
    let success: Bool
    let message: String?
    let application: ApplicationData?
}

struct ApplicationData: Identifiable, Decodable {
    let id: String
    let userId: String?
    let listingId: ListingRef?
    let status: String
    let moveInDate: String?
    let leaseTerm: String?
    let coverLetter: String?
    let messageToLandlord: String?
    let landlordResponse: LandlordResponseData?
    let tourScheduled: TourData?
    let statusHistory: [StatusHistoryEntry]?
    let createdAt: String?
    let updatedAt: String?
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case userId, listingId, status, moveInDate, leaseTerm
        case coverLetter, messageToLandlord
        case landlordResponse, tourScheduled, statusHistory
        case createdAt, updatedAt
    }
    
    var statusEnum: ApplicationStatus {
        ApplicationStatus(rawValue: status) ?? .submitted
    }
    
    var formattedDate: Date? {
        guard let dateStr = createdAt else { return nil }
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return formatter.date(from: dateStr) ?? ISO8601DateFormatter().date(from: dateStr)
    }
    
    var moveInDateFormatted: Date? {
        guard let dateStr = moveInDate else { return nil }
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return formatter.date(from: dateStr) ?? ISO8601DateFormatter().date(from: dateStr)
    }
}

// MARK: - Nested Types

struct ListingRef: Decodable, Identifiable {
    let id: String
    let title: String?
    let address: String?
    let rent: Int?
    let images: [String]?
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case title, address, rent, images
    }
}

struct LandlordResponseData: Decodable {
    let message: String?
    let date: String?
}

struct TourData: Decodable {
    let date: String?
    let time: String?
    let confirmed: Bool?
    let location: String?
    let meetingLink: String?
    let notes: String?
}

struct StatusHistoryEntry: Decodable, Identifiable {
    var id: String { "\(status ?? "")-\(changedAt ?? "")" }
    let status: String?
    let changedAt: String?
    let note: String?
}

// MARK: - Application Status

enum ApplicationStatus: String, CaseIterable {
    case submitted = "submitted"
    case underReview = "under_review"
    case interviewScheduled = "interview_scheduled"
    case approved = "approved"
    case rejected = "rejected"
    case withdrawn = "withdrawn"
    
    var displayName: String {
        switch self {
        case .submitted: return "Submitted"
        case .underReview: return "Under Review"
        case .interviewScheduled: return "Interview"
        case .approved: return "Approved"
        case .rejected: return "Rejected"
        case .withdrawn: return "Withdrawn"
        }
    }
    
    var color: String {
        switch self {
        case .submitted: return "blue"
        case .underReview: return "yellow"
        case .interviewScheduled: return "purple"
        case .approved: return "green"
        case .rejected: return "red"
        case .withdrawn: return "gray"
        }
    }
    
    var icon: String {
        switch self {
        case .submitted: return "doc.text.fill"
        case .underReview: return "eye.fill"
        case .interviewScheduled: return "calendar"
        case .approved: return "checkmark.circle.fill"
        case .rejected: return "xmark.circle.fill"
        case .withdrawn: return "arrow.uturn.left"
        }
    }
    
    var isActive: Bool {
        switch self {
        case .submitted, .underReview, .interviewScheduled: return true
        case .approved, .rejected, .withdrawn: return false
        }
    }
}

// MARK: - Lease Term

enum LeaseTerm: String, CaseIterable, Identifiable {
    case monthToMonth = "month-to-month"
    case sixMonths = "6-months"
    case oneYear = "1-year"
    case academicYear = "academic-year"
    
    var id: String { rawValue }
    
    var displayName: String {
        switch self {
        case .monthToMonth: return "Month to Month"
        case .sixMonths: return "6 Months"
        case .oneYear: return "1 Year"
        case .academicYear: return "Academic Year"
        }
    }
}
