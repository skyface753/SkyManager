const db = require('./db');

let StateService = {
    getStates: async (req, res) => {
        const states = await db.query("SELECT * FROM `ticket_zustaende`");
        res.json(states);
    }
};

module.exports = StateService;