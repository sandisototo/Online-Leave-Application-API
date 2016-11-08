
function setBookshelf(Bookshelf){
	//Set Relationships
	Model  = require('./models.js');
	Model.setModels(Bookshelf);

};



function get_all(callback){
	var data ;
	new Model.Leave_type().fetchAll()
		.then(function(leave_types) {
			data = {status: true, description:"Success" , leave_types: leave_types.toJSON()};
			return callback(data);
		}).catch(function (err) {
		data = {status: false, description:"Error executing MySQL query ", error_message:  err.message};
		return callback(data);
	});
};



function get_leave_type_by_id(leave_type_id,callback){
	var data;

	new Model.Leave_type({id:leave_type_id})
		.fetch()
		.then(function (leave_type) {
			if (!leave_type) {
				data = {"status" : false, "description" : "leave type NOT found." };
				return callback(data);
			}
			else {
				data = {"status" : true, "description" : "Success", "leave_type": leave_type.toJSON() };
				return callback(data);

			}
		})
		.catch(function (err) {
			data = {status: false, description:"Error executing MySQL query ", error_message:  err.message};
			return callback(data);
		});

};



function get_number_of_days_left(leave_type_id,staff_id,standard_leave_days,callback){
	var data;

	new Model.Staff_leave_type({leave_type_id:leave_type_id,staff_id:staff_id})
		.fetch({withRelated: ['staff']})
		.then(function (leave) {
			if (!leave) {
				data = {"status" : false, "description" : "Staff has  NOT taken leave yet.", "leave_days" :standard_leave_days };
				return callback(data);
			}
			else {
				data = {"status" : true, "description" : "Success", "leave_type" : leave.toJSON() };
				return callback(data);

			}
		})
		.catch(function (err) {
			data = {status: false, description:"Error executing MySQL query ", error_message:  err.message};
			return callback(data);
		});
};




function get_all_number_of_days_left(staff_id,callback){
	var data;

	new Model.Staff_leave_type({staff_id:staff_id})
		.query({where: {staff_id: staff_id}})
		.fetchAll()
		.then(function (days_left) {
			if (!days_left) {
				data = {"status" : false, "description" : "Staff has  NOT taken leave yet." };
				return callback(data);
			}
			else {
				data = {"status" : true, "description" : "Success", "leave_types" :days_left.toJSON() };
				return callback(data);

			}
		})
		.catch(function (err) {
			data = {status: false, description:"Error executing MySQL query ", error_message:  err.message};
			return callback(data);
		});
};

function get_all_staff_number_of_days_left(callback){
	var data;
	new Model.Staff()
		.fetchAll({withRelated: ['staff_leave_type']})
		.then(function (days_left) {
			if (!days_left) {
				data = {"status" : false, "description" : "Staff has  NOT taken leave yet." };
				return callback(data);
			}
			else {
				data = {"status" : true, "description" : "Success", "staff_leave_days" :days_left.toJSON() };
				return callback(data);

			}
		})
		.catch(function (err) {
			data = {status: false, description:"Error executing MySQL query ", error_message:  err.message};
			return callback(data);
		});
};


function check_leave_days(leave_type_id,staff_id,standard_leave_days,days,callback){

	var data;

	new Model.Staff_leave_type()
		.query({where: {staff_id: staff_id}, andWhere: {leave_type_id: leave_type_id}})
		.fetch()
		.then(function (checker) {
			if (!checker) {
				if(days > standard_leave_days)
				{

					data = {"status" : false, "description" : "Error: Leave days exceed the amount of leave day left for staff member", "leave_days" :standard_leave_days,"your days" :days  };
					return callback(data);
				}
				else
				{
					data = {"status" : true, "description" : "success", "leave_days" :standard_leave_days,"your days" :days  };
					return callback(data);
				}

			}
			else {
				if(days > checker.toJSON().num_days)
				{

					data = {"status" : false, "description" : "Error: Leave days exceed the amount of leave day left for staff member", "leave_days" :checker.toJSON().num_days,"your days" :days };
					return callback(data);
				}
				else
				{
					data = {"status" : true, "description" : "success", "leave_days" :checker.toJSON.num_days,"your days":days};

					return callback(data);
				}

			}
		})
		.catch(function (err) {
			data = {status: false, description:"Error executing MySQL query ", error_message:  err.message};
			return callback(data);
		});

};



