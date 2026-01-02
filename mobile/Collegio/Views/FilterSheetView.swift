import SwiftUI

// MARK: - Filter Sheet View (Matching Website Design)
struct FilterSheetView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.colorScheme) var colorScheme
    
    // Filter State
    @State private var minPrice: Int = 0
    @State private var maxPrice: Int = 5000
    @State private var bedrooms: Int = 0 // 0 = Any
    @State private var bathrooms: Int = 0 // 0 = Any
    @State private var placeType: PlaceType = .any
    
    // Recommended filters
    @State private var verifiedLandlord = false
    @State private var utilitiesIncluded = false
    @State private var sublease = false
    @State private var petFriendly = false
    
    // Amenities
    @State private var hasWifi = false
    @State private var hasLaundry = false
    @State private var hasParking = false
    @State private var hasDishwasher = false
    @State private var hasAC = false
    @State private var hasFurnished = false
    
    enum PlaceType: String, CaseIterable {
        case any = "Any type"
        case room = "Room"
        case entireHome = "Entire home"
    }
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Recommended for you
                    recommendedSection
                    
                    Divider()
                    
                    // Type of place
                    placeTypeSection
                    
                    Divider()
                    
                    // Price range
                    priceRangeSection
                    
                    Divider()
                    
                    // Rooms and beds
                    roomsSection
                    
                    Divider()
                    
                    // Amenities
                    amenitiesSection
                }
                .padding()
                .padding(.bottom, 80)
            }
            .background(colorScheme == .dark ? Color(.systemBackground) : Color.white)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .principal) {
                    Text("Filters")
                        .font(.headline)
                }
                ToolbarItem(placement: .topBarLeading) {
                    Button(action: { dismiss() }) {
                        Image(systemName: "xmark")
                            .font(.body.weight(.medium))
                            .foregroundStyle(.primary)
                    }
                }
            }
            .safeAreaInset(edge: .bottom) {
                bottomBar
            }
        }
        .presentationDetents([.large])
        .presentationDragIndicator(.visible)
    }
    
    // MARK: - Recommended Section
    private var recommendedSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Recommended for you")
                .font(.title3.weight(.semibold))
            
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                RecommendedCard(
                    emoji: "🛡️",
                    title: "Verified\nLandlord",
                    isSelected: $verifiedLandlord
                )
                RecommendedCard(
                    emoji: "💡",
                    title: "Utilities\nIncluded",
                    isSelected: $utilitiesIncluded
                )
                RecommendedCard(
                    emoji: "📅",
                    title: "Sublease",
                    isSelected: $sublease
                )
                RecommendedCard(
                    emoji: "🐾",
                    title: "Pet\nFriendly",
                    isSelected: $petFriendly
                )
            }
        }
    }
    
    // MARK: - Place Type Section
    private var placeTypeSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Type of place")
                .font(.title3.weight(.semibold))
            
            HStack(spacing: 0) {
                ForEach(PlaceType.allCases, id: \.self) { type in
                    Button(action: { placeType = type }) {
                        Text(type.rawValue)
                            .font(.subheadline.weight(.medium))
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background {
                                if placeType == type {
                                    RoundedRectangle(cornerRadius: 10)
                                        .fill(Color.primary)
                                } else {
                                    RoundedRectangle(cornerRadius: 10)
                                        .stroke(Color.gray.opacity(0.3), lineWidth: 1)
                                }
                            }
                            .foregroundStyle(placeType == type ? (colorScheme == .dark ? .black : .white) : .primary)
                    }
                }
            }
        }
    }
    
    // MARK: - Price Range Section
    private var priceRangeSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Price range")
                .font(.title3.weight(.semibold))
            
            Text("Monthly rent, includes all fees")
                .font(.subheadline)
                .foregroundStyle(.secondary)
            
            HStack(spacing: 12) {
                // Minimum
                VStack(alignment: .leading, spacing: 8) {
                    Text("Minimum")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    
                    HStack(spacing: 8) {
                        Text("$")
                            .font(.body)
                            .foregroundStyle(.secondary)
                        
                        Text("\(minPrice)")
                            .font(.title3.weight(.medium))
                            .frame(maxWidth: .infinity, alignment: .leading)
                        
                        VStack(spacing: 2) {
                            Button(action: { 
                                if minPrice + 100 <= maxPrice {
                                    minPrice += 100
                                }
                            }) {
                                Image(systemName: "chevron.up")
                                    .font(.caption2.weight(.semibold))
                                    .foregroundStyle(.secondary)
                                    .frame(width: 28, height: 16)
                            }
                            
                            Divider()
                            
                            Button(action: { 
                                if minPrice - 100 >= 0 {
                                    minPrice -= 100
                                }
                            }) {
                                Image(systemName: "chevron.down")
                                    .font(.caption2.weight(.semibold))
                                    .foregroundStyle(.secondary)
                                    .frame(width: 28, height: 16)
                            }
                        }
                        .background(Color.gray.opacity(0.1), in: RoundedRectangle(cornerRadius: 6))
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 10)
                    .background {
                        RoundedRectangle(cornerRadius: 10)
                            .stroke(Color.gray.opacity(0.3), lineWidth: 1)
                    }
                }
                
                Text("–")
                    .foregroundStyle(.secondary)
                    .padding(.top, 20)
                
                // Maximum
                VStack(alignment: .leading, spacing: 8) {
                    Text("Maximum")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    
                    HStack(spacing: 8) {
                        Text("$")
                            .font(.body)
                            .foregroundStyle(.secondary)
                        
                        Text("\(maxPrice)")
                            .font(.title3.weight(.medium))
                            .lineLimit(1)
                            .fixedSize(horizontal: true, vertical: false)
                        
                        Text("+")
                            .font(.body)
                            .foregroundStyle(.secondary)
                        
                        VStack(spacing: 2) {
                            Button(action: { 
                                if maxPrice + 100 <= 10000 {
                                    maxPrice += 100
                                }
                            }) {
                                Image(systemName: "chevron.up")
                                    .font(.caption2.weight(.semibold))
                                    .foregroundStyle(.secondary)
                                    .frame(width: 28, height: 16)
                            }
                            
                            Divider()
                            
                            Button(action: { 
                                if maxPrice - 100 >= minPrice {
                                    maxPrice -= 100
                                }
                            }) {
                                Image(systemName: "chevron.down")
                                    .font(.caption2.weight(.semibold))
                                    .foregroundStyle(.secondary)
                                    .frame(width: 28, height: 16)
                            }
                        }
                        .background(Color.gray.opacity(0.1), in: RoundedRectangle(cornerRadius: 6))
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 10)
                    .background {
                        RoundedRectangle(cornerRadius: 10)
                            .stroke(Color.gray.opacity(0.3), lineWidth: 1)
                    }
                }
            }
        }
    }
    
    // MARK: - Rooms Section
    private var roomsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Rooms and beds")
                .font(.title3.weight(.semibold))
            
            // Bedrooms
            HStack {
                Text("Bedrooms")
                    .font(.body)
                
                Spacer()
                
                CounterControl(
                    value: $bedrooms,
                    min: 0,
                    max: 8,
                    displayText: bedrooms == 0 ? "Any" : "\(bedrooms)"
                )
            }
            
            Divider()
            
            // Bathrooms
            HStack {
                Text("Bathrooms")
                    .font(.body)
                
                Spacer()
                
                CounterControl(
                    value: $bathrooms,
                    min: 0,
                    max: 8,
                    displayText: bathrooms == 0 ? "Any" : "\(bathrooms)"
                )
            }
        }
    }
    
    // MARK: - Amenities Section
    private var amenitiesSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Amenities")
                .font(.title3.weight(.semibold))
            
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                AmenityToggle(title: "WiFi", isOn: $hasWifi)
                AmenityToggle(title: "Laundry", isOn: $hasLaundry)
                AmenityToggle(title: "Parking", isOn: $hasParking)
                AmenityToggle(title: "Dishwasher", isOn: $hasDishwasher)
                AmenityToggle(title: "A/C", isOn: $hasAC)
                AmenityToggle(title: "Furnished", isOn: $hasFurnished)
            }
        }
    }
    
    // MARK: - Bottom Bar
    private var bottomBar: some View {
        HStack {
            Button(action: { clearAll() }) {
                Text("Clear all")
                    .font(.body)
                    .underline()
                    .foregroundStyle(.primary)
            }
            
            Spacer()
            
            Button(action: { dismiss() }) {
                Text("Show places")
                    .font(.headline)
                    .foregroundStyle(.white)
                    .padding(.horizontal, 24)
                    .padding(.vertical, 14)
                    .background(Color.primary, in: RoundedRectangle(cornerRadius: 10))
            }
        }
        .padding()
        .background(.ultraThinMaterial)
    }
    
    private func clearAll() {
        minPrice = 0
        maxPrice = 5000
        bedrooms = 0
        bathrooms = 0
        placeType = .any
        verifiedLandlord = false
        utilitiesIncluded = false
        sublease = false
        petFriendly = false
        hasWifi = false
        hasLaundry = false
        hasParking = false
        hasDishwasher = false
        hasAC = false
        hasFurnished = false
    }
}

