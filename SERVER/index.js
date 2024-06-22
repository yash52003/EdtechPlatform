const express = require("express");
const app = express();

const events = require('events');
events.EventEmitter.defaultMaxListeners = 20; 

const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const paymentRoutes = require("./routes/Payments");
const courseRoutes = require("./routes/Course");
const contactUsRoute = require("./routes/Contact");

const database = require("./config/database");
const {cloudinaryConnect} = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const cors = require("cors");

const PORT = process.env.PORT || 4000;

database.connect();
cloudinaryConnect();

//Middlewares
app.use(express.json());
app.use(cookieParser());

app.use(
    cors({
        origin : "*",
        credentials : true,
    })
);

app.use(
    fileUpload({
        useTempFiles : true,
        tempFileDir : "/tmp/",
    })
)

app.use("/api/v1/auth" , userRoutes);
app.use("/api/v1/profile" , profileRoutes);
app.use("/api/v1/course" , courseRoutes);
app.use("/api/v1/payment" , paymentRoutes);
app.use("/api/v1/reach", contactUsRoute);


//default request
app.get("/" , (req , res) => {
    return res.json({
        success : true,
        message : "Your server is up and running..."
    })
});

app.listen(PORT , () => {
    console.log(`The the App is running at ${PORT}`);
});