var { writeFileSync, existsSync, readFileSync, unlink } = require('fs');

class LocalStorage {
    constructor() {
        if (existsSync('localStorage.json')) {
            var txt = readFileSync('localStorage.json');
            this.items = JSON.parse(txt);
        } else {
            this.items = {};
        }
    }

    // Retreive the items by using the key
    getItem(key) {
        return this.items[key];
    }

    // Save an item in the local storage by using the key, value pair.
    async setItem(key, value) {
        this.items[key] = value;
        this.writeItemsToLocalStorage();
    }

    // Remove an existing item in the local storage by using the key
    async removeItem(key) {
        delete this.items[key];
        this.writeItemsToLocalStorage();
    }

    // Save the item to the local storage json file.
    writeItemsToLocalStorage() {
        try {
            writeFileSync('localStorage.json', JSON.stringify(this.items));
        } catch (err) {
            console.error('Error occurred during writing file', err);
        }
    }
}

const localStorageHandler = new LocalStorage();

module.exports = {
    localStorageHandler
}