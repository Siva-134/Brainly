const express=require('express');
const User = require('../models/user');
const sendEmail = require('../utils/email');
const crypto = require('crypto');
const router=express.Router();
const jwt=require('jsonwebtoken');
const userAuth = require('../middleware/auth');

router.post('/register',async(req,res)=>{
    try{
        const {name,email,password}=req.body;

        if(!name||!email||!password){
            return res.status(400).json({ message: "Required Fields Missing" });
        }

        if (!email.endsWith('@gmail.com')) {
            return res.status(400).json({ message: "Email must be a valid @gmail.com address" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
        if (!specialCharRegex.test(password)) {
            return res.status(400).json({ message: "Password must include at least one special character" });
        }

        const newUser=new User({
            name:name,
            email:email,
            password:password
        });

        await newUser.save();
        
        // Auto-login: Generate token immediately
        const token = jwt.sign({_id: newUser._id}, "ramesh2317");

        res.status(201).json({
            message: "User Registered Successfully",
            token: token
        });

    }catch(error){
        console.log(error);
        return res.status(500).json({ message: "Error registering user", error });
    }
});


router.post("/login",async(req,res)=>{
    try{
        const{email,password}=req.body;

        const isUserExist=await User.findOne({email:email});

        if(!isUserExist){
            return res.status(400).json({ message: "User does not exist" });
        }

        if(isUserExist.password!=password){
            return res.status(401).json({ message: "Invalid Credentials" });
        }

        const userId=isUserExist._id;
        const token=jwt.sign({_id:userId},"ramesh2317");
        console.log(token);
        
        // Return token in response body for frontend to save in localStorage
        return res.json({
            message: "User LoggedIn Sucessfully",
            token: token
        });
    }catch(error){
        return res.send("Error",error);
    }
});

router.get("/me", userAuth, (req, res) => {
    try {
        const user = req.user;
        res.status(200).json({
            name: user.name,
            email: user.email
        });
    } catch (e) {
        res.status(500).json({ message: "Error fetching user details" });
    }
});

router.get("/search", async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json({ users: [] });

        const users = await User.find({
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { email: { $regex: q, $options: 'i' } }
            ]
        }).select('name email _id').limit(5);

        res.json({ users });
    } catch (e) {
        res.status(500).json({ message: "Error searching users" });
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: "Logged out successfully" });
});
router.post('/change-password', userAuth, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        // User is attached by userAuth middleware
        const user = req.user; 

        if (user.password !== oldPassword) {
            return res.status(400).json({ message: "Incorrect current password" });
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: "Password updated successfully" });

    } catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({ message: "Server error" });
    }
});


router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        console.log(`[Forgot Password] Received request for email: '${email}'`); // Log received email

        const user = await User.findOne({ email });
        console.log(`[Forgot Password] DB Query Result:`, user ? `Found user ${user._id}` : "User NOT found");

        if (!user) {
            console.log(`[Forgot Password] Returning 404 for ${email}`);
            return res.status(404).json({ message: "User not found" });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Set OTP and expiration (10 minutes)
        user.resetPasswordOtp = otp;
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
        await user.save();

        const message = `Your password reset OTP is ${otp}. It is valid for 10 minutes.`;
        await sendEmail(user.email, "Password Reset OTP", message);

        res.json({ message: "OTP sent to your email" });

    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ message: `Error sending email: ${error.message}`, error: error.message });
    }
});

router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({ 
            email, 
            resetPasswordOtp: otp,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        user.password = newPassword;
        user.resetPasswordOtp = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: "Password reset successful" });

    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ message: "Error resetting password" });
    }
});

module.exports = router;