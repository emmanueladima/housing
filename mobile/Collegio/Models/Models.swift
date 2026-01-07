import Foundation
import CoreLocation

// MARK: - Landlord Info (nested in Listing)
struct LandlordInfo: Codable, Identifiable {
    let id: String
    let firstName: String?
    let lastName: String?
    let isVerifiedLandlord: Bool?
    
    var fullName: String {
        [firstName, lastName].compactMap { $0 }.joined(separator: " ")
    }
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case firstName
        case lastName
        case isVerifiedLandlord
    }
}

// MARK: - Listing Model
struct Listing: Identifiable, Codable {
    let id: String
    let title: String
    let address: String
    let price: Double
    let bedrooms: Int
    let bathrooms: Double
    let images: [String]?
    let city: String?
    let state: String?
    let distanceToUniversity: Double?
    let isActive: Bool?
    let landlord: LandlordInfo? // Changed from String to object
    let createdAt: Date?
    let description: String?
    let amenities: [String]?
    let sqft: Int?
    let zipCode: String?
    let averageRating: Double?
    
    // Map backend field names to iOS property names
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case title
        case address
        case price = "rent"
        case bedrooms
        case bathrooms
        case images
        case city
        case state
        case distanceToUniversity
        case isActive
        case landlord
        case createdAt
        case description
        case amenities
        case sqft
        case zipCode
        case averageRating
    }
    
    var imageUrl: String? { images?.first }
    var distance: Double? { distanceToUniversity }
    var isAvailable: Bool { isActive ?? true }
    
    var formattedPrice: String {
        "$\(Int(price))/mo"
    }
    
    var bedroomsText: String {
        "\(bedrooms) bed"
    }
    
    var bathroomsText: String {
        bathrooms == floor(bathrooms) ? "\(Int(bathrooms)) bath" : "\(bathrooms) bath"
    }
    
    var fullAddress: String {
        [address, city, state].compactMap { $0 }.joined(separator: ", ")
    }
    
    // Generate coordinates around Corvallis for demo
    var coordinate: CLLocationCoordinate2D {
        let hash = id.hashValue
        let latOffset = Double(hash % 100) / 10000.0
        let lonOffset = Double((hash / 100) % 100) / 10000.0
        return CLLocationCoordinate2D(
            latitude: 44.5646 + latOffset,
            longitude: -123.2620 + lonOffset
        )
    }
}


// MARK: - User Model
struct User: Identifiable, Codable {
    let id: String
    let email: String
    let firstName: String
    let lastName: String
    let profileImage: String?
    let userType: UserType? // Optional - not always included in nested populates
    var isVerified: Bool?
    var hasLifestyleProfile: Bool?
    let phone: String?
    let school: String?
    let graduationYear: Int?
    
    var fullName: String {
        "\(firstName) \(lastName)"
    }
    
    var initials: String {
        let first = firstName.prefix(1).uppercased()
        let last = lastName.prefix(1).uppercased()
        return "\(first)\(last)"
    }
}

enum UserType: String, Codable {
    case student
    case landlord
}

// MARK: - Lifestyle Profile (Roommate Matching)
struct LifestyleProfile: Identifiable, Codable {
    let id: String
    let user: User?
    
    // Profile photo
    let photo: String?
    
    // Basics
    let bio: String?
    let gender: String?
    let age: Int?
    let lookingForRoommate: Bool?
    
    // Habits
    let cleanliness: Int? // 1-10
    let noiseLevel: Int? // 1-10
    let sleepTime: String?
    let wakeTime: String?
    let guestsFrequency: String?
    let smoking: String?
    let drinking: Bool?
    
    // Pets
    let hasPets: Bool?
    let petAllergies: Bool?
    
    // Preferences
    let budgetMin: Double?
    let budgetMax: Double?
    let vibeTags: [String]?
    let interests: [String]?
    
    // Backend returns _id
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case user
        case photo
        case bio
        case gender
        case age
        case lookingForRoommate
        case cleanliness
        case noiseLevel
        case sleepTime
        case wakeTime
        case guestsFrequency
        case smoking
        case drinking
        case hasPets
        case petAllergies
        case budgetMin
        case budgetMax
        case vibeTags
        case interests
    }
}

// MARK: - Community Post
struct CommunityPost: Identifiable, Codable {
    let id: String
    let authorId: String
    let author: User?
    let channel: String
    let intent: String?
    let title: String
    let content: String
    let likesCount: Int
    let commentsCount: Int
    let createdAt: Date
    let isLiked: Bool?
}

// MARK: - Message / Conversation
struct Conversation: Identifiable, Codable {
    let id: String
    let participants: [User]
    let lastMessage: Message?
    let unreadCount: Int
    let updatedAt: Date
}

struct Message: Identifiable, Codable {
    let id: String
    let conversationId: String
    let senderId: String
    let content: String
    let createdAt: Date
    let isRead: Bool
}

// MARK: - Sample Data for Previews
extension Listing {
    static let sample = Listing(
        id: "sample1",
        title: "Modern 2BR Apartment",
        address: "123 College Ave",
        price: 1200,
        bedrooms: 2,
        bathrooms: 1.5,
        images: ["room1", "room2"],
        city: "Corvallis",
        state: "OR",
        distanceToUniversity: 0.5,
        isActive: true,
        landlord: nil,
        createdAt: Date(),
        description: "A modern apartment near campus",
        amenities: ["WiFi", "Parking"],
        sqft: 900,
        zipCode: "97330",
        averageRating: 4.5
    )
    
    static let samples = [
        sample,
        Listing(
            id: "sample2",
            title: "Cozy Studio Apartment",
            address: "456 University St",
            price: 850,
            bedrooms: 1,
            bathrooms: 1,
            images: [],
            city: "Corvallis",
            state: "OR",
            distanceToUniversity: 0.3,
            isActive: true,
            landlord: nil,
            createdAt: Date(),
            description: nil,
            amenities: nil,
            sqft: nil,
            zipCode: nil,
            averageRating: nil
        ),
        Listing(
            id: "sample3",
            title: "Spacious 3BR House",
            address: "789 Oak Lane",
            price: 2100,
            bedrooms: 3,
            bathrooms: 2,
            images: [],
            city: "Corvallis",
            state: "OR",
            distanceToUniversity: 1.2,
            isActive: true,
            landlord: nil,
            createdAt: Date(),
            description: nil,
            amenities: nil,
            sqft: nil,
            zipCode: nil,
            averageRating: nil
        )
    ]
}

extension User {
    static let sample = User(
        id: "user1",
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        profileImage: nil,
        userType: .student,
        isVerified: true,
        hasLifestyleProfile: true,
        phone: "555-123-4567",
        school: "Oregon State University",
        graduationYear: 2026
    )
}

extension LifestyleProfile {
    static let sample = LifestyleProfile(
        id: "lp1",
        user: User.sample,
        photo: nil,
        bio: "CS major looking for a chill roommate!",
        gender: "male",
        age: 21,
        lookingForRoommate: true,
        cleanliness: 7,
        noiseLevel: 5,
        sleepTime: "23:00",
        wakeTime: "08:00",
        guestsFrequency: "sometimes",
        smoking: "non-smoker",
        drinking: false,
        hasPets: false,
        petAllergies: false,
        budgetMin: 500,
        budgetMax: 900,
        vibeTags: ["Chill", "Studious"],
        interests: ["Coding", "Gaming"]
    )
}
