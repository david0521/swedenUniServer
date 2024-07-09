const Records = require("../schemas/records.js");

async function selectionGroupAvg(programName, selectionGroup) {
    try {
        let avgScore = 0;
        const records = await Records.find({ programName: programName, selectionGroup: selectionGroup });
        const numOfRecords = records.length;

        if (numOfRecords.length === 0) {
            return 0;
        }

        else {
            for (let record of records) {
                avgScore += record.minScore;
            }
            return avgScore / numOfRecords;
        }
    } catch (error) {
        console.error('Error fetching records:', error);
        throw error;
    }
}
