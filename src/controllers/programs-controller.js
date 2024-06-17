const router = require("express").Router();
const Programs = require("../schemas/program.js")
const University = require("../schemas/university.js")



/**
 * Get /programs
 * @summary Returns all programs
 * @tags programs
 * @return {object} 200 - Success response
 * @return {object} 404 - No program registered
 */
router.get("/", async (req, res) => {
    try {
        const programs = await Programs.find();

        if (programs.length === 0) {
            // Translation: This is not a registered program
            return res.status(404).send("시스템에 등록된 프로그램이 없습니다.");
        }

        return res.status(200).send(programs);
    } catch (err) {
        console.log(err);
        // Translation: An internal server error has occured
        return res.status(500).send("시스템상 에러가 발생하였습니다.");

    }
});

/**
 * Get /programs/{prerequisites}
 * @summary Returns a specific program
 * @tags programs
 * @return {object} 200 - Success response
 * @return {object} 404 - Program not found
 */
router.get("/byPrerequisites", async (req, res) => {
    try {
        const requestedPrerequisites = req.query.prerequisites;

        const prerequisitesArray = Array.isArray(requestedPrerequisites) ? requestedPrerequisites : [requestedPrerequisites];

        // List of all valid prerequisites
        const validPrerequisites = ["Math3B", "Math4", "Math5", "Physics1A", "Physics2", "Chemistry1", "Chemistry2", "Biology1", "Biology2", "Science2", "Civics1B", "History1B", "Language3", "SpecialRequirement"];
        
        const invalidPrerequisites = prerequisitesArray.filter(prerequisite => !validPrerequisites.includes(prerequisite));

        // Map for higher category prerequisites
        const prerequisiteMap = {
            "Math4": ["Math3B"],
            "Math5": ["Math3B", "Math4"],
            "Physics2": ["Physics1A", "Science2"],
            "Chemistry2": ["Chemistry1", "Science2"],
            "Biology2": ["Biology1", "Science2"]
        };

        // Append prerequisites that are satisfied due to the satisfaction of a higher category
        prerequisitesArray.forEach(prerequisite => {
            if (prerequisiteMap[prerequisite]) {
                prerequisiteMap[prerequisite].forEach(satisfiedPrerequisite => {
                    if (!prerequisitesArray.includes(satisfiedPrerequisite)) {
                        prerequisitesArray.push(satisfiedPrerequisite);
                    }
                });
            }
        });

        

        // Returns invalid prerequisites as the error message.
        if (invalidPrerequisites.length > 0) {
            // Translation: Invalid prerequisite(s) were requested
            return res.status(400).json({ error: "존재하지 않는 자격요건: " + invalidPrerequisites.join(", ") });
        }

        // Aggregate to find all programs that meet the prerequisites
        const prerequisitePrograms = await Programs.aggregate([
            {
                $match: {
                    prerequisite: { $exists: true }
                }
            },
            {
                $project: {
                    name: 1,
                    prerequisite: 1,
                    prerequisiteIsMet: {
                        $setIsSubset: ["$prerequisite", prerequisitesArray]
                    }
                }
            },
            {
                $match: {
                    prerequisiteIsMet: true
                }
            }
        ]);

        return res.status(200).json({ programs: prerequisitePrograms });

    } catch (err) {
        console.error(err);
        // Translation: An internal server erro has occured
        return res.status(500).json({ error: "시스템상 에러가 발생하였습니다." });
    }
});


/**
 * Get /programs/byUniversity/{uniName}
 * @summary Returns a specific program
 * @tags programs
 * @return {object} 200 - Success response
 * @return {object} 404 - Program not found
 */
router.get("/byUniversity", async (req, res) => {
    try {
        const requestedUniversity = req.query.universityName;

        if (!requestedUniversity) {
            // Translation: No university provided
            return res.status(400).json({ error: "대학교 정보가 입력되지 않았습니다." });
        }

        console.log(requestedUniversity);

        const programsWithUniversity = await Programs.find({ universityName: requestedUniversity });

        if (programsWithUniversity.length === 0) {
            // Translation: University not registered in the system
            return res.status(400).json({ error: "시스템에 등록되지 않은 대학교입니다." });
        }

        return res.status(200).json({ programs: programsWithUniversity });

    } catch (err) {
        console.error(err);
        // Translation: An internal server error has occured
        return res.status(500).json({ error: "시스템상 에러가 발생하였습니다." });
    }
});

/**
 * Get /programs/{id}
 * @summary Returns a specific program
 * @tags programs
 * @return {object} 200 - Success response
 * @return {object} 404 - Program not found
 */
