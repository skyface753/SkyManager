const db = require('./db');
const jwt = require("jsonwebtoken");
const inputCheck = require('../helpers/inputCheck');
// const jwtKey = "my_secret_key";
const jwtExpirySeconds = 3000
const bcrypt = require('bcrypt');
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
        if(!isUserAnAdmin(req, res)){
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
        if(!isUserAnAdmin(req, res)){
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
        if(!isUserAnAdmin(req, res)){
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
        if(!isUserAnAdmin(req, res)){
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
        if(!isUserAnAdmin(req, res)){
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
        let { username, password } = req.body;
        if(!username || !password){
            res.status(400).send("Username or Password not set");
            return;
        }
        username = inputCheck.checkSpaces(username);
        username = username.toLowerCase();
        const loggedInUser = await db.query("SELECT `Name`, `Passwort`, `role_fk`, `email` FROM `user` WHERE LOWER(`Name`) = '" + username + "' AND `isActive` = 1");
        if(loggedInUser.length > 0){
            bcrypt.compare(password, loggedInUser[0].Passwort, async function(err, result) {
                if(result){
                    var role_fkReturn = loggedInUser[0].role_fk;
                    var usernameReturn = loggedInUser[0].Name;
                    var emailReturn = loggedInUser[0].email;
                    const token = signToken(usernameReturn, role_fkReturn);

                    res.header('Access-Control-Expose-Headers', 'Accept-Ranges, Content-Encoding, Content-Length, Content-Range, Set-Cookie');
                    res.cookie("token", token, { maxAge: jwtExpirySeconds * 1000 })
                    await db.query("UPDATE `user` SET `LastLogin_Date` = CURRENT_DATE(), `LastLogin_Time` = CURRENT_TIME() WHERE `user`.`Name` = '" + usernameReturn + "'");
                    

                    var returnJson = {
                        token: token,
                        role_fk: role_fkReturn,
                        username: usernameReturn,
                        email: emailReturn,
                        sendMailEnabled: sendMailEnabled,
                        frontendUrl: frontendUrl
                    }
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
    refreshToken: async (req, res) => {
        var token = getToken(req);
        var payload
        try {
            payload = jwt.verify(token, jwtKey)
        } catch (e) {
            res.clearCookie("token");
            res.status(401);
            res.send("Payload Error");
        }
        const newToken = signToken(payload.username, payload.role_fk);
        res.header('Access-Control-Expose-Headers', 'Accept-Ranges, Content-Encoding, Content-Length, Content-Range, Set-Cookie');
        res.cookie("token", newToken, { maxAge: jwtExpirySeconds * 1000 })
        var returnJson = {
            token: newToken,
        }
        res.send(returnJson);
    },
    createUser: async (req, res) => {
        if(!isUserAnAdmin(req, res)){
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
    isUserAdminExport: (req, res) => {
        return isUserAnAdmin(req, res);
    },
    isLoggedIn: (req, res) => {
        var token = getToken(req);
        var payload
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
    }
}

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

function signToken(username, role_fk){
    const token = jwt.sign({ username, role_fk }, jwtKey, {
        algorithm: "HS256",
        expiresIn: jwtExpirySeconds,
    })
    return token;
}

function isUserAnAdmin (req, res)  {
    var token = getToken(req);
    var payload
    try{
        payload = jwt.verify(token, jwtKey);
    }catch (e){
        return false;
    }
    if(payload.role_fk == "Admin"){
        return true;
    }
    return false;      
}

function getUsernameFromToken(req, res){
    var token = getToken(req);
    var payload
    try{
        payload = jwt.verify(token, jwtKey);
    }catch (e){
        console.log(e);
        return false;
    }
    return payload.username;
}

module.exports = userService;