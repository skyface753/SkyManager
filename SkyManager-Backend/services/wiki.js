const db = require('./db');
const { isUserAdminExport } = require('./users');

//`ID` int(11) NOT NULL, `Titel` varchar(50) NOT NULL, `Text`

let WikiService = {
    getWiki: async (req, res) => {
        const wiki = await db.query("SELECT * FROM `wiki`");
        res.json(wiki);
    },
    getWikiByID: async (req, res) => {
        const wikiID = req.params.id;
        const wiki = await db.query("SELECT * FROM `wiki` WHERE ID = '" + wikiID + "'");
        res.json(wiki);
    },
    createWiki: async (req, res) => {
        let newWiki = req.body;
        await db.query("INSERT INTO `wiki` (`Titel`, `Text`) VALUES ('" + newWiki.title + "', '" + newWiki.text + "')");
        res.setHeader('Content-Type', 'application/json');
        res.send("Create Wiki #" + newWiki);
    },
    updateWiki: async (req, res) => {
        let updateWiki = req.body;
        
        await db.query("UPDATE `wiki` SET `Titel` = '?', `Text` = '?' WHERE `wiki`.`ID` = '?'", [updateWiki.title, updateWiki.text, updateWiki.wikiID]);
        res.setHeader('Content-Type', 'application/json');
        res.send("Updated Wiki #" + updateWiki.wikiID);
    },
    deleteWiki: async (req, res) => {
        if(!isUserAdminExport(req, res)){
            res.setHeader('Content-Type', 'application/json');
            res.send("You are not allowed to delete this entry!");
            return false;
        }
        const wikiID = req.body.wikiID;
        await db.query("DELETE FROM `wiki` WHERE wiki.ID = '" + wikiID + "'");
        res.setHeader('Content-Type', 'application/json');
        res.send("Delete Wiki #" + wikiID);
    }
}

module.exports = WikiService;