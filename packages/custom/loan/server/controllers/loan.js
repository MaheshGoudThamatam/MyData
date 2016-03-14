var https =require('https');
var async = require('async');
module.exports = function(Loan, app) {
return {
	createloan: function(req, res) {
		async.waterfall([
                 function(done) {
			      var loandetails={
					"clientId": "6",
					"dateFormat": "dd MMMM yyyy",
					"disbursementData": [],
					"expectedDisbursementDate": "28 February 2016",
					"amortizationType": 1,
					"fundId": 1,
					"interestCalculationPeriodType": 1,
					"interestRatePerPeriod": 26,
					"interestType": 1,
					"loanTermFrequency": 25,
					"loanTermFrequencyType": 1,
					"loanType": "individual",
					"locale": "en",
					"numberOfRepayments": 25,
					"principal": 10000,
					"productId": 1,
					"repaymentEvery": "1",
					"repaymentFrequencyType": 1,
					"submittedOnDate": "26 February 2016",
					"transactionProcessingStrategyId": 1
					};

				var options = {
					  host: '172.17.24.79',
					  path: '/mifosng-provider/api/v1/loans',
					  port: '8443',
					  method: 'POST',
					  rejectUnauthorized: false,
			          requestCert: true,
			          agent: false,
					//  This is the only line that is new. `headers` is an object with the headers to request
					  headers: {'Content-Type':'application/json','X-Mifos-Platform-TenantId':'default','Authorization':'Basic bWlmb3M6cGFzc3dvcmQ='}
					};

					callback = function(response) {
					  var str = ''
					  response.on('data', function (chunk) {
					     str += chunk;
					  });

					  response.on('end', function () {
					    res.send(str);
					    done();
					  });
					}

					var req = https.request(options, callback);
				    req.write(JSON.stringify(loandetails));
					req.end();

                 }], function(err) {}); 

	
        },

        getpartculerloan: function(req, res) {

        	async.waterfall([
                 function(done) {
	                 	https.get({
				          host: '172.17.24.79',
						  path: '/mifosng-provider/api/v1/loans/22',
						  port: '8443',
						  method: 'GET',
						  rejectUnauthorized: false,
				          requestCert: true,
				          agent: false,
			              //  This is the only line that is new. `headers` is an object with the headers to request
			              headers: {'Content-Type':'application/json','X-Mifos-Platform-TenantId':'default','Authorization':'Basic bWlmb3M6cGFzc3dvcmQ='}
				    }, function(response) {
				        // Continuously update stream with data
				        var body = '';
				        response.on('data', function(d) {
				            body += d;
				       });
				       response.on('end', function() {

			            // Data reception is done, do whatever with it!
			            var parsed = JSON.parse(body);
	                        res.send(parsed);
	                        done();
				        });
				    });

                 }], function(err) {}); 

        },
        approveloan: function(req, res) {

        	async.waterfall([
                function(done) {
		             var loandetails={
						"approvedOnDate": "29 February 2016",
						"approvedLoanAmount": 10000,
						"expectedDisbursementDate": "29 February 2016",
						"disbursementData": [],
						"locale": "en",
						"dateFormat": "dd MMMM yyyy"
					 };

				var options = {
					  host: '172.17.24.79',
					  path: '/mifosng-provider/api/v1/loans/22?command=approve',
					  port: '8443',
					  method: 'POST',
					  rejectUnauthorized: false,
			          requestCert: true,
			          agent: false,
					//  This is the only line that is new. `headers` is an object with the headers to request
					  headers: {'Content-Type':'application/json','X-Mifos-Platform-TenantId':'default','Authorization':'Basic bWlmb3M6cGFzc3dvcmQ='}
					};

					callback = function(response) {
					  var str = ''
					  response.on('data', function (chunk) {
					     str += chunk;
					  });

					  response.on('end', function () {
					    res.send(str);
					    done();
					  });
					}

					var req = https.request(options, callback);
				    req.write(JSON.stringify(loandetails));
					req.end();

                 }], function(err) {}); 

        },

        rejectloan: function(req, res) {

        	async.waterfall([
                 function(done) {
                 	var loandetails={
						"rejectedOnDate": "01 March 2016",
			            "note": "He his not eligible.",
			            "locale": "en",
			            "dateFormat": "dd MMMM yyyy"
			          };

					var options = {
						  host: '172.17.24.79',
						  path: '/mifosng-provider/api/v1/loans/22?command=reject',
						  port: '8443',
						  method: 'POST',
						  rejectUnauthorized: false,
				          requestCert: true,
				          agent: false,
						//  This is the only line that is new. `headers` is an object with the headers to request
						  headers: {'Content-Type':'application/json','X-Mifos-Platform-TenantId':'default','Authorization':'Basic bWlmb3M6cGFzc3dvcmQ='}
						};

						callback = function(response) {
						  var str = ''
						  response.on('data', function (chunk) {
						     str += chunk;
						  });

						  response.on('end', function () {
						    res.send(str);
						    done();
						  });
						}

						var req = https.request(options, callback);
					    req.write(JSON.stringify(loandetails));
						req.end();

		                 }], function(err) {}); 
              },
         undoapproval: function(req, res) {

         	async.waterfall([
                 function(done) {

	                var loandetails={
					    "note": "Loan undo approval note"
				     };

					var options = {
						  host: '172.17.24.79',
						  path: '/mifosng-provider/api/v1/loans/22?command=undoApproval',
						  port: '8443',
						  method: 'POST',
						  rejectUnauthorized: false,
				          requestCert: true,
				          agent: false,
						//  This is the only line that is new. `headers` is an object with the headers to request
						  headers: {'Content-Type':'application/json','X-Mifos-Platform-TenantId':'default','Authorization':'Basic bWlmb3M6cGFzc3dvcmQ='}
						};

					callback = function(response) {
					  var str = ''
					  response.on('data', function (chunk) {
					     str += chunk;
					  });

					  response.on('end', function () {
					    res.send(str);
					    done();
					  });
					}

					var req = https.request(options, callback);
				    req.write(JSON.stringify(loandetails));
					req.end();

	                 }], function(err) {}); 	 

          }
	  }
	};