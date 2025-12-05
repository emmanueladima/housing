import React, { useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { OSU_CENTER, OSU_CAMPUS_POLYGON } from '../../utils/campusData';

// Fix default marker icon issue with Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons for different states
const createCustomIcon = (color = '#DB4A2B') => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 28px;
        height: 28px;
        border-radius: 50% 50% 50% 0;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        transform: rotate(-45deg);
      ">
        <div style="
          width: 100%;
          height: 100%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
};

// Component to recenter map when listings change
const RecenterMap = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng], map.getZoom());
    }
  }, [center, map]);

  return null;
};

const ListingMap = ({
  listings = [],
  selectedListing,
  onMarkerClick,
  showCampusOverlay = false,
  commuteLayer = false,
  commuteData = {},
}) => {
  const mapRef = useRef(null);

  // Filter listings with valid coordinates
  const validListings = listings.filter(
    listing => listing.location?.coordinates?.lat && listing.location?.coordinates?.lng
  );

  // Determine map center
  const mapCenter = selectedListing?.location?.coordinates?.lat
    ? [selectedListing.location.coordinates.lat, selectedListing.location.coordinates.lng]
    : [OSU_CENTER.lat, OSU_CENTER.lng];

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={mapCenter}
        zoom={13}
        className="h-full w-full"
        ref={mapRef}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Campus overlay polygon */}
        {showCampusOverlay && (
          <Polygon
            positions={OSU_CAMPUS_POLYGON}
            pathOptions={{
              color: '#DB4A2B',
              fillColor: '#DB4A2B',
              fillOpacity: 0.1,
              weight: 2,
            }}
          />
        )}

        {/* Listing markers */}
        {validListings.map((listing) => {
          const { lat, lng } = listing.location.coordinates;

          // Determine marker color based on commute layer
          let markerColor = '#DB4A2B'; // Default orange
          if (commuteLayer && commuteData[listing._id]) {
            markerColor = commuteData[listing._id].color;
          }

          const isSelected = selectedListing?._id === listing._id;
          if (isSelected) {
            markerColor = '#dc2626'; // Red for selected
          }

          return (
            <Marker
              key={listing._id}
              position={[lat, lng]}
              icon={createCustomIcon(markerColor)}
              eventHandlers={{
                click: () => onMarkerClick && onMarkerClick(listing),
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-sm mb-1">{listing.title}</h3>
                  <p className="text-lg font-bold text-orange-600">
                    ${listing.price}/month
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {listing.location?.address || 'Address not provided'}
                  </p>
                  {commuteLayer && commuteData[listing._id] && (
                    <p className="text-xs text-gray-700 mt-1 font-medium">
                      ~{commuteData[listing._id].minutes} min to campus
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        <RecenterMap center={selectedListing?.location?.coordinates || OSU_CENTER} />
      </MapContainer>

      {/* Empty state overlay */}
      {validListings.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-90 z-[1000] pointer-events-none">
          <div className="text-center">
            <p className="text-gray-600 font-medium">No listings with valid coordinates</p>
            <p className="text-sm text-gray-500 mt-1">Listings will appear here when they have location data</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingMap;





