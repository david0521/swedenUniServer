const router = require("express").Router();
const ConsentForm = require("../schemas/consentForm.js");

const authenticateJWT = require('../middlewares/jwtAuth.middle.js')
const { authorizeUser, authorizeAdmin } = require('../middlewares/authorize.middle.js')

/**
 * Get /{id}
 * @summary Returns all consent forms signed by the user
 * @tags consentForm
 * @return {object} 200 - Success response
 * @return {object} 404 - No consent forms registered
 */
router.get("/:id", authenticateJWT, authorizeUser, async (req, res) => {
    try {
        const userId = req.params.id;
        const consents = await ConsentForm.find({ signature: userId });

        if (consents.length === 0) {
            // Translation: No universities found
            return res.status(404).send("등록된 동의서가 존재하지 않습니다.")
        }

        return res.send(consents);
    } catch (err) {
        console.log(err);
        // Translation: An internal server error has occured
        return res.status(500).send("시스템상 오류가 발생하였습니다.")

    }
});

/**
 * Post /
 * @summary Returns all consent forms signed by the user
 * @tags consentForm
 * @return {object} 200 - Success response
 * @return {object} 404 - No consent forms registered
 */
router.post("/", async (req, res) => {
    try {
        const topic = req.body.topic;
        const collectedData = req.body.collectedData;
        const timestamp = req.body.timestamp;

        if (!topic || !collectedData || !timestamp) {
            return res.status(400).json({ error: "동의서를 등록하기 위해서 다음 정보가 필요합니다: 주제, 수집 데이터, 동의시간" });
        }

        const consent = new ConsentForm({
            topic: topic,
            collectedData: collectedData,
            timestamp: timestamp,
        })

        await consent.save();
        return res.status(200).json({
            "id": consent._id
        })
        
    } catch (err) {
        console.log(err);
        // Translation: An internal server error has occured
        return res.status(500).send("시스템상 오류가 발생하였습니다.")

    }
});

module.exports = router;