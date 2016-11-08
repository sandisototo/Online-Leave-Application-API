function LEAVE_ROUTER(router,bookshelf, moment, request) {
	var self = this;
	var model = require('../models/leave_model');
	model.setBookshelf(bookshelf);
	const crypto = require('crypto');
	self.handleRoutes(router, model, moment, crypto, request);
}

LEAVE_ROUTER.prototype.handleRoutes= function(router, model, moment, crypto, request) {
	var global  = require('../config/global');
	var leave_staff_url = global.enviroment.api_urls.leave_staff_url;
	var message_api_url = global.enviroment.api_urls.message_api_url;

  router.get("/index",function(req,res){
      res.json({"Message" : "Leave controller"});
  });

	router.get("/get_all",function(req,res){
			//var all_applications;
			 model.get_all(function(response){
				 res.json(response);
			});
	});

	router.post("/new",function(req,res){
	   	const secret = 'abcdefg';
		  const hash = crypto.randomBytes(16, secret).toString('hex');
			//grab posted values
			var staff_id = req.body.staff_id;
			var lead_id  = req.body.lead_id;
			var leave_type_id  = req.body.leave_type_id;
			var date_from = req.body.date_from; //moment(req.body.date_from).format('YYYY-MM-DD HH:mm:ss');
			var date_to = req.body.date_to; //moment(req.body.date_to).format('YYYY-MM-DD HH:mm:ss');
			var reason  = req.body.reason;
			var leave_hash = hash;


			model.new_application(staff_id, lead_id, leave_type_id, date_from, date_to, reason, leave_hash,function(response){

					if(!response.status){
						res.json(response.description); return false;
					}else{
						model.get_leave(response.leave_hash,function(leave){

								//send_curl() to  Message API to notify a lead about this new leave application parameters{lead_id}
								// send mail with defined email details

							get_lead( leave.leave_details.lead_id, function(lead){
									var lead_email = lead.lead_details.staff.email;
									var subject = "Leave Application ("+leave.leave_details.leave_type.text+") by "+ leave.leave_details.staff.name +" "+ leave.leave_details.staff.surname;
									var message_body;
									if(leave.leave_details.reason){
											message_body = "Hi, "+ lead.lead_details.staff.name +" <br>This is to inform you about <b>"+ leave.leave_details.staff.name +"'"+"s"+"</b> new leave application. <br> Reason: "+ leave.leave_details.reason +"<br>"+
																		 "<b> From: </b> "+ moment(leave.leave_details.date_from).format('dddd MMM [the] Do YYYY') +" <br> <b> To: </b> "+moment(leave.leave_details.date_to).format('dddd MMM [the] Do YYYY') +" <br><br>"+
																		 "Please folow this link to approve or decline this leave application."+
																		 " (<a href='"+leave_staff_url+"preapprove/"+leave.leave_details.leave_hash+"' >Here</a>)";
										}else
									{

											message_body = "Hi, "+ lead.lead_details.staff.name +" <br>This is to inform you about <b>"+ leave.leave_details.staff.name +"'"+"s"+"</b> new leave application.<br>"+
																		 "<b> From: </b> "+ moment(leave.leave_details.date_from).format('dddd MMM [the] Do YYYY') +" <br> <b> To: </b> "+moment(leave.leave_details.date_to).format('dddd MMM [the] Do YYYY') +" <br><br>"+
																		 "Please folow this link to approve or decline this leave application."+
																		 " (<a href='"+leave_staff_url+"preapprove/"+leave.leave_details.leave_hash+"' >Here</a>)";
										}

										var email_helper = require('../config/helper/email-helper');
										email_helper.sendEmail(request, lead_email , subject, message_body, function(response){
												if(response.status){
														console.log("Success: Email Sent to Lead");
															notify_admin_new(leave);

												}else{
														console.log("Error: Email Not Sent to Lead");
												}
												res.json(response);
										});

							} );
						});
					}
			});
  });

	function notify_admin_new(leave) {
			var email_helper = require('../config/helper/email-helper');
			var subject = "New Leave Application ("+leave.leave_details.leave_type.text+") by "+ leave.leave_details.staff.name +" "+ leave.leave_details.staff.surname;
			var  hr_email = "hr@rlabs.org";
			var message_body;
			if(leave.leave_details.reason){
					message_body = "Hi, Admin <br>This is to inform you about <b>"+ leave.leave_details.staff.name +"'"+"s"+"</b> new leave application. <br> Reason: "+ leave.leave_details.reason +"<br>"+
												 "<b> From: </b> "+ moment(leave.leave_details.date_from).format('dddd MMM [the] Do YYYY') +" <br> <b> To: </b> "+moment(leave.leave_details.date_to).format('dddd MMM [the] Do YYYY') +" <br><br>"+
												 "Please folow the link below to see the status of this leave application."+
												 " <br> --> http://hr.rlabs.org/";
				}else
			{

					message_body = "Hi, Admin <br>This is to inform you about <b>"+ leave.leave_details.staff.name +"'"+"s"+"</b> new leave application.<br>"+
												 "<b> From: </b> "+ moment(leave.leave_details.date_from).format('dddd MMM [the] Do YYYY') +" <br> <b> To: </b> "+moment(leave.leave_details.date_to).format('dddd MMM [the] Do YYYY') +" <br><br>"+
												 "Please folow the link below to see the status of this leave application."+
												 " <br> --> http://hr.rlabs.org/";
				}

			email_helper.sendEmail(request, hr_email , subject, message_body, function(response){
					if(response.status){
							console.log("Success: Email Sent to HR");
					}else{
							console.log("Error: Email Not Sent to HR");
					}
			});

	}


	router.post("/get_leave",function(req,res){
	var leave_hash = req.body.leave_hash;
		model.get_leave(leave_hash,function(staff_leave){
				 res.json(staff_leave);
		});
	});

	router.get("/get_all_leads",function(req,res){

			 model.get_all_leads(function(response){
				 res.json(response);
			});
	});

	router.get("/get_on_leave", function (req, res) {
			model.get_on_leave(function (response) {
				res.json(response);
			});
	});

	
  router.post("/preapprove",function(req,res){
      //Grab post values
			var leave_hash = req.body.leave_hash;
			var lead_comment = req.body.lead_comment;
			var leave_status = req.body.leave_status;

			model.preapprove(leave_hash, lead_comment, leave_status, function(response){

					if(response.status){

						if(leave_status == 0){

								model.get_leave(leave_hash,function(staff_leave){

									var email_helper = require('../config/helper/email-helper');
									var applicant_email = staff_leave.leave_details.staff.email;
									var subject = "Leave Application ("+ staff_leave.leave_details.leave_type.text +") Declined";
									var message_body;
									if(staff_leave.leave_details.reason_for_declined || staff_leave.leave_details.lead_comment){
											message_body = "Hi, "+ staff_leave.leave_details.staff.name +" <br>This is to inform you that your leave application has been declined by your lead<br>"+
																		 "Reason: <br> HR: "+ staff_leave.leave_details.reason_for_declined +"<br>"+
																		 "Lead: "+ staff_leave.leave_details.lead_comment ;
										}else{
											message_body = "Hi, "+ staff_leave.leave_details.staff.name +" <br>This is to inform you that your leave application has been declined by your lead<br> For more info consult HR";
										}
									email_helper.sendEmail(request, applicant_email , subject, message_body,function(response){
											console.log(response);
									});
								});
						}
						model.get_leave(leave_hash,function(leave){

									notify_admin_lead_response(leave);

						});

					}

					res.json(response);
			});



  });

	function notify_admin_lead_response(leave) {
		var email_helper = require('../config/helper/email-helper');
		var  hr_email = "hr@rlabs.org";

		var subject;
		var message_body;
		if(leave.leave_details.status == 0){
			subject = "Lead Response: Leave Application ("+leave.leave_details.leave_type.text+") by "+ leave.leave_details.staff.name +" "+ leave.leave_details.staff.surname +" Declined";
			if(leave.leave_details.lead_comment){
					message_body = "Hi, Admin <br>This is to inform you that <b> "+ leave.leave_details.staff.name +"</b>'s leave application has been DECLINED by their lead<br>"+
												 "Lead: "+ leave.leave_details.lead_comment +"<br>"+
												 "Please folow the link below to PROCESS this leave application."+
												 "<br> --> http://hr.rlabs.org/";
				}else{
					message_body = "Hi, Admin <br>This is to inform you that <b> "+ leave.leave_details.staff.name +"</b>'s leave application has been DECLINED by their lead<br> "+
													"Please folow the link below to PROCESS this leave application."+
													"<br> --> http://hr.rlabs.org/";
				}
		}else{
			subject = "Lead Response: Leave Application ("+leave.leave_details.leave_type.text+") by "+ leave.leave_details.staff.name +" "+ leave.leave_details.staff.surname +" Approved";
			if(leave.leave_details.lead_comment){
					message_body = "Hi, Admin <br>This is to inform you that <b> "+ leave.leave_details.staff.name +"</b>'s leave application has been APPROVED by their lead<br>"+
												 "Lead: "+ leave.leave_details.lead_comment +"<br>"+
												 "Please folow the link below to PROCESS this leave application."+
												 "<br> --> http://hr.rlabs.org/";
				}else{
					message_body = "Hi, Admin <br>This is to inform you that <b> "+ leave.leave_details.staff.name +"</b>'s leave application has been APPROVED by their lead<br> "+
													"Please folow the link below to PROCESS this leave application."+
													"<br> --> http://hr.rlabs.org/";
				}
		}

		email_helper.sendEmail(request, hr_email , subject, message_body,function(response){
						if(response.status){
								console.log("Success: Lead response Sent to HR");
						}else{
								console.log("Error: Lead response Not Sent to HR");
						}
		});

	}

  router.post("/get_staff_leave_by_status",function(req,res){

			var status = req.body.status;
			var staff_id = req.body.staff_id;

			model.get_staff_leave_by_status(staff_id,status,function(response){
					res.json(response);
			});
	});

	router.post("/get_all_staff_leave",function(req,res){
			var staff_id = req.body.staff_id;

			model.get_all_staff_leave(staff_id, function(response){
					res.json(response);
			});
	});

	router.post("/get_leaves_by_status",function(req,res){
		var status = req.body.status;

		model.get_leaves_by_status(status, function(response){
			res.json(response);
		});
	});

	router.post("/staff_update_leave",function(req,res){
			var leave_hash = req.body.leave_hash;
			var lead_id = req.body.lead_id;
			var leave_type_id = req.body.leave_type_id;
			var date_from = req.body.date_from;
			var date_to = req.body.date_to;
			var reason = req.body.reason;

			model.staff_update_leave(leave_hash, lead_id, leave_type_id, date_from, date_to, reason, function(response){

				model.get_leave(leave_hash,function(leave){

					get_lead( leave.leave_details.lead_id, function(lead){
							var lead_email = lead.lead_details.staff.email;
							var subject = "UPDATED Leave Application ("+leave.leave_details.leave_type.text +") by "+ leave.leave_details.staff.name +" "+ leave.leave_details.staff.surname;
							var message_body;
							if(leave.leave_details.reason){
									message_body = "Hi, "+ lead.lead_details.staff.name +" <br>This is to inform you about <b>"+ leave.leave_details.staff.name +"'"+"s"+"</b> new leave application. <br> Reason: "+ leave.leave_details.reason +"<br>"+
																 "<b> From: </b> "+ moment(leave.leave_details.date_from).format('dddd MMM [the] Do YYYY') +" <br> <b> To: </b> "+moment(leave.leave_details.date_to).format('dddd MMM [the] Do YYYY') +" <br><br>"+
																 "Please folow this link to approve or decline this leave application."+
																 " (<a href='"+leave_staff_url+"preapprove/"+leave.leave_details.leave_hash+"' >Here</a>)";
								}else{
									message_body = "Hi, "+ lead.lead_details.staff.name +" <br>This is to inform you about <b>"+ leave.leave_details.staff.name +"'"+"s"+"</b> new leave application.<br>"+
																 "<b> From: </b> "+ moment(leave.leave_details.date_from).format('dddd MMM [the] Do YYYY') +" <br> <b> To: </b> "+moment(leave.leave_details.date_to).format('dddd MMM [the] Do YYYY') +" <br><br>"+
																 "Please folow this link to approve or decline this leave application."+
																 " (<a href='"+leave_staff_url+"preapprove/"+leave.leave_details.leave_hash+"' >Here</a>)";
								}

								var email_helper = require('../config/helper/email-helper');
								email_helper.sendEmail(request, lead_email , subject, message_body, function(response){
										res.json(response);
								});
							//console.log();
					} );
				});

			});
	});

	router.post("/admin_update_staff_leave",function(req,res){
			var leave_hash = req.body.leave_hash;
			var lead_id = req.body.lead_id;
			var leave_type_id = req.body.leave_type_id;
			var date_from = req.body.date_from;
			var date_to = req.body.date_to;
			var reason = req.body.reason;

			model.staff_update_leave(leave_hash, lead_id, leave_type_id, date_from, date_to, reason, function(response){

				model.get_leave(leave_hash,function(leave){
					res.json(leave);
					/*get_lead( leave.leave_details.lead_id, function(lead){
							var lead_email = lead.lead_details.staff.email;
							var subject = "UPDATED Leave Application ("+leave.leave_details.leave_type.text +") by HR Admin.";
							var message_body;
							if(leave.leave_details.reason){
									message_body = "Hi, "+ lead.lead_details.staff.name +" <br>This is to inform you about <b>"+ leave.leave_details.staff.name +"'"+"s"+"</b> new leave application. <br> Reason: "+ leave.leave_details.reason +"<br>"+
																 "<b> From: </b> "+ moment(leave.leave_details.date_from).format('dddd MMM [the] Do YYYY') +" <br> <b> To: </b> "+moment(leave.leave_details.date_to).format('dddd MMM [the] Do YYYY') +" <br><br>"+
																 "Please follow this link to approve or decline this leave application."+
																 " (<a href='"+leave_staff_url+"preapprove/"+leave.leave_details.leave_hash+"' >Here</a>)";
								}else{
									message_body = "Hi, "+ lead.lead_details.staff.name +" <br>This is to inform you about <b>"+ leave.leave_details.staff.name +"'"+"s"+"</b> new leave application.<br>"+
																 "<b> From: </b> "+ moment(leave.leave_details.date_from).format('dddd MMM [the] Do YYYY') +" <br> <b> To: </b> "+moment(leave.leave_details.date_to).format('dddd MMM [the] Do YYYY') +" <br><br>"+
																 "Please follow this link to approve or decline this leave application."+
																 " (<a href='"+leave_staff_url+"preapprove/"+leave.leave_details.leave_hash+"' >Here</a>)";
								}

								var email_helper = require('../config/helper/email-helper');
								email_helper.sendEmail(request, lead_email , subject, message_body, function(response){
										res.json(response);
								});
							//console.log();
					} ); */
				});

			});
	});

	router.post("/admin_update_leave",function(req,res){
		var lead_comment = req.body.lead_comment;
		var status = req.body.status;
		var leave_id = req.body.id;
		var reason_for_declined = req.body.reason_for_declined;
		var staff_email = req.body.email;
		var staff_name = req.body.name;

		model.update(leave_id,status,reason_for_declined,lead_comment, function(response){
			var subject = "Admin leave response ";
			var message_body;
			if(status == 0){
				message_body = "Hi, "+ staff_name +" <br>This is to inform you that your leave application has been declined due to the reason stated below <b>. <br> Reason: "+ reason_for_declined+"<br>"+
					"Regards, ADMIN";

			}else{
				message_body = "Hi, "+ staff_name +" <br>This is to inform you that your leave application has been approved <b>.<br> Regards, ADMIN";
			}

			var email_helper = require('../config/helper/email-helper');
			email_helper.sendEmail(request, staff_email , subject, message_body, function(response){
				res.json(response);
			});


		});
	});

	function get_lead(lead_id, callback ) {

		var lead = model.get_lead(lead_id, function(lead){

				callback(lead);

		});
		return lead;
	 }


	//return a closure which exposes certain methods publicly
	//to allow them to be called from the loginApi variable
	return { get_lead: get_lead,
					 notify_admin_new: notify_admin_new,
				 	 notify_admin_lead_response : notify_admin_lead_response
				 };

}

module.exports = LEAVE_ROUTER;
