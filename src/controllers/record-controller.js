const router = require("express").Router();
const Records = require("../schemas/records.js");
const Programs = require("../schemas/program.js")

const authenticateJWT = require('../middlewares/jwtAuth.middle.js')
const { authorizeAdmin } = require('../middlewares/authorize.middle.js')

/**
 * Get /{programName}
 * @summary Returns all past records for a specific program
 * @tags records
 * @return {object} 200 - Success response
 * @return {object} 404 - No consent forms registered
 */
router.get("/:programName", async (req, res) => {
    try {
        const programName = req.body.program;
        const records = await Records.find({programName: programName});

        if (records.length === 0) {
            return res.status(200).json({ message: "아직 기록이 등록되지 않았습니다." })
        }

        else {
            return res.status(200).json({ records: records });
        }
    } catch (err) {
        console.log(err);
        // Translation: An internal server error has occured
        return res.status(500).send("시스템상 오류가 발생하였습니다.")

    }
});

/**
 * Post /
 * @summary Save records for each of the programs
 * @tags records
 * @return {object} 200 - Success response
 * @return {object} 404 - No consent forms registered
 */
router.post("/", authenticateJWT, authorizeAdmin, async (req, res) => {
    try {
        const programName = req.body.programName;
        const minScore = req.body.minScore;
        const applicants = req.body.applicants;
        const qualified = req.body.qualified;
        const accepted = req.body.accepted;
        const year = req.body.year;
        const selection = req.body.selection;
        const group = req.body.group;

        if (!programName || !minScore || !applicants || !qualified || !accepted || !year || !selection || !group) {
            return res.status(400).json({ error: "기록을 등록하기 위해서는 다음 정보가 필요합니다: 학과명, 합격 점수, 지원자 수, 자격자 수, 년도, 셀렉션, 그룹" });
        }

        const record = new Records({
            programName: programName,
            minScore: minScore,
            numOfApplicants: applicants,
            numOfQualified: qualified,
            acceptedApplicants: accepted,
            year: year,
            selection: selection,
            selectionGroup: group
        })

        await record.save();

        const program = await Programs.findOneAndUpdate(
            { name: programName },
            { $push: { records: record._id } },
            { new: true }
        );

        return res.status(200).json({
            message: "성공적으로 등록되었습니다."
        })
        
    } catch (err) {
        console.log(err);
        // Translation: An internal server error has occured
        return res.status(500).send("시스템상 오류가 발생하였습니다.")

    }
});

/**
 * Get /{programName}
 * @summary Returns all past records for a specific program
 * @tags records
 * @return {object} 200 - Success response
 * @return {object} 404 - No consent forms registered
 */
router.get("/:programName", async (req, res) => {
    try {
        const programName = req.body.program;
        const records = await Records.find({programName: programName});

        if (records.length === 0) {
            return res.status(200).json({ message: "아직 기록이 등록되지 않았습니다." })
        }

        else {
            return res.status(200).json({ records: records });
        }
    } catch (err) {
        console.log(err);
        // Translation: An internal server error has occured
        return res.status(500).send("시스템상 오류가 발생하였습니다.")

    }
});

module.exports = router;