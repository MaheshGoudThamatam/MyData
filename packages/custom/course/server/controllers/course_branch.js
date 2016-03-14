'use strict';

/** Name : Course Branch Controller
 * Description : This controller assigns/remove course to/from country, these selected course will be available for all the branches under that country and 
 * 				 further can be assigned to respected branch by branch admin and can be removed.
 * @ <author> Anshu Narayan 
 * @ <date> 14-Feb-2016
 * @ METHODS: branch(), city(), country(), course(), loadCountry(), assignCourseToBranch(), removeCourseFromBranch(), 
 * 			  loadPaymentSchemes(), loadAvailableCoursesForBranch(), showPaymentSchemes(), loadCoursePaymentSchemesForBranch()
 */
require('../../../branch/server/models/branch.js');
require('../../../branch/server/models/city.js');
require('../../../branch/server/models/zone.js');
require('../../../branch/server/models/country.js');
require('../../../course/server/models/course.js');
require('../../../course/server/models/payment_scheme.js');
require('../../../course/server/models/loan.js');
var async = require('async');

var mongoose = require('mongoose'),
	BranchModel = mongoose.model('Branch'),
	CityModel = mongoose.model('City'),
	ZoneModel = mongoose.model('Zone'),
	CountryModel = mongoose.model('Country'),
	CourseModel = mongoose.model('Course'),
	PaymentSchemeModel = mongoose.model('PaymentScheme'),
	LoanModel = mongoose.model('Loan'),
    _ = require('lodash');

