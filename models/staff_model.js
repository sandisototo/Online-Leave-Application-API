function setBookshelf(Bookshelf){
	//Set Relationships
	Model  = require('./models.js');
	Model.setModels(Bookshelf);

};

function validate_user_credintials(email, password, callback){

	var data;
	new Model.Staff()
	.query(function(qb) {
			qb.where('email', '=', email).andWhere('password', '=', password);
	})
	.fetch()
	.then(function (user) {
		if (!user) {
			data = 	{status : false, description : "User NOT Found."};
			return callback(data);
		}
		else {
			data = {status : true, description : "Success", user_details : user.toJSON() };
			return callback(data);

		}
	})
	.catch(function (err) {
		data = {status: false, description:"Error executing MySQL query ", error_message:  err.message};
		return callback(data);
	});
};


function reset_password(email, new_password, callback){

	var data;
	new Model.Staff()
	.query(function(qb){
		qb.where('email', '=', email );
	})
	 .fetch({require:true})
	 .then(function (staff) {
		 staff.save({
			 password : new_password || staff.get('password')
		 })
		 .then(function () {
			 data = {status : true, description : "Success! Your password has been updated."};
			 return callback(data);
		 })
		 .catch(function (err) {
			 data = 	{status : false, description : "User NOT Found. Please make sure you type in a correct email address."};
 			 return callback(data);
		 });
	 })
	 .catch(function (err) {
		 data = {status: false, description:"Error: User not found. Please check with the system administrator to see if they have your correct email. ", error_message:  err.message};
 		 return callback(data);
	 });
};

function get_staff_member(staff_id,callback){

	var data;

	new Model.Staff({id:staff_id})
	.fetch()
	.then(function (staff) {
		if (!staff) {
			data = 	{status : false, description : "Staff Member NOT found."};
			return callback(data);
		}
		else {
			data = {status : true, description : "Success",  staff_member_details : staff.toJSON()};
			return callback(data);

		}
	})
	.catch(function (err) {
		data = {status: false, description:"Error executing MySQL query ", error_message:  err.message};
		return callback(data);
	});
};

function get_all_staff(callback){
	var data ;
	new Model.Staff().fetchAll()
	.then(function(members) {
			if (!members) {
				data = 	{status : false, description : "The are no staff members yet."};
				return callback(data);
			}else{
				data = {status: true, description:"Success" , stuff_members: members.toJSON()};
				return callback(data);
			}

	}).catch(function (err) {
		data = {status: false, description:"Error executing MySQL query ", error_message:  err.message};
		return callback(data);
	});
};


function limits(leave_type_id,staff_id,callback){
	var data;

	new Model.Staff_leave_type()
		.query({where: {staff_id: staff_id}, andWhere: {leave_type_id: leave_type_id}})
		.fetch()
		.then(function (row) {
			if (!row) {
				data = 	{status : false, description : "No leave found."};
				return callback(data);

			}
			else {
				data = {status : true, description : "Success", num_days : row.toJSON().num_days };
				return callback(data);


			}
		})
		.catch(function (err) {
			data = {status: false, description:"Error executing MySQL query ", error_message:  err.message};
			return callback(data);
		});
};

function add_new_staff(name, surname, id_number, email, callback){

    var data ;
    new Model.Staff({
        name: name,
        surname: surname,
        id_number: id_number,
        email: email
    })
        .save()
        .then(function (staff) {
            data = {"status" : true, description : "Success"};
            return callback(data);
        })
        .catch(function (err) {
            data = {status: false, description:"Error executing MySQL query ", error_message:  err.message};
            return callback(data);
        });

};

function update_staff(staff_id,name,surname,id_number,email,callback){
   // console.log(staff_id);
    var data;
    new Model.Staff({id: staff_id})
        .fetch({require: true})
        .then(function (staff) {
            staff.save({
                name: name|| staff.get('name'),
                surname: surname|| staff.get('surname'),
                id_number: id_number || staff.get('id_number'),
                email: email || staff.get('email')
            })
                .then(function () {
                    data = {status : true, description : "Success!", updated_record:staff.toJSON()};
                    return callback(data);
                })
                .catch(function (err) {
                    data = 	{status : false, description : err};
                    return callback(data);
                });
        })
        .catch(function (err) {
            data = {status: false, description:"Error executing MySQL query ", error_message:  err.message};
            return callback(data);
        });


        };


         function disable_staff(staff_id,status,callback){

        	var data;
        	new Model.Staff({id: staff_id})
        	.fetch({require: true})
        	.then(function(staff){
        	staff.save({
        		status: status|| staff.get('status')

        	})

        		.then(function(){

        		data = {status: true, description : "Success!", updated_record:staff.toJSON()};
        		return callback(data);

        	})

        		.catch(function(err){
        		data ={status : false, description: err};
        		return callback(data);
        	});

        	})

        		.catch(function(err){

        		data ={status: false, description: "Error executing MySQL query", error_message: err.message};	

        	});

        	};	

// include with staff's global
exports.setBookshelf = setBookshelf;
exports.validate_user_credintials	= validate_user_credintials;
exports.reset_password = reset_password;
exports.limits = limits;
exports.get_all_staff = get_all_staff;
exports.get_staff_member= get_staff_member;
exports.add_new_staff = add_new_staff;
exports.update_staff = update_staff;
exports.disable_staff = disable_staff;
