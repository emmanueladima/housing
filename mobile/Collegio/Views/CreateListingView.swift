import SwiftUI
import UIKit

// MARK: - Create Listing View (5-Step Wizard like Website)
struct CreateListingView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var step = 1
    @State private var isLoading = false
    
    // Form Data
    @State private var title = ""
    @State private var listingDescription = ""
    @State private var listingType = "entire-place"
    @State private var isSublease = false
    @State private var address = ""
    @State private var city = ""
    @State private var state = ""
    @State private var zipCode = ""
    @State private var university = "Oregon State University"
    @State private var rent = ""
    @State private var leaseTerm = "academic-year"
    @State private var bedrooms = ""
    @State private var bathrooms = ""
    @State private var sqft = ""
    @State private var availableDate = Date()
    @State private var selectedAmenities: Set<String> = []
    @State private var selectedImages: [UIImage] = []
    @State private var showImagePicker = false
    @State private var errorMessage: String?
    @State private var showError = false
    
    private let totalSteps = 5
    
    var body: some View {
        NavigationStack {
            ZStack {
                GradientBackground()
                
                VStack(spacing: 0) {
                    // Progress Bar
                    progressBar
                    
                    // Step Header
                    stepHeader
                    
                    // Content
                    ScrollView {
                        VStack(spacing: 20) {
                            switch step {
                            case 1: basicsStep
                            case 2: locationStep
                            case 3: detailsStep
                            case 4: amenitiesStep
                            case 5: photosStep
                            default: EmptyView()
                            }
                        }
                        .padding()
                    }
                    
                    // Footer
                    footerButtons
                }
            }
            .navigationTitle("")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") { dismiss() }
                }
            }
            .sheet(isPresented: $showImagePicker) {
                ImagePickerView(selectedImages: $selectedImages)
            }
            .alert("Error", isPresented: $showError) {
                Button("OK", role: .cancel) { }
            } message: {
                Text(errorMessage ?? "Something went wrong")
            }
        }
    }
    
    // MARK: - Step Info
    private var stepInfo: (title: String, subtitle: String, icon: String) {
        switch step {
        case 1: return ("Basics", "Start with the main details of your place", "house.fill")
        case 2: return ("Location", "Where is this place located?", "mappin.circle.fill")
        case 3: return ("Details", "The nitty-gritty details", "dollarsign.circle.fill")
        case 4: return ("Amenities", "What makes this place special?", "sparkles")
        case 5: return ("Photos", "Show off the place with great photos", "photo.fill")
        default: return ("", "", "")
        }
    }
    
    // MARK: - Progress Bar
    private var progressBar: some View {
        HStack(spacing: 8) {
            ForEach(1...totalSteps, id: \.self) { s in
                RoundedRectangle(cornerRadius: 4)
                    .fill(s <= step ? Color.collegioOrange : Color.gray.opacity(0.3))
                    .frame(height: 4)
            }
        }
        .padding()
    }
    
    // MARK: - Step Header
    private var stepHeader: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Image(systemName: stepInfo.icon)
                    .font(.title2)
                    .foregroundStyle(Color.collegioOrange)
                Text(stepInfo.title)
                    .font(.title.bold())
            }
            Text(stepInfo.subtitle)
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal)
    }
    
    // MARK: - Step 1: Basics
    private var basicsStep: some View {
        VStack(alignment: .leading, spacing: 20) {
            // Title
            FormField(label: "Listing Title", required: true) {
                TextField("e.g. Spacious 2BR near Campus", text: $title)
                    .textFieldStyle(.plain)
                    .padding()
                    .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
            }
            
            // Description
            FormField(label: "Description", required: true) {
                TextEditor(text: $listingDescription)
                    .scrollContentBackground(.hidden)
                    .frame(height: 120)
                    .padding(12)
                    .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
            }
            
            // Listing Type Selection
            VStack(alignment: .leading, spacing: 12) {
                HStack(spacing: 4) {
                    Text("What are you listing?")
                        .font(.subheadline.weight(.semibold))
                    Text("*")
                        .foregroundStyle(.red)
                }
                
                HStack(spacing: 12) {
                    ListingTypeButton(
                        title: "Entire Place",
                        subtitle: "Whole apartment or house",
                        icon: "house.fill",
                        isSelected: listingType == "entire-place"
                    ) {
                        listingType = "entire-place"
                    }
                    
                    ListingTypeButton(
                        title: "Private Room",
                        subtitle: "Room in a shared unit",
                        icon: "bed.double.fill",
                        isSelected: listingType == "private-room"
                    ) {
                        listingType = "private-room"
                    }
                }
            }
            
            // Sublease Toggle
            Toggle(isOn: $isSublease) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("This is a sublease")
                        .font(.headline)
                    Text("Check if you're subleasing your current lease")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            .tint(Color.collegioOrange)
            .padding()
            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 16))
        }
    }
    
    // MARK: - Step 2: Location
    @State private var addressQuery = ""
    @State private var showSuggestions = false
    @State private var suggestions: [AddressSuggestion] = []
    
    private var locationStep: some View {
        VStack(alignment: .leading, spacing: 20) {
            // Address Search Field
            VStack(alignment: .leading, spacing: 8) {
                HStack(spacing: 4) {
                    Text("Street Address")
                        .font(.subheadline.weight(.semibold))
                    Text("*")
                        .foregroundStyle(.red)
                }
                
                TextField("Start typing address...", text: $addressQuery)
                    .textFieldStyle(.plain)
                    .padding()
                    .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
                    .onChange(of: addressQuery) { _, newValue in
                        if newValue.count > 2 && newValue != address {
                            searchAddress(query: newValue)
                        } else if newValue.isEmpty {
                            suggestions = []
                            showSuggestions = false
                        }
                    }
                
                // Address Suggestions Dropdown
                if showSuggestions && !suggestions.isEmpty {
                    VStack(alignment: .leading, spacing: 0) {
                        ForEach(suggestions) { suggestion in
                            Button {
                                selectAddress(suggestion)
                            } label: {
                                VStack(alignment: .leading, spacing: 2) {
                                    // Street name (bold)
                                    Text(suggestion.text)
                                        .font(.subheadline.weight(.semibold))
                                        .foregroundStyle(.primary)
                                    // Full address (secondary)
                                    Text(suggestion.placeName)
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                        .lineLimit(1)
                                }
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .padding(.vertical, 10)
                                .padding(.horizontal, 14)
                                .contentShape(Rectangle())
                            }
                            .buttonStyle(.plain)
                            
                            if suggestion.id != suggestions.last?.id {
                                Divider().padding(.horizontal, 14)
                            }
                        }
                    }
                    .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
                    .shadow(color: .black.opacity(0.2), radius: 6, y: 3)
                }
            }
            
            HStack(spacing: 12) {
                FormField(label: "City", required: true) {
                    TextField("City", text: $city)
                        .textFieldStyle(.plain)
                        .padding()
                        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
                }
                
                FormField(label: "State", required: true) {
                    TextField("State", text: $state)
                        .textFieldStyle(.plain)
                        .padding()
                        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
                }
            }
            
            HStack(spacing: 12) {
                FormField(label: "ZIP Code", required: true) {
                    TextField("ZIP", text: $zipCode)
                        .keyboardType(.numberPad)
                        .textFieldStyle(.plain)
                        .padding()
                        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
                }
                
                FormField(label: "Nearby University") {
                    TextField("University", text: $university)
                        .textFieldStyle(.plain)
                        .padding()
                        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
                }
            }
        }
    }
    
    // MARK: - Mapbox Logic
    private func searchAddress(query: String) {
        // Debounce can be added here, but for simplicity call directly
        guard let token = Bundle.main.object(forInfoDictionaryKey: "MBXAccessToken") as? String else { return }
        let urlString = "https://api.mapbox.com/geocoding/v5/mapbox.places/\(query.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "").json?access_token=\(token)&types=address&country=us"
        
        guard let url = URL(string: urlString) else { return }
        
        Task {
            do {
                let (data, _) = try await URLSession.shared.data(from: url)
                let response = try JSONDecoder().decode(MapboxGeocodingResponse.self, from: data)
                await MainActor.run {
                    self.suggestions = response.features.map { feature in
                        AddressSuggestion(
                            id: feature.id,
                            text: feature.text,
                            placeName: feature.place_name,
                            context: feature.context ?? []
                        )
                    }
                    self.showSuggestions = true
                }
            } catch {
                print("Geocoding error: \(error)")
            }
        }
    }
    
    private func selectAddress(_ suggestion: AddressSuggestion) {
        address = suggestion.placeName.components(separatedBy: ",").first ?? suggestion.text
        addressQuery = address
        
        // Parse context for City, State, ZIP
        for context in suggestion.context {
            if context.id.starts(with: "place") {
                city = context.text
            } else if context.id.starts(with: "region") {
                state = context.text
            } else if context.id.starts(with: "postcode") {
                zipCode = context.text
            }
        }
        
        showSuggestions = false
    }

    // Models for Mapbox
    struct MapboxGeocodingResponse: Decodable {
        let features: [MapboxFeature]
    }

    struct MapboxFeature: Decodable {
        let id: String
        let text: String
        let place_name: String
        let context: [MapboxContext]?
    }

    struct MapboxContext: Decodable {
        let id: String
        let text: String
    }

    struct AddressSuggestion: Identifiable {
        let id: String
        let text: String
        let placeName: String
        let context: [MapboxContext]
    }
    
    // MARK: - Step 3: Details
    private var detailsStep: some View {
        VStack(alignment: .leading, spacing: 20) {
            HStack(spacing: 12) {
                // Monthly Rent - 50% width
                VStack(alignment: .leading, spacing: 6) {
                    HStack(spacing: 4) {
                        Text("Monthly Rent")
                            .font(.subheadline.weight(.semibold))
                        Text("*")
                            .foregroundStyle(.red)
                    }
                    HStack {
                        Text("$")
                            .foregroundStyle(.secondary)
                        TextField("0", text: $rent)
                            .keyboardType(.numberPad)
                    }
                    .padding()
                    .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
                }
                .frame(maxWidth: .infinity)
                
                // Lease Term - 50% width
                VStack(alignment: .leading, spacing: 6) {
                    Text("Lease Term")
                        .font(.subheadline.weight(.semibold))
                    Picker("", selection: $leaseTerm) {
                        Text("Academic Year").tag("academic-year")
                        Text("1 Year").tag("1-year")
                        Text("6 Months").tag("6-months")
                        Text("Fall Term").tag("fall-term")
                        Text("Spring Term").tag("spring-term")
                        Text("Summer Term").tag("summer-term")
                        Text("Month-to-Month").tag("month-to-month")
                        Text("Flexible").tag("flexible")
                    }
                    .pickerStyle(.menu)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
                    .lineLimit(1)
                    .truncationMode(.tail)
                }
                .frame(maxWidth: .infinity)
            }
            
            HStack(spacing: 12) {
                FormField(label: "Bedrooms", required: true) {
                    TextField("0", text: $bedrooms)
                        .keyboardType(.numberPad)
                        .multilineTextAlignment(.center)
                        .padding()
                        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
                }
                
                FormField(label: "Bathrooms", required: true) {
                    TextField("0", text: $bathrooms)
                        .keyboardType(.decimalPad)
                        .multilineTextAlignment(.center)
                        .padding()
                        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
                }
                
                FormField(label: "Sq Ft") {
                    TextField("0", text: $sqft)
                        .keyboardType(.numberPad)
                        .multilineTextAlignment(.center)
                        .padding()
                        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
                }
            }
            
            FormField(label: "Available Date", required: true) {
                DatePicker("", selection: $availableDate, displayedComponents: .date)
                    .datePickerStyle(.compact)
                    .labelsHidden()
                    .padding()
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
            }
        }
    }
    
    // MARK: - Step 4: Amenities
    private var amenitiesStep: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Select all that apply")
                .font(.subheadline)
                .foregroundStyle(.secondary)
            
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                ForEach(Amenity.allCases, id: \.self) { amenity in
                    AmenityButton(
                        amenity: amenity,
                        isSelected: selectedAmenities.contains(amenity.rawValue),
                        action: {
                            if selectedAmenities.contains(amenity.rawValue) {
                                selectedAmenities.remove(amenity.rawValue)
                            } else {
                                selectedAmenities.insert(amenity.rawValue)
                            }
                        }
                    )
                }
            }
        }
    }
    
    // MARK: - Step 5: Photos
    private var photosStep: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("Add up to 5 photos. First photo will be the cover.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                Text("*")
                    .foregroundStyle(.red)
            }
            
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                ForEach(Array(selectedImages.enumerated()), id: \.offset) { index, image in
                    ZStack(alignment: .topTrailing) {
                        Image(uiImage: image)
                            .resizable()
                            .scaledToFill()
                            .frame(height: 100)
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                        
                        if index == 0 {
                            Text("Cover")
                                .font(.caption2.bold())
                                .foregroundStyle(.white)
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(Color.collegioOrange)
                                .clipShape(RoundedRectangle(cornerRadius: 6))
                                .padding(4)
                        }
                        
                        Button {
                            selectedImages.remove(at: index)
                        } label: {
                            Image(systemName: "xmark.circle.fill")
                                .font(.title3)
                                .symbolRenderingMode(.palette)
                                .foregroundStyle(.white, .red)
                        }
                        .padding(4)
                    }
                }
                
                if selectedImages.count < 5 {
                    Button(action: { showImagePicker = true }) {
                        VStack(spacing: 8) {
                            Image(systemName: "plus.circle.fill")
                                .font(.title)
                            Text("Add Photo")
                                .font(.caption.bold())
                            Text("\(5 - selectedImages.count) remaining")
                                .font(.caption2)
                                .foregroundStyle(.secondary)
                        }
                        .foregroundStyle(Color.collegioOrange)
                        .frame(height: 100)
                        .frame(maxWidth: .infinity)
                        .background(
                            RoundedRectangle(cornerRadius: 12)
                                .strokeBorder(style: StrokeStyle(lineWidth: 2, dash: [8]))
                                .foregroundStyle(Color.collegioOrange.opacity(0.5))
                        )
                    }
                }
            }
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
            
            Button(action: handleNext) {
                HStack {
                    Text(step == totalSteps ? (isLoading ? "Creating..." : "Publish Listing") : "Continue")
                    Image(systemName: step == totalSteps ? "checkmark" : "arrow.right")
                }
                .font(.headline)
                .foregroundStyle(.white)
                .padding(.horizontal, 24)
                .padding(.vertical, 14)
                .background(
                    LinearGradient(colors: [Color.collegioOrange, Color.collegioOrangeLight], startPoint: .leading, endPoint: .trailing),
                    in: Capsule()
                )
                .shadow(color: Color.collegioOrange.opacity(0.4), radius: 8, y: 4)
            }
            .disabled(isLoading || !canProceed)
        }
        .padding()
    }
    
    // MARK: - Validation
    private var canProceed: Bool {
        switch step {
        case 1: return !title.isEmpty && !listingDescription.isEmpty
        case 2: return !address.isEmpty && !city.isEmpty && !state.isEmpty && !zipCode.isEmpty
        case 3: return !rent.isEmpty && !bedrooms.isEmpty && !bathrooms.isEmpty
        case 4: return true // Amenities optional
        case 5: return !selectedImages.isEmpty
        default: return true
        }
    }
    
    private func handleNext() {
        if step < totalSteps {
            withAnimation(.spring(response: 0.3)) { step += 1 }
        } else {
            submitListing()
        }
    }
    
    private func submitListing() {
        isLoading = true
        
        Task {
            do {
                // Build the listing data
                let listingData: [String: Any] = [
                    "title": title,
                    "description": listingDescription,
                    "listingType": listingType,
                    "isSublease": isSublease,
                    "address": address.isEmpty ? addressQuery : address,
                    "city": city,
                    "state": state,
                    "zipCode": zipCode,
                    "university": university,
                    "rent": Int(rent) ?? 0,
                    "leaseTerm": leaseTerm,
                    "bedrooms": Int(bedrooms) ?? 0,
                    "bathrooms": Double(bathrooms) ?? 1.0,
                    "sqft": Int(sqft) ?? 0,
                    "availableDate": ISO8601DateFormatter().string(from: availableDate),
                    "amenities": Array(selectedAmenities)
                ]
                
                let jsonData = try JSONSerialization.data(withJSONObject: listingData)
                
                guard let url = URL(string: "\(APIConfig.baseURL)/listings") else {
                    throw APIError.invalidURL
                }
                
                var request = URLRequest(url: url)
                request.httpMethod = "POST"
                request.setValue("application/json", forHTTPHeaderField: "Content-Type")
                
                // Add auth token
                if let token = UserDefaults.standard.string(forKey: "authToken") {
                    request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
                }
                
                request.httpBody = jsonData
                
                let (data, response) = try await URLSession.shared.data(for: request)
                
                guard let httpResponse = response as? HTTPURLResponse else {
                    throw APIError.serverError("Invalid response")
                }
                
                // Parse response to get error message if failed
                if !(200...299).contains(httpResponse.statusCode) {
                    // Try to parse error from server
                    if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                       let errorMsg = json["error"] as? String {
                        throw APIError.serverError(errorMsg)
                    }
                    throw APIError.serverError("Server error: \(httpResponse.statusCode)")
                }
                
                // Success! Log what we got
                if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
                    print("Listing created successfully: \(json)")
                }
                
                // Dismiss on success
                await MainActor.run {
                    isLoading = false
                    dismiss()
                }
            } catch {
                print("Error creating listing: \(error)")
                await MainActor.run {
                    isLoading = false
                    errorMessage = error.localizedDescription
                    showError = true
                }
            }
        }
    }
}

