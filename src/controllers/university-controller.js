const router = require("express").Router();
const { applyDefaults } = require("../schemas/records.js");
const Universities = require("../schemas/university.js")



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
            return res.status(404).send("No universities found!!")
        }

        return res.send(universities);
    } catch (err) {
        console.log(err);
        return res.status(500).send("An internal server error has occured.")

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
            return res.status(400).json({ error: "Missing city in the request." })
        }

        console.log(requestedCity);

        const universitiesInCity = await Universities.find({ city: requestedCity })

        if (universitiesInCity.length === 0) {
            return res.status(400).json({ error: "City not registered." })
        }

        return res.status(200).json({ universities: universitiesInCity })
        
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "An internal server error has occurred" });
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
         university = await Universities.findOne({_id: req.params.id });

        if (university == null) {
            return res.status(404).send("University not found")
        }
    return res.send(university);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "An internal servver error has occured" });
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
router.post("/", async (req, res) => {
    try {
        console.log(req.body.name)
        const name = req.body.name
        const city = req.body.city

        if (!name || !city) {
            return res.status(400).json({ error: "To create a new university, name and city are required." });
        }
        const existingUniversity = await Universities.findOne({ name: name });

        if (existingUniversity) {
            return res.status(409).json({ error: "The following university is already registered in the system." });
        }

        const newUniversity = new Universities ({
            name: name,
            city: city
        })

        await newUniversity.save();

        return res.status(201).json({ message: "New University Saved", university: newUniversity });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "An internal server error occured" });
    }
});

/**
 * Patch /universities/{id}
 * @summary Modifies the information of a specific university
 * @tags universities
 * @return {object} 200 - Modified
 * @return {object} 403 - Request forbidden. Only for admin users. TODO
 * @return {object} 404 - University not found
 */
router.patch("/:id", async (req, res) => {
    try {
        const existingUniversity = await Universities.findById(req.params.id);

        if (!existingUniversity) {
            return res.status(404).json({ error: "University with the following id does not exist" });
        }
        
        const oldInfo = existingUniversity.toObject();
        const newInfo = req.body;

        delete oldInfo._id;
        delete newInfo._id;

        console.log(oldInfo);
        console.log(newInfo);

        await Universities.findByIdAndUpdate(req.params.id, { ...oldInfo, ...newInfo});

        return res.status(200).send(await Universities.findById(req.params.id))
    } catch (err) {
        console.error(err)
        return res.status(500).json({ error: "An internal server error has occured"})
    }

})

/**
 * Delete /universities/{id}
 * @summary Delete a new university
 * @tags universities
 * @return {object} 200 - Deleted
 * @return {object} 403 - Request forbidden. Only for admin users. TODO
 * @return {object} 404 - University not found
 */
router.delete("/:id", async (req, res) => {
    try {
        const existingUniversity = await Universities.findOne({ _id: req.params.id });

        if (!existingUniversity) {
            return res.status(404).json({ error: "University with the following id does not exist" });
        }

        await Universities.deleteOne({ _id: req.params.id });
        return res.status(200).json({ message: "Deleted Successfully!!"});

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "An internal server error occured" });
    }
});

module.exports = router;