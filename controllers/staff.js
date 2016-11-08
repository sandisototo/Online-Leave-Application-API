function STAFF_ROUTER(router, bookshelf, request) {
	var self = this;
	var model = require('../models/staff_model');
	model.setBookshelf(bookshelf);
	const crypto = require('crypto');

	self.handleRoutes(router, model, crypto, request);
}

STAFF_ROUTER.prototype.handleRoutes= function(router, model, crypto, request) {

	router.get("/index",function(req,res){
      res.json({"Message" : "Staff Controller"});
  });

	

	router.post("/staff_login",function(req,res){
      var email = req.body.email;
      var password = req.body.password;

      model.validate_user_credintials(email,password, function(response){
							res.json(response);
			});

  });

	router.post("/reset_password",function(req,res){
			var email = req.body.email;
			 
			const secret = 'abcdefg';
		  const new_password = 'rlabs'+crypto.randomBytes(4, secret).toString('hex');
			//res.json(new_password); return false;
			model.reset_password(email, new_password, function(response){
								//res.json(email); return false;
							if(response.status){

								var subject = "RLabs Leave Application (Reset Password) ";
								var message_body = response.description+"<br><br>"+
																	 "This is your new password: <b>"+new_password+"</b>";
								var email_helper = require('../config/helper/email-helper');
										email_helper.sendEmail(request, email , subject, message_body, function(response){});

										 res.json(response);

							}else{
											res.json(response);
							}
			});

	});

	router.get("/limits/:leave_type_id/:staff_id",function(req,res){

		var leave_type_id =req.params.leave_type_id;
		var staff_id = req.params.staff_id;

		model.limits(leave_type_id,staff_id, function(response){

			res.json(response);

		});

	});


	router.post("/get_staff_member",function(req,res){

		var staff_id = req.body.staff_id;
		model.get_staff_member(staff_id,function(response){
			res.json(response);
		});
});

	router.get("/get_all_staff",function(req,res){
		model.get_all_staff(function(response){
			res.json(response);
		});

	});

	router.post("/add_staff",function(req,res){

		var name = req.body.name;
		var surname = req.body.surname;
        var id_number = req.body.id_number;
        var email = req.body.email;
		//res.json(req.body);


		model.add_new_staff(name,surname,id_number,email, function(response){
			res.json(response);
		});
	});

    router.post("/update_staff",function(req,res){
        var name = req.body.name;
        var surname = req.body.surname;
        var id_number = req.body.id_number;
        var email = req.body.email;
        var staff_id = req.body.staff_id;

        model.update_staff(staff_id,name,surname,id_number,email, function(response){

        res.json(response);
        });
    });


    router.post("/disable_staff",function(req,res){

    	var staff_id = req.body.staff_id;
    	var status = req.body.status;
    	
    	model.disable_staff(staff_id,status,function(response){

    		res.json(response);

    	});
	});

    router.post("/email_broadcast_staff",function(req,res){
					var email_helper = require('../config/helper/email-helper');

					var subject = req.body.subject;
		    		var message_body = req.body.message_body;
		    		var to_person;
		    		var check_email;
		    		var count = 0;

    		model.get_all_staff(function(staff_list){

    			//res.json(staff_list);
    			//console.log(staff_list);
    				for (var i = 0, len = staff_list.stuff_members.length; i < len; i++) {
  					

  							check_email = staff_list.stuff_members[i].email;
  							if(check_email != ""){

	  							to_person = staff_list.stuff_members[i].email;
	  						
	  							send_email(request ,to_person,subject,message_body);

	  							count ++;
  							}

						}
							res.json("A broadcast  Email was successfully sent to "+count+" staff members");



    					});	

    		function send_email(request ,to_person,subject,message_body){


		    				email_helper.sendEmail(request, to_person , subject, message_body, function(response){
							if(response.status){

									console.log("Success: Email Sent to "+to_person);

								}else{


									console.log("Error: Email Not Sent to "+to_person);

							}


							});

    						}

			return {send_email: send_email};

			});
}
module.exports = STAFF_ROUTER;
