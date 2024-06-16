// Import the required modules
const express = require("express")
const router = express.Router()

const { 
    capturePayment,
    verifySignature,
    sendPaymentSuccessEmail,
 } = require("../controllers/Payments")
const { auth, isInstructor, isStudent, isAdmin } = require("../middlewares/Auth")

router.post("/capturePayment", auth, isStudent, capturePayment)
router.post("/verifySignature", verifySignature)
router.post(
    "/sendPaymentSuccessEmail",
    auth,
    isStudent,
    sendPaymentSuccessEmail
)

module.exports = router;