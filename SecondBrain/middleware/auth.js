const jwt = require('jsonwebtoken');
const User = require('../models/user');

const userAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({
                message: "Please Login"
            })
        }

        const jwtSecret = "ramesh2317" || process.env.JWT_SECRET;

        const decodedObject = jwt.verify(token, jwtSecret);

        const { _id } = decodedObject;

        const user = await User.findById(_id);

        if (!user) {
            return res.status(402).json({
                message: "User Doesnot Exists"
            })
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(500).json({
            message: "Authentication failed",
            error: error.message
        })
    }
}

module.exports = userAuth;