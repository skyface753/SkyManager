const multer=require('multer')
const path= require('path')
const db = require('./db.js');
const userService = require('./users');


var storage = multer.diskStorage({    
    destination: function (req, file, cb) {      
    cb(null, 'uploads')    
    }, 
       
    filename: function (req, file, cb) {      
    cb(null, file.originalname + new Date().toISOString())    
    }  
})

var upload = multer({ storage: storage })


let DocuService = {
    upload: async function(req, res){
        upload.single('myFile')(req, res, function(err) {
            if (err instanceof multer.MulterError) {
                console.log("Multer Error: " + err);
            } else if (err) {
                console.log("Other Error: " + err);
            }
        })
        const file = req.file;
        if(!file){
            console.log("No file received");
            res.status(400).send("No file received")
        }
        console.log(JSON.stringify(file))
        var username = await userService.getUsername(req, res);
        db.query("INSERT INTO docu (name, path, type, size, user_fk, customer_fk) VALUES (?, ?, ?, ?, ?, ?)", [file.originalname, file.path, file.mimetype, file.size, username, req.body.customerFK]);
        console.log("File uploaded");
        res.status(200).send("File uploaded")
    },
    getAll: async function(req, res){
        const username = await userService.getUsername(req, res);
        const docs = await db.query("SELECT * FROM docu");
        res.send(docs);
    }
}

module.exports = DocuService;
  