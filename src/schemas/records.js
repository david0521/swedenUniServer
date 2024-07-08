const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * programCode: The program code of the record.
 * minScore: The minimum score that was required to enter the program
 * numOfApplicants: The number of applicants for the following selection.
 * numOfQualified: The number of applicants who met the prerequisites for the following selection.
 * acceptedApplicants: The number of applicants accepted per selection group.
 * year: The year of admission.
 * selection: The type of selection between selection group 1, and selection group 2.
 * selectionGroup: The type of selection group.
 */

const recordSchema = new Schema ({
    programName: {
        type: String,
        required: [true, "Program name must be registered."]
    },
    minScore: {
        type: Number,
        required: [true, "Minimum score is required."]
    },
    numOfApplicants: {
        type: Number,
        required: [true, "Number of applicants is required."]
    },
    numOfQualified: {
        type: Number,
        required: [true, "Number of qualified applicants is required."]
    },
    acceptedApplicants: {
        type: Number,
        required: [true, "Number of accepted applicants is required."]
    },
    year: {
        type: Number,
        required: [true, "Year of admission needs to be specified."]
    },
    numOfFirstChoice: {
        type: Number
    },
    round: {
        type: String,
        enum : ['round1','round2'],
        required: [true, "Round needs to be specified."]
    },
    selection: {
        type: String,
        enum: ['selection1', 'selection2'],
        required: [true, 'Selection period needs to be specified']
    },
    selectionGroup: {
        type: String,
        enum: ['B1', 'B2', 'B1AV', 'B1BF', 'B2AV', 'B2BF'],
        required: [true, "Selection group needs to be specified."]
    }
})

module.exports = mongoose.model("Record", recordSchema);