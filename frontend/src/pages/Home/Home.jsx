import React from "react";
import PromotionContainer from "./Promotion/PromotionContainer";
import Scroll from "../../hooks/useScroll";
import JoinWithUsSection from "./Join With Us/JoinWithUsSection";

const Home = () => {
  return (
    <section>
      <Scroll/>
      <PromotionContainer />
      <JoinWithUsSection/>
    </section>
  );
};

export default Home;
