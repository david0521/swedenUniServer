const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Records = require("./records.js")

/**
 * name: The name of the program,
 * programCode: The code of the couse.
 * universityName: The name of the university that teaches the program.
 * programDescription: The description of the program.
 * prerequisite: The prerequisites of the program. Can select multivalue since programs often require several prerequisites.
 * records: An array of the past admission records for the program
 */

const programSchema = new Schema({
    name: {
        type: String,
        required: [true, "Program name is required."]
    },
    programCode: {
        type: String,
        required: [true, "Program code must be registered."]
    },
    universityName: {
        type: String,
        required: [true, "University name must be registered."]
    },
    programDescription: {
        type: String
    },
    prerequisite: [{
        type: String,
        enum: ["Math3B", "Math4", "Math5", "Physics1A", "Physics2", "Chemistry1", "Chemistry2", "Biology1", "Biology2", "Science2", "Civics1B", "History1B", "Language3", "SpecialRequirement"],
        required: false
    }],
    records: [
        {
            type: Schema.Types.ObjectId,
            ref: Records,
        },
    ],
    type: {
        type: String,
        enum: ["이과", "문과", "예체능"],
        required: true
    },
    tuitionFee: {
        type: Number,
        required: [true, "Tuition fee information must be registered."]
    }

});

programSchema.index({ name: 'text' });

module.exports = mongoose.model("program", programSchema);
