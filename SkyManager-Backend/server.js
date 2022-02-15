const http = require('http');
const express = require('express');
const jwt = require("jsonwebtoken")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const config = require('./config.js');
const sslconfig = config.ssl;
const fs = require('fs')
const port = 80;
var app = express();
const db = require('./services/db.js');
const sendMail = require('./services/sendMail.js');

const jwtKeyGenerator = require('./services/jwtKey');
const jwtKey = jwtKeyGenerator.jwtKey;
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

    const swaggerJsdoc = require('swagger-jsdoc');
    var swaggerUi = require("swagger-ui-express");

    const DisableTryItOutPlugin = function() {
        return {
          statePlugins: {
            spec: {
              wrapSelectors: {
                allowTryItOutFor: () => () => false
              }
            }
          }
        }
      }

    const options = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'SkyManager API',
          version: '1.0.0',
        },
        components: {
            securitySchemes: {
              bearerAuth: {
                type: 'apiKey',
                in: 'header',
                name: 'Authorization'
              }
            }
          },
          security: [{
            bearerAuth: []
          }]
        
      },
      swaggerOptions: {
        plugins: [
             DisableTryItOutPlugin
        ]
      },
      apis: ['./services/wiki.js', './services/totps.js'], // files containing annotations as above
    };

    
    
    const openapiSpecification = swaggerJsdoc(options);
    app.use(
        "/api-docs",
        swaggerUi.serve,
        swaggerUi.setup(openapiSpecification)
      );


const initDBHelper = require('./helpers/initDB')
var checkDBCounter = 0;
checkTheDatabase()
async function checkTheDatabase(){
    try{

        var result = await db.query("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'SkyManager' AND table_name = 'ticket_tickets');")
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
        next();
    }else{
        res.status(401);
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
        db.query("INSERT INTO docs (name, path, uploadedName, type, size, user_fk, customer_fk) VALUES (?, ?, ?, ?, ?, ?, ?)", [file.originalname, file.path, file.filename,file.mimetype, file.size, username, req.body.customer_fk]);
        res.status(200).send("File uploaded")
    
  })
  app.post('/docs',async(req, res)=>{
      var customer_fk = req.body.customer_fk;
    const docs = await db.query("SELECT * FROM docs WHERE customer_fk = ?", [customer_fk]);
        res.send(docs);
    
   })
   
   const { promisify } = require('util')

const unlinkAsync = promisify(fs.unlink)

app.post('/docs/delete',async(req, res)=>{
    var docID = req.body.docID;
    var currentDoc = await db.query("SELECT path, uploadedName FROM docs WHERE id = ?", [docID]);
    var newDocName = currentDoc[0].uploadedName;
    var docPath = currentDoc[0].path;
    fs.rename(docPath, './uploads/deleted/' + newDocName, function (err) {
        if (err) throw err;
    }
        );
    await db.query("DELETE FROM docs WHERE ID = ?", [docID]);
    // await unlinkAsync(docPath);
    res.send("File Deleted");

})

  

const MailService = require('./services/receiveMail.js');

const imapHost = config.imapMail.host;

if(config.db.host == null || config.db.user == null || config.db.password == null || config.db.database == null || config.masterkey == null){
    console.log("Config Envs not set - EXIT");
    console.log("These envs are required: DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE, MASTERKEY");
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
}else{console.log("No IMAP Host - Diable IMAP Service")}

const routes = require('./routes/routes');
app.use('/', routes);


// Catch all exceptions 
process.on('uncaughtException', function (err) {
    console.log("-----------Begin Uncaught Exception---------");
    console.log(err);
    console.log("-----------End Uncaught Exception---------");
  });

// SSL Config

if(sslconfig.cert && sslconfig.key){
    console.log("Start with SSL")
    const https = require('https');
    var privateKey = fs.readFileSync('sslcert/' + sslconfig.key, 'utf8');
    var certificate = fs.readFileSync('sslcert/' + sslconfig.cert, 'utf8');
    var credentials = { key: privateKey, cert: certificate };
    var httpsServer = https.createServer(credentials, app);
    httpsServer.listen(443);
    console.log("Started with SSL - Port 443")
}
// END SSL Config


var httpServer = http.createServer(app);
httpServer.listen(port);
console.log("Server gestartet");
console.log("Port: " + port);
