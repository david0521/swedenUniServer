const mongoose = require('mongoose');
const Fuse = require('fuse.js');
const University = require('../schemas/university')
const Program = require('../schemas/program')

const options = {
    keys: ['name'],
    threshold: 0.3
}

async function searchUniversity(query) {
    try {
        const mongoResults = await University.find({ $text: { $search: query } });

        if (mongoResults.length === 0) {
            return [];
        }

        const fuse = new Fuse(mongoResults, options);
        const results = fuse.search(query);
        return results.map(r => r.item);
    } catch (err) {
        console.error(err);
    }
}

async function searchProgram(query) {
    try {
        const mongoResults = await Program.find({ $text: { $search: query } });

        if (mongoResults.length === 0) {
            return [];
        }

        const fuse = new Fuse(mongoResults, options);
        const results = fuse.search(query);
        return results.map(r => r.item);
    } catch (err) {
        console.error(err);
    }
}



module.exports = { searchUniversity, searchProgram };