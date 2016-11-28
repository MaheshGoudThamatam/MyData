var http = require('http');
var config = require('meanio').loadConfig();

var exports = {
    send: function(to, msg, callback) {
    	console.log(to);
        return http.get({
            host: 'enterprise.smsgupshup.com',
            path: '/GatewayAPI/rest?method=SendMessage&send_to=' + to + '&msg=' + encodeURIComponent(msg) + '&msg_type=TEXT&userid=' + config.sms.userId + '&auth_scheme=plain&password=' + config.sms.password + '&v=1.1&format=text'
        }, function(response) {
            var body = '';
            response.on('data', function(d) {
                body += d;
            });
            response.on('end', function() {
                console.log(body);
                // Data reception is done, do whatever with it!
                if(body.indexOf('success') > -1) {
                    callback(true);
                } else {
                    callback(false);
                }
            });
        });
    }
};

module.exports = exports;