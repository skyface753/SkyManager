const db = require('./db');
const userService = require('./users');
const MailService = require('./sendMail');

let EntryService = {
    deleteEntry: async (req, res) => {
        const ticketEintragID = req.body.ticketEintragID;
        var userID = await userService.getUsername(req);
        var entryUser = await db.query("SELECT User_FK FROM `ticket_eintraege` WHERE ID = '" + ticketEintragID + "'");
        if (entryUser[0].User_FK != userID) {
            res.send("You are not allowed to delete this entry!");
            return;
        } 
        await db.query("DELETE FROM `ticket_eintraege` WHERE ticket_eintraege.ID = '" + ticketEintragID + "'");
        res.setHeader('Content-Type', 'application/json');
        res.send("Delete Eintrag #" + ticketEintragID);
    },
    createEntry: async (req, res) =>{
        let { ticketID, newEintrag, newArbeitszeit } = req.body;
        newArbeitszeit = newArbeitszeit.replace(/,/g, '.');
        var userID = await userService.getUsername(req, res);
        await db.query("INSERT INTO `ticket_eintraege` (`Ticket_FK`, `User_FK`, `Beschreibung`, `Arbeitszeit`, `Datum`, `Zeit`) VALUES ('" + ticketID + "', '" + userID + "', '" + newEintrag + "' , '" + newArbeitszeit + "', CURRENT_DATE(), CURRENT_TIME())");
        res.setHeader('Content-Type', 'application/json');
        res.send("Updated Ticket #" + ticketID);
    },
    updateEntry: async (req, res) => {
        let { ticketEintragID, newEintrag, newArbeitszeit } = req.body;
        var userID = await userService.getUsername(req);
        var entryUser = await db.query("SELECT User_FK FROM `ticket_eintraege` WHERE ID = '" + ticketEintragID + "'");
        if (entryUser[0].User_FK != userID ) {
            res.send("You are not allowed to update this entry!");
            return;
        }
        newArbeitszeit = newArbeitszeit.replace(/,/g, '.');
        await db.query("UPDATE `ticket_eintraege` SET `Beschreibung` = '" + newEintrag + "', `Arbeitszeit` = '" + newArbeitszeit + "' WHERE `ticket_eintraege`.`ID` = '" + ticketEintragID + "'");
        res.setHeader('Content-Type', 'application/json');
        res.send("Updated Eintrag #" + ticketEintragID);
    },
    getEntries: async (req, res) =>{
        var ticketID = req.body.ticketID;
        const entries = await db.query("SELECT ticket_eintraege.ID, ticket_eintraege.Beschreibung, user.Name AS Username, ticket_eintraege.Arbeitszeit FROM `ticket_eintraege` INNER JOIN user ON user.Name = ticket_eintraege.User_FK WHERE ticket_eintraege.Ticket_FK = '" + ticketID + "'");
        res.json(entries);
    },
    createEntryWithSendMail: async (req, res) => {
        let { ticketID, newEintrag, newArbeitszeit, mailRecipient } = req.body;
        newArbeitszeit = newArbeitszeit.replace(/,/g, '.');
        var userID = await userService.getUsername(req);
        await db.query("INSERT INTO `ticket_eintraege` (`Ticket_FK`, `User_FK`, `Beschreibung`, `Arbeitszeit`, `Datum`, `Zeit`) VALUES ('" + ticketID + "', '" + userID + "', 'Mail an: " + mailRecipient + ": " + newEintrag + "' , '" + newArbeitszeit + "', CURRENT_DATE(), CURRENT_TIME())");
        MailService.sendMail(mailRecipient, "Mail from Ticket #" + ticketID, newEintrag, ticketID);
        res.setHeader('Content-Type', 'application/json');
        res.send("SendMail for Ticket #" + ticketID);
    },
}

// async function isUserOwner(ticketEintragID, req)
// {
//     var userID = userService.getUsername(req);
//     var entryUser = await db.query("SELECT User_FK FROM `ticket_eintraege` WHERE ID = '" + ticketEintragID + "'");
//     if(userID != entryUser[0].User_FK){
//         return false;
//     }
//     return true;
// }

module.exports = EntryService;