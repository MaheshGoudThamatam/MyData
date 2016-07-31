'use strict';

/* jshint -W098 */

angular.module('mean.calendar-scheduler').controller('CalendarSchedulerController', ['$scope', '$rootScope', 'Global', 'CalendarSchedulerService', 'URLFactory', 'RoomService','SuperAdmin','BookingService','$stateParams','EVENT_SCHEDULER','$location','$filter', 'uiCalendarConfig', 'SpaceService','MeanUser', 'SearchService', 'SEARCH', '$timeout','flash', 'MESSAGES', 'BookingTrainingService',
  function($scope, $rootScope, Global,CalendarSchedulerService, URLFactory, RoomService,SuperAdmin,BookingService,$stateParams,EVENT_SCHEDULER,$location,$filter, uiCalendarConfig, SpaceService, MeanUser, SearchService, SEARCH, $timeout, flash, MESSAGES, BookingTrainingService) {
    
	$scope.global = Global;
    $scope.package = {
      name: 'calendar-scheduler'
    };
    $scope.booking = {};
    $scope.timeType= {};
    $scope.backOfficeBooking={};
    $scope.booking.amenities = [];
    $scope.EVENT_SCHEDULER=EVENT_SCHEDULER;
    $rootScope.timeTypes = [{data : 'Hourly'}, {data: 'Half Day'}, {data: 'Full Day'}];
    $scope.hideEndTimeBox = false;
    $scope.addAttendeeForm = [ {} ];
    
    /**
     * Initialize popup
     */
    $scope.initializePopup = function($scope, modelName, MESSAGES, $uibModal) {
    	
    	$scope.modalPopup = function(start, end, requiredRoomResource) {
    		$rootScope.requiredRoomResource=requiredRoomResource;
    		var modalInstance = $uibModal.open({
    			templateUrl: '/calendar-scheduler/views/scheduler_booking.html',
    			controller: 'CalendarSchedulerController',
    			size: 'lg',
    			resolve: {
    				bookingObj: function() {
    					return $scope.backOfficeBooking;
    				},
    			}
    		});

    	/*	modalInstance.result.then(function(booking) {
    			$scope.backOfficeBooking = booking;
    			var title = $scope.backOfficeBooking.title;
				var eventData = {};
				console.log(start);
				console.log(end);
				console.log(start.toISOString());
				console.log(end.toISOString());
				if (title) {
					eventData = {
						title: title,
						start: start.toISOString(),
						end: end.toISOString(),
						resourceId: requiredRoomResource
					};
					console.log(eventData);
					console.log($('#calendar').fullCalendar('getResources'));
					$('#calendar').fullCalendar('renderEvent', eventData, true); // stick? = true
					//events.push(eventData);
					//console.log(events);
					//$('#calendar').fullCalendar('addEventSource', events);
					//$('#calendar').fullCalendar('refetchEvents');
					var events = $('#calendar').fullCalendar('clientEvents');
					$('#calendar').fullCalendar({events: events});
					console.log(events);
				}
    		}, function() {
    			console.log('Modal dismissed at: ' + new Date());
    		});*/

    	};
    	
    	$scope.modalPopupBooked = function(id) {
    		$scope.findOneBookedRoom(id);
    		var modalInstanceBooked = $uibModal.open({
    			templateUrl: 'calendar-scheduler/views/bookedRoomDetails.html',
    			controller: 'CalendarSchedulerController',
    			size: 'lg'
    		});
    	
    	};
    	
    	$scope.modalPopupSuccess = function(booking) {
    		$rootScope.bookingSuccess = booking;
    		var modalInstanceBooked = $uibModal.open({
    			templateUrl: 'calendar-scheduler/views/bookingSuccess.html',
    			controller: 'CalendarSchedulerController',
    			size: 'lg'
    		});
    	};
    	
    	$scope.modalPopupTrainingRoomBooking = function(start, end, requiredRoomResource) {
    		$rootScope.requiredRoomResource = requiredRoomResource;
    		var modalInstance = $uibModal.open({
    			templateUrl: '/calendar-scheduler/views/scheduler_booking_training.html',
    			controller: 'CalendarSchedulerController',
    			size: 'lg',
    			resolve: {
    				bookingObj: function() {
    					return $scope.backOfficeBooking;
    				},
    			}
    		});
    	}
    	
    };
    
    $scope.initializePopup($scope, $scope.package.modelName, URLFactory.MESSAGES, URLFactory.uibModal);

    
    $scope.loadRoomTypes=function(){
		SuperAdmin.loadroomtypeCommssionPercentage.query(function (roomTypes) {
		     $scope.roomTypes = roomTypes;
		   });    
	};
    
	$scope.changeRoom=function(roomTypeRoom){
		 RoomService.getRoomByRoomType.query({roomTypeRooms: roomTypeRoom},function(response){
			 if(angular.isDefined($scope.roomRoomTypes)){
		            delete $scope.roomRoomTypes;
		        }
             $scope.roomRoomTypes = response;
             for(var i = 0; i < $scope.roomRoomTypes.length; i++){
				$('#calendar').fullCalendar('addResource', {
				    id: $scope.roomRoomTypes[i]._id,
				    title: $scope.roomRoomTypes[i].name,
				    priceperHour:$scope.roomRoomTypes[i].pricePerhour,
				    priceperHalfday:$scope.roomRoomTypes[i].pricePerhalfday,
				    priceperfullday:$scope.roomRoomTypes[i].pricePerfullday,
				    capacity:$scope.roomRoomTypes[i].capacity,
				    space:$scope.roomRoomTypes[i].spaceId,
				    roomType:$scope.roomRoomTypes[i].roomtype.name
				});
				$scope.loadBookedSchedule($scope.roomRoomTypes[i]._id);
				$('#calendar').fullCalendar( 'addEventSource',$scope.events);
			}       
        });
	};
		
		$scope.loadBookedSchedule=function(roomBooked){
			BookingService.loadBookingSchedule.query({bookedRoom : roomBooked},function(response){
					$rootScope.bookedRoom=response;
					 for (var i = 0; i < $rootScope.bookedRoom.length; i++) {
						 $rootScope.bookedRoom[i].bookingStartTime = new Date($rootScope.bookedRoom[i].bookingStartTime);
                         $rootScope.bookedRoom[i].bookingEndTime = new Date($rootScope.bookedRoom[i].bookingEndTime);
                          $rootScope.bookedRoom[i].bookingDate = new Date($scope.bookedRoom[i].bookingDate);
                         $scope.events.push(
                            {
                            	id:$rootScope.bookedRoom[i]._id,
                            	title:$rootScope.bookedRoom[i].room.name, 	
                              start: $rootScope.bookedRoom[i].bookingStartTime,
                              end:  $rootScope.bookedRoom[i].bookingEndTime,
                              resourceId: $rootScope.bookedRoom[i].room._id,
                              stick: true,
                              url:EVENT_SCHEDULER.URL_PATH.BOOKEDROOMDETAILS.replace(":bookingId", $rootScope.bookedRoom[i]._id),
                           });
                       
                        }
					$scope.eventSources = [$scope.events];
				});
		};
		
		 $scope.findOneBookedRoom = function (id) {
		    	BookingService.loadBookings.get({
		    		bookingId: id
		            }, function (booking) {
		                $rootScope.bookingDetails = booking;
		            });
		            };
		
		$scope.loadClosedSchedules=function(){
			CalendarSchedulerService.loadClosedSchedule.query(function (response) {
                $scope.closedSchedule = response;
                for(var i=0;i<$scope.closedSchedule.length;i++){
                	   $scope.events.push(
                               {
                               	title:'Closed', 	
                                 start: $scope.closedSchedule[i].date,
                                 end:  '',
                                 stick: true
                              });
                }
            });
		};
		  $scope.cancel = function () {
			  $("#backOfficeBookingForm").remove();
		    };
			$scope.calculateServiceTax=function(timeType,price){
				if (timeType== 'Hourly'){
					$scope.totalPricePerHour=price * $rootScope.totalHoursBooked;
		            $scope.discount= $scope.totalPricePerHour - 0;
					$scope.servicetax=$scope.discount*(14.5/100);
					$scope.totalPrice=$scope.discount + $scope.servicetax;
				}
				else{
				$scope.totalPricePerHour=price;
	            $scope.discount= price - 0;
				$scope.servicetax=$scope.discount*(14.5/100);
				$scope.totalPrice=$scope.discount + $scope.servicetax;
				}
			};
			$scope.endTimeHalfDay=false;
			$scope.endTime=true;
			$scope.changeTimeType=function(timeType){
				if(timeType == "Half Day"){
					$scope.endTime=false;
					$rootScope.timeHalfDay=moment($rootScope.startComplete).add(4, 'hours').format('LT');
					$scope.endTimeHalfDay=true;
				}else if(timeType == "Full Day"){
					$scope.endTimeHalfDay=false;
					$scope.endTime=false;
				}else{
					$scope.endTimeHalfDay=false;
					$scope.endTime=true;
				}
			};
    $scope.uiConfig = {
            calendar: {
            	defaultView: 'agendaDay',
    			defaultDate: new Date(),
    			editable: true,
    			selectable: true,
    			eventLimit: true,
             header: {
 				left: 'prev,next today',
 				center: 'title',
 				right: 'agendaDay,agendaWeek,month'
 			},	
 			resources: [],
			eventSources: [],
		//	Boolean, default: true,
			events: [],

			select: function(start, end, jsEvent, view, resource) {
			var startTimeFormat=start._d;
			var endTimeFormat=end._d;
			var startTimeFormatOne=new Date(startTimeFormat);
			var startTimeFormatTwo= new Date(startTimeFormatOne);
			startTimeFormatTwo.setHours(startTimeFormatOne.getHours()-5);
			$rootScope.startTimeFormatFinal=new Date(startTimeFormatTwo);
			$rootScope.startTimeFormatFinal.setMinutes(startTimeFormatTwo.getMinutes()-30);
			var endTimeFormatOne=new Date(endTimeFormat);
			var endTimeFormatTwo= new Date(endTimeFormatOne);
			endTimeFormatTwo.setHours(endTimeFormatOne.getHours()-5);
			$rootScope.endTimeFormatFinal=new Date(endTimeFormatTwo);
			$rootScope.endTimeFormatFinal.setMinutes(endTimeFormatTwo.getMinutes()-30);
				$rootScope.start=moment(start).format('LT');
				$rootScope.end=moment(end).format('LT');

				  var startTime=$rootScope.start.split(" ");
				     var startMeridiem = startTime[1];
				     var stime = startTime[0].split(":");
				     var sTimeHrs = parseInt(stime[0]);
				     var sTimeMins = parseInt(stime[1]);
				     var endTime=$rootScope.end.split(" ");
				     var endMeridiem = endTime[1];
				     var etime = endTime[0].split(":");
				     var eTimeHrs = parseInt(etime[0]);
				     var eTimeMins = parseInt(etime[1]);
				     // Calculating hrs
				     if(startMeridiem == "PM"  && sTimeHrs != '12'){
				    	 sTimeHrs = sTimeHrs + 12;
				     }
				     if(endMeridiem == "PM" && eTimeHrs != '12'){
				    	 eTimeHrs = eTimeHrs + 12;
				     }
				  // Calculating mins
				     if((eTimeMins - sTimeMins) > 0){
				    	 $rootScope.totalHoursBooked = eTimeHrs - sTimeHrs + 0.5;
				     } else if((eTimeMins - sTimeMins) < 0){
				    	 $rootScope.totalHoursBooked = eTimeHrs - sTimeHrs - 0.5;
				     } else {
				    	 $rootScope.totalHoursBooked = (eTimeHrs - sTimeHrs);
				     }
					var selectedDate = moment(start).format('YYYY-MM-DD');
					 $rootScope.selectedDate = $filter('date')(selectedDate, 'yyyy-MM-dd');
				    $scope.backOfficeBooking = {
				        bookingDate:  $rootScope.selectedDate,
				    	bookingStartTime : formatAMPM(start),
				    	bookingEndTime : formatAMPM(end)
				    };
				  $scope.roomResources= $('#calendar').fullCalendar( 'getResources');
				    for(var i=0;i<$scope.roomResources.length;i++){
				    	if(resource.id == $scope.roomResources[i].id){
				    		$scope.loadSchedules($rootScope.selectedDate,$scope.roomResources[i].id);
					    	$scope.modalPopup(start, end,$scope.roomResources[i]);
							$('#calendar').fullCalendar('unselect');	
				    	}
				    	
				    }
				
				var selectedDate = moment(start).format('YYYY-MM-DD');
				 $rootScope.selectedDate = $filter('date')(selectedDate, 'yyyy-MM-dd');

			    $scope.backOfficeBooking = {
			        bookingDate:  $rootScope.selectedDate,
			    	bookingStartTime : formatAMPM(start),
			    	bookingEndTime : formatAMPM(end)
			    };

			    $scope.view = view;
			    $scope.resource = resource;
			    //$scope.loadResources();

			},
		    eventClick: function(events) {
		        if (events.url) {
		        	for(var i=0;i<$scope.events.length;i++){
		        		$scope.modalPopupBooked($scope.events[i].id);	
		        	}
		            return false;
		        }
		    
		    },
			dayClick: function(date, jsEvent, view, resource) {
			},
			schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source'
          }
       };
    
    	$scope.loadResources = function(){
    		$scope.roomResources= $('#calendar').fullCalendar( 'getResources');
        	console.log($scope.roomResources);
    	    for(var i=0;i<$scope.roomResources.length;i++){
		    	if($scope.resource.id == $scope.roomResources[i].id){
		    		$scope.loadSchedules($rootScope.selectedDate, $scope.roomResources[i].id);
			    	$scope.modalPopup(start, end,$scope.roomResources[i]);
					$('#calendar').fullCalendar('unselect');	
		    	}
		    	
		    }
    	}
    	
    
       $scope.events = [
           {
               title: '',
               start: new Date(),
               end:new Date(),
               stick: true
         }
        ];
       $scope.eventSources = [$scope.events];
       
   	$scope.loadSchedules = function(dateSelected,scheduleRoom) {
		$scope.selectDateSchedule=dateSelected;
		BookingService.loadRoomSchedule.get({
			'roomId':scheduleRoom,
			'selectdate' : $scope.selectDateSchedule
		}, function(response) {
			$rootScope.schedule = response;
		}, function(error) {
			$scope.error=error;
		});
	};
	
	//Make booking as Back Office
	
	$scope.submit = function(requiredRoomResource,bookingForm,schedule,backOfficeBooking) {
        $rootScope.backOfficeBooking = {};
        BookingService.loadUserBasedOnEmail.get({
			'userId':backOfficeBooking.email
		}, function(response) {
			if(response._id == undefined){
				$rootScope.guest={};
				$rootScope.guest.first_name = backOfficeBooking.name;
				$rootScope.guest.email = backOfficeBooking.email;
				$rootScope.backOfficeBooking.guest = $rootScope.guest;
				$rootScope.backOfficeBooking.user = undefined;
			} else {
				$rootScope.requiredUserId = response._id;
				$rootScope.backOfficeBooking.user = $rootScope.requiredUserId;
			}
		
			$rootScope.backOfficeBooking.room = requiredRoomResource.id;
			$rootScope.backOfficeBooking.space = requiredRoomResource.space._id;
			$rootScope.backOfficeBooking.partner = requiredRoomResource.space.partner;
			$rootScope.backOfficeBooking.user = $rootScope.requiredUserId;
			$rootScope.backOfficeBooking.scheduleTraining = schedule;
			$rootScope.backOfficeBooking.bookingStartTime = $rootScope.startTimeFormatFinal;
			$rootScope.backOfficeBooking.bookingEndTime = $rootScope.endTimeFormatFinal;
			$rootScope.backOfficeBooking.bookingDate = $rootScope.selectedDate;
			$rootScope.backOfficeBooking.price = $scope.totalPricePerHour;
			$rootScope.backOfficeBooking.totalHours = $rootScope.totalHoursBooked;
			var booking = new BookingService.createBackofficeBooking($rootScope.backOfficeBooking);
			booking.$save({
				scheduleId : schedule._id
			}, function(backoffice) {
				$scope.modalPopupSuccess(backoffice);
				$rootScope.backOfficeBooking = {};
			}, function(error) {
				$scope.error = error;
			});
		});
       
		//$uibModal.close($scope.backOfficeBooking);
    };

    $scope.createAttendee = function(isvalid, attendee,bookingsuccuessId) {
		if (isvalid) {
			$rootScope.attendee={};
			$rootScope.attendee.booking = bookingsuccuessId;
			$rootScope.attendee.name=attendee.name;
			$rootScope.attendee.email=attendee.email;
			$rootScope.attendee.phoneNumber=attendee.phoneNumber;
			var attendee = new BookingService.createAttendee($scope.attendee);
			attendee.$save(function(response) {
				$scope.attendee = {};
			});
		} else {
			$scope.submitted = true;
		}

	};

	$scope.addAttendee = function() {
		var attendeeObj = {};
		$scope.addAttendeeForm.push(attendeeObj);
	};
	
	
	$scope.loadSpaceAddress = function(){
		SpaceService.spaceAddress.query({
			userId: MeanUser.user._id
		}, function(err, spaces){
			$scope.spaceAddress = '' + spaces[0].address1 + spaces[0].locality + spaces[0].city + spaces[0].state + spaces[0].country;
		});
	};
	
	$rootScope.isSearchTrainingRoom = false;
	$scope.searchingTrainingRoom = function(){
		$rootScope.isSearchTrainingRoom = true;
		$scope.loadSpaceAddress();
	};
	
	
	/******************************************
	 ********* Training Room Booking **********
	 ******************************************/
	
	$scope.hideEndTimeBox = false;
	$scope.gPlace;
	$scope.init = function() {
		$timeout(function() {
			$("#date").datepicker({
				minDate : 0
			});
		});
	}
			
			
	$scope.timeSet = [{data : '12:00 AM'}, {data :'12:30 AM'}, {data :'01:00 AM'}, {data :'01:30 AM'}, {data :'02:00 AM'}, {data :'02:30 AM'}, {data :'03:00 AM'}, {data :'03:30 AM'}, 
	                  {data :'04:00 AM'}, {data :'04:30 AM'}, {data :'05:00 AM'}, {data :'05:30 AM'}, {data :'06:00 AM'}, {data :'06:30 AM'}, {data :'07:00 AM'}, {data :'07:30 AM'}, 
	                  {data :'08:00 AM'}, {data :'08:30 AM'}, {data :'09:00 AM'}, {data :'09:30 AM'}, {data :'10:00 AM'}, {data :'10:30 AM'}, {data :'11:00 AM'}, {data :'11:30 AM'}, 
	                  {data :'12:00 PM'}, {data :'12:30 PM'}, {data :'01:00 PM'}, {data :'01:30 PM'}, {data :'02:00 PM'}, {data :'02:30 PM'}, {data :'03:00 PM'}, {data :'03:30 PM'}, 
	                  {data :'04:00 PM'}, {data :'04:30 PM'}, {data :'05:00 PM'}, {data :'05:30 PM'}, {data :'06:00 PM'}, {data :'06:30 PM'}, {data :'07:00 PM'}, {data :'07:30 PM'}, 
	                  {data :'08:00 PM'}, {data :'08:30 PM'}, {data :'09:00 PM'}, {data :'09:30 PM'}, {data :'10:00 PM'}, {data :'10:30 PM'}, {data :'11:00 PM'}, {data :'11:30 PM'}];

	$scope.endTimeSet = $scope.timeSet;

	$scope.timeTypes = [{data : 'Hourly'}, {data: 'Half Day'}, {data: 'Full Day'}];

	$scope.trainingTimeTypes = [{data: 'Half Day'}, {data: 'Full Day'}];

	$scope.occupancyRange = [{range : '01 - 10'}, {range : '11 - 20'}, {range : '21 - 30'}, {range : '31 - 40'}, {range : '41 - 50'}];


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


	$scope.setEndTime = function(room){
		if(room.timeType === 'Half Day'){
			//	console.log(room.timeType);
			for(var i = 0; i < $scope.timeSet.length; i++){
				if($scope.timeSet[i].data === room.startTime){
					if(i > 40) {
						room.endTime = $scope.timeSet[i % 40].data;	
					} else { 
						room.endTime = $scope.timeSet[i+8].data;	

					}
				}
			}
		} else if(room.timeType === 'Full Day'){
			//	console.log(room.timeType);
			for(var i = 0; i < $scope.timeSet.length; i++){

				if($scope.timeSet[i].data === room.startTime){
					if(i > 40) {
						room.endTime = $scope.timeSet[(i % 40) + 8].data;	
					} else { 
						room.endTime = $scope.timeSet[i+16].data;	

					}
				}
			}
		} else{
			//console.log(room.timeType);
		}
		return room.endTime;
	};

	$rootScope.isTrainingRoomList = false;
	$scope.searchService = function(searchElement){
		//console.log($scope.searchElements);
		if($scope.searchElements.roomType == SEARCH.CONSTANT.TRAINING_ROOM) {
			var search = new SearchService.search(searchElement);
			search.$save({
				perPage : 6,
				page : 0
			}, function(searchedList){
				console.log(searchedList);
				if(!angular.isUndefined(searchedList.rooms)){
					$scope.searchedList = searchedList.rooms;
					$rootScope.isTrainingRoomList = true;
					$scope.changeRoomForTrainingRoom();
					if($scope.searchedList.length > 0){
						console.log($scope.searchedList);
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
		// If adress is not supplied, use default value 'Ferrol, Galicia, Spain'
		address = address || 'Bangalore';
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
				$scope.searchService($scope.searchElements);
			});
		}
	};

	$scope.defineSearchObject = function(roomObj, roomType){
		if(SEARCH.CONSTANT.TRAINING_ROOM === roomType){
			var roomcapacity = {
				min : parseInt(roomObj.capacity.split(' ')[0]),
				max : 50
			}
			$scope.searchElements.capacity = roomcapacity;
			$scope.searchElements.roomType = SEARCH.CONSTANT.TRAINING_ROOM;
		}
	};

	/**
	 * Search Training Room
	 */
	$scope.searchTrainingRoom = function(roomObj, roomType) {
		console.log($scope.spaceAddress);
		roomObj.address = $scope.spaceAddress;
		console.log(roomObj.address);
		roomObj.startTime = $('#trainingroomcheckin').val();
		roomObj.endTime = $scope.setEndTime(roomObj);
		$scope.setEndTimeList(roomObj);
		roomObj.fromDate = document.getElementById("fromDate").value;
		roomObj.endDate = document.getElementById("endDate").value;

		var selectedStartTime = roomObj.fromDate + " " + roomObj.startTime;
		var selectedStartTime = new Date(selectedStartTime);

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

		$scope.searchElements = {
				place: roomObj.address,
				stime: roomObj.startTime,
				etime: roomObj.endTime,
				fromDate: roomObj.fromDate,
				endDate: roomObj.endDate
		};

		$scope.defineSearchObject(roomObj, roomType);

		$scope.getLatitudeLongitude(roomObj.address);
	};
	
	$scope.changeRoomForTrainingRoom = function(){
		var id;
		for(var i = 0; i < $scope.roomTypes.length; i++){
			if($scope.roomTypes[i].name.match(/training/i)){
				id = $scope.roomTypes[i]._id;
			}
		}
		$scope.fetchTrainingRoomObject(id);
		//$scope.loadBookedTrainingRoomSchedule(id);
	};
	
	$scope.fetchTrainingRoomObject = function(roomTypeRoom){
		for(var i = 0; i < $scope.searchedList.length; i++){
			$scope.loadBookedTrainingRoomSchedule($scope.searchedList[i]._id);
		}  
	};
		
	$scope.bookings = [];
	$scope.loadBookedTrainingRoomSchedule = function(roomBooked){
		$scope.user = MeanUser.user._id;
		BookingTrainingService.loadTrainingRoomBookingByBackOffice.query({
			trainingRoomId: roomBooked, 
			backOfficeId: $scope.user
		}, function(response){
			$scope.bookedRoom = response;
			console.log($scope.bookedRoom);
			for (var i = 0; i < $scope.bookedRoom.length; i++) {
				$scope.bookings.push($scope.bookedRoom[i]);
            }
			console.log($scope.bookings);
		});
	};

	$scope.calculatePriceAfterCommission = function(requiredRoomType, bookedPartner, bookingPrice) {
		var roomCommission = bookedPartner.commissionPercentage;
		BookingService.loadRequredRoomType.query({
			'RoomType' : requiredRoomType,
			'logUserPartner' : bookedPartner._id
		},
		function(response) {
			$scope.requiredRoomType = response;
			for (var i = 0; i <= $scope.requiredRoomType.length; i++) {
				$scope.requiredCommissionPercentage = $scope.requiredRoomType[i].commission;
				$scope.finalCommissionValue = (bookingPrice * $scope.requiredCommissionPercentage) / 100;
				$scope.PartnerFinalPrice = bookingPrice - $scope.finalCommissionValue;
			}
		});
	};
							
    $scope.redirectAttendee = function(id, urlPath){
   	  	urlPath = urlPath.replace(":bookingId", id);
        $location.path(urlPath);
    };
	
	$scope.loadSchedulesForTrainingRoom = function() {
		$rootScope.selectedFromDate = $scope.searchElements.fromDate;
		$rootScope.selectedEndDate = $scope.searchElements.endDate;
		$rootScope.start = $scope.searchElements.stime;
		$rootScope.end = $scope.searchElements.etime;
		$scope.backOfficeBooking = {
			selectedFromDate: $rootScope.selectedFromDate,
			selectedEndDate: $rootScope.selectedEndDate,
	    	bookingStartTime : $rootScope.start,
	    	bookingEndTime : $rootScope.end
	    };
		BookingTrainingService.loadRoomSchedule.query({
			'roomId':$stateParams.roomId,
			'selectFromDate' : $scope.selectedFromDate,
			'selectEndDate' : $scope.selectedEndDate
		}, function(response) {
			$rootScope.schedule = response;
			console.log($rootScope.schedule);
			$scope.scheduleSpliceIndexArray = [];
			$scope.scheduleIndexArray = [];
			for(var i = 0; i < $rootScope.schedule.length; i++){
				if($rootScope.schedule[i].currentAval.length === 0){
					$scope.scheduleSpliceIndexArray.push($rootScope.schedule[i]);
				} else {
					$scope.scheduleIndexArray.push($rootScope.schedule[i]);
				}
			}		
			$rootScope.schedule = $scope.scheduleIndexArray;
		}, function(error) {
			console.log(error);
		});
	};
	
	// $scope.loadTrainingRoomResources = function(roomObj){
	// 	$scope.roomResources= $('#calendar').fullCalendar('getResources');
 //    	console.log($scope.roomResources);
	//     for(var i=0;i<$scope.roomResources.length;i++) {
	//     	if(roomObj._id === $scope.roomResources[i].id) {
	//     		$scope.loadSchedulesForTrainingRoom();
	// 	    	$scope.modalPopupTrainingRoomBooking($scope.searchElements.stime, $scope.searchElements.etime, $scope.roomResources[i]);
	// 			$('#calendar').fullCalendar('unselect');	
	//     	}
	//     }
	// };
	$scope.loadTrainingRoomResources = function(roomObj){
     console.log($scope.searchedList);
     for(var i = 0; i < $scope.searchedList.length; i++) {
      if(roomObj._id === $scope.searchedList[i]._id) {
       $scope.loadSchedulesForTrainingRoom();
       $scope.modalPopupTrainingRoomBooking($scope.searchElements.stime, $scope.searchElements.etime, $scope.searchedList[i]); 
      }
     }
 };
	

	$scope.bookTrainingRoom = function(roomObj){
		$scope.loadTrainingRoomResources(roomObj);
	};
	
	$scope.submitTrainingRoom = function(requiredRoomResource,bookingForm,schedule,backOfficeBooking) {
        $rootScope.backOfficeBooking = {};
        BookingService.loadUserBasedOnEmail.get({
			'userId':backOfficeBooking.email
		}, function(response) {
			if(response._id == undefined){
				$rootScope.guest={};
				$rootScope.guest.first_name = backOfficeBooking.name;
				$rootScope.guest.email = backOfficeBooking.email;
				$rootScope.backOfficeBooking.guest = $rootScope.guest;
				$rootScope.backOfficeBooking.user = undefined;
			}else{
				$rootScope.requiredUserId = response._id;
				$rootScope.backOfficeBooking.user = $rootScope.requiredUserId;
			}
			console.log(schedule);
			$rootScope.backOfficeBooking.room = requiredRoomResource.id;
			$rootScope.backOfficeBooking.space = requiredRoomResource.spaceId._id;
			$rootScope.backOfficeBooking.partner = requiredRoomResource.partner;
			$rootScope.backOfficeBooking.user = $rootScope.requiredUserId;
			$rootScope.backOfficeBooking.scheduleTraining = schedule;
			$rootScope.backOfficeBooking.bookingStartTime = $rootScope.startTimeFormatFinal;
			$rootScope.backOfficeBooking.bookingEndTime = $rootScope.endTimeFormatFinal;
			/*$rootScope.backOfficeBooking.fromDate = $scope.searchObj.fromDate;
			$rootScope.backOfficeBooking.endDate = $scope.searchObj.endDate;*/
			$rootScope.backOfficeBooking.bookingDate = $rootScope.selectedDate;
			$rootScope.backOfficeBooking.price = $scope.totalPricePerHour;
			$rootScope.backOfficeBooking.totalHours = $rootScope.totalHoursBooked;
			console.log($rootScope.backOfficeBooking);
			var booking = new BookingTrainingService.createBookingBackOffice($rootScope.backOfficeBooking);
			booking.$save({
				/*scheduleId : schedule._id*/
			}, function(backoffice) {
				$scope.modalPopupSuccess(backoffice);
				$rootScope.backOfficeBooking = {};
			}, function(error) {
				$scope.error = error;
			});
		});
       
		//$uibModal.close($scope.backOfficeBooking);
    };

	//	Timepicker Initialize - Meeting Room.
	//	Variable:
	//	cinTime  : Check In Time
	//	coutTime : Check Out Time
	$scope.trainingRoomTimeUI = function(){
		var cinTime = $('#trainingroomcheckin');
		$(function () {
			$('#trainingroomcheckin').datetimepicker({
				format: 'LT',
				stepping: '30'
			});
		});
	};
	
	$timeout(function(){
		Calendar();
	},10000);
	
  }
]);