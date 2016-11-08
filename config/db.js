function setUpKnex(parent){
  var global  = require('./../config/global');
  var db_details = {};
  if(global.enviroment.api_urls.state === "dev"){

    db_details = {
      host     : 'localhost',
      user     : 'root',
      password : '',
      database : 'leave',
      charset  : 'utf8'
    };

  }else {
    db_details = {
      host     : '127.0.0.1',
      user     : 'root',
      password : 'leave-admin',
      database : 'rlabs_leave',

//      host     : '173.194.107.50',
//      user     : 'vm_user',
//      password : 'e2GY3vB8b885eBo',
//      database : 'rlabs_leave',
      charset  : 'utf8'
    };
  }

  var knex = require('knex')({
    client: 'mysql',
    connection:  db_details
  });
  var Bookshelf = require('bookshelf')(knex);
  parent.configureExpress(Bookshelf);
}

// declaring function as a global function
exports.setUpKnex = setUpKnex;
