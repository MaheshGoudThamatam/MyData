'use strict';

/* jshint -W098 */
/** Name : Course Branch Controller
 * Description : This controller assigns/remove course to/from country, these selected course will be available for all the branches under that country and 
 * 				 further can be assigned to respected branch by branch admin and can be removed.
 * @ <author> Anshu Narayan 
 * @ <date> 14-Feb-2016
 * @ METHODS: loadLocationList(), listCountries(), listCountries(), countryFilter(), branchFilter(), loadCountryAvailableCourse(), loadCountrySelectedCourse(), loadBranchAvailableCourse(), 
 * 			  loadBranchSelectedCourse(), loadBranchSelectedCourse(), assign(), ok(), disablingAssign(), remove(), exceedingValidation(), discountBoundry(), marksFromBoundry(), marksToBoundry(), 
 * 			  wholeFormValidationCheck(), installmentSummedToCost(), summit(), cancel(), back(), getLabel(), loadCoursePaymentSchemesForBranch(), intializeNewPaymentScheme(), 
 * 			  intializeNewPaymentScheme(), initializeDesignedPaymentScheme(), intializePaymentScheme(), addPaymentScheme(), removePaymentScheme(), addInstallment(), removeInstallment(),
 * 			  addDiscount(), removeDiscount()
 */
