const mysql = require('mysql');
// Tables 13
const createKunden = "CREATE TABLE `kunden` (`ID` int(11) NOT NULL, `Name` varchar(50) NOT NULL, `mail` varchar(50) NOT NULL, `PLZ` varchar(6) NOT NULL, `Stadt` varchar(50) NOT NULL, `Strasse` varchar(50) NOT NULL, `Hausnummer` varchar(10) NOT NULL, `isActive` int(11) NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;"
const createFirstKunde = "INSERT INTO `kunden` (`ID`, `Name`, `mail`, `PLZ`, `Stadt`, `Strasse`, `Hausnummer`, `isActive`) VALUES (1, 'Sky-IT', 'sjoerz@skyface.de', '12345', 'Frankfurt', 'Beispielstraße', '1', 1);"
const createPasses = "CREATE TABLE `kunden_passwoerter` ( `ID` int(11) NOT NULL, `Kunden_FK` int(11) NOT NULL, `Titel` varchar(50) NOT NULL, `Benutzername` varchar(50) NOT NULL, `Passwort` blob NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;"
const createRoles = "CREATE TABLE `rollen` ( `rolename` varchar(20) NOT NULL ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;"
const createFirstRoles = "INSERT INTO `rollen` (`rolename`) VALUES ('Admin'), ('Technician');"
const createEintraege = "CREATE TABLE `ticket_eintraege` ( `ID` int(11) NOT NULL, `Ticket_FK` int(11) NOT NULL, `User_FK` varchar(50) NOT NULL, `Beschreibung` varchar(1000) NOT NULL, `Arbeitszeit` double NOT NULL, `Datum` date NOT NULL, `Zeit` time NOT NULL ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;"
const createFirstEintraege = "INSERT INTO `ticket_eintraege` (`ID`, `Ticket_FK`, `User_FK`, `Beschreibung`, `Arbeitszeit`, `Datum`, `Zeit`) VALUES (1, 10000, 'admin', 'Admin turned coffee into code', 0, '2021-07-02', '10:53:26');"
const createTickets = "CREATE TABLE `ticket_tickets` ( `ID` int(11) NOT NULL, `Kunden_FK` int(11) NOT NULL, `Titel` varchar(50) NOT NULL, `Beschreibung` longtext NOT NULL, `Zustand_FK` int(11) NOT NULL, `User_FK` varchar(50) NOT NULL ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;"
const createFirstTicket = "INSERT INTO `ticket_tickets` (`ID`, `Kunden_FK`, `Titel`, `Beschreibung`, `Zustand_FK`, `User_FK`) VALUES (10000, 1, 'Welcome', 'Welcome to your own self-hosted Ticket-System with Password-Manager and Document-Manager.\n\n Have fun :D', 1, 'admin');"
const createZustaende = "CREATE TABLE `ticket_zustaende` ( `ID` int(11) NOT NULL, `Name` varchar(50) NOT NULL ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;"
const createFirstZustaende = "INSERT INTO `ticket_zustaende` (`ID`, `Name`) VALUES (1, 'open'),(2, 'in progress'), (3, 'closed');"
const createUser = "CREATE TABLE `user` ( `Name` varchar(50) NOT NULL,`email` varchar(50) NOT NULL, `Passwort` char(60) NOT NULL, `LastLogin_Date` date NOT NULL, `LastLogin_Time` time NOT NULL, `role_fk` varchar(50) NOT NULL, `isActive` int(11) NOT NULL ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;"
const createFirstUser = "INSERT INTO `user` (`Name`, `email`, `Passwort`, `LastLogin_Date`, `LastLogin_Time`, `role_fk`, `isActive`) VALUES ('admin', 'skymanager@example.de', '$2b$10$zptGhTsU.61bAoKo1dPE8.rhbiULWVlb32eC7c01lOEbwuhKqZEBi', '2021-12-14', '09:10:36', 'Admin', 1);"
const createTaks = "CREATE TABLE `tasks` ( `ID` int(11) NOT NULL, `Titel` varchar(50) NOT NULL, `Beschreibung` longtext NOT NULL, `createdDate` date NOT NULL, `createdTime` time NOT NULL, `DateTime` datetime NOT NULL, `isCompleted` int(11) NOT NULL, `owner` varchar(50) NOT NULL, `ticket_fk` int(11) NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;"
const createFirstTask = "INSERT INTO `tasks` (`ID`, `Titel`, `Beschreibung`, `createdDate`, `createdTime`, `DateTime`, `isCompleted`, `owner`, `ticket_fk`) VALUES (1, 'Aufgabe', 'WALL·E & EVE', CURRENT_DATE(), CURRENT_TIME(), CURRENT_TIMESTAMP(), 0, 'admin', 10000);"
const createUsersTasks = "CREATE TABLE `users_tasks` ( `ID` int(11) NOT NULL, `User_FK` varchar(50) NOT NULL, `Task_FK` int(11) NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;"
const createFirstUsersTasks = "INSERT INTO `users_tasks` (`ID`, `User_FK`, `Task_FK`) VALUES (1, 'admin', 1);"
const createWiki = "CREATE TABLE `wiki` ( `ID` int(11) NOT NULL, `Titel` varchar(50) NOT NULL, `Text` longtext NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;"
const createFirstWiki = "INSERT INTO `wiki` (`ID`, `Titel`, `Text`) VALUES (1, 'First Wiki', '# Welcome');"
const createNotifications = "CREATE TABLE `notifications` ( `ID` int(11) NOT NULL, `User_FK` varchar(50) NOT NULL, `Ticket_FK` int(11) NOT NULL, `Text` longtext NOT NULL, `DateTime` datetime NOT NULL, `isRead` int(11) NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;"
const createFirstNotifications = "INSERT INTO `notifications` (`ID`, `User_FK`, `Ticket_FK`, `Text`, `DateTime`, `isRead`) VALUES (1, 'admin', 10000, 'Admin worked /*hard*/', CURRENT_TIMESTAMP(), 0);"
const createDocu = "CREATE TABLE `docu` ( `name` varchar(250) NOT NULL, `path` varchar(250) NOT NULL, `type` varchar(50) NOT NULL, `size` int(11) NOT NULL, `user_fk` varchar(50) NOT NULL, `customer_fk` int(11) NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;"
const TableSQL = createKunden + createFirstKunde + createPasses + createRoles + createFirstRoles + createEintraege + createFirstEintraege + createTickets + createFirstTicket + createZustaende + createFirstZustaende + createUser + createFirstUser + createTaks + createFirstTask + createUsersTasks + createFirstUsersTasks + createWiki + createFirstWiki + createNotifications + createFirstNotifications + createDocu;
// INDIZIES 7
const indKunden = "ALTER TABLE `kunden` ADD PRIMARY KEY (`ID`);"
const indPasses = "ALTER TABLE `kunden_passwoerter` ADD PRIMARY KEY (`ID`), ADD KEY `Kunden_FK` (`Kunden_FK`);"
const indRoles = "ALTER TABLE `rollen` ADD PRIMARY KEY (`rolename`);"
const indEintraege = "ALTER TABLE `ticket_eintraege` ADD PRIMARY KEY (`ID`), ADD KEY `Ticket_FK` (`Ticket_FK`), ADD KEY `User_FK` (`User_FK`);"
const indTickets = "ALTER TABLE `ticket_tickets` ADD PRIMARY KEY (`ID`), ADD KEY `Kunden_FK` (`Kunden_FK`), ADD KEY `User_FK` (`User_FK`), ADD KEY `Zustand_FK` (`Zustand_FK`);"
const indZustaende = "ALTER TABLE `ticket_zustaende` ADD PRIMARY KEY (`ID`);"
const indUser = "ALTER TABLE `user` ADD PRIMARY KEY (`Name`), ADD KEY `role_fk` (`role_fk`);"
const indTasks = "ALTER TABLE `tasks` ADD PRIMARY KEY (`ID`), ADD KEY `owner` (`owner`), ADD KEY `ticket_fk` (`ticket_fk`);"
const indUsersTasks = "ALTER TABLE `users_tasks` ADD PRIMARY KEY (`ID`), ADD KEY `User_FK` (`User_FK`), ADD KEY `Task_FK` (`Task_FK`);"
const indWiki = "ALTER TABLE `wiki` ADD PRIMARY KEY (`ID`);"
const indNotifications = "ALTER TABLE `notifications` ADD PRIMARY KEY (`ID`), ADD KEY `User_FK` (`User_FK`), ADD KEY `Ticket_FK` (`Ticket_FK`);"
const indSQL = indKunden + indPasses + indRoles + indEintraege + indTickets + indZustaende + indUser + indTasks + indUsersTasks + indWiki + indNotifications;
// Auto Incerement 5
const aiKunden = "ALTER TABLE `kunden` MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;"
const aiPasses = "ALTER TABLE `kunden_passwoerter` MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;"
const aiEintraege = "ALTER TABLE `ticket_eintraege` MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;"
const aiTickets = "ALTER TABLE `ticket_tickets` MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10001;"
const aiZustaende = "ALTER TABLE `ticket_zustaende` MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;"
const aiTasks = "ALTER TABLE `tasks` MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;"
const aiUsersTasks = "ALTER TABLE `users_tasks` MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;"
const aiWiki = "ALTER TABLE `wiki` MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;"
const aiNotifications = "ALTER TABLE `notifications` MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;"
const aiSQL = aiKunden + aiPasses + aiEintraege + aiTickets + aiZustaende + aiTasks + aiUsersTasks + aiWiki + aiNotifications;
// Constraints (FK) 4
const fkPasses = "ALTER TABLE `kunden_passwoerter` ADD CONSTRAINT `kunden_passwoerter_ibfk_1` FOREIGN KEY (`Kunden_FK`) REFERENCES `kunden` (`ID`);"
const fkEintraege = "ALTER TABLE `ticket_eintraege` ADD CONSTRAINT `ticket_eintraege_ibfk_1` FOREIGN KEY (`Ticket_FK`) REFERENCES `ticket_tickets` (`ID`), ADD CONSTRAINT `ticket_eintraege_ibfk_2` FOREIGN KEY (`User_FK`) REFERENCES `user` (`Name`);"
const fkTickets = "ALTER TABLE `ticket_tickets` ADD CONSTRAINT `ticket_tickets_ibfk_1` FOREIGN KEY (`Kunden_FK`) REFERENCES `kunden` (`ID`), ADD CONSTRAINT `ticket_tickets_ibfk_3` FOREIGN KEY (`Zustand_FK`) REFERENCES `ticket_zustaende` (`ID`),ADD CONSTRAINT `ticket_tickets_ibfk_4` FOREIGN KEY (`User_FK`) REFERENCES `user` (`Name`);"
const fkUser = "ALTER TABLE `user` ADD CONSTRAINT `user_ibfk_1` FOREIGN KEY (`role_fk`) REFERENCES `rollen` (`rolename`);"
const fkTasks = "ALTER TABLE `tasks` ADD CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`owner`) REFERENCES `user` (`Name`), ADD CONSTRAINT `tasks_ibfk_2` FOREIGN KEY (`ticket_fk`) REFERENCES `ticket_tickets`(`ID`);"
const fkUsersTasks = "ALTER TABLE `users_tasks` ADD CONSTRAINT `users_tasks_ibfk_1` FOREIGN KEY (`User_FK`) REFERENCES `user` (`Name`), ADD CONSTRAINT `users_tasks_ibfk_2` FOREIGN KEY (`Task_FK`) REFERENCES `tasks` (`ID`);"
const fkNotifications = "ALTER TABLE `notifications` ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`User_FK`) REFERENCES `user` (`Name`), ADD CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`Ticket_FK`) REFERENCES `ticket_tickets` (`ID`);"
const fkDocu = "ALTER TABLE `docu` ADD CONSTRAINT `docu_ibfk_1` FOREIGN KEY (`user_fk`) REFERENCES `user` (`Name`), ADD CONSTRAINT `docu_obfk_2` FOREIGN KEY (`customer_fk`) REFERENCES `kunden` (`ID`);"
const fkSQL = fkPasses + fkEintraege + fkTickets + fkUser + fkTasks + fkUsersTasks + fkNotifications + fkDocu;
const InitDB = TableSQL + indSQL + aiSQL + fkSQL;

