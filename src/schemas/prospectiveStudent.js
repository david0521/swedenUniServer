const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userModel = require("./user");
const Programs = require("./program");
const Universities = require("./university")
/**
 * meritPoint: Merit point that the student has received from UHR
 * prerequisite: Prerequisites met by the prospective student
 * interestedPrograms: Programs that the prospective student is interested in
 * interestedUniversities: Universities that the prospective student is interested in
 */

const prospectiveStudentSchema = new Schema({
    meritPoint: {
        type: Number,
        required: false,

    },
    prerequisite: [{
        type: String,
        enum: ["Math3B", "Math4", "Math5", "Physics1A", "Physics2", "Chemistry1", "Chemistry2", "Biology1", "Biology2", "Science2", "Civics1B", "History1B", "Language3", "SpecialRequirement"],
        required: false
    }],
    interestedPrograms: [
        {
            type: Schema.Types.ObjectId,
            ref: Programs
        }
    ],
    interestedUniversities: [
        {
            type: Schema.Types.ObjectId,
            ref: Universities
        }
    ]
});

userModel.discriminator('prospectiveStudent', prospectiveStudentSchema);
module.exports = mongoose.model('prospectiveStudent');
