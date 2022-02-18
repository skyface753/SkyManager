/**
 * @swagger
 * components:
 *  schemas:
 *   User:
 *    type: object
 *    required:
 *     - Name
 *     - Passwort
 *     - email
 *     - role_fk
 *     - isActive
 *    properties:
 *     Name:
 *      type: string
 *      description: The unique username of the user. (Primary Key)
 *     Passwort:
 *      type: string
 *      description: The password of the user. (bcrypt hashed)
 *     email:
 *      type: string
 *      description: The email of the user.
 *     LastLogin_Date:
 *      type: date
 *      description: The date of the last login of the user.
 *     LastLogin_Time:
 *      type: time
 *      description: The time of the last login of the user.
 *     role_fk:
 *      type: string
 *      description: The role of the user.
 *     isActive:
 *      type: int
 *      description: The status of the user. (0 = inactive, 1 = active)
 */
/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management
 */
/**
 * @swagger
 * paths:
 *  /login/:
 *    post:
 *     summary: Login a user
 *     tags: [User]
 *     requestBody:
 *      required: true
 *      content:
 *       application/x-www-form-urlencoded:
 *        schema:
 *         type: object
 *         properties:
 *          username:
 *           type: string
 *           example: 'admin'
 *          password:
 *           type: string
 *           example: 'SkyManager'
 *          stayLoggedIn:
 *           type: boolean
 *           example: false
 *     responses:
 *      "200":
 *       description: A successful response
 *       content:
 *        application/json:
 *         schema:
 *          type: object
 *          properties:
 *           token:
 *            type: string   
 *  /users/:
 *   post:
 *    summary: Gets all users
 *    tags: [User]
 *    responses:
 *     "200":
 *     description: A successful response
 *     content:
 *      application/json:
 *       schema:
 *        #ref: '#/components/schemas/User'   
 */
const backendVersion = "1.0.0";

const db = require('./db');
const jwt = require("jsonwebtoken");
const inputCheck = require('../helpers/inputCheck');
// const jwtKey = "my_secret_key";
const jwtExpirySeconds = 3000 ;
const jwtExpirySeconds30Days = 2592000;
const bcrypt = require('bcrypt');
var authenticator = require('authenticator');
const saltRounds = 10;

const jwtKeyGenerator = require('./jwtKey');
const jwtKey = jwtKeyGenerator.jwtKey;

const config = require('../config');
const sendMailEnabled = config.smtpMail.host ? true : false;
//Frontend Url from config. Else set to null
const frontendUrl = config.frontendURL ? config.frontendURL : null;

// 400 Bad Request - Invalid Input  // Logout
// 401 Unauthorized (Token Expired) //Retry Login
// 403 Forbidden (User is not an Admin)


