const router = require("express").Router();
const Users = require("../schemas/user.js");
const ProspectiveStudents = require("../schemas/prospectiveStudent.js");
const UniversityStudents = require("../schemas/universityStudent.js");
const University = require("../schemas/university.js");
const Program = require("../schemas/program.js");



/**
 * Get /users
 * @summary Returns all users in the system
 * @tags users
 * @return {object} 200 - Success response
 * @return {object} 403 - TODO: Not authorized response
 * @return {object} 404 - No user registered
 * @return {object} 500 - Internal server error
 */
router.get("/", async (req, res) => {
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

router.get("/:id", async (req, res) => {
    try {
        const requestedUser = req.params._id;

        if (!requestedUser) {
            // Translation: Missing user id in the request
            return res.status(400).json({ error: "회원 아이디가 주어지지 않았습니다." })
        }

        const user = await Users.findOne({ id: requestedUser }).select("-__v -password")

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
 * Get /users/prospective/{university}
 * @summary Returns number of prospective students who are interested in a specific university
 * @tags users
 * @return {object} 200 - Success response
 * @return {object} 500 - Internal server error
 * */

router.get("/prospective/:university", async (req, res) => {
    try {
        const requestedUniversity = req.params.university;
        
        const uniID = await University.findOne({ name: requestedUniversity }).select("_id");

        const interestNumber = await ProspectiveStudents.countDocuments({ interestedUniversities: uniID });

        return res.status(200).send(interestNumber);
        
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

router.get("/prospective/:program", async (req, res) => {
    try {
        const requestedProgram = req.params.program;
        
        const programID = await Program.findOne({ name: requestedProgram }).select("_id");

        const interestNumber = await ProspectiveStudents.countDocuments({ interestedPrograms: programID });

        return res.status(200).send(interestNumber);
        
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
router.post("/", async (req, res) => {
    try {
        
    } catch (err) {
        console.error(err);
        // Translation: An internal server error has occured
        return res.status(500).json({ error: "시스템상 오류가 발생하였습니다." });
    }
});

/**
 * Patch /users/{id}
 * @summary Modifies user information
 * @tags users
 * @return {object} 200 - Modified
 * @return {object} 401 - TODO: Not Authorized
 * @return {object} 403 - TODO: Forbidden (Regular user --> Admin)
 * @return {object} 404 - User not found
 */
router.patch("/:id", async (req, res) => {
    try {
        const user = await Users.findById(req.params.id);

        if (!user) {
            // Translation: User with the following ID does not exist
            return res.status(404).json({ error: "다음 ID로 등록된 회원은 존재하지 않습니다." });
        }
        
        const oldInfo = user.toObject();
        const newInfo = req.body;

        delete oldInfo._id;
        delete newInfo._id;

        console.log(oldInfo);
        console.log(newInfo);

        await Users.findByIdAndUpdate(req.params.id, { ...oldInfo, ...newInfo });

        return res.status(200).send(await Users.findById(req.params.id))

        // TODO:
        // Create a method to migrate between accounts (Automatically delete information not necessary)
    } catch (err) {
        console.error(err)
        // Translation: An internal server error has occured
        return res.status(500).json({ error: "시스템상 오류가 발생하였습니다."})
    }

})

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

module.exports = router;