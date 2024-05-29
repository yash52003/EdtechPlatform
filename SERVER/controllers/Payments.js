const {instance} = require("../config/razorpay");
const Course = require("../models/Course");
const crypto = require("crypto")
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {courseEnrollmentEmail} = require("../mail/template/courseEnrollmentEmail");
const { paymentSuccessEmail } = require("../mail/templates/paymentSuccessEmail")
const CourseProgress = require("../models/CourseProgress")

// //Step1 - Capture the payment and initiate the razorpay order 
// exports.capturePayment = async (req , res) => {
//     //get courseId and the userId
//     const {course_id} = req.body;
//     const {userId} = req.user.id;

//     //Validation 
//     if(!course_id || !userId){
//         return res.status(404).json({
//             success : false,
//             message : "Please provide the  valid course Id",
//         })
//     };

//     //Valid courseID
//     let course;
//     try{
//         course = await Course.findById(course_id);
//         //Now the course have the course data 
//         if(!course){
//             return res.json({
//                 success : false,
//                 message: "Could not find the course",
//             })
//         } 
        
//          //User already pay for the same course
//          const uid = new mongoose.Types.ObjectId(userId);
//          if(course.studentsEnrolled.includes(uid)){
//             return res.status(200).json({
//                 success : false,
//                 message : "Student is already enrolled",
//             });
//          }

//     }catch(console){

//         console.error(error);
//         return res.status(500).json({
//             success : false,
//             message : error.message,
//         })

//     }

//     //order create 
//     const amount = course.price;
//     const currency = "INR";

//     const options = {

//         amount : amount*100,
//         currency,
//         receipt : Math.random(Date.now()).toString(),
//         notes:{
//             courseId : course_id,
//             userId,
//         }

//     };

//     try{
//         //Initiate the payment using razorpayPayment
//         const paymentResponse = await instance.orders.create(options);
//         console.log(paymentResponse);
//         //return response
//         return res.status(200).json({
//             success : true,
//             courseName : course.courseName,
//             courseDescription : course.courseDescription,
//             thumbnail : course.thumbnail,
//             orderId : paymentResponse.id,
//             currrency : paymentResponse.currency,
//             amount : paymentResponse.amount,
//             message : "Creating the payment successful",
//         });

//     }catch(error){
//         console.log(error);
//         return res.json({
//             success : false,
//             message : "Could not intiate the order",
//         });
//     }
// };

// Capture the payment and initiate the Razorpay order
exports.capturePayment = async (req, res) => {
    const { courses } = req.body
    const userId = req.user.id
    if (courses.length === 0) {
      return res.json({ success: false, message: "Please Provide Course ID" })
    }
  
    let total_amount = 0
  
    for (const course_id of courses) {
      let course
      try {
        // Find the course by its ID
        course = await Course.findById(course_id)
  
        // If the course is not found, return an error
        if (!course) {
          return res
            .status(200)
            .json({ success: false, message: "Could not find the Course" })
        }
  
        // Check if the user is already enrolled in the course
        const uid = new mongoose.Types.ObjectId(userId)
        if (course.studentsEnroled.includes(uid)) {
          return res
            .status(200)
            .json({ success: false, message: "Student is already Enrolled" })
        }
  
        // Add the price of the course to the total amount
        total_amount += course.price
      } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: error.message })
      }
    }
  
    const options = {
      amount: total_amount * 100,
      currency: "INR",
      receipt: Math.random(Date.now()).toString(),
    }
  
    try {
      // Initiate the payment using Razorpay
      const paymentResponse = await instance.orders.create(options)
      console.log(paymentResponse)
      res.json({
        success: true,
        data: paymentResponse,
      })
    } catch (error) {
      console.log(error)
      res
        .status(500)
        .json({ success: false, message: "Could not initiate order." })
    }
}

//Verify the Signature of the Razorpay and Server
// exports.verifySignature = async (req , res) => {
//     try{
//         //Step1 - I need to do the matching of the server secret and the razorpay secret
//         const webhookSecret = "123456878";
//         const signature = req.headers["x-razorpay-signature"];

//         //3 Steps
//         //This will return the hmac object
//         const shasum = crypto.createHmac("sha256" , webhookSecret);
//         //We need to convert this hmac object into the string format
//         shasum.update(JSON.stringify(req.body));
//         //Frame the digest
//         const digest = shasum.digest("hex");

//         if(signature == digest){
//             console.log("payment is authorised");

//             //First thing is we want the userId and the courseId from the user 
//             const {userId , courseId} = req.body.payload.payment.entity.notes;

//             try{
//                 //No validation is required as id we have pushed by our own after doing the verification

