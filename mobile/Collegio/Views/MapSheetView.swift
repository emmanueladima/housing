import SwiftUI
import MapboxMaps
import Combine

// MARK: - Map Sheet View with Mapbox
struct MapSheetView: View {
    @Environment(\.dismiss) private var dismiss
    let listings: [Listing]
    @Binding var selectedListing: Listing?
    
    var body: some View {
        NavigationStack {
            ZStack(alignment: .bottom) {
                // Mapbox Map
                CollegioMapView(listings: listings, selectedListing: $selectedListing)
                    .ignoresSafeArea(edges: .bottom)
                
                // Selected Listing Card
                if let listing = selectedListing {
                    MapListingCard(listing: listing)
                        .padding()
                        .transition(.move(edge: .bottom).combined(with: .opacity))
                        .onTapGesture {
                            // Navigate to detail? For now just dismiss or show something
                        }
                }
            }
            .animation(.spring(response: 0.35), value: selectedListing?.id)
            .navigationTitle("Explore Map")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                        .fontWeight(.semibold)
                }
            }
        }
        .presentationDetents([.large])
        .presentationDragIndicator(.visible)
    }
}

// MARK: - Mapbox UIViewRepresentable
struct CollegioMapView: UIViewRepresentable {
    let listings: [Listing]
    @Binding var selectedListing: Listing?
    
    // Corvallis, Oregon (OSU)
    let center = CLLocationCoordinate2D(latitude: 44.5646, longitude: -123.2620)
    
    func makeUIView(context: Context) -> MapView {
        // Ensure token is set before creating map
        MapboxOptions.accessToken = "pk.eyJ1IjoiZW1tYW51ZWxhZGltYSIsImEiOiJjbWl0c3I4a3oxZ21hM2ZweTJ6NjlpbDhtIn0.hDng3N8TU26VMra73JbCmA"
        
        // Use standard streets style URL
        let styleURL = URL(string: "mapbox://styles/mapbox/streets-v12")!
        
        let options = MapInitOptions(
            cameraOptions: CameraOptions(center: center, zoom: 13),
            styleURI: StyleURI(url: styleURL)
        )
        
        let mapView = MapView(frame: .zero, mapInitOptions: options)
        mapView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        
        // Create Annotation Manager
        let annotationManager = mapView.annotations.makePointAnnotationManager()
        context.coordinator.annotationManager = annotationManager
        annotationManager.delegate = context.coordinator
        
        // Debug: Print when style loads
        mapView.mapboxMap.onStyleLoaded.observeNext { _ in
            print("✅ Mapbox style loaded successfully!")
        }.store(in: &context.coordinator.cancellables)
        
        mapView.mapboxMap.onMapLoadingError.observeNext { event in
            print("❌ Mapbox error: \(event.error)")
        }.store(in: &context.coordinator.cancellables)
        
        return mapView
    }
    
    func updateUIView(_ mapView: MapView, context: Context) {
        // Update annotations whenever listings change
        updateAnnotations(context: context)
        
        // Handle selection camera move
        if let selected = selectedListing {
            let cameraOptions = CameraOptions(center: selected.coordinate, zoom: 15)
            mapView.camera.ease(to: cameraOptions, duration: 1.0)
        }
    }
    
    func makeCoordinator() -> Coordinator {
        Coordinator(parent: self)
    }
    
    private func updateAnnotations(context: Context) {
        guard let annotationManager = context.coordinator.annotationManager else { return }
        
        // Convert listings to points with price bubble markers
        var points: [PointAnnotation] = []
        
        for listing in listings {
            var point = PointAnnotation(coordinate: listing.coordinate)
            
            // Create price bubble marker image
            let priceText = "$\(Int(listing.price))"
            let markerImage = createPriceMarker(text: priceText, isSelected: selectedListing?.id == listing.id)
            point.image = .init(image: markerImage, name: "price_\(listing.id)")
            point.iconAnchor = .bottom
            point.userInfo = ["id": listing.id]
            
            points.append(point)
        }
        
        // Diffing is handled by Mapbox SDK usually, but simple assignment works too
        annotationManager.annotations = points
    }
    