angular.module('mean.course').controller('CourseBranchController',
	function($scope, $rootScope, $stateParams, $location, Global, MeanUser, MESSAGES, flash, COURSE, CountryService, ZoneService, CityService, BranchService, CoursesService, CourseBranchService,$uibModal,$translate) {
			$scope.global = Global;
			$scope.package = {
				name : 'course',
	            modelName: 'Course',
	            featureName: 'Course Assignment'
			};
			
			$scope.isLocationSelected = false;
			$scope.isCountry = false;
			$scope.formIsInvalid = false;
			$scope.title = 'Select Branch';
			$scope.message = 'Select any branch to assign course.';
			$scope.MESSAGES = MESSAGES;
			
			/** 
	         * Initializing Delete Pop-up
	         */
	        initializeDeletePopup($scope, $scope.package.modelName, MESSAGES,$uibModal);
			
	        /** 
	         * Initializing Permission
	         */
			//initializePermission($scope, $rootScope, $location, flash, $scope.package.featureName, MESSAGES);
	        
	        /** 
	         * Initializing BreadCrumb
	         */
			initializeBreadCrum($scope, $scope.package.modelName,'Course Assign','Course Management');
			
	        $scope.courseBreadcrumb = function(){
	        	$scope.breadCrumAdd("Course Assignment");
	        };
	        
	        /** 
	         * Loads the location based on role of user
	         * @ RETURNS: If the role is of country admin then list of country function is called else branch admin
	         */
	        $scope.loadLocationList = function (){
	        	$scope.user = MeanUser.user;
	        	if($scope.user.branch.length > 0 && $scope.user.country.length == 0){
	        		$scope.listBranches();
	        	}
	        	if($scope.user.country.length > 0){
	        		$scope.listCountries();
	        	}
	        };
	        
	        /** 
	         * Load the list of country and available courses
	         */
	        $scope.listCountries = function () {
	        	if(angular.isUndefined($rootScope.locationObj)){
	        		$scope.countries = $scope.user.country;
	        		$scope.loadCountryAvailableCourse();
	        		$scope.isBranchDropDown = false;
	        		$scope.isCountryDropDown = true;
	        	} else {
	        		$scope.countries = $scope.user.country;
	        		$scope.isBranchDropDown = false;
	        		$scope.isCountryDropDown = true;
		        	$scope.loadCountryAvailableCourse();
	        	}
	        	$scope.isCountry = true;
	        };
	        
	        /** 
	         * Load the list of branch and available courses
	         */
	        $scope.listBranches = function () {
	        	if(angular.isUndefined($rootScope.locationObj)){
	        		$scope.branches = $scope.user.branch;
	        		$scope.loadBranchAvailableCourse();
	        		$scope.isBranchDropDown = true;
	        		$scope.isCountryDropDown = false;
	        	} else {
	        		$scope.branches = $scope.user.branch;
		        	$scope.loadBranchAvailableCourse();
	        		$scope.isBranchDropDown = true;
	        		$scope.isCountryDropDown = false;
	        	}
	        };
	        
	        /** 
	         * Calls available courses and its availability function, as well as selected courses function based on the selected location(country) from the drop down,
	         * and assigns the selected location(country) at rootScope level
	         * @ PARAMS: <countryId>
	         */
	        $scope.countryFilter = function (countryId) {
	        	$scope.countryId = countryId;
	            $scope.locationObj = {};
	            $rootScope.$emit('processingContinue');
	            CourseBranchService.countryCourse.get({
	            	countryId: countryId
	            }, function (country) {
	                $rootScope.$emit('processingDone');
	                $rootScope.locationObj = country;
	                $rootScope.locationObj.isCountry = true;	
	                $scope.selectedCourses = $rootScope.locationObj.course;
	                if($rootScope.locationObj){
	                	$scope.isLocationSelected = true;
	                	for(var j = 0; j < $scope.availableCourses.length; j++){
	               			$scope.availableCourses[j].assigned = false;
	                	}
	                }
	                $scope.disablingAssign();
	            }); 
	        };
	        
	        /** 
	         * Calls available courses and its availability function, as well as selected courses function based on the selected location(branch) from the drop down,
	         * and assigns the selected location(branch) at rootScope level
	         * @ PARAMS: <branchId>
	         */
	        $scope.branchFilter = function (branchId) {
	        	$scope.branchId = branchId;
	            $scope.locationObj = {};
	            $rootScope.$emit('processingContinue');
	            BranchService.branch.get({
	                branchId: branchId
	            }, function (branch) {
	                $rootScope.$emit('processingDone');
	                $rootScope.locationObj = branch;
	                $rootScope.locationObj.isCountry = false;
	                $scope.selectedCourses = $rootScope.locationObj.course;
	                if($rootScope.locationObj){
	                	$scope.isLocationSelected = true;
	                	for(var j = 0; j < $scope.availableCourses.length; j++){
	               			$scope.availableCourses[j].assigned = false;
	                	}
	                }
	                $scope.disablingAssign();
	            }); 
	        };
	        
	        /** 
	         * Loads available courses and its availability based on the selected location(country) from the drop down,
	         * and assigns the selected location(country) at rootScope level
	         */
			$scope.loadCountryAvailableCourse = function(){
				CoursesService.page.query({}, function (courses) {
	                $rootScope.$emit('processingDone');
	                $scope.availableCourses = courses;
	                if(angular.isDefined($rootScope.locationObj)){
	                	$scope.loadCountrySelectedCourse();
	                }
	            });
			};
	        
			/** 
	         * Loads selected courses based on the selected location(country) from the drop down
	         */
	        $scope.loadCountrySelectedCourse = function(){
				$scope.countryFilter($rootScope.locationObj._id);
			};
	        
			/** 
	         * Loads available courses and its availability based on the selected location(branch) from the drop down,
	         * and assigns the selected location(branch) at rootScope level
	         */
			$scope.loadBranchAvailableCourse = function(){
				CourseBranchService.branchCourses.get({
					branchId: $scope.branches[0]._id
				}, function (countryCourses) {
	                $rootScope.$emit('processingDone');
	                $scope.availableCourses = countryCourses.course;
	                if(angular.isDefined($rootScope.locationObj)){
	                	$scope.loadBranchSelectedCourse();
	                }
	            });
			};
			
			/** 
	         * Loads selected courses based on the selected location(branch) from the drop down
	         */
			$scope.loadBranchSelectedCourse = function(){
				$scope.branchFilter($rootScope.locationObj._id);
			};
			
			/** 
	         * Assign course to selected location(country/branch), and also checks whether location is selected before assigning the course
	         * @ PARAMS: <courseId>
	         */
			$scope.assign = function(courseId){
				if(angular.isUndefined($rootScope.locationObj)){
					$('#branchSelectPopup').modal("show");
				} else {
					$location.path(COURSE.URL_PATH.ADMIN_COURSE_PAYMENT_SCHEME.replace(':courseId', courseId));
				}
			};
			
			/** 
	         * Loads selected courses based on the selected location(branch) from the drop down
	         */
			$scope.ok = function(){
				$('#branchSelectPopup').modal("hide");
			}
			
			/** 
	         * Disable assign button for the course that are already assigned to particular location(country/branch)
	         */
			$scope.disablingAssign = function(){
				if(angular.isDefined($rootScope.locationObj)){
                	$scope.locationObj = $rootScope.locationObj;
                	for(var i = 0; i < $scope.locationObj.course.length; i++){
	                	for(var j = 0; j < $scope.availableCourses.length; j++){
	                		if(JSON.stringify($scope.availableCourses[j]._id) === JSON.stringify($scope.locationObj.course[i]._id)){
	                			$scope.availableCourses[j].assigned = true;
	                		}
	                	}
	                }
                }
			};
			
			/** 
	         * Remove course from selected location(country/branch), and also checks whether location is selected before removing the course
	         * @ PARAMS: <courseId>
	         */
			$scope.remove = function(courseId){
				if($rootScope.locationObj.isCountry){
					CourseBranchService.courseCountry.get({
						countryId: $rootScope.locationObj._id,
						courseId: courseId
					}, function (response) {
	                    flash.setMessage(MESSAGES.MENTOR_REQUEST_SUCCESS, MESSAGES.SUCCESS);
	                    $rootScope.locationObj = response;
	                    $rootScope.locationObj.isCountry = true;
	                    $scope.selectedCourses = response.course;
	                    for(var i = 0; i < $scope.availableCourses.length; i++){
	                    	if(JSON.stringify($scope.availableCourses[i]._id) === JSON.stringify(courseId)){
	                			$scope.availableCourses[i].assigned = false;
	                		}
	                    }
	                }, function (error) {
	                    $scope.error = error;
	                });
				} else {
					CourseBranchService.courseBranch.get({
						branchId: $rootScope.locationObj._id,
						courseId: courseId
					}, function (response) {
	                    flash.setMessage(MESSAGES.MENTOR_REQUEST_SUCCESS, MESSAGES.SUCCESS);
	                    $rootScope.locationObj = response;
	                    $rootScope.locationObj.isCountry = false;
	                    $scope.selectedCourses = response.course;
	                    for(var i = 0; i < $scope.availableCourses.length; i++){
	                    	if(JSON.stringify($scope.availableCourses[i]._id) === JSON.stringify(courseId)){
	                			$scope.availableCourses[i].assigned = false;
	                		}
	                    }
	                }, function (error) {
	                    $scope.error = error;
	                });
				}
			};
			
			/** 
	         * Checking if Installment amount exceeds Cost
	         * @ PARAMS: <cost>, <installmentAmount>, <outerIndex>, <middleIndex>
	         */
			$scope.exceedingValidation = function(cost, installmentAmount, outerIndex, middleIndex){
				var restInstallmentAmount = 0;
				for(var i = 0; i < $scope.course.paymentSchemes[outerIndex].installments.length - 1; i++){
					if($scope.course.paymentSchemes[outerIndex].installments[i].installmentAmount){
						restInstallmentAmount = restInstallmentAmount + $scope.course.paymentSchemes[outerIndex].installments[i].installmentAmount;
					}
				}
				if(installmentAmount > (cost - restInstallmentAmount)){
					$scope.course.paymentSchemes[outerIndex].installments[middleIndex].isInstallmentAmountExceeding = true;
				} else {
					$scope.course.paymentSchemes[outerIndex].installments[middleIndex].isInstallmentAmountExceeding = false;
				}
			};
			
			/** 
	         * Checking if discount value lies within the boundry
	         * @ PARAMS: <rate>, <outerIndex>, <middleIndex>, <innerIndex>
	         */
			$scope.discountBoundry = function(rate, outerIndex, middleIndex, innerIndex){
				if(0 > rate || rate > 100){
					$scope.course.paymentSchemes[outerIndex].installments[middleIndex].discounts[innerIndex].isDiscountExceeding = true;
				} else {
					$scope.course.paymentSchemes[outerIndex].installments[middleIndex].discounts[innerIndex].isDiscountExceeding = false;
				}
			}
			
			/** 
	         * Checking if Marks range (From) field is filled
	         * @ PARAMS: <marksFrom>, <outerIndex>, <middleIndex>, <innerIndex>
	         */
			$scope.marksFromBoundry = function(marksFrom, outerIndex, middleIndex, innerIndex){
				$scope.marksTo = $scope.course.paymentSchemes[outerIndex].installments[middleIndex].discounts[innerIndex].marks_form;
				if(!$scope.marksTo){
					$scope.marksTo = 100;
				}
				if((0 > marksFrom || marksFrom > $scope.marksTo)){
					$scope.course.paymentSchemes[outerIndex].installments[middleIndex].discounts[innerIndex].isMarksFromExceeding = true;
				} else {
					$scope.course.paymentSchemes[outerIndex].installments[middleIndex].discounts[innerIndex].isMarksFromExceeding = false;
				}
			}
			
			/** 
	         * Checking if Marks range (To) field is filled
	         * @ PARAMS: <marksTo>, <outerIndex>, <middleIndex>, <innerIndex>
	         */
			$scope.marksToBoundry = function(marksTo, outerIndex, middleIndex, innerIndex){
				$scope.marksFrom = $scope.course.paymentSchemes[outerIndex].installments[middleIndex].discounts[innerIndex].marks_form;
				if(!$scope.marksFrom){
					$scope.marksFrom = 0;
				} 
				if(($scope.marksFrom > marksTo || marksTo > 100)){
					$scope.course.paymentSchemes[outerIndex].installments[middleIndex].discounts[innerIndex].isMarksToExceeding = true;
				} else {
					$scope.course.paymentSchemes[outerIndex].installments[middleIndex].discounts[innerIndex].isMarksToExceeding = false;
				}
			}
			
			/** 
	         * Whole form validation check
	         */
			$scope.wholeFormValidationCheck = function(){
				var installmentLength = 0, discountLength = 0;
				var installmentCounter = 0, discountCounter = 0;
				var marksFormCounter = 0, marksToCounter = 0;
				$scope.formInstallmentIsInvalid = false;
				$scope.formDiscountIsInvalid = false;
				$scope.formMarksFromIsInvalid = false;
				$scope.formMarksToIsInvalid = false;
				for(var i = 0; i < $scope.course.paymentSchemes.length; i++){
					installmentLength = installmentLength + $scope.course.paymentSchemes[i].installments.length;
					for(var j = 0; j < $scope.course.paymentSchemes[i].installments.length; j++){
						if($scope.course.paymentSchemes[i].installments[j].isInstallmentAmountExceeding){
							installmentCounter++;
						}
						discountLength = discountLength + $scope.course.paymentSchemes[i].installments[j].discounts.length;
						for(var k = 0; k < $scope.course.paymentSchemes[i].installments[j].discounts.length; k++){
							if($scope.course.paymentSchemes[i].installments[j].discounts[k].isDiscountExceeding){
								discountCounter++;
							} 
							if($scope.course.paymentSchemes[i].installments[j].discounts[k].isMarksFromExceeding){
								marksFormCounter++;
							} 
							if($scope.course.paymentSchemes[i].installments[j].discounts[k].isMarksToExceeding){
								marksToCounter++;
							}
						}
					}
				}
				if(installmentCounter > 0){
					$scope.formInstallmentIsInvalid = true;
				}
				if(discountCounter > 0){
					$scope.formDiscountIsInvalid = true;
				}
				if(discountCounter > 0){
					$scope.formMarksFromIsInvalid = true;
				}
				if(discountCounter > 0){
					$scope.formMarksToIsInvalid = true;
				}
			}
			
			/** 
	         * Down-payment and installments should be summed up to Course cost check
	         */
			$scope.installmentSummedToCost = function (){
				$scope.totalInstallmentValidation = [];
				for(var i = 0; i < $scope.course.paymentSchemes.length; i++){
					$scope.installment = {};
					$scope.installment.totalInstallments = 0;
					for(var j = 0; j < $scope.course.paymentSchemes[i].installments.length; j++){
						$scope.installment.totalInstallments = $scope.installment.totalInstallments + $scope.course.paymentSchemes[i].installments[j].installmentAmount;
					}
					if($scope.installment.totalInstallments == $scope.paymentScheme.cost){
						$scope.installment.isTotalInstallments = false;
					} else {
						$scope.installment.isTotalInstallments = true;
					}
					$scope.totalInstallmentValidation.push($scope.installment);
				}
				for(var i = 0; i < $scope.totalInstallmentValidation.length; i++){
					if($scope.totalInstallmentValidation[i].isTotalInstallments){
						$scope.totalInstallmentCheck = true;
						break;
					} else {
						$scope.totalInstallmentCheck = false;
					}
				}
			}
			
			/** 
	         * Assigning payment scheme for a course
	         * @ PARAMS: <form>
	         */
			$scope.submit = function (form){
				$scope.form = form;
				$scope.coursePaymentSchemeBranch = $rootScope.locationObj;
				$scope.courseId = $stateParams.courseId;
				$scope.wholeFormValidationCheck();
				$scope.installmentSummedToCost();
				if($scope.form.$valid && !$scope.formInstallmentIsInvalid && !$scope.formDiscountIsInvalid
						&& !$scope.formMarksFromIsInvalid && !$scope.formMarksToIsInvalid && !$scope.totalInstallmentCheck){
					$scope.coursePaymentSchemeBranch.course.push($scope.courseId);
					$scope.coursePaymentSchemeBranch.coursePaymentSchemes = $scope.course.paymentSchemes;
				
					if($rootScope.locationObj.isCountry){
						var country = new CourseBranchService.courseCountry($scope.coursePaymentSchemeBranch);
						country.$update({
							countryId: $scope.coursePaymentSchemeBranch._id,
							courseId: $scope.courseId
						}, function (response) {
		                    flash.setMessage(MESSAGES.MENTOR_REQUEST_SUCCESS, MESSAGES.SUCCESS);
		    				$location.path(COURSE.URL_PATH.ADMIN_COURSE_BRANCH_ASSIGNMENT);
		                }, function (error) {
		                    $scope.error = error;
		                });
					} else {
						var branch = new CourseBranchService.courseBranch($scope.coursePaymentSchemeBranch);
						branch.$update({
							branchId: $scope.coursePaymentSchemeBranch._id,
							courseId: $scope.courseId
						}, function (response) {
		                    flash.setMessage(MESSAGES.MENTOR_REQUEST_SUCCESS, MESSAGES.SUCCESS);
		    				$location.path(COURSE.URL_PATH.ADMIN_COURSE_BRANCH_ASSIGNMENT);
		                }, function (error) {
		                    $scope.error = error;
		                });
					}
				} else {
					$scope.submitted = true;
				}
			};
			
			$scope.cancel = function(){
				$location.path(COURSE.URL_PATH.ADMIN_COURSE_BRANCH_ASSIGNMENT);
			};
			
			$scope.back = function(){
				$location.path(COURSE.URL_PATH.ADMIN_COURSE_BRANCH_ASSIGNMENT);
			};
					
			/** 
	         * Generate Label
	         * @ PARAMS: <index>
	         */
			$scope.getLabel = function(index){
				if(index == 0){
					return 'Down Payment';
				} else {
					return 'Installment';
				}
			};
			
			/** 
	         * Load Course Payment Schemes For Particular Branch
	         */
			$scope.loadCoursePaymentSchemesForBranch = function(){
				$scope.courseId = $stateParams.courseId;
				$scope.designedPaymentSchemes = [];
				CourseBranchService.viewPayment.query({
					courseId: $scope.courseId,
					branchId: $rootScope.locationObj._id
				}, function (response) {
					$scope.designedPaymentSchemes = response;
					$scope.course = {};
					$scope.course.paymentSchemes = [];
					if($scope.designedPaymentSchemes.length > 0){
						$scope.initializeDesignedPaymentScheme();
					}
                }, function (error) {
                    $scope.error = error;
                });
			};
			
			/** 
	         * Initialize new payment scheme
	         */
			$scope.intializeNewPaymentScheme = function(){
				$scope.courseId = $stateParams.courseId;
				$scope.designedPaymentSchemes = [];
				CourseBranchService.paymentScheme.query({
					courseId: $scope.courseId
				}, function (response) {
					$scope.designedPaymentSchemes = response;
					$scope.course = {};
					$scope.course.paymentSchemes = [];
					if(!$rootScope.locationObj.isCountry && $scope.designedPaymentSchemes.length > 0){
						$scope.initializeDesignedPaymentScheme();
					} else {
						$scope.intializePaymentScheme();
						$scope.course.paymentSchemes.push($scope.paymentScheme);
					}
                }, function (error) {
                    $scope.error = error;
                });
			};
			
			/** 
	         * Initialize already designed payment scheme
	         */
			$scope.initializeDesignedPaymentScheme = function(){
				for(var i = 0; i < $scope.designedPaymentSchemes.length; i++){
					$scope.paymentScheme = {};
					$scope.paymentScheme.cost = $scope.designedPaymentSchemes[0].cost;
					$scope.paymentScheme.paymentSchemeName = $scope.designedPaymentSchemes[0].paymentScheme;
					$scope.paymentScheme.installments = [];
					for(var j = 0; j < $scope.designedPaymentSchemes[i].installments.length; j++){
						$scope.paymentScheme.installments.push($scope.designedPaymentSchemes[i].installments[j]);
					}
					$scope.course.paymentSchemes.push($scope.paymentScheme);
				}
			};
			
			/** 
	         * Initialize installment
	         */
			$scope.intializePaymentScheme = function(){
				$scope.paymentScheme = {};
				$scope.paymentScheme.installments = [{},{}];
				for(var i = 0; i < 2; i++){
					$scope.paymentScheme.installments[i].discounts = [{}];
					if(i == 0){
						$scope.paymentScheme.installments[i].paymentFor = 'Down Payment';
					} else {
						$scope.paymentScheme.installments[i].paymentFor = 'Installment '+(i);
					}
				}
			};
			
			/** 
	         * Add new Payment Scheme
	         */
			$scope.addPaymentScheme = function() {
				$scope.intializePaymentScheme();
				if($scope.course.paymentSchemes[0].cost){
					$scope.paymentScheme.cost = $scope.course.paymentSchemes[0].cost;
				}
				$scope.course.paymentSchemes.push($scope.paymentScheme);
			};
			
			/** 
	         * Remove new Payment Scheme
	         */
			$scope.removePaymentScheme = function(paymentScheme){
				var i = $scope.course.paymentSchemes.indexOf(paymentScheme);
				$scope.course.paymentSchemes.splice(i, 1);
			};
			
			/** 
	         * Add new Installment
	         */
			$scope.addInstallment = function(outerIndex) {
				$scope.course.paymentSchemes[outerIndex].installments.push({});
				$scope.course.paymentSchemes[outerIndex].installments[$scope.course.paymentSchemes[outerIndex].installments.length - 1].discounts = [{}];
			};
			
			/** 
	         * Remove Installment
	         */
			$scope.removeInstallment = function(installment, outerIndex) {
				var i = $scope.course.paymentSchemes[outerIndex].installments.indexOf(installment);
				$scope.course.paymentSchemes[outerIndex].installments.splice(i, 1);
			};
			
			/** 
	         * Add new Discount
	         */
			$scope.addDiscount = function(outerIndex, middleIndex) {
				$scope.course.paymentSchemes[outerIndex].installments[middleIndex].discounts.push({});
			};
			
			/** 
	         * Remove Discount
	         */
			$scope.removeDiscount = function(discount, outerIndex, middleIndex) {
				var i = $scope.course.paymentSchemes[outerIndex].installments[middleIndex].discounts.indexOf(discount);
				$scope.course.paymentSchemes[outerIndex].installments[middleIndex].discounts.splice(i, 1);
			};			
	});