// MARK: - Form Field
struct FormField<Content: View>: View {
    let label: String
    var required: Bool = false
    @ViewBuilder let content: Content
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 4) {
                Text(label)
                    .font(.subheadline.weight(.semibold))
                if required {
                    Text("*")
                        .foregroundStyle(.red)
                }
            }
            content
        }
    }
}

// MARK: - Amenity Enum
enum Amenity: String, CaseIterable {
    case wifi = "WiFi"
    case laundry = "laundry"
    case parking = "parking"
    case furnished = "furnished"
    case petFriendly = "pet-friendly"
    case dishwasher = "dishwasher"
    case ac = "AC"
    case heating = "heating"
    case gym = "gym"
    case pool = "pool"
    case elevator = "elevator"
    case balcony = "balcony"
    
    var label: String {
        switch self {
        case .wifi: return "WiFi"
        case .laundry: return "Laundry"
        case .parking: return "Parking"
        case .furnished: return "Furnished"
        case .petFriendly: return "Pet Friendly"
        case .dishwasher: return "Dishwasher"
        case .ac: return "AC"
        case .heating: return "Heating"
        case .gym: return "Gym"
        case .pool: return "Pool"
        case .elevator: return "Elevator"
        case .balcony: return "Balcony"
        }
    }
    
    var icon: String {
        switch self {
        case .wifi: return "wifi"
        case .laundry: return "washer.fill"
        case .parking: return "car.fill"
        case .furnished: return "sofa.fill"
        case .petFriendly: return "pawprint.fill"
        case .dishwasher: return "dishwasher.fill"
        case .ac: return "snowflake"
        case .heating: return "flame.fill"
        case .gym: return "dumbbell.fill"
        case .pool: return "figure.pool.swim"
        case .elevator: return "arrow.up.arrow.down"
        case .balcony: return "sun.horizon.fill"
        }
    }
}

