'use strict';

/* jshint -W098 */

angular.module('mean.holidays').controller('HolidaysController', function($scope, Global,HolidaysService,HOLIDAY,$location,$stateParams,uiCalendarConfig,$filter,$compile, $rootScope,flash,MESSAGES,DTOptionsBuilder,DTColumnDefBuilder) {
    $scope.global = Global;
    $scope.HOLIDAY=HOLIDAY;
    $scope.package = {
      name: 'holidays'
    };
    hideBgImageAndFooter($rootScope);
    $scope.holiday = {};
    $scope.holidaysArray=[];
    $scope.MESSAGES=MESSAGES;
    flashmessageOn($rootScope, $scope,flash);
    $scope.create = function (isValid) {
                   if (isValid) {
                  var holiday = new HolidaysService.holiday($scope.holiday);
                  holiday.$save(function (response) {
                    flash.setMessage(MESSAGES.HOLIDAY_CREATE_SUCCESS,MESSAGES.SUCCESS);
                    $location.path(HOLIDAY.URL_PATH.HOLIDAYLIST);
                    $scope.holiday = {};
                }, function (error) {
                    $scope.error = error;
                });
                }else {
                $scope.submitted = true;
                  }
               };

    $scope.remove = function (Holiday) {
      var retVal = confirm("Are you sure you want to delete this holiday?");
        if(retVal){
          if (Holiday) {
              var holiday = new HolidaysService.holiday(Holiday);
              holiday.$remove(function (response) {
                  for (var i in $scope.holidays) {
                      if ($scope.holidays[i] === Holiday) {
                          $scope.holidays.splice(i, 1);
                          //$location.path(HOLIDAY.URL_PATH.HOLIDAYLIST);
                          flash.setMessage(MESSAGES.HOLIDAY_DELETE_SUCCESS,MESSAGES.SUCCESS);
                      }
                  }
                  $location.path(HOLIDAY.URL_PATH.HOLIDAYLIST);
                  });
              } else {
                  $scope.holiday.$remove(function (response) {
                      $location.path(HOLIDAY.URL_PATH.HOLIDAYLIST);
                  });
            }
        }
    };
    $scope.update = function (isValid) {
         if (isValid) {
                var holiday = $scope.holiday;
                if (!holiday.updated) {
                	holiday.updated = [];
                }
                holiday.updated.push(new Date().getTime());

                holiday.$update(function () {
                  flash.setMessage(MESSAGES.HOLIDAY_UPDATE_SUCCESS,MESSAGES.SUCCESS);
                $location.path(HOLIDAY.URL_PATH.HOLIDAYLIST);
                }, function (error) {
                    $scope.error = error;
                });
              }else {
                $scope.submitted = true;
            }
               };
               
    $scope.findOne = function () {
    	HolidaysService.holiday.get({
    		holidayId: $stateParams.holidayId
            }, function (holiday) {
                $scope.holiday = holiday;
            });
            };
            
            $scope.list = function(){
            	$scope.dtOptions = DTOptionsBuilder.newOptions().withPaginationType('full_numbers').withDisplayLength(10);
				$scope.dtColumnDefs = [
				                   DTColumnDefBuilder.newColumnDef(0).notVisible(),
				                   DTColumnDefBuilder.newColumnDef(1),
				                   DTColumnDefBuilder.newColumnDef(2),
				                   DTColumnDefBuilder.newColumnDef(3).notSortable()
				                   ];
				window.alert = (function() {
				    var nativeAlert = window.alert;
				    return function(message) {
				        //window.alert = nativeAlert;
				        message.indexOf("DataTables warning") >= 0 ?
				        		  console.warn(message) :
				        	            nativeAlert(message);
				    }
				})();
              var date = new Date();
              var selectedyear= date.getFullYear();
              $scope.loadHolidayByYear(selectedyear);       
            	};
            
            $scope.loadDateSelected=function(){
                $scope.holiday.holiday_date=$rootScope.selectedDate;
                  $scope.holiday.year=$rootScope.holidayYear;
               };
             $scope.editHoliday = function (urlPath, id) {
              urlPath = urlPath.replace(":holidayId", id);
              $location.path(urlPath);
             };
             $scope.cancel=function(){
                 $location.path(HOLIDAY.URL_PATH.HOLIDAYLIST);   
             };
              /*$scope.HolidayBasedOnYear=function(){
              var currentDate= new Date();
              var currentYear = currentDate.getFullYear();
              var currentYearOne = currentYear+1;
              for(var i = currentYear; i <= currentYearOne; i++ ){
                $scope.holidaysArray.push(i);
              }

               $scope.getholidayslist(currentYear);

             };*/

             /*$scope.getHolidayDate=function(holidayYear,holidaydate,form,isValid){
              console.log(form);
              console.log(isValid);
              console.log("in getHolidayDate");
              console.log(holidayYear);
              console.log(holidaydate);
              var myDate =holidaydate;
              console.log(myDate);
              $scope.holidaydate = $filter('date')(myDate,'yyyy');
              $scope.holidayYear = holidayYear;
              console.log($scope.holidaydate);
              console.log($scope.holidayYear);
                 if ($scope.holidayYear==$scope.holidaydate) {
                        console.log("true");
                        form.holiday_date.isValid=true;
                      // $scope.submitted = true;
                      return form.holiday_date.isValid =true;

                 }else{
                        console.log("false");   
                         $scope.submitted = true;
                         form.holiday_date.isValid=false;
                         return form.holiday_date.isValid =false;
                 }

             };
*/
             /* Change View */
              $scope.changeView = function(view,calendar) {
              uiCalendarConfig.calendars[calendar].fullCalendar('changeView',view);
               };
               
              /* Change View */
              $scope.renderCalender = function(calendar) {
                $rootScope.calendar=calendar;
              if(uiCalendarConfig.calendars[calendar]){
              uiCalendarConfig.calendars[calendar].fullCalendar('render');
               }
              };
              $scope.eventRender = function( events2, element, view ) {
               
                  element.attr({'tooltip': events2.title,
                      'tooltip-append-to-body': true});
                    $compile(element)($scope);
                    };

                  
              $scope.setCalDate = function(date, jsEvent, view) {
                  //var currentDate = new Date();
                  var selectedDate = moment(date).format('YYYY-MM-DD');           
                  $scope.events2[0].start = selectedDate;          
                 $rootScope.selectedDate=selectedDate;
                 var requiredDate=$rootScope.selectedDate;
                 $rootScope.holidayYear = $filter('date')(requiredDate,'yyyy');
                 $location.path(HOLIDAY.URL_PATH.HOLIDAYCREATE);
                 };
                $scope.viewPreviousYear=function(){
                    uiCalendarConfig.calendars['myCalendar'].fullCalendar( 'prevYear' );
                     var moment = uiCalendarConfig.calendars['myCalendar'].fullCalendar('getDate');
                      var selectedyear=moment.year();
                   $scope.loadHolidayByYearOne(selectedyear);    
                 };
                $scope.viewNextYear=function(){
                     uiCalendarConfig.calendars['myCalendar'].fullCalendar( 'nextYear' );
                   var moment = uiCalendarConfig.calendars['myCalendar'].fullCalendar('getDate');
                   var selectedyear=moment.year();
                    $scope.loadHolidayByYearOne(selectedyear);   
                  };
                $scope.loadHolidayByYear=function(selectedyear){
                    HolidaysService.getHolidaysbyyear.query({selectedyears: selectedyear},function(response){
                    $scope.holidays = response;
                    for (var i = 0; i < $scope.holidays.length; i++) {
                         $scope.holidays[i].holiday_date = new Date($scope.holidays[i].holiday_date);
                         $scope.events2.push(
                            {
                              title: $scope.holidays[i].name,
                              start: new Date($scope.holidays[i].holiday_date),
                              stick: true
                           });
                      
                        }
                       });      
                  };
                  $scope.loadHolidayByYearOne=function(selectedyear){
                    HolidaysService.getHolidaysbyyear.query({selectedyears: selectedyear},function(response){
                    $scope.holidays = response;
                    $scope.events2.splice(0, $scope.events2.length);
                    
                    for (var i = 0; i < $scope.holidays.length; i++) {
                         $scope.holidays[i].holiday_date = new Date($scope.holidays[i].holiday_date);
                         $scope.events2.push(
                            {
                              title: $scope.holidays[i].name,
                              start: new Date($scope.holidays[i].holiday_date),
                              stick: true
                           });
                        }
                       });      
                  };
                 
                  
              var date = new Date();
              var d = date.getDate();
              var m = date.getMonth();
              var y = date.getFullYear();
               var currentView = "month";
               
               $scope.viewToday=function(){
             	  uiCalendarConfig.calendars['myCalendar'].fullCalendar( 'gotoDate', date );
         		  $scope.list();
               };

              $scope.uiConfig = {
                  calendar: {
                  height: 450,
                  editable: true,
                  customButtons: {
                      myCustomButton: {
                      text: 'custom!',
                      icon:'right-double-arrow',
                      click: function() {
                     $scope.viewNextYear();
                    }
                      },
                      myCustomButtonPrev: {
                      text: 'customPrev',
                      icon:'left-double-arrow',
                      click: function() {
                        $scope.viewPreviousYear();
                    }
                      },
                      myCustomButtonToday : {
                    	  text:'today',
                    	  click: function() {
                    		  $scope.viewToday();
                    		  /*console.log(date);
                    		  $scope.viewPreviousYear();
                    		  $scope.events2 = [
                    		                    {
                    		                        title: '',
                    		                        start: new Date(),
                    		                        stick: true
                    		                  }
                    		                 ];*/
                    	  }
                      }
                   },
                  header: {
                      center: 'title',
                      right: 'myCustomButtonToday next, myCustomButton',
                      left: ' myCustomButtonPrev , prev'
                   },
                 dayClick: $scope.setCalDate,
                 eventDrop: $scope.alertOnDrop,
                renderEvent:$scope.renderCalender,
                  eventRender: $scope.eventRender,
                  schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source'
                 

                }
             };
              
              
             $scope.events2 = [
                 {
                     title: '',
                     start: new Date(),
                     stick: true
               }
              ];
             $scope.eventSources = [$scope.events2];

});
