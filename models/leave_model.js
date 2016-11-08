var RawQueryBuilder = null;
	
function setBookshelf(Bookshelf){
	//Set Relationships
	RawQueryBuilder = Bookshelf.knex;
	Model  = require('./models.js');
	Model.setModels(Bookshelf);

};

function get_all(callback){
  var data ;
  new Model.Leave()
	.query(function(qb){
    qb.orderBy('date_from','ASC');
	})
	.fetchAll({withRelated: ['staff','leave_type']})
  .then(function(applications) {
    data = {status: true, description:"Success" , leave_applications: applications.toJSON()};
    return callback(data);
  }).catch(function (err) {
    data = {status: false, description:"Error executing MySQL query ", error_message:  err.message};
    return callback(data);
  });
};

function new_application(staff_id, lead_id, leave_type_id, date_from, date_to, reason, leave_hash, callback){

	var data ;
	new Model.Leave({
			staff_id: staff_id,
			lead_id: lead_id,
			leave_type_id: leave_type_id,
			date_from: date_from,
			date_to: date_to,
			reason: reason,
			leave_hash: leave_hash
		})
		.save()
		.then(function (leave) {
			data = {"status" : true, description : "Success", leave_hash:leave.get('leave_hash')};
			return callback(data);
		})
		.catch(function (err) {
			data = {status: false, description:"Error executing MySQL query ", error_message:  err.message};
			return callback(data);
		});

};

function get_leave(leave_hash, callback){
    	var data;

      new Model.Leave({leave_hash:leave_hash})
      .fetch({withRelated: ['staff','leave_type']})
      .then(function (leave) {
        if (!leave) {
          data = 	{status : false, description : "Invalid Leave Hash"};
          return callback(data);
        }
        else {
          data = {status : true, description : "Success", success_message : "Leave returned successfully!", leave_details : leave.toJSON() };
          return callback(data);

        }
      })
      .catch(function (err) {
        data = {status: false, description:"Error executing MySQL query ", error_message:  err.message};
        return callback(data);
      });
};

function get_lead(lead_id, callback){
	var data;

	new Model.Lead({staff_id:lead_id})
	.fetch({withRelated: ['staff']})
	.then(function (lead) {
		if (!lead) {
			data = 	{status : false, description : "Lead Not Found"};
			return callback(data);
		}
		else {
			data = {status : true, description : "Success", success_message : "Lead record returned successfully!", lead_details : lead.toJSON() };
			return callback(data);

		}
	})
	.catch(function (err) {
		data = {status: false, description:"Error executing MySQL query ", error_message:  err.message};
		return callback(data);
	});

};

function get_all_leads(callback){

	var data;

	new Model.Lead()
	.query(function(qb){
    qb.orderBy('staff_id','ASC');
	})
	.fetchAll({withRelated: ['staff']})
	.then(function (lead) {
		if (!lead) {
			data = 	{status : false, description : "The are no leads. Admin needs to add leads."};
			return callback(data);
		}
		else {
			data = {status : true, description : "Success", leads : lead.toJSON() };
			return callback(data);

		}
	})
	.catch(function (err) {
		data = {status: false, description:"Error executing MySQL query ", error_message:  err.message};
		return callback(data);
	});

};

function get_staff_leave_by_status(staff_id,status,callback){

	var data;

	new Model.Leave()
	.query({where: {staff_id: staff_id}, andWhere: {status: status}})
	.fetchAll()
	.then(function (applications) {
		if (!applications) {
			data = 	{status : false, description : "The are no leave applications for this status."};
			return callback(data);
		}
		else {
			data = {status : true, description : "Success", leave_applications : applications.toJSON() };
			return callback(data);

		}
	})
	.catch(function (err) {
		data = {status: false, description:"Error executing MySQL query ", error_message:  err.message};
		return callback(data);
	});

};

function get_all_staff_leave(staff_id, callback){

	var data;

	new Model.Leave()
	.query(function(qb) {
		  qb.where('staff_id', '=', staff_id);
			qb.orderBy('timestamp', 'DESC')
	})
	.fetchAll({withRelated: ['leave_type']})
	.then(function (applications) {
		if (!applications) {
			data = 	{status : false, description : "The are no leave applications for this user."};
			return callback(data);
		}
		else {
			data = {status : true, description : "Success", staff_leave_applications : applications.toJSON() };
			return callback(data);

		}
	})
	.catch(function (err) {
		data = {status: false, description:"Error executing MySQL query ", error_message:  err.message};
		return callback(data);
	});

};

function get_staff_leave(leave_hash, callback){
	var data;

	new Model.Leave({leave_hash:leave_hash})
	.fetch({withRelated: ['staff']})
	.then(function (leave) {
		if (!leave) {
			data = 	{status : false, description : "No such leave application OR Invalid Leave Hash"};
			return callback(data);
		}
		else {
			data = {status : true, description : "Success", staff_leave_details : leave.toJSON() };
			return callback(data);

		}
	})
	.catch(function (err) {
		data = {status: false, description:"Error executing MySQL query ", error_message:  err.message};
		return callback(data);
	});

};


