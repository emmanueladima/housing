import SwiftUI

struct HomeView: View {
    @StateObject private var viewModel = ListingsViewModel()
    @State private var searchText = ""
    @State private var selectedSort: SortOption = .newlyAdded
    
    enum SortOption: String, CaseIterable {
        case newlyAdded = "Newly Added"
        case priceHighToLow = "Price: High to Low"
        case priceLowToHigh = "Price: Low to High"
        case mostPopular = "Most Popular"
        
        var icon: String {
            switch self {
            case .newlyAdded: return "clock"
            case .priceHighToLow: return "arrow.down"
            case .priceLowToHigh: return "arrow.up"
            case .mostPopular: return "flame"
            }
        }
    }
    @State private var showMap = false
    @State private var showFilters = false
    @State private var showCreateListing = false
    @State private var selectedListing: Listing? = nil
    @State private var mapSelectedListing: Listing? = nil
    
    let filters = ["Price", "Bedrooms", "Distance", "Available"]
    
    var body: some View {
        ZStack {
            GradientBackground()
            
            VStack(spacing: 0) {
                searchBarRow
                    .padding(.top, 8)
                
                filterPills
                
                listingsFeed
            }
            
            // Floating Buttons
            VStack {
                Spacer()
                ZStack {
                    // Map Button (Centered)
                    floatingMapButton
                    
                    // Create Listing Button (FAB) - Right side
                    HStack {
                        Spacer()
                        floatingAddButton
                    }
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 16)
            }
        }
        .task {
            await viewModel.fetchListings()
            // Load favorites so heart icons show correct state
            await FavoritesManager.shared.loadFavorites()
        }
        .refreshable {
            await viewModel.fetchListings()
            await FavoritesManager.shared.loadFavorites()
        }
        .sheet(isPresented: $showMap) {
            MapSheetView(listings: viewModel.listings, selectedListing: $mapSelectedListing)
        }
        .sheet(isPresented: $showFilters) {
            FilterSheetView()
        }
        .sheet(isPresented: $showCreateListing) {
            CreateListingView()
        }
        .sheet(item: $selectedListing) { listing in
            ListingDetailView(listing: listing)
        }
    }
    
