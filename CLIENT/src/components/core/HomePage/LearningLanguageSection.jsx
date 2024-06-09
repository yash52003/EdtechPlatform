import React from 'react'
import HighlightText from "./HighlightText"
import know_your_progress from "../../../assets/Images/Know_your_progress.png"
import compare_with_others from "../../../assets/Images/Compare_with_others.png"
import plan_your_lessons from "../../../assets/Images/Plan_your_lessons.png"
import CTAButton from "../Homepage/Button";


const LearningLanguageSection = () => {
  return (

    <div className="mt-[130px]">
        <div className="flex flex-col gap-5">

        <div className="text-4xl font-semibold text-center">
          Your Swiss Knife For
          <HighlightText text={"Learning any Language"}/>
        </div>

        <div className="text-center text-richblack-600 mx-auto text-base mt-3 font-medium w-[70%]">
          This is the subheading 
        </div>

        <div className="flex flex-row gap-2 items-center justify-center mt-5">
          <img  
              src = {know_your_progress}
              alt = "Know your Progress Image"
              className = "object-contain -mr-32 "
          />
          <img  
              src = {compare_with_others}
              alt = "Know your Progress Image"
              className = "object-contain"
          />
          <img  
              src = {plan_your_lessons}
              alt = "Know your Progress Image"
              className = "object-contain -ml-36"
          />
        </div>

        <div className="w-fit mx-auto">
          <CTAButton active={true} linkto={"/signup"} >
            LearnMore
          </CTAButton>
        </div>

        </div>
    </div>

  )
}

export default LearningLanguageSection