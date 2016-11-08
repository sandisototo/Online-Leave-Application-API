
function setBookshelf(Bookshelf){
	//Set Relationships
	Model  = require('./models.js');
	Model.setModels(Bookshelf);

};


function get_all(callback){

	var data;
  new Model.Lead()
  .fetchAll({withRelated: ['staff']})
  .then(function (leads) {
    if (!leads) {
      data = 	{status : false, description : "Lead Not Found"};
      return callback(data);
    }
    else {
      data = {status : true, description : "Success", success_message : "Lead record returned successfully!", lead_details : leads.toJSON() };
      return callback(data);

    }
  })
  .catch(function (err) {
    data = {status: false, description:"Error executing MySQL query ", error_message:  err.message};
    return callback(data);
  });

};

function add_lead(staff_id, callback){
  
	var data ;
	new Model.Lead({
			staff_id: staff_id
		})
		.save()
		.then(function (lead) {
			data = {"status" : true, description : "Success", lead_details : lead.toJSON()};
			return callback(data);
		})
		.catch(function (err) {
			data = {status: false, description:"Error executing MySQL query ", error_message:  err.message};
			return callback(data);
		});

};


// include with booking's global
exports.setBookshelf = setBookshelf;
exports.get_all = get_all;
exports.add_lead = add_lead;
