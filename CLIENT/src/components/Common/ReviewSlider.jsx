import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import { Autoplay, FreeMode, Pagination } from 'swiper';
import ReactStars from 'react-rating-stars-component';
import { apiConnector } from '../../services/apiConnector';
import { ratingsEndpoints } from '../../services/apis';
import { FaStar } from 'react-icons/fa';

const ReviewSlider = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchAllReviews = async () => {
      try {
        const { data } = await apiConnector('GET', ratingsEndpoints.REVIEWS_DETAILS_API);
        if (data?.success) {
          setReviews(data?.data);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };
    fetchAllReviews();
  }, []);

  return (
    <div className='text-white'>
      <div className='h-[19px] max-w-maxContent'>
        <Swiper
          slidesPerView={1}
          spaceBetween={24}
          loop={true}
          freeMode={true}
          autoplay={{
            delay: 2500,
          }}
          modules={[FreeMode, Pagination, Autoplay]}
          className='w-full'
        >
          {reviews.map((review, index) => (
            <SwiperSlide key={index} className='flex flex-col items-start'>
              <div className='flex items-center space-x-2'>
                <img
                  src={
                    review?.user?.image
                      ? review?.user?.image
                      : `https://api.dicebear.com/5.x/initials/svg?seed=${review?.user?.firstName}%20${review?.user?.lastName}`
                  }
                  alt='Profile Pic'
                  className='h-9 w-9 object-cover rounded-full'
                />
                <p className='text-sm font-medium'>
                  {review?.user?.firstName} {review?.user?.lastName}
                </p>
              </div>
              <p className='text-sm text-gray-400'>{review?.course?.courseName}</p>
              <p className='text-sm'>{review?.review}</p>
              <div className='flex items-center space-x-1'>
                <p className='text-sm font-medium'>{review?.rating.toFixed(1)}</p>
                <ReactStars
                  count={5}
                  value={review.rating}
                  size={16}
                  edit={false}
                  activeColor='#ffd700'
                  emptyIcon={<FaStar />}
                  fullIcon={<FaStar />}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default ReviewSlider;