module.exports = function (CourseBranch) {

    return {
    	
    	/**
    	 * Load the branch based on Id
    	 */
    	branch: function(req, res, next, id){
    		BranchModel.load(id, function (err, branch) {
                if (err) return next(err);
                if (!branch) return next(new Error('Failed to load branch ' + id));
                req.branch = branch;
                next();
            });
    	},
    	
    	/**
    	 * Load the city based on Id
    	 */
    	city: function(req, res, next, id){
    		CityModel.load(id, function (err, city) {
                if (err) return next(err);
                if (!city) return next(new Error('Failed to load city ' + id));
                req.city = city;
                next();
            });
    	},
    	
    	/**
    	 * Load the country based on Id
    	 */
    	country: function(req, res, next, id){
    		CountryModel.load(id, function (err, country) {
                if (err) return next(err);
                if (!country) return next(new Error('Failed to load country ' + id));
                req.country = country;
                next();
            });
    	},
    	
    	/**
    	 * Load the course based on Id
    	 */
    	course: function(req, res, next, id){
    		CourseModel.load(id, function (err, course) {
                if (err) return next(err);
                if (!course) return next(new Error('Failed to load course ' + id));
                req.course = course;
                next();
            });
    	},
    	
    	/**
    	 * Load the country based on Id
    	 */
    	loadCountry: function (req, res) {
        	CountryModel.findOne({_id: req.country._id}).populate('course').exec(function (err, country) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the country'
                    });
                }

                res.json(country);
            });
        },
    	
        /**
    	 * Assigning course to a branch
    	 */
    	assignCourseToBranch: function(req, res){
    		var courseId = req.params.courseId;
    		var course = req.course;
    		
    		var coursePaymentSchemes = req.body.coursePaymentSchemes;
			delete req.body.coursePaymentSchemes;
			
			var locationId, location; 
			
			if(req.params.branchId){
				locationId = req.params.branchId;
	            location = req.branch;
	            location = _.extend(location, req.body);
	            PaymentSchemeModel.remove({course: courseId, branch: locationId}, function(err, removedPaymentSchemes) {
            		if(err){
            			return res.status(400).send(errors);
            		}
            	});
			}
			if(req.params.countryId){
				locationId = req.params.countryId;
	            location = req.country;
	            location = _.extend(location, req.body);
			}
			
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }     
            location.save(function (err) {            	
            	if (err) {
                    switch (err.code) {
                        case 11000:
                        case 11001:
                            res.status(400).json([
                                ERRORS.ERROR_001
                            ]);
                            break;
                        default:
                            var modelErrors = [];

                            if (err.errors) {
                                for (var x in err.errors) {
                                    modelErrors.push({
                                        param: x,
                                        msg: err.errors[x].message,
                                        value: err.errors[x].value
                                    });
                                }
                                res.status(400).json(modelErrors);
                            } else {
                            	console.log(err);
                            }
                    }
                    return res.status(400);
                }
            	
            	async.each(coursePaymentSchemes, function(paymentScheme, callback) {
            		var paymentSchemeData = {
            				course : courseId,
            				cost : paymentScheme.cost,
            				paymentScheme: paymentScheme.paymentSchemeName,
            				installments : []
            		};
            		if(req.params.branchId){
            			paymentSchemeData.branch = locationId;
            		}
            		if(req.params.countryId){
            			paymentSchemeData.country = locationId;
            		}
            		async.each(paymentScheme.installments, function(installmentObj, callback) {
            			var installment = {
                        	paymentFor : installmentObj.paymentFor,
                        	installmentAmount : installmentObj.installmentAmount,
                        	isLoan : installmentObj.isLoan,
                        	discounts : []
                        };
            			if(installmentObj.paymentFor === 'Down Payment'){
                        	installment.isDownPayment = true;
                        } else {
                        	installment.isDownPayment = false;
                        }
                        if(installmentObj.fineAmount){
                        	installment.fineAmount = installmentObj.fineAmount;
                        }
                        if(installmentObj.dueDate){
                        	installment.dueDate = installmentObj.dueDate;
                        }
                        
                        if(installmentObj.isLoan){
	            			var loanData = {
	                			payment_for: installmentObj.paymentFor,
	                			loan_amount: installmentObj.installmentAmount
	                		}
	            			var loan = new LoanModel(loanData);
	            			installment.loanId = loan._id;
	            			loan.save(function (err) {
	                            if (err) {
	                                console.log("Error : " + err);
	                            }
	                        });
                        }
                        async.each(installmentObj.discounts, function(discount, callback) {
                        	installment.discounts.push(discount);
                        });
                        paymentSchemeData.installments.push(installment);
            		});
            		
                    var paymentSchemeObj = new PaymentSchemeModel(paymentSchemeData);
                    paymentSchemeObj.save(function (err) {
                        if (err) {
                            console.log("Error : " + err);
                        }
                    });
                });
            	
            	
            	res.json(location);
            });
        },
        
        /**
    	 * Remove course from branch
    	 */
        removeCourseFromBranch: function(req, res){
        	var courseId = req.params.courseId;
    		var course = req.course;
    		var location;
    		var query = {};
    		query.course = courseId;
    		if(req.params.branchId){
    			query.branch = req.params.branchId;
    			location = req.branch;
    			for(var i = 0; i < location.course.length; i++){
            		if(JSON.stringify(location.course[i]._id) === JSON.stringify(courseId)){
            			location.course.splice(i, 1);
            			break;
            		}
            	}
    		}
    		if(req.params.countryId){
    			query.branch = req.params.countryId;
    			location = req.country;
    			for(var i = 0; i < location.course.length; i++){
            		if(JSON.stringify(location.course[i]) === JSON.stringify(courseId)){
            			location.course.splice(i, 1);
            			break;
            		}
            	}
    		}
        	
        	location.save(function (err) {            	
            	if (err) {
                    switch (err.code) {
                        case 11000:
                        case 11001:
                            res.status(400).json([
                                ERRORS.ERROR_001
                            ]);
                            break;
                        default:
                            var modelErrors = [];

                            if (err.errors) {
                                for (var x in err.errors) {
                                    modelErrors.push({
                                        param: x,
                                        msg: err.errors[x].message,
                                        value: err.errors[x].value
                                    });
                                }
                                res.status(400).json(modelErrors);
                            } else {
                            	console.log(err);
                            }
                    }
                    return res.status(400);
                }
            	PaymentSchemeModel.find(query, function(err, paymentSchemes) {
            		if (err) {
                        console.log("Error : " + err);
                    }
	            	async.each(paymentSchemes, function(paymentScheme, callback) {
	            		PaymentSchemeModel.findOne({_id: paymentScheme._id}, function(err, paymentScheme) {
	            			if (err) {
	                            console.log("Error : " + err);
	                        }
	            			async.each(paymentScheme.installments, function(installment, callback) {
	            				LoanModel.remove({_id: installment.loanId}, function(err, removedCount) {
	                    			if (err) {
	                                    console.log("Error : " + err);
	                                }
	                    			if(removedCount){
	                    				console.log(removedCount + " Loan document removed ");
	                    			}
	                    		});
	            			});
	            			PaymentSchemeModel.remove({_id: paymentScheme}, function(err, removedCount) {
	                			if (err) {
	                                console.log("Error : " + err);
	                            }
	                			if(removedCount){
	                				console.log(removedCount + " Payment Scheme document removed ");
	                			}
	                		});
	            		});
	            	});
            	});
            	if(req.params.countryId){
	            	CountryModel.findOne({_id: location._id}).populate('course').exec(function(err, countryDetail) {
	            		if (err) {
	                        console.log("Error : " + err);
	                    }
	            		res.json(countryDetail);
	            	});
            	}
            	if(req.params.branchId){
	            	BranchModel.findOne({_id: location._id}).populate('course').exec(function(err, branchDetail) {
	            		if (err) {
	                        console.log("Error : " + err);
	                    }
	            		res.json(branchDetail);
	            	});
            	}
            });
    	},
    	
    	/**
    	 * Load Payment Scheme
    	 */
    	loadPaymentSchemes: function(req, res){
    		var course = req.course;
    		var query = {};
    		if(course){
    			query.course = course._id;
    		}
    		PaymentSchemeModel.find(query, function(err, paymentSchemes) {
        		if (err) {
                    console.log("Error : " + err);
                }
        		res.json(paymentSchemes);
    		});
    	},
    	
    	/**
    	 * Load Available Courses For Branch
    	 */
    	loadAvailableCoursesForBranch: function(req, res){
    		var branch = req.branch;
    		var query = {};
    		if(branch){
    			query._id = branch._id;
    		}
    		BranchModel.findOne(query, function(err, branch) {
        		if (err) {
                    console.log("Error : " + err);
                }
        		CityModel.findOne({_id: branch.city}, function(err, city) {
            		if (err) {
                        console.log("Error : " + err);
                    }
            		ZoneModel.findOne({_id: city.zone}, function(err, zone) {
                		if (err) {
                            console.log("Error : " + err);
                        }
                		CountryModel.findOne({_id: zone.country}).populate('course').exec(function(err, country) {
                    		if (err) {
                                console.log("Error : " + err);
                            }
                    		res.json(country);
                		});
            		});
        		});
    		});
    	},
    	
    	/**
    	 * Show Payment Schemes
    	 */
        showPaymentSchemes: function(req, res){
            var course = req.course;
            var query = {};
            if(course){
                query.course = course._id;
            }
            PaymentSchemeModel.find(query).deepPopulate(['loanId','installments.loanId']).exec(function(err, paymentSchemes) {
                if (err) {
                    console.log("Error : " + err);
                }
                res.json(paymentSchemes);
            });
        },
        
        /**
    	 * Load Course Payment Schemes For Branch
    	 */
        loadCoursePaymentSchemesForBranch: function(req, res){
            var course = req.course;
            var branch = req.branch;
            var query = {};
            query.course = course._id;
            query.branch = branch._id;
            PaymentSchemeModel.find(query).deepPopulate(['loanId','installments.loanId']).exec(function(err, paymentSchemes) {
                if (err) {
                    console.log("Error : " + err);
                }
                res.json(paymentSchemes);
            });
        },
    	
    };
}