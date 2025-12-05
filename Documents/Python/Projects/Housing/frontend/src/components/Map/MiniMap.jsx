import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const MiniMap = ({ coordinates, rent, address }) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const marker = useRef(null);

    useEffect(() => {
        if (!MAPBOX_TOKEN) {
            console.error('Mapbox token is missing!');
            return;
        }

        if (!coordinates?.lat || !coordinates?.lng) {
            console.warn('Invalid coordinates provided to MiniMap');
            return;
        }

        mapboxgl.accessToken = MAPBOX_TOKEN;

        // Initialize map
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [coordinates.lng, coordinates.lat],
            zoom: 14,
            interactive: true,
        });

        // Add navigation controls
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Create pill-shaped marker
        const el = document.createElement('div');
        el.className = 'mini-map-marker';
        el.style.cursor = 'pointer';

        // Calculate pill width based on rent digits
        const rentStr = `$${rent}`;
        const pillWidth = Math.max(50, rentStr.length * 10);

        el.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #DB4A2B 0%, #B0361C 100%);
        padding: 4px 10px;
        border-radius: 16px;
        box-shadow: 0 2px 8px rgba(219, 74, 43, 0.3);
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
            el.querySelector('div').style.transform = 'translate(-50%, -50%) scale(1.1)';
            el.querySelector('div').style.boxShadow = '0 6px 16px rgba(249, 115, 22, 0.5)';
        });

        el.addEventListener('mouseleave', () => {
            el.querySelector('div').style.transform = 'translate(-50%, -50%) scale(1)';
            el.querySelector('div').style.boxShadow = '0 4px 12px rgba(249, 115, 22, 0.4)';
        });

        // Create and add marker
        marker.current = new mapboxgl.Marker(el)
            .setLngLat([coordinates.lng, coordinates.lat])
            .setPopup(
                new mapboxgl.Popup({ offset: 25, closeButton: false })
                    .setHTML(`
            <div class="p-2">
              <p class="font-semibold text-sm text-gray-900">${address}</p>
              <p class="text-orange-600 font-bold text-lg">$${rent}/mo</p>
            </div>
          `)
            )
            .addTo(map.current);

        // Cleanup
        return () => {
            if (marker.current) marker.current.remove();
            if (map.current) map.current.remove();
        };
    }, [coordinates, rent, address]);

    return (
        <div
            ref={mapContainer}
            className="w-full h-64 md:h-80 rounded-xl overflow-hidden shadow-md"
            style={{ minHeight: '256px' }}
        />
    );
};

export default MiniMap;
