'use client';

import { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';

interface Activity {
  name: string;
  description: string;
  whyItMatches: string;
  costRange: string;
  link: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface ActivityMapProps {
  activities: Activity[];
}

declare global {
  interface Window {
    mapboxgl: any;
  }
}

// Define the PopupContent component
const PopupContent = ({ activity }: { activity: Activity }) => {
  return (
    <div className="p-3">
      <h3 className="text-lg font-semibold text-blue-600">
        {activity.link ? (
          <a href={activity.link} target="_blank" rel="noopener noreferrer">
            {activity.name}
          </a>
        ) : (
          activity.name
        )}
      </h3>
      <p className="text-sm text-gray-600 mt-2 mb-3">{activity.description}</p>
      <div className="flex items-center justify-between">
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          activity.costRange === 'Free' ? 'bg-green-100 text-green-800' :
          activity.costRange === '$' ? 'bg-blue-100 text-blue-800' :
          activity.costRange === '$$' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {activity.costRange}
        </span>
        {activity.link && (
          <a 
            href={activity.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 text-sm hover:underline"
          >
            Learn More →
          </a>
        )}
      </div>
    </div>
  );
};

export default function ActivityMap({ activities }: ActivityMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current || activities.length === 0) return;

    // Load Mapbox GL JS
    const script = document.createElement('script');
    script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
    script.onload = () => {
      const link = document.createElement('link');
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);

      // Initialize map
      window.mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY;
      
      // Filter activities with valid coordinates
      const validActivities = activities.filter(activity => 
        activity.coordinates && 
        typeof activity.coordinates.lat === 'number' && 
        typeof activity.coordinates.lng === 'number'
      );

      if (validActivities.length === 0) {
        console.warn('No activities with valid coordinates found');
        return;
      }

      // Calculate center point from activities with valid coordinates
      const centerLat = validActivities.reduce((sum, activity) => sum + activity.coordinates.lat, 0) / validActivities.length;
      const centerLng = validActivities.reduce((sum, activity) => sum + activity.coordinates.lng, 0) / validActivities.length;

      map.current = new window.mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [centerLng, centerLat],
        zoom: 12,
        attributionControl: false,
      });

      // Add navigation control
      map.current.addControl(new window.mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        setMapLoaded(true);
        
        const ORANGE_COLOR = '#ff6700';

        // Add markers for each activity with valid coordinates
        validActivities.forEach((activity, index) => {
          // Create popup with HTML content
          const popup = new window.mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div class="popup-content">
                <h3 class="text-lg font-semibold text-blue-600">
                  ${activity.link ? `<a href="${activity.link}" target="_blank" rel="noopener noreferrer">${activity.name}</a>` : activity.name}
                </h3>
                <p class="text-sm text-gray-600 mt-2 mb-3">${activity.description}</p>
                <div class="flex items-center justify-between">
                  <span class="px-2 py-1 rounded text-xs font-medium ${
                    activity.costRange === 'Free' ? 'bg-green-100 text-green-800' :
                    activity.costRange === '$' ? 'bg-blue-100 text-blue-800' :
                    activity.costRange === '$$' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }">${activity.costRange}</span>
                  ${activity.link ? `<a href="${activity.link}" target="_blank" rel="noopener noreferrer" class="text-blue-500 text-sm hover:underline">Learn More →</a>` : ''}
                </div>
              </div>
            `);

          // Add marker to map using Mapbox's built-in markers
          new window.mapboxgl.Marker({ color: '#3b82f6' })
            .setLngLat([activity.coordinates.lng, activity.coordinates.lat])
            .setPopup(popup)
            .addTo(map.current);
        });
      });
    };
    document.head.appendChild(script);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [activities]);



  if (activities.length === 0) return null;

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden shadow-lg">
      <div ref={mapContainer} className="w-full h-full" />
      <style jsx>{`
        .popup-content {
          max-width: 280px;
          padding: 12px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .popup-content h3 {
          margin: 0 0 8px 0;
          color: #1f2937;
          font-size: 16px;
          font-weight: 600;
        }
        
        .popup-content h3 a {
          color: #3b82f6;
          text-decoration: none;
        }
        
        .popup-content h3 a:hover {
          text-decoration: underline;
        }
        
        .popup-content p {
          margin: 0 0 12px 0;
          color: #6b7280;
          font-size: 14px;
          line-height: 1.4;
        }
        
        .popup-content .flex {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        
        .popup-content a {
          color: #3b82f6;
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
        }
        
        .popup-content a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
} 