//                 //Fullfill the action make the student enrolled in the course
//                 const enrolledCourse = await Course.findOneAndUpdate(
//                     {_id : courseId}, 
//                     { $push : {studentsEnrolled : userId},},
//                     {new : true},
//                 );

//                 if(!enrolledCourse){
//                     return res.status(500).json({
//                         success : false,
//                         message : "Course not Found",
//                     });
//                 }

//                 console.log(enrolledCourse);

//                 //Find the student and the course in the list of the enrolled courses
//                 const enrolledStudent = await User.findOneAndUpdate(
//                     {_id : userId},
//                     {$push : {courses : courseId}},
//                     {new : true},
//                 );

//                 console.log(enrolledStudent);

//                 //Send the course enrollment mail to the user -- Mail Send {We want to send the confirmation mail}

//                 const emailResponse = await mailSender(
//                     enrolledStudent.email,
//                     "Congratulations to the codeCircle",
//                     "Congratulations, You are onboarded into the new Codehelp Course",
//                 );

//                 console.log(emailResponse);
//                 return res.status(200).json({
//                     success : true,
//                     message : "Signature verified and the course Added",
//                 });

//             }catch(error){
//                 console.log(error);
//                 return res.status(500).json({
//                     success : false,
//                     message : error.message,
//                 });
//             }

//         }
//         else{
//             return res.status(400).json({
//                 success : false,
//                 message : "Invalid request",
//             });
//         }

//     }catch(error){
//         return res.status(500).json({
//             success : false,
//             message : "Error in verification of the signature",
//         })
//     }
// }
exports.verifyPayment = async (req, res) => {
    const razorpay_order_id = req.body?.razorpay_order_id
    const razorpay_payment_id = req.body?.razorpay_payment_id
    const razorpay_signature = req.body?.razorpay_signature
    const courses = req.body?.courses
  
    const userId = req.user.id
  
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !courses ||
      !userId
    ) {
      return res.status(200).json({ success: false, message: "Payment Failed" })
    }
  
    let body = razorpay_order_id + "|" + razorpay_payment_id
  
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest("hex")
  
    if (expectedSignature === razorpay_signature) {
      await enrollStudents(courses, userId, res)
      return res.status(200).json({ success: true, message: "Payment Verified" })
    }
  
    return res.status(200).json({ success: false, message: "Payment Failed" })
}
  
// Send Payment Success Email
exports.sendPaymentSuccessEmail = async (req, res) => {
    const { orderId, paymentId, amount } = req.body
  
    const userId = req.user.id
  
    if (!orderId || !paymentId || !amount || !userId) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide all the details" })
    }
  
    try {
      const enrolledStudent = await User.findById(userId)
  
      await mailSender(
        enrolledStudent.email,
        `Payment Received`,
        paymentSuccessEmail(
          `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
          amount / 100,
          orderId,
          paymentId
        )
      )
    } catch (error) {
      console.log("error in sending mail", error)
      return res
        .status(400)
        .json({ success: false, message: "Could not send email" })
    }
  }
  
// enroll the student in the courses
const enrollStudents = async (courses, userId, res) => {
    if (!courses || !userId) {
      return res
        .status(400)
        .json({ success: false, message: "Please Provide Course ID and User ID" })
    }
  
    for (const courseId of courses) {
      try {
        // Find the course and enroll the student in it
        const enrolledCourse = await Course.findOneAndUpdate(
          { _id: courseId },
          { $push: { studentsEnroled: userId } },
          { new: true }
        )
  
        if (!enrolledCourse) {
          return res
            .status(500)
            .json({ success: false, error: "Course not found" })
        }
        console.log("Updated course: ", enrolledCourse)
  
        const courseProgress = await CourseProgress.create({
          courseID: courseId,
          userId: userId,
          completedVideos: [],
        })
        // Find the student and add the course to their list of enrolled courses
        const enrolledStudent = await User.findByIdAndUpdate(
          userId,
          {
            $push: {
              courses: courseId,
              courseProgress: courseProgress._id,
            },
          },
          { new: true }
        )
  
        console.log("Enrolled student: ", enrolledStudent)
        // Send an email notification to the enrolled student
        const emailResponse = await mailSender(
          enrolledStudent.email,
          `Successfully Enrolled into ${enrolledCourse.courseName}`,
          courseEnrollmentEmail(
            enrolledCourse.courseName,
            `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
          )
        )
  
        console.log("Email sent successfully: ", emailResponse.response)
      } catch (error) {
        console.log(error)
        return res.status(400).json({ success: false, error: error.message })
      }
    }
}

