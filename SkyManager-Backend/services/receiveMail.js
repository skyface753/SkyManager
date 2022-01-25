
const config = require('../config');
const imapOptions = config.imapMail;
var imaps = require('imap-simple');
const simpleParser = require('mailparser').simpleParser;
const _ = require('lodash');
const db = require('./db');

async function receiveMail(callback) {
    try{
    var config = {
        imap: {
            user: imapOptions.user,
            password: imapOptions.password,
            host: imapOptions.host,
            port: imapOptions.port,
            tls: imapOptions.tls,
            authTimeout: 3000
        }
    }
    imaps.connect(config).then(function (connection) {

        return connection.openBox('INBOX').then(function () {
            var searchCriteria = [
                'UNSEEN'
            ];
    
            var fetchOptions = {
                bodies: ['HEADER', 'TEXT', ''],
                markSeen: true
            };

            return connection.search(searchCriteria, fetchOptions).then(function (messages) {
                if(messages.length == 0 && process.env.MODE == "TEST"){
                    console.log("No new mail");
                }
                messages.forEach(async function (item) {
                    var all = _.find(item.parts, { "which": "" })
                    var id = item.attributes.uid;
                    var idHeader = "Imap-Id: "+id+"\r\n";
                    simpleParser(idHeader+all.body, (err, mail) => {
                        // mail.text, mail.subject
                        // access to the whole mail object
                        console.log("MAIL: " + JSON.stringify(mail));
                        console.log("Sender: " + mail.from.value[0].address);
                    });
                });
            });
        });
    });

    

    }catch(err){
        console.log("IMAP ERROR: " + err);
    }

}

async function createTicketFromMail(mail){
    var customer = await db.query("SELECT `ID` FROM `kunden` WHERE `isActive` = 1 AND `email` = ?", [mail.from.value[0].address]);
    if(customer.length == 1){
        var result = db.query("INSERT INTO `ticket_tickets`(`Kunden_FK`, `Titel`, `Beschreibung`, `Zustand_FK`, `User_FK`) VALUES ('" + customer[0].ID + "', '" + mail.subject + "', '" + mail.text + "', '" + 1 + "', '" + "admin" + "')");
    }else{if(process.env.MODE == "TEST"){console.log("No customer found for mail: " + mail.from.value[0].address);}}
}


module.exports = {
    receiveMail
}