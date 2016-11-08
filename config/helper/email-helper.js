function sendEmail(request,person_to, subject, message, callback ){
  var global  = require('../../config/global');

  var message_api_url = global.enviroment.api_urls.message_api_url;

  var mailOptions = {
        "project_name" : "hr", // sender address
        "person_to" : person_to, // list of receivers
        "subject" : subject, // Subject line
        "message" : message // plaintext body
    };
    var formData = mailOptions;
    var contentLength = formData.length;
    request({
        headers: {
          'Content-Length': contentLength,
          'Content-Type': 'application/json',
        },
        url:message_api_url+'email/new',
        json: formData,
        method: 'POST'
      }, function (err, httpResponse, body) {
        var data;
        if (err) {
          data = {"status" : false, "description" : "Post Failed", "server_response" : err};
          console.log('post failed:', err);
          return callback(data);
      }else{
        data = {"status" : true, "description" : "Post successful!", "server_response" : body};
        console.log('Post successful!  server_response:', body);
        return callback(data);
      }

      });
};


// declaring function as a global function
exports.sendEmail = sendEmail;
