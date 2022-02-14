const db = require('./db');
const parser = require("otpauth-migration-parser");


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
    import: async(req, res) => {
        const dataUri = req.body.dataUri;
        const customer_fk = req.body.customer_fk;
        const parsedDataList = await parser(dataUri);
        var error = false;
        for (let otpSecretInfo of parsedDataList) {
            if(otpSecretInfo.type == 'hotp') {
                res.send('Error: HOTP not supported');
                return;
            }
            let totpImportResult = await db.query("INSERT INTO totp (ID, secret, issuer, algorithm, digits, period, customer_fk) VALUES (NULL, ?, ?, ?, ?, ?, ?)", [otpSecretInfo.secret, otpSecretInfo.issuer + " (" + otpSecretInfo.name + ")", otpSecretInfo.algorithm, otpSecretInfo.digits, "30", customer_fk]);
            if(totpImportResult.affectedRows != 1) {
                error = true;
            }
        }
        if(error) {
            res.send('Error');
        }else {
            res.send('Imported');
        }
    }
}

module.exports = totpService;