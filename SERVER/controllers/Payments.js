const { instance } = require('../config/razorpay');
const Course = require('../models/Course');
const crypto = require('crypto');
const User = require('../models/User');
const mailSender = require('../utils/mailSender');
const { courseEnrollmentEmail } = require('../mail/templates/courseEnrollmentEmail');
const { paymentSuccessEmail } = require('../mail/templates/paymentSuccessEmail');
const CourseProgress = require('../models/CourseProgress');
const mongoose = require('mongoose');

exports.capturePayment = async (req, res) => {
  const { courses } = req.body;
  console.log('Received request for capturePayment:', req.body);
  const userId = req.user.id;

  if (!courses || courses.length === 0) {
    console.log('No courses provided');
    return res.status(400).json({ success: false, message: 'Please Provide Course ID' });
  }

  let total_amount = 0;

  try {
    for (const course_id of courses) {
      console.log('Processing course ID:', course_id);
      const course = await Course.findById(course_id);
      if (!course) {
        console.log('Course not found:', course_id);
        return res.status(404).json({ success: false, message: 'Could not find the Course' });
      }
      const uid = new mongoose.Types.ObjectId(userId);
      if (course.studentsEnrolled && course.studentsEnrolled.includes(uid)) {
        console.log('Student already enrolled:', userId);
        return res.status(400).json({ success: false, message: 'Student is already Enrolled' });
      }
      total_amount += course.price;
      console.log('Current total amount:', total_amount);
    }

    const options = {
      amount: total_amount * 100,
      currency: 'INR',
      receipt: `receipt_${Math.random().toString(36).substring(7)}`,
    };

    console.log('Creating payment order with options:', options);
    const paymentResponse = await instance.orders.create(options);
    console.log('Payment Response:', paymentResponse);

    res.json({
      success: true,
      data: paymentResponse,
    });
  } catch (error) {
    console.error('Error in capturePayment:', error);
    res.status(500).json({ success: false, message: 'Unexpected error occurred.', error: error.message });
  }
};

exports.verifySignature = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courses } = req.body;
  console.log('Received request for verifySignature:', req.body);

  if (!req.user) {
    console.log('User information is missing');
    return res.status(400).json({ success: false, message: 'User information is missing' });
  }

  const userId = req.user.id;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courses || !userId) {
    console.log('Missing required parameters');
    return res.status(400).json({ success: false, message: 'Payment Failed' });
  }

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  console.log('Body for HMAC:', body);

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_SECRET)
    .update(body)
    .digest('hex');

  console.log('Expected Signature:', expectedSignature);
  console.log('Received Signature:', razorpay_signature);

  if (expectedSignature === razorpay_signature) {
    try {
      console.log('Signature verified, enrolling students...');
      await enrollStudents(courses, userId, res);
      return res.status(200).json({ success: true, message: 'Payment Verified' });
    } catch (error) {
      console.error('Error in verifySignature:', error);
      return res.status(500).json({ success: false, message: 'Enrollment Failed', error: error.message });
    }
  } else {
    console.log('Signature mismatch');
    return res.status(400).json({ success: false, message: 'Payment Failed' });
  }
};

exports.sendPaymentSuccessEmail = async (req, res) => {
  const { orderId, paymentId, amount } = req.body;
  console.log('Received request for sendPaymentSuccessEmail:', req.body);
  const userId = req.user.id;

  if (!orderId || !paymentId || !amount || !userId) {
    console.log('Missing required details');
    return res.status(400).json({ success: false, message: 'Please provide all the details' });
  }

  try {
    console.log('Finding enrolled student with ID:', userId);
    const enrolledStudent = await User.findById(userId);
    await mailSender(
      enrolledStudent.email,
      `Payment Received`,
      paymentSuccessEmail(
        `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
        amount / 100,
        orderId,
        paymentId
      )
    );
    console.log('Payment success email sent to:', enrolledStudent.email);
    res.json({ success: true, message: 'Payment success email sent' });
  } catch (error) {
    console.error('Error in sendPaymentSuccessEmail:', error);
    return res.status(500).json({ success: false, message: 'Could not send email', error: error.message });
  }
};

const enrollStudents = async (courses, userId, res) => {
  if (!courses || !userId) {
    console.log('Missing courses or userId');
    return res.status(400).json({ success: false, message: 'Please Provide Course ID and User ID' });
  }

  try {
    for (const courseId of courses) {
      console.log('Enrolling user in course:', courseId);
      const enrolledCourse = await Course.findOneAndUpdate(
        { _id: courseId },
        { $push: { studentsEnrolled: userId } },
        { new: true }
      );

      if (!enrolledCourse) {
        console.log('Course not found:', courseId);
        return res.status(404).json({ success: false, error: 'Course not found' });
      }

      console.log('Creating course progress for user:', userId);
      const courseProgress = await CourseProgress.create({
        courseID: courseId,
        userId: userId,
        completedVideos: [],
      });

      console.log('Updating user with enrolled course and progress:', userId);
      const enrolledStudent = await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            courses: courseId,
            courseProgress: courseProgress._id,
          },
        },
        { new: true }
      );

      console.log('Sending enrollment email to:', enrolledStudent.email);
      await mailSender(
        enrolledStudent.email,
        `Successfully Enrolled into ${enrolledCourse.courseName}`,
        courseEnrollmentEmail(
          enrolledCourse.courseName,
          `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
        )
      );

      console.log('Enrolled student:', enrolledStudent);
    }
    console.log('Students enrolled successfully');
    res.json({ success: true, message: 'Students enrolled successfully' });
  } catch (error) {
    console.error('Error in enrollStudents:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
