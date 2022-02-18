// secret, issuer, algorithm, digits, period, customer_fk
/**
 * @openapi
 * components:
 *   schemas:
 *     Totp:
 *       type: object
 *       required:
 *         - secret
 *         - issuer
 *         - algorithm
 *         - digits
 *         - period
 *         - customer_fk
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the Totp.
 *         secret:
 *           type: string
 *           description: The secret of the totp.
 *         issuer:
 *           type: string
 *           description: The issuer of the totp.
 *         algorithm:
 *          type: string
 *          description: The algorithm of the totp.
 *         digits:
 *          type: integer
 *          description: The digits of the totp.
 *         period:
 *          type: integer
 *          description: The period of the totp.
 *         customer_fk:
 *          type: integer
 *          description: The primary key of the customer.
 *       example:
 *          secret: 'HXDMVJECJJWSRB3HWIZR4IFUGFTMXBOZ'
 *          issuer: 'admin@SkyManager'
 *          algorithm: 'SHA1'
 *          digits: 6
 *          period: 30
 *          customer_fk: 1
 */
/**
 * @openapi
 * tags:
 *   name: Totp
 *   description: Totp management
 */
/**
 * @openapi
 * paths:
 *  /totps/:
 *    post:
 *     summary: Get all totps of a customer
 *     tags: [Totp]
 *     requestBody:
 *      required: true
 *      content:
 *       application/x-www-form-urlencoded:
 *        schema:
 *         type: object
 *         properties:
 *          customer_fk:
 *           type: integer
 *           example: 1
 *     responses:
 *      "200":
 *       description: A successful response
 *       content:
 *        application/json:
 *         schema:
 *          $ref: '#/components/schemas/Totp'
 *  /totps/create:
 *   post:
 *    summary: Create a new totp for a customer
 *    tags: [Totp]
 *    requestBody:
 *     required: true
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/Totp'
 *    responses:
 *     "200":
 *      description: A successful response
 *      content:
 *       text/plain:
 *        schema:
 *         type: string
 *         example: 'Created'
 *  /totps/delete:
 *   post:
 *    summary: Delete a totp
 *    tags: [Totp]
 *    requestBody:
 *      required: true
 *      content:
 *       application/x-www-form-urlencoded:
 *        schema:
 *         type: object
 *         properties:
 *          totp_id:
 *           type: integer
 *           example: 1
 *    responses:
 *     "200":
 *      description: A successful response
 *      content:
 *       text/plain:
 *        schema:
 *         type: string
 *         example: 'Deleted'
 *  /totps/import:
 *   post:
 *    summary: Import a bunch of totps
 *    tags: [Totp]
 *    requestBody:
 *      required: true
 *      content:
 *       application/x-www-form-urlencoded:
 *        schema:
 *         type: object
 *         properties:
 *          dataUri:
 *           type: string
 *           example: 'otpauth-migration://offline?data=CiQKChkAMJCF7zetb50SEmdpdGh1Yi5jb206YnJvb2tzdBoCbWUQARgBKAE%3D'
 *          customer_fk:
 *           type: integer
 *           example: 1
 *    responses:
 *     "200":
 *      description: A successful response
 *      content:
 *       text/plain:
 *        schema:
 *         type: string
 *         example: 'Imported'
 */

// END API Documentation

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
            // Check if otpSecretInfo.algorithm is not null
            if ( otpSecretInfo.algorithm == 'unspecified' || otpSecretInfo.algorithm == null ) {
                console.log("Replace otpSecretInfo.algorithm with 'SHA1'");
                otpSecretInfo.algorithm = 'SHA1';
            }
            // Check if otpSecretInfo.digits is not null
            if ( otpSecretInfo.digits == 'unspecified' || otpSecretInfo.digits == null ) {
                otpSecretInfo.digits = 6;
            }

            let totpImportResult = await db.query("INSERT INTO totp (ID, secret, issuer, algorithm, digits, period, customer_fk) VALUES (NULL, ?, ?, ?, ?, ?, ?)", [otpSecretInfo.secret, otpSecretInfo.issuer + " (" + otpSecretInfo.name + ")", otpSecretInfo.algorithm , otpSecretInfo.digits, "30", customer_fk]);
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
};

module.exports = totpService;