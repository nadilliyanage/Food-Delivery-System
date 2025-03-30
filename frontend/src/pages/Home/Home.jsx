import React from "react";
import PromotionContainer from "./Promotion/PromotionContainer";
import Scroll from "../../hooks/useScroll";
import JoinWithUsSection from "./Join With Us/JoinWithUsSection";
import Categories from "./Categories/Categories";
import Restaurants from "./Restaurants/Restaurants";
import { getCurrentUser } from "../../utils/auth";

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

  const renderCustomerContent = () => (
    <>
      <Categories />
      <Restaurants />
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