    // MARK: - Search Bar + Filter Button
    private var searchBarRow: some View {
        HStack(spacing: 12) {
            HStack(spacing: 12) {
                Image(systemName: "magnifyingglass")
                    .font(.body.weight(.medium))
                    .foregroundStyle(.secondary)
                
                TextField("Search by location, price...", text: $searchText)
                    .font(.body)
                
                if !searchText.isEmpty {
                    Button(action: { searchText = "" }) {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 14)
            .background {
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .fill(.ultraThinMaterial)
            }
            .overlay {
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .stroke(Color.white.opacity(0.2), lineWidth: 0.5)
            }
            
            Button(action: { showFilters = true }) {
                Image(systemName: "slider.horizontal.3")
                    .font(.title3.weight(.semibold))
                    .foregroundStyle(Color.collegioOrange)
                    .padding(14)
                    .background {
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .fill(.ultraThinMaterial)
                    }
                    .overlay {
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .stroke(Color.collegioOrange.opacity(0.3), lineWidth: 1)
                    }
            }
        }
        .padding(.horizontal)
        .padding(.bottom, 12)
    }
    
    // MARK: - Sort Pills (Horizontal scroll)
    private var filterPills: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 10) {
                ForEach(SortOption.allCases, id: \.self) { option in
                    Button {
                        withAnimation(.spring(response: 0.3)) {
                            selectedSort = option
                        }
                    } label: {
                        HStack(spacing: 6) {
                            Image(systemName: option.icon)
                                .font(.caption.weight(.semibold))
                            Text(option.rawValue)
                                .font(.subheadline.weight(.semibold))
                        }
                        .padding(.horizontal, 16)
                        .padding(.vertical, 10)
                        .background(Color.white.opacity(0.1))
                        .foregroundStyle(selectedSort == option ? Color.collegioOrange : .primary)
                        .clipShape(Capsule())
                        .overlay {
                            Capsule()
                                .stroke(selectedSort == option ? Color.collegioOrange : Color.white.opacity(0.2), lineWidth: selectedSort == option ? 2 : 1)
                        }
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal)
            .padding(.vertical, 4)
        }
        .padding(.bottom, 8)
    }
    
    // MARK: - Floating Map Button
    private var floatingMapButton: some View {
        Button(action: { showMap = true }) {
            HStack(spacing: 8) {
                Image(systemName: "map.fill")
                    .font(.body.weight(.semibold))
                Text("Map")
                    .font(.subheadline.weight(.semibold))
            }
            .foregroundStyle(.white)
            .padding(.horizontal, 24)
            .padding(.vertical, 14)
            .background {
                Capsule()
                    .fill(
                        LinearGradient(
                            colors: [Color.collegioOrange, Color.collegioOrangeLight],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .shadow(color: Color.collegioOrange.opacity(0.4), radius: 12, x: 0, y: 6)
            }
        }
        .buttonStyle(.plain)
    }
    
    // MARK: - Floating Add Button (FAB)
    private var floatingAddButton: some View {
        Button(action: { showCreateListing = true }) {
            Image(systemName: "plus")
                .font(.title2.weight(.semibold))
                .foregroundStyle(.white)
                .frame(width: 56, height: 56)
                .background {
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: [Color.collegioOrange, Color.collegioOrangeDark],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .shadow(color: Color.collegioOrange.opacity(0.4), radius: 12, x: 0, y: 6)
                }
        }
        .buttonStyle(.plain)
    }
    
    // MARK: - Listings Feed
    private var listingsFeed: some View {
        Group {
            if viewModel.isLoading && viewModel.listings.isEmpty {
                VStack {
                    Spacer()
                    ProgressView()
                        .scaleEffect(1.2)
                    Text("Loading listings...")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .padding(.top, 8)
                    Spacer()
                }
            } else if let error = viewModel.errorMessage, viewModel.listings.isEmpty {
                VStack(spacing: 16) {
                    Spacer()
                    Image(systemName: "exclamationmark.triangle")
                        .font(.system(size: 40))
                        .foregroundStyle(.secondary)
                    Text(error)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                    Button("Retry") {
                        Task { await viewModel.fetchListings() }
                    }
                    .buttonStyle(.bordered)
                    Spacer()
                }
                .padding()
            } else {
                ScrollView {
                    LazyVStack(spacing: 20) {
                        ForEach(viewModel.listings) { listing in
                            ListingCard(listing: listing)
                                .onTapGesture {
                                    selectedListing = listing
                                }
                        }
                    }
                    .padding(.horizontal)
                    .padding(.bottom, 100)
                }
            }
        }
    }
}

// MARK: - Listing Card Component
struct ListingCard: View {
    let listing: Listing
    @ObservedObject private var favoritesManager = FavoritesManager.shared
    @State private var currentImageIndex = 0
    
    private var isSaved: Bool {
        favoritesManager.isFavorite(listing.id)
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            ZStack(alignment: .topTrailing) {
                // Image Carousel
                TabView(selection: $currentImageIndex) {
                    if (listing.images ?? []).isEmpty {
                        // Placeholder when no images
                        placeholderImage
                            .tag(0)
                    } else {
                        ForEach(Array((listing.images ?? []).enumerated()), id: \.offset) { index, imageUrl in
                            AsyncImage(url: URL(string: imageUrl)) { phase in
                                switch phase {
                                case .success(let image):
                                    image
                                        .resizable()
                                        .aspectRatio(contentMode: .fill)
                                case .failure:
                                    placeholderImage
                                case .empty:
                                    placeholderImage
                                        .overlay {
                                            ProgressView()
                                        }
                                @unknown default:
                                    placeholderImage
                                }
                            }
                            .tag(index)
                        }
                    }
                }
                .tabViewStyle(.page(indexDisplayMode: (listing.images?.count ?? 0) > 1 ? .automatic : .never))
                .frame(height: 200)
                .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
                
                // Save Button
                Button {
                    Task {
                        await favoritesManager.toggleFavorite(for: listing.id)
                    }
                } label: {
                    Image(systemName: isSaved ? "heart.fill" : "heart")
                        .font(.title3.weight(.semibold))
                        .foregroundStyle(isSaved ? .red : .white)
                        .padding(10)
                        .background(.ultraThinMaterial, in: Circle())
                }
                .padding(12)
            }
            
            VStack(alignment: .leading, spacing: 8) {
                HStack(alignment: .firstTextBaseline) {
                    Text(listing.formattedPrice)
                        .font(.title3.weight(.bold))
                        .foregroundStyle(Color.collegioOrange)
                    
                    Spacer()
                    
                    if listing.isAvailable {
                        Text("Available")
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(.green)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(.green.opacity(0.12), in: Capsule())
                    }
                }
                
                Text(listing.title)
                    .font(.subheadline.weight(.semibold))
                    .lineLimit(1)
                
                HStack(spacing: 4) {
                    Image(systemName: "mappin.circle.fill")
                        .font(.caption2)
                    Text(listing.address)
                        .font(.caption)
                        .lineLimit(1)
                }
                .foregroundStyle(.secondary)
                
                HStack(spacing: 16) {
                    FeatureBadge(icon: "bed.double.fill", text: listing.bedroomsText)
                    FeatureBadge(icon: "shower.fill", text: listing.bathroomsText)
                    if let distance = listing.distance {
                        FeatureBadge(icon: "figure.walk", text: String(format: "%.1f mi", distance))
                    }
                }
            }
            .padding(14)
        }
        .background {
            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .fill(.ultraThinMaterial)
        }
        .overlay {
            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .stroke(Color.white.opacity(0.15), lineWidth: 0.5)
        }
        .shadow(color: .black.opacity(0.08), radius: 12, x: 0, y: 6)
    }
    
    private var placeholderImage: some View {
        RoundedRectangle(cornerRadius: 20, style: .continuous)
            .fill(
                LinearGradient(
                    colors: [Color.gray.opacity(0.2), Color.gray.opacity(0.35)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
            .frame(height: 200)
            .overlay {
                Image(systemName: "photo")
                    .font(.system(size: 36, weight: .light))
                    .foregroundStyle(.secondary.opacity(0.5))
            }
    }
}


// MARK: - Feature Badge
struct FeatureBadge: View {
    let icon: String
    let text: String
    
    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: icon)
                .font(.caption2)
                .foregroundStyle(Color.collegioOrange.opacity(0.8))
            Text(text)
                .font(.caption.weight(.medium))
                .foregroundStyle(.secondary)
        }
    }
}



#Preview {
    HomeView()
}

#Preview("Dark Mode") {
    HomeView()
        .preferredColorScheme(.dark)
}
