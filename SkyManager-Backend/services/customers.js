const db = require('./db');
const UserService = require('./users');

let CustomerService = {
    getCustomer: async (req, res) => {
        const customers = await db.query("SELECT `ID`, `Name`, `mail`, `PLZ`, `Stadt`, `Strasse`, `Hausnummer`, `isActive` FROM `kunden` WHERE `isActive` = 1");
        res.json(customers);
    },
    getAllCustomers: async (req, res) => {
        const customers = await db.query("SELECT `ID`, `Name`, `mail`, `PLZ`, `Stadt`, `Strasse`, `Hausnummer`, `isActive` FROM `kunden`");
        res.json(customers);
    },
    getArchivedCustomers: async (req, res) => {
        const customers = await db.query("SELECT `ID`, `Name`, `mail`, `PLZ`, `Stadt`, `Strasse`, `Hausnummer`, `isActive` FROM `kunden` WHERE `isActive` = 0");
        res.json(customers);
    },
    createCustomer: async (req, res) => {
        const { Name, mail, PLZ, Stadt, Strasse, Hausnummer } = req.body;
        await db.query("INSERT INTO `kunden` (`isActive`, `Name`, `mail`, `PLZ`, `Stadt`, `Strasse`, `Hausnummer`) VALUES ('" + 1 + "', '" + Name + "', '" + mail + "', '" + PLZ + "', '" + Stadt + "', '" + Strasse + "', '" + Hausnummer + "')");
        res.setHeader('Content-Type', 'application/json');
        res.send("New Kunde" + Name);
    },
    archiveCustomer: async (req, res) => {
        if(await UserService.isUserAdminExport(req, res)){
            const { kundenID } = req.body;
            await db.query("UPDATE `kunden` SET `isActive` = '0' WHERE `kunden`.`ID` = '" + kundenID + "'");
            res.setHeader('Content-Type', 'application/json');
            res.send("ArchiveKunde" + kundenID);
        }
    },
    reActivateCustomer: async (req, res) => {
        if(await UserService.isUserAdminExport(req, res)){
            const { kundenID } = req.body;
            await db.query("UPDATE `kunden` SET `isActive` = '1' WHERE `kunden`.`ID` = '" + kundenID + "'");
            res.setHeader('Content-Type', 'application/json');
            res.send("ReActivated");
        }else{
            res.setHeader('Content-Type', 'application/json');
            res.send("Not Authorized");
        }
    },
    editCustomer: async (req, res) => {
        const { kundenID, Name, mail, PLZ, Stadt, Strasse, Hausnummer } = req.body;
        await db.query("UPDATE `kunden` SET `Name` = '" + Name + "', `mail` = '" + mail + "', `PLZ` = '" + PLZ + "', `Stadt` = '" + Stadt + "', `Strasse` = '" + Strasse + "', `Hausnummer` = '" + Hausnummer + "' WHERE `kunden`.`ID` = '" + kundenID + "'");
        res.setHeader('Content-Type', 'application/json');
        res.send("EditKunde" + kundenID);
    }
}

module.exports = CustomerService;