const processPrerequisites = (requestedPrerequisites) => {
    const validPrerequisites = ["Math3B", "Math4", "Math5", "Physics1A", "Physics2", "Chemistry1", "Chemistry2", "Biology1", "Biology2", "Science2", "Civics1B", "History1B", "Language3", "SpecialRequirement"];
    
    const prerequisiteMap = {
        "Math4": ["Math3B"],
        "Math5": ["Math3B", "Math4"],
        "Physics2": ["Physics1A", "Science2"],
        "Chemistry2": ["Chemistry1", "Science2"],
        "Biology2": ["Biology1", "Science2"]
    };

    const expandPrerequisites = (prerequisites) => {
        const expandedSet = new Set(prerequisites);

        for (const prerequisite of prerequisites) {
            if (prerequisiteMap[prerequisite]) {
                prerequisiteMap[prerequisite].forEach(dep => expandedSet.add(dep));
            }
        }

        const initialSize = expandedSet.size;
        if (initialSize > prerequisites.length) {
            return expandPrerequisites(Array.from(expandedSet));
        } else {
            return Array.from(expandedSet);
        }
    };

    const prerequisitesSet = new Set(Array.isArray(requestedPrerequisites) ? requestedPrerequisites : [requestedPrerequisites]);
    const expandedPrerequisites = expandPrerequisites(Array.from(prerequisitesSet));
    const invalidPrerequisites = expandedPrerequisites.filter(prerequisite => !validPrerequisites.includes(prerequisite));

    return { prerequisitesArray: expandedPrerequisites, invalidPrerequisites };
};

module.exports = {
    processPrerequisites
}