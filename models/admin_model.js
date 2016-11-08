
function setBookshelf(Bookshelf){
	//Set Relationships
	Model  = require('./models.js');
	Model.setModels(Bookshelf);

};




function validate_user_credintials(username, password,callback){

	var data;

	new Model.Admin()
		.query({where: {username: username}, andWhere: {password: password}})
		.fetch()
		.then(function (user) {
			if (!user) {
				data = {"status" : false, "description" : "User NOT found."};
				return callback(data);
			}
			else {
				data =  {"status" : true, "description" : "Success", "user_details" : user.toJSON() };
				return callback(data);

			}
		})
		.catch(function (err) {
			data = {status: false, description:"Error executing MySQL query ", error_message:  err.message};
			return callback(data);
		});

};

// include with booking's global
exports.setBookshelf = setBookshelf;
exports.validate_user_credintials = validate_user_credintials;