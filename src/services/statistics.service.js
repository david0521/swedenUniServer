const Records = require("../schemas/records.js");
const { MinMeritStats } = require("../schemas/statistics.js");

async function selectionGroupAvg(programName, selectionGroup, round) {
    try {
        let avgScore = 0;
        const records = await Records.find({ programName: programName, round: round, selectionGroup: selectionGroup });
        const numOfRecords = records.length;

        if (numOfRecords.length === 0) {
            avgScore = 0;
        }

        else {
            for (let record of records) {
                avgScore += record.minScore;
            }
            avgScore = avgScore / numOfRecords;
        }

        const minScore = await MinMeritStats.findOne({ programName: programName, round: round, selectionGroup: selectionGroup });
        
        if (minScore) {
            await minScore.deleteOne();
        }

        const newMinScore = new MinMeritStats ({
            dateOfCreation: new Date(),
            programName: programName,
            round: round,
            selectionGroup: selectionGroup,
            score: avgScore
        })

        await newMinScore.save();



    } catch (error) {
        console.error('Error fetching records:', error);
        throw error;
    }
}

module.exports = {
    selectionGroupAvg
}