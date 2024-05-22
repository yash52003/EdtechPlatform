const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({

    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address'],
    },

    otp: {
        type: String,
        required: true,
        trim: true,
        minlength: 4,
        maxlength: 6,
    },

    createdAt: {
        type: Date,
        default: Date.now,
        expires: 5*60, // 5 minutes
    }

});

//A function -> to send emails
async function sendVerificationEmail(email , otp){
    try{
        const mailResponse = await mailSender(email , "Verification Email from Studynotion" , otp);
        console.log("Email Send Successfully" , mailResponse);
    }catch(error){
        console.log("error occured while sending mail:" + error.message);
        throw error;
    }
}

OTPschema.pre("save" , async function(next){
    await sendVerificationEmail(this.email , this.otp);
    next();
})

module.exports = mongoose.model("OTP", otpSchema);
