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

// MARK: - Listing Rules (nested in Listing)
struct ListingRules: Codable {
    let petsAllowed: Bool?
    let smokingAllowed: Bool?
    let partiesAllowed: Bool?
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
    let landlord: LandlordInfo?
    let createdAt: Date?
    let description: String?
    let amenities: [String]?
    let sqft: Int?
    let zipCode: String?
    let averageRating: Double?
    
    // Additional fields from backend
    let leaseTerm: String?
    let availableDate: Date?
    let rules: ListingRules?
    let university: String?
    let tags: [String]?
    let listingType: String?
    
    // Computed property for display
    var listingTypeDisplay: String {
        switch listingType {
        case "private-room": return "Private Room"
        case "shared-room": return "Shared Room"
        case "entire-place": return "Entire Place"
        default: return "Entire Place"
        }
    }
    
    var isRoom: Bool {
        listingType == "private-room" || listingType == "shared-room"
    }
    
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
        case leaseTerm
        case availableDate
        case rules
        case university
        case tags
        case listingType
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
    let email: String?
    let firstName: String?
    let lastName: String?
    let profileImage: String?
    let userType: UserType?
    var isVerified: Bool?
    var hasLifestyleProfile: Bool?
    let phone: String?
    let school: String?

    let graduationYear: Int?
    let username: String?
    
    enum CodingKeys: String, CodingKey {
        case id
        case _id
        case email
        case firstName
        case lastName
        case profileImage
        case userType
        case isVerified
        case hasLifestyleProfile
        case phone
        case school

        case graduationYear
        case username
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        
        // Handle both "id" and "_id" field names
        if let mongoId = try container.decodeIfPresent(String.self, forKey: ._id) {
            id = mongoId
        } else if let plainId = try container.decodeIfPresent(String.self, forKey: .id) {
            id = plainId
        } else {
            throw DecodingError.keyNotFound(CodingKeys.id, DecodingError.Context(codingPath: decoder.codingPath, debugDescription: "Neither 'id' nor '_id' found"))
        }
        
        email = try container.decodeIfPresent(String.self, forKey: .email)
        firstName = try container.decodeIfPresent(String.self, forKey: .firstName)
        lastName = try container.decodeIfPresent(String.self, forKey: .lastName)
        profileImage = try container.decodeIfPresent(String.self, forKey: .profileImage)
        userType = try container.decodeIfPresent(UserType.self, forKey: .userType)
        isVerified = try container.decodeIfPresent(Bool.self, forKey: .isVerified)
        hasLifestyleProfile = try container.decodeIfPresent(Bool.self, forKey: .hasLifestyleProfile)
        phone = try container.decodeIfPresent(String.self, forKey: .phone)
        school = try container.decodeIfPresent(String.self, forKey: .school)

        graduationYear = try container.decodeIfPresent(Int.self, forKey: .graduationYear)
        username = try container.decodeIfPresent(String.self, forKey: .username)
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(id, forKey: .id)
        try container.encodeIfPresent(email, forKey: .email)
        try container.encodeIfPresent(firstName, forKey: .firstName)
        try container.encodeIfPresent(lastName, forKey: .lastName)
        try container.encodeIfPresent(profileImage, forKey: .profileImage)
        try container.encodeIfPresent(userType, forKey: .userType)
        try container.encodeIfPresent(isVerified, forKey: .isVerified)
        try container.encodeIfPresent(hasLifestyleProfile, forKey: .hasLifestyleProfile)
        try container.encodeIfPresent(phone, forKey: .phone)
        try container.encodeIfPresent(school, forKey: .school)

        try container.encodeIfPresent(graduationYear, forKey: .graduationYear)
        try container.encodeIfPresent(username, forKey: .username)
    }
    
