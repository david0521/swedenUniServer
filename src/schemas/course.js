const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Records = require("./records.js")

/**
 * name: The name of the course,
 * courseCode: The code of the couse.
 * universityName: The name of the university that teaches the course.
 * courseDescription: The description of the course.
 * prerequisite: The prerequisites of the course. Can select multivalue since courses often require several prerequisites.
 * records: An array of the past admission records for the course
 */

const courseSchema = new Schema({
    name: {
        type: String,
        required: [true, "Course name is required."]
    },
    courseCode: {
        type: String,
        required: [true, "Course code must be registered."]
    },
    universityName: {
        type: String,
        required: [true, "University name must be registered."]
    },
    courseDescription: {
        type: String
    },
    prerequisite: [{
        type: String,
        enum: ["Math3B", "Math4", "Math5", "Physics1A", "Physics2", "Chemistry1", "Chemistry2", "Biology1", "Biology2"],
        required: [true, "Prerequisite information must be registered."]
    }],
    records: [
        {
            type: Schema.Types.ObjectId,
            ref: Records,
        },
    ],

});

module.exports = mongoose.model("Course", courseSchema);
