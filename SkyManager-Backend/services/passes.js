const db = require('./db');
const config = require('../config');
const masterkey = config.masterkey.key;
console.log("Masterkey: " + masterkey);
let PassesService = {
    getPasses: async (req, res) => {
        var kundenID = req.body.kundenID;
        const passes = await db.query("SELECT `ID`, `Titel`, `Benutzername`, CAST(AES_DECRYPT(`Passwort`, '" + masterkey + "') AS CHAR) AS 'Passwort' FROM `kunden_passwoerter` WHERE `Kunden_FK` = '" + kundenID + "'");
        res.json(passes);
    },
    createPass: async (req, res) => {
        const { kundenID, Titel, Benutzername, Passwort } = req.body;
        await db.query("INSERT INTO `kunden_passwoerter` (`Kunden_FK`, `Titel`, `Benutzername`, `Passwort`) VALUES ('" + kundenID + "', '" + Titel + "', '" + Benutzername + "', AES_ENCRYPT('" + Passwort + "', '" + masterkey + "'))");
        res.setHeader('Content-Type', 'application/json');
        res.send("New Kundenpass: " + Titel);
    },
    deletePass: async (req, res) => {
        const { kundenPassID } = req.body;
        await db.query("DELETE FROM `kunden_passwoerter` WHERE `kunden_passwoerter`.`ID` = '" + kundenPassID + "'");
        res.send("Success");
    },
    editPass: async (req, res) => {
        const { kundenPassID, Titel, Benutzername, Passwort } = req.body;
        await db.query("UPDATE `kunden_passwoerter` SET `Titel` = '" + Titel + "', `Benutzername` = '" + Benutzername + "', `Passwort` = AES_ENCRYPT('" + Passwort + "', '" + masterkey + "') WHERE `kunden_passwoerter`.`ID` = '" + kundenPassID + "'");
        res.setHeader('Content-Type', 'application/json');
        res.send("Edit Kundenpass: " + Titel);
    }
}

module.exports = PassesService;