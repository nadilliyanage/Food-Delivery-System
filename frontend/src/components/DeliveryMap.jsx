import React, { useEffect, useRef, useState } from "react";
import tt from "@tomtom-international/web-sdk-maps";
import "@tomtom-international/web-sdk-maps/dist/maps.css";

const DeliveryMap = ({
  restaurantLocation,
  customerLocation,
  deliveryPersonLocation,
}) => {
  const mapElement = useRef(null);
  const [map, setMap] = useState(null);
  const [route, setRoute] = useState(null);
  const [error, setError] = useState(null);
  const markersRef = useRef([]); // Keep track of all markers
  const [routePoints, setRoutePoints] = useState(null);

  // Debug logging
  useEffect(() => {
    console.log("DeliveryMap props:", {
      restaurantLocation,
      customerLocation,
      deliveryPersonLocation,
    });
  }, [restaurantLocation, customerLocation, deliveryPersonLocation]);

  // Initialize map
  useEffect(() => {
    if (!restaurantLocation) return;

    try {
      const mapInstance = tt.map({
        key: "UMDEqLx44SlvYeLWgVXryA5GlW5tVW2B", // TomTom API key
        container: mapElement.current,
        center: restaurantLocation,
        zoom: 13,
        language: "en-US",
        style:
          "https://api.tomtom.com/style/1/style/*?map=2/basic_street-light",
      });

      // Add navigation controls
      mapInstance.addControl(new tt.NavigationControl());

      setMap(mapInstance);

      return () => {
        mapInstance.remove();
      };
    } catch (err) {
      console.error("Error initializing map:", err);
      setError("Failed to initialize map. Please try again later.");
    }
  }, [restaurantLocation]);

  // Update map when locations change
  useEffect(() => {
    if (!map || !restaurantLocation || !customerLocation) return;

    try {
      // Clear all existing markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      // Clear existing route
      if (route) {
        map.removeLayer("route");
        map.removeSource("route");
      }

      // Add markers for locations
      // Restaurant marker
      const restaurantMarker = new tt.Marker({
        element: createMarkerElement(
          "Restaurant",
          "bg-red-500",
          restaurantIcon
        ),
        anchor: "bottom",
      })
        .setLngLat(restaurantLocation)
        .addTo(map);
      markersRef.current.push(restaurantMarker);

      // Customer marker
      const customerMarker = new tt.Marker({
        element: createMarkerElement("Me", "bg-green-500", customerIcon),
        anchor: "bottom",
      })
        .setLngLat(customerLocation)
        .addTo(map);
      markersRef.current.push(customerMarker);

      // Delivery person marker (if location is available)
      if (
        deliveryPersonLocation &&
        Array.isArray(deliveryPersonLocation) &&
        deliveryPersonLocation.length === 2
      ) {
        console.log(
          "Adding delivery person marker at:",
          deliveryPersonLocation
        );
        const deliveryMarker = new tt.Marker({
          element: createMarkerElement(
            "Delivery Person",
            "bg-blue-500",
            deliveryIcon
          ),
          anchor: "bottom",
        })
          .setLngLat(deliveryPersonLocation)
          .addTo(map);
        markersRef.current.push(deliveryMarker);
      }

      // Calculate and draw route
      const calculateRoute = async () => {
        try {
          const response = await fetch(
            `https://api.tomtom.com/routing/1/calculateRoute/${restaurantLocation[1]},${restaurantLocation[0]}:${customerLocation[1]},${customerLocation[0]}/json?key=UMDEqLx44SlvYeLWgVXryA5GlW5tVW2B&routeType=fastest&traffic=true&travelMode=car&language=en-US`
          );
          const data = await response.json();

          if (data.routes && data.routes[0]) {
            const routeCoordinates = data.routes[0].legs[0].points.map(
              (point) => [point.longitude, point.latitude]
            );
            setRoutePoints(routeCoordinates);

            // Add route source
            if (map.getSource("route")) {
              map.getSource("route").setData({
                type: "Feature",
                properties: {},
                geometry: {
                  type: "LineString",
                  coordinates: routeCoordinates,
                },
              });
            } else {
              map.addSource("route", {
                type: "geojson",
                data: {
                  type: "Feature",
                  properties: {},
                  geometry: {
                    type: "LineString",
                    coordinates: routeCoordinates,
                  },
                },
              });

              // Add route layer
              map.addLayer({
                id: "route",
                type: "line",
                source: "route",
                layout: {
                  "line-join": "round",
                  "line-cap": "round",
                },
                paint: {
                  "line-color": "#3B82F6",
                  "line-width": 4,
                },
              });
            }

            // Fit map to show all points
            const bounds = new tt.LngLatBounds();
            routeCoordinates.forEach((coord) => bounds.extend(coord));
            if (
              deliveryPersonLocation &&
              Array.isArray(deliveryPersonLocation)
            ) {
              bounds.extend(deliveryPersonLocation);
            }
            map.fitBounds(bounds, { padding: 50 });
          }
        } catch (err) {
          console.error("Error calculating route:", err);
          setError("Failed to calculate route");
        }
      };

      calculateRoute();
    } catch (err) {
      console.error("Error updating map:", err);
      setError("Failed to update map");
    }
  }, [map, restaurantLocation, customerLocation, deliveryPersonLocation]);

  // SVG Icons for markers
  const restaurantIcon = `
    <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <g>
        <path fill="none" d="M0 0h24v24H0z"/>
        <path d="M21 2v20h-2v-8h-3V7a5 5 0 0 1 5-5zM9 13.9V22H7v-8.1A5.002 5.002 0 0 1 3 9V3h2v7h2V3h2v7h2V3h2v6a5.002 5.002 0 0 1-4 4.9z"/>
    </g>
</svg>
  `;

  const customerIcon = `
    <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
    </svg>
  `;

  const deliveryIcon = `
    <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 7c0-1.1-.9-2-2-2h-3v2h3v2.65L13.52 14H10V9H6c-2.21 0-4 1.79-4 4v3h2c0 1.66 1.34 3 3 3s3-1.34 3-3h4.48L19 10.35V7zM7 17c-.55 0-1-.45-1-1h2c0 .55-.45 1-1 1z"/>
      <path d="M10 6H5V4h5v2zm9 7c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm0 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
    </svg>
  `;

  const createMarkerElement = (label, color, icon) => {
    const element = document.createElement("div");
    element.className = `relative flex flex-col items-center`;

    const marker = document.createElement("div");
    marker.className = `w-10 h-10 rounded-full ${color} flex items-center justify-center text-white shadow-lg`;

    // Add icon
    marker.innerHTML = icon;

    const labelElement = document.createElement("div");
    labelElement.className =
      "absolute -bottom-6 text-xs font-medium text-gray-700 whitespace-nowrap bg-white px-2 py-1 rounded shadow-sm";
    labelElement.textContent = label;

    element.appendChild(marker);
    element.appendChild(labelElement);

    return element;
  };

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden">
      <div ref={mapElement} className="w-full h-full" />
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
    </div>
  );
};

export default DeliveryMap;
