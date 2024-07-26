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
    content: {
        type: String,
        required: true
    },
    likes: {
        type: Number,
        default: 0
    }
})

const programPost = new Schema ({
    programName: {
        type: String,
        required: true
    },
    contentCategory: {
        type: String,
        enum: ['학과생활', '학업', '학생문화', '지원과정']
    }
})

const uniPost = new Schema ({
    uniName: {
        type: String,
        required: true
    },
    contentCategory: {
        type: String,
        enum: ['대학생활', '캠퍼스', '학생문화']
    }
})

const PostSchema = mongoose.model('PostSchema', postSchema);

const ProgramPost = PostSchema.discriminator('ProgramPost', programPost);
const UniversityPost = PostSchema.discriminator('UniversityPost', uniPost);

module.exports = {
    PostSchema,
    ProgramPost,
    UniversityPost
}