const config = require('../config');
var myCon = mysql.createConnection({
   host: config.db.host,
   port: '3306',
   database: config.db.database,
   user: config.db.user,
   password: config.db.password,
   multipleStatements: true
});

function initDB(){
    try{
        myCon.query(InitDB, function(err, results) {
            if (err) throw err;
            for (let index = 0; index < results.length; index++) {
                console.log(results[index]);
            }
        });
        if(process.env.MODE == "TEST"){
            console.log("DB TEST INIT");
            for(i = 0; i < 10; i++){
                myCon.query("INSERT INTO `kunden` (`ID`, `Name`, `mail`, `PLZ`, `Stadt`, `Strasse`, `Hausnummer`, `isActive`) VALUES (NULL, 'Sky-IT" + i + "', 'sjoerz@skyface.de', '12345', 'Frankfurt', 'Beispielstraße', '1', 1);", function(err, results) {
                    if (err) throw err;
                    for (let index = 0; index < results.length; index++) {
                        console.log(results[index]);
                    }
                });
            }
            for(j = 0; j < 3; j++){
                myCon.query("INSERT INTO `user` (`Name`, `email`, `Passwort`, `LastLogin_Date`, `LastLogin_Time`, `role_fk`, `isActive`) VALUES ('admin" + j + "', 'skymanager@example.de', '$2b$10$zptGhTsU.61bAoKo1dPE8.rhbiULWVlb32eC7c01lOEbwuhKqZEBi', '2021-12-14', '09:10:36', 'Admin', 1);", function(err, results) {
                    if (err) throw err;
                    for (let index = 0; index < results.length; index++) {
                        console.log(results[index]);
                    }
                });
            }
            for(k = 0; k < 10; k++){
                myCon.query("INSERT INTO `ticket_tickets` (`ID`, `Kunden_FK`, `Titel`, `Beschreibung`, `Zustand_FK`, `User_FK`) VALUES (NULL, 1, 'Test" + k + "', 'Beschreibung123', 1, 'admin');", function(err, results) {
                    if (err) throw err;
                    for (let index = 0; index < results.length; index++) {
                        console.log(results[index]);
                    }
                });
            }
            for(l = 0; l < 20; l++){
                myCon.query("INSERT INTO `ticket_eintraege` (`ID`, `Ticket_FK`, `User_FK`, `Beschreibung`, `Arbeitszeit`, `Datum`, `Zeit`) VALUES (NULL, 10000, 'admin', 'Hallo" + l + ", ich habe gearbeitet :D', 0, '2021-07-02', '10:53:26');", function(err, results) {
                    if (err) throw err;
                    for (let index = 0; index < results.length; index++) {
                        console.log(results[index]);
                    }
                });
            }
        }
    }catch(error){
        console.log("SQL Init Error: " + error);
    }
}

module.exports = initDB;