const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * name: Name of the user
 * email: Email address of the user
 * password: Password of the user
 * admin: Admin status (default false)
 */

const userSchema = new Schema({
    name: {
        type: String,
        unique: true,
        required: [true, "Name is required for registeration"]
    },
    email: {
        type: String,
        required: [true, "Email is required for registeration"],
        unique: true,
        match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "This is not a valid email address"]
    },
    password: {
        type: String,
        required: [true, "Password is required for registeration"]
    },
    admin: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model("User", userSchema);
