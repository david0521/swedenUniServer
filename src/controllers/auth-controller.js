const router = require("express").Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const initializePassport = require('../../passport-config.js');
const { createResetToken, verifyJWTToken } = require('../services/resettoken.service.js');
const { sendResetLink } = require('../services/email.service.js');
const { encryptionHandler } = require('../services/encryption.service.js');
const { v4: uuidv4 } = require('uuid');


const Users = require("../schemas/user.js");
const ProspectiveStudents = require("../schemas/prospectiveStudent.js");
const UniversityStudents = require("../schemas/universityStudent.js");
const ConsentForm = require("../schemas/consentForm.js")
const ResetToken = require("../schemas/resetToken.js");

const jwtSecret = process.env.JWT_SECRET;

require('dotenv').config()

// Declare encryption handler to encrypt, and decrypt confidential data.
const securityHandler = new encryptionHandler();

/**
 * Post /auth/login
 * @summary Login a user to the system
 * @tags authorization
 * @return {object} 200 - Success response
 * @return {object} 400 - Bad request response
 * @return {object} 403 - Prohibitted
 * @return {object} 500 - Internal server error
 */

router.post("/login", async (req, res) => {
    try {
        initializePassport(
            passport, 
            email => Users.findOne({ email: email })
        )
        passport.authenticate('local', { session: false }, (err, user, info) => {
            if (err || !user) {
                return res.status(400).json({
                    // Translation: Login failed
                    message: info ? info.message : '로그인에 실패하였습니다.',
                });
            }
    
            req.login(user, { session: false }, async (err) => {
                if (err) {
                    res.send(err);
                }
                const token = jwt.sign({ id: user.id, email: user.email, admin: user.admin, exp: Math.floor(Date.now() / 1000) + (12 * 60 * 60)}, jwtSecret);
                const refreshToken = uuidv4();

                // Attributes to be returned to the user
                const userId = user.id

                await Users.updateOne({ _id: user.id }, { refreshToken });

                return res.json({ token, refreshToken, userId });
            });
        })(req, res);

    } catch (err) {
        console.error(err);
        // Translation: An internal server error has occured
        return res.status(500).json({ error: "시스템상 오류가 발생하였습니다." });
    }
});

/**
 * Post /auth/refreshToken
 * @summary Return new JWT to authenticate user once the previous one expires
 * @tags authorization
 * @return {object} 200 - Success response
 * @return {object} 400 - Bad request response
 * @return {object} 403 - Doesn't belong to the user
 * @return {object} 500 - Internal server error
 */
router.post("/refreshToken", async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ message: "재활용 토큰이 주어지지 않았습니다." });
        }

        const user = await Users.findOne({ refreshToken });

        if (!user) {
            return res.status(403).json({ message: "다음 재활용 토큰에 해당하는 회원이 없습니다." });
        }

        const newToken = jwt.sign({ id: user.id, email: user.email, admin: user.admin, exp: Math.floor(Date.now() / 1000) + (12 * 60 * 60)}, jwtSecret);

        return res.status(200).json({ token: newToken });
    } catch (err) {
        console.error(err);
        // Translation: An internal server error has occured
        return res.status(500).json({ error: "시스템상 오류가 발생하였습니다." });
    }
});

/**
 * Post /auth/register
 * @summary Create a new user account
 * @tags authorization
 * @return {object} 201 - Account created response
 * @return {object} 400 - Bad request response
 * @return {object} 403 - Prohibitted
 * @return {object} 500 - Internal server error
 */
