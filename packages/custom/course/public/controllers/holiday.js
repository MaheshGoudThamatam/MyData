'use strict';

angular
		.module('mean.course')
		.controller(
				'HolidayController',
				[
						'$scope',
						'$stateParams',
						'Global',
						'HolidayService',
						'$location',
						'$rootScope',
						'MESSAGES',
						'flash',
						'COURSE',
						'MeanUser',
						'CountryService',
						'BranchService','$uibModal','$translate',
						function($scope, $stateParams, Global, HolidayService,
								$location, $rootScope, MESSAGES, flash, COURSE,
								MeanUser, CountryService, BranchService, $uibModal,$translate) {
							$scope.global = Global;
							$scope.test = '';
							$scope.MESSAGES = MESSAGES;
							$scope.COURSE = COURSE;
							$scope.SERVICE = HolidayService;
							$scope.package = {
								name : 'holiday',
								modelName : 'Holiday',
								featureName : 'Holidays'
							};
							$scope.isCountry = false;
							$scope.isBranch = false;
							initializeDeletePopup($scope,
									$scope.package.modelName, MESSAGES, $uibModal);
							initializeBreadCrum($scope,
									$scope.package.modelName,
									COURSE.URL_PATH.ADMIN_HOLIDAY_LIST,'Holidays','Course Management');
							initializePagination($scope, $rootScope,
									$scope.SERVICE);
							initializePermission($scope, $rootScope, $location,
									flash, $scope.package.featureName, MESSAGES);

							// find the holiday by holiday id
							$scope.findOne = function() {
								if ($scope.updatePermission) {
									HolidayService.holiday.get({
										holidayId : $stateParams.holidayId
									}, function(holiday) {
										$scope.holiday = holiday;
									});
								} else {
									flash.setMessage(
											MESSAGES.PERMISSION_DENIED,
											MESSAGES.ERROR);
									$location.path(MESSAGES.DASHBOARD_URL);
								}
							};

							// create the holiday
							$scope.create = function(isvalid) {
								if ($scope.writePermission) {
									if (isvalid) {
										var holiday = new HolidayService.holiday(
												$scope.holiday);
										holiday
												.$save(
														function(response) {
															flash
																	.setMessage(
																			MESSAGES.HOLIDAY_ADD_SUCCESS,
																			MESSAGES.SUCCESS);
															$location
																	.path(COURSE.URL_PATH.ADMIN_HOLIDAY_LIST);
															$scope.holiday = {};
														},
														function(error) {
															$scope.error = error;
														});

									} else {
										$scope.submitted = true;
									}
								} else {
									flash.setMessage(
											MESSAGES.PERMISSION_DENIED,
											MESSAGES.ERROR);
									$location.path(MESSAGES.DASHBOARD_URL);
								}
							};

							// update the holiday

							$scope.update = function(isvalid) {
								if ($scope.updatePermission) {
									if (isvalid) {
										var holiday = $scope.holiday;
										if (!holiday.updated) {
											holiday.updated = [];
										}
										holiday.updated.push(new Date()
												.getTime());

										holiday
												.$update(
														function() {
															flash
																	.setMessage(
																			MESSAGES.HOLIDAY_UPDATE_SUCCESS,
																			MESSAGES.SUCCESS);
															$location
																	.path(COURSE.URL_PATH.ADMIN_HOLIDAY_LIST);
														},
														function(error) {
															$scope.error = error;
														});
									} else {
										$scope.submitted = true;
									}
								} else {
									flash.setMessage(
											MESSAGES.PERMISSION_DENIED,
											MESSAGES.ERROR);
									$location.path(MESSAGES.DASHBOARD_URL);
								}
							};

							$scope.remove = function(Holiday) {
								if (Holiday && $scope.deletePermission) {
									if (Holiday) {
										var holiday = new HolidayService.holiday(
												Holiday);
										holiday
												.$remove(function(response) {
													for ( var i in $scope.collection) {
														if ($scope.collection[i] === Holiday) {
															$scope.collection
																	.splice(i,
																			1);
														}
														$('#deletePopup')
																.modal("hide");
														flash
																.setMessage(
																		MESSAGES.HOLIDAY_DELETE_SUCCESS,
																		MESSAGES.SUCCESS);
														$location
																.path(COURSE.URL_PATH.ADMIN_HOLIDAY_LIST);
													}
												});
									}
								} else {
									flash.setMessage(
											MESSAGES.PERMISSION_DENIED,
											MESSAGES.ERROR);
									$location.path(MESSAGES.DASHBOARD_URL);
								}
							};

							/*
							 * Cancel the holiday
							 */
							$scope.cancelHoliday = function() {
								$location
										.path(COURSE.URL_PATH.ADMIN_HOLIDAY_LIST);
							};

							$scope.editholiday = function(urlPath, id) {
								urlPath = urlPath.replace(":holidayId", id);
								$location.path(urlPath);
							};
							$scope.newHoliday = function() {
								$location
										.path(COURSE.URL_PATH.ADMIN_HOLIDAY_CREATE);
							};
							$scope.createHoliday = function() {
								$scope.breadCrumAdd("Create");
							};
							$scope.editHoliday = function() {
								$scope.breadCrumAdd("Edit");
							};

							$scope.filter = function() {
								$scope.user = MeanUser.user;
								if ($scope.user.branch.length <= 0) {
									if ($scope.user.country.length <= 0) {
										flash.setMessage(
												MESSAGES.PERMISSION_DENIED,
												MESSAGES.ERROR);
										$location.path(MESSAGES.DASHBOARD_URL);
									} else {
										$scope.countries = $scope.user.country;
										$scope.isCountry = true;
										$scope.isBranch = false;
									}
								} else {
									$scope.branches = $scope.user.branch;
									$scope.isCountry = false;
									$scope.isBranch = true;

								}
							};

							$scope.checkErr = function(start_date, end_date) {
								$scope.holidayForm.end_date.$error.Lesservalue = false;
								var holiday = $scope.holiday;
								$scope.start_date = holiday.start_date;
								$scope.end_date = holiday.end_date;
								if ($scope.start_date > $scope.end_date) {
									$scope.holidayForm.end_date.$error.Lesservalue = true;
								} else {
									$scope.holidayForm.end_date.$error.Lesservalue = false;
								}

							};
							$scope.checkError = function(start_date) {
								$scope.holidayForm.end_date.$error.Lesserstartvalue = false;
								var curDate = new Date();
								var holiday = $scope.holiday;
								$scope.start_date = holiday.start_date;

								if ($scope.start_date < curDate) {
									$scope.holidayForm.end_date.$error.Lesserstartvalue = true;

								} else {
									$scope.holidayForm.end_date.$error.Lesserstartvalue = false;
								}
							};
							$scope.find = function () {
								HolidayService.holiday.query(function (holidays) {
									          $scope.holidays =holidays;
								            for(var i=0;i<$scope.holidays.length;i++){
								            	var h = $scope.holidays[i].start_date;
								            	var h1 = $scope.holidays[i].end_date;
								            	var cutoff = new Date(h);
								            	var modifieddate=new Date(cutoff.setHours(cutoff.getHours()+24));
								            	modifieddate.setMonth(cutoff.getMonth()-1);
								            	modifieddate=modifieddate.toISOString();
								            	var cutoff1 = new Date(h1);
								            	var modifieddate1=new Date(cutoff1.setHours(cutoff1.getHours()+24))
								            	modifieddate1.setMonth(cutoff.getMonth()-1);
								            	modifieddate1=modifieddate1.toISOString();
								               	modifieddate=modifieddate.substr(0,10).split("-");
								            	modifieddate1 = modifieddate1.substr(0,10).split("-");
								            	$scope.events2.push(
								            			 {
														        title: $scope.holidays[i].name,
														        start: new Date(modifieddate[0],modifieddate[1],modifieddate[2]),
														        end: new Date(modifieddate1[0],modifieddate1[1],parseInt(modifieddate1[2])+1),
														        stick: true
														    }
								            			);
								            }
								        });
							};
							
							$scope.createHoliday = function() {
								$location.path(COURSE.URL_PATH.ADMIN_HOLIDAY_CREATE);
							}
							
							var date = new Date();
						    var d = date.getDate();
						    var m = date.getMonth();
						    var y = date.getFullYear();
						    $scope.uiConfig = {
						        calendar: {
						            height: 100,
						            editable: true,
						            header: {
						                left: 'title',
						                right: 'today prev,next'
						            },
						            dayClick: $scope.createHoliday,
						            eventDrop: $scope.alertOnDrop,
						            displayEventTime: false
						        }
						    };
						    $scope.events2 = [
						    {
						        title: 'Event directly added',
						        start: new Date(2016, 2, 20),
						        end: new Date(2016, 2, 25),
						        stick: true
						    }];
						     $scope.eventSources = [$scope.events2];
						     
						    } 
						]);