// MARK: - Recommended Card
struct RecommendedCard: View {
    let emoji: String
    let title: String
    @Binding var isSelected: Bool
    
    var body: some View {
        Button(action: { isSelected.toggle() }) {
            VStack(spacing: 8) {
                Text(emoji)
                    .font(.largeTitle)
                
                Text(title)
                    .font(.caption.weight(.medium))
                    .multilineTextAlignment(.center)
                    .foregroundStyle(.primary)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background {
                RoundedRectangle(cornerRadius: 12)
                    .stroke(isSelected ? Color.collegioOrange : Color.gray.opacity(0.3), lineWidth: isSelected ? 2 : 1)
                    .background(isSelected ? Color.collegioOrange.opacity(0.1) : Color.clear, in: RoundedRectangle(cornerRadius: 12))
            }
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Counter Control
struct CounterControl: View {
    @Binding var value: Int
    let min: Int
    let max: Int
    let displayText: String
    
    var body: some View {
        HStack(spacing: 16) {
            Button(action: { if value > min { value -= 1 } }) {
                Image(systemName: "minus")
                    .font(.body.weight(.medium))
                    .foregroundStyle(value > min ? .primary : .secondary)
                    .frame(width: 32, height: 32)
                    .background {
                        Circle()
                            .stroke(value > min ? Color.gray.opacity(0.5) : Color.gray.opacity(0.2), lineWidth: 1)
                    }
            }
            .disabled(value <= min)
            
            Text(displayText)
                .font(.body)
                .frame(minWidth: 40)
            
            Button(action: { if value < max { value += 1 } }) {
                Image(systemName: "plus")
                    .font(.body.weight(.medium))
                    .foregroundStyle(value < max ? .primary : .secondary)
                    .frame(width: 32, height: 32)
                    .background {
                        Circle()
                            .stroke(value < max ? Color.gray.opacity(0.5) : Color.gray.opacity(0.2), lineWidth: 1)
                    }
            }
            .disabled(value >= max)
        }
    }
}

// MARK: - Amenity Toggle
struct AmenityToggle: View {
    let title: String
    @Binding var isOn: Bool
    
    var body: some View {
        Button(action: { isOn.toggle() }) {
            HStack(spacing: 10) {
                Image(systemName: isOn ? "checkmark.square.fill" : "square")
                    .font(.title3)
                    .foregroundStyle(isOn ? Color.collegioOrange : .secondary)
                
                Text(title)
                    .font(.body)
                    .foregroundStyle(.primary)
                
                Spacer()
            }
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    FilterSheetView()
}

#Preview("Dark") {
    FilterSheetView()
        .preferredColorScheme(.dark)
}
