const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * name: Name of the user
 * email: Email address of the user
 * password: Password of the user
 * admin: Admin status (default false)
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
    },
    signature: {
        type: String
    }
});

module.exports = mongoose.model("ConsentForm", consentFormSchema);
