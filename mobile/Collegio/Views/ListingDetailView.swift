import SwiftUI
import MapboxMaps
import CoreLocation
import Combine

struct ListingDetailView: View {
    let listing: Listing
    @Environment(\.dismiss) private var dismiss
    @ObservedObject private var favoritesManager = FavoritesManager.shared
    @State private var showContactSheet = false
    @State private var showWriteReview = false
    @State private var showReportSheet = false
    @State private var currentImageIndex = 0
    @StateObject private var reviewsVM = ListingReviewsViewModel()
    
    private var isSaved: Bool {
        favoritesManager.isFavorite(listing.id)
    }
    
    var body: some View {
        ZStack {
            GradientBackground()
            
            ScrollView {
                VStack(spacing: 0) {
                    // Image Gallery with overlaid buttons
                    imageGalleryWithButtons
                    
                    // Content
                    VStack(alignment: .leading, spacing: 20) {
                        // Price & Status
                        priceSection
                        
                        Divider()
                        
                        // Features
                        featuresSection
                        
                        Divider()
                        
                        // Description
                        descriptionSection
                        
                        Divider()
                        
                        // Amenities (above Details like website)
                        amenitiesSection
                        
                        Divider()
                        
                        // Details (Lease Term, Pets, etc.)
                        detailsSection
                        
                        Divider()
                        
                        // Location
                        locationSection
                        
                        Divider()
                        
                        // Reviews
                        reviewsSection
                        
                        // Landlord Info
                        landlordSection
                    }
                    .padding()
                    .padding(.bottom, 100)
                }
            }
            
            // Floating Action Bar
            VStack {
                Spacer()
                floatingActionBar
            }
        }
        .navigationBarHidden(true)
        .sheet(isPresented: $showContactSheet) {
            ContactLandlordSheet(listing: listing)
        }
        .sheet(isPresented: $showWriteReview) {
            WriteReviewSheet(listingId: listing.id) {
                Task { await reviewsVM.loadReviews(for: listing.id) }
            }
        }
        .sheet(isPresented: $showReportSheet) {
            ListingReportSheet(listingId: listing.id)
        }
        .task {
            await reviewsVM.loadReviews(for: listing.id)
        }
    }
    
