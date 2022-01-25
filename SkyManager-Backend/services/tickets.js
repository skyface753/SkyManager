const db = require('./db');
const UserService = require('./users');
const MailService = require('./sendMail');
const config = require('../config');
let ticketsService = {
    getTickets: async (req, res) => {
        const tickets = await db.query("SELECT ticket_tickets.ID, ticket_tickets.Titel, ticket_tickets.Beschreibung, kunden.Name AS 'Kundenname', user.Name AS 'Zuständig', ticket_zustaende.Name AS 'Zustand' FROM ticket_tickets INNER JOIN kunden ON kunden.ID=ticket_tickets.Kunden_FK INNER JOIN user ON user.Name=ticket_tickets.User_FK INNER JOIN ticket_zustaende ON ticket_zustaende.ID = ticket_tickets.Zustand_FK WHERE NOT ticket_tickets.Zustand_FK='3' AND kunden.isActive = 1 ORDER BY `ticket_tickets`.`ID` DESC");
        res.json(tickets);
    },
    getMyTickets: async (req, res) => {
        const userID = await UserService.getUsername(req, res);
        const tickets = await db.query("SELECT ticket_tickets.ID, ticket_tickets.Titel, ticket_tickets.Beschreibung, kunden.Name AS 'Kundenname', user.Name AS 'Zuständig', ticket_zustaende.Name AS 'Zustand' FROM ticket_tickets INNER JOIN kunden ON kunden.ID=ticket_tickets.Kunden_FK INNER JOIN user ON user.Name=ticket_tickets.User_FK INNER JOIN ticket_zustaende ON ticket_zustaende.ID = ticket_tickets.Zustand_FK WHERE NOT ticket_tickets.Zustand_FK='3' AND kunden.isActive = 1 AND ticket_tickets.User_FK = '" + userID + "' ORDER BY `ticket_tickets`.`ID` DESC");
        res.json(tickets);
    },
    getAllTickets: async (req, res) => {
        const tickets = await db.query("SELECT ticket_tickets.ID, ticket_tickets.Titel, ticket_tickets.Beschreibung, kunden.Name AS 'Kundenname', user.Name AS 'Zuständig', ticket_zustaende.Name AS 'Zustand' FROM ticket_tickets INNER JOIN kunden ON kunden.ID=ticket_tickets.Kunden_FK INNER JOIN user ON user.Name=ticket_tickets.User_FK INNER JOIN ticket_zustaende ON ticket_zustaende.ID = ticket_tickets.Zustand_FK ORDER BY `ticket_tickets`.`ID` DESC");
        res.json(tickets);
    },
    createTicket: async (req, res) => {
        const currentUser = await UserService.getUsername(req, res);
        const { ticketTitle, ticketBeschreibung, kundenID, zustaendigID, zustandID } = req.body;
        if(!checkForEmtpyImput(ticketTitle, ticketBeschreibung, kundenID, zustaendigID, zustandID)) {
            res.send("Bitte alle Felder ausfüllen!");
            return;
        }
        var result = await db.query("INSERT INTO `ticket_tickets`(`Kunden_FK`, `Titel`, `Beschreibung`, `Zustand_FK`, `User_FK`) VALUES ('" + kundenID + "', '" + ticketTitle + "', '" + ticketBeschreibung + "', '" + zustandID + "', '" + zustaendigID + "')");
        var ticketID = result.insertId;
        if(currentUser != zustaendigID) {
            const mail = await db.query("SELECT user.Email FROM user WHERE user.Name = '" + zustaendigID + "'");
            const mailAdress = mail[0].Email;
            const mailSubject = "Neues Ticket: " + ticketID + " - " + ticketTitle;
            const mailBody = "Hello " + zustaendigID + ",\n\n" + currentUser + " created a new ticket.\n\nTicket-ID: " + ticketID + "\nTicket-Titel: " + ticketTitle + "\nTicket-Beschreibung: " + ticketBeschreibung;
            MailService.sendMail(mailAdress, mailSubject, mailBody, ticketID);
        }
        res.setHeader('Content-Type', 'application/json');
        res.send("New Ticket: " + ticketTitle);    
    },
    getDetails: async (req, res) => {
        var ticketID = req.body.ticketID;
        if(!checkForEmtpyImput(ticketID)) {
            res.send("Bitte alle Felder ausfüllen!");
            return;
        }
        const ticketDetails = await db.query("SELECT ticket_tickets.ID, ticket_tickets.Titel, ticket_tickets.Beschreibung, kunden.Name AS 'Kundenname', ticket_tickets.Kunden_FK, user.Name AS 'Zuständig', ticket_zustaende.Name AS 'Zustand', ticket_tickets.User_FK, ticket_tickets.Zustand_FK FROM ticket_tickets INNER JOIN kunden ON kunden.ID=ticket_tickets.Kunden_FK INNER JOIN user ON user.Name=ticket_tickets.User_FK INNER JOIN ticket_zustaende ON ticket_zustaende.ID = ticket_tickets.Zustand_FK WHERE ticket_tickets.ID = '" + ticketID + "'");
        res.json(ticketDetails);
    },
    updateDetails: async (req, res) => {
        const currentUser = await UserService.getUsername(req, res);
        const { ticketID, ticketTitle, ticketBeschreibung, kundenID, zustaendigID, zustandID } = req.body;
        if(!checkForEmtpyImput(ticketID, ticketTitle, ticketBeschreibung, kundenID, zustaendigID, zustandID)) {
            res.send("Bitte alle Felder ausfüllen!");
            return;
        }
        const presentZustaendig = await db.query("SELECT User_FK FROM ticket_tickets WHERE ID = '" + ticketID + "'");
        await db.query("UPDATE `ticket_tickets` SET `Kunden_FK` = '" + kundenID + "', `Titel` = '" + ticketTitle + "', `Beschreibung` = '" + ticketBeschreibung + "', `Zustand_FK` = '" + zustandID + "', `User_FK` = '" + zustaendigID + "' WHERE `ticket_tickets`.`ID` = '" + ticketID + "'");
        if(currentUser != zustaendigID){
            const mail = await db.query("SELECT user.Email FROM user WHERE user.Name = '" + zustaendigID + "'");
            const mailAdress = mail[0].Email;
            var mailSubject = "";
            var mailBody = "";
            
            if(presentZustaendig[0].User_FK != zustaendigID){
                mailSubject = "#" + ticketID + " '" + ticketTitle + "' was assigned to you by " + currentUser;
                mailBody = '#' + ticketID + ' "' + ticketTitle + '" was assigned to you by ' + currentUser;
            }else{
                mailSubject = "#" + ticketID + " '" + ticketTitle + "' was edited by " + currentUser;
                mailBody = "Hello " + zustaendigID + ",\n\n" + currentUser + " edited the ticket '" + ticketTitle + "'.\n\n" + "Description: " + ticketBeschreibung + "\n\n" + "State: " + zustandID + "\n\n" + "Customer: " + kundenID;
            }
            MailService.sendMail(mailAdress, mailSubject, mailBody, ticketID);
        }
        res.setHeader('Content-Type', 'application/json');
        res.send("Updated Ticket #" + ticketID);
    }

}

function checkForEmtpyImput(...args) {
    for(var i = 0; i < args.length; i++) {
        if(args[i] == "") {
            return false;
        }
    }
    return true;
}

module.exports = ticketsService;


