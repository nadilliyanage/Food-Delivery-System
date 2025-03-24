import React from "react";
import PromotionContainer from "./Promotion/PromotionContainer";
import Scroll from "../../hooks/useScroll";

const Home = () => {
  return (
    <section>
      <Scroll/>
      <PromotionContainer />


    </section>
  );
};

export default Home;
