const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Programs = require("./program")

/**
 * name: University name (e.g. University of Gothenburg).
 * city: The location of the university (e.g. Gothenburg).
 * programs: An array that stores the programs taught in the university.
 */

const universitySchema = new Schema({
    name: {
        type: String,
        unique: true,
        required: [true, "University name required"]
    },
    city: {
        type: String,
        required: [true, "Located city required"]
    },
    programs: [
        {
            type: Schema.Types.ObjectId,
            ref: Programs
        }
    ]
});

module.exports = mongoose.model("University", universitySchema);
