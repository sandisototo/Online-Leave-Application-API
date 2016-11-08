function ADMIN_ROUTER(router,bookshelf, md5) {
    var self = this;
    var model = require('../models/admin_model');
    model.setBookshelf(bookshelf);

    self.handleRoutes(router, md5, model);
}

ADMIN_ROUTER.prototype.handleRoutes= function(router, md5, model) {

  router.get("/index",function(req,res){
        res.json({"Message" : "Admin controller"});
  });


  router.post("/login",function(req,res){
     


      var username = req.body.username;
      var password = req.body.password;

      console.log(password);

      model.validate_user_credintials(username,password, function(response){

          res.json(response);

      });



  });


};

module.exports = ADMIN_ROUTER;
