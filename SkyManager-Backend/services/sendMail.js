const nodemailer = require("nodemailer");
const config = require('../config');
const smtpOptions = config.smtpMail;
const frontendURL = config.frontendURL;
async function sendMail(recipient, subject, text, ticketID) {
    if(smtpOptions.host == ""){
        console.log("No SMTP Host configured")
        return;
    }
    if(recipient == "skymanager@example.de"){
        console.log("No recipient configured")
        return;
    }
    try{
        text += '\n\n<br><a href="https://skymanager.page.link?ticketID=' + ticketID + '">Open Ticket in Android-APP</a>'
        text += '\n\n<br><a href="sky://manager?ticketID=' + ticketID + '">Open Ticket in IOS-APP</a>'
        if(frontendURL != null){
            text += '<br><a href="' + frontendURL + '?ticketID=' + ticketID + '">Open Ticket in Web</a>'
        }
        text += "\n\nTicket-ID: " + ticketID;
        text += "\n\nSkyManager-Team";
        let transporter = nodemailer.createTransport({
            host: smtpOptions.host,
            port: smtpOptions.port,
            secure: smtpOptions.secure,
            auth: {
                user: smtpOptions.auth.user,
                pass: smtpOptions.auth.pass
            }
        });
        
        let info = await transporter.sendMail({
            from: '"SkyManager" ' + '<' + smtpOptions.sender + '>', // sender address
            to: recipient, // list of receivers
            subject: subject, // Subject line
            // text: text, // plain text body
            html: "<b>" + text + "</b>" // html body
        });
        
        console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
        
    }catch(err){
        console.log("SendMail-Error:" + err);
    }
}
    
module.exports = {
    sendMail
}