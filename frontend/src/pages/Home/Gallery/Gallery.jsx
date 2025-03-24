import React from 'react'
import image1 from '../../../assets/gallery/image1.jpg'
import image2 from '../../../assets/gallery/image2.jpg'
import image3 from '../../../assets/gallery/image3.jpg'
import image4 from '../../../assets/gallery/image4.jpg'
import image5 from '../../../assets/gallery/image5.jpg'

const Gallery = () => {
  return (
    <div className='md:w-[80%] mx-auto my-28'>
      <div className='mb-16'>
         <h1 className='text-5xl font-bold text-center dark:text-white'>Our Gallery</h1>
      </div>

      {/* image container */}
      <div className='md:grid grid-cols-2 items-center justify-center gap-4'>
   <div className='mb-4 md:mb-0'>
      <img src={image1} alt="" className='md:h-[720px] w-auto mx-auto rounded-sm hover:scale-105 duration-300 hover:rounded-lg object-cover' />
   </div>
   <div className='gap-4 grid grid-cols-2 items-start'>
      <div>
         <img src={image2} alt="" className='md:h-[350px] w-auto rounded-sm hover:scale-105 duration-300 hover:rounded-lg object-cover' />
      </div>
      <div>
         <img src={image3} alt="" className='md:h-[350px] w-auto rounded-sm hover:scale-105 duration-300 hover:rounded-lg object-cover' />
      </div>
      <div>
         <img src={image4} alt="" className='md:h-[350px] w-auto rounded-sm hover:scale-105 duration-300 hover:rounded-lg object-cover' />
      </div>
      <div>
         <img src={image5} alt="" className='md:h-[350px] w-auto rounded-sm hover:scale-105 duration-300 hover:rounded-lg object-cover' />
      </div>
   </div>
</div>

    </div>
  )
}

export default Gallery