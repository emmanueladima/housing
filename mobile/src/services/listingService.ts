import api from './api';

export interface Listing {
    _id: string;
    title: string;
    description: string;
    rent: number;
    bedrooms: number;
    bathrooms: number;
    sqft?: number;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    images: string[];
    amenities: string[];
    availableDate: string;
    landlord: {
        _id: string;
        name: string;
        firstName?: string;
        lastName?: string;
        profilePhoto?: string;
    };
    isVerified?: boolean;
    isFavorite?: boolean;
    coordinates?: {
        lat: number;
        lng: number;
    };
    latitude?: number;
    longitude?: number;
    createdAt: string;
}

export interface ListingFilters {
    city?: string;
    priceMin?: number;
    priceMax?: number;
    bedrooms?: number;
    bathrooms?: number;
    amenities?: string[];
    page?: number;
    limit?: number;
}

const listingService = {
    // Get all listings with filters
    async getListings(filters: ListingFilters = {}): Promise<{ listings: Listing[]; total: number }> {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                if (Array.isArray(value)) {
                    value.forEach((v) => params.append(key, String(v)));
                } else {
                    params.append(key, String(value));
                }
            }
        });

        const response = await api.get(`/listings?${params.toString()}`);
        return response.data;
    },

    // Get single listing
    async getListing(id: string): Promise<Listing> {
        const response = await api.get(`/listings/${id}`);
        return response.data.listing;
    },

    // Toggle favorite
    async toggleFavorite(id: string): Promise<{ isFavorite: boolean }> {
        const response = await api.post(`/listings/${id}/favorite`);
        return response.data;
    },

    // Get saved/favorite listings
    async getSavedListings(): Promise<Listing[]> {
        const response = await api.get('/listings/favorites');
        return response.data.listings;
    },

    // Get my listings (landlord)
    async getMyListings(): Promise<Listing[]> {
        const response = await api.get('/listings/my/listings');
        return response.data.listings;
    },

    // Create a new listing
    async createListing(data: Partial<Listing>): Promise<Listing> {
        const response = await api.post('/listings', data);
        return response.data.listing;
    },
};

export default listingService;
