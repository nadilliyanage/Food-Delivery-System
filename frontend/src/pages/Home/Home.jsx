import React from "react";
import PromotionContainer from "./Promotion/PromotionContainer";
import Scroll from "../../hooks/useScroll";
import JoinWithUsSection from "./Join With Us/JoinWithUsSection";
import Categories from "./Categories/Categories";
import Restaurants from "./Restaurants/Restaurants";

const Home = () => {
  return (
    <section>
      <Scroll/>
      <PromotionContainer />
      <Categories />
      <Restaurants />
      <JoinWithUsSection/>
    </section>
  );
};

export default Home;
