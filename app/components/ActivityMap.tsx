'use client';

import { useEffect, useRef } from 'react';
import quokkaMapPin from '@/app/ui/resources/quokkamappin.svg';

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
    mapboxgl: {
      Map: new (options: Record<string, unknown>) => {
        on: (event: string, callback: () => void) => void;
        addControl: (control: unknown, position?: string) => void;
        remove: () => void;
      };
      Marker: new (options?: Record<string, unknown>) => {
        setLngLat: (coords: [number, number]) => {
          setPopup: (popup: unknown) => {
            addTo: (map: unknown) => void;
          };
        };
      };
      Popup: new (options?: { offset?: number }) => {
        setHTML: (html: string) => unknown;
      };
      NavigationControl: new () => unknown;
      accessToken: string | undefined;
    };
  }
}



export default function ActivityMap({ activities }: ActivityMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const map = useRef<any>(null);
  const pinSrc =
    typeof quokkaMapPin === 'string' ? quokkaMapPin : quokkaMapPin.src;

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
        // Add markers for each activity with valid coordinates
        validActivities.forEach((activity) => {
          // Create popup with HTML content
          const popup = new window.mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div class="popup-content">
                <h3 class="text-lg font-semibold text-[#501F15]">
                  ${activity.link ? `<a href="${activity.link}" target="_blank" rel="noopener noreferrer">${activity.name}</a>` : activity.name}
                </h3>
                <p class="text-sm text-gray-600 mt-2 mb-3">${activity.description}</p>
                <div class="flex items-center justify-between">
                  <span class="px-2 py-1 rounded text-xs font-medium ${
                    activity.costRange === 'Free' ? 'bg-[#9CDE9F]/35 text-[#2E6D34]' :
                    activity.costRange === '$' ? 'bg-[#BB8C67]/25 text-[#876047]' :
                    activity.costRange === '$$' ? 'bg-[#EE4D65]/20 text-[#8E2537]' :
                    'bg-[#501F15]/20 text-[#501F15]'
                  }">${activity.costRange}</span>
                  ${activity.link ? `<a href="${activity.link}" target="_blank" rel="noopener noreferrer" class="text-[#EE4D65] text-sm hover:underline">Learn More →</a>` : ''}
                </div>
              </div>
            `);

          // Use the branded quokka pin as a custom marker element.
          // Inline styles are required because Mapbox marker elements are
          // created outside React's styled-jsx scope.
          const markerElement = document.createElement('div');
          markerElement.style.width = '42px';
          markerElement.style.height = '42px';
          markerElement.style.cursor = 'pointer';
          markerElement.style.transform = 'translateY(-6px)';
          markerElement.style.display = 'flex';
          markerElement.style.alignItems = 'center';
          markerElement.style.justifyContent = 'center';

          const markerImage = document.createElement('img');
          markerImage.src = pinSrc;
          markerImage.alt = activity.name;
          markerImage.style.width = '100%';
          markerImage.style.height = '100%';
          markerImage.style.objectFit = 'contain';
          markerImage.style.filter = 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.25))';
          markerElement.appendChild(markerImage);

          new window.mapboxgl.Marker({ element: markerElement, anchor: 'bottom' })
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
          color: #ee4d65;
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
          color: #ee4d65;
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