    // MARK: - Image Gallery with Overlaid Buttons (No backgrounds)
    private var imageGalleryWithButtons: some View {
        ZStack(alignment: .top) {
            // Main Image
            RoundedRectangle(cornerRadius: 0)
                .fill(
                    LinearGradient(
                        colors: [Color.gray.opacity(0.2), Color.gray.opacity(0.4)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(height: 320)
                .overlay {
                    Image(systemName: "photo")
                        .font(.system(size: 60, weight: .light))
                        .foregroundStyle(.secondary.opacity(0.4))
                }
            
            // Top Navigation Bar (No outline/background)
            HStack {
                // Back Button - No background
                Button(action: { dismiss() }) {
                    Image(systemName: "chevron.left")
                        .font(.title3.weight(.semibold))
                        .foregroundStyle(Color.collegioOrange)
                }
                
                Spacer()
                
                HStack(spacing: 16) {
                    // Share Button
                    ShareLink(item: URL(string: "https://collegio.us/listings/\(listing.id)")!, subject: Text(listing.title ?? "Check out this listing"), message: Text("Found this listing on Collegio!")) {
                        Image(systemName: "square.and.arrow.up")
                            .font(.body.weight(.medium))
                            .foregroundStyle(.primary)
                    }
                    
                    // Save Button (Heart)
                    Button {
                        Task { await favoritesManager.toggleFavorite(for: listing.id) }
                    } label: {
                        Image(systemName: isSaved ? "heart.fill" : "heart")
                            .font(.body.weight(.medium))
                            .foregroundStyle(isSaved ? .red : Color.collegioOrange)
                    }
                    
                    // Report Menu
                    Menu {
                        Button(role: .destructive) {
                            showReportSheet = true
                        } label: {
                            Label("Report Listing", systemImage: "exclamationmark.triangle")
                        }
                    } label: {
                        Image(systemName: "ellipsis")
                            .font(.body.weight(.medium))
                            .foregroundStyle(.primary)
                    }
                }
                .padding(.horizontal, 14)
                .padding(.vertical, 10)
                .background(.ultraThinMaterial, in: Capsule())
            }
            .padding(.horizontal, 20)
            .padding(.top, 60) // Account for status bar
            
            // Image Indicator at bottom
            VStack {
                Spacer()
                HStack(spacing: 6) {
                    ForEach(0..<4, id: \.self) { index in
                        Circle()
                            .fill(index == currentImageIndex ? Color.white : Color.white.opacity(0.5))
                            .frame(width: 8, height: 8)
                    }
                }
                .padding(.vertical, 12)
                .padding(.horizontal, 16)
                .background(.ultraThinMaterial, in: Capsule())
            }
            .padding(.bottom, 16)
            .frame(height: 320)
        }
    }
    
    // MARK: - Price Section
    private var priceSection: some View {
        HStack(alignment: .top) {
            VStack(alignment: .leading, spacing: 6) {
                Text(listing.formattedPrice)
                    .font(.largeTitle.weight(.bold))
                    .foregroundStyle(Color.collegioOrange)
                
                Text(listing.title)
                    .font(.title3.weight(.semibold))
            }
            
            Spacer()
            
            if listing.isAvailable {
                Text("Available")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(.green)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 8)
                    .background(.green.opacity(0.12), in: Capsule())
            }
        }
    }
    
    // MARK: - Features Section
    private var featuresSection: some View {
        HStack(spacing: 0) {
            FeatureItem(icon: "bed.double.fill", value: "\(listing.bedrooms)", label: "Beds")
            
            Divider().frame(height: 40)
            
            FeatureItem(icon: "shower.fill", value: listing.bathroomsText.replacingOccurrences(of: " bath", with: ""), label: "Baths")
            
            Divider().frame(height: 40)
            
            FeatureItem(icon: "square.dashed", value: listing.sqft != nil ? "\(listing.sqft!)" : "—", label: "Sq Ft")
            
            if let distance = listing.distance {
                Divider().frame(height: 40)
                FeatureItem(icon: "figure.walk", value: String(format: "%.1f", distance), label: "Miles")
            }
        }
        .padding(.vertical, 8)
    }
    
    // MARK: - Description
    private var descriptionSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Description")
                .font(.headline)
            
            Text(listing.description ?? "No description available.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .lineSpacing(4)
        }
    }
    
    // MARK: - Details (Lease Term, Pets, etc.)
    private var detailsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Details")
                .font(.headline)
            
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                // Lease Term
                DetailRow(label: "Lease Term", value: listing.leaseTerm ?? "—")
                
                // Available Date
                if let date = listing.availableDate {
                    DetailRow(label: "Available", value: formatDate(date))
                }
                
                // Pets
                DetailRow(
                    label: "Pets",
                    value: listing.rules?.petsAllowed == true ? "Allowed" : "Not Allowed",
                    icon: listing.rules?.petsAllowed == true ? "checkmark.circle.fill" : "xmark.circle.fill",
                    iconColor: listing.rules?.petsAllowed == true ? .green : .red
                )
                
                // Smoking
                DetailRow(
                    label: "Smoking",
                    value: listing.rules?.smokingAllowed == true ? "Allowed" : "Not Allowed",
                    icon: listing.rules?.smokingAllowed == true ? "checkmark.circle.fill" : "xmark.circle.fill",
                    iconColor: listing.rules?.smokingAllowed == true ? .green : .red
                )
            }
        }
    }
    
    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        return formatter.string(from: date)
    }
    
    // MARK: - Amenities
    private var amenitiesSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Amenities")
                .font(.headline)
            
            if let amenities = listing.amenities, !amenities.isEmpty {
                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                    ForEach(amenities, id: \.self) { amenity in
                        DetailAmenityItem(icon: iconFor(amenity: amenity), text: amenity.capitalized)
                    }
                }
            } else {
                Text("No amenities listed")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
        }
    }
    
    private func iconFor(amenity: String) -> String {
        let lowercased = amenity.lowercased()
        if lowercased.contains("washer") || lowercased.contains("dryer") { return "washer.fill" }
        if lowercased.contains("parking") { return "parkingsign" }
        if lowercased.contains("wifi") { return "wifi" }
        if lowercased.contains("a/c") || lowercased.contains("ac") || lowercased.contains("air") { return "snowflake" }
        if lowercased.contains("pet") { return "pawprint.fill" }
        if lowercased.contains("gym") || lowercased.contains("fitness") { return "dumbbell.fill" }
        if lowercased.contains("pool") { return "figure.pool.swim" }
        if lowercased.contains("laundry") { return "washer.fill" }
        return "checkmark.circle.fill"
    }
    
    // MARK: - Location
    private var locationSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Location")
                .font(.headline)
            
            HStack(spacing: 8) {
                Image(systemName: "mappin.circle.fill")
                    .font(.body)
                    .foregroundStyle(Color.collegioOrange)
                
                Text(listing.address)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            
            // Mapbox Map Preview
            ListingMapPreview(coordinate: listing.coordinate)
                .frame(height: 150)
                .clipShape(RoundedRectangle(cornerRadius: 16))
        }
    }
    
    // MARK: - Reviews Section
    private var reviewsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Header
            HStack {
                Text("Reviews")
                    .font(.headline)
                
                if reviewsVM.averageRating > 0 {
                    HStack(spacing: 4) {
                        Image(systemName: "star.fill")
                            .foregroundStyle(.yellow)
                        Text(String(format: "%.1f", reviewsVM.averageRating))
                            .fontWeight(.semibold)
                        Text("(\(reviewsVM.reviews.count))")
                            .foregroundStyle(.secondary)
                    }
                    .font(.subheadline)
                }
                
                Spacer()
                
                Button("Write Review") {
                    showWriteReview = true
                }
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(Color.collegioOrange)
            }
            
            if reviewsVM.isLoading {
                ProgressView()
                    .frame(maxWidth: .infinity, alignment: .center)
            } else if reviewsVM.reviews.isEmpty {
                VStack(spacing: 8) {
                    Image(systemName: "text.bubble")
                        .font(.title)
                        .foregroundStyle(.secondary)
                    Text("No reviews yet")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                    Text("Be the first to share your experience!")
                        .font(.caption)
                        .foregroundStyle(.tertiary)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 20)
            } else {
                ForEach(reviewsVM.reviews.prefix(3)) { review in
                    ReviewCard(review: review)
                }
                
                if reviewsVM.reviews.count > 3 {
                    NavigationLink(destination: AllReviewsView(reviews: reviewsVM.reviews)) {
                        Text("See all \(reviewsVM.reviews.count) reviews")
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(Color.collegioOrange)
                            .frame(maxWidth: .infinity)
                            .padding()
                    }
                }
            }
        }
    }
    
    // MARK: - Landlord Section
    private var landlordSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Listed By")
                .font(.headline)
            
            HStack(spacing: 14) {
                Circle()
                    .fill(Color.collegioBlue.opacity(0.2))
                    .frame(width: 50, height: 50)
                    .overlay {
                        Text("PM")
                            .font(.headline)
                            .foregroundStyle(Color.collegioBlue)
                    }
                
                VStack(alignment: .leading, spacing: 2) {
                    Text("Property Manager")
                        .font(.subheadline.weight(.semibold))
                    
                    HStack(spacing: 4) {
                        Image(systemName: "checkmark.seal.fill")
                            .font(.caption2)
                            .foregroundStyle(.green)
                        Text("Verified")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
                
                Spacer()
            }
            .padding()
            .glassCard(cornerRadius: 16)
        }
    }
    
    // MARK: - Floating Action Bar
    private var floatingActionBar: some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 2) {
                Text(listing.formattedPrice)
                    .font(.title3.weight(.bold))
                    .foregroundStyle(Color.collegioOrange)
                Text("per month")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            
            Spacer()
            
            Button(action: { showContactSheet = true }) {
                Text("Contact Landlord")
                    .font(.headline)
                    .foregroundStyle(.white)
                    .padding(.horizontal, 24)
                    .padding(.vertical, 14)
                    .background {
                        Capsule()
                            .fill(
                                LinearGradient(
                                    colors: [Color.collegioOrange, Color.collegioOrangeDark],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )
                    }
            }
        }
        .padding()
        .background {
            Rectangle()
                .fill(.ultraThinMaterial)
                .shadow(color: .black.opacity(0.1), radius: 20, x: 0, y: -10)
                .ignoresSafeArea(edges: .bottom)
        }
    }
}

