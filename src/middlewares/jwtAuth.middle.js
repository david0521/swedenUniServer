require('dotenv').config();
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;

const authenticateJWT = (req, res, next) => {
    console.log(req.headers.authorization);
    const token = req.headers.authorization;

    if(!token) {
        return res.status(403).json({ error: "토큰이 제공되지 않았습니다." });
    }

    console.log(token)

    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "유효하지 않은 토큰입니다." });
        }
        req.user = user;
        next();
    });
};

module.exports = authenticateJWT;
