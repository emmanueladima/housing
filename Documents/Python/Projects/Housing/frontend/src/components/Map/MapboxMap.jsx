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

        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        map.current.on('load', () => {
            if (showCampusOverlay) {
                // Add campus overlay if needed
            }
        });

    }, []);

    // Fly to selected listing
    useEffect(() => {
        if (!map.current || !selectedListing) return;

        const coordinates = selectedListing.location?.coordinates || selectedListing.coordinates;
        if (coordinates?.lat && coordinates?.lng) {
            map.current.flyTo({
                center: [coordinates.lng, coordinates.lat],
                zoom: 15,
                essential: true,
                speed: 1.2,
                curve: 1.42
            });
        }
    }, [selectedListing]);

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
                    ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
                    : 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'};
          padding: 4px 10px;
          border-radius: 16px;
          box-shadow: 0 2px 8px ${isSelected ? 'rgba(220, 38, 38, 0.3)' : 'rgba(249, 115, 22, 0.3)'};
          font-weight: bold;
          font-size: 12px;
          color: white;
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
                div.style.boxShadow = `0 6px 16px ${isSelected ? 'rgba(220, 38, 38, 0.5)' : 'rgba(249, 115, 22, 0.5)'}`;
            });

            el.addEventListener('mouseleave', () => {
                const div = el.querySelector('div');
                div.style.transform = 'translate(-50%, -50%) scale(1)';
                div.style.boxShadow = `0 4px 12px ${isSelected ? 'rgba(220, 38, 38, 0.4)' : 'rgba(249, 115, 22, 0.4)'}`;
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

    // Recenter when selectedListing changes
    useEffect(() => {
        if (!map.current || !selectedListing?.location?.coordinates) return;

        const { lat, lng } = selectedListing.location.coordinates;
        map.current.flyTo({
            center: [lng, lat],
            zoom: 14,
            essential: true
        });
    }, [selectedListing]);

    return (
        <div ref={mapContainer} className="h-full w-full rounded-xl overflow-hidden" />
    );
};

export default MapboxMap;
