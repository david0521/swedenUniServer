const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * name: Name of the user
 * topic: Topic of the consent form
 * collectedData: Data collected from the consent
 * timestamp: Time when the consent was signed
 */

const consentFormSchema = new Schema({
    topic: {
        type: String,
        required: [true, "Consent topic is required"]
    },
    collectedData: [{
        type: String,
        required: [true, "Collected data is required"]
    }],
    timestamp: {
        type: Date,
        required: [true, "Timestamp is required"],
    }
});

module.exports = mongoose.model("ConsentForm", consentFormSchema);
