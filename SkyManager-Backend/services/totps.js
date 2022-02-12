const db = require('./db');

// ID, secret, issuer, algorithm, digits, period, customer_fk
let totpService = {
    getTotpPerCustomer: async(req, res) => {
        let customer_fk = req.body.customer_fk;
        let totpResult = await db.query('SELECT * FROM totp WHERE customer_fk = ?', [customer_fk]);
        res.json(totpResult);
    },
    createTotp: async(req, res) => {
        // ID, secret, issuer, algorithm, digits, period, customer_fk
        let totp = req.body;
        let totpResult = await db.query('INSERT INTO totp (ID, secret, issuer, algorithm, digits, period, customer_fk) VALUES (NULL, ?, ?, ?, ?, ?, ?)', [totp.secret, totp.issuer, totp.algorithm, totp.digits, totp.period, totp.customer_fk]);
        if(totpResult.affectedRows == 1) {
            res.send('Created');
        } else {
            res.send('Error');
        }
    },
    deleteTotp: async(req, res) => {
        let totp_id = req.body.totp_id;
        let totpResult = await db.query('DELETE FROM totp WHERE ID = ?', [totp_id]);
        res.send('Deleted');
    },
}

module.exports = totpService;