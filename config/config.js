// register all controllers
var admin 	= require("../controllers/admin.js");
var staff 	= require("../controllers/staff.js");
var leave 	= require("../controllers/leave.js");
var leave_type 	= require("../controllers/leave_type.js");
var lead = require("../controllers/lead.js");


// declaring as global variables
exports.admin = admin;
exports.staff 	= staff;
exports.leave = leave;
exports.leave_type = leave_type;
exports.lead = lead ;
