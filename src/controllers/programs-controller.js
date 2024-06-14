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
            return res.status(404).send("No programs found!!");
        }

        return res.send(programs);
    } catch (err) {
        console.log(err);
        return res.status(500).send("An internal server error has occured.");

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

        if (!requestedPrerequisites) {
            return res.status(400).json({ error: "Invalid or missing prerequisites in the request." });
        }

        // Based on the user's request of prerequisites (number of prerequisites),
        // The system converts a single prerequisite into an array of size one.
        const prerequisitesArray = Array.isArray(requestedPrerequisites) ? requestedPrerequisites : [requestedPrerequisites];

        // Checks if there are any invalid values included in the array.
        const invalidPrerequisites = prerequisitesArray.filter(prerequisite => !["Math3B", "Math4", "Math5", "Physics1A", "Physics2", "Chemistry1", "Chemistry2", "Biology1", "Biology2"].includes(prerequisite));

        console.log(prerequisitesArray);

        // Returns invalid prerequisites as the error message.
        if (invalidPrerequisites.length > 0) {
            return res.status(400).json({ error: "Invalid prerequisites specified: " + invalidPrerequisites.join(", ") });
        }

        // Return the programs that match the prerequisites.
        const programsWithPrerequisites = await Programs.find({ prerequisite: { $all: prerequisitesArray } });
        return res.status(200).json({ programs: programsWithPrerequisites });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "An internal server error has occurred" });
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
            return res.status(400).json({ error: "No university provided!!" });
        }

        console.log(requestedUniversity);

        const programsWithUniversity = await Programs.find({ universityName: requestedUniversity });

        if (programsWithUniversity.length === 0) {
            return res.status(400).json({ error: "University not registered in the system" });
        }

        return res.status(200).json({ programs: programsWithUniversity });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "An internal server error has occurred" });
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
            return res.status(404).send("Program not found");
        }
    return res.send(program);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "An internal servver error has occured" });
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
            return res.status(400).json({ error: "To create a new program, name, program code, university name, and prerequisites are required." });
        }

        const invalidPrerequisites = prerequisite.filter(p => !["Math3B", "Math4", "Math5", "Physics1A", "Physics2", "Chemistry1", "Chemistry2", "Biology1", "Biology2", "Science2", "Civics1B", "History1B", "SpecialRequirement"].includes(p));
        if (invalidPrerequisites.length > 0) {
            return res.status(400).json({ error: "Invalid prerequisites: " + invalidPrerequisites.join(", ") });
        }

        const existingProgram = await Programs.findOne({ name: name });

        if (existingProgram) {
            return res.status(409).json({ error: "The following program is already registered in the system." });
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

        return res.status(201).json({ message: "New Program Saved", program: newProgram });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "An internal server error occured" });
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
            res.status(404).json({ error: "Program with the following id does not exist" });
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
        return res.status(500).json({ error: "An internal server error has occured"});
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
            return res.status(404).json({ error: "Program with the following id does not exist" });
        }

        await Programs.deleteOne({ _id: req.params.id });
        return res.status(200).json({ message: "Deleted Successfully!!"});

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "An internal server error occured" });
    }
});

module.exports = router;