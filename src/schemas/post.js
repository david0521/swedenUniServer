const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * title: Title of the post 
 * author: The author that who wrote the post
 * timeStamp: The time the post was written
 * contentType: Type of the content
 * content: Content of the post
 */

const postSchema = new Schema ({
    title: {
        type: String,
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        required: true
    },
    timeStamp: {
        type: Date,
        required: true
    },
    contentType: {
        type: String,
        enum: ['administration', 'programReview', 'universityReview', 'question'],
        required: true
    },
    contentCategory: {
        type: String,
        enum: ['대학생활','학업', '학생문화']
    },
    content: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model("Post", postSchema);