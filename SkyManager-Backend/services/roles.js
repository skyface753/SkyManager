const db = require('./db');

let RoleService = {
    getRoles: async (req, res) => {
        const roles = await db.query("SELECT * FROM `rollen`");
        res.json(roles);
    },
}

module.exports = RoleService;