'use strict';
/**
 * Module dependencies.
 */

var validation = require('../../../../core/system/server/controllers/validationUtil.js');


var mongoose = require('mongoose'), 
	PaymentscheduleModel = mongoose.model('PaymentScheme'),
	CourseModel = mongoose.model('Course'),
	StudentModel = mongoose.model('User'),
	PaymentSchemeModel= mongoose.model('PaymentScheme'),
	CourseRequestModel=mongoose.model('CourseRequest'),
	_ = require('lodash');

module.exports = function (PaymentscheduleCtrl) {
    return {
    	
    	  paymentschedule: function (req, res, next, id) {
    		  PaymentscheduleModel.load(id, function (err, paymentschedule) {
                  if (err) return next(err);
                  if (!paymentschedule) return next(new Error('Failed to load paymentschedule ' + id));
                  req.paymentschedule = paymentschedule;
                  next();
              });
          },
           
        /**
         * Find course by id
         */
    	course: function (req, res, next, id) {
        	CourseModel.load(id, function (err, course) {
                if (err) {
                    return next(err);
                }
                if (!course) {
                    return next(new Error('Failed to load course ' + id));
                }
                req.course = course;
                next();
            });
        },
        
        /**
         * Find student by id
         */
        student: function (req, res, next, id) {
    		StudentModel.load(id, function (err, student) {
                if (err) {
                    return next(err);
                }
                if (!student) {
                    return next(new Error('Failed to load student ' + id));
                }
                req.student = student;
                next();
            });
        },
           
        paymentSchedule: function (req, res,next,id ) {
        	PaymentscheduleModel.load(id, function (err, paymentSchedule) {
                if (err) {
                    return next(err);
                }
                if (!paymentSchedule) {
                    return next(new Error('Failed to load paymentSchedule ' + id));
                }
                req.paymentSchedule = paymentSchedule;
                next();
            });
        },
               
        /**
         * selectPaymentschedule
         * */
       
          selectPaymentschedule: function(req, res){
            var courseId = req.params.courseId;
	        var studentId = req.params.studentId;
	        var paymentSchemeId = req.query.paymentSchemeId;
	        var query = {};
	        query.course = courseId;
	        query.user = studentId;
	        CourseRequestModel.findOne(query).populate('paymentscheme').populate('batch').exec(function (err, courseRequest){
	            if (err) {
	                return res.status(500).json({
	                    error: 'Cannot find the courseRequest'
	                });
	            }
	            
	           var paymentScheme = courseRequest.paymentscheme;
	           var batch = courseRequest.batch;  
	            var courseRequestObj = {};
	            courseRequestObj.test = [];
	            var testObj = {};
	            var paymentSchedule = {};
	            paymentSchedule.installments = [];
	            paymentSchedule.courseRequest = courseRequest._id;
	            paymentSchedule.cost = paymentScheme.cost;
	            testObj.marks_obtained = 70;
	            courseRequestObj.test.push(testObj);
	            var payDate = new Date(batch.start_date);
	            var paymentInstallment = paymentScheme.installments;
	            for(var i=0; i<paymentInstallment.length; i++ )
	            {   
	            	var installment = {};
	            	installment.paymentFor = paymentInstallment[i].paymentFor;
	            	installment.isDownPayment = paymentInstallment[i].isDownPayment;
	            	installment.paid=false;
	            	if(paymentInstallment[i].isLoan){
	            		installment.isLoan = paymentInstallment[i].isLoan;
		            	installment.loanId =  paymentInstallment[i].loanId;	
	            	}
	            	installment.dueDays = paymentInstallment[i].dueDate;
	            	installment.fineAmount = paymentInstallment[i].fineAmount;
	        
	            	if(paymentInstallment[i].isDownPayment){
	            		installment.dueDate = new Date(payDate);	
	            	}
	            	else{
	            		var dueday = paymentInstallment[i].dueDate;
	            		var dueDate = new Date(payDate);
		            	dueDate.setDate(dueDate.getDate()+ dueday);
		            	installment.dueDate = dueDate;
	            	}
	            	    var fineamount, fine, discountamount;
		            	var date1 = new Date(Date.now());
					    var date2 = new Date(dueDate);
	            		var diff = Math.floor(date1.getTime() - date2.getTime());
					    var day = 1000 * 60 * 60 * 24;
					    var days = Math.floor(diff/day);
					    if(days>0){
		            		fineamount = paymentInstallment[i].fineAmount;
		            		fine = (fineamount*days);
					       }
		            		else{
		            		       fine=0;
		            		      }
					    installment.fineCharge = fine;
					    installment.amount = paymentInstallment[i].installmentAmount;
	            	var amount = paymentInstallment[i].installmentAmount;
	            	 var discount = paymentInstallment[i].discounts;
	            	 for(var j=0; j<discount.length; j++){
		            		var min = discount[j].marks_form;
		   	            	var max = discount[j].marks_to;
		   	            	if(min < courseRequestObj.test[0].marks_obtained && courseRequestObj.test[0].marks_obtained <= max ){
		   	            		var Rate = discount[j].rate;
		   	            		 discountamount = (amount*Rate)/100;
		   	            		
		   	            	}
		   	            	else{
		   	            	      discountamount = 0;
		   	            	}
	            	     }	 
	            	 installment.discountAmount = discountamount;
	            	 var totalamount = amount-discountamount+fine;
	            	 installment.totalAmount = totalamount;
	               	 paymentSchedule.installments.push(installment);
	            
	            }
	            var paymentSchedule = new PaymentscheduleModel(paymentSchedule);
	            paymentSchedule.save(function(err) {
	                if (err) {
	                    console.log("err:" + err);
	                   } 
	               })
	               res.json(paymentSchedule);
          });
        },
        
        /**
         * loadPaymentSchedule
         * */
        loadPaymentSchedule : function(req, res){
            var courseId = req.params.courseId;
	        var studentId = req.params.studentId;
	        var paymentSchemeId = req.query.paymentSchemeId;
	        var query = {};
	        query.course = courseId;
	        query.user = studentId;
	        CourseRequestModel.findOne(query).populate('paymentscheme').populate('batch').exec(function (err, courseRequest){
	            if (err) {
	                return res.status(500).json({
	                    error: 'Cannot load the courseRequest'
	                });
	            }
	            var paymentScheme = courseRequest.paymentscheme;
	            PaymentscheduleModel.findOne({courseRequest: courseRequest._id}).populate('paymentscheme').populate('batch').exec(function (err, paymentSchedule){
		            if (err) {
		                return res.status(500).json({
		                    error: 'Cannot find the paymentSchedule'
		                });
		            }
		           var batch = courseRequest.batch;  
		            var payDate = new Date(batch.start_date);
		            var paymentInstallment = paymentSchedule.installments;
		            for(var i=0; i<paymentInstallment.length; i++ )
 		            {
						paymentInstallment[i].paymentFor = paymentInstallment[i].paymentFor;
						paymentInstallment.isDownPayment = paymentInstallment[i].isDownPayment;
                      if(paymentInstallment[i].isLoan){
                    	  paymentInstallment[i].isLoan = paymentInstallment[i].isLoan;
  						  paymentInstallment[i].loanId = paymentInstallment[i].loanId;
                      }    
						paymentInstallment[i].dueDays = paymentInstallment[i].dueDays;
						if(paymentInstallment[i].paid){
							paymentInstallment[i].paidDate =new Date(Date.now());
						}
						else{
							paymentInstallment[i].paid=paymentInstallment[i].paid;
						}
						
						if (paymentInstallment[i].isDownPayment) {
							paymentInstallment[i].dueDate = new Date(payDate);
						} else {

							var dueday = paymentInstallment[i].dueDays;
							var dueDate = new Date(payDate);
							dueDate.setDate(dueDate.getDate() + dueday);
							paymentInstallment[i].dueDate = dueDate;
						}
						var fineamount, fine;
						var date1 = new Date(Date.now());
						var date2 = new Date(dueDate);
						var diff = Math.floor(date1.getTime()- date2.getTime());
						var day = 1000 * 60 * 60 * 24;
						var days = Math.floor(diff/ day);
						if (days > 0) {
							fineamount = paymentInstallment[i].fineAmount;
							fine = (fineamount * days);
						} else {
							fine = 0;
						}

						paymentInstallment[i].fineCharge = fine;
						paymentInstallment[i].amount = paymentInstallment[i].amount;
						var amount = paymentInstallment[i].amount;
						var discount = paymentInstallment[i].discountAmount;
						
						var totalamount = amount - discount + paymentInstallment[i].fineCharge;
						paymentInstallment[i].totalAmount = totalamount;

					}
		            paymentSchedule.save(function(err) {
		                if (err) {
		                    console.log("err:" + err);
		                   } 

			            res.json(paymentSchedule);
		            });
	           });
          });
	        
	       
        },
        
        payNow: function(req, res){
        	var paymentScheduleId = req.paymentSchedule._id;
        	var installmentId = req.query.installmentId;
        	var remarks = '';
        	if(req.body){
        		for(var i = 0; i < req.body.installments.length; i++){
	            	if(JSON.stringify(req.body.installments[i]._id) === JSON.stringify(installmentId)){
	            		remarks = req.body.installments[i].remarks;
	            		break;
	            	}
	            }
        	}
        	var query = {};
        	query._id = paymentScheduleId;
        	PaymentscheduleModel.findOne(query).exec(function (err, paymentSchedule){
	            if (err) {
	                return res.status(500).json({
	                    error: 'Cannot find the paymentSchedule'
	                });
	            }
	            for(var i = 0; i < paymentSchedule.installments.length; i++){
	            	if(JSON.stringify(paymentSchedule.installments[i]._id) === JSON.stringify(installmentId)){
	            		paymentSchedule.installments[i].paid = true;
	            		paymentSchedule.installments[i].remarks = remarks;
	            	}
	            }
	            paymentSchedule.save(function(err) {
	                if (err) {
	                    console.log("err:" + err);
	                   } 
		            res.json(paymentSchedule);
	            });
        	});
        }
        
    }
}