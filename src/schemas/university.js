const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Courses = require("./course")

/**
 * name: University name (e.g. University of Gothenburg).
 * city: The location of the university (e.g. Gothenburg).
 * courses: An array that stores the courses taught in the university.
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
    courses: [
        {
            type: Schema.Types.ObjectId,
            ref: Courses
        }
    ]
});

module.exports = mongoose.model("University", universitySchema);
