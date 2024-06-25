const nodemailer = require('nodemailer');

const mailPort = process.env.MAIL_PORT;
const host = process.env.MAIL_HOST;
const hostEmail = process.env.HOST_EMAIL;
const hostID = process.env.HOST_ID;
const password = process.env.HOST_PASSWORD;

const transporter = nodemailer.createTransport({
    service: "naver",
    host: host,
    port: mailPort,
    auth: {
        user: hostID,
        pass: password
    }
})

require('dotenv').config()

const sendResetLink = ({ resetToken, email }) => {
    let link = `http://localhost:3000/api/users/resetPassword/emailVerify/${resetToken}`;
    let html =
        `<p>비밀번호 변경을 요청하셨습니다. 다음 링크를 눌러 비밀번호를 변경하기를 요청드립니다. <p>
         <a href="${link}">${link}</a>`;
    
    const mailOptions = {
        from: hostEmail,
        to: email,
        subject: "스웨대학 비밀번호 변경 요청",
        html: html
    }

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log(err);
            return {
                error: true,
            }
        } else {
            console.log('Message sent: %s', info.messageId);
            console.log(email);
            console.log(link)
            return {
                error: false,
            }
        }
    });
}

module.exports = {
    sendResetLink
}