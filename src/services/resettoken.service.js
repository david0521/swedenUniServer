const User = require("../schemas/user.js");
const ResetToken = require("../schemas/resetToken");
const jwt = require('jsonwebtoken');

require('dotenv').config()

const jwtSecret = process.env.JWT_SECRET;

const generateJWTToken = (user) => {
    let payload = {
        user: {
            id: user._id,
        }
    }
    // Set the Reset Token to expire in 20 minutes
    let token = jwt.sign(payload, jwtSecret, { expiresIn: '20m' });
    return token;
}

const createResetToken = async (email) => {
    let user;
    if (email) {
        user = await User.findOne({ email: email });
    }

    if (!user) {
        return {
            error: true
        }
    }

    let previousToken = await ResetToken.findOne({ user: user._id });
    if (previousToken) {
        await ResetToken.deleteOne({ user: user._id });
    }

    let newResetToken = new ResetToken({
        user: user._id,
        resetToken: generateJWTToken(user),
        createdAt: new Date()
    });

    await newResetToken.save();

    return {
        resetToken: newResetToken.resetToken
    }
}

const verifyJWTToken = (token) => {
    try {
        let decodedToken = jwt.verify(token, jwtSecret);
        return {
            error: false,
            decoded: decodedToken
        }
    } catch (err) {
        console.log(err);
        return {
            error: true,
            message: err.message
        }
    }
}

module.exports = {
    generateJWTToken,
    createResetToken,
    verifyJWTToken
}