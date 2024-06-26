const crypto = require("crypto");

require('dotenv').config();

const encryption = process.env.ENCRYPTION_SECRET;

class encryptionHandler { 
    encrypt (data) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv("aes-256-cbc", encryption, iv);

        try {
            let encryptedData = cipher.update(data, "utf8", "hex");
            encryptedData += cipher.final("hex");
    
            return {
                iv: iv.toString("hex"),
                encryptedData
            };
        } catch (err) {
            return err;
        }
    }

    decrypt (data) {
        try {
            const decipher = crypto.createDecipheriv(
                "aes-256-cbc",
                encryption,
                Buffer.from(data.iv, "hex")
            );
    
            let decryptedData = decipher.update(data.encryptedData, "hex", "utf-8");
            decryptedData += decipher.final("utf-8");
    
            return decryptedData;

        } catch (err) {
            return err;
        }
    }
}

module.exports = {
    encryptionHandler
}