router.get("/:id", async (req, res) => {
    try {
         program = await Programs.findOne({_id: req.params.id });

        if (program == null) {
            // Translation: Program not found
            return res.status(404).send("시스템에 등록되지 않은 프로그램입니다.");
        }
    return res.send(program);
    } catch (err) {
        console.error(err);
        // Translation: An internal server error has occured
        return res.status(500).json({ error: "시스템상 에러가 발생하였습니다." });
    }
});


/**
 * Post /programs
 * @summary Create a new program
 * @tags universities
 * @return {object} 201 - Created
 * @return {object} 400 - Request missing data
 * @return {object} 403 - Request forbidden. Only for admin users. TODO
 * @return {object} 409 - Request info already exists
 */
router.post("/", async (req, res) => {
    try {
        console.log(req.body)
        const name = req.body.programName;
        const programCode = req.body.programCode;
        const universityName = req.body.programUniversity;
        const programDescription = req.body.programDescription;
        const prerequisite = req.body.programPrerequisites;
        const tuitionFee = req.body.programTuition;

        if (!name || !programCode || !universityName || !prerequisite || !tuitionFee) {
            // Translation: To create a new program the following information is required: name, program code, university name, prerequisites, and tuitionFee
            return res.status(400).json({ error: "새로운 프로그램을 등록하기 위해서 다음 정보가 필요합니다: 이름, 학과코드, 자격요건, 학비" });
        }

        const invalidPrerequisites = prerequisite.filter(p => !["Math3B", "Math4", "Math5", "Physics1A", "Physics2", "Chemistry1", "Chemistry2", "Biology1", "Biology2", "Science2", "Civics1B", "History1B", "SpecialRequirement"].includes(p));
        if (invalidPrerequisites.length > 0) {
            // Translation: Invalid prerquisite(s)
            return res.status(400).json({ error: "존재하지 않는 자격요건: " + invalidPrerequisites.join(", ") });
        }

        const existingProgram = await Programs.findOne({ name: name });

        if (existingProgram) {
            // Translation: The following program is already registered in the system
            return res.status(409).json({ error: "다음 프로그램은 이미 시스템에 등록되어 있습니다." });
        }

        const newProgram = new Programs ({
            name: name,
            programCode: programCode,
            universityName: universityName,
            programDescription: programDescription,
            prerequisite: prerequisite,
            tuitionFee: tuitionFee
        })

        await newProgram.save();

        const university = await University.findOneAndUpdate(
            { name: universityName },
            { $push: { programs: newProgram._id } },
            { new: true }
        );

        // Translation: New program saved
        return res.status(201).json({ message: "새로운 프로그램이 등록되었습니다.", program: newProgram });
    } catch (err) {
        console.error(err);
        // Translation: An internal server error has occured
        return res.status(500).json({ error: "시스템상 오류가 발생하였습니다." });
    }
});

/**
 * Patch /programs/{id}
 * @summary Modifies the information of a specific program
 * @tags universities
 * @return {object} 200 - Modified
 * @return {object} 403 - Request forbidden. Only for admin users. TODO
 * @return {object} 404 - Program not found
 */
router.patch("/:id", async (req, res) => {
    try {
        const existingProgram = await Programs.findById(req.params.id);

        if (!existingProgram) {
            // Translation: Program with the following ID does not exist
            res.status(404).json({ error: "다음 ID로 등록된 프로그램이 존재하지 않습니다." });
        }
        
        const oldInfo = existingProgram.toObject();
        const newInfo = req.body;

        delete oldInfo._id;
        delete newInfo._id;

        console.log(oldInfo);
        console.log(newInfo);

        await Programs.findByIdAndUpdate(req.params.id, { ...oldInfo, ...newInfo});

        return res.status(200).send(await Programs.findById(req.params.id));
    } catch (err) {
        console.error(err);
        // Translation: An internal server error has occured
        return res.status(500).json({ error: "시스템상 오류가 발샹하였습니다."});
    }

})

/**
 * Delete /programs/{id}
 * @summary Delete a program
 * @tags universities
 * @return {object} 200 - Deleted
 * @return {object} 403 - Request forbidden. Only for admin users. TODO
 * @return {object} 404 - Program not found
 */
router.delete("/:id", async (req, res) => {
    try {
        const existingProgram = await Programs.findOne({ _id: req.params.id });

        if (!existingProgram) {
            // Translation: Program with the following ID does not exist
            return res.status(404).json({ error: "다음 ID로 등록된 프로그램이 존재하지 않습니다." });
        }

        await Programs.deleteOne({ _id: req.params.id });
        // Translation: Deleted successfully
        return res.status(200).json({ message: "성공적으로 삭제하였습니다."});

    } catch (err) {
        console.error(err);
        // Translation: An internal server error has occured
        return res.status(500).json({ error: "시스템상 오류가 발생하였습니다." });
    }
});

module.exports = router;