const http = require('http');
const express = require('express');
const jwt = require("jsonwebtoken")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const port = 80;
var app = express();
const db = require('./services/db.js');
const sendMail = require('./services/sendMail.js');

const jwtKeyGenerator = require('./services/jwtKey');
const jwtKey = jwtKeyGenerator.jwtKey;
console.log("Key in Server: " + jwtKey);
const jwtExpirySeconds = 3000



app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(bodyParser.json())
app.use(cookieParser())

var cors = require('cors')

app.use(cors())

app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});


app.get('/health', async (req, res) => {
    var healthCheck = await db.query("SELECT 1") || {};
    if(healthCheck.length > 0) {
        res.send("OK");
    } else {
        res.send("DB Error");
    }
    });


const initDBHelper = require('./helpers/initDB')
var checkDBCounter = 0;
checkTheDatabase()
async function checkTheDatabase(){
    try{

        var result = await db.query("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'SkyManager' AND table_name = 'ticket_tickets');")
        console.log("FromINIT: " + JSON.stringify(result));
        result = result[0]["EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'SkyManager' AND table_name = 'ticket_tickets')"]
        console.log("DB Check: " + result)
        if(result == 0){
            console.log("-----------------Init DB-----------");
            initDBHelper();
            console.log("-----------------Completed Init DB-----------");
        }else if(result == 1){
            console.log("DB already initialized")
        }
        checkDBCounter = 0;
    }catch(error){
        console.log("-----------------Init DB ERROR-----------");
        console.log(error);
        console.log("-----------------Completed Init DB ERROR-----------");
        if(checkDBCounter < 3){
            console.error("DB Check Error: " + error);
            console.log("Retry DB Check")
            setTimeout(function(){
                checkDBCounter++;
                checkTheDatabase();
            }, 5000);
        }else{
            console.error("Cannot verify the Database")
            process.exit(1);
        }
    }
}

// Login before isLoggedin Middleware
const UserService = require('./services/users');
app.post('/login', UserService.login);



// Middleware to check if user is logged in
app.use(function (req, res, next) {
    if(process.env.mode == "TEST")
    {
        console.log(req.protocol + '://' + req.get('host') + req.originalUrl);
    }   
    if(UserService.isLoggedIn(req, res)){
        console.log("User is authenticatet")
        next();
    }else{
        res.status(401);
        console.log("Auth Expired")
        res.send("Auth Expired").end();
    }
})

app.use('/uploads', express.static(__dirname +'/uploads'));
const multer=require('multer')
const path= require('path')


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
      cb(null, new Date().toISOString() + file.originalname)
    }
})

var upload = multer({ storage: storage })
app.post('/upload', upload.single('myFile'), async(req, res, next) => {
    const file = req.file
    if (!file) {
        const error = new Error('Please upload a file')
        error.httpStatusCode = 400
    return next("hey error")
    }
      
      
    var username = await UserService.getUsername(req, res);
    console.log("Username: " + username);
        db.query("INSERT INTO docu (name, path, type, size, user_fk, customer_fk) VALUES (?, ?, ?, ?, ?, ?)", [file.originalname, file.path, file.mimetype, file.size, username, req.body.customer_fk]);
        console.log("File uploaded");
        res.status(200).send("File uploaded")
    
  })
  app.post('/image',async(req, res)=>{
      var customer_fk = req.body.customer_fk;
    const docs = await db.query("SELECT * FROM docu WHERE customer_fk = ?", [customer_fk]);
        res.send(docs);
    
   })
   const fs = require('fs')
   const { promisify } = require('util')

const unlinkAsync = promisify(fs.unlink)

app.post('/image/delete',async(req, res)=>{
    var docID = req.body.docID;
    var docPath = await db.query("SELECT path, name FROM docu WHERE id = ?", [docID]);
    var docName = docPath[0].name;
    docPath = docPath[0].path;
    fs.rename(docPath, './uploads/deleted/' + docName, function (err) {
        if (err) throw err;
        console.log('File Renamed');
    }
        );
    await db.query("DELETE FROM docu WHERE ID = ?", [docID]);
    // await unlinkAsync(docPath);
    res.send("File Deleted");

})

  

const MailService = require('./services/receiveMail.js');
const config = require('./config.js');
const imapHost = config.imapMail.host;

if(config.db.host == null || config.db.user == null || config.db.password == null || config.db.database == null || config.masterkey == null){
    console.log("Config Envs not set - EXIT");
    process.exit(1);
}
function intervalFunc() {
    MailService.receiveMail().catch(console.error);
}
if(imapHost){
    try{
        setInterval(intervalFunc,15000);
    }catch(e){
        console.log("Error while starting IMAP Mail Service: " + e);
    }
}else{console.log("No IMAP Host")}

const routes = require('./routes/routes');
app.use('/', routes);


// Catch all exceptions 
process.on('uncaughtException', function (err) {
    console.log("-----------Begin Uncaught Exception---------");
    console.log("Uncaught Exception: " + err);
    console.log("-----------End Uncaught Exception---------");
  });




var httpServer = http.createServer(app);
httpServer.listen(port);
console.log("Server gestartet");
console.log("Port: " + port);
