import React from 'react'
import Instructor from "../../../assets/Images/Instructor.png"
import HighlightText from './HighlightText'
import CTAButton from "../Homepage/Button";
import { FaArrowRight } from 'react-icons/fa';

const InstructorSection = () => {
  return (
    <div className="mt-14">
    <div className="flex flex-row gap-20 items-center">

      <div className="w-[50%]">
        <img
          src={Instructor}
          alt=""
          className="shadow-white"
        />
      </div>

      <div className="w-[50%] flex flex-col gap-10">
        <div className="text-4xl font-semibold w-[50%]">
            Become an 
            <HighlightText text={"Instructor"}/>
        </div>

        <p className="font-medium text-[16px] w-[90%] text-richblack-300">
            Instructor around the world comes close to a million of peoples 
        </p>

        <div className="w-fit">
        <CTAButton active={true} linkto={"/signup"}>
            <div className="flex flex-row gap-2 items-center ">
                Start Learning Today
                <FaArrowRight/>
            </div>
        </CTAButton>
        </div>

      </div>


    </div>
    </div>
  )
}

export default InstructorSection