router.post("/register", async (req, res) => {
    try {
        const email = req.body.email;
        const password = await bcrypt.hash(req.body.password, 10);
        const userName = req.body.userName;
        const userType = req.body.userType;
        const consentId = req.body.consents;

        if (!email || !password || !userName || !userType) {
            // Translation: Registeration requires: email, password, name, and account type.
            return res.status(400).json({ error: "회원가입을 위해서는 다음 정보가 필요합니다: 이메일, 암호, 유저네임, 계정종류" });
        }

        if (req.body.password.length < 8) {
            return res.status(400).json({ error: "비밀번호는 최소한 8자리 이상이어야 합니다."})
        }

        const isAdmin = req.body.admin;

        if(isAdmin == true) {
            return res.status(403).json({ error: "관리자 계정 생성은 금지되어 있습니다." });
        }

        const existingAccount = await Users.findOne({ email: email });

        if (existingAccount) {
            // Translation: The following email is already registered.
            return res.status(409).json({ error: "이미 가입된 이메일입니다."})
        }

        if (userType != 'normal' && userType != 'student' && userType != 'prospective') {
            return res.status(400).json({ error: "존재하지 않는 계정 유형입니다." })
        }

        let userAccount;

        switch (userType) {
            case 'normal':
                userAccount = new Users({
                    email: email,
                    password: password,
                    userName: userName,
                });
                break;
            case 'prospective':
                userAccount = new ProspectiveStudents({
                    email: email,
                    password: password,
                    userName: userName
                });
                break;
            case 'student':
                userAccount = new UniversityStudents({
                    email: email,
                    password: password,
                    userName: userName
                })
                break;
        }

        const consentForm = await ConsentForm.findById(consentId)

        await userAccount.save();
        userAccount.consents.push(consentForm);
        await userAccount.save();
        const userId = userAccount._id
        // Translation: Account created
        return res.status(201).json({ 
            message: "회원가입에 성공하였습니다.",
            id: userId
        })    
    } catch (err) {
        console.error(err);
        // Translation: An internal server error has occured
        return res.status(500).json({ error: "시스템상 오류가 발생하였습니다." });
    }
});

/**
 * Post /auth/resetPassword/emailRequest
 * @summary Change password of a user.
 * @tags authorization
 * @return {object} 200 - Success response
 * @return {object} 403 - Not a prospective student
 * @return {object} 404 - Student not found
 * @return {object} 500 - Internal server error
 */
router.post("/resetPassword/emailRequest", async (req, res) => {
    try {
        const userEmail = req.body.email;

        if (!userEmail) {
            // Avoid malicious attackers from figuring out that the following email is registered in the system.
            res.status(200).json({ message: "해당 이메일 주소로 메일이 발송되었습니다." })
        }

        else {
            const { resetToken, error } = await createResetToken(userEmail);

            if (error) {
                return res.status(400).json({ error: "메일 발송에 문제가 발생하였습니다." })
            } else {
                await sendResetLink({ resetToken: resetToken, email: userEmail });
                res.status(200).json({ message: "해당 이메일 주소로 메일이 발송되었습니다." })
            }
        }
    } catch (err) {
        console.error(err)
        // Translation: An internal server error has occured
        return res.status(500).json({ error: "시스템상 오류가 발생하였습니다."})
    }
});

/**
 * Post /auth/resetPassword
 * @summary Change password of a user.
 * @tags authorization
 * @return {object} 200 - Success response
 * @return {object} 403 - Not a prospective student
 * @return {object} 404 - Student not found
 * @return {object} 500 - Internal server error
 */
router.post("/resetPassword", async (req, res) => {
    try {
        const resetToken = req.body.token;
        const newPassword = req.body.newPassword

        console.log(resetToken)

        // Verify if the token is valid
        const {error, decoded} = verifyJWTToken(resetToken);
        if (error) {
            return res.status(400).json({ error: "만료되거나 유효하지 않은 인증서입니다." });
        }

        const user = await Users.findById(decoded.user.id);

        if (!user) {
            res.status(400).json({ error: "존재하지 않는 회원입니다." });
        }

        else if (newPassword.length < 8) {
            return res.status(400).json({ error: "비밀번호는 8자리 이상이어야합니다." })
        }

        else {
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            user.password = hashedPassword;
            await user.save();

            res.status(200).json({ message: "성공적으로 변경하였습니다." })
        }        
    } catch (err) {
        console.error(err)
        // Translation: An internal server error has occured
        return res.status(500).json({ error: "시스템상 오류가 발생하였습니다."})
    }
});

module.exports = router;