var global  = require('./config/global');
var config  = require('./config/config');
var db      = require('./config/db');

function REST(){
  var self = this;
  self.connectMysql();
};

REST.prototype.connectMysql = function() {
  //var pool = db.setUpDB(this, global.mysql);
  var pool = db.setUpKnex(this);
}

REST.prototype.configureExpress = function(bookshelf) {
  var self = this;
  global.app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
  });

  global.app.use(global.bodyParser.urlencoded({ extended: true }));
  global.app.use(global.bodyParser.json());
  var router = global.express.Router();

  router.get('', function(req, res){
    res.json({ message: 'RLabs Leave System API!' });
  });
  // register controllers
  global.app.use('/admin', router);
  global.app.use('/staff', router);
  global.app.use('/leave', router);
  global.app.use('/leave_type', router);
  global.app.use('/lead', router);

  //  global.app.use('/test', router);


  // setup routers / controllers
  //var test_router = new config.test(router, bookshelf, global.md5);

  var admin_router    = new config.admin(router, bookshelf, global.md5);
  var staff_router      = new config.staff(router, bookshelf, global.request);
  var leave_router      = new config.leave(router, bookshelf,  global.moment, global.request );
  var leave_type_router   = new config.leave_type(router, bookshelf, global.md5);
  var lead_router   = new config.lead(router, bookshelf);


  self.startServer();
}

REST.prototype.startServer = function() {
  global.app.listen(3000,function(){
    console.log("All right ! I am alive at Port 3000.");
  });
}

REST.prototype.stop = function(err) {
  console.log("ISSUE WITH MYSQL \n" + err);
  process.exit(1);
}



new REST();