// MARK: - Feature Item
struct FeatureItem: View {
    let icon: String
    let value: String
    let label: String
    
    var body: some View {
        VStack(spacing: 6) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundStyle(Color.collegioOrange)
            
            Text(value)
                .font(.headline)
            
            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
    }
}

// MARK: - Detail Amenity Item
struct DetailAmenityItem: View {
    let icon: String
    let text: String
    
    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: icon)
                .font(.body)
                .foregroundStyle(Color.collegioOrange)
                .frame(width: 24)
            
            Text(text)
                .font(.subheadline)
            
            Spacer()
        }
        .padding(.vertical, 8)
    }
}

// MARK: - Contact Landlord Sheet
struct ContactLandlordSheet: View {
    let listing: Listing
    @Environment(\.dismiss) private var dismiss
    @State private var message = ""
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                VStack(alignment: .leading, spacing: 12) {
                    Text("Quick Messages")
                        .font(.headline)
                    
                    ForEach([
                        "Is this still available?",
                        "I'd like to schedule a viewing",
                        "What's the move-in date?"
                    ], id: \.self) { quickMessage in
                        Button(action: { message = quickMessage }) {
                            Text(quickMessage)
                                .font(.subheadline)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .padding()
                                .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
                        }
                        .buttonStyle(.plain)
                    }
                }
                
