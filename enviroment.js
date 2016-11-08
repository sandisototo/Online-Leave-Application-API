var enviroment = "dev";

var api_urls = {};
if(enviroment === "dev"){
      api_urls = {
        message_api_url : "http://localhost:4000/",
        leave_staff_url : "http://localhost:8080/",
        state: "dev"
      }

}else{

  api_urls = {
    message_api_url : "http://mapi.rlabs.org/",
    leave_staff_url : "http://leave.rlabs.org/",
    state:"live"
  }

}

// declaring variable as a global function
exports.api_urls = api_urls;
