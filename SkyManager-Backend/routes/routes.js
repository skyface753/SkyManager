const express = require('express');
const router = express.Router();


const UserService = require('../services/users');
router.post('/users', UserService.getAllUsers);
router.post('/users/changePassword', UserService.changePassword);
router.post('/users/changeRole', UserService.changeRole);
router.post('/users/create', UserService.createUser);
router.post('/users/refreshToken', UserService.refreshToken);
router.post('/users/disableUser', UserService.disableUser);
router.post('/users/enableUser', UserService.enableUser);
router.post('/users/changeMail', UserService.changeEmail);

const TicketService = require('../services/tickets');
router.post('/tickets', TicketService.getTickets);
router.post('/tickets/myTickets', TicketService.getMyTickets);
router.post('/tickets/allTickets', TicketService.getAllTickets);
router.post('/tickets/create', TicketService.createTicket);
router.post('/tickets/getDetails', TicketService.getDetails);
router.post('/tickets/updateDetails', TicketService.updateDetails);

const EntryService = require('../services/entries');
router.post('/entries', EntryService.getEntries);
router.post('/entries/create', EntryService.createEntry);
router.post('/entries/update', EntryService.updateEntry);
router.post('/entries/delete', EntryService.deleteEntry);
router.post('/entries/createEntryWithSendMail', EntryService.createEntryWithSendMail);

const CustomerService = require('../services/customers');
router.post('/customers', CustomerService.getCustomer)
router.post('/customers/allCustomers', CustomerService.getAllCustomers)
router.post('/customers/archivedCustomers', CustomerService.getArchivedCustomers)
router.post('/customers/create', CustomerService.createCustomer)
router.post('/customers/archive', CustomerService.archiveCustomer)
router.post('/customers/reActivate', CustomerService.reActivateCustomer)
router.post('/customers/edit', CustomerService.editCustomer)

const PassesService = require('../services/passes');
router.post('/passes', PassesService.getPasses);
router.post('/passes/create', PassesService.createPass);
router.post('/passes/delete', PassesService.deletePass);
router.post('/passes/edit', PassesService.editPass);

router.use('/uploads', express.static(__dirname +'/uploads'));
const DocuService = require('../services/docu');
router.post('/docu/upload', DocuService.upload);
router.get('/docu/getAll', DocuService.getAll);

const RoleService = require('../services/roles');
router.post('/roles', RoleService.getRoles);

const StateService = require('../services/states');
router.post('/states', StateService.getStates);

const TaskService = require('../services/tasks');
router.post('/tasks', TaskService.getActiveUserTasks);
router.post('/tasks/update', TaskService.updateTask);
router.post('/tasks/create', TaskService.createTask);
router.post('/tasks/delete', TaskService.deleteTask);
router.post('/tasks/complete', TaskService.completeTask);
router.post('/tasks/reopen', TaskService.reopenTask);

const WikiService = require('../services/wiki');
router.post('/wiki', WikiService.getWiki);
router.post('/wiki/getWikiByID', WikiService.getWikiByID);
router.post('/wiki/create', WikiService.createWiki);
router.post('/wiki/update', WikiService.updateWiki);
router.post('/wiki/delete', WikiService.deleteWiki);


module.exports = router;