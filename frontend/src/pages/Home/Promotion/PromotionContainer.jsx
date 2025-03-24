import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-creative';
import 'swiper/css/autoplay';
import { EffectCreative, Autoplay } from 'swiper';
import Promotion from './Promotion';
import Promotion2 from './Promotion2';

const PromotionContainer = () => {
  return (
    <section>
      <Swiper
        grabCursor={true}
        effect={"creative"}
        creativeEffect={{
          prev: {
            shadow: true,
            translate: ["-120%", 0, -500]
          },
          next: {
            shadow: true,
            translate: ["120%", 0, -500]
          }
        }}
        modules={[EffectCreative, Autoplay]}
        className='mySwiper5'
        loop={true}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false
        }}
        speed={1000}
      >
        <SwiperSlide><Promotion /></SwiperSlide>
        <SwiperSlide><Promotion2 /></SwiperSlide>
      </Swiper>
    </section>
  );
}

export default PromotionContainer;