// MARK: - Listing Type Button
struct ListingTypeButton: View {
    let title: String
    let subtitle: String
    let icon: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 8) {
                Image(systemName: icon)
                    .font(.title2)
                Text(title)
                    .font(.subheadline.weight(.semibold))
                Text(subtitle)
                    .font(.caption2)
                    .foregroundStyle(isSelected ? .white.opacity(0.8) : .secondary)
                    .multilineTextAlignment(.center)
            }
            .foregroundStyle(isSelected ? .white : .primary)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 20)
            .background(
                isSelected
                    ? LinearGradient(colors: [Color.collegioOrange, Color.collegioOrangeLight], startPoint: .topLeading, endPoint: .bottomTrailing)
                    : LinearGradient(colors: [Color.gray.opacity(0.1), Color.gray.opacity(0.15)], startPoint: .topLeading, endPoint: .bottomTrailing),
                in: RoundedRectangle(cornerRadius: 16)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .strokeBorder(isSelected ? Color.collegioOrange : Color.clear, lineWidth: 2)
            )
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Amenity Button
struct AmenityButton: View {
    let amenity: Amenity
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 10) {
                Image(systemName: amenity.icon)
                    .font(.title3)
                Text(amenity.label)
                    .font(.subheadline.weight(.medium))
                Spacer()
            }
            .foregroundStyle(isSelected ? .white : .primary)
            .padding()
            .background(
                isSelected
                    ? LinearGradient(colors: [Color.collegioOrange, Color.collegioOrangeLight], startPoint: .leading, endPoint: .trailing)
                    : LinearGradient(colors: [Color.gray.opacity(0.15), Color.gray.opacity(0.15)], startPoint: .leading, endPoint: .trailing),
                in: RoundedRectangle(cornerRadius: 12)
            )
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Image Picker (Placeholder)
struct ImagePickerView: View {
    @Binding var selectedImages: [UIImage]
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                Image(systemName: "photo.on.rectangle.angled")
                    .font(.system(size: 60))
                    .foregroundStyle(.secondary)
                
                Text("Photo Library")
                    .font(.title2.bold())
                
                Text("Select photos from your library")
                    .foregroundStyle(.secondary)
                
                // Demo: Add placeholder images
                Button("Add Sample Photo") {
                    // Create a placeholder colored image
                    let renderer = UIGraphicsImageRenderer(size: CGSize(width: 300, height: 200))
                    let img = renderer.image { ctx in
                        UIColor.systemOrange.setFill()
                        ctx.fill(CGRect(x: 0, y: 0, width: 300, height: 200))
                    }
                    selectedImages.append(img)
                    if selectedImages.count >= 5 { dismiss() }
                }
                .font(.headline)
                .foregroundStyle(.white)
                .padding()
                .background(Color.collegioOrange, in: Capsule())
            }
            .padding()
            .navigationTitle("Select Photos")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }
}

#Preview {
    CreateListingView()
}
