'use strict';

/**
 * Module dependencies.
 */

require('../../../../custom/investor/server/models/investor_policy.js');
var utility = require('../../../../core/system/server/controllers/util.js');

var async = require('async');
var mongoose = require('mongoose'),
    UserModel = mongoose.model('User'),
    InvestorPolicyModel = mongoose.model('InvestorPolicy'),
    _ = require('lodash');

module.exports = function (AdminPolicy) {

    return {
        	
    	policyRequest: function(req, res, next, id){
    		InvestorPolicyModel.load(id, function(err, policyRequest) {
				if (err) {
					return next(err);
				}
				if (!policyRequest) {
					return next(new Error('Failed to load Policy Request ' + id));
				}
				req.policyRequest = policyRequest;
				next();
			});
    	},
    	
    	loadPolicyRequest: function(req, res){
    		res.json(req.policyRequest);
    	},
    	
		/**
         * List of policy request as by pagination
         */
		policyRequestListByPagination: function (req, res) {
           var populateObj = {user: ''};
           var query = {};
           utility.pagination(req, res, InvestorPolicyModel, query, {}, populateObj, function(result){
               if(utility.isEmpty(result.collection)){
                   //res.json(result);
               }
               return res.json(result);
           });
       },
       
       /**
        * Update a Policy Request Status
        */
       updatePolicyRequestStatus: function (req, res) {
           var policyRequestObj = req.policyRequest;
           var policyRequest = _.extend(policyRequestObj, req.body);

           var errors = req.validationErrors();
           if (errors) {
               return res.status(400).send(errors);
           }

           policyRequest.save(function (err) {
               if (err) {
                   res.status(400).json(err);
               }
               res.json(policyRequest);
           });
       },
       
       /**
        * Pay a Policy Request for Investor
        */
       payPolicyRequest: function (req, res) {
           var policyRequestObj = req.policyRequest;
           var policyRequest = _.extend(policyRequestObj, req.body);

           var errors = req.validationErrors();
           if (errors) {
               return res.status(400).send(errors);
           }
           policyRequest.save(function (err) {
               if (err) {
                   res.status(400).json(err);
               }
               res.json(policyRequest);
           });
       },
        /* Create Policy*/
        assignPolicy: function (req, res) {
          for(var i = 0; i<req.body.assignedPolicies.length;i++){
            var investorpolicy = {};
            investorpolicy.policy = req.body.assignedPolicies[i].policy._id;
            investorpolicy.policy_amount = req.body.assignedPolicies[i].policyamount;
            investorpolicy.user = req.body.assignedPolicies[i].user;
            investorpolicy.assigned_by = req.body.assignedPolicies[i].assigned_by;
            investorpolicy.fund_control = req.body.assignedPolicies[i].fund_control;
            investorpolicy.auto_renewal = req.body.assignedPolicies[i].autorenewal;
            if(req.body.assignedPolicies[i].paymentstatus){
            investorpolicy.policy_payment_status = "Paid";
            }
            else{
              investorpolicy.policy_payment_status = "Pending";
            }
            var investorpolicy = new InvestorPolicyModel(investorpolicy);
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            investorpolicy.save(function (err) {
                if (err) {
                    return validation.exportErrorResponse(res, err, ERRORS.ERROR_1401);
                }
                res.json(investorpolicy);
            });
          }
          res.send(200);
        },
       
    };
}