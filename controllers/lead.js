function LEAD_ROUTER(router,bookshelf) {
	var self = this;
	var model = require('../models/lead_model');
	model.setBookshelf(bookshelf);
	self.handleRoutes(router, model);
}

LEAD_ROUTER.prototype.handleRoutes = function(router, model) {

	router.get("/index", function (req, res) {
		res.json({"Message": "Lead Controller"});
	});

	router.get("/get_all_leads", function (req, res) {
		model.get_all(function (response) {
			res.json(response);
		});
	});

  router.post("/add_lead",function(req,res){
      //Grab post values
      var staff_id = req.body.staff_id;
      model.add_lead(staff_id,function (response) {
  			res.json(response);
  		});
  });

}


module.exports = LEAD_ROUTER;
