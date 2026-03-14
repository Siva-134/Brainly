const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, text) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            throw new Error("Missing EMAIL_USER or EMAIL_PASS");
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS, // App Password
            },
        });

        const info = await transporter.sendMail({
            from: `"SecondBrain App" <${process.env.EMAIL_USER}>`, // Customized sender name
            to: email,
            subject,
            text,
            html: `<p>${text}</p>`,
        });

        console.log("Email sent:", info.messageId);
        return info;
    } catch (error) {
        console.error("Email sending failed:", error.message);
        throw error;
    }
};

module.exports = sendEmail;
