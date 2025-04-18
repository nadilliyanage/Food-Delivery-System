import React, { useState } from "react";
import PromotionContainer from "./Promotion/PromotionContainer";
import Scroll from "../../hooks/useScroll";
import JoinWithUsSection from "./Join With Us/JoinWithUsSection";
import Categories from "./Categories/Categories";
import Restaurants from "./Restaurants/Restaurants";
import { getCurrentUser } from "../../utils/auth";
import SearchBar from "../../components/SearchBar/SearchBar";

// Import role-specific components
import DeliveryMap from "./DeliveryPersonnel/DeliveryMap";
import RecentDeliveries from "./DeliveryPersonnel/RecentDeliveries";
import RestaurantManagement from "./RestaurantAdmin/RestaurantManagement";
import MenuManagement from "./RestaurantAdmin/MenuManagement";
import RestaurantRequests from "./Admin/RestaurantRequests";
import DeliveryPersonnelRequests from "./Admin/DeliveryPersonnelRequests";

const Home = () => {
  const currentUser = getCurrentUser();
  const userRole = currentUser?.role;
  const [searchQuery, setSearchQuery] = useState({ term: '', type: 'menu' });

  const handleSearch = (term, type) => {
    setSearchQuery({ term, type });
  };

  const shouldShowSearch = !userRole || userRole === "customer";

  const renderCustomerContent = () => (
    <>
      {shouldShowSearch && <SearchBar onSearch={handleSearch} />}
      <Categories searchQuery={searchQuery} />
      <Restaurants searchQuery={searchQuery} />
      <JoinWithUsSection />
    </>
  );

  const renderDeliveryPersonnelContent = () => (
    <div>
      <DeliveryMap />
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
