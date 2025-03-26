import React from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper';
import 'swiper/css';
import 'swiper/css/autoplay';
import Promotion from "./Promotion";
import Promotion2 from "./Promotion2";

const PromotionContainer = () => {
  return (
    <div className="mt-14 md:-mt-14 md:mb-6">
      <Swiper
        modules={[Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        loop={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        className="mySwiper"
      >
        <SwiperSlide>
          <Promotion />
        </SwiperSlide>
        <SwiperSlide>
          <Promotion2 />
        </SwiperSlide>
      </Swiper>
    </div>
  );
};

export default PromotionContainer;
