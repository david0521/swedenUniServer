const router = require("express").Router();

const { encryptionHandler } = require('../services/encryption.service.js');
const authenticateJWT = require('../middlewares/jwtAuth.middle.js');
const { authorizeUser, authorizeAdmin } = require('../middlewares/authorize.middle.js');

const Users = require("../schemas/user.js");
const University = require("../schemas/university.js");
const Program = require("../schemas/program.js");
const { ProgramLikeStats, UniversityLikeStats } = require("../schemas/statistics.js");
const prospectiveStudent = require("../schemas/prospectiveStudent.js");

require('dotenv').config()

// Declare encryption handler to encrypt, and decrypt confidential data.
const securityHandler = new encryptionHandler();

/**
 * Get /users
 * @summary Returns all users in the system
 * @tags users
 * @return {object} 200 - Success response
 * @return {object} 403 - Not authorized response
 * @return {object} 404 - No user registered
 * @return {object} 500 - Internal server error
 */
router.get("/all", authenticateJWT, authorizeAdmin, async (req, res) => {
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
 * Get /users/id/:id
 * @summary Returns a specific user by id
 * @tags users
 * @return {object} 200 - Success response
 * @return {object} 400 - User ID not provided
 * @return {object} 403 - TODO: Not authorized response
 * @return {object} 404 - User not registered in system
 * @return {object} 500 - Internal server error
 * */

router.get("/id/:id", authenticateJWT, authorizeUser, async (req, res) => {
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
 * Get /users/{id}/prospective/universities
 * @summary Returns all universities that a user is interested in
 * @tags users
 * @return {object} 200 - Success response
 * @return {object} 500 - Internal server error
 * */

router.get("/:id/prospective/universities", authenticateJWT, authorizeUser, async (req, res) => {
    try {
        const userID = req.params.id;

        const user = await Users.findById(userID).select("interestedUniversities");

        if (!user) {
            return res.status(404).json({ error: "존재하지 않는 회원입니다." })
        } else if (user.__t != 'prospectiveStudent') {
            return res.status(403).json({ error: '다음 계정에서 지원되지 않는 기능입니다.' })
        }
        else {
            const universities = await University.find({
                _id: { $in: user.interestedUniversities }
            }).select("name ,_id");
            return res.status(200).json({ universities })
    
        }        
    } catch (err) {
        console.error(err);
        // Translation: An internal server error has occured
        return res.status(500).json({ error: "시스템상 오류가 발생하였습니다." });
    }
});

/**
 * Get /users/{id}/prospective/programs
 * @summary Returns all programs that a user is interested in
 * @tags users
 * @return {object} 200 - Success response
 * @return {object} 500 - Internal server error
 * */

router.get("/:id/prospective/programs", authenticateJWT, authorizeUser, async (req, res) => {
    try {
        const userID = req.params.id;

        const user = await Users.findById(userID).select("interestedPrograms");

        if (!user) {
            return res.status(404).json({ error: "존재하지 않는 회원입니다." })
        } else if (user.__t != 'prospectiveStudent') {
            return res.status(403).json({ error: '다음 계정에서 지원되지 않는 기능입니다.' })
        }
        else {
            const programs = await Program.find({
                _id: { $in: user.interestedPrograms }
            })
            return res.status(200).json({ programs })
        }
    

        
    } catch (err) {
        console.error(err);
        // Translation: An internal server error has occured
        return res.status(500).json({ error: "시스템상 오류가 발생하였습니다." });
    }
});

/**
 * Get /users/{id}/grade
 * @summary Returns the grade of a specific user
 * @tags users
 * @return {object} 200 - Success response
 * @return {object} 500 - Internal server error
 * */

router.get("/:id/grade", authenticateJWT, authorizeUser, async (req, res) => {
    try {
        const userID = req.params.id;

        const user = await Users.findById(userID).select("meritPoint prerequisite");

        if (!user) {
            res.status(404).json({ error: "존재하지 않는 회원입니다." });
        }

        else {
            res.status(200).json(user);
        }
    } catch (err) {
        console.error(err);
        // Translation: An internal server error has occured
        return res.status(500).json({ error: "시스템상 오류가 발생하였습니다." });
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
router.post("/:id/programs", authenticateJWT, authorizeUser, async (req, res) => {
    try {
        const prospective = await prospectiveStudent.findById(req.params.id);
        const programIds = req.body.programs;

        const programs = await Program.find({ _id: { $in:programIds }})
        
        if (!prospective) {
            return res.status(404).json({ error: "존재하지 않는 학생입니다." })
        }
        
        const newPrograms = programs.filter(program => !prospective.interestedPrograms.includes(program._id.toString()));

        if (newPrograms.length === 0) {
            return res.status(200).json({
                message: "이미 추가된 학과입니다."
            })
        }
        // Add the interested program into the student's array of interested program objects
        prospective.interestedPrograms.push(...programs);
        await prospective.save();

        // Increase number of likes for the program
        const programStats = await ProgramLikeStats.findOne({ programId: programIds })

        if (!programStats) {
            const newProgramStats = new ProgramLikeStats ({
                dateOfCreation: new Date(),
                programId: programIds,
                numOfLikes: 1
            })

            await newProgramStats.save();
        }
        else {
            programStats.numOfLikes++;
            await programStats.save();
        }
        return res.status(200).json({ message: "성공적으로 등록하였습니다." })

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
router.post("/:id/universities", authenticateJWT, authorizeUser, async (req, res) => {
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
router.post("/modify/:id/meritPoint", authenticateJWT, authorizeUser, async (req, res) => {
    try {
        const userId = req.params.id;
        const meritPoint = req.body.meritPoint;

        const user = await Users.findById(userId);

        if (!user) {
            res.status(404).json({ error: "존재하지 않는 회원입니다." })
        }

        else if (user.__t != 'prospectiveStudent') {
            console.log(user.__t)
            res.status(403).json({ error: "사용할 수 없는 기능입니다." });
        }

        else if (meritPoint > 22.5 || meritPoint < 0) {
            res.status(400).json({ error: "Merit point는 반드시 0점에서 22.5점 사이입니다."})
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
router.post("/modify/:id/prerequisites", authenticateJWT, authorizeUser, async (req, res) => {
    try {
        const userId = req.params.id;
        const prerequisites = req.body.prerequisites;

        const user = await Users.findById(userId);
        const invalidPrerequisites = prerequisites.filter(p => !["Math3B", "Math4", "Math5", "Physics1A", "Physics2", "Chemistry1", "Chemistry2", "Biology1", "Biology2", "Science2", "Civics1B", "History1B", "SpecialRequirement"].includes(p));

        if (!user) {
            res.status(404).json({ error: "존재하지 않는 회원입니다." })
        }
        
        else if (user.__t != 'prospectiveStudent') {
            res.status(403).json({ error: "사용할 수 없는 기능입니다." });
        }

        else if (invalidPrerequisites.length > 0) {
            // Translation: Invalid prerquisite(s)
            return res.status(400).json({ error: "존재하지 않는 자격요건: " + invalidPrerequisites.join(", ") });
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
router.delete("/:id", authenticateJWT, authorizeUser, async (req, res) => {
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
router.delete("/:id/programs", authenticateJWT, authorizeUser, async (req, res) => {
    try {
        const prospective = await Users.findById(req.params.id);
        const programIds = req.body.programs;


        if (!prospective) {
            return res.status(404).json({ error: "존재하지 않는 학생입니다." })
        }

        else if (prospective.__t != 'prospectiveStudent') {
            return res.status(403).json({ error: "이 기능을 사용할실 수 없습니다." })
        }
        
        const programsToRemove = prospective.interestedPrograms.filter(
            programId => programIds.includes(programId.toString())
        );

        if (programsToRemove.length === 0) {
            return res.status(200).json({ error: "삭제할 프로그램이 없습니다." });
        }

        prospective.interestedPrograms = prospective.interestedPrograms.filter(
            programId => !programIds.includes(programId.toString())
        );
        await prospective.save();

        // Decrease number of likes for the program
        const programStats = await ProgramLikeStats.findOne({ programId: programIds })

        if (!programStats) {
            return res.status(404).json({
                error: "존재하지 않는 프로그램입니다."
            })
        }
        else {
            programStats.numOfLikes--;
            await programStats.save();

            return res.status(200).json({
                message: "성공적으로 삭제하였습니다."
            })
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
router.delete("/:id/universities", authenticateJWT, authorizeUser, async (req, res) => {
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