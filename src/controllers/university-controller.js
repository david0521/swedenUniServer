const router = require("express").Router();

const Universities = require("../schemas/university.js")
const ProspectiveStudents = require("../schemas/prospectiveStudent.js")

const authenticateJWT = require('../middlewares/jwtAuth.middle.js')
const { authorizeUser, authorizeAdmin } = require('../middlewares/authorize.middle.js');

/**
 * Get /universities
 * @summary Returns all universities
 * @tags universities
 * @return {object} 200 - Success response
 * @return {object} 404 - No university registered
 */
router.get("/", async (req, res) => {
    try {
        const universities = await Universities.find();

        if (universities.length === 0) {
            // Translation: No universities found
            return res.status(404).send("시스템에 등록된 대학교가 존재하지 않습니다.")
        }

        return res.status(200).json({univeristies: universities});
    } catch (err) {
        console.log(err);
        // Translation: An internal server error has occured
        return res.status(500).send("시스템상 오류가 발생하였습니다.")

    }
});

/**
 * Get /universities/byCity/{city}
 * @summary Returns all universities from a specific city
 * @tags universities
 * @return {object} 200 - Success response
 * @return {object} 500 - Internal server error
 * */

router.get("/byCity", async (req, res) => {
    try {
        const requestedCity = req.query.city;

        if (!requestedCity) {
            // Translation: Missing city in the request
            return res.status(400).json({ error: "도시 이름이 주어지지 않았습니다." })
        }

        console.log(requestedCity);

        const universitiesInCity = await Universities.find({ city: requestedCity })

        if (universitiesInCity.length === 0) {
            // Translation: City not registered
            return res.status(400).json({ error: "시스템에 등록되지 않은 도시입니다." })
        }

        return res.status(200).json({ universities: universitiesInCity })
        
    } catch (err) {
        console.error(err);
        // Translation: An internal server error has occured
        return res.status(500).json({ error: "시스템상 오류가 발생하였습니다." });
    }
});

/**
 * Get /universities/name/{name}
 * @summary Returns a specific university
 * @tags universities
 * @return {object} 200 - Success response
 * @return {object} 404 - University not found
 */
router.get("/name/:name", async (req, res) => {
    try {
         const university = await Universities.findOne({name: req.params.name});

        if (university == null) {
            // Translation: University not found
            return res.status(404).send("다음 이름으로 등록된 대학교는 존재하지 않습니다.")
        }

        return res.status(200).json({ universities: university });
    } catch (err) {
        console.error(err);
        // Translation: An internal server error has occured
        return res.status(500).json({ error: "시스템상 오류가 발생하였습니다." });
    }
});

/**
 * Get /universities/{id}
 * @summary Returns a specific university
 * @tags universities
 * @return {object} 200 - Success response
 * @return {object} 404 - University not found
 */
router.get("/:id", async (req, res) => {
    try {
         const university = await Universities.findOne({_id: req.params.id });

        if (university == null) {
            // Translation: University not found
            return res.status(404).send("다음 ID로 등록된 대학교는 존재하지 않습니다.")
        }
    return res.status(200).json(university);
    } catch (err) {
        console.error(err);
        // Translation: An internal server error has occured
        return res.status(500).json({ error: "시스템상 오류가 발생하였습니다." });
    }
});

/**
 * Get /universities/prospective/{university}
 * @summary Returns number of prospective students who are interested in a specific university
 * @tags universities
 * @return {object} 200 - Success response
 * @return {object} 500 - Internal server error
 * */

router.get("/prospective/university", async (req, res) => {
    try {
        const requestedUniversity = req.query.university;
        
        const uniID = await Universities.findOne({ name: requestedUniversity }).select("_id");

        const interestNumber = await ProspectiveStudents.countDocuments({ interestedUniversities: uniID });

        return res.status(200).json({message: interestNumber});
        
    } catch (err) {
        console.error(err);
        // Translation: An internal server error has occured
        return res.status(500).json({ error: "시스템상 오류가 발생하였습니다." });
    }
});

/**
 * Post /universities
 * @summary Create a new university
 * @tags universities
 * @return {object} 201 - Created
 * @return {object} 400 - Request missing data
 * @return {object} 403 - Request forbidden. Only for admin users. TODO
 * @return {object} 409 - Request info already exists
 */
router.post("/", authenticateJWT, authorizeAdmin, async (req, res) => {
    try {
        console.log(req.body.name)
        const name = req.body.name
        const city = req.body.city

        if (!name || !city) {
            // Translation: To create a new university the following information are required: name, city
            return res.status(400).json({ error: "새로운 대학교를 등록하기 위해서 다음 정보가 필요합니다: 이름, 도시" });
        }
        const existingUniversity = await Universities.findOne({ name: name });

        if (existingUniversity) {
            // Translation: The following university is already registered in the system
            return res.status(409).json({ error: "다음 대학교는 이미 시스템에 등록되어 있습니다." });
        }

        const newUniversity = new Universities ({
            name: name,
            city: city
        })

        await newUniversity.save();

        // Translation: New University Saved
        return res.status(201).json({ message: "새로운 대학교가 등록되었습니다.", university: newUniversity });
    } catch (err) {
        console.error(err);
        // Translation: An internal server error has occured
        return res.status(500).json({ error: "시스템상 오류가 발생하였습니다." });
    }
});

/**
 * Patch /universities/{id}
 * @summary Modifies the information of a specific university
 * @tags universities
 * @return {object} 200 - Modified
 * @return {object} 403 - Request forbidden. Only for admin users.
 * @return {object} 404 - University not found
 */
router.patch("/:id", authenticateJWT, authorizeAdmin, async (req, res) => {
    try {
        const existingUniversity = await Universities.findById(req.params.id);

        if (!existingUniversity) {
            // Translation: University with the following ID does not exist
            return res.status(404).json({ error: "다음 ID로 등록된 대학교는 시스템에 존재하지 않습니다." });
        } else {
            const oldInfo = existingUniversity.toObject();
            const newInfo = req.body;

            delete oldInfo._id;
            delete newInfo._id;

            console.log(oldInfo);
            console.log(newInfo);

            await Universities.findByIdAndUpdate(req.params.id, { ...oldInfo, ...newInfo});

            return res.status(200).send(await Universities.findById(req.params.id))

        }
        
    } catch (err) {
        console.error(err)
        // Translation: An internal server error has occured
        return res.status(500).json({ error: "시스템상 오류가 발생하였습니다."})
    }

})

/**
 * Delete /universities/{id}
 * @summary Delete a new university
 * @tags universities
 * @return {object} 200 - Deleted
 * @return {object} 403 - Request forbidden. Only for admin users.
 * @return {object} 404 - University not found
 */
router.delete("/:id", authenticateJWT, authorizeAdmin, async (req, res) => {
    try {
        const existingUniversity = await Universities.findOne({ _id: req.params.id });

        if (!existingUniversity) {
            // Translation: University with the following ID does not exist
            return res.status(404).json({ error: "다음 ID로 등록된 대학교는 존재하지 않습니다." });
        }

        await Universities.deleteOne({ _id: req.params.id });
        // Translation: Deleted successfully
        return res.status(200).json({ message: "성공적으로 삭제하였습니다."});

    } catch (err) {
        console.error(err);
        // Translation: An internal server error has occured
        return res.status(500).json({ error: "시스템상 문제가 발생하였습니다." });
    }
});

module.exports = router;