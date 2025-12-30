import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { OSU_CENTER } from '../../utils/campusData';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const MapboxMap = ({
    listings = [],
    selectedListing,
    onMarkerClick,
    showCampusOverlay = false
}) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const markers = useRef({});

    useEffect(() => {
        console.log('Initializing Mapbox Map...');
        console.log('Token exists:', !!MAPBOX_TOKEN);
        if (!MAPBOX_TOKEN) {
            console.error('Mapbox token is missing! Please check your .env file.');
            return;
        }

        mapboxgl.accessToken = MAPBOX_TOKEN;

        if (map.current) return; // initialize map only once

        const center = selectedListing?.location?.coordinates?.lat
            ? [selectedListing.location.coordinates.lng, selectedListing.location.coordinates.lat]
            : [OSU_CENTER.lng, OSU_CENTER.lat];

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: center,
            zoom: 13,
        });

        // map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        map.current.on('load', () => {
            if (showCampusOverlay) {
                // Add campus overlay if needed
            }
        });

    }, []);

    // Highlight selected listing marker (no zoom)
    // The marker highlighting is handled by the marker update effect below

    // Update markers when listings change
    useEffect(() => {
        if (!map.current) return;

        // Clear existing markers
        Object.values(markers.current).forEach(marker => marker.remove());
        markers.current = {};

        listings.forEach(listing => {
            const coordinates = listing.location?.coordinates || listing.coordinates;
            if (!coordinates?.lat || !coordinates?.lng) return;

            const { lat, lng } = coordinates;
            const isSelected = selectedListing?._id === listing._id;

            // Create a DOM element for the marker
            const el = document.createElement('div');
            el.className = 'marker';
            el.style.cursor = 'pointer';

            // Calculate pill width based on rent digits
            const rentStr = `$${listing.rent || listing.price}`;
            const pillWidth = Math.max(50, rentStr.length * 10);

            el.innerHTML = `
        <div style="
          background: ${isSelected
                    ? '#ffffff'
                    : 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)'};
          padding: 4px 10px;
          border-radius: 16px;
          border: ${isSelected ? '2px solid #ea580c' : 'none'};
          box-shadow: 0 2px 8px ${isSelected ? 'rgba(0, 0, 0, 0.2)' : 'rgba(234, 88, 12, 0.3)'};
          font-weight: bold;
          font-size: 12px;
          color: ${isSelected ? '#ea580c' : 'white'};
          border: 2px solid white;
          white-space: nowrap;
          transform: translate(-50%, -50%);
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: ${pillWidth}px;
          transition: all 0.2s ease;
        ">
          ${rentStr}
        </div>
      `;

            // Add hover effect
            el.addEventListener('mouseenter', () => {
                const div = el.querySelector('div');
                div.style.transform = 'translate(-50%, -50%) scale(1.1)';
                div.style.boxShadow = `0 6px 16px ${isSelected ? 'rgba(0, 0, 0, 0.3)' : 'rgba(234, 88, 12, 0.5)'}`;
            });

            el.addEventListener('mouseleave', () => {
                const div = el.querySelector('div');
                div.style.transform = 'translate(-50%, -50%) scale(1)';
                div.style.boxShadow = `0 4px 12px ${isSelected ? 'rgba(0, 0, 0, 0.2)' : 'rgba(234, 88, 12, 0.4)'}`;
            });

            const marker = new mapboxgl.Marker(el)
                .setLngLat([lng, lat])
                .setPopup(
                    new mapboxgl.Popup({ offset: 25 })
                        .setHTML(`
              <div class="p-2">
                <h3 class="font-bold text-sm">${listing.title}</h3>
                <p class="text-orange-600 font-bold">$${listing.rent || listing.price}/mo</p>
              </div>
            `)
                )
                .addTo(map.current);

            el.addEventListener('click', () => {
                if (onMarkerClick) onMarkerClick(listing);
            });

            markers.current[listing._id] = marker;
        });
    }, [listings, selectedListing, onMarkerClick]);

    // Removed: Map no longer zooms when hovering over listings
    // Instead, markers are highlighted via color change in the marker update effect

    // Custom Map Controls
    const handleZoomIn = () => {
        map.current?.zoomIn();
    };

    const handleZoomOut = () => {
        map.current?.zoomOut();
    };

    const handleGeolocate = () => {
        if (!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                map.current?.flyTo({
                    center: [longitude, latitude],
                    zoom: 14,
                    essential: true
                });

                // Add user location marker
                new mapboxgl.Marker({ color: '#ea580c' })
                    .setLngLat([longitude, latitude])
                    .addTo(map.current);
            },
            (error) => {
                console.error('Error getting location:', error);
            }
        );
    };

    return (
        <div className="relative h-full w-full rounded-xl overflow-hidden group">
            <div ref={mapContainer} className="h-full w-full" />

            {/* Custom Controls - Left Side - Blur Glass Effect */}
            <div className="absolute left-4 top-24 flex flex-col gap-2 z-10">
                <button
                    onClick={handleZoomIn}
                    className="w-10 h-10 bg-white/70 backdrop-blur-xl border border-white/30 rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-white/90 hover:text-orange-600 transition-colors focus:outline-none"
                    title="Zoom In"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
                <button
                    onClick={handleZoomOut}
                    className="w-10 h-10 bg-white/70 backdrop-blur-xl border border-white/30 rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-white/90 hover:text-orange-600 transition-colors focus:outline-none"
                    title="Zoom Out"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
                <button
                    onClick={handleGeolocate}
                    className="w-10 h-10 bg-white/70 backdrop-blur-xl border border-white/30 rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-white/90 hover:text-orange-600 transition-colors focus:outline-none mt-2"
                    title="My Location"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
                </button>
            </div>
        </div>
    );
};

export default MapboxMap;
