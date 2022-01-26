const db = require('./db');
const UserService = require('./users');
// ID`, `Titel`, `Beschreibung`, `Datum`, `Zeit`, `isCompleted
let taskService = {
    getActiveUserTasks: async (req, res) => {
        var ownUsername = await UserService.getUsername(req, res);
        var tasks = await db.query("SELECT `tasks`.`ID`, `tasks`.`Titel`, `tasks`.`Beschreibung`, `tasks`.`DateTime`, `tasks`.`ticket_fk`, `tasks`.`isCompleted` FROM `tasks` INNER JOIN `users_tasks` ON `users_tasks`.`Task_FK` = `tasks`.`ID` INNER JOIN `user` ON `user`.`Name` = `users_tasks`.`User_FK` WHERE `user`.`Name` = '" + ownUsername + "';");
        res.json(tasks);
    },
    createTask: async (req, res) => {
        var ownUsername = await UserService.getUsername(req, res);
        var task = req.body;
        var result = "";
        if(task.ticket_fk) {
            result = await db.query("INSERT INTO `tasks` (`Titel`, `Beschreibung`, `createdDate`, `createdTime`, `DateTime`, `owner`, `isCompleted`, `ticket_fk`) VALUES ('" + task.title + "', '" + task.description + "', CURRENT_DATE(), CURRENT_TIME(), '" + task.datetime + "', '" + ownUsername + "', 0, '" + task.ticket_fk + "');");
        } else {
            result = await db.query("INSERT INTO `tasks` (`Titel`, `Beschreibung`, `createdDate`, `createdTime`, `DateTime`, `owner`, `isCompleted`, `ticket_fk`) VALUES ('" + task.title + "', '" + task.description + "', CURRENT_DATE(), CURRENT_TIME(), '" + task.datetime + "', '" + ownUsername + "', 0, NULL);");
        }
        var taskID = result.insertId;
        await db.query("INSERT INTO `users_tasks` (`User_FK`, `Task_FK`) VALUES ('" + ownUsername + "', '" + taskID + "');");
        let response = {
            "ID": taskID,
            "Result": result
        };
        res.json(response);
    },
    updateTask: async (req, res) => {
        var ownUsername = await UserService.getUsername(req, res);
        var task = req.body;
        var taskOwner = await db.query("SELECT `owner` FROM `tasks` WHERE `ID` = '" + task.taskID + "';");
        if(taskOwner[0].owner != ownUsername) {
            res.json({
                "Result": "You are not the owner of this task!"
            });
        } else {
            if(task.ticket_fk) {
                var result = await db.query("UPDATE `tasks` SET `Titel` = '" + task.title + "', `Beschreibung` = '" + task.description + "', `DateTime` = '" + task.datetime + "', `ticket_fk` = '" + task.ticket_fk + "' WHERE `ID` = '" + task.taskID + "';");
            } else {
                var result = await db.query("UPDATE `tasks` SET `Titel` = '" + task.title + "', `Beschreibung` = '" + task.description + "', `DateTime` = '" + task.datetime + "', `ticket_fk` = NULL WHERE `ID` = '" + task.taskID + "';");
            }
        // var result = await db.query("UPDATE `tasks` SET `Titel` = '" + task.title + "', `Beschreibung` = '" + task.description + "', `DateTime` = '" + task.datetime + "' WHERE `ID` = " + task.taskID + ";");
        let response = {
            "ID": task.taskID,
            "Result": result
        };
        res.json(response);
        }
    },
    deleteTask: async (req, res) => {
        var ownUsername = await UserService.getUsername(req, res);
        var taskID = req.body.taskID;
        var result = await db.query("DELETE FROM `users_tasks` WHERE `Task_FK` = '" + taskID + "';");
        var result2 = "Error";
        if(result.affectedRows >= 1) {
            result2 = await db.query("DELETE FROM `tasks` WHERE `ID` = '" + taskID + "' AND `owner` = '" + ownUsername + "';");
        }else{
            result2 = "Error";
        }
        let response = {
            "ID": taskID,
            tasks: result,
            users_tasks: result2
        }
        res.json(response);
    },
    completeTask: async (req, res) => {
        // var ownUsername = await UserService.getUsername(req, res);
        var taskID = req.body.taskID;
        var result = await db.query("UPDATE `tasks` SET `isCompleted` = 1 WHERE `ID` = '" + taskID + "';");
        let response = {
            "ID": taskID,
            "Result": result
        }
        res.json(response);
    },
    reopenTask: async (req, res) => {
        var taskID = req.body.taskID;
        var result = await db.query("UPDATE `tasks` SET `isCompleted` = 0 WHERE `ID` = '" + taskID + "';");
        let response = {
            "ID": taskID,
            "Result": result
        }
        res.json(response);
    },
    getTaskByID: async (req, res) => {
        var taskID = req.body.taskID;
        var result = await db.query("SELECT `tasks`.`ID`, `tasks`.`Titel`, `tasks`.`Beschreibung`, `tasks`.`DateTime`, `tasks`.`ticket_fk`, `tasks`.`isCompleted` FROM `tasks` WHERE `ID` = '" + taskID + "';");
        var tastUsers = await db.query("SELECT `users_tasks`.`User_FK` FROM `users_tasks` INNER JOIN `tasks` ON `users_tasks`.`Task_FK` = `tasks`.`ID` WHERE `tasks`.`ID` = '" + taskID + "';");
        let response = {
            "ID": taskID,
            "Result": result,
            "Users": tastUsers
        }
        res.json(response);
    }
    

}

module.exports = taskService;
