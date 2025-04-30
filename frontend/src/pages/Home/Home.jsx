import React, { useState, useEffect, useRef } from "react";
import PromotionContainer from "./Promotion/PromotionContainer";
import Scroll from "../../hooks/useScroll";
import JoinWithUsSection from "./Join With Us/JoinWithUsSection";
import Categories from "./Categories/Categories";
import Restaurants from "./Restaurants/Restaurants";
import { getCurrentUser } from "../../utils/auth";
import SearchBar from "../../components/SearchBar/SearchBar";
import { MdDeliveryDining, MdLocationOn } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Import role-specific components
import RecentDeliveries from "./DeliveryPersonnel/RecentDeliveries";
import RestaurantManagement from "./RestaurantAdmin/RestaurantManagement";
import MenuManagement from "./RestaurantAdmin/MenuManagement";
import RestaurantRequests from "./Admin/RestaurantRequests";
import DeliveryPersonnelRequests from "./Admin/DeliveryPersonnelRequests";

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom marker icons
const deliveryIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Create a custom delivery bike icon
const deliveryBikeIcon = new L.DivIcon({
  className: "custom-delivery-icon",
  html: `
    <div style="
      background-color: #3B82F6;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    ">
      <svg 
        viewBox="0 0 24 24" 
        fill="white" 
        width="24" 
        height="24"
        style="transform: rotate(0deg);"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
      </svg>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

// Live Map Component
const LiveMap = ({ activeDeliveries }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [bearing, setBearing] = useState(0);
  const mapRef = useRef(null);

  const centerMap = () => {
    if (mapRef.current && userLocation) {
      mapRef.current.setView([userLocation.lat, userLocation.lng], 18);
    }
  };

  useEffect(() => {
    const getLocation = () => {
      if (!navigator.geolocation) {
        setLocationError("Geolocation is not supported by your browser");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(newLocation);
          if (position.coords.heading) {
            setBearing(position.coords.heading);
          }
          // Center map on user location when first getting position
          if (mapRef.current) {
            mapRef.current.setView([newLocation.lat, newLocation.lng], 18);
          }
        },
        (error) => {
          setLocationError("Error getting location: " + error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );
    };

    getLocation();
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(newLocation);
        if (position.coords.heading) {
          setBearing(position.coords.heading);
        }
      },
      (error) => {
        setLocationError("Error tracking location: " + error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  const mapCenter = userLocation || { lat: 6.927079, lng: 79.861244 }; // Default to Colombo

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mx-4">
      <div className="flex items-center gap-3 mb-4">
        <MdLocationOn className="text-3xl text-primary" />
        <h2 className="text-2xl font-bold">Live Location</h2>
      </div>

      {locationError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {locationError}
        </div>
      )}

      <div className="w-full h-[300px] rounded-lg overflow-hidden relative">
        <MapContainer
          center={[mapCenter.lat, mapCenter.lng]}
          zoom={18}
          style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {userLocation && (
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={deliveryBikeIcon}
            >
              <Popup>
                <div>
                  <p className="font-semibold">Your Location</p>
                </div>
              </Popup>
            </Marker>
          )}

          {activeDeliveries?.map((delivery) => {
            const deliveryLocation = delivery.order?.deliveryAddress;
            if (deliveryLocation?.latitude && deliveryLocation?.longitude) {
              return (
                <Marker
                  key={delivery._id}
                  position={[
                    deliveryLocation.latitude,
                    deliveryLocation.longitude,
                  ]}
                  icon={deliveryIcon}
                >
                  <Popup>
                    <div>
                      <p className="font-semibold">
                        Delivery #{delivery.order?._id.slice(-6)}
                      </p>
                      <p>{delivery.order?.deliveryAddress?.street}</p>
                      <p>{delivery.order?.deliveryAddress?.city}</p>
                    </div>
                  </Popup>
                </Marker>
              );
            }
            return null;
          })}
        </MapContainer>

        {/* Google Maps-style locate button */}
        <button
          onClick={centerMap}
          className="absolute bottom-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors z-[1000]"
          style={{
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          }}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="#4285F4">
            <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const Home = () => {
  const currentUser = getCurrentUser();
  const userRole = currentUser?.role;
  const [searchQuery, setSearchQuery] = useState({ term: "", type: "menu" });
  const [deliveryStats, setDeliveryStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
  });
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDeliveryStats = async () => {
      if (userRole === "delivery_personnel") {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/deliveries/user/deliveries`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          const deliveries = response.data.deliveries;
          const stats = {
            total: deliveries.length,
            active: deliveries.filter((d) => d.status === "On the Way").length,
            completed: deliveries.filter((d) => d.status === "Delivered")
              .length,
          };
          setDeliveryStats(stats);
          setActiveDeliveries(
            deliveries.filter((d) => d.status === "On the Way")
          );
        } catch (error) {
          console.error("Error fetching delivery stats:", error);
        }
      }
    };

    fetchDeliveryStats();
  }, [userRole]);

  const handleSearch = (term, type) => {
    setSearchQuery({ term, type });
  };

  const shouldShowSearch = !userRole || userRole === "customer";

  const renderCustomerContent = () => (
    <>
      <div className="mx-4 mt-2 -mb-5">
        {shouldShowSearch && <SearchBar onSearch={handleSearch} />}
      </div>
      <Categories searchQuery={searchQuery} />
      <JoinWithUsSection />
    </>
  );

  const renderDeliveryPersonnelContent = () => (
    <div className="space-y-6">
      {/* Current Deliveries Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <MdDeliveryDining className="text-3xl text-primary" />
            <h2 className="text-2xl font-bold">Current Deliveries</h2>
          </div>
          <button
            onClick={() => navigate("/dashboard/current-deliveries")}
            className="text-primary hover:text-primary-dark font-medium"
          >
            View All →
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-gray-600 text-sm">Total Deliveries</p>
            <p className="text-2xl font-bold text-gray-800">
              {deliveryStats.total}
            </p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <p className="text-yellow-600 text-sm">Active Deliveries</p>
            <p className="text-2xl font-bold text-yellow-800">
              {deliveryStats.active}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-green-600 text-sm">Completed</p>
            <p className="text-2xl font-bold text-green-800">
              {deliveryStats.completed}
            </p>
          </div>
        </div>
      </div>

      {/* Live Map */}
      <LiveMap activeDeliveries={activeDeliveries} />

      <RecentDeliveries />
    </div>
  );

  const renderRestaurantAdminContent = () => (
    <div>
      <RestaurantManagement />
      <JoinWithUsSection />
      <MenuManagement />
    </div>
  );

  const renderAdminContent = () => (
    <div>
      <RestaurantRequests />
      <DeliveryPersonnelRequests />
    </div>
  );

  return (
    <section>
      <Scroll />
      <PromotionContainer />
      {!userRole && renderCustomerContent()}
      {userRole === "customer" && renderCustomerContent()}
      {userRole === "delivery_personnel" && renderDeliveryPersonnelContent()}
      {userRole === "restaurant_admin" && renderRestaurantAdminContent()}
      {userRole === "admin" && renderAdminContent()}
    </section>
  );
};

export default Home;
