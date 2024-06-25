const router = require("express").Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const initializePassport = require('../../passport-config.js');
const { createResetToken, verifyJWTToken } = require('../services/resettoken.service.js');
const { sendResetLink } = require('../services/email.service.js');
const { encryptionHandler } = require('../services/encryption.service.js');


const Users = require("../schemas/user.js");
const ProspectiveStudents = require("../schemas/prospectiveStudent.js");
const UniversityStudents = require("../schemas/universityStudent.js");
const University = require("../schemas/university.js");
const Program = require("../schemas/program.js");
const ResetToken = require("../schemas/resetToken.js");

const jwtSecret = process.env.JWT_SECRET;

require('dotenv').config()

// Declare encryption handler to encrypt, and decrypt confidential data.
const securityHandler = new encryptionHandler();

/**
 * Get /users
 * @summary Returns all users in the system
 * @tags users
 * @return {object} 200 - Success response
 * @return {object} 403 - TODO: Not authorized response
 * @return {object} 404 - No user registered
 * @return {object} 500 - Internal server error
 */
router.get("/all", async (req, res) => {
    try {
        const users = await Users.find().select("-__v -password");

        if (users.length === 0) {
            // Translation: No universities found
            return res.status(404).send("시스템에 등록된 화원이 존재하지 않습니다.")
        }

        return res.send(users);
    } catch (err) {
        console.log(err);
        // Translation: An internal server error has occured
        return res.status(500).send("시스템상 오류가 발생하였습니다.")

    }
});

/**
 * Get /users/:id
 * @summary Returns a specific user by id
 * @tags users
 * @return {object} 200 - Success response
 * @return {object} 400 - User ID not provided
 * @return {object} 403 - TODO: Not authorized response
 * @return {object} 404 - User not registered in system
 * @return {object} 500 - Internal server error
 * */

router.get("/id/:id", async (req, res) => {
    try {
        const requestedUser = req.params.id;

        if (!requestedUser) {
            // Translation: Missing user id in the request
            return res.status(400).json({ error: "회원 아이디가 주어지지 않았습니다." })
        }
        
        const user = await Users.findOne( {_id: requestedUser} ).select("-__v -password")

        if (user == null) {
            // Translation: User not registered
            return res.status(404).json({ error: "시스템에 등록되지 않은 회원입니다." })
        }

        return res.status(200).send(user);
        
    } catch (err) {
        console.error(err);
        // Translation: An internal server error has occured
        return res.status(500).json({ error: "시스템상 오류가 발생하였습니다." });
    }
});

/**
 * Get /users/:userName
 * @summary Checks if a user with that userName exists
 * @tags users
 * @return {object} 500 - Internal server error
 * */

router.get("/userName/:userName", async (req, res) => {
    try {
        const requestedUserName = req.params.userName;
        const user = await Users.findOne({ userName: requestedUserName });

        if (user == null) {
            // Translation: ID can be used
            return res.json({ message: "사용가능한 아이디입니다." })
        } else {
            // Translation: ID cannot be used
            return res.json({ message: "이미 사용중인 아이디입니다. "})
        }
        
    } catch (err) {
        console.error(err);
        // Translation: An internal server error has occured
        return res.status(500).json({ error: "시스템상 오류가 발생하였습니다." });
    }
});

/**
 * Get /users/prospective/{university}
 * @summary Returns number of prospective students who are interested in a specific university
 * @tags users
 * @return {object} 200 - Success response
 * @return {object} 500 - Internal server error
 * */

router.get("/prospective/university", async (req, res) => {
    try {
        const requestedUniversity = req.query.university;

        console.log(requestedUniversity)
        
        const uniID = await University.findOne({ name: requestedUniversity }).select("_id");

        const interestNumber = await ProspectiveStudents.countDocuments({ interestedUniversities: uniID });

        return res.status(200).json({message: interestNumber});
        
    } catch (err) {
        console.error(err);
        // Translation: An internal server error has occured
        return res.status(500).json({ error: "시스템상 오류가 발생하였습니다." });
    }
});

/**
 * Get /users/prospective/{program}
 * @summary Returns number of prospective students who are interested in a specific program
 * @tags users
 * @return {object} 200 - Success response
 * @return {object} 500 - Internal server error
 * */

router.get("/prospective/program", async (req, res) => {
    try {
        const requestedProgram = req.query.program;
        
        const programID = await Program.findOne({ name: requestedProgram }).select("_id");

        const interestNumber = await ProspectiveStudents.countDocuments({ interestedPrograms: programID });

        return res.status(200).json({ message: interestNumber });
        
    } catch (err) {
        console.error(err);
        // Translation: An internal server error has occured
        return res.status(500).json({ error: "시스템상 오류가 발생하였습니다." });
    }
});

