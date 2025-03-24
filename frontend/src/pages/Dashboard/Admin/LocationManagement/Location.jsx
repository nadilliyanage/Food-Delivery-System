import React, { useEffect, useRef, useState } from "react";
import "@tomtom-international/web-sdk-maps/dist/maps.css";
import tt from "@tomtom-international/web-sdk-maps";
import useAxiosFetch from "../../../../hooks/useAxiosFetch";

const LiveLocationMap = () => {
  const mapContainer = useRef(null);
  const [map, setMap] = useState(null);
  const [userCoordinates, setUserCoordinates] = useState({
    latitude: null,
    longitude: null,
  });
  const [users, setUsers] = useState([]); // State for all users' locations
  const [pins, setPins] = useState([]); // State for user-added pins

  // Function to detect if the device is mobile or tablet
  const isMobileOrTablet = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  };

  // Get the user's current location
  const updateLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserCoordinates({ latitude, longitude });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Fallback location (San Francisco)
          setUserCoordinates({ latitude: 37.7749, longitude: -122.4194 });
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      // Fallback location (San Francisco)
      setUserCoordinates({ latitude: 37.7749, longitude: -122.4194 });
    }
  };

  // Fetch users using the custom hook
  const { data: fetchedUsers, error } = useAxiosFetch("/users");

  useEffect(() => {
    if (fetchedUsers) {
      setUsers(fetchedUsers); // Set users with latitude and longitude
    }
    if (error) {
      console.error("Error fetching users:", error);
    }
  }, [fetchedUsers, error]);

  // Initialize the map
  useEffect(() => {
    const mapInstance = tt.map({
      key: "zpWMpFIL0L2YfyAwnfXY3PTNQezdw9RV", // Your TomTom API key
      container: mapContainer.current,
      dragPan: !isMobileOrTablet(), // Disable drag on mobile/tablet
      zoom: 14, // Set initial zoom level
      center: [0, 0], // Center at [0, 0] initially
    });

    // Add Fullscreen and Navigation controls to the map
    mapInstance.addControl(new tt.FullscreenControl());
    mapInstance.addControl(new tt.NavigationControl());

    setMap(mapInstance);

    // Add click event to the map to add pins
    mapInstance.on("click", (event) => {
      const { lng, lat } = event.lngLat;
      addPin(lat, lng); // Add a pin at the clicked location
    });

    // Cleanup function to remove the map when the component unmounts
    return () => {
      mapInstance.off("click"); // Remove click event listener
      mapInstance.remove();
    };
  }, []);

  // Update the vehicle marker position whenever userCoordinates change
  useEffect(() => {
    if (map && userCoordinates.latitude && userCoordinates.longitude) {
      // Update the map center
      map.setCenter([userCoordinates.longitude, userCoordinates.latitude]);

      // Remove existing vehicle marker (if any)
      const existingMarker = document.getElementById("vehicle-marker");
      if (existingMarker) {
        existingMarker.remove();
      }

      // Add a marker for the user's current location (vehicle icon)
      const vehicleMarker = new tt.Marker({ element: createVehicleMarker() })
        .setLngLat([userCoordinates.longitude, userCoordinates.latitude])
        .addTo(map);

      console.log("Vehicle marker added at:", userCoordinates);
    }
  }, [map, userCoordinates]);

  // Add pins for all users
  useEffect(() => {
    if (map && users.length > 0) {
      // Clear existing user markers (if any)
      const existingUserMarkers =
        document.getElementsByClassName("user-marker");
      while (existingUserMarkers.length > 0) {
        existingUserMarkers[0].remove();
      }

      // Iterate over all users and add markers for each
      users.forEach((user) => {
        const { latitude, longitude, name } = user;
        if (latitude && longitude) {
          const marker = new tt.Marker({ element: createUserMarker(name) })
            .setLngLat([longitude, latitude])
            .addTo(map);
        }
      });
    }
  }, [map, users]);

  // Function to add a pin
  const addPin = (latitude, longitude) => {
    setPins((prevPins) => [...prevPins, { latitude, longitude }]);

    // Create and add a marker for the new pin
    const marker = new tt.Marker({ element: createPinMarker() })
      .setLngLat([longitude, latitude])
      .addTo(map);

    // Store the marker with its position to enable removal later
    marker.getElement().addEventListener("click", () => {
      removePin(latitude, longitude, marker);
    });
  };

  // Function to remove a pin
  const removePin = (latitude, longitude, marker) => {
    // Filter out the pin from state
    setPins((prevPins) =>
      prevPins.filter(
        (pin) => pin.latitude !== latitude || pin.longitude !== longitude
      )
    );

    // Remove the marker from the map
    marker.remove();
  };

  // Create a vehicle marker element
  const createVehicleMarker = () => {
    const markerDiv = document.createElement("div");
    markerDiv.id = "vehicle-marker"; // Unique ID for the vehicle marker
    markerDiv.style.width = "50px";
    markerDiv.style.height = "50px";

    // Vehicle image or fallback to a simple color
    markerDiv.style.backgroundImage =
      "url('https://firebasestorage.googleapis.com/v0/b/portfolio-bff64.appspot.com/o/%E2%80%94Pngtree%E2%80%94garbage%20truck%20top%20view_8528060.png?alt=media&token=049b6df1-bf34-4541-844b-215e06f6f598')"; // Replace with your vehicle image URL
    markerDiv.style.backgroundSize = "contain";
    markerDiv.style.backgroundRepeat = "no-repeat";
    markerDiv.style.backgroundPosition = "center";

    return markerDiv;
  };

  // Create a user marker element
  const createUserMarker = (userName) => {
    const markerDiv = document.createElement("div");
    markerDiv.className = "user-marker"; // Add a class to identify user markers
    markerDiv.style.width = "30px";
    markerDiv.style.height = "30px";
    markerDiv.style.backgroundColor = "blue"; // Customize marker color
    markerDiv.style.borderRadius = "50%";
    markerDiv.style.display = "flex";
    markerDiv.style.alignItems = "center";
    markerDiv.style.justifyContent = "center";
    markerDiv.style.color = "white";
    markerDiv.style.fontSize = "12px";
    markerDiv.innerText = userName.charAt(0); // Display the first letter of the user's name
    return markerDiv;
  };

  // Create a pin marker element
  const createPinMarker = () => {
    const markerDiv = document.createElement("div");
    markerDiv.style.width = "20px";
    markerDiv.style.height = "20px";
    markerDiv.style.backgroundColor = "red"; // Customize pin color
    markerDiv.style.borderRadius = "50%";
    return markerDiv;
  };

  // Update location every 5 seconds
  useEffect(() => {
    const interval = setInterval(updateLocation, 5000); // Update location every 5 seconds
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <div>
      <h3>Live Location Map (Vehicle and Users)</h3>
      <div
        ref={mapContainer}
        id="map"
        style={{
          width: "100%",
          height: "650px",
          marginBottom: "20px",
          marginTop: "10px",
        }}
      />
    </div>
  );
};

export default LiveLocationMap;
