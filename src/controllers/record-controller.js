const router = require("express").Router();
const Records = require("../schemas/records.js");
const Programs = require("../schemas/program.js")
const { MinMeritStats } = require("../schemas/statistics.js");

const authenticateJWT = require('../middlewares/jwtAuth.middle.js')
const { authorizeAdmin } = require('../middlewares/authorize.middle.js')
const { selectionGroupAvg } = require('../services/statistics.service.js')

router.post("/allAvg", async (req, res) => {
    try {
        const programName = req.body.programName;
        const selectionGroup = req.body.selectionGroup;
        const round = req.body.round;

        selectionGroupAvg(programName, selectionGroup, round);
        res.status(200).json({ message: "성공" })
    } catch (err) {
        console.error(err)
    }
})
/**
 * Post /
 * @summary Save records for each of the programs
 * @tags records
 * @return {object} 200 - Success response
 * @return {object} 404 - No consent forms registered
 */
router.post("/", authenticateJWT, authorizeAdmin, async (req, res) => {
    try {
        console.log(res.body);

        const programName = req.body.programName;
        const minScore = req.body.minScore;
        const applicants = req.body.applicants;
        const qualified = req.body.qualified;
        const accepted = req.body.accepted;
        const year = req.body.year;
        const round = req.body.round;
        const selection = req.body.selection;
        const group = req.body.group;
        const number = req.body.firstApplicant

        if (!programName || !minScore || !applicants || !qualified || !accepted || !year || !round || !group || !selection) {
            return res.status(400).json({ error: "기록을 등록하기 위해서는 다음 정보가 필요합니다: 학과명, 합격 점수, 지원자 수, 자격자 수, 년도, 셀렉션, 그룹" });
        }

        const record = new Records({
            programName: programName,
            minScore: minScore,
            numOfApplicants: applicants,
            numOfQualified: qualified,
            acceptedApplicants: accepted,
            year: year,
            round: round,
            selection: selection,
            selectionGroup: group,
            numOfFirstChoice: number
        })

        await record.save();

        // Update program so that it stores the newly added admission record information.
        const program = await Programs.findOneAndUpdate(
            { name: programName },
            { $push: { records: record._id } },
            { new: true }
        );

        // Update minimum merit score average information based on the newly added records.
        selectionGroupAvg(programName, group, round);

        return res.status(200).json({
            message: "성공적으로 등록되었습니다.",
            programId: record
        })
        
    } catch (err) {
        console.log(err);
        // Translation: An internal server error has occured
        return res.status(500).send("시스템상 오류가 발생하였습니다.")

    }
});

/**
 * Get /name/{programName}
 * @summary Returns all past records for a specific program
 * @tags records
 * @return {object} 200 - Success response
 * @return {object} 404 - No consent forms registered
 */
router.get("/name/:programName", async (req, res) => {
    try {
        const programName = req.params.programName;
        console.log(programName)
        const records = await Records.find({ programName: programName });

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
 * Get /name/{programName}/avg
 * @summary Returns average minimum merit points needed for the program
 * @tags records
 * @return {object} 200 - Success response
 * @return {object} 404 - No consent forms registered
 */
router.get("/name/:programName/avg", async (req, res) => {
    try {
        const programName = req.params.programName;
        const stats = await MinMeritStats.find({ programName: programName });

        if (stats.length === 0) {
            return res.status(200).json({ message: "아직 입시정보가 등록되지 않았습니다." })
        }

        else {
            return res.status(200).json({ stats: stats });
        }
    } catch (err) {
        console.log(err);
        // Translation: An internal server error has occured
        return res.status(500).send("시스템상 오류가 발생하였습니다.")

    }
});

/**
 * Delete /id/{id}
 * @summary Deletes the relevant record
 * @tags records
 * @return {object} 200 - Success response
 * @return {object} 404 - No consent forms registered
 */
router.delete("/id/:id", authenticateJWT, authorizeAdmin, async (req, res) => {
    try {
        const recordId = req.params.id
        await Records.findByIdAndDelete(recordId)

        return res.status(200).json({ message: '성공적으로 삭제하였습니다.' })

    } catch (err) {
        console.log(err);
        // Translation: An internal server error has occured
        return res.status(500).send("시스템상 오류가 발생하였습니다.")

    }
});

module.exports = router;