let userService = {
    getAllUsers: async (req, res) => {
        const users = await db.query("SELECT `user`.`Name`, `user`.`email`, `user`.`LastLogin_Date`, `user`.`LastLogin_Time`, `user`.`role_fk`, `user`.`isActive` FROM `user`");
        res.json(users);
    },
    changePassword: async (req, res) => {
        if(process.env.MODE == "DEMO"){
            res.sendStatus(403);
            return;
        }
        const { username, newPassword } = req.body;
        if(! (await isUserAnAdmin(req, res))){
            if(getUsernameFromToken(req, res) == username){
            }else{
                res.send("Current User isn't Admin");
                return;
            }
        }
        if(newPassword.length < 6){
            res.send("Password must be at least 6 characters long");
            return;
        }
        bcrypt.hash(newPassword, saltRounds, async function(err, hashedPassword) {
            await db.query("UPDATE `user` SET `Passwort` = '" + hashedPassword + "' WHERE `user`.`Name` = '" + username + "'");
            res.send("Changed Password: " + username);
        });
    
    },
    changeRole: async (req, res) => {
        if(!(await isUserAnAdmin(req, res))){
            res.send("Current User isn't Admin"); 
            return;
        }
        const { newRole, username } = req.body;
        if(username == "admin"){
            res.send("Admin can't be changed");
            return;
        }
        await db.query("UPDATE `user` SET `role_fk`='" + newRole + "' WHERE `Name`='" + username + "'");
        res.setHeader('Content-Type', 'application/json');
        res.send("Changed Role for: " + username + " to: " + newRole);
    },
    disableUser: async (req, res) => {
        if(!await isUserAnAdmin(req, res)){
            res.send("Current User isn't Admin");
            return;
        }
        const { username } = req.body;
        const currentuser = getUsernameFromToken(req, res);
        if(currentuser == username || username == "admin"){
            res.send("Current User can't be disabled");
            return;
        }
        await db.query("UPDATE `user` SET `isActive`=0 WHERE `Name`='" + username + "'");
        res.setHeader('Content-Type', 'application/json');
        res.send("Disabled User: " + username);
    },
    enableUser: async (req, res) => {
        if(! await isUserAnAdmin(req, res)){
            res.send("Current User isn't Admin");
            return;
        }
        const { username } = req.body;
        const currentuser = getUsernameFromToken(req, res);
        if(currentuser == username){
            res.send("Current User can't be enabled");
            return;
        }
        await db.query("UPDATE `user` SET `isActive`=1 WHERE `Name`='" + username + "'");
        res.setHeader('Content-Type', 'application/json');
        res.send("Enabled User: " + username);
    },
    changeEmail: async (req, res) => {
        if(process.env.MODE == "DEMO"){
            res.sendStatus(403);
            return;
        }
        const { username, newMail } = req.body;
        if(!await isUserAnAdmin(req, res)){
            if(getUsernameFromToken(req, res) == username){
                res.send("Current User isn't Admin but selfchange"); 
            }else{
                res.send("Current User isn't Admin");
                return;
            }   
        }
        await db.query("UPDATE `user` SET `email`='" + newMail + "' WHERE `Name`='" + username + "'");
        res.setHeader('Content-Type', 'application/json');
        res.send("Changed Email for: " + username + " to: " + newMail);
    },
    login: async (req, res) => {    // Called in Server.js
        let { username, password, stayLoggedIn } = req.body;
        if(!username || !password){
            console.log("Username: " + username + " Password: " + password);
            res.status(400).send("Username or Password not set");
            return;
        }
        username = inputCheck.checkSpaces(username);
        username = username.toLowerCase();
        const loggedInUser = await db.query("SELECT `Name`, `Passwort`, `role_fk`, `email`, `TOTPkey`, `TOTPenabled` FROM `user` WHERE LOWER(`Name`) = '" + username + "' AND `isActive` = 1");
        if(loggedInUser.length > 0){
            bcrypt.compare(password, loggedInUser[0].Passwort, async function(err, result) {
                
                if(result){
                    if(loggedInUser[0].TOTPenabled == 1){
                        var formattedKey = loggedInUser[0].TOTPkey;
                        var totpCode = req.body.totpCode;
                        if(!totpCode){
                            res.status(400).send("TOTP Required");
                            return;
                        }
                        if(authenticator.verifyToken(formattedKey, totpCode)){
                            console.log("TOTP Verified");
                        }else{
                            res.status(400).send("TOTP Failed");
                            return;
                        }
                    }
                    var role_fkReturn = loggedInUser[0].role_fk;
                    var usernameReturn = loggedInUser[0].Name;
                    var emailReturn = loggedInUser[0].email;
                    var TOTPenabled = loggedInUser[0].TOTPenabled;
                    const token = signToken(usernameReturn, role_fkReturn, stayLoggedIn);

                    res.header('Access-Control-Expose-Headers', 'Accept-Ranges, Content-Encoding, Content-Length, Content-Range, Set-Cookie');
                    res.cookie("token", token, { maxAge: jwtExpirySeconds * 1000 });
                    await db.query("UPDATE `user` SET `LastLogin_Date` = CURRENT_DATE(), `LastLogin_Time` = CURRENT_TIME() WHERE `user`.`Name` = '" + usernameReturn + "'");
                    

                    var returnJson = {
                        token: token,
                        role_fk: role_fkReturn,
                        username: usernameReturn,
                        email: emailReturn,
                        sendMailEnabled: sendMailEnabled,
                        frontendUrl: frontendUrl,
                        TOTPenabled: TOTPenabled,
                        backendVersion: backendVersion
                    };
                    res.send(returnJson);
                }else{
                    res.clearCookie("token");
                    res.status(400);
                    res.send("AuthError");
                }
            });
        }else{
            res.clearCookie("token");
            res.status(400);
            res.send("AuthError");
        }
    
    },
    checkLoginToken: async (req, res) => {
        const username = getUsernameFromToken(req, res);
        if(username){
            const response = await db.query("SELECT `Name`, `Passwort`, `role_fk`, `email`, `TOTPkey`, `TOTPenabled` FROM `user` WHERE LOWER(`Name`) = '" + username + "' AND `isActive` = 1");
            var role_fkReturn = response[0].role_fk;
            var usernameReturn = response[0].Name;
                    var emailReturn = response[0].email;
                    var TOTPenabled = response[0].TOTPenabled;
            var returnJson = {
                role_fk: role_fkReturn,
                username: usernameReturn,
                email: emailReturn,
                sendMailEnabled: sendMailEnabled,
                frontendUrl: frontendUrl,
                TOTPenabled: TOTPenabled,
                backendVersion: backendVersion
            };
            res.send(returnJson);
        }else{
            res.status(400).send("AuthError");
        }
    },
    refreshToken: async (req, res) => {
        var token = getToken(req);
        var payload;
        try {
            payload = jwt.verify(token, jwtKey);
        } catch (e) {
            res.clearCookie("token");
            res.status(401);
            res.send("Payload Error");
            return;
        }
        var stayLoggedIn = payload.stayLoggedIn;
        const newToken = signToken(payload.username, payload.role_fk, stayLoggedIn);
        res.header('Access-Control-Expose-Headers', 'Accept-Ranges, Content-Encoding, Content-Length, Content-Range, Set-Cookie');
        res.cookie("token", newToken, { maxAge: jwtExpirySeconds * 1000 });
        var returnJson = {
            token: newToken,
        };
        res.send(returnJson);
    },
    createUser: async (req, res) => {
        if(!await isUserAnAdmin(req, res)){
            res.send("Current User isn't Admin"); 
            return;
        }
        const { username, password, email } = req.body;
        bcrypt.hash(password, saltRounds, async function(err, hashedPassword) {
            await db.query("INSERT INTO `user` (`Name`, `email`, `Passwort`, `LastLogin_Date`, `LastLogin_Time`, `role_fk`, `isActive`) VALUES ('" + username + "', '" + email + "', '" + hashedPassword + "',  CURRENT_DATE(), CURRENT_TIME(), 'Technician', 1)");
           
            res.send("Createt User: " + username);
        });
    },
    getUsername: async (req, res) =>{
        return getUsernameFromToken(req, res);
    },
    isUserAdminExport: async (req, res) => {
        return await isUserAnAdmin(req, res);
    },
    isLoggedIn: (req, res) => {
        var token = getToken(req);
        var payload;
        try{
            payload = jwt.verify(token, jwtKey);
        }catch (e){
            return false;
        }
        return true;
    },
    //Save last tickets
    saveLastTickets: async (req, res) => {
        const userID = await getUsernameFromToken(req, res);
        const { lastTickets } = req.body;
        await db.query("UPDATE `user` SET `lastTickets` = '" + lastTickets + "' WHERE `Name` = '" + userID + "'");
        res.send("Saved");
    },
    //Get last tickets
    getLastTickets: async (req, res) => {
        const userID = await getUsernameFromToken(req, res);
        const user = await db.query("SELECT `lastTickets` FROM `user` WHERE `Name` = '" + userID + "'");
        res.json(user[0].lastTickets);
    },
    generateFirstTOTP: async (req, res) => {
        const userID = await getUsernameFromToken(req, res);
        var alreadyEnabled = await db.query("SELECT `TOTPenabled` FROM `user` WHERE `Name` =  ?", [userID]);
        if(alreadyEnabled[0].TOTPenabled == 1){
            res.send("Already enabled");
            return;
        }
        var formattedKey = authenticator.generateKey();
        // Get Usermail from Database
        var usermail = await db.query("SELECT `email` FROM `user` WHERE `Name` = ?", [userID]);
        usermail = usermail[0].email;
        // Generate TOTP URI
        var totpUri = authenticator.generateTotpUri(formattedKey, usermail, userID + "@SkyManager", 'SHA1', 6, 30);
        // Save TOTP Key to Database
        await db.query("UPDATE `user` SET `TOTPkey` = '" + formattedKey + "' WHERE `Name` = ?", [userID]);
        // Send TOTP URI to User
        res.send(totpUri);
    },
    verifyFirstTOTP: async (req, res) => {
        const userID = await getUsernameFromToken(req, res);
        var formattedKey = await db.query("SELECT `TOTPkey` FROM `user` WHERE `Name` = ?", [userID]);
        formattedKey = formattedKey[0].TOTPkey;
        var totpCode = req.body.totpCode;
        if(!totpCode){
            res.send("TOTP Required");
            return;
        }
        if(authenticator.verifyToken(formattedKey, totpCode)){
            await db.query("UPDATE `user` SET `TOTPenabled` = 1 WHERE `Name` = ?", [userID]);
            res.send("Verified");
        }else{
            res.send("Failed");
        }
    },
    disableTOTP: async (req, res) => {
        const userID = await getUsernameFromToken(req, res);
        var formattedKey = await db.query("SELECT `TOTPkey` FROM `user` WHERE `Name` = ?", [userID]);
        formattedKey = formattedKey[0].TOTPkey;
        var totpCode = req.body.totpCode;
        if(!totpCode){
            res.send("TOTP Required");
            return;
        }
        if(authenticator.verifyToken(formattedKey, totpCode)){
            await db.query("UPDATE `user` SET `TOTPenabled` = 0 WHERE `Name` = ?", [userID]);
            res.send("Disabled");
        }else{
            res.send("Failed");
        }
    }
    
        
};

function getToken(req){
    var token = req.headers.authorization;
    if(!token){
        if(req.cookies.token){
            token = req.cookies.token;
        }else{
                return false;
            
        }
    }
    return token;
}

function signToken(username, role_fk, stayLoggedIn){
    
    const token = jwt.sign({ username, role_fk, stayLoggedIn }, jwtKey, {
        algorithm: "HS256",
        expiresIn: stayLoggedIn ? jwtExpirySeconds30Days : jwtExpirySeconds
    });
    return token;
}

async function isUserAnAdmin  (req, res)   {
    var token = getToken(req);
    var payload;
    try{
        payload = jwt.verify(token, jwtKey);
    }catch (e){
        return false;
    }
    const username = payload.username;
    var role = await db.query("SELECT `role_fk` FROM `user` WHERE `Name` = ?", [username]);
    role = role[0].role_fk;
    if(role == "Admin"){
        return true;
    }
    return false;      
}

function getUsernameFromToken(req, res){
    var token = getToken(req);
    var payload;
    try{
        payload = jwt.verify(token, jwtKey);
    }catch (e){
        console.log(e);
        return false;
    }
    return payload.username;
}

module.exports = userService;