    /// Create a price bubble marker like the website
    private func createPriceMarker(text: String, isSelected: Bool) -> UIImage {
        let font = UIFont.systemFont(ofSize: 13, weight: .bold)
        let textColor = isSelected ? UIColor.white : UIColor.black
        let bgColor = isSelected ? UIColor.systemOrange : UIColor.white
        
        let attributes: [NSAttributedString.Key: Any] = [
            .font: font,
            .foregroundColor: textColor
        ]
        
        let textSize = text.size(withAttributes: attributes)
        let padding: CGFloat = 12
        let bubbleWidth = textSize.width + padding * 2
        let bubbleHeight: CGFloat = 28
        let pointerHeight: CGFloat = 6
        let totalHeight = bubbleHeight + pointerHeight
        
        let renderer = UIGraphicsImageRenderer(size: CGSize(width: bubbleWidth, height: totalHeight))
        
        return renderer.image { context in
            let ctx = context.cgContext
            
            // Draw bubble with pointer
            let bubbleRect = CGRect(x: 0, y: 0, width: bubbleWidth, height: bubbleHeight)
            let path = UIBezierPath(roundedRect: bubbleRect, cornerRadius: bubbleHeight / 2)
            
            // Add pointer triangle
            path.move(to: CGPoint(x: bubbleWidth / 2 - 5, y: bubbleHeight))
            path.addLine(to: CGPoint(x: bubbleWidth / 2, y: totalHeight))
            path.addLine(to: CGPoint(x: bubbleWidth / 2 + 5, y: bubbleHeight))
            path.close()
            
            // Shadow
            ctx.saveGState()
            ctx.setShadow(offset: CGSize(width: 0, height: 2), blur: 4, color: UIColor.black.withAlphaComponent(0.15).cgColor)
            bgColor.setFill()
            path.fill()
            ctx.restoreGState()
            
            // Border
            if !isSelected {
                UIColor.systemGray4.setStroke()
                path.lineWidth = 1
                path.stroke()
            }
            
            // Text
            let textRect = CGRect(
                x: (bubbleWidth - textSize.width) / 2,
                y: (bubbleHeight - textSize.height) / 2,
                width: textSize.width,
                height: textSize.height
            )
            text.draw(in: textRect, withAttributes: attributes)
        }
    }
    
    class Coordinator: NSObject, AnnotationInteractionDelegate {
        var parent: CollegioMapView
        var cancellables = Set<AnyCancellable>()
        var annotationManager: PointAnnotationManager?
        
        init(parent: CollegioMapView) {
            self.parent = parent
        }
        
        func annotationManager(_ manager: AnnotationManager, didDetectTappedAnnotations annotations: [Annotation]) {
            guard let firstPoint = annotations.first as? PointAnnotation,
                  let userInfo = firstPoint.userInfo,
                  let id = userInfo["id"] as? String else { return }
            
            // Find listing
            if let listing = parent.listings.first(where: { $0.id == id }) {
                print("Tapped listing: \(listing.title)")
                parent.selectedListing = listing
            }
        }
    }
}

// MARK: - Map Listing Card
struct MapListingCard: View {
    let listing: Listing
    
    var body: some View {
        HStack(spacing: 14) {
            if let image = listing.imageUrl {
                Image(image) // Mock image
                    .resizable()
                    .scaledToFill()
                    .frame(width: 80, height: 80)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
            } else {
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.gray.opacity(0.3))
                    .frame(width: 80, height: 80)
                    .overlay {
                        Image(systemName: "photo")
                            .foregroundStyle(.secondary)
                    }
            }
            
            VStack(alignment: .leading, spacing: 6) {
                Text(listing.formattedPrice)
                    .font(.title3.weight(.bold))
                    .foregroundStyle(Color.collegioOrange)
                
                VStack(alignment: .leading, spacing: 2) {
                    Text(listing.title)
                        .font(.subheadline.weight(.semibold))
                        .lineLimit(1)
                    
                    Text("\(listing.bedrooms) Bed • \(listing.bathroomsText)")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            
            Spacer()
            
            Image(systemName: "chevron.right")
                .foregroundStyle(.secondary)
        }
        .padding(12)
        .glassCard()
    }
}

#Preview {
    MapSheetView(listings: Listing.samples, selectedListing: .constant(nil))
}