function new_leave(leave_type_id,staff_id,newdays,year,callback){

	var data ;
	new Model.Staff_leave_type({
		staff_id: staff_id,
		leave_type_id: leave_type_id,
		num_days: newdays,
		year: year

	})
		.save()
		.then(function (leave) {
			data = {"status" : true, description : "Successfully inserted ", leave:leave.toJSON()};
			return callback(data);
		})
		.catch(function (err) {
			data = {status: false, description:"Error executing MySQL query ", error_message:  err.message};
			return callback(data);
		});

};
function update_staff_leave_type(leave_type_id,staff_id,newdays,year,callback){

	//var query = "SELECT * FROM `staff_leave_type` WHERE leave_type_id = '"+leave_type_id+"' AND staff_id'"+staff_id+"'";

	var query = "UPDATE ?? SET  ??=?,??=? WHERE ??=? AND ??=?";
	var table = ["staff_leave_type","num_days",newdays,"year",year,"leave_type_id",leave_type_id,"staff_id",staff_id];
	query = this.mysql.format(query,table);
	//res.send(query); return false;
	this.connection.query(query,function(err,results){
		var data ;
		if(err) {
			data = {"status" : false, "description" : "Error executing MySQL query"};
			return callback(data);
		} else {

			if(results.affectedRows == 0){
				data =  {"status" : false, "description" : "The Staff leave days left were not updated!"};
				return callback(data);
			}else{
				data =  {"status" : true, "description" : "Success! leave Submitted successfully!", "updated_records" : results};
				return callback(data);
			}

		}
		this.connection.release();
	});
};


function update_staff_leave_type(leave_type_id,staff_id,newdays,year,callback){
		var data;
		new Model.Staff_leave_type()
			.query({where: {staff_id: staff_id}, andWhere: {leave_type_id: leave_type_id}})
		 .fetch({require: true})
		 .then(function (staff_leave) {
			 staff_leave.save({
					 num_days: newdays|| staff_leave.get('num_days'),
					 year: year || staff_leave.get('year')

				 })
				 .then(function () {
						 data = {status : true, description : "The Staff leave days left were  updated!"};
					 return callback(data);
					 })
				 .catch(function (err) {
						 data = 	{status : false,error_message:  err.message};
			 			 return callback(data);
					 });
			 })
		 .catch(function (err) {
				 data = {status: false, description:"Error executing MySQL query ", error_message:  err.message};
				 return callback(data);
			 });

		};
	function get_staff_leave_type_by_leave_id(staff_id,leave_type_id,callback){
	var data;

	new Model.Staff_leave_type()
		.query({where: {staff_id: staff_id}, andWhere: {leave_type_id: leave_type_id}})
		.fetch()
		.then(function (leave_type) {
			if (!leave_type) {
				data = {"status" : false, "description" : "leave type NOT found." };
				return callback(data);
			}
			else {
				data = {"status" : true, "description" : "Success", "leave_type": leave_type.toJSON() };
				return callback(data);

			}
		})
		.catch(function (err) {
			data = {status: false, description:"Error executing MySQL query ", error_message:  err.message};
			return callback(data);
		});

};

// include with staff's global
exports.setBookshelf = setBookshelf;
exports.get_all	= get_all;
exports.get_leave_type_by_id= get_leave_type_by_id;
exports.get_number_of_days_left= get_number_of_days_left;
exports.get_all_number_of_days_left= get_all_number_of_days_left;
exports.get_all_staff_number_of_days_left = get_all_staff_number_of_days_left;
exports.new_leave= new_leave;
exports.update_staff_leave_type= update_staff_leave_type;
exports.check_leave_days= check_leave_days;
exports.get_staff_leave_type_by_leave_id = get_staff_leave_type_by_leave_id;