    // Memberwise initializer for creating instances in code
    init(
        id: String,
        email: String?,
        firstName: String?,
        lastName: String?,
        profileImage: String?,
        userType: UserType?,
        isVerified: Bool?,
        hasLifestyleProfile: Bool?,
        phone: String?,
        school: String?,

        graduationYear: Int?,
        username: String?
    ) {
        self.id = id
        self.email = email
        self.firstName = firstName
        self.lastName = lastName
        self.profileImage = profileImage
        self.userType = userType
        self.isVerified = isVerified
        self.hasLifestyleProfile = hasLifestyleProfile
        self.phone = phone
        self.school = school

        self.graduationYear = graduationYear
        self.username = username
    }
    
    var fullName: String {
        [firstName, lastName].compactMap { $0 }.joined(separator: " ")
    }
    
    var initials: String {
        let first = (firstName?.prefix(1) ?? "").uppercased()
        let last = (lastName?.prefix(1) ?? "").uppercased()
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
    let authorId: String?
    let author: User?
    let channel: String
    let intent: String?
    let title: String
    let content: String
    let likesCount: Int?
    let commentsCount: Int?
    let createdAt: Date?
    let isLiked: Bool?
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case authorId = "author"  // Backend sends "author" - can be string ID or User object
        case channel
        case intent
        case title
        case content = "description"
        case likesCount = "likeCount"
        case commentsCount = "commentCount"
        case createdAt
        case isLiked
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(String.self, forKey: .id)
        channel = try container.decode(String.self, forKey: .channel)
        intent = try container.decodeIfPresent(String.self, forKey: .intent)
        title = try container.decode(String.self, forKey: .title)
        content = try container.decodeIfPresent(String.self, forKey: .content) ?? ""
        likesCount = try container.decodeIfPresent(Int.self, forKey: .likesCount)
        commentsCount = try container.decodeIfPresent(Int.self, forKey: .commentsCount)
        createdAt = try container.decodeIfPresent(Date.self, forKey: .createdAt)
        isLiked = try container.decodeIfPresent(Bool.self, forKey: .isLiked)
        
        // Handle author - can be either a string ID or a nested User object
        if let authorUser = try? container.decode(User.self, forKey: .authorId) {
            author = authorUser
            authorId = authorUser.id
        } else {
            author = nil
            authorId = try container.decodeIfPresent(String.self, forKey: .authorId)
        }
    }
    
    // Memberwise init for creating instances in code
    init(id: String, authorId: String?, author: User?, channel: String, intent: String?, title: String, content: String, likesCount: Int?, commentsCount: Int?, createdAt: Date?, isLiked: Bool?) {
        self.id = id
        self.authorId = authorId
        self.author = author
        self.channel = channel
        self.intent = intent
        self.title = title
        self.content = content
        self.likesCount = likesCount
        self.commentsCount = commentsCount
        self.createdAt = createdAt
        self.isLiked = isLiked
    }
}

// MARK: - Message / Conversation
struct Conversation: Identifiable, Codable {
    let id: String
    let participants: [User]
    let lastMessage: String?
    let lastMessageAt: Date?
    let unreadCount: Int
    let type: String?
}

struct Message: Identifiable, Codable {
    let id: String
    let threadId: String?
    let sender: User?
    let content: String
    let createdAt: Date
    let attachments: [String]?
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case threadId = "thread"
        case sender
        case content
        case createdAt
        case attachments
    }
    
    // Memberwise init for creating instances in code
    init(id: String, threadId: String?, sender: User?, content: String, createdAt: Date, attachments: [String]?) {
        self.id = id
        self.threadId = threadId
        self.sender = sender
        self.content = content
        self.createdAt = createdAt
        self.attachments = attachments
    }
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
        averageRating: 4.5,
        leaseTerm: "1-year",
        availableDate: Date(),
        rules: ListingRules(petsAllowed: false, smokingAllowed: false, partiesAllowed: false),
        university: "Oregon State University",
        tags: ["apartment"],
        listingType: "entire-place"
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
            averageRating: nil,
            leaseTerm: nil,
            availableDate: nil,
            rules: nil,
            university: nil,
            tags: nil,
            listingType: "private-room"
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
            averageRating: nil,
            leaseTerm: nil,
            availableDate: nil,
            rules: nil,
            university: nil,
            tags: nil,
            listingType: nil
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

        graduationYear: 2026,
        username: "jdoe"
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
