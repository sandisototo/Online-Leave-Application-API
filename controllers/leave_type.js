function LEAVE_TYPE_ROUTER(router,bookshelf, md5) {
	var self = this;
	var model = require('../models/leave_type_model');
	model.setBookshelf(bookshelf);


	self.handleRoutes(router, md5, model);
}

LEAVE_TYPE_ROUTER.prototype.handleRoutes= function(router, md5, model) {

	router.get("/index", function (req, res) {
		res.json({"Message": "Leave Type Controller"});
	});

	router.get("/get_all_types", function (req, res) {
		model.get_all(function (response) {
			res.json(response);
		});
	});

	router.post("/get_all_number_of_days_left", function (req, res) {
		var staff_id = req.body.staff_id;

		model.get_all_number_of_days_left( staff_id, function (response) {
			res.json(response);
		});


	});

	router.post("/get_all_staff_number_of_days_left", function (req, res) {
		model.get_all_staff_number_of_days_left( function (response) {
			res.json(response);
		});


	});

	router.post("/get_leave_type_by_id", function (req, res) {
		var leave_type_id = req.body.leave_type_id;

		model.get_leave_type_by_id( leave_type_id, function (response) {
			res.json(response);
		});


	});
	router.post("/get_number_of_days_left", function (req, res) {


		var leave_type_id = req.body.leave_type_id;
		var staff_id = req.body.staff_id;

		model.get_leave_type_by_id(leave_type_id, function(response){
					 var standard_leave_days  = response.leave_type.num_days;

					 model.get_number_of_days_left(leave_type_id, staff_id, standard_leave_days, function (response) {
						 res.json(response);
					 });
		});

	});

	router.post("/new_leave", function (req, res) {
		var moment = require('moment');
		require('moment-weekday-calc');
		var leave_type_id = req.body.leave_type_id;
		var staff_id = req.body.staff_id;
		var date_from = moment.utc(req.body.date_from);
		var date_to = moment.utc(req.body.date_to);


		model.get_leave_type_by_id(leave_type_id, function (response) {
			var standard_leave_days = response.leave_type.num_days;


			//calculate days
			var days = moment().isoWeekdayCalc({
				rangeStart: date_from,
				rangeEnd: date_to,
				weekdays: [1, 2, 3, 4, 5], //weekdays Mon to Fri
				exclusions: ['2016-06-16', '2016-03-21', '2016-04-27', '2016-08-03', '2016-08-09', '2016-09-24']  //public holidays
			})

			var year = moment(date_from, "YYYY/MM/DD").year();

			model.get_number_of_days_left(leave_type_id, staff_id, standard_leave_days, function (response) {


				if (response.status) {
					var newdays = response.leave_type.num_days - days;

					if(newdays < 0)
					{
						response.status =false;
						response.description ="number of days taken exceeds the limit "
						res.json(response);
					}
					else
					{
						model.update_staff_leave_type(leave_type_id, staff_id, newdays, year, function (response) {
							res.json(response);
						});

					}

				}
				else {
					var newdays = standard_leave_days - days;

					if(newdays < 0)
					{
						response.status =false;
						response.description ="number of days taken exceeds the limit  "
						res.json(response);
					}
					else
					{
						model.new_leave(leave_type_id, staff_id, newdays, year, function (response) {
							res.json(response);
						});

					}

				}


			});
		});

	});

	router.post("/check_leave_days", function (req, res) {
		var moment = require('moment');
		require('moment-weekday-calc');

		var leave_type_id = req.body.leave_type_id;
		var staff_id = req.body.staff_id;
		var date_from = moment.utc(req.body.date_from);
		var date_to = moment.utc(req.body.date_to);
		model.get_leave_type_by_id(leave_type_id, function (response) {
			//res.json(response); return false;
						var standard_leave_days = 0;
			if(response.status){
			  standard_leave_days = response.leave_type.num_days;
			}else if (leave_type_id === 1) {
				standard_leave_days = 15;
			}else if (leave_type_id === 2) {
				standard_leave_days = 10;
			}else if (leave_type_id === 3) {
				standard_leave_days = 3;
			}else if (leave_type_id === 4) {
				standard_leave_days = 16;
			}

			//calculate days
			//var duration = moment.duration(date_to.diff(date_from));
			var days = moment().isoWeekdayCalc({
				rangeStart: date_from,
				rangeEnd: date_to,
				weekdays: [1, 2, 3, 4, 5], //weekdays Mon to Fri
				exclusions: ['2016-06-16', '2016-03-21']  //public holidays
			}) //returns 260 (260 workdays excluding two public holidays)
			//res.json(" hjsdf fsdkfsd sfsdkfbsk sdfjks"); return false;
			model.check_leave_days(leave_type_id, staff_id, standard_leave_days, days, function (response) {

				res.json(response);

			});


		});
	});
	router.post("/add_number_of_days", function (req, res) {
		var moment = require('moment');
		
		var leave_type_id = req.body.leave_type_id;
		var staff_id = req.body.staff_id;
		var number_of_days = parseInt(req.body.number_of_days);
		var year = new Date().getFullYear();
		
		model.get_staff_leave_type_by_leave_id(staff_id,leave_type_id, function (response) {
			//res.json(response);return false;
			var newdays = response.leave_type.num_days + number_of_days;
		
			model.update_staff_leave_type(leave_type_id, staff_id, newdays, year, function(response) {
				res.json(response);


			});
			

		});
	});
	router.post("/subtract_number_of_days", function (req, res) {
		var moment = require('moment');
		
		var leave_type_id = req.body.leave_type_id;
		var staff_id = req.body.staff_id;
		var number_of_days = parseInt(req.body.number_of_days);
		var year = new Date().getFullYear();
		model.get_staff_leave_type_by_leave_id(staff_id,leave_type_id, function (response) {
			
			if(response.status == true){
				//var standard_leave_days = response.leave_type['num_days'];
				var newdays = response.leave_type.num_days - number_of_days;
				
				model.update_staff_leave_type(leave_type_id, staff_id, newdays, year, function(response) {
					res.json(response);


				});
				
			}else{ 
				model.get_leave_type_by_id(leave_type_id, function (response) {
					var newdays = response.leave_type.num_days - number_of_days;
					model.new_leave(leave_type_id, staff_id, newdays, year, function (response) {
								res.json(response);
							});
				});
				
			}

		});
	});
}


module.exports = LEAVE_TYPE_ROUTER;
