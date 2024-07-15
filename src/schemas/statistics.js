const mongoose = require("mongoose");
const user = require('../schemas/user');
const Schema = mongoose.Schema;

const statisticBaseSchema = new Schema({
    dateOfCreation: {
        type: Date,
    }
});

const minMeritStats = new Schema({
    programName: {
        type: String,
        required: true
    },
    round: {
        type: String,
        enum: ['round1', 'round2'],
        required: true
    },
    selectionGroup: {
        type: String,
        enum: ['B1', 'B2', 'B1AV', 'B1BF', 'B2AV', 'B2BF'],
        required: true
    },
    score: {
        type: Number,
        required: true
    }
})

const programLikeStats = new Schema({
    programId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    numOfLikes: {
        type: Number,
        required: true
    }
})

const universityLikeStats = new Schema({
    universityName: {
        type: String,
        required: true
    },
    numOfLikes: {
        type: Number,
        required: true
    },
    user: [{
        type: Schema.Types.ObjectId,
        required: true
    }]
})

const StatisticBase = mongoose.model('StatisticBase', statisticBaseSchema);

const MinMeritStats = StatisticBase.discriminator('MinMeritStats', minMeritStats);
const ProgramLikeStats = StatisticBase.discriminator('ProgramLikeStats', programLikeStats);
const UniversityLikeStats = StatisticBase.discriminator('UniversityLikeStats', universityLikeStats);

module.exports = {
    StatisticBase,
    MinMeritStats,
    ProgramLikeStats,
    UniversityLikeStats
}
