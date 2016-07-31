'use strict';

/* jshint -W098 */
angular.module('mean.space').controller('SpaceHolidayController',
	function($scope, Global, SpaceHolidayService, HolidaysService, $location,$stateParams, uiCalendarConfig, $filter, $compile, $rootScope, ShareHolidaysService, URLFactory,flash,MESSAGES) {
		$scope.global = Global;
		$scope.package = {
			name : 'holidays',
	        modelName: 'Holiday',
	        featureName: 'Holiday'
		};
		$scope.holiday = {};
		$scope.holidaysArray = [];
		$scope.MESSAGES=MESSAGES;
		
		if(angular.isDefined($rootScope.loggedInUser)){
			if($rootScope.loggedInUser.roles.indexOf('admin') !== -1){
				$scope.hidePartnerHolidayList = false;
			} else {
				$scope.hidePartnerHolidayList = true;
			}
		};
		flashmessageOn($rootScope, $scope,flash);
		$scope.create = function(isValid) {
			if (isValid) {
				var holiday = new SpaceHolidayService.spaceHoliday($scope.holiday);
				holiday.$save(function(response) {
					flash.setMessage(MESSAGES.HOLIDAY_CREATE_SUCCESS,MESSAGES.SUCCESS);
					$location.path(URLFactory.SPACE.URL_PATH.SPACE_HOLIDAY_LIST);
					$scope.holiday = {};
				}, function(error) {
					$scope.error = error;
				});
			} else {
				$scope.submitted = true;
			}
		};

		$scope.remove = function(Holiday) {
			if (Holiday) {
				var holiday = new SpaceHolidayService.spaceHoliday(Holiday);
				holiday.$remove(function(response) {
					for ( var i in $scope.holidays) {
						if ($scope.holidays[i] === Holiday) {
							$scope.holidays.splice(i, 1);
							flash.setMessage(MESSAGES.HOLIDAY_REMOVE_SUCCESS,MESSAGES.SUCCESS);
							//$location.path(URLFactory.SPACE.URL_PATH.SPACE_CREATE);
						}
					}
					//$location.path(URLFactory.SPACE.URL_PATH.SPACE_CREATE);
				});
			} else {
				$scope.holiday.$remove(function(response) {
					//$location.path(URLFactory.SPACE.URL_PATH.SPACE_CREATE);
				});
			}
		};
		
		$scope.update = function(isValid) {
			if (isValid) {
				var holiday = $scope.holiday;
				if (!holiday.updated) {
					holiday.updated = [];
				}
				holiday.updated.push(new Date().getTime());

				holiday.$update(function() {
					flash.setMessage(MESSAGES.HOLIDAY_UPDATE_SUCCESS,MESSAGES.SUCCESS);
					$location.path(URLFactory.SPACE.URL_PATH.SPACE_HOLIDAY_LIST);
				}, function(error) {
					$scope.error = error;
				});
			} else {
				$scope.submitted = true;
			}
		};

		$scope.findOne = function() {
			SpaceHolidayService.spaceHoliday.get({
				holidayId : $stateParams.holidayId
			}, function(holiday) {
				$scope.holiday = holiday;
			});
		};

		$scope.list = function() {
			$scope.dtOptions = DTOptionsBuilder.newOptions().withPaginationType('full_numbers').withDisplayLength(10);
			$scope.dtColumnDefs = [
			                   DTColumnDefBuilder.newColumnDef(0).notVisible(),
			                   DTColumnDefBuilder.newColumnDef(1),
			                   DTColumnDefBuilder.newColumnDef(2),
			                   DTColumnDefBuilder.newColumnDef(3).notSortable()
			                   ];
			var date = new Date();
			var selectedyear = date.getFullYear();
			$scope.loadHolidayByYear(selectedyear);
		};
		
		$scope.loadAdminsHolidayByYear = function() {
			var date = new Date();
			var selectedyear = date.getFullYear();
			HolidaysService.getHolidaysbyyear.query({
				selectedyears : selectedyear
			}, function(response) {
				$scope.adminHolidays = response;
				for (var i = 0; i < $scope.adminHolidays.length; i++) {
					$scope.adminHolidays[i].isAdmin = true; 
					$scope.adminHolidays[i].holiday_date = new Date($scope.adminHolidays[i].holiday_date);
					$scope.events2.push({
						title : $scope.adminHolidays[i].name,
						start : new Date($scope.adminHolidays[i].holiday_date),
						stick : true
					});
				}
				ShareHolidaysService.setHolidays($scope.adminHolidays);
				$scope.list();
			});
		};

		$scope.modifyHoliday = function(adminHoliday){
			$scope.space_holidays = ShareHolidaysService.getHolidays();
			if(adminHoliday.isAdmin){
				$scope.space_holidays.push(adminHoliday);
			} else {
				for(var i = 0; i < $scope.space_holidays.length; i++){
					if(JSON.stringify($scope.space_holidays[i]._id) === JSON.stringify(adminHoliday._id)){
						$scope.space_holidays.splice(i, 1);
					}
				}
			}
			ShareHolidaysService.setHolidays($scope.space_holidays);
		};
		$scope.modifyHolidayPartner = function(holiday){
			$scope.space_holidays = ShareHolidaysService.getHolidays();
			if(holiday.isPartner){
				$scope.space_holidays.push(holiday);
		   } else {
				for(var i = 0; i < $scope.space_holidays.length; i++){
					if(JSON.stringify($scope.space_holidays[i]._id) === JSON.stringify(holiday._id)){
						$scope.space_holidays.splice(i, 1);
					}
				}
			}
			ShareHolidaysService.setHolidays($scope.space_holidays);
		};
		
		$scope.loadDateSelected = function() {
			$scope.holiday.holiday_date = $rootScope.selectedDate;
			$scope.holiday.year = $rootScope.holidayYear;
		};
		
		$scope.editHoliday = function(urlPath, id) {
			urlPath = urlPath.replace(":holidayId", id);
			$location.path(urlPath);
		};
		
		$scope.cancel = function() {
			$location.path(URLFactory.SPACE.URL_PATH.SPACE_HOLIDAY_LIST);
		};

		$scope.back = function() {
			if($rootScope.edit){
				$location.path(URLFactory.SPACE.URL_PATH.SPACE_UPDATE);
			} else {
				$location.path(URLFactory.SPACE.URL_PATH.SPACE_CREATE);
			}
		};
		
		/* Change View */
		$scope.changeView = function(view, calendar) {
			uiCalendarConfig.calendars[calendar].fullCalendar('changeView', view);
		};

		/* Change View */
		$scope.renderCalender = function(calendar) {
			$rootScope.calendar = calendar;
			if (uiCalendarConfig.calendars[calendar]) {
				uiCalendarConfig.calendars[calendar].fullCalendar('render');
			}
		}; 
		$scope.eventRender = function(events2, element, view) {

			element.attr({
				'tooltip' : events2.title,
				'tooltip-append-to-body' : true
			});
			$compile(element)($scope);
		};

		$scope.setCalDate = function(date, jsEvent, view) {
			var selectedDate = moment(date).format('YYYY-MM-DD');
			$scope.events2[0].start = selectedDate;
			$rootScope.selectedDate = selectedDate;
			var requiredDate = $rootScope.selectedDate;
			$rootScope.holidayYear = $filter('date')(requiredDate, 'yyyy');
			$location.path(URLFactory.SPACE.URL_PATH.SPACE_HOLIDAY_CREATE);
		};
		
		$scope.viewPreviousYear = function() {
			uiCalendarConfig.calendars['myCalendar'].fullCalendar('prevYear');
			var moment = uiCalendarConfig.calendars['myCalendar'].fullCalendar('getDate');
			var selectedyear = moment.year();
			$scope.loadHolidayByYearOne(selectedyear);
		};
		
		$scope.viewNextYear = function() {
			uiCalendarConfig.calendars['myCalendar'].fullCalendar('nextYear');
			var moment = uiCalendarConfig.calendars['myCalendar'].fullCalendar('getDate');
			var selectedyear = moment.year();
			$scope.loadHolidayByYearOne(selectedyear);
		};
		
		$scope.holidays = [];
		$scope.loadHolidayByYear = function(selectedyear) {
			SpaceHolidayService.yearHolidays.query({
				selectedyears : selectedyear
			}, function(response) {
				$scope.holidays = response;
				if($scope.holidays.length > 0){
					ShareHolidaysService.addHolidays($scope.holidays);
				}
				for (var i = 0; i < $scope.holidays.length; i++) {
					$scope.holidays[i].isPartner = true;
					$scope.holidays[i].holiday_date = new Date($scope.holidays[i].holiday_date);
					$scope.events2.push({
						title : $scope.holidays[i].name,
						start : new Date($scope.holidays[i].holiday_date),
						stick : true
					});
				}
			});
		};
		
		$scope.loadHolidayByYearOne = function(selectedyear) {
			SpaceHolidayService.yearHolidays.query({
				selectedyears : selectedyear
			}, function(response) {
				$scope.holidays = response;
				$scope.events2.splice(0, $scope.events2.length);

				for (var i = 0; i < $scope.holidays.length; i++) {
					$scope.holidays[i].holiday_date = new Date($scope.holidays[i].holiday_date);
					$scope.events2.push({
						title : $scope.holidays[i].name,
						start : new Date($scope.holidays[i].holiday_date),
						stick : true
					});
				}
			});
		};

		var date = new Date();
		var d = date.getDate();
		var m = date.getMonth();
		var y = date.getFullYear();
		var currentView = "month";

		$scope.uiConfig = {
			calendar : {
				height : 450,
				editable : true,
				customButtons : {
					myCustomButton : {
						text : 'custom!',
						icon : 'right-double-arrow',
						click : function() {
							$scope.viewNextYear();
						}
					},
					myCustomButtonPrev : {
						text : 'customPrev',
						icon : 'left-double-arrow',
						click : function() {
							$scope.viewPreviousYear();
						}
					}
				},
				header : {
					center : 'title',
					right : ' today next, myCustomButton',
					left : ' myCustomButtonPrev , prev'
				},
				dayClick : $scope.setCalDate,
				eventDrop : $scope.alertOnDrop,
				renderEvent : $scope.renderCalender,
				eventRender : $scope.eventRender,
				schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source'
			}
		};
		$scope.events2 = [ {
			title : 'Event directly added',
			start : new Date(),
			stick : true
		} ];
		$scope.eventSources = [ $scope.events2 ];

	});