/**
 * Post /users/login
 * @summary TODO: Login a user into the system
 * @tags users
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
                    message: info ? info.message : '로그인에 실패하였습니다.',
                });
            }
    
            req.login(user, { session: false }, (err) => {
                if (err) {
                    res.send(err);
                }
                const token = jwt.sign({ id: user.id, email: user.email, exp: Math.floor(Date.now() / 1000) + (12 * 60 * 60)}, jwtSecret);
                return res.json({ token });
            });
        })(req, res);

    } catch (err) {
        console.error(err);
        // Translation: An internal server error has occured
        return res.status(500).json({ error: "시스템상 오류가 발생하였습니다." });
    }
});

/**
 * Post /users
 * @summary TODO: Create a new user account
 * @tags users
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

        if (!email || !password || !userName || !userType) {
            // Translation: Registeration requires: email, password, name, and account type.
            console.log(req.body.email)
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
                    userName: userName
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
 * Post /resetPassword/emailRequest
 * @summary Change password of a user.
 * @tags users
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
 * Post /resetPassword
 * @summary Change password of a user.
 * @tags users
 * @return {object} 200 - Success response
 * @return {object} 403 - Not a prospective student
 * @return {object} 404 - Student not found
 * @return {object} 500 - Internal server error
 */
router.post("/resetPassword", async (req, res) => {
    try {
        const resetToken = req.body.token;
        const newPassword = req.body.newPassword

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

/**
 * Post /{id}/programs
 * @summary Add programs that a prospective student is interested in
 * @tags users
 * @return {object} 200 - Success response
 * @return {object} 403 - Not a prospective student
 * @return {object} 404 - Student not found
 * @return {object} 500 - Internal server error
 */
router.post("/:id/programs", async (req, res) => {
    try {
        const prospective = await Users.findById(req.params.id);
        const programIds = req.body.programs;

        const programs = await Program.find({ _id: { $in:programIds }})

        if (!prospective) {
            return res.status(404).json({ error: "존재하지 않는 학생입니다." })
        }
        else if (prospective.__t != 'prospectiveStudent') {
            return res.status(403).json({ error: "이 기능을 사용할실 수 없습니다." })
        }
        else {
            prospective.interestedPrograms.push(...programs);
            await prospective.save();
            res.status(200).json({ message: "성공적으로 등록하였습니다." })
        }

    } catch (err) {
        console.error(err)
        // Translation: An internal server error has occured
        return res.status(500).json({ error: "시스템상 오류가 발생하였습니다."})
    }
});

/**
 * Post /{id}/universities
 * @summary Add universities that a prospective student is interested in
 * @tags users
 * @return {object} 200 - Success response
 * @return {object} 403 - Not a prospective student
 * @return {object} 404 - Student not found
 * @return {object} 500 - Internal server error
 */
router.post("/:id/universities", async (req, res) => {
    try {
        const prospective = await Users.findById(req.params.id);
        const universityIds = req.body.universities;

        const universities = await University.find({ _id: { $in:universityIds }})

        if (!prospective) {
            return res.status(404).json({ error: "존재하지 않는 학생입니다." })
        }
        else if (prospective.__t != 'prospectiveStudent') {
            return res.status(403).json({ error: "이 기능을 사용할실 수 없습니다." })
        }
        else {
            prospective.interestedUniversities.push(...universities);
            await prospective.save();
            res.status(200).json({ message: "성공적으로 등록하였습니다." })
        } 

    } catch (err) {
        console.error(err)
        // Translation: An internal server error has occured
        return res.status(500).json({ error: "시스템상 오류가 발생하였습니다."})
    }
});

/**
 * Post /modifyInfo/{id}/meritPoint
 * @summary Modifies the merit point information of the user
 * @tags users
 * @return {object} 200 - Success response
 * @return {object} 400 - Wrong merit point range
 * @return {object} 403 - Not a prospective student
 * @return {object} 404 - Student not found
 * @return {object} 500 - Internal server error
 */
router.post("/modify/:id/meritPoint", async (req, res) => {
    try {
        const userId = req.params.id;
        const meritPoint = req.body.meritPoint;

        const user = await Users.findById(userId);

        if (!user) {
            res.status(404).json({ error: "존재하지 않는 회원입니다." })
        }

        else if (meritPoint > 22.5 || meritPoint < 0) {
            res.status(400).json({ error: "Merit point는 반드시 0점에서 22.5점 사이입니다."})
        }

        else if (user.__t != 'prospectiveStudent') {
            console.log(user.__t)
            res.status(403).json({ error: "사용할 수 없는 기능입니다." });
        }

        else {
            const securedMerit = securityHandler.encrypt(meritPoint);
            user.meritPoint = securedMerit;
            user.save();
            res.status(200).json({ message: "성공적으로 변경하였습니다." });
        }

    } catch (err) {
        console.error(err)
        // Translation: An internal server error has occured
        return res.status(500).json({ error: "시스템상 오류가 발생하였습니다."})
    }
});

/**
 * Post /modifyInfo/{id}/prerequisites
 * @summary Adds new prerequisite information to the user account
 * @tags users
 * @return {object} 200 - Success response
 * @return {object} 403 - Not a prospective student
 * @return {object} 404 - Student not found
 * @return {object} 500 - Internal server error
 */
router.post("/modify/:id/prerequisites", async (req, res) => {
    try {
        const userId = req.params.id;
        const prerequisites = req.body.prerequisites;

        const user = await Users.findById(userId);
        const invalidPrerequisites = prerequisites.filter(p => !["Math3B", "Math4", "Math5", "Physics1A", "Physics2", "Chemistry1", "Chemistry2", "Biology1", "Biology2", "Science2", "Civics1B", "History1B", "SpecialRequirement"].includes(p));

        console.log(userId)

        if (!user) {
            res.status(404).json({ error: "존재하지 않는 회원입니다." })
        }
        
        else if (invalidPrerequisites.length > 0) {
            // Translation: Invalid prerquisite(s)
            return res.status(400).json({ error: "존재하지 않는 자격요건: " + invalidPrerequisites.join(", ") });
        }

        else if (user.__t != 'prospectiveStudent') {
            res.status(403).json({ error: "사용할 수 없는 기능입니다." });
        }

        else {
            user.prerequisite = prerequisites;
            user.save();
            res.status(200).json({ message: "성공적으로 변경하였습니다." });
        }

    } catch (err) {
        console.error(err)
        // Translation: An internal server error has occured
        return res.status(500).json({ error: "시스템상 오류가 발생하였습니다."})
    }
});

/**
 * Delete /users/{id}
 * @summary Delete user
 * @tags users
 * @return {object} 200 - Deleted
 * @return {object} 403 - TODO: Forbidden
 * @return {object} 404 - User not found
 */
router.delete("/:id", async (req, res) => {
    try {
        const user = await Users.findOne({ _id: req.params.id });

        if (!user) {
            // Translation: User with the following ID does not exist
            return res.status(404).json({ error: "다음 ID로 등록된 회원이 존재하지 않습니다." });
        }

        await Users.deleteOne({ _id: req.params.id });
        // Translation: Deleted successfully
        return res.status(200).json({ message: "성공적으로 삭제하였습니다."});

    } catch (err) {
        console.error(err);
        // Translation: An internal server error has occured
        return res.status(500).json({ error: "시스템상 문제가 발생하였습니다." });
    }
});

/**
 * Delete /{id}/programs
 * @summary Remove programs that a prospective student is no longer interested in
 * @tags users
 * @return {object} 200 - Success response
 * @return {object} 403 - Not a prospective student
 * @return {object} 404 - Student not found
 * @return {object} 500 - Internal server error
 */
router.delete("/:id/programs", async (req, res) => {
    try {
        const prospective = await Users.findById(req.params.id);
        const programIds = req.body.programs;

        if (!prospective) {
            return res.status(404).json({ error: "존재하지 않는 학생입니다." })
        }

        else if (prospective.__t != 'prospectiveStudent') {
            return res.status(403).json({ error: "이 기능을 사용할실 수 없습니다." })
        }
        
        else {
            prospective.interestedPrograms = prospective.interestedPrograms.filter(
                programId => !programIds.includes(programId.toString())
            );
            await prospective.save();
            res.status(200).json({ message: "성공적으로 삭제하였습니다." })
        }        
    } catch (err) {
        console.error(err)
        // Translation: An internal server error has occured
        return res.status(500).json({ error: "시스템상 오류가 발생하였습니다."})
    }
});

/**
 * Delete /{id}/universities
 * @summary Remove universities that a prospective student is no longer interested in
 * @tags users
 * @return {object} 200 - Success response
 * @return {object} 403 - Not a prospective student
 * @return {object} 404 - Student not found
 * @return {object} 500 - Internal server error
 */
router.delete("/:id/universities", async (req, res) => {
    try {
        const prospective = await Users.findById(req.params.id);
        const universityIds = req.body.universities;

        if (!prospective) {
            return res.status(404).json({ error: "존재하지 않는 학생입니다." })
        }

        else if (prospective.__t != 'prospectiveStudent') {
            return res.status(403).json({ error: "이 기능을 사용할실 수 없습니다." })
        }
        
        
        else {
            prospective.interestedUniversities = prospective.interestedUniversities.filter(
                universityId => !universityIds.includes(universityId.toString())
            );
            await prospective.save();
            res.status(200).json({ message: "성공적으로 삭제하였습니다." })
        }        
    } catch (err) {
        console.error(err)
        // Translation: An internal server error has occured
        return res.status(500).json({ error: "시스템상 오류가 발생하였습니다."})
    }
});

module.exports = router;