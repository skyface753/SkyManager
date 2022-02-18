const db = require('./db');
const UserService = require('./users');
// ID`, `Titel`, `Beschreibung`, `Datum`, `Zeit`, `isCompleted
let taskService = {
    getActiveUserTasks: async (req, res) => {
        var ownUsername = await UserService.getUsername(req, res);
        var tasks = await db.query("SELECT `tasks`.`ID`, `tasks`.`Titel`, `tasks`.`Beschreibung`, `tasks`.`DateTime`, `tasks`.`ticket_fk`, `tasks`.`isCompleted`, `tasks`.`owner` FROM `tasks` LEFT JOIN `users_tasks` ON `users_tasks`.`Task_FK` = `tasks`.`ID` LEFT JOIN `user` ON `user`.`Name` = `users_tasks`.`User_FK` WHERE `user`.`Name` = ? OR `tasks`.`owner` = ?  GROUP BY `tasks`.`ID`;", [ownUsername, ownUsername]);
        console.log("Tasks: " + tasks);
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
        var selectedUsers = task.selectedUsers;
        for(var i = 0; i < selectedUsers.length; i++) {
            await db.query("INSERT INTO `users_tasks` (`User_FK`, `Task_FK`) VALUES ('" + selectedUsers[i] + "', '" + taskID + "');");
        }   
        let response = {
            "ID": taskID,
            "Result": result
        };
        res.json(response);
    },
    updateTask: async (req, res) => {
        var task = req.body;
        if(!await isOwnerOfTask(req, res, task.taskID)) {
            return;
        }var result;
        if(task.ticket_fk) {
            result = await db.query("UPDATE `tasks` SET `Titel` = '" + task.title + "', `Beschreibung` = '" + task.description + "', `DateTime` = '" + task.datetime + "', `ticket_fk` = '" + task.ticket_fk + "' WHERE `ID` = '" + task.taskID + "';");
        } else {
            result = await db.query("UPDATE `tasks` SET `Titel` = '" + task.title + "', `Beschreibung` = '" + task.description + "', `DateTime` = '" + task.datetime + "', `ticket_fk` = NULL WHERE `ID` = '" + task.taskID + "';");
        }
        // Read current users from db. Delete all users from users_tasks and add the new ones.
        var currentUsers = await db.query("SELECT `User_FK` FROM `users_tasks` WHERE `Task_FK` = '" + task.taskID + "';");
        console.log("Tasks.selectedUsers: " + task.selectedUsers);
        var selectedUsers = JSON.parse(task.selectedUsers);
        console.log("Selected users: " + selectedUsers);
        for(var i = 0; i < currentUsers.length; i++) {
            var user = currentUsers[i];
            var isSelected = false;
            for(var j = 0; j < selectedUsers.length; j++) {
                if(user.User_FK == selectedUsers[j]) {
                    isSelected = true;
                }
            }
            if(!isSelected) {
                await db.query("DELETE FROM `users_tasks` WHERE `User_FK` = '" + user.User_FK + "' AND `Task_FK` = '" + task.taskID + "';");
            }
        }
        for(var i = 0; i < selectedUsers.length; i++) {
            var user = selectedUsers[i];
            var isSelected = false;
            for(var j = 0; j < currentUsers.length; j++) {
                if(user == currentUsers[j].User_FK) {
                    isSelected = true;
                }
            }
            if(!isSelected) {
                await db.query("INSERT INTO `users_tasks` (`User_FK`, `Task_FK`) VALUES ('" + user + "', '" + task.taskID + "');");
            }
        }

        let response = {
            "ID": task.taskID,
            "Result": result
        };
        res.json(response);
        
    },
    deleteTask: async (req, res) => {
        var taskID = req.body.taskID;
        if(!await isOwnerOfTask(req, res, taskID)) {
            return;
        }
        var ownUsername = await UserService.getUsername(req, res);
        var result = await db.query("DELETE FROM `users_tasks` WHERE `Task_FK` = '" + taskID + "';");
        var result2 = await db.query("DELETE FROM `tasks` WHERE `ID` = '" + taskID + "' AND `owner` = '" + ownUsername + "';");
        
        let response = {
            "ID": taskID,
            tasks: result,
            users_tasks: result2
        };
        res.json(response);
    },
    completeTask: async (req, res) => {
        var taskID = req.body.taskID;
        if(!await isOwnerOfTask(req, res, taskID)) {
            return;
        }
        var result = await db.query("UPDATE `tasks` SET `isCompleted` = 1 WHERE `ID` = '" + taskID + "';");
        let response = {
            "ID": taskID,
            "Result": result
        };
        res.json(response);
    },
    reopenTask: async (req, res) => {
        var taskID = req.body.taskID;
        var result = await db.query("UPDATE `tasks` SET `isCompleted` = 0 WHERE `ID` = '" + taskID + "';");
        let response = {
            "ID": taskID,
            "Result": result
        };
        res.json(response);
    },
    getTaskByID: async (req, res) => {
        var taskID = req.body.taskID;
        var result = await db.query("SELECT `tasks`.`ID`, `tasks`.`Titel`, `tasks`.`Beschreibung`, `tasks`.`DateTime`, `tasks`.`ticket_fk`, `tasks`.`isCompleted`, `tasks`.`owner` FROM `tasks` WHERE `ID` = '" + taskID + "';");
        var tastUsers = await db.query("SELECT `users_tasks`.`User_FK` FROM `users_tasks` INNER JOIN `tasks` ON `users_tasks`.`Task_FK` = `tasks`.`ID` WHERE `tasks`.`ID` = '" + taskID + "';");
        let response = {
            "ID": taskID,
            "Result": result,
            "Users": tastUsers
        };
        res.json(response);
    }
    

};

async function isOwnerOfTask(req, res, taskID) {
    var ownUsername = await UserService.getUsername(req, res);
        var taskOwner = await db.query("SELECT `owner` FROM `tasks` WHERE `ID` = '" + taskID + "';");
        if(taskOwner[0].owner != ownUsername) {
            let respone = {
                "Result": "You are not the owner of this task!"
            };
            res.json(respone);
            return false;
        } else {
            return true;
        }
}

module.exports = taskService;