function update(leave_id,status,reason_for_declined,lead_comment,callback){
	var data;
	new Model.Leave({id: leave_id})
	 .fetch({require: true})
	 .then(function (leave) {
		 leave.save({
			 status: status|| leave.get('status'),
			 reason_for_declined: reason_for_declined || leave.get('reason_for_declined'),
			 lead_comment: lead_comment || leave.get('lead_comment')
		 })
		 .then(function () {
			 data = {status : true, description : "Success! This leave application was updated Successfully."};
			 return callback(data);
		 })
		 .catch(function (err) {
			 data = 	{status : false, description : "No such leave application OR Invalid Leave Hash"};
 			 return callback(data);
		 });
	 })
	 .catch(function (err) {
		 data = {status: false, description:"Error executing MySQL query ", error_message:  err.message};
 		 return callback(data);
	 });

};

function staff_update_leave(leave_hash, lead_id, leave_type_id, date_from, date_to, reason, callback){

	var data;
	new Model.Leave({leave_hash: leave_hash})
	 .fetch({require: true})
	 .then(function (leave) {
		 leave.save({
			 lead_id: lead_id|| leave.get('lead_id'),
			 leave_type_id: leave_type_id || leave.get('leave_type_id'),
			 date_from: date_from || leave.get('date_from'),
			 date_to: date_to || leave.get('date_to'),
			 reason: reason || leave.get('reason')
		 })
		 .then(function () {
			 data = {status : true, description : "Success! This leave application was updated Successfully."};
			 return callback(data);
		 })
		 .catch(function (err) {
			 data = 	{status : false, description : "The was an error updating this leave appliction."};
 			 return callback(data);
		 });
	 })
	 .catch(function (err) {
		 data = {status: false, description:"Error executing MySQL query ", error_message:  err.message};
 		 return callback(data);
	 });

};

//function to display the individuals that is on leave for the current month 

function get_on_leave (callback){

	var data;

	new Model.Leave({status: 1})
	.query("where", RawQueryBuilder.raw("YEAR(date_from) = YEAR(CURDATE()) AND MONTH(date_from) = MONTH(CURDATE())"))
	.fetchAll({withRelated: ['staff','leave_type']})
	.then(function (staff_on_leave) {
		if (!staff_on_leave) {
			data = 	{status : false, description : "The are no leave applications for this user."};
			return callback(data);
		}
		else {
			data = {status : true, description : "Success", staff_leave_applications : staff_on_leave.toJSON() };
			return callback(data);

		}
	})
	.catch(function (err) {
		data = {status: false, description:"Error executing MySQL query ", error_message:  err.message};
		return callback(data);
	});

};


function get_leaves_by_status(status, callback){

	var data;

	new Model.Leave({withRelated: ['staff','leave_type']})
		.query({where: {status: status}})
		.fetchAll()
		.then(function (leaves) {
			if (!leaves) {
				if(status ==2)
				{
					data = 	{"status" : false, "description" : " You have Pending leave applications"};
					return callback(data);
				}
				else
				{
					data = 	{"status" : false, "description" : " NO  leave applications found"};
					return callback(data);

				}
			}
			else {
				if(status ==2)
				{
					data = {"status" : true, "description" : "Success", "success_message" : "Leave returned successfully!", "pending_leaves" : leaves.toJSON()};
					return callback(data);
				}
				else
				{
					data = {"status" : true, "description" : "Success", "success_message" : "Leave returned successfully!", "leaves_by_status" : leaves.toJSON() };
					return callback(data);
				}

			}
		})
		.catch(function (err) {
			data = {status: false, description:"Error executing MySQL query ", error_message:  err.message};
			return callback(data);
		});

};

function preapprove(leave_hash, lead_comment, status, callback){
	var data;
	new Model.Leave({leave_hash: leave_hash})
	 .fetch({require: true})
	 .then(function (leave) {
		 leave.save({
			 status: status|| leave.get('status'),
			 lead_comment: lead_comment || leave.get('lead_comment')
		 })
		 .then(function (leave) {
			 data = {status : true, description : "Success! Your response was submitted successfully!", updated_records : leave};
			 return callback(data);
		 })
		 .catch(function (err) {
			 data = 	{status : false, description : "Invalid Leave Hash: There was an error updating this record, please check your post values."};
			 return callback(data);
		 });
	 })
	 .catch(function (err) {
		 data = {status: false, description:"Error executing MySQL query ", error_message:  err.message};
		 return callback(data);
	 });

};



// include with staff's global
exports.setBookshelf = setBookshelf;
exports.get_leave = get_leave;
exports.get_lead = get_lead;
exports.new_application	= new_application;
exports.get_all	= get_all;
exports.get_all_leads	= get_all_leads;
exports.update = update;
exports.staff_update_leave = staff_update_leave;
exports.get_all_staff_leave = get_all_staff_leave;
exports.get_leaves_by_status = get_leaves_by_status;
exports.get_staff_leave_by_status = get_staff_leave_by_status;
exports.get_staff_leave = get_staff_leave;
exports.preapprove = preapprove;
exports.get_on_leave = get_on_leave;
