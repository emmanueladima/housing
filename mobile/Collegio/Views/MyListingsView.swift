import SwiftUI

struct MyListingsView: View {
    @State private var listings: [Listing] = []
    @State private var isLoading = true
    
    var body: some View {
        ZStack {
            GradientBackground()
            
            if isLoading {
                ProgressView("Loading your listings...")
            } else if listings.isEmpty {
                VStack(spacing: 16) {
                    Image(systemName: "house.fill")
                        .font(.system(size: 48))
                        .foregroundStyle(.secondary)
                    
                    Text("No Listings Yet")
                        .font(.title2.bold())
                    
                    Text("Listings you create will appear here")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                    
                    NavigationLink(destination: CreateListingView()) {
                        HStack(spacing: 8) {
                            Image(systemName: "plus")
                            Text("Create Listing")
                        }
                        .font(.headline)
                        .foregroundStyle(.white)
                        .padding(.horizontal, 24)
                        .padding(.vertical, 14)
                        .background(Color.collegioOrange, in: RoundedRectangle(cornerRadius: 12))
                    }
                    .padding(.top, 8)
                }
            } else {
                ScrollView {
                    LazyVStack(spacing: 16) {
                        ForEach(listings) { listing in
                            ListingCard(listing: listing)
                        }
                    }
                    .padding()
                }
            }
        }
        .navigationTitle("My Listings")
        .navigationBarTitleDisplayMode(.large)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                NavigationLink(destination: CreateListingView()) {
                    Image(systemName: "plus")
                        .font(.title3.weight(.semibold))
                        .foregroundStyle(Color.collegioOrange)
                }
            }
        }
        .task {
            await loadMyListings()
        }
    }
    
    private func loadMyListings() async {
        // TODO: Implement API call to fetch user's listings
        try? await Task.sleep(nanoseconds: 500_000_000)
        isLoading = false
    }
}

#Preview {
    NavigationStack {
        MyListingsView()
    }
}
