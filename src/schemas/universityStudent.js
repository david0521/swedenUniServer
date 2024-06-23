const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userModel = require("./user");
const Programs = require("./program");
const Universities = require("./university")
/**
 * studyingProgram: Program that the student is studying
 * studyingUniversity: University that the student is studying at
 */

const universityStudentSchema = new Schema({
    studyingProgram:
    {
        type: Schema.Types.ObjectId,
        ref: Programs
    },
    studyingUniversity:
    {
        type: Schema.Types.ObjectId,
        ref: Universities
    }
});

userModel.discriminator('universityStudent', universityStudentSchema);
module.exports = mongoose.model('universityStudent');