                VStack(alignment: .leading, spacing: 8) {
                    Text("Your Message")
                        .font(.headline)
                    
                    TextEditor(text: $message)
                        .frame(height: 120)
                        .padding(8)
                        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
                }
                
                Spacer()
                
                Button(action: { dismiss() }) {
                    Text("Send Message")
                        .font(.headline)
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(Color.collegioOrange, in: Capsule())
                }
            }
            .padding()
            .background(GradientBackground())
            .navigationTitle("Contact Landlord")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Cancel") { dismiss() }
                }
            }
        }
        .presentationDetents([.medium, .large])
    }
}

// MARK: - Listing Map Preview
struct ListingMapPreview: UIViewRepresentable {
    let coordinate: CLLocationCoordinate2D
    
    func makeUIView(context: Context) -> MapView {
        let options = MapInitOptions(
            cameraOptions: CameraOptions(center: coordinate, zoom: 14),
            styleURI: StyleURI(url: URL(string: "mapbox://styles/mapbox/streets-v12")!)
        )
        
        let mapView = MapView(frame: .zero, mapInitOptions: options)
        mapView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        mapView.gestures.options.panEnabled = false
        mapView.gestures.options.pinchEnabled = false
        mapView.gestures.options.rotateEnabled = false
        mapView.gestures.options.pitchEnabled = false
        
        // Add marker after style loads
        mapView.mapboxMap.onStyleLoaded.observeNext { _ in
            // Add a point annotation for the listing
            var pointAnnotation = PointAnnotation(coordinate: coordinate)
            pointAnnotation.iconImage = "mapbox-marker-icon-20px-orange"
            
            let annotationManager = mapView.annotations.makePointAnnotationManager()
            annotationManager.annotations = [pointAnnotation]
        }.store(in: &context.coordinator.cancellables)
        
        return mapView
    }
    
    func updateUIView(_ uiView: MapView, context: Context) {}
    
    func makeCoordinator() -> Coordinator {
        Coordinator()
    }
    
    class Coordinator {
        var cancellables = Set<AnyCancellable>()
    }
}

// MARK: - Detail Row Component
struct DetailRow: View {
    let label: String
    let value: String
    var icon: String? = nil
    var iconColor: Color = .primary
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(label)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                
                HStack(spacing: 4) {
                    if let icon = icon {
                        Image(systemName: icon)
                            .font(.caption)
                            .foregroundStyle(iconColor)
                    }
                    Text(value)
                        .font(.subheadline)
                        .fontWeight(.medium)
                }
            }
            Spacer()
        }
        .padding(12)
        .background(Color.white.opacity(0.1))
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }
}

#Preview {
    ListingDetailView(listing: Listing.sample)
}

#Preview("Dark") {
    ListingDetailView(listing: Listing.sample)
        .preferredColorScheme(.dark)
}
