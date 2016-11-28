'use strict';

/* jshint -W098 */

var myApp = angular.module('mean.search');
var calEventObj = {};

myApp.directive('googleplace', function() {
	return {
		require: 'ngModel',
		link: function(scope, element, attrs, model) {
			var options = {
					types: ['address'],
					componentRestrictions: {}
			};
			scope.gPlace = new google.maps.places.Autocomplete(element[0], options);
			scope.$watch("selectedLocation", function() {
				var geolocation = {
					lat : scope.selectedLocation.lat,
					lng : scope.selectedLocation.lng
				};
				var circle = new google.maps.Circle({
					center : geolocation,
					radius : scope.selectedLocation.radius
				});
				scope.gPlace.setBounds(circle.getBounds());
				google.maps.event.addListener(scope.gPlace, 'place_changed', function() {
					scope.$apply(function() {
						model.$setViewValue(element.val());
					});
				});
			});
		}
	};
});


myApp.controller('SearchController', ['$scope', 'Global', 'SearchService', 'URLFactory','$location', '$rootScope', 'SEARCH', '$timeout','flash', 'MESSAGES','HolidaysService','$compile','PlugNplayService',
                                      function($scope, Global, SearchService, URLFactory, $location, $rootScope, SEARCH, $timeout, flash, MESSAGES, HolidaysService, compile, PlugNplayService) {

	$scope.global = Global;
	$scope.package = {
			name: 'search'
	};
	$scope.hideEndTimeBox = false;
	$scope.gPlace;
	flashmessageOn($rootScope, $scope,flash);
	
	$scope.weekendSunEnabled = true;
	$scope.holidayEnabled = true;
	calEventObj.excludeSunday = true;
	calEventObj.excludeHoliday = true;
	$scope.searchMessage = "Real-time Bookings! Anytime, Anywhere!";

	// Variables for Hot Desk and Training room :: Start date and End Date.
		// $scope.dateRangeStartDate
		// $scope.dateRangeEndDate

	// Variables whether Sunday and Hoilday is enabled / disabled.
		// calEventObj.excludeSunday
		// calEventObj.excludeHoliday
		
	$scope.init = function() {
				
				/*
					Author                : Rajesh K
					Date                  : 27-05-2016
					Last Modified         : 01-06-2016
					Function Description  : Includes Sunday in calendar and set variable "calEventObj.excludeSunday". Based on variable button is enabled / disabled.
				*/
				calEventObj.enableSundayBtn = function(event){
					$('input[name="daterange"]').daterangepicker("destroy");
					$('input[name="daterange"]').daterangepicker({
						minDate: moment(),
						maxDate: moment().add(90, 'days'),
						drops: "up",
						isInvalidDate: function(date) {
							if(calEventObj.excludeHoliday){
							    for (var i = 0; i < $scope.unavailableDates.length; i++) {
							        if (date.format('D-MM-YYYY') == $scope.unavailableDates[i]) {
							            return true;
							        }
							    }
							}
						},
						isCustomDate: function(date) {
						    for (var j = 0; j < $scope.unavailableDates.length; j++) {
						        if (date.format('D-MM-YYYY') == $scope.unavailableDates[j]) {
						            return "holidayDate-td";
						        }
						    }
						    if((date.day() == 0)){
								return "calendarSunday-td";
							}
						}
					},
					function(start, end, label) {
						$scope.dateRangeStartDate = start.format('MM-DD-YYYY');
						$scope.dateRangeEndDate = end.format('MM-DD-YYYY');
					});
					calEventObj.excludeSunday = false;
					if(calEventObj.excludeSunday){
						var eSunday = ("<div id=\"enableSunday\" data-ng-controller=\"SearchController\"><br/><button class='btn weekendBtn enableSunday'>Include Sunday</button></div>");
						$(".range_inputs").append(eSunday).find('.enableSunday').on('click', calEventObj.enableSundayBtn);
						$('input[name="daterange"]').focus();
					}
					else
					{
						var dSunday = ("<div id=\"disableSunday\" data-ng-controller=\"SearchController\"><br/><button type=\"button\" class=\"btn weekendBtn disableSunday\">Exclude Sunday</button></div>");
						$(".range_inputs").append(dSunday).find('.disableSunday').on('click', calEventObj.disableSundayBtn);
						$('input[name="daterange"]').focus();
					}
					if(!calEventObj.excludeHoliday){
						var dHoliday = ("<div id=\"disableHoliday\" data-ng-controller=\"SearchController\"><br/><button type=\"button\" class=\"btn holidayBtn disableHoliday\">Exclude Holiday</button></div>");
						$(".range_inputs").append(dHoliday).find('.disableHoliday').on('click', calEventObj.disableHolidayBtn);
						$('input[name="daterange"]').focus();
					}
					else
					{
						var eHoliday = ("<div id=\"enableHoliday\" data-ng-controller=\"SearchController\"><br/><button class='btn holidayBtn enableHoliday'>Include Holiday</button></div>");
						$(".range_inputs").append(eHoliday).find('.enableHoliday').on('click', calEventObj.enableHolidayBtn);
						$('input[name="daterange"]').focus();
					}
					
					$('input[name="daterange"]').on('apply.daterangepicker', function(ev, picker) {
						$scope.dateRangeStartDate = document.getElementsByClassName("hotdeskDaterange")[0].value.split('-')[0].trim();
						$scope.dateRangeEndDate = document.getElementsByClassName("hotdeskDaterange")[0].value.split('-')[1].trim();
						$scope.calculateDateRange();
					});
					$('input[name="daterange"]').on('hide.daterangepicker', function(ev, picker) {
						$scope.dateRangeStartDate = document.getElementsByClassName("hotdeskDaterange")[0].value.split('-')[0].trim();
						$scope.dateRangeEndDate = document.getElementsByClassName("hotdeskDaterange")[0].value.split('-')[1].trim();
						$scope.calculateDateRange();
					});

				};

				/*
					Author                : Rajesh K
					Date                  : 27-05-2016
					Last Modified         : 01-06-2016
					Function Description  : Includes Holiday in calendar and set variable "calEventObj.excludeHoliday". Based on variable button is enabled / disabled.
				*/
				calEventObj.enableHolidayBtn = function(event){
					$('input[name="daterange"]').daterangepicker("destroy");
					$('input[name="daterange"]').daterangepicker({
						minDate: moment(),
						maxDate: moment().add(90, 'days'),
						drops: "up",
						isInvalidDate: function(date) {
							if(calEventObj.excludeSunday){
								return (date.day() == 0);
							}
						},
						isCustomDate: function(date) {
						    for (var j = 0; j < $scope.unavailableDates.length; j++) {
						        if (date.format('D-MM-YYYY') == $scope.unavailableDates[j]) {
						            return "holidayDate-td";
						        }
						    }
					    	if((date.day() == 0)){
								return "calendarSunday-td";
							}
						}
					},
					function(start, end, label) {
						$scope.dateRangeStartDate = start.format('MM-DD-YYYY');
						$scope.dateRangeEndDate = end.format('MM-DD-YYYY');
					});
					calEventObj.excludeHoliday = false;
					if(calEventObj.excludeSunday){	
						var eSunday = ("<div id=\"enableSunday\" data-ng-controller=\"SearchController\"><br/><button class='btn weekendBtn enableSunday'>Include Sunday</button></div>");
						$(".range_inputs").append(eSunday).find('.enableSunday').on('click', calEventObj.enableSundayBtn);
						$('input[name="daterange"]').focus();
					}
					else
					{
						var dSunday = ("<div id=\"disableSunday\" data-ng-controller=\"SearchController\"><br/><button type=\"button\" class=\"btn weekendBtn disableSunday\">Exclude Sunday</button></div>");
						$(".range_inputs").append(dSunday).find('.disableSunday').on('click', calEventObj.disableSundayBtn);
						$('input[name="daterange"]').focus();
					}
					if(calEventObj.excludeHoliday){
						var eHoliday = ("<div id=\"enableHoliday\" data-ng-controller=\"SearchController\"><br/><button class='btn holidayBtn enableHoliday'>Include Holiday</button></div>");
						$(".range_inputs").append(eHoliday).find('.enableHoliday').on('click', calEventObj.enableHolidayBtn);
						$('input[name="daterange"]').focus();
					}
					else
					{
						var dHoliday = ("<div id=\"disableHoliday\" data-ng-controller=\"SearchController\"><br/><button type=\"button\" class=\"btn holidayBtn disableHoliday\">Exclude Holiday</button></div>");
						$(".range_inputs").append(dHoliday).find('.disableHoliday').on('click', calEventObj.disableHolidayBtn);
						$('input[name="daterange"]').focus();
					}
					$('input[name="daterange"]').on('apply.daterangepicker', function(ev, picker) {
						$scope.dateRangeStartDate = document.getElementsByClassName("hotdeskDaterange")[0].value.split('-')[0].trim();
						$scope.dateRangeEndDate = document.getElementsByClassName("hotdeskDaterange")[0].value.split('-')[1].trim();
						$scope.calculateDateRange();
					});
					$('input[name="daterange"]').on('hide.daterangepicker', function(ev, picker) {
						$scope.dateRangeStartDate = document.getElementsByClassName("hotdeskDaterange")[0].value.split('-')[0].trim();
						$scope.dateRangeEndDate = document.getElementsByClassName("hotdeskDaterange")[0].value.split('-')[1].trim();
						$scope.calculateDateRange();
					});

				};

				/*
					Author                : Rajesh K
					Date                  : 27-05-2016
					Last Modified         : 01-06-2016
					Function Description  : Excludes Sunday in calendar and set variable "calEventObj.excludeSunday". Based on variable button is enabled / disabled.
				*/
				calEventObj.disableSundayBtn = function(){
					$('input[name="daterange"]').daterangepicker("destroy");
						$('input[name="daterange"]').focus();
						$('input[name="daterange"]').daterangepicker(
							{
								minDate: moment(),
								maxDate: moment().add(90, 'days'),
								drops: "up",
								isInvalidDate: function(date) {
									if(calEventObj.excludeHoliday){	
										for(var i = 0; i < $scope.unavailableDates.length; i++){
											if (date.format('D-MM-YYYY') == $scope.unavailableDates[i]){
												return true;
											}
										}
									}
										return (date.day() == 0);
								},
								isCustomDate: function(date) {
									for(var i = 0; i < $scope.unavailableDates.length; i++){
										if (date.format('D-MM-YYYY') == $scope.unavailableDates[i]){
											return "holidayDate-td";
										}
									}
									if((date.day() == 0)){
										return "calendarSunday-td";
									}
								}
							},
						function(start, end, label) {
								 $scope.dateRangeStartDate = start.format('MM-DD-YYYY');
								 $scope.dateRangeEndDate = end.format('MM-DD-YYYY');
						});
						calEventObj.excludeSunday = true;
						if(!calEventObj.excludeSunday){
							var dSunday = ("<div id=\"disableSunday\" data-ng-controller=\"SearchController\"><br/><button type=\"button\" class=\"btn weekendBtn disableSunday\">Exclude Sunday</button></div>");
							$(".range_inputs").append(dSunday).find('.disableSunday').on('click', calEventObj.disableSundayBtn);
							$('input[name="daterange"]').focus();
						}
						else
						{
							var eSunday = ("<div id=\"enableSunday\" data-ng-controller=\"SearchController\"><br/><button class='btn weekendBtn enableSunday'>Include Sunday</button></div>");
							$(".range_inputs").append(eSunday).find('.enableSunday').on('click', calEventObj.enableSundayBtn);
							$('input[name="daterange"]').focus();
						}
						if(!calEventObj.excludeHoliday){
							var dHoliday = ("<div id=\"disableHoliday\" data-ng-controller=\"SearchController\"><br/><button type=\"button\" class=\"btn holidayBtn disableHoliday\">Exclude Holiday</button></div>");
							$(".range_inputs").append(dHoliday).find('.disableHoliday').on('click', calEventObj.disableHolidayBtn);
							$('input[name="daterange"]').focus();
						}
						else
						{
							var eHoliday = ("<div id=\"enableHoliday\" data-ng-controller=\"SearchController\"><br/><button class='btn holidayBtn enableHoliday'>Include Holiday</button></div>");
							$(".range_inputs").append(eHoliday).find('.enableHoliday').on('click', calEventObj.enableHolidayBtn);
							$('input[name="daterange"]').focus();
						}
						$('input[name="daterange"]').on('apply.daterangepicker', function(ev, picker) {
							$scope.dateRangeStartDate = document.getElementsByClassName("hotdeskDaterange")[0].value.split('-')[0].trim();
							$scope.dateRangeEndDate = document.getElementsByClassName("hotdeskDaterange")[0].value.split('-')[1].trim();
							$scope.calculateDateRange();
						});
						$('input[name="daterange"]').on('hide.daterangepicker', function(ev, picker) {
							$scope.dateRangeStartDate = document.getElementsByClassName("hotdeskDaterange")[0].value.split('-')[0].trim();
							$scope.dateRangeEndDate = document.getElementsByClassName("hotdeskDaterange")[0].value.split('-')[1].trim();
							$scope.calculateDateRange();
						});
				};
				
				/*
					Author                : Rajesh K
					Date                  : 27-05-2016
					Last Modified         : 01-06-2016
					Function Description  : Excludes Holiday in calendar and set variable "calEventObj.excludeHoliday". Based on variable button is enabled / disabled.
				*/
				calEventObj.disableHolidayBtn = function(){
						$('input[name="daterange"]').focus();
						$('input[name="daterange"]').daterangepicker(
							{
								minDate: moment(),
								maxDate: moment().add(90, 'days'),
								drops: "up",
								isInvalidDate: function(date) {
									for(var i = 0; i < $scope.unavailableDates.length; i++){
										if (date.format('D-MM-YYYY') == $scope.unavailableDates[i]){
											return "holidayDate-td";
										}
									}
									if(calEventObj.excludeSunday){
										return (date.day() == 0);
									}
								},
								isCustomDate: function(date) {
									for(var i = 0; i < $scope.unavailableDates.length; i++){
										if (date.format('D-MM-YYYY') == $scope.unavailableDates[i]){
											return "holidayDate-td";
										}
									}
							    	if((date.day() == 0)){
										return "calendarSunday-td";
									}
								}
							},
						function(start, end, label) {
								 $scope.dateRangeStartDate = start.format('MM-DD-YYYY');
								 $scope.dateRangeEndDate = end.format('MM-DD-YYYY');
						});
						calEventObj.excludeHoliday = true;
						if(calEventObj.excludeSunday){							
							var eSunday = ("<div id=\"enableSunday\" data-ng-controller=\"SearchController\"><br/><button class='btn weekendBtn enableSunday'>Include Sunday</button></div>");
							$(".range_inputs").append(eSunday).find('.enableSunday').on('click', calEventObj.enableSundayBtn);
							$('input[name="daterange"]').focus();
						}
						else
						{
							var dSunday = ("<div id=\"disableSunday\" data-ng-controller=\"SearchController\"><br/><button type=\"button\" class=\"btn weekendBtn disableSunday\">Exclude Sunday</button></div>");
							$(".range_inputs").append(dSunday).find('.disableSunday').on('click', calEventObj.disableSundayBtn);
							$('input[name="daterange"]').focus();
						}
						if(!calEventObj.excludeHoliday){
							var dHoliday = ("<div id=\"disableHoliday\" data-ng-controller=\"SearchController\"><br/><button type=\"button\" class=\"btn holidayBtn disableHoliday\">Exclude Holiday</button></div>");
							$(".range_inputs").append(dHoliday).find('.disableHoliday').on('click', calEventObj.disableHolidayBtn);
							$('input[name="daterange"]').focus();
						}
						else
						{
							var eHoliday = ("<div id=\"enableHoliday\" data-ng-controller=\"SearchController\"><br/><button class='btn holidayBtn enableHoliday'>Include Holiday</button></div>");
							$(".range_inputs").append(eHoliday).find('.enableHoliday').on('click', calEventObj.enableHolidayBtn);
							$('input[name="daterange"]').focus();
						}
						$('input[name="daterange"]').on('apply.daterangepicker', function(ev, picker) {
							$scope.dateRangeStartDate = document.getElementsByClassName("hotdeskDaterange")[0].value.split('-')[0].trim();
							$scope.dateRangeEndDate = document.getElementsByClassName("hotdeskDaterange")[0].value.split('-')[1].trim();
							$scope.calculateDateRange();
						});
						$('input[name="daterange"]').on('hide.daterangepicker', function(ev, picker) {
							$scope.dateRangeStartDate = document.getElementsByClassName("hotdeskDaterange")[0].value.split('-')[0].trim();
							$scope.dateRangeEndDate = document.getElementsByClassName("hotdeskDaterange")[0].value.split('-')[1].trim();
							$scope.calculateDateRange();
						});
				};
		
		$timeout(function() {
			$("#date").datepicker({
				minDate : 0
			});
			$("#fromDate").datepicker({
				minDate: 0 
			});

			$("#boarddate").datepicker({
				minDate: 0 
			});
			$("#trainingfromDate").datepicker({
				minDate: 0 
			});
			$("#trainingendDate").datepicker({
				minDate: 0 
			});
			
			if( $(window).width() <= 415){
				$(".searchForm-d320").remove();
				/*
					Author                : Rajesh K
					Date                  : 23-09-2016
					Last Modified         : 23-09-2016
					Function Description  : JavaScript function to detect whether device is Android, if it is Android then display banner.
				*/
					var ua = navigator.userAgent.toLowerCase();
					var isAndroid = ua.indexOf("android") > -1;
					if(isAndroid) {
						$('.app-banner').css({"display" : "inline"});
					}
					else {
						$('.app-banner').css({"display" : "none"});
					}
				$('html, body').animate({scrollTop: '0px'}, 0);
			}
			else {
				$(".roomTypeDropdown").remove();
				$('.app-banner').css({"display" : "none"});
				$('html, body').animate({scrollTop: '0px'}, 0);
			}

		})

	}

	/*
		Author                : Rajesh K
		Date                  : 23-09-2016
		Last Modified         : 23-09-2016
		Function Description  : Function to close APP Banner for mobile device (For Android Only.)
	*/

	$scope.closeAppBanner =  function () {
		$('html, body').animate({scrollTop: '0px'}, 0);
		$('.app-banner').css({"display" : "none"});
	};

	/*
		Author                : Rajesh K
		Date                  : 27-05-2016
		Last Modified         : 01-06-2016
		Function Description  : Calendar function gets initiated when user clicks on calendar input field.
								Initially both Sunday and Holiday are excluded.
	*/
	$scope.loadDateRange = function() {
		calEventObj.excludeSunday = true;
		calEventObj.excludeHoliday = true;
		$('input[name="daterange"]').daterangepicker(
				{ 
					minDate: moment(),
					maxDate: moment().add(90, 'days'),
					isInvalidDate: function(date) {
						for(var i = 0; i < $scope.unavailableDates.length; i++){
							if (date.format('D-MM-YYYY') == $scope.unavailableDates[i]){
								return true;
							}
						}
		  				return (date.day() == 0);
					},
					isCustomDate: function(date) {
						for(var j = 0; j < $scope.unavailableDates.length; j++){
							if (date.format('D-MM-YYYY') == $scope.unavailableDates[j]){
								return "holidayDate-td";
							}
						}
						if((date.day() == 0)){
							return "calendarSunday-td";
						}
					},
					drops: "up"
				},
				function(start, end, label) {
	   				 $scope.dateRangeStartDate = start.format('MM-DD-YYYY');
	   				 $scope.dateRangeEndDate = end.format('MM-DD-YYYY');
		});
		$('input[name="daterange"]').on('show.daterangepicker', function(ev, picker) {
			$('.daterangepicker.dropdown-menu .calendar.left .daterangepicker_input').prepend('<span style="position: fixed;z-index: 999999999999;margin: 0.4em 0 0 2em;font-weight: bolder;">From</span>');
			$('.daterangepicker.dropdown-menu .calendar.right .daterangepicker_input').prepend('<span style="position: fixed;z-index: 999999999999;margin: 0.4em 0 0 2em;font-weight: bolder;">To</span>');
			var eSunday = ("<div id=\"enableSunday\" data-ng-controller=\"SearchController\"><br/><button class='btn weekendBtn enableSunday'>Include Sunday</button></div>");
				$(".range_inputs").append(eSunday).find('.enableSunday').on('click', calEventObj.enableSundayBtn);
			var eHoliday = ("<div id=\"enableHoliday\" data-ng-controller=\"SearchController\"><br/><button class='btn holidayBtn enableHoliday'>Include Holiday</button></div>");
				$(".range_inputs").append(eHoliday).find('.enableHoliday').on('click', calEventObj.enableHolidayBtn);
		});
		$('input[name="daterange"]').on('apply.daterangepicker', function(ev, picker) {
			$scope.dateRangeStartDate = document.getElementsByClassName("hotdeskDaterange")[0].value.split('-')[0].trim();
			$scope.dateRangeEndDate = document.getElementsByClassName("hotdeskDaterange")[0].value.split('-')[1].trim();
			$scope.calculateDateRange();
		});
		$('input[name="daterange"]').on('hide.daterangepicker', function(ev, picker) {
			if( $(window).width() <= 415){
				$('.range_inputs').children('#enableSunday').remove();
				$('.range_inputs').children('#enableHoliday').remove();
			}
			$scope.dateRangeStartDate = document.getElementsByClassName("hotdeskDaterange")[0].value.split('-')[0].trim();
			$scope.dateRangeEndDate = document.getElementsByClassName("hotdeskDaterange")[0].value.split('-')[1].trim();
			$scope.calculateDateRange();
		});

		$('input[name="daterange"]').focus();
	};

	$scope.loadMeetingRoomCalendar = function() {
		calEventObj.excludeSunday = true;
		calEventObj.excludeHoliday = true;
		$('input[name="daterangeMeetingRoom"]').daterangepicker(
				{ 
					minDate: moment(),
					maxDate: moment().add(90, 'days'),
					singleDatePicker: true,
					// isInvalidDate: function(date) {
					// 	for(var i = 0; i < $scope.unavailableDates.length; i++){
					// 		if (date.format('D-MM-YYYY') == $scope.unavailableDates[i]){
					// 			return true;
					// 		}
					// 	}
		  	// 			return (date.day() == 0);
					// },
					// isCustomDate: function(date) {
					// 	for(var j = 0; j < $scope.unavailableDates.length; j++){
					// 		if (date.format('D-MM-YYYY') == $scope.unavailableDates[j]){
					// 			return "holidayDate-td";
					// 		}
					// 	}
					// 	if((date.day() == 0)){
					// 		return "calendarSunday-td";
					// 	}
					// },
					drops: "up"
				});
		$('input[name="daterangeMeetingRoom"]').focus();
	};

	$scope.loadBoardRoomCalendar = function() {
		calEventObj.excludeSunday = true;
		calEventObj.excludeHoliday = true;
		$('input[name="daterangeBoardRoom"]').daterangepicker(
				{ 
					minDate: moment(),
					maxDate: moment().add(90, 'days'),
					singleDatePicker: true,
					// isInvalidDate: function(date) {
					// 	for(var i = 0; i < $scope.unavailableDates.length; i++){
					// 		if (date.format('D-MM-YYYY') == $scope.unavailableDates[i]){
					// 			return true;
					// 		}
					// 	}
		  	// 			return (date.day() == 0);
					// },
					// isCustomDate: function(date) {
					// 	for(var j = 0; j < $scope.unavailableDates.length; j++){
					// 		if (date.format('D-MM-YYYY') == $scope.unavailableDates[j]){
					// 			return "holidayDate-td";
					// 		}
					// 	}
					// 	if((date.day() == 0)){
					// 		return "calendarSunday-td";
					// 	}
					// },
					drops: "up"
				});
		$('input[name="daterangeBoardRoom"]').focus();
	};
	
	var month = new Array();
		month[0] = "01"; month[1] = "02"; month[2] = "03"; month[3] = "04"; month[4] = "05"; month[5] = "06";
		month[6] = "07"; month[7] = "08"; month[8] = "09"; month[9] = "10"; month[10] = "11"; month[11] = "12";

		$scope.holidaysList = [];
		
		/*
			Author                : Rajesh K
			Date                  : 27-05-2016
			Last Modified         : 27-05-2016
			Function Description  : Function to fetch list of holiday (Current year).
			Parameter			  : Current year.
		*/
		$scope.loadHoliday = function(){
			$scope.unavailableDates =[];
			$scope.disabledDate = [];
			var nintyDays = 90;
			var currentDate = new Date();
			var selectedyear = currentDate.getFullYear();
				/*HolidaysService.getHolidaysbyyear.query({
					selectedyears: selectedyear
				},function(response){*/
				HolidaysService.getHolidaysByDays.query({
	                days: nintyDays
	            }, function(response) {
					$scope.holidays = response;
					for (var i = 0; i < $scope.holidays.length; i++) {
						var hoilidayDate = new Date($scope.holidays[i].holiday_date).getDate();
						var holidayMonth = month[new Date($scope.holidays[i].holiday_date).getMonth()];
						var hoilidayYear = new Date($scope.holidays[i].holiday_date).getFullYear();
						$scope.holidaysList.push(
						{
							title: $scope.holidays[i].name,
							start: hoilidayDate+"-"+holidayMonth+"-"+hoilidayYear
						});
						$scope.unavailableDates.push(
							hoilidayDate+"-"+holidayMonth+"-"+hoilidayYear
						);
						$scope.disabledDate.push(
							holidayMonth+"-"+hoilidayDate+"-"+hoilidayYear
						);
					}
					$(".hotdeskEndDate").datepicker({
						minDate: 0,
						beforeShowDay: unavailable
					});
					function unavailable(date) {
						var dmy = date.getDate() + "-" + (date.getMonth()+1) + "-" +date.getFullYear();
						if ($.inArray(dmy, $scope.unavailableDates) < 0) {
							return [true,"",""];
						} else {
							return [false,"holidayDate",""];
						}
					}
				});      
		};
		$scope.calculateDateRange = function() {
			var validDate = true;
			Date.prototype.addDays = function(days)
			{
				var dat = new Date(this.valueOf());
				dat.setDate(dat.getDate() + days);
				return dat;
			}

			var dates = [];

			var holidaystartDate = new Date($scope.dateRangeStartDate);
			var holidayendDate = new Date($scope.dateRangeEndDate);

			// create a loop between the interval
			while (holidaystartDate <= holidayendDate)
			{
			// add one day

				var hoilidayDate = holidaystartDate.getDate();
				var holidayMonth = month[holidaystartDate.getMonth()];
				var hoilidayYear = holidaystartDate.getFullYear();
			
				if(calEventObj.excludeHoliday && calEventObj.excludeSunday){
					var temp = holidayMonth+"/"+hoilidayDate+"/"+hoilidayYear;
					var isDateInRange = jQuery.inArray( temp, $scope.disabledDate );
					if(isDateInRange == -1 && holidaystartDate.getDay() !=0){
						dates.push(holidayMonth+"/"+hoilidayDate+"/"+hoilidayYear);
					}
					else if(isDateInRange != -1 && holidaystartDate.getDay() == 0) {
						dates.push(holidayMonth+"/"+hoilidayDate+"/"+hoilidayYear);
					}
				}
				if(calEventObj.excludeHoliday && !calEventObj.excludeSunday){
					var temp = holidayMonth+"/"+hoilidayDate+"/"+hoilidayYear;
					var isDateInRange = jQuery.inArray( temp, $scope.disabledDate );
					if(isDateInRange == -1) {
						dates.push(holidayMonth+"/"+hoilidayDate+"/"+hoilidayYear);
					}
				}
				if(!calEventObj.excludeHoliday && calEventObj.excludeSunday){
					var temp = holidayMonth+"/"+hoilidayDate+"/"+hoilidayYear;
					var isDateInRange = jQuery.inArray( temp, $scope.disabledDate );
					if(holidaystartDate.getDay() !=0) {
						dates.push(holidayMonth+"/"+hoilidayDate+"/"+hoilidayYear);
					}
				}
				if(!calEventObj.excludeHoliday && !calEventObj.excludeSunday){
					var temp = holidayMonth+"/"+hoilidayDate+"/"+hoilidayYear;
					dates.push(holidayMonth+"/"+hoilidayDate+"/"+hoilidayYear);
				}
				holidaystartDate = holidaystartDate.addDays(1);

			}
			$scope.filteredDate = dates;
		};
	/*	
	$("#meetingcheckin").on('focusout', function(){
		var timeArr = document.getElementById("meetingcheckin").value;
		timeArr = timeArr.split(" ");
		var minTime = timeArr[0].split(":");
		console.log(minTime);
		var minHrs = parseInt(minTime[0]);
		var minMins = parseInt(minTime[1]);
		console.log(minHrs);

		$('#meetingcheckout').datetimepicker("destroy");
		$scope.$apply(function () {
			$('#meetingcheckout').datetimepicker({
				min :
			});
		});

	});*/


	/*	
	var autocompleteService = new google.maps.places.AutocompleteService();

	getPlacePredictions(document.getElementById('destination').value);

	function getPlacePredictions(search) {

	    autocompleteService.getPlacePredictions({
	        input: search,
	        types: ['establishment', 'geocode']
	    });
	}*/
	
	$scope.locations = [{
		seqNo : 1,
		city : 'Bangalore',
		cityValue : 'Bangalore',
		lat : 12.971599,
		lng : 77.594563,
		radius : 15		
	}, {
		seqNo : 2,
		city : 'Mumbai',
		cityValue : 'Mumbai',
		lat : 19.075984,
		lng : 72.877656,
		radius : 15
	}, {
		seqNo : 3,
		city : 'Mumbai (Navi)',
		cityValue : 'Mumbai Navi',
		lat : 19.0330,
		lng : 73.0297,
		radius : 15
	}, {
		seqNo : 4,
		city : 'Mumbai (Thane)',
		cityValue : 'Mumbai Thane',
		lat : 19.076,
		lng : 72.8562,
		radius : 15
	}, {
		seqNo : 5,
		city :'Pune',
		cityValue : 'Pune',
		lat : 18.520430,
		lng : 73.856744,
		radius : 15
	}];

	$scope.selectedLocation = {};

	$scope.selectLocationObj =  function(index) {
		$scope.$broadcast('angucomplete-alt:clearInput');
		if(index == null){
			flash.setMessage(MESSAGES.INVALID_CITY,MESSAGES.ERROR);
			$scope.disableInput = true;
		}
		else {
		    	$scope.disableInput = false;
				for(var i=0; i<$scope.locations.length; i++){
					if(index == $scope.locations[i].seqNo){
						$scope.selectedLocation = $scope.locations[i];
					}
				}
				SearchService.areas.get({
					city: $scope.selectedLocation.cityValue
				}, function(location){
					if(location && location.areas) {
						$scope.cityRelatedLocalities = location;
						$scope.localityAreas = location.areas;
						for (var i = 0; i < $scope.localityAreas.length; i++) {
			                $scope.localityAreas[i].uniqueid = $scope.localityAreas[i]._id;
			            }
			        }
				});
			}
	}
	
	
	$scope.locality = function (selected) {
        if (selected) {
        	$scope.address = selected;
        } else {
        	$scope.address = {};
        }
    };
	
    $scope.onFocus = function (room) {
        document.getElementsByClassName('plugandplayAngucomplete').value= "";
        $scope.$broadcast('angucomplete-alt:clearInput');
        // console.log(room);
        if (!room.city) {
        	$scope.disableInput = true;
			flash.setMessage(MESSAGES.INVALID_CITY,MESSAGES.ERROR);
        }
    };
	
	$scope.tabNo = 2;
	
	$scope.resetSelectedLocation =  function(tabNo) {
		$scope.tabNo = tabNo;
		$scope.selectedLocation = {};
		$scope.disableInput = true;
		$('.cityDropdown').val('');
		$('.select-ui').val('')
		$scope.$broadcast('angucomplete-alt:clearInput');
	}
	
	$scope.hotDesk = {};
	$scope.meetingRoom = {};
	$scope.boardRoom = {};
	$scope.trainingRoom = {};
	$scope.virtualOffice = {};
	$scope.plugnplay = {};
	$scope.disableInput = true;

	$scope.timeSet = [{data : '12:00 AM'}, {data :'12:30 AM'}, {data :'01:00 AM'}, {data :'01:30 AM'}, {data :'02:00 AM'}, {data :'02:30 AM'}, {data :'03:00 AM'}, {data :'03:30 AM'}, 
	                  {data :'04:00 AM'}, {data :'04:30 AM'}, {data :'05:00 AM'}, {data :'05:30 AM'}, {data :'06:00 AM'}, {data :'06:30 AM'}, {data :'07:00 AM'}, {data :'07:30 AM'}, 
	                  {data :'08:00 AM'}, {data :'08:30 AM'}, {data :'09:00 AM'}, {data :'09:30 AM'}, {data :'10:00 AM'}, {data :'10:30 AM'}, {data :'11:00 AM'}, {data :'11:30 AM'}, 
	                  {data :'12:00 PM'}, {data :'12:30 PM'}, {data :'01:00 PM'}, {data :'01:30 PM'}, {data :'02:00 PM'}, {data :'02:30 PM'}, {data :'03:00 PM'}, {data :'03:30 PM'}, 
	                  {data :'04:00 PM'}, {data :'04:30 PM'}, {data :'05:00 PM'}, {data :'05:30 PM'}, {data :'06:00 PM'}, {data :'06:30 PM'}, {data :'07:00 PM'}, {data :'07:30 PM'}, 
	                  {data :'08:00 PM'}, {data :'08:30 PM'}, {data :'09:00 PM'}, {data :'09:30 PM'}, {data :'10:00 PM'}, {data :'10:30 PM'}, {data :'11:00 PM'}, {data :'11:30 PM'}];

	$scope.endTimeSet = $scope.timeSet;

	$scope.timeTypes = [{data : 'Hourly'}, {data: 'Half Day'}, {data: 'Full Day'}];

	$scope.trainingTimeTypes = [{data: 'Half Day'}, {data: 'Full Day'}];

	$scope.meetingRoomCapacity = [{data : '02'}, {data: '03'}, {data: '04'},{data : '05'}, {data: '06'}, {data: '07'},{data : '08'}];

	$scope.boardRoomCapacity = [{data : '08'}, {data: '09'}, {data: '10'},{data : '11'}, {data: '12'},{data : '13'}, {data: '14'}, {data: '15'},{data : '16'}, {data: '17'}, {data: '18'},{data : '19'}, {data: '20'}];
	
	$scope.hotDeskCapacity = [{data : '01'}, {data: '02'}, {data : '03'}, {data: '04'}, {data: '05'}, {data : '06'}, {data: '07'}, {data: '08'}, {data : '09'}, {data: '10'}]; 
	                          // {data : '11'}, {data: '12'}, {data : '13'}, {data: '14'}, {data: '15'}, {data : '16'}, {data: '17'}, {data: '18'}, {data : '19'}, {data: '20'},
	                          // {data : '21'}, {data: '22'}, {data : '23'}, {data: '24'}, {data: '25'}, {data : '26'}, {data: '27'}, {data: '28'}, {data : '29'}, {data: '30'},
	                          // {data : '31'}, {data: '32'}, {data : '33'}, {data: '34'}, {data: '35'}, {data : '36'}, {data: '37'}, {data: '38'}, {data : '39'}, {data: '40'},
	                          // {data : '41'}, {data: '42'}, {data : '43'}, {data: '44'}, {data: '45'}, {data : '46'}, {data: '47'}, {data: '48'}, {data : '49'}, {data: '50'}];

	$scope.occupancyRange = [{range : '01 - 10'}, {range : '11 - 20'}, {range : '21 - 30'}, {range : '31 - 40'}, {range : '41 - 50'}];

	$scope.incExcObj = {};
	$scope.sessionTime = {};
	
	
	$scope.sessionsHD = [{
		seqNo : 1,
		durationType : 'Half Day'
	}, {
		seqNo : 2,
		durationType : 'Full Day'
	}];
	
	//validation for time
	$scope.setEndTimeList = function(room){
		var index;
		for(var i = 0; i < $scope.timeSet.length; i++){
			if(room.startTime === $scope.timeSet[i].data){
				index = i;
				break;
			}
		}
		$scope.endTimeSet = [];
		for(var j = index + 2; j < $scope.timeSet.length; j++){
			$scope.endTimeSet.push($scope.timeSet[j]);
		}
	};

	$scope.hideEndTime = function(roomObj){
		$scope.endTimeSet = $scope.timeSet;
		$scope.timeType = roomObj.timeType;
		delete roomObj.startTime;
		delete roomObj.endTime;
		if(roomObj.timeType === 'Half Day'){
			$scope.hideEndTimeBox = true;
		} else if(roomObj.timeType === 'Full Day'){
			$scope.hideEndTimeBox = true;
		} else {
			$scope.hideEndTimeBox = false;
		}
	};

	$scope.setEndTimeForHalfFullDay = function(room){
		for(var i = 0; i < $scope.sessions.length; i++){
			if(room.duration == $scope.sessions[i].seqNo){
				var sessionObj = $scope.sessions[i];
				room.endTime = $scope.setEndTime(sessionObj);
			}
		}
	};
	
	$scope.setEndTimeForHalfFullDayHD = function(room){
		for(var i = 0; i < $scope.sessionsHD.length; i++){
			if(room.duration == $scope.sessionsHD[i].seqNo){
				$scope.sessionObj = $scope.sessionsHD[i];
			}
		}
	};
	
	$scope.setEndTimeBasedOnTimeFrameHD = function(room){
		for(var i = 0; i < $scope.hotDeskTimeFrame.length; i++){
			if(room.duration == $scope.hotDeskTimeFrame[i].seqNo){
				$scope.sessionObj = $scope.hotDeskTimeFrame[i];
			}
		}
	};
	
	$scope.setEndTime = function(room){
		if(room.durationType === 'Half Day'){
			for(var i = 0; i < $scope.timeSet.length; i++){
				if($scope.timeSet[i].data === room.startTime){
					if(i > 40) {
						room.endTime = $scope.timeSet[i % 40].data;	
					} else { 
						room.endTime = $scope.timeSet[i+8].data;	
					}
				}
			}
		} else if(room.durationType === 'Full Day'){
			for(var i = 0; i < $scope.timeSet.length; i++){
				if($scope.timeSet[i].data === room.startTime){
					if(i > 40) {
						room.endTime = $scope.timeSet[(i % 40) + 9].data;	
					} else { 
						room.endTime = $scope.timeSet[i+18].data;	
					}
				}
			}
		} else{
			//console.log(room.timeType);
		}
		$scope.sessionTime = {
			startTime: room.startTime,
			endTime: room.endTime
		}
		return room.endTime;
	};
	
	$scope.setEndTimeHalfFullDay = function(room){
		if($scope.sessionObj.durationType === 'Half Day'){
			var position = 0;
			var indexPosition = $scope.sessionObj.startTime[position];
			indexPosition = parseInt(indexPosition);
			if(indexPosition > 1 || $scope.sessionObj.startTime[position + 1] === ':'){
				$scope.sessionObj.startTime = [$scope.sessionObj.startTime.slice(0, position), '0', $scope.sessionObj.startTime.slice(position)].join('');
			}
			for(var i = 0; i < $scope.timeSet.length; i++){
				if($scope.timeSet[i].data === $scope.sessionObj.startTime){
					if(i > 40) {
						$scope.sessionObj.endTime = $scope.timeSet[i % 40].data;	
					} else { 
						$scope.sessionObj.endTime = $scope.timeSet[i+8].data;	
					}
				}
			}
		} else if($scope.sessionObj.durationType === 'Full Day'){
			var position = 0;
			var indexPosition = $scope.sessionObj.startTime[position];
			indexPosition = parseInt(indexPosition);
			if(indexPosition > 1 || $scope.sessionObj.startTime[position + 1] === ':'){
				$scope.sessionObj.startTime = [$scope.sessionObj.startTime.slice(0, position), '0', $scope.sessionObj.startTime.slice(position)].join('');
			}
			for(var i = 0; i < $scope.timeSet.length; i++){
				if($scope.timeSet[i].data === $scope.sessionObj.startTime){
					if(i > 40) {
						$scope.sessionObj.endTime = $scope.timeSet[(i % 40) + 8].data;	
					} else { 
						$scope.sessionObj.endTime = $scope.timeSet[i+16].data;	
					}
				}
			}
		} else{
			//console.log(room.timeType);
		}
		return $scope.sessionObj.endTime;
	};
	
	$scope.setEndTimeForHotDeskBasedOnTimeFrame = function(room){
		$scope.sessionTime = {};
		if($scope.sessionObj.number){
			var setTime = $scope.sessionObj.number;
			var position = 0;
			var indexPosition = room.startTime[position];
			indexPosition = parseInt(indexPosition);
			if(indexPosition > 1 || room.startTime[position + 1] === ':'){
				room.startTime = [room.startTime.slice(0, position), '0', room.startTime.slice(position)].join('');
			}
			
			for(var i = 0; i < $scope.timeSet.length; i++){
				if($scope.timeSet[i].data === room.startTime){
					if(i > 40) {
						room.endTime = $scope.timeSet[i % 40].data;	
					} else { 
						room.endTime = $scope.timeSet[i+(2*setTime)].data;	
					}
					if((i + setTime) > 40){
						$scope.sessionTime.isEndTime = true;
					}
				}
			}
			
			$scope.sessionTime.startTime = room.startTime,
			$scope.sessionTime.endTime = room.endTime
		} else {
			room.endTime = "";
		}

		return room.endTime;
	}

	$scope.searchService = function(searchElement){
		console.log(searchElement);
		if($scope.searchElements.roomType == SEARCH.CONSTANT.MEETING_ROOM){
			var search = new SearchService.search(searchElement);
			search.$save({
				perPage : 6,
				page : 0
			}, function(searchedList){
				if(!angular.isUndefined(searchedList.rooms)){
					$scope.searchedList = searchedList.rooms;
					if($scope.searchedList.length > 0){
						$rootScope.searchedList = $scope.searchedList;
						$location.url(SEARCH.URL_PATH.SEARCH_LIST+'?search_lon=' + $scope.searchElements.lon +'&search_lat=' + $scope.searchElements.lat + '&capacitymin='+$scope.searchElements.capacity.min+ '&capacitymax='+$scope.searchElements.capacity.max+ '&start_time='+$scope.selectedStartTime+ '&end_time='+$scope.selectedEndTime +'&roomType='+$scope.searchElements.roomType+'&place='+$scope.searchElements.place+'&from_date='+$scope.searchElements.fromDate+'&end_date='+$scope.searchElements.endDate+'&timeType='+$rootScope.dateObj.timeType+'&dateselc='+$rootScope.dateObj.date+'&pageNo='+0);
					}else{
						flash.setMessage(MESSAGES.ROOM_NOT_FOUND,MESSAGES.ERROR);
					}
				}else{
					flash.setMessage(MESSAGES.ROOM_NOT_FOUND,MESSAGES.ERROR);
				}
			}, function(error){
				console.log(error);
			});
		} else if($scope.searchElements.roomType == SEARCH.CONSTANT.BOARD_ROOM) {
			var search = new SearchService.search(searchElement);
			search.$save({
				perPage : 6,
				page : 0
			}, function(searchedList){
				if(!angular.isUndefined(searchedList.rooms)){
					$scope.searchedList = searchedList.rooms;
					if($scope.searchedList.length > 0){
						$rootScope.searchedList = $scope.searchedList;
						console.log(SEARCH.URL_PATH.SEARCH_LIST+'?search_lon=' + $scope.searchElements.lon +'&search_lat=' + $scope.searchElements.lat + '&capacitymin='+$scope.searchElements.capacity.min+ '&capacitymax='+$scope.searchElements.capacity.max+ '&start_time='+$scope.selectedStartTime+ '&end_time='+$scope.selectedEndTime +'&roomType='+$scope.searchElements.roomType+'&place='+$scope.searchElements.place+'&from_date='+$scope.searchElements.fromDate+'&end_date='+$scope.searchElements.endDate+'&dateselc='+$rootScope.dateObj.date+'&pageNo='+0);
						$location.url(SEARCH.URL_PATH.SEARCH_LIST+'?search_lon=' + $scope.searchElements.lon +'&search_lat=' + $scope.searchElements.lat + '&capacitymin='+$scope.searchElements.capacity.min+ '&capacitymax='+$scope.searchElements.capacity.max+ '&start_time='+$scope.selectedStartTime+ '&end_time='+$scope.selectedEndTime +'&roomType='+$scope.searchElements.roomType+'&place='+$scope.searchElements.place+'&from_date='+$scope.searchElements.fromDate+'&end_date='+$scope.searchElements.endDate+'&dateselc='+$rootScope.dateObj.date+'&pageNo='+0);
					}else{
						flash.setMessage(MESSAGES.ROOM_NOT_FOUND,MESSAGES.ERROR);
					}
				}else{
					flash.setMessage(MESSAGES.ROOM_NOT_FOUND,MESSAGES.ERROR);
				}
			}, function(error){
				console.log(error);
			});
		} else if($scope.searchElements.roomType == SEARCH.CONSTANT.TRAINING_ROOM) {
			var search = new SearchService.search(searchElement);
			search.$save({
				perPage : 6,
				page : 0
			}, function(searchedList){
				if(!angular.isUndefined(searchedList.rooms)){
					$scope.searchedList = searchedList.rooms;
					if($scope.searchedList.length > 0){
						$rootScope.searchedList = $scope.searchedList;
						$location.url(SEARCH.URL_PATH.SEARCH_LIST+'?search_lon=' + $scope.searchElements.lon +'&search_lat=' + $scope.searchElements.lat + '&capacitymin='+$scope.searchElements.capacity.min+ '&capacitymax='+$scope.searchElements.capacity.max+ '&start_time='+$scope.searchElements.stime+ '&end_time='+$scope.searchElements.etime +'&roomType='+$scope.searchElements.roomType+'&place='+$scope.searchElements.place+'&from_date='+$scope.searchElements.fromDate+'&end_date='+$scope.searchElements.endDate+'&timeType='+$rootScope.dateObj.timeType+'&dateselc='+$rootScope.dateObj.date+'&excludeSunday='+$scope.searchElements.excludeSunday+'&excludeHoliday='+$scope.searchElements.excludeHoliday+'&timeZoneOffset='+$scope.searchElements.timeZoneOffset+'&pageNo='+0);
					}else{
						flash.setMessage(MESSAGES.ROOM_NOT_FOUND,MESSAGES.ERROR);
					}
				}else{
					flash.setMessage(MESSAGES.ROOM_NOT_FOUND,MESSAGES.ERROR);
				}
			}, function(error){
				console.log(error);
				flash.setMessage(error.data.error,MESSAGES.ERROR);
			});
		} else if($scope.searchElements.roomType == SEARCH.CONSTANT.HOT_DESK) {
			var search = new SearchService.search(searchElement);
			search.$save({
				perPage : 6,
				page : 0
			}, function(searchedList){
				//console.log(searchedList);
				if(!angular.isUndefined(searchedList.rooms)){
					$scope.searchedList = searchedList.rooms;
					if($scope.searchedList.length > 0){
						$rootScope.searchedList = $scope.searchedList;
						$location.url(SEARCH.URL_PATH.SEARCH_LIST+'?search_lon=' + $scope.searchElements.lon +'&search_lat=' + $scope.searchElements.lat + '&capacitymin='+$scope.searchElements.capacity.min+ '&capacitymax='+$scope.searchElements.capacity.max+ '&start_time='+$scope.searchElements.stime+ '&end_time='+$scope.searchElements.etime +'&roomType='+$scope.searchElements.roomType+'&place='+$scope.searchElements.place+'&from_date='+$scope.searchElements.fromDate+'&end_date='+$scope.searchElements.endDate+'&timeType='+$rootScope.dateObj.timeType+'&dateselc='+$rootScope.dateObj.date +'&excludeSunday='+$scope.searchElements.excludeSunday+'&excludeHoliday='+$scope.searchElements.excludeHoliday+'&timeZoneOffset='+$scope.searchElements.timeZoneOffset+'&pageNo='+0);
					}else{
						flash.setMessage(MESSAGES.ROOM_NOT_FOUND,MESSAGES.ERROR);
					}
				}else{
					flash.setMessage(MESSAGES.ROOM_NOT_FOUND,MESSAGES.ERROR);
				}
			}, function(error){
				console.log(error);
			});
		} else if($scope.searchElements.roomType == SEARCH.CONSTANT.VIRTUAL_OFFICE) {
			var search = new SearchService.search(searchElement);
			search.$save({
				perPage : 6,
				page : 0
			}, function(searchedList){
				//console.log(searchedList);
				if(!angular.isUndefined(searchedList.rooms)){
					$scope.searchedList = searchedList.rooms;
					if($scope.searchedList.length > 0){
						$rootScope.searchedList = $scope.searchedList;
						$location.url(SEARCH.URL_PATH.VIRTUAL_OFFICE_LIST+'?search_lon=' + $scope.searchElements.lon +'&search_lat=' + $scope.searchElements.lat +'&roomType='+$scope.searchElements.roomType+'&place='+$scope.searchElements.place+'&dateselc='+$rootScope.dateObj.date +'&pageNo='+0);
					}else{
						flash.setMessage(MESSAGES.ROOM_NOT_FOUND,MESSAGES.ERROR);
					}
				}else{
					flash.setMessage(MESSAGES.ROOM_NOT_FOUND,MESSAGES.ERROR);
				}
			}, function(error){
				console.log(error);
			});
		}
	}

	$scope.getLatitudeLongitude = function(address) {
		/*console.log($scope.address);*/
		if($scope.address.originalObject.loc && $scope.address.originalObject.loc.length > 0){
			$scope.searchElements.lon = $scope.address.originalObject.loc[0];
			$scope.searchElements.lat = $scope.address.originalObject.loc[1];
			$scope.searchElements.timeZoneOffset = $scope.cityRelatedLocalities.timeZoneOffset;
			$rootScope.searchObj = angular.copy($scope.searchElements);

			$scope.searchService($scope.searchElements);
		} else {
			// If adress is not supplied, use default value 'Ferrol, Galicia, Spain'
			address = address || $scope.cityRelatedLocalities.city;
			// Initialize the Geocoder
			var geocoder = new google.maps.Geocoder();
			if (geocoder) {
				geocoder.geocode({
					'address': address
				}, function (results, status) {
					if (status == google.maps.GeocoderStatus.OK) {
						/*console.log(results);
						console.log("center" + results[0].geometry.bounds.getCenter());
						console.log("lat" + results[0].geometry.location.lat());
						console.log("lng" + results[0].geometry.location.lng());*/
					}
					$scope.searchElements.lon = results[0].geometry.location.lng();
					$scope.searchElements.lat = results[0].geometry.location.lat();
					$rootScope.searchObj = angular.copy($scope.searchElements);
					console.log($scope.searchElements);
					
					$scope.address.originalObject.loc = [];
					$scope.address.originalObject.loc.push(results[0].geometry.location.lng());
					$scope.address.originalObject.loc.push(results[0].geometry.location.lat());
					var areasCrud = new SearchService.areas($scope.address);
					areasCrud.$update({
						localityId: $scope.address.originalObject._id,
						areaId: $scope.cityRelatedLocalities._id
					}, function(response){
						console.log(response);
					});
					$scope.searchElements.timeZoneOffset = $scope.cityRelatedLocalities.timeZoneOffset;
					$scope.searchService($scope.searchElements);
				});
			}
		}
	};
	
	/*$scope.getLatitudeLongitude = function(address) {
		console.log(address);
		$scope.searchElements.lon = $scope.address.originalObject.loc[0];
		$scope.searchElements.lat = $scope.address.originalObject.loc[1];
		$rootScope.searchObj = angular.copy($scope.searchElements);

		$scope.searchService($scope.searchElements);
	};*/

	
	$scope.defineSearchObject = function(roomObj, roomType){
		if(SEARCH.CONSTANT.MEETING_ROOM === roomType){
			var roomcapacity = {
					min : roomObj.capacity,
					max : 8
			}
			$scope.searchElements.capacity = roomcapacity;
			$scope.searchElements.roomType = SEARCH.CONSTANT.MEETING_ROOM;
		} else if(SEARCH.CONSTANT.BOARD_ROOM === roomType){
			var roomcapacity = {
					min : roomObj.capacity,
					max : 30
			}
			$scope.searchElements.capacity = roomcapacity;
			$scope.searchElements.roomType = SEARCH.CONSTANT.BOARD_ROOM;
		} else if(SEARCH.CONSTANT.TRAINING_ROOM === roomType){
			var splittedArray = roomObj.capacity.split(' ');
			var roomcapacity = {
					min : parseInt(splittedArray[0]),
					max : parseInt(splittedArray[splittedArray.length - 1])
			}
			$scope.searchElements.capacity = roomcapacity;
			$scope.searchElements.roomType = SEARCH.CONSTANT.TRAINING_ROOM;
		} else if(SEARCH.CONSTANT.HOT_DESK === roomType){
			var roomcapacity = {
					min : 1,
					max : parseInt(roomObj.capacity)
			}
			$scope.searchElements.capacity = roomcapacity;
			$scope.searchElements.roomType = SEARCH.CONSTANT.HOT_DESK;
		} else if(SEARCH.CONSTANT.VIRTUAL_OFFICE === roomType){
			$scope.searchElements.roomType = SEARCH.CONSTANT.VIRTUAL_OFFICE;
		} 

	};

	/**
	 * Search Meeting Room
	 */
	$scope.searchMeetingRoom = function(roomObj, roomType) {
		if(!angular.isUndefined(roomObj)){
			if(roomType === 'Meeting Room'){
				// roomObj.date = document.getElementById("date").value;
				roomObj.date = document.getElementById("meetingRoomDate").value;
				roomObj.startTime = $('#meetingcheckin').val();
				roomObj.endTime = $('#meetingcheckout').val();
			}else if(roomType === 'Board Room'){
				// roomObj.date = document.getElementById("boarddate").value;
				roomObj.date = document.getElementById("boardRoomDate").value;
				roomObj.startTime = $('#boardroomcheckin').val();
				roomObj.endTime = $('#boardroomcheckout').val();
			}
			
			if ((roomObj.date == "") || !roomObj.capacity || (roomObj.startTime == "") || (roomObj.endTime == "") || (!$scope.address)
				|| (Object.keys($scope.address).length === 0 && $scope.address.constructor === Object)) {
				
				flash.setMessage(MESSAGES.ALL_FIELDS_REQUIRED,MESSAGES.ERROR);
			}else{
				$scope.selectedStartTime = roomObj.date + " " + roomObj.startTime;
				var selectedStartTime = new Date($scope.selectedStartTime);

				$scope.selectedEndTime = roomObj.date + " " + roomObj.endTime;
				var selectedEndTime = new Date($scope.selectedEndTime);

				$rootScope.dateObj = {
						date : roomObj.date,
						sTime : roomObj.startTime,
						etime : roomObj.endTime,
						timeType : $scope.timeType
				}

				$scope.searchElements = {
						place: $scope.address.title,
						stime: new Date(selectedStartTime).toUTCString(),
						etime: new Date(selectedEndTime).toUTCString()
				};
				
				$scope.defineSearchObject(roomObj, roomType);

				roomObj.address = $scope.address.title + ', ' + $scope.selectedLocation.city + ', ' + 'India';
				$scope.getLatitudeLongitude(roomObj.address);

				
			}
		}else{
			flash.setMessage(MESSAGES.ALL_FIELDS_REQUIRED,MESSAGES.ERROR);
		}

	};
	
	
	
	
	
	
	
	
	/**
	 * Search Virtual Office
	 */
	$scope.searchVirtualOffice = function(roomObj, roomType) {
		if(!angular.isUndefined(roomObj)){
			if((!$scope.address) || (Object.keys($scope.address).length === 0 && $scope.address.constructor === Object)) {
				flash.setMessage(MESSAGES.ALL_FIELDS_REQUIRED,MESSAGES.ERROR);
				
			}else{

				$rootScope.dateObj = {
						timeType : $scope.timeType
				}

				$scope.searchElements = {
						place: $scope.address.title
				};

				$scope.defineSearchObject(roomObj, roomType);

				roomObj.address = $scope.address.title + ', ' + $scope.selectedLocation.city + ', ' + 'India';
				$scope.getLatitudeLongitude(roomObj.address);

				
			}
		}else{
			flash.setMessage(MESSAGES.ALL_FIELDS_REQUIRED,MESSAGES.ERROR);
		}

	};
	
	
	$scope.dateArrayWithUTCTime = function(filteredDate, roomObj){
		$rootScope.dateTimeList = [];
		var dateTimeObj;
		for(var i = 0; i < filteredDate.length; i++){
			dateTimeObj = {};
			dateTimeObj.startDateTime = new Date(filteredDate[i] + ' ' + roomObj.startTime).toUTCString();
			dateTimeObj.endDateTime = new Date(filteredDate[i] + ' ' + roomObj.endTime).toUTCString();
			
			$rootScope.dateTimeList.push(dateTimeObj);
		}
		return $rootScope.dateTimeList;
	};
	
	

	/**
	 * Search Training Room
	 */
	$scope.searchTrainingRoom = function(roomObj, roomType) {
		console.log(roomObj);
		$scope.incExcObj.excludeSunday = calEventObj.excludeSunday;
		$scope.incExcObj.excludeHoliday = calEventObj.excludeHoliday;
		if(!document.getElementsByClassName("trainingroomDateRange")[0].value.split('-')[0].trim()){
			flash.setMessage(MESSAGES.ALL_FIELDS_REQUIRED,MESSAGES.ERROR);
		}
		$scope.dateRangeStartDate = document.getElementsByClassName("trainingroomDateRange")[0].value.split('-')[0].trim();
		$scope.dateRangeEndDate = document.getElementsByClassName("trainingroomDateRange")[0].value.split('-')[1].trim();
		$scope.calculateDateRange();
		
		if(!angular.isUndefined(roomObj)){
			/*roomObj.startTime = $('#trainingroomcheckin').val();*/
			roomObj.startTime = $scope.sessionTime.startTime;
			if(roomObj.startTime){
				var strTime = roomObj.startTime;
	    		// var AMChange = strTime.includes("AM");
	    		// var PMChange = strTime.includes("PM");
	    		var AMChange = strTime.indexOf("AM") > -1;
	    		var PMChange = strTime.indexOf("PM") > -1;
	    		if(!AMChange || !PMChange){
	    			var AMPMTimeChange = $scope.hotdeskTime(roomObj.startTime);
	    			console.log(AMPMTimeChange);
	    			roomObj.startTime = AMPMTimeChange;
	    		}
			} else {
				roomObj.startTime = "";
			}
			if(roomObj.startTime){
				/*roomObj.endTime = $scope.setEndTimeHalfFullDay(roomObj);*/
				roomObj.endTime = $scope.sessionTime.endTime;
			}

			/*roomObj.fromDate = document.getElementById("trainingfromDate").value;
			roomObj.endDate = document.getElementById("trainingendDate").value;*/
			roomObj.fromDate = $scope.dateRangeStartDate;
			roomObj.endDate = $scope.dateRangeEndDate;
			
			if((roomObj.fromDate == "") || !roomObj.capacity || (roomObj.endDate == "") || (roomObj.startTime == "") || (!$scope.address)
					|| (Object.keys($scope.address).length === 0 && $scope.address.constructor === Object)) {
				
				flash.setMessage(MESSAGES.ALL_FIELDS_REQUIRED,MESSAGES.ERROR);
			}else{

				var selectedStartTime = roomObj.fromDate + " " + roomObj.startTime;
				//var selectedStartTime = new Date(selectedStartTime);

				var selectedEndTime = roomObj.endDate + " " + roomObj.endTime;
				//var selectedEndTime = new Date(selectedEndTime);

				$rootScope.dateObj = {
						fromDate : selectedStartTime,
						endDate : selectedEndTime,
						sTime : roomObj.startTime,
						etime : roomObj.endTime,
						timeType : $scope.timeType,
						roomType: SEARCH.CONSTANT.TRAINING_ROOM
				};

				var datesWithTime;
				/*datesWithTime = $scope.dateArrayWithUTCTime($scope.filteredDate, roomObj);*/
				
				$scope.searchElements = {
						place: $scope.address.title,
						stime: roomObj.startTime,
						etime: roomObj.endTime,
						fromDate: roomObj.fromDate,
						endDate: roomObj.endDate,
						excludeSunday: $scope.incExcObj.excludeSunday,
						excludeHoliday: $scope.incExcObj.excludeHoliday,
						fromToDates: datesWithTime
				};

				$scope.defineSearchObject(roomObj, roomType);

				roomObj.address = $scope.address.title + ', ' + $scope.selectedLocation.city + ', ' + 'India';
				$scope.getLatitudeLongitude(roomObj.address);

			}
		}else{
			flash.setMessage(MESSAGES.ALL_FIELDS_REQUIRED,MESSAGES.ERROR);
		}
	};
	
	/**
	 * Hot Desk
	 */
	 $scope.hotdeskTime = function(dateString) {
		 var replacement = "";
		 if(dateString !== ""){
		 	var d = new Date("01 Jan 2016,"+dateString);
			var hh = d.getHours();
			var m = d.getMinutes();
			var s = d.getSeconds();
			var dd = "AM";
			var h = hh;
			if (h >= 12) {
			    h = hh-12;
			    dd = "PM";
			}
			if (h == 0) {
			    h = 12;
			}
			m = m<10?"0"+m:m;
			s = s<10?"0"+s:s;
			h = h<10?"0"+h:h;

			var pattern = new RegExp("0?"+hh+":"+m+":"+s);

			replacement = h+":"+m;
			replacement += " "+dd;
		 }
		 return replacement;
	 } 
	 
	 $scope.sessionObj = {};
	$scope.searchHotDesk = function(roomObj, roomType) {
		$scope.incExcObj.excludeSunday = calEventObj.excludeSunday;
		$scope.incExcObj.excludeHoliday = calEventObj.excludeHoliday;
		
		$scope.dateRangeStartDate = document.getElementsByClassName("hotdeskDaterange")[0].value.split('-')[0].trim();
		if(document.getElementsByClassName("hotdeskDaterange")[0].value.split('-')[1]){
			$scope.dateRangeEndDate = document.getElementsByClassName("hotdeskDaterange")[0].value.split('-')[1].trim();
		} else {
			$scope.dateRangeEndDate = "";
		}
		$scope.calculateDateRange();
		
		if(!angular.isUndefined(roomObj)){
			roomObj.startTime = $('#hotdeskcheckin').val();
			console.log(roomObj);
			var strTime = roomObj.startTime;
    		var AMChange = strTime.indexOf("AM") > -1;
    		var PMChange = strTime.indexOf("PM") > -1;
    		if(!AMChange || !PMChange){
    			var AMPMTimeChange = $scope.hotdeskTime(roomObj.startTime);
    			console.log(AMPMTimeChange);
    			roomObj.startTime = AMPMTimeChange;
    		}
			$scope.sessionObj.startTime = roomObj.startTime;
			if(roomObj.startTime){
				roomObj.endTime = $scope.setEndTimeForHotDeskBasedOnTimeFrame(roomObj);
			}
			
			roomObj.fromDate = $scope.dateRangeStartDate;
			roomObj.endDate = $scope.dateRangeEndDate;

			if((roomObj.date == "") || !roomObj.capacity || (roomObj.startTime == "") || (roomObj.endTime == "") || (!$scope.address)
					|| (Object.keys($scope.address).length === 0 && $scope.address.constructor === Object)) {
				
				flash.setMessage(MESSAGES.ALL_FIELDS_REQUIRED,MESSAGES.ERROR);
			} else {
				var isEndTimeExceeding = $scope.endTimeExceedCheck(roomObj);
				if(isEndTimeExceeding){
					flash.setMessage(MESSAGES.EXCEEDING_END_TIME, MESSAGES.ERROR);
				} else {
					var selectedStartTime = roomObj.fromDate + " " + roomObj.startTime;
					//var selectedStartTime = new Date(selectedStartTime);
			
					var selectedEndTime = roomObj.endDate + " " + roomObj.endTime;
					//var selectedEndTime = new Date(selectedEndTime);
			
					$rootScope.dateObj = {
						fromDate : selectedStartTime,
						endDate : selectedEndTime,
						sTime : roomObj.startTime,
						etime : roomObj.endTime,
						timeType : $scope.sessionObj.durationType,
						roomType: SEARCH.CONSTANT.HOT_DESK
					};
			
					var datesWithTime;
					/*datesWithTime = $scope.dateArrayWithUTCTime($scope.filteredDate, roomObj);*/
					
					$scope.searchElements = {
						place: $scope.address.title,
						stime: roomObj.startTime,
						etime: roomObj.endTime,
						fromDate: roomObj.fromDate,
						endDate: roomObj.endDate,
						excludeSunday: $scope.incExcObj.excludeSunday,
						excludeHoliday: $scope.incExcObj.excludeHoliday,
						fromToDates: datesWithTime
					};
			
					$scope.defineSearchObject(roomObj, roomType);
					console.log($scope.searchElements);
					
					roomObj.address = $scope.address.title + ', ' + $scope.selectedLocation.city + ', ' + 'India';
					$scope.getLatitudeLongitude(roomObj.address);
				}
			} 
		} else {
			flash.setMessage(MESSAGES.ALL_FIELDS_REQUIRED,MESSAGES.ERROR);
		}
	};
	
	$scope.endTimeExceedCheck = function(roomObj){
		var isEndTimeExceeding = false;
		if($scope.sessionTime.isEndTime){
			isEndTimeExceeding = true;
		}
		return isEndTimeExceeding;
	}
	
	
//	Timepicker Initialize - Meeting Room.
//	Variable : 
//	cinTime  : Check In Time
//	coutTime : Check Out Time
	$scope.meetingRoomTimeUI = function(){
		// var cinTime = $('#meetingcheckin');
		// var coutTime = $('#meetingcheckout');
		// $(function () {
		// 	$('#meetingcheckin').datetimepicker({
		// 		format: 'LT',
		// 		stepping: '30',
		// 		minDate: moment({h:0}),
		// 		maxDate: moment({h:22, m:30})
		// 	});
		// 	$('#meetingCheckInIcon').click(function() {
		// 		$("#meetingcheckin").focus();
		// 	});
		// });
		// cinTime.on('dp.change', function (e){
		// 	coutTime.data('DateTimePicker').minDate(e.date.add(1, 'hours'));
		// });

		// $(function () {
		// 	$('#meetingcheckout').datetimepicker({
		// 		format: 'LT',
		// 		stepping: '30',
		// 		maxDate: moment({h:23, m:30})
		// 	});
		// 	$('#meetingCheckOutIcon').click(function() {
		// 		$("#meetingcheckout").focus();
		// 	});
		// });
	};


	$scope.boardRoomTimeUI = function(){
		// var cinTime = $('#boardroomcheckin');
		// var coutTime = $('#boardroomcheckout');
		// $(function () {
		// 	$('#boardroomcheckin').datetimepicker({
		// 		format: 'LT',
		// 		stepping: '30',
		// 		minDate: moment({h:0}),
		// 		maxDate: moment({h:22, m:30})
		// 	});
		// 	$('#boardCheckInIcon').click(function() {
		// 		$("#boardroomcheckin").focus();
		// 	});
		// });
		// cinTime.on('dp.change', function (e){
		// 	coutTime.data('DateTimePicker').minDate(e.date.add(1, 'hours'));
		// });

		// $(function () {
		// 	$('#boardroomcheckout').datetimepicker({
		// 		format: 'LT',
		// 		stepping: '30',
		// 		maxDate: moment({h:23, m:30})
		// 	});
		// 	$('#boardCheckOutIcon').click(function() {
		// 		$("#boardroomcheckout").focus();
		// 	});
		// });
	};

	//	Timepicker Initialize - Hot Desk.
	//	Variable:
	//	cinTime  : Check In Time
	//	coutTime : Check Out Time
	$scope.hotDeskTimeUI = function(){
		// var cinTime = $('#hotdeskcheckin');
		// $(function () {
		// 	$('#hotdeskcheckin').datetimepicker({
		// 		format: 'LT',
		// 		stepping: '30'
		// 	});
		// 	$('#hotdeskCheckInIcon').click(function() {
		// 		$("#hotdeskcheckin").focus();
		// 	});
		// });

	};

	//	Timepicker Initialize - Hot Desk Module.
	//	Variable:
	//	cinTime  : Check In Time
	//	coutTime : Check Out Time
	$scope.virtualOfficetimeUI = function(){
		$(function () {
			$('#virtualofficecheckin').datetimepicker({
				format: 'LT',
				stepping: '30'
			});
		});
	};

	//	Timepicker Initialize - Training Room Module.
	//	Variable:
	//	cinTime  : Check In Time
	//	coutTime : Check Out Time
	$scope.trainingRoomTimeUI = function(){
		$(function () {
			$('#trainingroomcheckin').datetimepicker({
				format: 'LT',
				stepping: '30'
			});
			$('#trainingCheckInIcon').click(function() {
				$("#trainingroomcheckin").focus();
			});
		});
	};

	// Function to set end date selection based on start date in Hot Desk.
	$scope.hotdeskMinDate = function() {
		var CheckIn = $('#fromDate').datepicker('getDate');
		// var CheckOut = moment(CheckIn).add(1, 'day').toDate();
		var CheckOut = moment(CheckIn).toDate();
			$('.hotdeskEndDate').datepicker("setDate", CheckOut);
			$('.hotdeskEndDate').datepicker("option", "minDate", CheckOut);
	};
	
	// Function to set end date selection based on start date in Hot Desk.
	$scope.trainingMinDate = function() {
		var CheckIn = $('#trainingfromDate').datepicker('getDate');
		// var CheckOut = moment(CheckIn).add(1, 'day').toDate();
		var CheckOut = moment(CheckIn).toDate();
			$('#trainingendDate').datepicker("setDate", CheckOut);
			$('#trainingendDate').datepicker("option", "minDate", CheckOut);
	};


    
	/***
	 * 
	 * Plug and play search
	 * 
	 * 
	 */  
	 /**
     * Initialize popup
     */
    $scope.initializePopup = function($scope, modelName, MESSAGES, $uibModal) {
    	$scope.modalPopupPlugNPlay = function() {
    		var modalInstancePP = $uibModal.open({
    			templateUrl: 'plugNplay/views/plugNplayUserForm.html',
    			controller: 'PlugNplayController',
    			size: 'lg',
    			backdrop: 'static',
  				keyboard: false
    		});
    	
    	};
    	
    };
    
    
    $scope.initializePopup($scope, $scope.package.modelName, URLFactory.MESSAGES, URLFactory.uibModal);    
			
			$scope.selectLocationObjPP =  function(index) {
				//loading locations in plug and play
				/*PlugNplayService.plugNPlay.query(function (plugNplays) {
		                $scope.plugNplays = plugNplays;
				for(var i=0; i<$scope.plugNplays.length; i++){
					if(index == $scope.plugNplays[i].seqNo){
						$scope.selectedLocation = $scope.plugNplays[i];
					}
				}
				PlugNplayService.plugNPlayForSearch.get({
					citySelected: $scope.selectedLocation.city
				}, function(location){
					$scope.localityAreasPlugNplay = location.areas;
				});
			
				 });*/
				$scope.disableInput = false;
				for(var i=0; i<$scope.locations.length; i++){
					if(index == $scope.locations[i].seqNo){
						$scope.selectedLocation = $scope.locations[i];
					}
				}
				SearchService.areas.get({
					city: $scope.selectedLocation.city
				}, function(location){
					$scope.cityRelatedLocalities = location;
					$scope.localityAreasPlugNplay = location.areas;
					for (var i = 0; i < $scope.localityAreasPlugNplay.length; i++) {
		                $scope.localityAreasPlugNplay[i].uniqueid = $scope.localityAreasPlugNplay[i]._id;
		            }
				});
			};
               
			$scope.localityPlugNPlay = function (selected) {
		        if (selected) {
		        	$scope.addressPlugNplay = selected;
		        } else {
		        	$scope.addressPlugNplay = {};
		        }
		        console.log($scope.addressPlugNplay);
		    };
		    
			$scope.searchPlugNplay=function(plugNplay,roomType){
				console.log(plugNplay);
				if(plugNplay.city){
					var roomObjplugNplay={};
					roomObjplugNplay.address = $scope.addressPlugNplay.title + ', ' + $scope.selectedLocation.city + ', ' + 'India';
					$scope.searchElements = {
							place:$scope.addressPlugNplay.title,
							city:$scope.selectedLocation.city,
							loc:$scope.addressPlugNplay.originalObject.loc,
					};
					$rootScope.plugNPlaySearchObj = angular.copy($scope.searchElements);
					$scope.defineSearchObject(plugNplay, roomType);
					$location.url('/search/plugNplay/results?search_place=' + $scope.searchElements.place +'&search_city=' + $scope.searchElements.city + '&loc='+$scope.searchElements.loc );
					$scope.modalPopupPlugNPlay($scope.searchElements);
				}else{
					flash.setMessage(MESSAGES.ALL_FIELDS_REQUIRED,MESSAGES.ERROR);
				}
				
			};
			$scope.changeSelection = function(value) {
				// console.log(value);
					// location.hash = "/Meeting Room";
					if(value == "hotdesk") {
					    $(".hideDivTag").hide();
					    $(".iconMenu").hide();
					    $("#hotdeskForm").show();
					    history.pushState(null, "hello", "/");
					}
					else if(value == "meetingroom") {
						$(".hideDivTag").hide();
						$(".iconMenu").hide();
						$("#meetingroomForm").show();
						history.pushState(null, "hello", "/");
					}
					else if(value == "boardroom"){
						$(".hideDivTag").hide();
						$(".iconMenu").hide();
						$("#boardroomForm").show();
						history.pushState(null, "hello", "/");
					}
					else if(value == "trainingroom"){
						$(".hideDivTag").hide();
						$(".iconMenu").hide();
						$("#trainingroomForm").show();
						history.pushState(null, "hello", "/");
					}
					else if(value == "virtualoffice"){
						$(".hideDivTag").hide();
						$(".iconMenu").hide();
						$("#virtualofficeForm").show();
						history.pushState(null, "hello", "/");
					}
					else if(value == "plugandplay"){
						$(".hideDivTag").hide();
						$(".iconMenu").hide();
						$("#plugandplayForm").show();
						history.pushState(null, "hello", "/");
					}
				
			};

	$scope.sessions = [{
		seqNo : 1,
		duration : '1st Half (9:00 A.M - 1:00 P.M)',
		durationType : 'Half Day',
		startTime : '09:00 AM',
		active: 'true'
	}, {
		seqNo : 2,
		duration : '2nd Half (2:00 P.M - 6:00 P.M)',
		durationType : 'Half Day',
		startTime : '02:00 PM',
		active: 'true'
	}, {
		seqNo : 3,
		duration : 'Full Day (9:00 A.M - 6:00 P.M)',
		durationType : 'Full Day',
		startTime : '09:00 AM',
		active: 'true'
	}];
	$scope.sessionsArray = $scope.sessions;
	
			$scope.durationDisabled = false;
			$scope.trainingRoomDuration = function() {
				$scope.durationDisabled = false;
				$scope.sessions = $scope.sessionsArray;
				$scope.trainingRoomStartDate = new Date(document.getElementsByClassName("trainingroomDateRange")[0].value.split('-')[0].trim());
				$scope.nowDate = new Date();
				
				if($scope.trainingRoomStartDate.setHours(0,0,0,0) == $scope.nowDate.setHours(0,0,0,0)){
						var newDate = new Date();
						var firstSessionDate = new Date(new Date().setHours(8)).setMinutes(30,0,0);
						var  secondSessionDate = new Date(new Date().setHours(13)).setMinutes(30,0,0);
						if(newDate >= new Date(firstSessionDate)) {
							$scope.sessions = [{
									seqNo : 2,
									duration : '2nd Half (2:00 P.M - 6:00 P.M)',
									durationType : 'Half Day',
									startTime : '02:00 PM',
									active: 'true'
								}];
						}

						if((newDate > new Date(firstSessionDate)) && (newDate < new Date(secondSessionDate))) {
							$scope.sessions = [];
							$scope.sessions = [{
								seqNo : 2,
								duration : '2nd Half (2:00 P.M - 6:00 P.M)',
								durationType : 'Half Day',
								startTime : '02:00 PM',
								active: 'true'
							}];
						}
						
						if(newDate >= new Date(secondSessionDate)) {
							$scope.sessions = [];
							$scope.durationDisabled = true;
						}
					}
					else {
						$scope.sessions = [{
								seqNo : 1,
								duration : '1st Half (9:00 A.M - 1:00 P.M)',
								durationType : 'Half Day',
								startTime : '09:00 AM',
								active: 'true'
							}, {
								seqNo : 2,
								duration : '2nd Half (2:00 P.M - 6:00 P.M)',
								durationType : 'Half Day',
								startTime : '02:00 PM',
								active: 'true'
							}, {
								seqNo : 3,
								duration : 'Full Day (9:00 A.M - 6:00 P.M)',
								durationType : 'Full Day',
								startTime : '09:00 AM',
								active: 'true'
						}];
						$scope.durationDisabled = false;
					}
			};
			$scope.durationError = function() {
				if($scope.durationDisabled) {
					flash.setMessage(MESSAGES.DURATION_ERROR,MESSAGES.ERROR);
				}
			};
			
			/*
				Author                : Rajesh K
				Date                  : 27-05-2016
				Last Modified         : 06-09-2016
				Function Description  : Based on date selected the time picker is initialized.
										If selected date is today, then based on current time time picker is initialized with minTime.
			*/
			$scope.initTime = function(roomType) {
				// console.log(roomType);
				$('#datepairMeetingroom .hotDeskTimePickerRemove').timepicker('remove');
				$('#datepairMeetingroom .start').timepicker('remove');
				$('#datepairMeetingroom .end').timepicker('remove');
				$('#datepairMeetingroom .start').val('');
				$('#datepairMeetingroom .end').val('');
				function roundMinutes(formatDate) {
					formatDate.setHours(formatDate.getHours() + Math.round(formatDate.getMinutes()/60));
					formatDate.setMinutes(0);
					return formatDate;
				}
				if(roomType == 'meetingRoom'){
					var selectedDate = new Date(document.getElementById("meetingRoomDate").value);
				}
				if(roomType == 'boardRoom'){
					var selectedDate = new Date(document.getElementById("boardRoomDate").value);
				}
				if(roomType == 'hotDesk' || roomType == 'hotDeskRoom'){
					var selectedDate = new Date(document.getElementById("hotdeskdaterangeCal").value.split('-')[0].trim());
				}
				var todayDate = new Date();
				if((roomType == 'meetingRoom' ||  roomType == 'boardRoom' ||  roomType == 'hotDesk' || roomType == 'hotDeskRoom') && selectedDate.setHours(0,0,0,0) == todayDate.setHours(0,0,0,0)) {
							var dateNow = new Date();

							var hours = dateNow.getHours();
							var minutes = dateNow.getMinutes();
							if(minutes < 30){
								var date = new Date(2016,1,1,hours,minutes);
								var roundTime = roundMinutes(date);
								roundTime = new Date(roundTime.setHours(roundTime.getHours()+1));
							}
							else
								{
									var roundTime = new Date();
									roundTime = new Date(roundTime.setHours(roundTime.getHours()+2));
									var hours = roundTime.getHours();
									var minutes = roundTime.getMinutes();
									var dateGt = new Date(2016,1,1,hours,minutes);
									roundTime.setHours(roundTime.getHours() + Math.floor(roundTime.getMinutes()/60));
									roundTime.setMinutes(0);
								}
							var hours = roundTime.getHours();
							var minutes = roundTime.getMinutes();
							var ampm = hours >= 12 ? 'PM' : 'AM';
							hours = hours % 12;
							hours = hours ? hours : 12;
							minutes = minutes < 10 ? '0'+minutes : minutes;
							var strTime = hours + ':' + minutes + ' ' + ampm;
							$('#datepairMeetingroom .start').timepicker('remove');
							$('#datepairMeetingroom .end').prop('disabled', true);
							$('#datepairMeetingroom .end').css({"cursor": "not-allowed"});
							if(roomType == 'hotDesk'){
								$('#datepairMeetingroom .start').timepicker({
									'minTime': strTime,
									'timeFormat': 'h:i A',
									'maxTime': '08:00 PM'
								});
							}
							else {
								$('#datepairMeetingroom .start').timepicker({
									'minTime': strTime,
									'timeFormat': 'h:i A'
								});
							}
							$('#datepairMeetingroom .start').on("change", function(){
								$('#datepairMeetingroom .end').val('');
								var startTimeOn = $('.start').val();
								if(roomType == 'boardRoom') {
									var startTimeOn = $('.start.boardC').val();
								}
								var temp = "01/01/2016"+" "+startTimeOn;
								var dateCon = new Date(temp);
								var hours = dateCon.getHours()+1;
								var minutes = dateCon.getMinutes();
								var ampm = hours >= 12 ? 'PM' : 'AM';
								hours = hours % 12;
								hours = hours ? hours : 12;
								minutes = minutes < 10 ? '0'+minutes : minutes;
								var strToTime = hours + ':' + minutes + ' ' + ampm;
								$('#datepairMeetingroom .end').prop('disabled', false);
								$('#datepairMeetingroom .end').css({"cursor": "default"});
								$('#datepairMeetingroom .end').timepicker('remove');
								if(roomType == 'hotDesk'){
									$('#datepairMeetingroom .end').timepicker({
										'minTime':  strToTime,
										'durationTime': startTimeOn,
										'maxTime': '08:00 PM',
										'showDuration': true,
										'step': 60,
										'timeFormat': 'h:i A'
									});
								}
								else {
									$('#datepairMeetingroom .end').timepicker({
										'minTime':  strToTime,
										'durationTime': startTimeOn,
										'maxTime': '11:30 PM',
										'showDuration': true,
										'step': 60,
										'timeFormat': 'h:i A'
									});
								}
							});
				}
				else
					{
						var strTime = new Date();
						$('#datepairMeetingroom .end').prop('disabled', true);
						$('#datepairMeetingroom .end').timepicker('remove');
						$('#datepairMeetingroom .end').css({"cursor": "not-allowed"});
						$('#datepairMeetingroom .start').timepicker('remove');
						if(roomType == 'hotDesk'){
							$('#datepairMeetingroom .start').timepicker({
								'scrollDefault' : '07:30 AM',
								'minTime' : '12:00 AM',
								'maxTime': '08:00 PM',
								'timeFormat': 'h:i A'
							});
						}
						else {
							$('#datepairMeetingroom .start').timepicker({
								'scrollDefault' : '07:30 AM',
								 'minTime' : '12:00 AM',
								'timeFormat': 'h:i A'
							});
						}
						$('#datepairMeetingroom .start').on("change", function(){
							$('#datepairMeetingroom .end').val('');
							var startTimeOn = $('.start').val();
							if(roomType == 'boardRoom') {
								var startTimeOn = $('.start.boardC').val();
							}
							var temp = "01/01/2016"+" "+startTimeOn;
							var temp = new Date(temp);
							var hours = temp.getHours()+1;
							var minutes = temp.getMinutes();
							var ampm = hours >= 12 ? 'PM' : 'AM';
							hours = hours % 12;
							hours = hours ? hours : 12;
							if(hours <=9){
								hours = '0'+hours;
							}
							minutes = minutes < 10 ? '0'+minutes : minutes;
							var strToTime = hours + ':' + minutes + ' ' + ampm;
							$('#datepairMeetingroom .end').prop('disabled', false);
							$('#datepairMeetingroom .end').css({"cursor": "default"});
							$('#datepairMeetingroom .end').timepicker('remove');
							$('#datepairMeetingroom .end').timepicker({
								'minTime':  strToTime,
								'durationTime': startTimeOn,
			    				'maxTime': '11:30 PM',
								'showDuration': true,
								'step': 60,
								'timeFormat': 'h:i A'
							});
						});
					}
			};
			
			$('#datepairMeetingroom .start').prop('disabled', true);
			$('#datepairMeetingroom .start').css({"cursor": "not-allowed"});
			$('#datepairMeetingroom .end').prop('disabled', true);
			$('#datepairMeetingroom .end').css({"cursor": "not-allowed"});

			$('input[name="daterangeMeetingRoom"]').change(function(){
				$('#datepairMeetingroom .start').prop('disabled', false);
				$('#datepairMeetingroom .start').css({"cursor": "default"});
				$scope.initTime("meetingRoom");
			});
			
			$('input[name="daterangeBoardRoom"]').change(function(){
				$('#datepairMeetingroom .start').prop('disabled', false);
				$('#datepairMeetingroom .start').css({"cursor": "default"});
				$scope.initTime("boardRoom");
			});
			$('input[id="hotdeskdaterangeCal"]').change(function(){
				$('#datepairMeetingroom .hotDeskTimePickerRemove').timepicker('remove');
				$scope.initTime("hotDesk");
				$('#datepairMeetingroom .start').prop('disabled', false);
				$('#datepairMeetingroom .start').css({"cursor": "default"});
				$scope.initTime("hotDesk");
			});
			$scope.resetTimeField = function() {
				$('#datepairMeetingroom .start').timepicker('remove');
				$('#datepairMeetingroom .end').timepicker('remove');
				$('#datepairMeetingroom .start').val('');
				$('#datepairMeetingroom .end').val('');
				$('#boardRoomDate').val('');
				$('#meetingRoomDate').val('');
				$('#hotdeskdaterangeCal').val('');
			};
			$scope.onDateChangeTime = function(roomType) {
				// console.log("in date fn");
				$('#datepairMeetingroom .hotDeskTimePickerRemove').timepicker('remove');
				$('#datepairMeetingroom .start').prop('disabled', false);
				$('#datepairMeetingroom .start').css({"cursor": "default"});
				$scope.initTime(roomType);

			};
			$(function(){ 
				window.addEventListener('popstate', function(event) {
					if( $(window).width() <= 415){
						$(".hideDivTag").hide();
						$(".iconMenu").show();
					}
				});
			});
			$scope.redirectPage = function(){
				$(".hideDivTag").hide();
				$(".iconMenu").show();
			};
// $scope.hotDeskTimeFrame = [{
// 		seqNo : 1,
// 		duration : '4 hrs',
// 		number : 4
// 	}, {
// 		seqNo : 2,
// 		duration : '5 hrs',
// 		number : 5
// 	}, {
// 		seqNo : 3,
// 		duration : '6 hrs',
// 		number : 6
// 	}, {
// 		seqNo : 4,
// 		duration : '7 hrs',
// 		number : 7
// 	}, {
// 		seqNo : 5,
// 		duration : '8 hrs',
// 		number : 8
// 	}];
			$scope.hotDeskDuration = function (data) {
				var timeArray = ['08:00 PM','07:30 PM','07:00 PM','06:30 PM','06:00 PM','05:30 PM','05:00 PM','04:30 PM','04:00 PM'];
				var selectedDate = new Date(Date.parse("01/01/2016"+" "+data, "mm/d/yyyy h:mm TT"));
				if(selectedDate >= new Date(Date.parse('01/01/2016'+" " + timeArray[1], "mm/d/yyyy h:mm TT")) && selectedDate <= new Date(Date.parse('01/01/2016'+" " + timeArray[0], "mm/d/yyyy h:mm TT"))) {
					$scope.hotDeskTimeFrame = [{seqNo : 1,duration : '4 hrs',number : 4}];
				}
				if(selectedDate >= new Date(Date.parse('01/01/2016'+" " + timeArray[3], "mm/d/yyyy h:mm TT")) && selectedDate < new Date(Date.parse('01/01/2016'+" " + timeArray[1], "mm/d/yyyy h:mm TT"))) {
					$scope.hotDeskTimeFrame = [{seqNo : 1,duration : '4 hrs',number : 4},{seqNo : 2,duration : '5 hrs',number : 5}];
				}
				if(selectedDate >= new Date(Date.parse('01/01/2016'+" " + timeArray[5], "mm/d/yyyy h:mm TT")) && selectedDate < new Date(Date.parse('01/01/2016'+" " + timeArray[3], "mm/d/yyyy h:mm TT"))) {
					$scope.hotDeskTimeFrame = [{seqNo : 1,duration : '4 hrs',number : 4},{seqNo : 2,duration : '5 hrs',number : 5},{seqNo : 3,duration : '6 hrs',number : 6}];
				}
				if(selectedDate >= new Date(Date.parse('01/01/2016'+" " + timeArray[7], "mm/d/yyyy h:mm TT")) && selectedDate <= new Date(Date.parse('01/01/2016'+" " + timeArray[6], "mm/d/yyyy h:mm TT"))) {
					$scope.hotDeskTimeFrame = [{seqNo : 1,duration : '4 hrs',number : 4},{seqNo : 2,duration : '5 hrs',number : 5},
											   {seqNo : 3,duration : '6 hrs',number : 6},{seqNo : 4,duration : '7 hrs',number : 7}];
				}
				if(selectedDate <= new Date(Date.parse('01/01/2016'+" " + timeArray[8], "mm/d/yyyy h:mm TT"))) {
					$scope.hotDeskTimeFrame = [{seqNo : 1,duration : '4 hrs',number : 4},{seqNo : 2,duration : '5 hrs',number : 5},
											   {seqNo : 3,duration : '6 hrs',number : 6},{seqNo : 4,duration : '7 hrs',number : 7},{seqNo : 5,duration : '8 hrs',number : 8}];
				}

				// if(selectedDate > new Date(Date.parse('01/01/2016'+" " + timeArray[0], "mm/d/yyyy h:mm TT"))) {
				// 	flash.setMessage(MESSAGES.DURATION_ERROR,MESSAGES.ERROR);
				// }
			};
			$scope.blurTimeDropdown = function() {
				$('#hotdeskcheckin').blur();
				$('#meetingcheckin').blur();
				$('#meetingcheckout').blur();
				$('#boardroomcheckin').blur();
				$('#boardroomcheckout').blur();
				
			};
			

	$timeout(function(){
		Calendar();
	},10000);
	
	
	
	
	
}
]);

function initializeEndtime() {
	console.log("end time");
}

function initializeSearchAddress(cityname) {

	
	 var options = {
	  types: [],
	  componentRestrictions: {city: cityname}
	 };

	 var input = document.getElementById('virtualOfficeDestination');
	 var autocomplete = new google.maps.places.Autocomplete(input, options);
	}


			
             
