'use strict';

/* jshint -W098 */
var myAppCalendar = angular.module('mean.calendar-scheduler');
var calEventObj = {};

myAppCalendar.controller('CalendarSchedulerController', ['$scope', '$rootScope', 'Global', 'CalendarSchedulerService', 'URLFactory', 'RoomService', 'SuperAdmin', 'BookingService', '$stateParams', 'EVENT_SCHEDULER', '$location', '$filter', 'SpaceService', 'MeanUser', 'SearchService', 'SEARCH', '$timeout', 'flash', 'MESSAGES', 'BookingTrainingService', 'HolidaysService', '$compile', 'BookingHotDeskService',
    function($scope, $rootScope, Global, CalendarSchedulerService, URLFactory, RoomService, SuperAdmin, BookingService, $stateParams, EVENT_SCHEDULER, $location, $filter, SpaceService, MeanUser, SearchService, SEARCH, $timeout, flash, MESSAGES, BookingTrainingService, HolidaysService, compile, BookingHotDeskService) {

        $scope.global = Global;
        $scope.package = {
            name: 'calendar-scheduler'
        };
        $scope.booking = {};
        $scope.timeType = {};
        $scope.backOfficeBooking = {};
        $scope.booking.amenities = [];
        $scope.EVENT_SCHEDULER = EVENT_SCHEDULER;
        $scope.bMeetingRoom = $scope.bBoardRoom = $scope.bTrainingRoom = $scope.bHotDesk = false;
        $rootScope.timeTypes = [{
            data: 'Hourly'
        }, {
            data: 'Half Day'
        }, {
            data: 'Full Day'
        }];
        $scope.hideEndTimeBox = false;
        $scope.addAttendeeForm = [{}];
        $scope.loaderEnabled = false;

        /**
         * Initialize popup
         */
        $scope.initializePopup = function($scope, modelName, MESSAGES, $uibModal) {

            $scope.modalPopup = function(start, end, requiredRoomResource) {
                $rootScope.requiredRoomResource = requiredRoomResource;
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

                /*  modalInstance.result.then(function(booking) {
                $scope.backOfficeBooking = booking;
                var title = $scope.backOfficeBooking.title;
                var eventData = {};
                if (title) {
                    eventData = {
                        title: title,
                        start: start.toISOString(),
                        end: end.toISOString(),
                        resourceId: requiredRoomResource
                    };
                    $('#calendar').fullCalendar('renderEvent', eventData, true); // stick? = true
                    //events.push(eventData);
                    //$('#calendar').fullCalendar('addEventSource', events);
                    //$('#calendar').fullCalendar('refetchEvents');
                    var events = $('#calendar').fullCalendar('clientEvents');
                    $('#calendar').fullCalendar({events: events});
                }
            }, function() {
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
        //initializePermission($scope, $rootScope, $location, $scope.package.name, flash, URLFactory.MESSAGES);

        $scope.loadRoomTypes = function() {
            BookingService.loadroomtypes.query(function(roomTypes) {
                $scope.roomTypes = roomTypes;
            });
        };

        /*$scope.changeRoom=function(roomTypeRoom){
         RoomService.getRoomByRoomType.query({roomTypeRooms: roomTypeRoom,scopeUser:MeanUser.user.hasRole},function(response){
             $rootScope.roomRoomTypes = response;
             $scope.fan($rootScope.roomRoomTypes);
             for(var i = 0; i < $rootScope.roomRoomTypes.length; i++){
                $('#calendar').fullCalendar('addResource', {
                    id: $rootScope.roomRoomTypes[i]._id,
                    title: $rootScope.roomRoomTypes[i].name,
                    priceperHour:$rootScope.roomRoomTypes[i].pricePerhour,
                    priceperHalfday:$rootScope.roomRoomTypes[i].pricePerhalfday,
                    priceperfullday:$rootScope.roomRoomTypes[i].pricePerfullday,
                    capacity:$rootScope.roomRoomTypes[i].capacity,
                    space:$rootScope.roomRoomTypes[i].spaceId,
                    roomType:$rootScope.roomRoomTypes[i].roomtype.name
                });
                $scope.loadBookedSchedule($rootScope.roomRoomTypes[i]._id);
                $('#calendar').fullCalendar( 'addEventSource',$scope.events);
            }     
        });
    };*/

        $scope.loadBookedSchedule = function(roomBooked) {
            // $scope.resetCal();
            BookingService.loadBookingSchedule.query({
                bookedRoom: roomBooked
            }, function(response) {
                $rootScope.bookedRoom = response;
                for (var i = 0; i < $rootScope.bookedRoom.length; i++) {
                    $rootScope.bookedRoom[i].bookingStartTime = new Date($rootScope.bookedRoom[i].bookingStartTime);
                    $rootScope.bookedRoom[i].bookingEndTime = new Date($rootScope.bookedRoom[i].bookingEndTime);
                    var eStart = new Date($rootScope.bookedRoom[i].bookingStartTime);
                    var eEnd = new Date($rootScope.bookedRoom[i].bookingEndTime);
                    $rootScope.bookedRoom[i].bookingDate = new Date($scope.bookedRoom[i].bookingDate);
                    $scope.events.push({
                        id: $rootScope.bookedRoom[i]._id,
                        title: $rootScope.bookedRoom[i].room.name,
                        start: $rootScope.bookedRoom[i].bookingStartTime,
                        end: $rootScope.bookedRoom[i].bookingEndTime,
                        resourceId: $rootScope.bookedRoom[i].room._id,
                        stick: true,
                        url: EVENT_SCHEDULER.URL_PATH.BOOKEDROOMDETAILS.replace(":bookingId", $rootScope.bookedRoom[i]._id),
                        color: '#f09420'
                    });
                    $scope.events.push({
                        id: $rootScope.bookedRoom[i].bookingStartTime.getHours(),
                        title: 'Blocked',
                        start: new Date(eStart.setHours(eStart.getHours() -1)),
                        end: $rootScope.bookedRoom[i].bookingStartTime,
                        resourceId: $rootScope.bookedRoom[i].room._id,
                        stick: true,
                        backgroundColor: '#eeeeee',
                        className : 'leadlag'
                    });
                    $scope.events.push({
                        id: $rootScope.bookedRoom[i].bookingStartTime.getHours(),
                        title:'Blocked',
                        start: $rootScope.bookedRoom[i].bookingEndTime,
                        end: new Date(eEnd.setHours(eEnd.getHours() + 1)),
                        resourceId: $rootScope.bookedRoom[i].room._id,
                        stick: true,
                        backgroundColor: '#eeeeee',
                        className : 'leadlag'
                    });
                }
                var seen = {};
                var events2 = $scope.events.slice();
                $scope.events = [];
                events2.forEach(function(item) {
                    if(!seen[item.id]) {
                        $scope.events.push(item);
                        seen[item.id] = item;
                    }
                    // return seen.hasOwnProperty(k) ? false : (seen[k] = true);
                });
                $scope.eventSources = [$scope.events];
                // $('#calendar').fullCalendar('addEventSource', $scope.events);
            });
        };

        $scope.findOneBookedRoom = function(id) {
            BookingService.BookedSchedule.get({
                bookingId: id
            }, function(booking) {
                $rootScope.bookingDetails = booking;
                $rootScope.bookingStartTime = new Date($rootScope.bookingDetails.bookingStartTime);
                $rootScope.bookingEndTime = new Date($rootScope.bookingDetails.bookingEndTime);
            });
        };

        $scope.loadClosedSchedules = function() {
            CalendarSchedulerService.loadClosedSchedule.query(function(response) {
                $scope.closedSchedule = response;
                for (var i = 0; i < $scope.closedSchedule.length; i++) {
                    $scope.events.push({
                        title: 'Closed',
                        start: $scope.closedSchedule[i].date,
                        end: '',
                        stick: true
                    });
                }
            });
        };
        $scope.cancel = function() {
            $("#backOfficeBookingForm").remove();
            $(".modal-backdrop").remove();
        };

        $scope.cancelSuccess = function(bookigsuccess) {
            $("#backOfficeBookingFormSuccess").remove();
            $("#backOfficeBookingForm").remove();
            $(".modal-backdrop").remove();
            $scope.events.push({
                id: bookigsuccess._id,
                title: bookigsuccess.room.name,
                start: bookigsuccess.bookingStartTime,
                end: bookigsuccess.bookingEndTime,
                resourceId: bookigsuccess.room._id,
                stick: true,
                url: EVENT_SCHEDULER.URL_PATH.BOOKEDROOMDETAILS.replace(":bookingId", bookigsuccess._id),
            });
            $scope.eventSources = [$scope.events];

        };

        $scope.cancelBookedDetails = function() {
            $("#backOfficeBookedFormSuccess").remove();
            $(".modal-backdrop").remove();

        };

        $scope.calculateServiceTax = function(price) {
            $scope.totalPricePerHour = price * $rootScope.totalHoursBooked;
            $scope.discount = $scope.totalPricePerHour - 0;
            $scope.servicetax = $scope.discount * ($scope.serviceTax_value / 100);
            //$scope.servicetax = $scope.discount * (15 / 100);
            $scope.totalPrice = $scope.discount + $scope.servicetax;
        };

        $scope.endTimeHalfDay = false;
        $scope.endTime = true;
        $scope.isHotDesk = false;
        $scope.isTrainingRoom = false;

        $scope.changeTimeType = function() {
            /*if(timeType == "Half Day"){
                $scope.endTime=false;
                $rootScope.timeHalfDay=moment($rootScope.startComplete).add(4, 'hours').format('LT');
                $scope.endTimeHalfDay=true;
            }else if(timeType == "Full Day"){
                $scope.endTimeHalfDay=false;
                $scope.endTime=false;
            }else{
                $scope.endTimeHalfDay=false;
                $scope.endTime=true;
            }*/
            if ($rootScope.searchServiceObj.roomType == SEARCH.CONSTANT.HOT_DESK) {
                $scope.isHotDesk = true;
                $scope.isTrainingRoom = false;
                if ($rootScope.sessionObj.number == 4) {
                	$scope.priceType = 2;
                    $rootScope.roomPrice = $rootScope.roomObj.pricePerhalfday;
                } else if ($rootScope.sessionObj.number > 4 && $rootScope.sessionObj.number < 8) {
                	$scope.priceType = 1;
                    $rootScope.roomPrice = $rootScope.roomObj.pricePerhour;
                } else {
                	$scope.priceType = 3;
                    $rootScope.roomPrice = $rootScope.roomObj.pricePerfullday;
                }
            } else if ($rootScope.searchServiceObj.roomType == SEARCH.CONSTANT.TRAINING_ROOM) {
                $scope.timeTypeRequired = $rootScope.trainingSession.durationType;
                $scope.isHotDesk = false;
                $scope.isTrainingRoom = true;
                if ($rootScope.trainingSession.number == 4) {
                	$scope.priceType = 2;
                    $rootScope.roomPrice = $rootScope.roomObj.pricePerhalfday;
                } else if ($rootScope.trainingSession.number > 4 && $rootScope.trainingSession.number < 8) {
                	$scope.priceType = 1;
                    $rootScope.roomPrice = $rootScope.roomObj.pricePerhour;
                } else {
                	$scope.priceType = 3;
                    $rootScope.roomPrice = $rootScope.roomObj.pricePerfullday;
                }
            }
        };
        
        $scope.checkServiceTax = function(){
        	if($rootScope.requiredRoomResource.space.service_tax && $rootScope.requiredRoomResource.space.service_tax.trim().length > 0) {
				$scope.serviceTax_applicable = true;
				$scope.serviceTax_value = 15;
			} else {
				$scope.serviceTax_applicable = false;
				$scope.serviceTax_value = 0;
			}
        }

        $scope.resetCal = function() {
            if ($rootScope.roomRoomTypes) {
                for (var i = 0; i < $rootScope.roomRoomTypes.length; i++) {
                    $('#calendar').fullCalendar('removeResource', $rootScope.roomRoomTypes[i]._id);
                    $('#calendar').fullCalendar('removeEvents', $rootScope.roomRoomTypes[i]._id);
                    $scope.events = [];
                }
            }
        };

        $scope.uiConfig = {
            calendar: {
                height: 600,
                defaultView: 'timelineDay',
                defaultDate: new Date(),
                editable: false,
                selectable: true,
                eventLimit: true,
                scrollTime: '00:00',
                header: {
                    left: 'promptResource today prev,next',
                    center: 'title',
                    right: 'timelineDay,timelineThreeDays,agendaWeek,month'
                },
                resourceLabelText: 'Rooms',
                resources: function(callbackResource) {
                    $scope.changeRoom = function(roomTypeRoom) {
                        $scope.roomTypes.forEach(function(item) {
                            if (item._id == roomTypeRoom) {
                                if(item.name == 'Meeting Room') {
                                    $scope.bMeetingRoom = true;
                                    $scope.bBoardRoom = $scope.bTrainingRoom = $scope.bHotDesk = false;
                                }
                                if(item.name == 'Board Room') {
                                    $scope.bBoardRoom = true;
                                    $scope.bMeetingRoom = $scope.bTrainingRoom = $scope.bHotDesk = false;
                                }
                                if(item.name == 'Hot Desk') {
                                    $scope.bHotDesk = true;
                                    $scope.bMeetingRoom = $scope.bBoardRoom = $scope.bTrainingRoom = false;
                                    $scope.searchingHotDesk();
                                }
                                if(item.name == 'Training Room') {
                                    $scope.bTrainingRoom = true;
                                    $scope.bMeetingRoom = $scope.bBoardRoom = $scope.bHotDesk = false;
                                    $scope.searchingTrainingRoom();
                                }
                            }
                        });
                        $scope.resetCal();
                        if (roomTypeRoom != "") {
                            $scope.loaderEnabled = true;
                            RoomService.getRoomByRoomType.query({
                                roomTypeRooms: roomTypeRoom,
                                scopeUser: MeanUser.user.hasRole,
                                space: $scope.spaceRelated
                            }, function(response) {
                                $rootScope.roomRoomTypes = response;
                                for (var i = 0; i < $rootScope.roomRoomTypes.length; i++) {
                                    $('#calendar').fullCalendar('addResource', {
                                        id: $rootScope.roomRoomTypes[i]._id,
                                        title: $rootScope.roomRoomTypes[i].name,
                                        priceperHour: $rootScope.roomRoomTypes[i].pricePerhour,
                                        priceperHalfday: $rootScope.roomRoomTypes[i].pricePerhalfday,
                                        priceperfullday: $rootScope.roomRoomTypes[i].pricePerfullday,
                                        capacity: $rootScope.roomRoomTypes[i].capacity,
                                        space: $rootScope.roomRoomTypes[i].spaceId,
                                        roomType: $rootScope.roomRoomTypes[i].roomtype.name,
                                        // capacity: $rootScope.roomRoomTypes[i].capacity,
                                        // eventColor: '#f09420'
                                    });
                                    $scope.loadBookedSchedule($rootScope.roomRoomTypes[i]._id);
                                    $('#calendar').fullCalendar('addEventSource', $scope.events);
                                    callbackResource($rootScope.roomRoomTypes[i]);
                                }
                                $scope.loaderEnabled = false;
                            });
                        }
                    };
                },
                eventSources: [],
                //  Boolean, default: true,
                events: [],

                select: function(start, end, jsEvent, view, resource) {
                    if (view.type == 'agendaWeek' || view.type == 'month') {
                        $('#calendar').fullCalendar('changeView', 'timelineDay');
                        $('#calendar').fullCalendar('gotoDate', new Date(start._d));
                        return;
                    }
                    var startTimeFormat = start._d;
                    var endTimeFormat = end._d;
                    var startTimeFormatOne = new Date(startTimeFormat);
                    var startTimeFormatTwo = new Date(startTimeFormatOne);
                    startTimeFormatTwo.setHours(startTimeFormatOne.getHours() - 5);
                    $rootScope.startTimeFormatFinal = new Date(startTimeFormatTwo);
                    $rootScope.startTimeFormatFinal.setMinutes(startTimeFormatTwo.getMinutes() - 30);
                    var endTimeFormatOne = new Date(endTimeFormat);
                    var endTimeFormatTwo = new Date(endTimeFormatOne);
                    endTimeFormatTwo.setHours(endTimeFormatOne.getHours() - 5);
                    $rootScope.endTimeFormatFinal = new Date(endTimeFormatTwo);
                    $rootScope.endTimeFormatFinal.setMinutes(endTimeFormatTwo.getMinutes() - 30);
                    $rootScope.start = moment($rootScope.startTimeFormatFinal).format('LT');
                    $rootScope.end = moment($rootScope.endTimeFormatFinal).format('LT');
                    if ($rootScope.startTimeFormatFinal < new Date()) {
                        flash.setMessage('Cannot make a booking for a past date.', MESSAGES.ERROR);
                        return;
                    }
                    if(Math.floor(($rootScope.endTimeFormatFinal - $rootScope.startTimeFormatFinal) / (1000*60)) < 60) {
                        flash.setMessage('Minimum booking time should be at least one hour.', MESSAGES.ERROR);
                        return;
                    }
                    var startTime = $rootScope.start.split(" ");
                    var startMeridiem = startTime[1];
                    var stime = startTime[0].split(":");
                    var sTimeHrs = parseInt(stime[0]);
                    var sTimeMins = parseInt(stime[1]);
                    var endTime = $rootScope.end.split(" ");
                    var endMeridiem = endTime[1];
                    var etime = endTime[0].split(":");
                    var eTimeHrs = parseInt(etime[0]);
                    var eTimeMins = parseInt(etime[1]);
                    // Calculating hrs
                    if (startMeridiem == "PM" && sTimeHrs != '12') {
                        sTimeHrs = sTimeHrs + 12;
                    }
                    if (endMeridiem == "PM" && eTimeHrs != '12') {
                        eTimeHrs = eTimeHrs + 12;
                    }
                    if (startMeridiem == "AM" && sTimeHrs == '12') {
                        sTimeHrs = sTimeHrs - 12;
                    }
                    if (endMeridiem == "AM" && eTimeHrs == '12') {
                        eTimeHrs = eTimeHrs - 12;
                    }
                    // Calculating mins
                    if ((eTimeMins - sTimeMins) > 0) {
                        $rootScope.totalHoursBooked = eTimeHrs - sTimeHrs + 0.5;
                    } else if ((eTimeMins - sTimeMins) < 0) {
                        $rootScope.totalHoursBooked = eTimeHrs - sTimeHrs - 0.5;
                    } else {
                        $rootScope.totalHoursBooked = (eTimeHrs - sTimeHrs);
                    }
                    var selectedDate = moment(start).format('YYYY-MM-DD');
                    $rootScope.selectedDate = $filter('date')(selectedDate, 'yyyy-MM-dd');
                    $scope.backOfficeBooking = {
                        bookingDate: $rootScope.selectedDate,
                        bookingStartTime: formatAMPM(start),
                        bookingEndTime: formatAMPM(end)
                    };
                    $scope.roomResources = $('#calendar').fullCalendar('getResources');
                    for (var i = 0; i < $scope.roomResources.length; i++) {
                        if (resource.id == $scope.roomResources[i].id) {
                            $scope.loadSchedules($rootScope.selectedDate, $scope.roomResources[i].id);
                            $scope.modalPopup(start, end, $scope.roomResources[i]);
                            $('#calendar').fullCalendar('unselect');
                        }

                    }

                    var selectedDate = moment(start).format('YYYY-MM-DD');
                    $rootScope.selectedDate = $filter('date')(selectedDate, 'yyyy-MM-dd');

                    $scope.backOfficeBooking = {
                        bookingDate: $rootScope.selectedDate,
                        bookingStartTime: formatAMPM(start),
                        bookingEndTime: formatAMPM(end)
                    };

                    $scope.view = view;
                    $scope.resource = resource;
                    //$scope.loadResources();

                },
                eventClick: function(events) {
                    if (events.url) {
                        /*for(var i=0;i<$scope.events.length;i++){
                            $scope.modalPopupBooked($scope.events[i].id);   
                        }*/
                        $scope.modalPopupBooked(events.id);
                        return false;
                    }

                },
                dayClick: function(date, jsEvent, view, resource) {
                    $('#calendar').fullCalendar('changeView', 'timelineDay');
                    $('#calendar').fullCalendar('gotoDate', date);
                },
                schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source'
            }
        };

		$scope.isRoomType = false;
        $scope.changeSpace = function(spaceObject){
        	$scope.spaceId = spaceObject;
        	$scope.roomTypeRoom = null;
            $scope.bTrainingRoom = $scope.bHotDesk = false;
        	for(var i = 0; i < $scope.spaceList.length; i++){
        		if(JSON.stringify($scope.spaceId) === JSON.stringify($scope.spaceList[i]._id)){
        			$scope.spaceObject = $scope.spaceList[i];
        		}
        	}
        	if($scope.spaceId){
        		$scope.isRoomType = true;
        	} else {
        		$scope.isRoomType = false;
        	}
        }
        
        $scope.loadResources = function() {
            $scope.roomResources = $('#calendar').fullCalendar('getResources');
            for (var i = 0; i < $scope.roomResources.length; i++) {
                if ($scope.resource.id == $scope.roomResources[i].id) {
                    $scope.loadSchedules($rootScope.selectedDate, $scope.roomResources[i].id);
                    $scope.modalPopup(start, end, $scope.roomResources[i]);
                    $('#calendar').fullCalendar('unselect');
                }

            }
        }

        $scope.events = [{
            title: '',
            start: new Date(),
            end: new Date(),
            stick: true
        }];
        $scope.eventSources = [$scope.events];

        $scope.loadSchedules = function(dateSelected, scheduleRoom) {
            $scope.selectDateSchedule = dateSelected;
            BookingService.loadRoomSchedule.get({
                'roomId': scheduleRoom,
                'selectdate': $scope.selectDateSchedule
            }, function(response) {
                $rootScope.schedule = response;
            }, function(error) {
                $scope.error = error;
            });
        };

        //Make booking as Back Office

        $scope.submit = function(requiredRoomResource, bookingForm, schedule, backOfficeBooking) {
            if (bookingForm.$valid) {
                $rootScope.backOfficeBooking = {};
                BookingService.loadUserBasedOnEmail.get({
                    'userId': backOfficeBooking.email
                }, function(response) {
                    if (response._id == undefined) {
                        $rootScope.guest = {};
                        $rootScope.guest.first_name = backOfficeBooking.first_name;
                        $rootScope.guest.email = backOfficeBooking.email;
                        $rootScope.guest.phone = backOfficeBooking.phone;
                        $rootScope.backOfficeBooking.guest = $rootScope.guest;
                        $rootScope.backOfficeBooking.user = undefined;
                    } else {
                        $rootScope.requiredUserId = response._id;
                        $rootScope.backOfficeBooking.user = $rootScope.requiredUserId;
                    }

                    $rootScope.backOfficeBooking.address = backOfficeBooking.address;
                    $rootScope.backOfficeBooking.room = requiredRoomResource.id;
                    $rootScope.backOfficeBooking.space = requiredRoomResource.space._id;
                    $rootScope.backOfficeBooking.partner = requiredRoomResource.space.partner;
                    $rootScope.backOfficeBooking.user = $rootScope.requiredUserId;
                    $rootScope.backOfficeBooking.schedule = schedule;
                    $rootScope.backOfficeBooking.bookingStartTime = $rootScope.startTimeFormatFinal;
                    $rootScope.backOfficeBooking.bookingEndTime = $rootScope.endTimeFormatFinal;
                    $rootScope.backOfficeBooking.bookingDate = $rootScope.selectedDate;
                    $rootScope.backOfficeBooking.price = $scope.totalPrice;
                    $rootScope.backOfficeBooking.priceWithoutTax = $scope.totalPricePerHour;
                    $rootScope.backOfficeBooking.totalHours = $rootScope.totalHoursBooked;
                    $rootScope.backOfficeBooking.status = 'Confirmed';
                    var bookingStartOne = new Date($rootScope.startTimeFormatFinal);
                    var starttimehours = bookingStartOne.getHours();
                    var starttimeminutes = bookingStartOne.getMinutes();
                    var bookingStartTimeNumber = starttimehours * 60 + starttimeminutes;

                    var bookingEndOne = new Date($rootScope.endTimeFormatFinal);
                    var endtimehours = bookingEndOne.getHours();
                    var endtimeminutes = bookingEndOne.getMinutes();
                    var bookingEndTimeNumber = endtimehours * 60 + endtimeminutes;

                    $rootScope.backOfficeBooking.bookingStartTimeNumber = bookingStartTimeNumber;
                    $rootScope.backOfficeBooking.bookingEndTimeNumber = bookingEndTimeNumber;
                    var booking = new BookingService.createBackofficeBooking($rootScope.backOfficeBooking);
                    booking.$save({
                        scheduleId: schedule._id
                    }, function(backoffice) {
                        $("#backOfficeBookingForm").remove();
                        $(".modal-backdrop").remove();
                        $scope.modalPopupSuccess(backoffice);
                        $rootScope.backOfficeBooking = {};
                        $scope.events.push({
                            id: backoffice._id,
                            title: backoffice.room.name,
                            start: new Date(backoffice.bookingStartTime),
                            end: new Date(backoffice.bookingEndTime),
                            resourceId: backoffice.room._id,
                            stick: true,
                            url: EVENT_SCHEDULER.URL_PATH.BOOKEDROOMDETAILS.replace(":bookingId", backoffice._id),
                        });
                        $scope.eventSources = [$scope.events];
                        $('#calendar').fullCalendar( 'addEventSource', $scope.events);
                    }, function(error) {
                        $scope.error = error;
                    });
                });

                //$uibModal.close($scope.backOfficeBooking);
            } else {
                $scope.submitted = true;
            }

        };

        $scope.createAttendee = function(isvalid, attendee, bookingId) {
            if (isvalid) {
                for (var i = 0; i < $scope.addAttendeeForm.length; i++) {
                    $scope.addAttendeeForm[i].booking = bookingId;
                }
                document.getElementById("AttendeeFormBackOffice").reset();
                var attendee = new BookingService.createAttendee($scope.addAttendeeForm);
                attendee.$save(function(response) {
                    $scope.attendee = {};
                    //flash.setMessage(URLFactory.MESSAGES.ATTENDEE_CREATE_SUCCESS,MESSAGES.SUCCESS);
                });
            } else {
                $scope.submitted = true;
            }

        };

        $scope.addAttendee = function(attendee, bookingSuccess) {
            $scope.addAttendeeForm.push(attendee);
            /*for (var i=0;i<$scope.addAttendeeForm.length;i++){
                $scope.addAttendeeForm[i].booking=bookingSuccess;
            }
            */
        };

        $scope.loadSpaceAddress = function() {
            /*SpaceService.spaceAddress.query({
                userId: MeanUser.user._id
            }, function(err, spaces) {
                $scope.spaceAddress = '' + spaces[0].address1 + spaces[0].locality + spaces[0].city + spaces[0].state + spaces[0].country;
            });*/
        };

        $rootScope.isSearchTrainingRoom = false;
        $scope.searchingTrainingRoom = function() {
            $scope.trainingRoom = {};
            $rootScope.isSearchTrainingRoom = true;
            $rootScope.isSearchHotDesk = false;
        };

        $rootScope.isSearchHotDesk = false;
        $scope.searchingHotDesk = function() {
            $scope.trainingRoom = {};
            $rootScope.isSearchHotDesk = true;
            $rootScope.isSearchTrainingRoom = false;
        };

        $scope.loadBasedOnRole = function() {

        };

        /*******************************************************
         ***************** Date Range Picker *******************
         ******************************************************/

        $scope.weekendSunEnabled = true;
        $scope.holidayEnabled = true;
        calEventObj.excludeSunday = true;
        calEventObj.excludeHoliday = true;

        $scope.loadDateRange = function() {
            calEventObj.excludeSunday = true;
            calEventObj.excludeHoliday = true;
            $('input[name="daterange"]').daterangepicker({
                    minDate: moment(),
                    maxDate: moment().add(90, 'days'),
                    isInvalidDate: function(date) {
                        for (var i = 0; i < $scope.unavailableDates.length; i++) {
                            if (date.format('D-MM-YYYY') == $scope.unavailableDates[i]) {
                                return true;
                            }
                        }
                        return (date.day() == 0);
                    },
                    isCustomDate: function(date) {
                        for (var j = 0; j < $scope.unavailableDates.length; j++) {
                            if (date.format('D-MM-YYYY') == $scope.unavailableDates[j]) {
                                return "holidayDate-td";
                            }
                        }
                        if ((date.day() == 0)) {
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
                $scope.dateRangeStartDate = document.getElementsByClassName("hotdeskDaterange")[0].value.split('-')[0].trim();
                $scope.dateRangeEndDate = document.getElementsByClassName("hotdeskDaterange")[0].value.split('-')[1].trim();
                $scope.calculateDateRange();
            });

            $('input[name="daterange"]').focus();
        };

        var month = new Array();
        month[0] = "01";
        month[1] = "02";
        month[2] = "03";
        month[3] = "04";
        month[4] = "05";
        month[5] = "06";
        month[6] = "07";
        month[7] = "08";
        month[8] = "09";
        month[9] = "10";
        month[10] = "11";
        month[11] = "12";

        $scope.holidaysList = [];

        /*
            Author                : Rajesh K
            Date                  : 27-05-2016
            Last Modified         : 27-05-2016
            Function Description  : Function to fetch list of holiday (Current year).
            Parameter             : Current year.
        */
        $scope.loadHoliday = function() {
            $scope.unavailableDates = [];
            $scope.disabledDate = [];
            var nintyDays = 90;
            var currentDate = new Date();
            var selectedyear = currentDate.getFullYear();
            /*HolidaysService.getHolidaysbyyear.query({
                selectedyears: selectedyear
            }, function(response) {*/
            HolidaysService.getHolidaysByDays.query({
                days: nintyDays
            }, function(response) {
                $scope.holidays = response;
                for (var i = 0; i < $scope.holidays.length; i++) {
                    var hoilidayDate = new Date($scope.holidays[i].holiday_date).getDate();
                    var holidayMonth = month[new Date($scope.holidays[i].holiday_date).getMonth()];
                    var hoilidayYear = new Date($scope.holidays[i].holiday_date).getFullYear();
                    $scope.holidaysList.push({
                        title: $scope.holidays[i].name,
                        start: hoilidayDate + "-" + holidayMonth + "-" + hoilidayYear
                    });
                    $scope.unavailableDates.push(
                        hoilidayDate + "-" + holidayMonth + "-" + hoilidayYear
                    );
                    $scope.disabledDate.push(
                        holidayMonth + "-" + hoilidayDate + "-" + hoilidayYear
                    );
                }
                $(".hotdeskEndDate").datepicker({
                    minDate: 0,
                    beforeShowDay: unavailable
                });

                function unavailable(date) {
                    var dmy = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
                    if ($.inArray(dmy, $scope.unavailableDates) < 0) {
                        return [true, "", ""];
                    } else {
                        return [false, "holidayDate", ""];
                    }
                }
            });
        };

        $scope.init = function() {

            /*
                Author                : Rajesh K
                Date                  : 27-05-2016
                Last Modified         : 01-06-2016
                Function Description  : Includes Sunday in calendar and set variable "calEventObj.excludeSunday". Based on variable button is enabled / disabled.
            */
            calEventObj.enableSundayBtn = function(event) {
                $('input[name="daterange"]').daterangepicker("destroy");
                $('input[name="daterange"]').daterangepicker({
                        minDate: moment(),
                        maxDate: moment().add(90, 'days'),
                        drops: "down",
                        isInvalidDate: function(date) {
                            if (calEventObj.excludeHoliday) {
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
                            if ((date.day() == 0)) {
                                return "calendarSunday-td";
                            }
                        }
                    },
                    function(start, end, label) {
                        $scope.dateRangeStartDate = start.format('MM-DD-YYYY');
                        $scope.dateRangeEndDate = end.format('MM-DD-YYYY');
                    });
                calEventObj.excludeSunday = false;
                if (calEventObj.excludeSunday) {
                    var eSunday = ("<div id=\"enableSunday\" data-ng-controller=\"SearchController\"><br/><button class='btn weekendBtn enableSunday'>Include Sunday</button></div>");
                    $(".range_inputs").append(eSunday).find('.enableSunday').on('click', calEventObj.enableSundayBtn);
                    $('input[name="daterange"]').focus();
                } else {
                    var dSunday = ("<div id=\"disableSunday\" data-ng-controller=\"SearchController\"><br/><button type=\"button\" class=\"btn weekendBtn disableSunday\">Exclude Sunday</button></div>");
                    $(".range_inputs").append(dSunday).find('.disableSunday').on('click', calEventObj.disableSundayBtn);
                    $('input[name="daterange"]').focus();
                }
                if (!calEventObj.excludeHoliday) {
                    var dHoliday = ("<div id=\"disableHoliday\" data-ng-controller=\"SearchController\"><br/><button type=\"button\" class=\"btn holidayBtn disableHoliday\">Exclude Holiday</button></div>");
                    $(".range_inputs").append(dHoliday).find('.disableHoliday').on('click', calEventObj.disableHolidayBtn);
                    $('input[name="daterange"]').focus();
                } else {
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
            calEventObj.enableHolidayBtn = function(event) {
                $('input[name="daterange"]').daterangepicker("destroy");
                $('input[name="daterange"]').daterangepicker({
                        minDate: moment(),
                        maxDate: moment().add(90, 'days'),
                        drops: "down",
                        isInvalidDate: function(date) {
                            if (calEventObj.excludeSunday) {
                                return (date.day() == 0);
                            }
                        },
                        isCustomDate: function(date) {
                            for (var j = 0; j < $scope.unavailableDates.length; j++) {
                                if (date.format('D-MM-YYYY') == $scope.unavailableDates[j]) {
                                    return "holidayDate-td";
                                }
                            }
                            if ((date.day() == 0)) {
                                return "calendarSunday-td";
                            }
                        }
                    },
                    function(start, end, label) {
                        $scope.dateRangeStartDate = start.format('MM-DD-YYYY');
                        $scope.dateRangeEndDate = end.format('MM-DD-YYYY');
                    });
                calEventObj.excludeHoliday = false;
                if (calEventObj.excludeSunday) {
                    var eSunday = ("<div id=\"enableSunday\" data-ng-controller=\"SearchController\"><br/><button class='btn weekendBtn enableSunday'>Include Sunday</button></div>");
                    $(".range_inputs").append(eSunday).find('.enableSunday').on('click', calEventObj.enableSundayBtn);
                    $('input[name="daterange"]').focus();
                } else {
                    var dSunday = ("<div id=\"disableSunday\" data-ng-controller=\"SearchController\"><br/><button type=\"button\" class=\"btn weekendBtn disableSunday\">Exclude Sunday</button></div>");
                    $(".range_inputs").append(dSunday).find('.disableSunday').on('click', calEventObj.disableSundayBtn);
                    $('input[name="daterange"]').focus();
                }
                if (calEventObj.excludeHoliday) {
                    var eHoliday = ("<div id=\"enableHoliday\" data-ng-controller=\"SearchController\"><br/><button class='btn holidayBtn enableHoliday'>Include Holiday</button></div>");
                    $(".range_inputs").append(eHoliday).find('.enableHoliday').on('click', calEventObj.enableHolidayBtn);
                    $('input[name="daterange"]').focus();
                } else {
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
            calEventObj.disableSundayBtn = function() {
                $('input[name="daterange"]').daterangepicker("destroy");
                $('input[name="daterange"]').focus();
                $('input[name="daterange"]').daterangepicker({
                        minDate: moment(),
                        maxDate: moment().add(90, 'days'),
                        drops: "down",
                        isInvalidDate: function(date) {
                            if (calEventObj.excludeHoliday) {
                                for (var i = 0; i < $scope.unavailableDates.length; i++) {
                                    if (date.format('D-MM-YYYY') == $scope.unavailableDates[i]) {
                                        return true;
                                    }
                                }
                            }
                            return (date.day() == 0);
                        },
                        isCustomDate: function(date) {
                            for (var i = 0; i < $scope.unavailableDates.length; i++) {
                                if (date.format('D-MM-YYYY') == $scope.unavailableDates[i]) {
                                    return "holidayDate-td";
                                }
                            }
                            if ((date.day() == 0)) {
                                return "calendarSunday-td";
                            }
                        }
                    },
                    function(start, end, label) {
                        $scope.dateRangeStartDate = start.format('MM-DD-YYYY');
                        $scope.dateRangeEndDate = end.format('MM-DD-YYYY');
                    });
                calEventObj.excludeSunday = true;
                if (!calEventObj.excludeSunday) {
                    var dSunday = ("<div id=\"disableSunday\" data-ng-controller=\"SearchController\"><br/><button type=\"button\" class=\"btn weekendBtn disableSunday\">Exclude Sunday</button></div>");
                    $(".range_inputs").append(dSunday).find('.disableSunday').on('click', calEventObj.disableSundayBtn);
                    $('input[name="daterange"]').focus();
                } else {
                    var eSunday = ("<div id=\"enableSunday\" data-ng-controller=\"SearchController\"><br/><button class='btn weekendBtn enableSunday'>Include Sunday</button></div>");
                    $(".range_inputs").append(eSunday).find('.enableSunday').on('click', calEventObj.enableSundayBtn);
                    $('input[name="daterange"]').focus();
                }
                if (!calEventObj.excludeHoliday) {
                    var dHoliday = ("<div id=\"disableHoliday\" data-ng-controller=\"SearchController\"><br/><button type=\"button\" class=\"btn holidayBtn disableHoliday\">Exclude Holiday</button></div>");
                    $(".range_inputs").append(dHoliday).find('.disableHoliday').on('click', calEventObj.disableHolidayBtn);
                    $('input[name="daterange"]').focus();
                } else {
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
            calEventObj.disableHolidayBtn = function() {
                $('input[name="daterange"]').focus();
                $('input[name="daterange"]').daterangepicker({
                        minDate: moment(),
                        maxDate: moment().add(90, 'days'),
                        drops: "down",
                        isInvalidDate: function(date) {
                            for (var i = 0; i < $scope.unavailableDates.length; i++) {
                                if (date.format('D-MM-YYYY') == $scope.unavailableDates[i]) {
                                    return "holidayDate-td";
                                }
                            }
                            if (calEventObj.excludeSunday) {
                                return (date.day() == 0);
                            }
                        },
                        isCustomDate: function(date) {
                            for (var i = 0; i < $scope.unavailableDates.length; i++) {
                                if (date.format('D-MM-YYYY') == $scope.unavailableDates[i]) {
                                    return "holidayDate-td";
                                }
                            }
                            if ((date.day() == 0)) {
                                return "calendarSunday-td";
                            }
                        }
                    },
                    function(start, end, label) {
                        $scope.dateRangeStartDate = start.format('MM-DD-YYYY');
                        $scope.dateRangeEndDate = end.format('MM-DD-YYYY');
                    });
                calEventObj.excludeHoliday = true;
                if (calEventObj.excludeSunday) {
                    var eSunday = ("<div id=\"enableSunday\" data-ng-controller=\"SearchController\"><br/><button class='btn weekendBtn enableSunday'>Include Sunday</button></div>");
                    $(".range_inputs").append(eSunday).find('.enableSunday').on('click', calEventObj.enableSundayBtn);
                    $('input[name="daterange"]').focus();
                } else {
                    var dSunday = ("<div id=\"disableSunday\" data-ng-controller=\"SearchController\"><br/><button type=\"button\" class=\"btn weekendBtn disableSunday\">Exclude Sunday</button></div>");
                    $(".range_inputs").append(dSunday).find('.disableSunday').on('click', calEventObj.disableSundayBtn);
                    $('input[name="daterange"]').focus();
                }
                if (!calEventObj.excludeHoliday) {
                    var dHoliday = ("<div id=\"disableHoliday\" data-ng-controller=\"SearchController\"><br/><button type=\"button\" class=\"btn holidayBtn disableHoliday\">Exclude Holiday</button></div>");
                    $(".range_inputs").append(dHoliday).find('.disableHoliday').on('click', calEventObj.disableHolidayBtn);
                    $('input[name="daterange"]').focus();
                } else {
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

            $scope.initTime = function(roomType) {
                $('#datepairMeetingroom .start').timepicker('remove');
                $('#datepairMeetingroom .end').timepicker('remove');
                $('#datepairMeetingroom .start').val('');
                $('#datepairMeetingroom .end').val('');

                function roundMinutes(formatDate) {
                    formatDate.setHours(formatDate.getHours() + Math.round(formatDate.getMinutes() / 60));
                    formatDate.setMinutes(0);
                    return formatDate;
                }
                if (roomType == 'meetingRoom') {
                    var selectedDate = new Date(document.getElementById("meetingRoomDate").value);
                }
                if (roomType == 'boardRoom') {
                    var selectedDate = new Date(document.getElementById("boardRoomDate").value);
                }
                if (roomType == 'hotDesk') {
                    var selectedDate = new Date(document.getElementById("hotdeskdaterangeCal").value.split('-')[0].trim());
                }
                var todayDate = new Date();
                if ((roomType == 'meetingRoom' || roomType == 'boardRoom' || roomType == 'hotDesk') && selectedDate.setHours(0, 0, 0, 0) == todayDate.setHours(0, 0, 0, 0)) {
                    var dateNow = new Date();

                    var hours = dateNow.getHours();
                    var minutes = dateNow.getMinutes();
                    if (minutes < 30) {
                        var date = new Date(2016, 1, 1, hours, minutes);
                        var roundTime = roundMinutes(date);
                        roundTime = new Date(roundTime.setHours(roundTime.getHours() + 1));
                    } else {
                        var roundTime = new Date();
                        roundTime = new Date(roundTime.setHours(roundTime.getHours() + 2));
                        var hours = roundTime.getHours();
                        var minutes = roundTime.getMinutes();
                        var dateGt = new Date(2016, 1, 1, hours, minutes);
                        roundTime.setHours(roundTime.getHours() + Math.floor(roundTime.getMinutes() / 60));
                        roundTime.setMinutes(0);
                    }
                    var hours = roundTime.getHours();
                    var minutes = roundTime.getMinutes();
                    var ampm = hours >= 12 ? 'PM' : 'AM';
                    hours = hours % 12;
                    hours = hours ? hours : 12;
                    minutes = minutes < 10 ? '0' + minutes : minutes;
                    var strTime = hours + ':' + minutes + ' ' + ampm;
                    $('#datepairMeetingroom .start').timepicker('remove');
                    $('#datepairMeetingroom .end').prop('disabled', true);
                    $('#datepairMeetingroom .end').css({
                        "cursor": "not-allowed"
                    });
                    if (roomType == 'hotDesk') {
                        $('#datepairMeetingroom .start').timepicker({
                            'minTime': strTime,
                            'timeFormat': 'h:i A',
                            'maxTime': '08:00 PM'
                        });
                    } else {
                        $('#datepairMeetingroom .start').timepicker({
                            'minTime': strTime,
                            'timeFormat': 'h:i A'
                        });
                    }
                    $('#datepairMeetingroom .start').on("change", function() {
                        $('#datepairMeetingroom .end').val('');
                        var startTimeOn = $('.start').val();
                        var temp = "01/01/2016" + " " + startTimeOn;
                        var dateCon = new Date(temp);
                        var hours = dateCon.getHours() + 1;
                        var minutes = dateCon.getMinutes();
                        var ampm = hours >= 12 ? 'PM' : 'AM';
                        hours = hours % 12;
                        hours = hours ? hours : 12;
                        minutes = minutes < 10 ? '0' + minutes : minutes;
                        var strToTime = hours + ':' + minutes + ' ' + ampm;
                        $('#datepairMeetingroom .end').prop('disabled', false);
                        $('#datepairMeetingroom .end').css({
                            "cursor": "default"
                        });
                        $('#datepairMeetingroom .end').timepicker('remove');
                        if (roomType == 'hotDesk') {
                            $('#datepairMeetingroom .end').timepicker({
                                'minTime': strToTime,
                                'durationTime': startTimeOn,
                                'maxTime': '08:00 PM',
                                'showDuration': true,
                                'step': 60,
                                'timeFormat': 'h:i A'
                            });
                        } else {
                            $('#datepairMeetingroom .end').timepicker({
                                'minTime': strToTime,
                                'durationTime': startTimeOn,
                                'maxTime': '11:30 PM',
                                'showDuration': true,
                                'step': 60,
                                'timeFormat': 'h:i A'
                            });
                        }
                    });
                } else {
                    var strTime = new Date();
                    $('#datepairMeetingroom .end').prop('disabled', true);
                    $('#datepairMeetingroom .end').timepicker('remove');
                    $('#datepairMeetingroom .end').css({
                        "cursor": "not-allowed"
                    });
                    $('#datepairMeetingroom .start').timepicker('remove');
                    if (roomType == 'hotDesk') {
                        $('#datepairMeetingroom .start').timepicker({
                            'scrollDefault': '07:30 AM',
                            'minTime': '12:00 AM',
                            'maxTime': '08:00 PM',
                            'timeFormat': 'h:i A'
                        });
                    } else {
                        $('#datepairMeetingroom .start').timepicker({
                            'scrollDefault': '07:30 AM',
                            'minTime': '12:00 AM',
                            'timeFormat': 'h:i A'
                        });
                    }
                    $('#datepairMeetingroom .start').on("change", function() {
                        $('#datepairMeetingroom .end').val('');
                        var startTimeOn = $('.start').val();
                        var temp = "01/01/2016" + " " + startTimeOn;
                        var temp = new Date(temp);
                        var hours = temp.getHours() + 1;
                        var minutes = temp.getMinutes();
                        var ampm = hours >= 12 ? 'PM' : 'AM';
                        hours = hours % 12;
                        hours = hours ? hours : 12;
                        if (hours <= 9) {
                            hours = '0' + hours;
                        }
                        minutes = minutes < 10 ? '0' + minutes : minutes;
                        var strToTime = hours + ':' + minutes + ' ' + ampm;
                        $('#datepairMeetingroom .end').prop('disabled', false);
                        $('#datepairMeetingroom .end').css({
                            "cursor": "default"
                        });
                        $('#datepairMeetingroom .end').timepicker('remove');
                        $('#datepairMeetingroom .end').timepicker({
                            'minTime': strToTime,
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
            $('#datepairMeetingroom .start').css({
                "cursor": "not-allowed"
            });
            $('#datepairMeetingroom .end').prop('disabled', true);
            $('#datepairMeetingroom .end').css({
                "cursor": "not-allowed"
            });

            $('input[name="daterangeMeetingRoom"]').change(function() {
                $('#datepairMeetingroom .start').prop('disabled', false);
                $('#datepairMeetingroom .start').css({
                    "cursor": "default"
                });
                $scope.initTime("meetingRoom");
            });

            $('input[name="daterangeBoardRoom"]').change(function() {
                $('#datepairMeetingroom .start').prop('disabled', false);
                $('#datepairMeetingroom .start').css({
                    "cursor": "default"
                });
                $scope.initTime("boardRoom");
            });
            $('input[id="hotdeskdaterangeCal"]').change(function() {
                $('#datepairMeetingroom .start').prop('disabled', false);
                $('#datepairMeetingroom .start').css({
                    "cursor": "default"
                });
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
                $('#datepairMeetingroom .start').prop('disabled', false);
                $('#datepairMeetingroom .start').css({
                    "cursor": "default"
                });
                $scope.initTime(roomType);

            };
            $(function() {
                window.addEventListener('popstate', function(event) {
                    if ($(window).width() <= 415) {
                        $(".hideDivTag").hide();
                        $(".iconMenu").show();
                    }
                });
            });
            $scope.redirectPage = function() {
                $(".hideDivTag").hide();
                $(".iconMenu").show();
            };

            $scope.hotDeskDuration = function(data) {
                var timeArray = ['08:00 PM', '07:30 PM', '07:00 PM', '06:30 PM', '06:00 PM', '05:30 PM', '05:00 PM', '04:30 PM', '04:00 PM'];
                var selectedDate = new Date(Date.parse("01/01/2016" + " " + data, "mm/d/yyyy h:mm TT"));
                if (selectedDate >= new Date(Date.parse('01/01/2016' + " " + timeArray[1], "mm/d/yyyy h:mm TT")) && selectedDate <= new Date(Date.parse('01/01/2016' + " " + timeArray[0], "mm/d/yyyy h:mm TT"))) {
                    $scope.hotDeskTimeFrame = [{
                        seqNo: 1,
                        duration: '4 hrs',
                        number: 4
                    }];
                }
                if (selectedDate >= new Date(Date.parse('01/01/2016' + " " + timeArray[3], "mm/d/yyyy h:mm TT")) && selectedDate < new Date(Date.parse('01/01/2016' + " " + timeArray[1], "mm/d/yyyy h:mm TT"))) {
                    $scope.hotDeskTimeFrame = [{
                        seqNo: 1,
                        duration: '4 hrs',
                        number: 4
                    }, {
                        seqNo: 2,
                        duration: '5 hrs',
                        number: 5
                    }];
                }
                if (selectedDate >= new Date(Date.parse('01/01/2016' + " " + timeArray[5], "mm/d/yyyy h:mm TT")) && selectedDate < new Date(Date.parse('01/01/2016' + " " + timeArray[3], "mm/d/yyyy h:mm TT"))) {
                    $scope.hotDeskTimeFrame = [{
                        seqNo: 1,
                        duration: '4 hrs',
                        number: 4
                    }, {
                        seqNo: 2,
                        duration: '5 hrs',
                        number: 5
                    }, {
                        seqNo: 3,
                        duration: '6 hrs',
                        number: 6
                    }];
                }
                if (selectedDate >= new Date(Date.parse('01/01/2016' + " " + timeArray[7], "mm/d/yyyy h:mm TT")) && selectedDate <= new Date(Date.parse('01/01/2016' + " " + timeArray[6], "mm/d/yyyy h:mm TT"))) {
                    $scope.hotDeskTimeFrame = [{
                        seqNo: 1,
                        duration: '4 hrs',
                        number: 4
                    }, {
                        seqNo: 2,
                        duration: '5 hrs',
                        number: 5
                    }, {
                        seqNo: 3,
                        duration: '6 hrs',
                        number: 6
                    }, {
                        seqNo: 4,
                        duration: '7 hrs',
                        number: 7
                    }];
                }
                if (selectedDate <= new Date(Date.parse('01/01/2016' + " " + timeArray[8], "mm/d/yyyy h:mm TT"))) {
                    $scope.hotDeskTimeFrame = [{
                        seqNo: 1,
                        duration: '4 hrs',
                        number: 4
                    }, {
                        seqNo: 2,
                        duration: '5 hrs',
                        number: 5
                    }, {
                        seqNo: 3,
                        duration: '6 hrs',
                        number: 6
                    }, {
                        seqNo: 4,
                        duration: '7 hrs',
                        number: 7
                    }, {
                        seqNo: 5,
                        duration: '8 hrs',
                        number: 8
                    }];
                }

                // if(selectedDate > new Date(Date.parse('01/01/2016'+" " + timeArray[0], "mm/d/yyyy h:mm TT"))) {
                //  flash.setMessage(MESSAGES.DURATION_ERROR,MESSAGES.ERROR);
                // }
            }

            /*$timeout(function() {
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
                }
                else {
                    $(".roomTypeDropdown").remove();
                }

            })*/

        }

        /*******************************************************
         ********* Training Room and Hot Desk Booking **********
         ******************************************************/

        $scope.hideEndTimeBox = false;
        $scope.gPlace;

        /*$scope.init = function() {
            $timeout(function() {
                $("#fromDate").datepicker({
                    minDate : 0
                });
                $("#endDate").datepicker({
                    minDate : 0
                });
            });
        };*/

        $scope.hotDesk = {};
        $scope.meetingRoom = {};
        $scope.boardRoom = {};
        $scope.trainingRoom = {};
        $scope.virtualOffice = {};
        $scope.plugnplay = {};

        $scope.incExcObj = {};

        $scope.timeSet = [{
            data: '12:00 AM'
        }, {
            data: '12:30 AM'
        }, {
            data: '01:00 AM'
        }, {
            data: '01:30 AM'
        }, {
            data: '02:00 AM'
        }, {
            data: '02:30 AM'
        }, {
            data: '03:00 AM'
        }, {
            data: '03:30 AM'
        }, {
            data: '04:00 AM'
        }, {
            data: '04:30 AM'
        }, {
            data: '05:00 AM'
        }, {
            data: '05:30 AM'
        }, {
            data: '06:00 AM'
        }, {
            data: '06:30 AM'
        }, {
            data: '07:00 AM'
        }, {
            data: '07:30 AM'
        }, {
            data: '08:00 AM'
        }, {
            data: '08:30 AM'
        }, {
            data: '09:00 AM'
        }, {
            data: '09:30 AM'
        }, {
            data: '10:00 AM'
        }, {
            data: '10:30 AM'
        }, {
            data: '11:00 AM'
        }, {
            data: '11:30 AM'
        }, {
            data: '12:00 PM'
        }, {
            data: '12:30 PM'
        }, {
            data: '01:00 PM'
        }, {
            data: '01:30 PM'
        }, {
            data: '02:00 PM'
        }, {
            data: '02:30 PM'
        }, {
            data: '03:00 PM'
        }, {
            data: '03:30 PM'
        }, {
            data: '04:00 PM'
        }, {
            data: '04:30 PM'
        }, {
            data: '05:00 PM'
        }, {
            data: '05:30 PM'
        }, {
            data: '06:00 PM'
        }, {
            data: '06:30 PM'
        }, {
            data: '07:00 PM'
        }, {
            data: '07:30 PM'
        }, {
            data: '08:00 PM'
        }, {
            data: '08:30 PM'
        }, {
            data: '09:00 PM'
        }, {
            data: '09:30 PM'
        }, {
            data: '10:00 PM'
        }, {
            data: '10:30 PM'
        }, {
            data: '11:00 PM'
        }, {
            data: '11:30 PM'
        }];

        $scope.endTimeSet = $scope.timeSet;

        $scope.timeTypes = [{
            data: 'Hourly'
        }, {
            data: 'Half Day'
        }, {
            data: 'Full Day'
        }];

        $scope.trainingTimeTypes = [{
            data: 'Half Day'
        }, {
            data: 'Full Day'
        }];

        $scope.occupancyRange = [{
            range: '01 - 10'
        }, {
            range: '11 - 20'
        }, {
            range: '21 - 30'
        }, {
            range: '31 - 40'
        }, {
            range: '41 - 50'
        }];

        $scope.hotDeskCapacity = [{
            data: '01'
        }, {
            data: '02'
        }, {
            data: '03'
        }, {
            data: '04'
        }, {
            data: '05'
        }, {
            data: '06'
        }, {
            data: '07'
        }, {
            data: '08'
        }, {
            data: '09'
        }, {
            data: '10'
        }];
        /*{data : '11'}, {data: '12'}, {data : '13'}, {data: '14'}, {data: '15'}, {data : '16'}, {data: '17'}, {data: '18'}, {data : '19'}, {data: '20'},
        {data : '21'}, {data: '22'}, {data : '23'}, {data: '24'}, {data: '25'}, {data : '26'}, {data: '27'}, {data: '28'}, {data : '29'}, {data: '30'},
        {data : '31'}, {data: '32'}, {data : '33'}, {data: '34'}, {data: '35'}, {data : '36'}, {data: '37'}, {data: '38'}, {data : '39'}, {data: '40'},
        {data : '41'}, {data: '42'}, {data : '43'}, {data: '44'}, {data: '45'}, {data : '46'}, {data: '47'}, {data: '48'}, {data : '49'}, {data: '50'}];*/

        $scope.sessions = [{
            seqNo: 1,
            duration: '1st Half (9:00 A.M - 1:00 P.M)',
            durationType: 'Half Day',
            startTime: '09:00 AM',
            number: 4
        }, {
            seqNo: 2,
            duration: '2nd Half (2:00 P.M - 6:00 P.M)',
            durationType: 'Half Day',
            startTime: '02:00 PM',
            number: 4
        }, {
            seqNo: 3,
            duration: 'Full Day (9:00 A.M - 6:00 P.M)',
            durationType: 'Full Day',
            startTime: '09:00 AM',
            number: 8
        }];

        /*$scope.hotDeskTimeFrame = [{
            seqNo : 1,
            duration : '4 hrs',
            number : 4
        }, {
            seqNo : 2,
            duration : '5 hrs',
            number : 5
        }, {
            seqNo : 3,
            duration : '6 hrs',
            number : 6
        }, {
            seqNo : 4,
            duration : '7 hrs',
            number : 7
        }, {
            seqNo : 5,
            duration : '8 hrs',
            number : 8
        }];*/

        //validation for time
        $scope.setEndTimeList = function(room) {
            var index;
            for (var i = 0; i < $scope.timeSet.length; i++) {
                if (room.startTime === $scope.timeSet[i].data) {
                    index = i;
                    break;
                }
            }
            $scope.endTimeSet = [];
            for (var j = index + 2; j < $scope.timeSet.length; j++) {
                $scope.endTimeSet.push($scope.timeSet[j]);
            }
        };

        $scope.hideEndTime = function(roomObj) {
            $scope.endTimeSet = $scope.timeSet;
            $scope.timeType = roomObj.timeType;
            delete roomObj.startTime;
            delete roomObj.endTime;
            if (roomObj.timeType === 'Half Day') {
                $scope.hideEndTimeBox = true;
            } else if (roomObj.timeType === 'Full Day') {
                $scope.hideEndTimeBox = true;
            } else {
                $scope.hideEndTimeBox = false;
            }
        };

        $scope.setEndTimeForHalfFullDay = function(room) {
            for (var i = 0; i < $scope.sessions.length; i++) {
                if (room.duration == $scope.sessions[i].seqNo) {
                    $rootScope.trainingSession = $scope.sessions[i];
                    var sessionObj = $scope.sessions[i];
                    room.endTime = $scope.setEndTime(sessionObj);
                }
            }
        };

        $scope.setEndTime = function(room) {
            if (room.durationType === 'Half Day') {
                for (var i = 0; i < $scope.timeSet.length; i++) {
                    if ($scope.timeSet[i].data === room.startTime) {
                        if (i > 40) {
                            room.endTime = $scope.timeSet[i % 40].data;
                        } else {
                            room.endTime = $scope.timeSet[i + 8].data;
                        }
                    }
                }
            } else if (room.durationType === 'Full Day') {
                for (var i = 0; i < $scope.timeSet.length; i++) {
                    if ($scope.timeSet[i].data === room.startTime) {
                        if (i > 40) {
                            room.endTime = $scope.timeSet[(i % 40) + 9].data;
                        } else {
                            room.endTime = $scope.timeSet[i + 18].data;
                        }
                    }
                }
            } else {
            }
            $scope.sessionTime = {
                startTime: room.startTime,
                endTime: room.endTime
            }
            return room.endTime;
        };

        $scope.setEndTimeBasedOnTimeFrameHD = function(room) {
            for (var i = 0; i < $scope.hotDeskTimeFrame.length; i++) {
                if (room.duration == $scope.hotDeskTimeFrame[i].seqNo) {
                    $scope.sessionObj = $scope.hotDeskTimeFrame[i];
                    $rootScope.sessionObj = $scope.sessionObj;
                }
            }
        };

        $scope.setEndTimeForHotDeskBasedOnTimeFrame = function(room) {
            $scope.sessionTime = {};
            var setTime = $scope.sessionObj.number;
            var position = 0;
            var indexPosition = room.startTime[position];
            indexPosition = parseInt(indexPosition);
            if (indexPosition > 1 || room.startTime[position + 1] === ':') {
                room.startTime = [room.startTime.slice(0, position), '0', room.startTime.slice(position)].join('');
            }

            for (var i = 0; i < $scope.timeSet.length; i++) {
                if ($scope.timeSet[i].data === room.startTime) {
                    if (i > 40) {
                        room.endTime = $scope.timeSet[i % 40].data;
                    } else {
                        room.endTime = $scope.timeSet[i + (2 * setTime)].data;
                    }
                    if ((i + setTime) > 40) {
                        $scope.sessionTime.isEndTime = true;
                    }
                }
            }

            $scope.sessionTime.startTime = room.startTime,
                $scope.sessionTime.endTime = room.endTime

            return room.endTime;
        }

        $scope.endTimeExceedCheck = function(roomObj) {
            var isEndTimeExceeding = false;
            if ($scope.sessionTime.isEndTime) {
                isEndTimeExceeding = true;
            }
            return isEndTimeExceeding;
        }

        $scope.hotdeskTime = function(dateString) {
            var d = new Date("01 Jan 2016," + dateString);
            var hh = d.getHours();
            var m = d.getMinutes();
            var s = d.getSeconds();
            var dd = "AM";
            var h = hh;
            if (h >= 12) {
                h = hh - 12;
                dd = "PM";
            }
            if (h == 0) {
                h = 12;
            }
            m = m < 10 ? "0" + m : m;
            s = s < 10 ? "0" + s : s;
            h = h < 10 ? "0" + h : h;

            var pattern = new RegExp("0?" + hh + ":" + m + ":" + s);

            var replacement = h + ":" + m;
            replacement += " " + dd;
            return replacement;
        }

        $rootScope.isTrainingRoomList = false;
        $scope.searchService = function(searchElement) {
            $rootScope.searchServiceObj = searchElement;
            if ($scope.searchElements.roomType == SEARCH.CONSTANT.TRAINING_ROOM) {
                var search = new SearchService.search(searchElement);
                search.$save({
                    perPage: 6,
                    page: 0
                }, function(searchedList) {
                    if (!angular.isUndefined(searchedList.rooms)) {
                        $scope.searchedList = searchedList.rooms;
                        $rootScope.isTrainingRoomList = true;
                        $scope.changeRoomForTrainingRoom();
                        if ($scope.searchedList.length > 0) {} else {
                            flash.setMessage(MESSAGES.ROOM_NOT_FOUND, MESSAGES.ERROR);
                        }
                    } else {
                        flash.setMessage(MESSAGES.ROOM_NOT_FOUND, MESSAGES.ERROR);
                    }
                }, function(error) {
                });
            } else if ($scope.searchElements.roomType == SEARCH.CONSTANT.HOT_DESK) {
                var search = new SearchService.searchEventCalendarHotDesk(searchElement);
                search.$save({
                    perPage: 6,
                    page: 0
                }, function(searchedList) {
                    if (!angular.isUndefined(searchedList.rooms)) {
                        $scope.searchedList = searchedList.rooms;
                        $rootScope.isTrainingRoomList = true;
                        $scope.changeRoomForHotDesk();
                        if ($scope.searchedList.length > 0) {} else {
                            flash.setMessage(MESSAGES.ROOM_NOT_FOUND, MESSAGES.ERROR);
                        }
                    } else {
                        flash.setMessage(MESSAGES.ROOM_NOT_FOUND, MESSAGES.ERROR);
                    }
                }, function(error) {
                });
            }
        }

        $scope.getLatitudeLongitude = function(address) {
            /*// If adress is not supplied, use default value 'Ferrol, Galicia, Spain'
            address = address || 'Bangalore';
            // Initialize the Geocoder
            var geocoder = new google.maps.Geocoder();
            if (geocoder) {
                geocoder.geocode({
                    'address': address
                }, function(results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                    }
                    $scope.searchElements.lon = results[0].geometry.location.lng();
                    $scope.searchElements.lat = results[0].geometry.location.lat();
                    $rootScope.searchObj = angular.copy($scope.searchElements);

                    $scope.searchElements.place = address;
                    $scope.searchElements.timeZoneOffset = new Date().getTimezoneOffset();
                    $scope.searchService($scope.searchElements);
                });
            }*/
        	
            $scope.searchElements.lon = $scope.spaceObject.loc[0];
            $scope.searchElements.lat = $scope.spaceObject.loc[1];
            $rootScope.searchObj = angular.copy($scope.searchElements);

            $scope.searchElements.place = address;
            $scope.searchElements.spaceId = $scope.spaceObject._id;
            $scope.searchElements.timeZoneOffset = new Date().getTimezoneOffset();
            $scope.searchService($scope.searchElements);
        };

        $scope.defineSearchObject = function(roomObj, roomType) {
            if (SEARCH.CONSTANT.TRAINING_ROOM === roomType) {
                var roomcapacity = {
                    min: parseInt(roomObj.capacity.split(' ')[0]),
                    max: 50
                }
                $scope.searchElements.capacity = roomcapacity;
                $scope.searchElements.roomType = SEARCH.CONSTANT.TRAINING_ROOM;
            } else if (SEARCH.CONSTANT.HOT_DESK === roomType) {
                var roomcapacity = {
                    min: 1,
                    max: parseInt(roomObj.capacity)
                }
                $scope.searchElements.capacity = roomcapacity;
                $scope.searchElements.roomType = SEARCH.CONSTANT.HOT_DESK;
            }
        };

        /**
         * Search Training Room
         */
        $scope.searchTrainingRoom = function(roomObj, roomType) {
            roomObj.address = $scope.spaceAddress;
            roomObj.startTime = $('#trainingroomcheckin').val();

            $scope.incExcObj.excludeSunday = calEventObj.excludeSunday;
            $scope.incExcObj.excludeHoliday = calEventObj.excludeHoliday;

            $scope.dateRangeStartDate = document.getElementsByClassName("trainingroomDateRange")[0].value.split('-')[0].trim();
            $scope.dateRangeEndDate = document.getElementsByClassName("trainingroomDateRange")[0].value.split('-')[1].trim();
            /*$scope.calculateDateRange();*/

            if (!angular.isUndefined(roomObj)) {
                /*roomObj.startTime = $('#trainingroomcheckin').val();*/
                roomObj.startTime = $scope.sessionTime.startTime;
                var strTime = roomObj.startTime;
                var AMChange = strTime.includes("AM");
                var PMChange = strTime.includes("PM");
                if (!AMChange || !PMChange) {
                    var AMPMTimeChange = $scope.hotdeskTime(roomObj.startTime);
                    roomObj.startTime = AMPMTimeChange;
                }
                if (roomObj.startTime) {
                    /*roomObj.endTime = $scope.setEndTimeHalfFullDay(roomObj);*/
                    roomObj.endTime = $scope.sessionTime.endTime;
                }

                /*roomObj.fromDate = document.getElementById("trainingfromDate").value;
                roomObj.endDate = document.getElementById("trainingendDate").value;*/
                roomObj.fromDate = $scope.dateRangeStartDate;
                roomObj.endDate = $scope.dateRangeEndDate;

                if ((roomObj.fromDate == "") || !roomObj.capacity || (roomObj.endDate == "") || (roomObj.startTime == "")) {
                    flash.setMessage(MESSAGES.ALL_FIELDS_REQUIRED, MESSAGES.ERROR);
                } else {

                    var selectedStartTime = roomObj.fromDate + " " + roomObj.startTime;
                    //var selectedStartTime = new Date(selectedStartTime);

                    var selectedEndTime = roomObj.endDate + " " + roomObj.endTime;
                    //var selectedEndTime = new Date(selectedEndTime);

                    $rootScope.dateObj = {
                        fromDate: selectedStartTime,
                        endDate: selectedEndTime,
                        sTime: roomObj.startTime,
                        etime: roomObj.endTime,
                        timeType: $scope.timeType,
                        roomType: SEARCH.CONSTANT.TRAINING_ROOM
                    };

                    /*var datesWithTime = $scope.dateArrayWithUTCTime($scope.filteredDate);*/

                    $scope.searchElements = {
                        place: roomObj.address,
                        stime: roomObj.startTime,
                        etime: roomObj.endTime,
                        fromDate: roomObj.fromDate,
                        endDate: roomObj.endDate,
                        excludeSunday: $scope.incExcObj.excludeSunday,
                        excludeHoliday: $scope.incExcObj.excludeHoliday,
                        fromToDates: $scope.filteredDate
                    };

                    $scope.defineSearchObject(roomObj, roomType);

                    $scope.getLatitudeLongitude(roomObj.address);

                }
            } else {
                flash.setMessage(MESSAGES.ALL_FIELDS_REQUIRED, MESSAGES.ERROR);
            }
        };

        /**
         * Search Hot Desk
         */
        $scope.searchHotDesk = function(roomObj, roomType) {
            roomObj.address = $scope.spaceAddress;

            $scope.incExcObj.excludeSunday = calEventObj.excludeSunday;
            $scope.incExcObj.excludeHoliday = calEventObj.excludeHoliday;

            $scope.dateRangeStartDate = document.getElementsByClassName("hotdeskDaterange")[0].value.split('-')[0].trim();
            $scope.dateRangeEndDate = document.getElementsByClassName("hotdeskDaterange")[0].value.split('-')[1].trim();
            /*$scope.calculateDateRange();*/

            if (!angular.isUndefined(roomObj)) {
                roomObj.startTime = $('#hotdeskcheckin').val();
                var strTime = roomObj.startTime;
                var AMChange = strTime.includes("AM");
                var PMChange = strTime.includes("PM");
                if (!AMChange || !PMChange) {
                    var AMPMTimeChange = $scope.hotdeskTime(roomObj.startTime);
                    roomObj.startTime = AMPMTimeChange;
                }
                $scope.sessionObj.startTime = roomObj.startTime;
                if (roomObj.startTime) {
                    roomObj.endTime = $scope.setEndTimeForHotDeskBasedOnTimeFrame(roomObj);
                }

                roomObj.fromDate = $scope.dateRangeStartDate;
                roomObj.endDate = $scope.dateRangeEndDate;

                if ((roomObj.date == "") || !roomObj.capacity || (roomObj.startTime == "") || (roomObj.endTime == "")) {
                    flash.setMessage(MESSAGES.ALL_FIELDS_REQUIRED, MESSAGES.ERROR);
                } else {
                    var isEndTimeExceeding = $scope.endTimeExceedCheck(roomObj);
                    if (isEndTimeExceeding) {
                        flash.setMessage(MESSAGES.EXCEEDING_END_TIME, MESSAGES.ERROR);
                    } else {
                        var selectedStartTime = roomObj.fromDate + " " + roomObj.startTime;
                        //var selectedStartTime = new Date(selectedStartTime);

                        var selectedEndTime = roomObj.endDate + " " + roomObj.endTime;
                        //var selectedEndTime = new Date(selectedEndTime);

                        $rootScope.dateObj = {
                            fromDate: selectedStartTime,
                            endDate: selectedEndTime,
                            sTime: roomObj.startTime,
                            etime: roomObj.endTime,
                            timeType: $scope.sessionObj.durationType,
                            roomType: SEARCH.CONSTANT.HOT_DESK
                        };

                        var datesWithTime;
                        /*datesWithTime = $scope.dateArrayWithUTCTime($scope.filteredDate, roomObj);*/

                        $scope.searchElements = {
                            place: roomObj.address,
                            stime: roomObj.startTime,
                            etime: roomObj.endTime,
                            fromDate: roomObj.fromDate,
                            endDate: roomObj.endDate,
                            excludeSunday: $scope.incExcObj.excludeSunday,
                            excludeHoliday: $scope.incExcObj.excludeHoliday,
                            fromToDates: datesWithTime
                        };

                        $scope.defineSearchObject(roomObj, roomType);

                        $scope.getLatitudeLongitude(roomObj.address);
                    }
                }
            } else {
                flash.setMessage(MESSAGES.ALL_FIELDS_REQUIRED, MESSAGES.ERROR);
            }
        };

        $scope.changeRoomForTrainingRoom = function() {
            var id;
            for (var i = 0; i < $scope.roomTypes.length; i++) {
                if ($scope.roomTypes[i].name.match(/training/i)) {
                    id = $scope.roomTypes[i]._id;
                }
            }
            $scope.fetchTrainingRoomObject(id);
            //$scope.loadBookedTrainingRoomSchedule(id);
        };

        $scope.changeRoomForHotDesk = function() {
            var id;
            for (var i = 0; i < $scope.roomTypes.length; i++) {
                if ($scope.roomTypes[i].name.match(/hot/i)) {
                    id = $scope.roomTypes[i]._id;
                }
            }
            $scope.fetchTrainingRoomObject(id);
        };

        $scope.fetchTrainingRoomObject = function(roomTypeRoom) {
            for (var i = 0; i < $scope.searchedList.length; i++) {
                $scope.loadBookedTrainingRoomSchedule($scope.searchedList[i]._id);
            }
        };

        $scope.bookings = [];
        $scope.loadBookedTrainingRoomSchedule = function(roomBooked) {
            $scope.user = MeanUser.user._id;
            BookingTrainingService.loadTrainingRoomBookingByBackOffice.query({
                trainingRoomId: roomBooked,
                backOfficeId: $scope.user
            }, function(response) {
                $scope.bookedRoom = response;
                for (var i = 0; i < $scope.bookedRoom.length; i++) {
                    $scope.bookings.push($scope.bookedRoom[i]);
                }
            });
        };

        $scope.calculatePriceAfterCommission = function(requiredRoomType, bookedPartner, bookingPrice) {
            var roomCommission = bookedPartner.commissionPercentage;
            BookingService.loadRequredRoomType.query({
                    'RoomType': requiredRoomType,
                    'logUserPartner': bookedPartner._id
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

        $scope.redirectAttendee = function(booking, urlPath) {
            urlPath = urlPath.replace(":bookingId", booking._id);
            $location.path(urlPath);
        };

        $rootScope.scheduleList = [];
        $scope.loadSchedulesForTrainingRoom = function(roomId) {
            $rootScope.selectedFromDate = $scope.searchElements.fromDate;
            $rootScope.selectedEndDate = $scope.searchElements.endDate;
            $rootScope.start = $scope.searchElements.stime;
            $rootScope.end = $scope.searchElements.etime;
            
            $rootScope.selectFromDate = $scope.searchElements.fromDate + " " + $scope.searchElements.stime;
            $rootScope.selectEndDate = $scope.searchElements.endDate + " " + $scope.searchElements.etime;
			
            $scope.backOfficeBooking = {
                selectedFromDate: $rootScope.selectedFromDate,
                selectedEndDate: $rootScope.selectedEndDate,
                bookingStartTime: $rootScope.start,
                bookingEndTime: $rootScope.end
            };
            BookingTrainingService.loadRoomSchedule.query({
                'roomId': roomId,
                'selectFromDate': $rootScope.selectFromDate,
                'selectEndDate': $rootScope.selectEndDate
            }, function(response) {
            	console.log('---------');
            	console.log(response);
                $rootScope.schedule = response;
                $scope.scheduleSpliceIndexArray = [];
                $scope.scheduleIndexArray = [];
                for (var i = 0; i < $rootScope.schedule.length; i++) {
                    if ($rootScope.schedule[i].currentAval.length === 0) {
                        $scope.scheduleSpliceIndexArray.push($rootScope.schedule[i]);
                    } else {
                        $scope.scheduleIndexArray.push($rootScope.schedule[i]);
                        $rootScope.scheduleList.push($rootScope.schedule[i]);
                    }
                }
                $rootScope.schedule = $scope.scheduleIndexArray;
            }, function(error) {
            });
        };

        $scope.loadTrainingRoomResources = function(roomObj) {
            var found = false,
                index = 0;
            var capacity = parseInt($scope.searchElements.capacity.max);

            for (var i = 0; i < $scope.searchedList.length; i++) {
                if (roomObj._id === $scope.searchedList[i]._id) {
                    found = true;
                    index = i;
                    $rootScope.matchedRoom = $scope.searchedList[i];
                    $scope.modalPopupTrainingRoomBooking($scope.searchElements.stime, $scope.searchElements.etime, $scope.searchedList[i]);
                    break;
                }
            }
            if (found) {
                /*for (var i = 0; i < capacity; i++) { 			// here 'capacity' and '$scope.searchedList.length' will be same
                    $scope.loadSchedulesForTrainingRoom($scope.searchedList[index].relatedHotDeskIds[i]);
                }*/
                $scope.loadSchedulesForTrainingRoom($scope.searchedList[index]._id);
            }
        };

        $scope.bookTrainingRoom = function(roomObj) {
            $rootScope.roomObj = roomObj;
            $rootScope.selectFromDate = $rootScope.searchServiceObj.fromDate + " " + $rootScope.searchServiceObj.stime;
            $rootScope.selectEndDate = $rootScope.searchServiceObj.endDate + " " + $rootScope.searchServiceObj.etime;

            $scope.loadTrainingRoomResources(roomObj);
            $scope.calculatePrice();
        };

        $scope.calculatePrice = function() {
            var startTime = $rootScope.start.split(" ");
            var startMeridiem = startTime[1];
            var stime = startTime[0].split(":");
            var sTimeHrs = parseInt(stime[0]);
            var sTimeMins = parseInt(stime[1]);

            var endTime = $rootScope.end.split(" ");
            var endMeridiem = endTime[1];
            var etime = endTime[0].split(":");
            var eTimeHrs = parseInt(etime[0]);
            var eTimeMins = parseInt(etime[1]);

            // Calculating hrs
            if (startMeridiem == "PM" && sTimeHrs != '12') {
                sTimeHrs = sTimeHrs + 12;
            }
            if (endMeridiem == "PM" && eTimeHrs != '12') {
                eTimeHrs = eTimeHrs + 12;
            }

            $rootScope.totalHoursBooked = $scope.dateDifference($rootScope.selectFromDate, $rootScope.selectEndDate);
            $rootScope.totalDays = $rootScope.totalHoursBooked;
            
            // Calculating mins
            if ((eTimeMins - sTimeMins) > 0) {
            	if((eTimeHrs - sTimeHrs) == 4 || (eTimeHrs - sTimeHrs) == 8){
            		$rootScope.isPerHour = false;
            		//$rootScope.totalHoursBooked = $rootScope.totalHoursBooked;
            	} else {
            		$rootScope.isPerHour = true;
                    $rootScope.totalHoursBooked = (eTimeHrs - sTimeHrs + 0.5) * $rootScope.totalHoursBooked;
            	}
            } else if ((eTimeMins - sTimeMins) < 0) {
            	if((eTimeHrs - sTimeHrs) == 4 || (eTimeHrs - sTimeHrs) == 8){
            		$rootScope.isPerHour = false;
            		//$rootScope.totalHoursBooked = $rootScope.totalHoursBooked;
            	} else {
            		$rootScope.isPerHour = true;
            		$rootScope.totalHoursBooked = (eTimeHrs - sTimeHrs - 0.5) * $rootScope.totalHoursBooked;
            	}
            } else {
            	if((eTimeHrs - sTimeHrs) == 4 || (eTimeHrs - sTimeHrs) == 8){
            		$rootScope.isPerHour = false;
            		//$rootScope.totalHoursBooked = $rootScope.totalHoursBooked;
            	} else {
            		$rootScope.isPerHour = true;
            		$rootScope.totalHoursBooked = (eTimeHrs - sTimeHrs) * $rootScope.totalHoursBooked;
            	}
            }
        };

        $scope.dateDifference = function(fromDate, toDate) {
            var date1 = new Date(fromDate);
            var date2 = new Date(toDate);
            var timeDiff = Math.abs(date2.getTime() - date1.getTime());
            var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
            return diffDays;
        }

        $scope.timeTypeRequired = null;
        $scope.calculateServiceTaxDateRange = function(price) {
            $scope.totalPricePerHour = price * $rootScope.totalHoursBooked;
            $scope.discount = $scope.totalPricePerHour - 0;
            $scope.servicetax = $scope.discount * ($scope.serviceTax_value / 100);
            //$scope.servicetax = $scope.discount * (15 / 100);
            $scope.totalPrice = $scope.discount + $scope.servicetax;
        };

        $scope.calculateServiceTaxDateRangeHotDesk = function(price) {
            $scope.totalPricePerHour = price * $rootScope.totalHoursBooked;
            $scope.discount = $scope.totalPricePerHour - 0;
            $scope.servicetax = $scope.discount * ($scope.serviceTax_value / 100);
            //$scope.servicetax = $scope.discount * (15 / 100);
            $scope.totalPrice = $scope.discount + $scope.servicetax;

            /*$rootScope.priceReqired = price;
        $scope.totalPricePerHour = price * $scope.totalHours;
        $scope.totalPricePerHourAmt = $scope.totalPricePerHour;
        $scope.discount = $scope.totalPricePerHour - 0;
        $scope.servicetax = $scope.discount * (15/100);
        $scope.totalPrice = $scope.discount + $scope.servicetax;*/
        };

        $scope.submitTrainingRoom = function(requiredRoomResource, bookingForm, schedule, backOfficeBooking) {
            /*if($scope.timeTypeRequired != null && bookingForm.$valid){*/
            if (bookingForm.$valid) {
                RoomService.fetchPartnerForRoom.get({
                    userId: $rootScope.matchedRoom.partner
                }, function(partnerObj) {
                    requiredRoomResource.partner = partnerObj;
                    RoomService.getroomtypename.get({
                        roomTypeId: $rootScope.matchedRoom.roomtype
                    }, function(roomTypeObj) {
                        requiredRoomResource.roomtype = roomTypeObj;

                        $scope.submitTrainingRoomOrHotDesk(requiredRoomResource, bookingForm, schedule, backOfficeBooking);
                    }, function(err) {
                    });
                }, function(err) {
                });
            } else {
                $scope.submitted = true;
            }
        }

        $scope.submitTrainingRoomOrHotDesk = function(requiredRoomResource, bookingForm, schedule, backOfficeBooking) {
            $rootScope.backOfficeBooking = {};
            BookingService.loadUserBasedOnEmail.get({
                'userId': backOfficeBooking.email
            }, function(response) {
                if (response._id == undefined) {
                    $rootScope.guest = {};
                    $rootScope.guest.first_name = backOfficeBooking.name;
                    $rootScope.guest.email = backOfficeBooking.email;
                    $rootScope.guest.phone = backOfficeBooking.phone;
                    $rootScope.backOfficeBooking.guest = $rootScope.guest;
                    $rootScope.backOfficeBooking.user = undefined;
                } else {
                    $rootScope.requiredUserId = response._id;
                    $rootScope.backOfficeBooking.user = $rootScope.requiredUserId;
                }

                $rootScope.backOfficeBooking.address = backOfficeBooking.address;
                $rootScope.backOfficeBooking.room = requiredRoomResource;
                $rootScope.backOfficeBooking.space = requiredRoomResource.spaceId;
                $rootScope.backOfficeBooking.partner = requiredRoomResource.partner;
                $rootScope.backOfficeBooking.user = $rootScope.requiredUserId;
                $rootScope.backOfficeBooking.scheduleTraining = schedule;
                $rootScope.backOfficeBooking.bookingStartTime = $rootScope.start;
                $rootScope.backOfficeBooking.bookingEndTime = $rootScope.end;
                $rootScope.backOfficeBooking.fromDate = $rootScope.selectedFromDate;
                $rootScope.backOfficeBooking.endDate = $rootScope.selectedEndDate;
                $rootScope.backOfficeBooking.timeZoneOffset = $rootScope.searchServiceObj.timeZoneOffset;
                //$rootScope.backOfficeBooking.bookingDate = $rootScope.selectedDate;

                $rootScope.backOfficeBooking.price = $scope.totalPrice;
                $rootScope.backOfficeBooking.priceWithoutTax = $scope.totalPricePerHour;
                $rootScope.backOfficeBooking.totalHours = $rootScope.totalHoursBooked;
                $rootScope.backOfficeBooking.no_of_days = $rootScope.totalDays;
                $rootScope.backOfficeBooking.status = 'Confirmed';
                $rootScope.backOfficeBooking.feature = 'Event Calendar';

                var bookingStartOne = new Date($rootScope.start);
                var starttimehours = bookingStartOne.getHours();
                var starttimeminutes = bookingStartOne.getMinutes();
                var bookingStartTimeNumber = starttimehours * 60 + starttimeminutes;

                var bookingEndOne = new Date($rootScope.end);
                var endtimehours = bookingEndOne.getHours();
                var endtimeminutes = bookingEndOne.getMinutes();
                var bookingEndTimeNumber = endtimehours * 60 + endtimeminutes;

                $rootScope.backOfficeBooking.bookingStartTimeNumber = bookingStartTimeNumber;
                $rootScope.backOfficeBooking.bookingEndTimeNumber = bookingEndTimeNumber;

                if ($rootScope.searchServiceObj.roomType == SEARCH.CONSTANT.TRAINING_ROOM) {
                    var booking = new BookingTrainingService.createBookingBackOffice($rootScope.backOfficeBooking);
                    booking.$save({
                        scheduleId: schedule._id
                    }, function(backoffice) {
                        $scope.modalPopupSuccess(backoffice);
                        $rootScope.backOfficeBooking = {};
                    }, function(error) {
        				$scope.error = error;
        				if($scope.error.data.ERRCODE && ($scope.error.data.ERRCODE === 1100)){
        					flash.setMessage($scope.error.data.ERRBOOKING, MESSAGES.ERROR);
        				}
        			});
                } else {
                    var booking = new BookingHotDeskService.createBookingBackOffice($rootScope.backOfficeBooking);
                    booking.$save({
                        scheduleId: schedule._id
                    }, function(backoffice) {
                        $scope.modalPopupSuccess(backoffice);
                        $rootScope.backOfficeBooking = {};
                    }, function(error) {
                    	console.log(error);
                        $scope.error = error;
                        if($scope.error.data.ERRCODE && ($scope.error.data.ERRCODE === 1100)){
        					flash.setMessage($scope.error.data.ERRBOOKING, MESSAGES.ERROR);
        				}
                    });
                }

            });
            //$uibModal.close($scope.backOfficeBooking);

        };

        $scope.sessionsArray = $scope.sessions;

        $scope.durationDisabled = false;

        $scope.trainingRoomDuration = function() {
            $scope.durationDisabled = false;
            $scope.sessions = $scope.sessionsArray;
            $scope.trainingRoomStartDate = new Date(document.getElementsByClassName("trainingroomDateRange")[0].value.split('-')[0].trim());
            $scope.nowDate = new Date();

            if ($scope.trainingRoomStartDate.setHours(0, 0, 0, 0) == $scope.nowDate.setHours(0, 0, 0, 0)) {
                var newDate = new Date();
                var firstSessionDate = new Date(new Date().setHours(8)).setMinutes(30, 0, 0);
                var secondSessionDate = new Date(new Date().setHours(13)).setMinutes(30, 0, 0);
                if (newDate >= new Date(firstSessionDate)) {
                    $scope.sessions = [{
                        seqNo: 2,
                        duration: '2nd Half (2:00 P.M - 6:00 P.M)',
                        durationType: 'Half Day',
                        startTime: '02:00 PM',
                        active: 'true',
                        number: 4
                    }];
                }

                if ((newDate > new Date(firstSessionDate)) && (newDate < new Date(secondSessionDate))) {
                    $scope.sessions = [];
                    $scope.sessions = [{
                        seqNo: 2,
                        duration: '2nd Half (2:00 P.M - 6:00 P.M)',
                        durationType: 'Half Day',
                        startTime: '02:00 PM',
                        active: 'true',
                        number: 4
                    }];
                }

                if (newDate >= new Date(secondSessionDate)) {
                    $scope.sessions = [];
                    $scope.durationDisabled = true;
                }
            } else {
                $scope.sessions = [{
                    seqNo: 1,
                    duration: '1st Half (9:00 A.M - 1:00 P.M)',
                    durationType: 'Half Day',
                    startTime: '09:00 AM',
                    active: 'true',
                    number: 4
                }, {
                    seqNo: 2,
                    duration: '2nd Half (2:00 P.M - 6:00 P.M)',
                    durationType: 'Half Day',
                    startTime: '02:00 PM',
                    active: 'true',
                    number: 4
                }, {
                    seqNo: 3,
                    duration: 'Full Day (9:00 A.M - 6:00 P.M)',
                    durationType: 'Full Day',
                    startTime: '09:00 AM',
                    active: 'true',
                    number: 8
                }];
                $scope.durationDisabled = false;
            }
        };

        $scope.durationError = function() {
            if ($scope.durationDisabled) {
                flash.setMessage(MESSAGES.DURATION_ERROR, MESSAGES.ERROR);
            }
        };

        $scope.initTime = function(roomType) {
            $('#datepairMeetingroom .start').timepicker('remove');
            $('#datepairMeetingroom .end').timepicker('remove');
            $('#datepairMeetingroom .start').val('');
            $('#datepairMeetingroom .end').val('');

            function roundMinutes(formatDate) {
                formatDate.setHours(formatDate.getHours() + Math.round(formatDate.getMinutes() / 60));
                formatDate.setMinutes(0);
                return formatDate;
            }
            if (roomType == 'meetingRoom') {
                var selectedDate = new Date(document.getElementById("meetingRoomDate").value);
            }
            if (roomType == 'boardRoom') {
                var selectedDate = new Date(document.getElementById("boardRoomDate").value);
            }
            var todayDate = new Date();
            if ((roomType == 'meetingRoom' || roomType == 'boardRoom') && selectedDate.setHours(0, 0, 0, 0) == todayDate.setHours(0, 0, 0, 0)) {
                var dateNow = new Date();

                var hours = dateNow.getHours();
                var minutes = dateNow.getMinutes();
                if (minutes < 30) {
                    var date = new Date(2016, 1, 1, hours, minutes);
                    var roundTime = roundMinutes(date);
                    roundTime = new Date(roundTime.setHours(roundTime.getHours() + 1));
                } else {
                    var roundTime = new Date();
                    roundTime = new Date(roundTime.setHours(roundTime.getHours() + 2));
                    var hours = roundTime.getHours();
                    var minutes = roundTime.getMinutes();
                    var dateGt = new Date(2016, 1, 1, hours, minutes);
                    roundTime.setHours(roundTime.getHours() + Math.floor(roundTime.getMinutes() / 60));
                    roundTime.setMinutes(0);
                }
                var hours = roundTime.getHours();
                var minutes = roundTime.getMinutes();
                var ampm = hours >= 12 ? 'PM' : 'AM';
                hours = hours % 12;
                hours = hours ? hours : 12;
                minutes = minutes < 10 ? '0' + minutes : minutes;
                var strTime = hours + ':' + minutes + ' ' + ampm;
                $('#datepairMeetingroom .start').timepicker('remove');
                $('#datepairMeetingroom .end').prop('disabled', true);
                $('#datepairMeetingroom .end').css({
                    "cursor": "not-allowed"
                });
                // $('#datepairMeetingroom .start').timepicker('setTime', roundTime);
                $('#datepairMeetingroom .start').timepicker({
                    'minTime': strTime,
                    'timeFormat': 'h:i A'
                });
                $('#datepairMeetingroom .start').on("change", function() {
                    $('#datepairMeetingroom .end').val('');
                    var startTimeOn = $('.start').val();
                    var temp = "01/01/2016" + " " + startTimeOn;
                    // var dateCon = new Date(temp).getHours()+1;
                    var dateCon = new Date(temp);
                    var hours = dateCon.getHours() + 1;
                    var minutes = dateCon.getMinutes();
                    var ampm = hours >= 12 ? 'PM' : 'AM';
                    hours = hours % 12;
                    hours = hours ? hours : 12;
                    minutes = minutes < 10 ? '0' + minutes : minutes;
                    var strToTime = hours + ':' + minutes + ' ' + ampm;
                    $('#datepairMeetingroom .end').prop('disabled', false);
                    $('#datepairMeetingroom .end').css({
                        "cursor": "default"
                    });
                    $('#datepairMeetingroom .end').timepicker('remove');
                    $('#datepairMeetingroom .end').timepicker({
                        'minTime': strToTime,
                        'durationTime': startTimeOn,
                        'maxTime': '11:30 PM',
                        'showDuration': true,
                        'step': 60,
                        'timeFormat': 'h:i A'
                    });
                });
            } else {
                var strTime = new Date();
                $('#datepairMeetingroom .end').prop('disabled', true);
                $('#datepairMeetingroom .end').timepicker('remove');
                $('#datepairMeetingroom .end').css({
                    "cursor": "not-allowed"
                });
                $('#datepairMeetingroom .start').timepicker('remove');
                $('#datepairMeetingroom .start').timepicker({
                    'scrollDefault': '07:30 AM',
                    'minTime': '12:00 AM',
                    'timeFormat': 'h:i A'
                });
                // $('#datepairMeetingroom .start').timepicker('option', { 'minTime': '7:00am', 'timeFormat': 'H:i' });
                $('#datepairMeetingroom .start').on("change", function() {
                    $('#datepairMeetingroom .end').val('');
                    var startTimeOn = $('.start').val();
                    var temp = "01/01/2016" + " " + startTimeOn;
                    var temp = new Date(temp);
                    var hours = temp.getHours() + 1;
                    var minutes = temp.getMinutes();
                    var ampm = hours >= 12 ? 'PM' : 'AM';
                    hours = hours % 12;
                    hours = hours ? hours : 12;
                    if (hours <= 9) {
                        hours = '0' + hours;
                    }
                    minutes = minutes < 10 ? '0' + minutes : minutes;
                    var strToTime = hours + ':' + minutes + ' ' + ampm;
                    $('#datepairMeetingroom .end').prop('disabled', false);
                    $('#datepairMeetingroom .end').css({
                        "cursor": "default"
                    });
                    $('#datepairMeetingroom .end').timepicker('remove');
                    $('#datepairMeetingroom .end').timepicker({
                        'minTime': strToTime,
                        'durationTime': startTimeOn,
                        'maxTime': '11:30 PM',
                        'showDuration': true,
                        'step': 60,
                        'timeFormat': 'h:i A'
                    });
                });
            }
            // $('#datepairMeetingroom').datepair();
            // var basicExampleEl = document.getElementById('datepairMeetingroom');
            // var datepair = new Datepair(basicExampleEl);
        };

        $('#datepairMeetingroom .start').prop('disabled', true);
        $('#datepairMeetingroom .start').css({
            "cursor": "not-allowed"
        });
        $('#datepairMeetingroom .end').prop('disabled', true);
        $('#datepairMeetingroom .end').css({
            "cursor": "not-allowed"
        });

        $('input[name="daterangeMeetingRoom"]').change(function() {
            $('#datepairMeetingroom .start').prop('disabled', false);
            $('#datepairMeetingroom .start').css({
                "cursor": "default"
            });
            $scope.initTime("meetingRoom");
        });

        $('input[name="daterangeBoardRoom"]').change(function() {
            $('#datepairMeetingroom .start').prop('disabled', false);
            $('#datepairMeetingroom .start').css({
                "cursor": "default"
            });
            $scope.initTime("boardRoom");
        });

        $('input[id="hotdeskdaterangeCal"]').change(function() {
            $('#datepairMeetingroom .start').prop('disabled', false);
            $('#datepairMeetingroom .start').css({
                "cursor": "default"
            });
            $scope.initTime();
        });

        $scope.resetTimeField = function() {
            $('#datepairMeetingroom .start').timepicker('remove');
            $('#datepairMeetingroom .end').timepicker('remove');
            $('#datepairMeetingroom .start').val('');
            $('#datepairMeetingroom .end').val('');
            $('#boardRoomDate').val('');
            $('#meetingRoomDate').val('');
        };

        $scope.onDateChangeTime = function(roomType) {
            $('#datepairMeetingroom .start').prop('disabled', false);
            $('#datepairMeetingroom .start').css({
                "cursor": "default"
            });
            $scope.initTime(roomType);

        };

        $(function() {
            window.addEventListener('popstate', function(event) {
                if ($(window).width() <= 415) {
                    $(".hideDivTag").hide();
                    $(".iconMenu").show();
                }
            });
        });

        $scope.redirectPage = function() {
            $(".hideDivTag").hide();
            $(".iconMenu").show();
        };

        //  Timepicker Initialize - Meeting Room.
        //  Variable:
        //  cinTime  : Check In Time
        //  coutTime : Check Out Time
        $scope.trainingRoomTimeUI = function() {
            var cinTime = $('#trainingroomcheckin');
            $(function() {
                $('#trainingroomcheckin').datetimepicker({
                    format: 'LT',
                    stepping: '30'
                });
            });
        };

        //  Timepicker Initialize - Hot Desk.
        //  Variable:
        //  cinTime  : Check In Time
        //  coutTime : Check Out Time
        $scope.hotDeskTimeUI = function() {
            /*var cinTime = $('#hotdeskcheckin');
            $(function () {
                $('#hotdeskcheckin').datetimepicker({
                    format: 'LT',
                    stepping: '30'
                });
            });*/
        };

        $timeout(function() {
            Calendar();
        }, 10000);
        
        $scope.spaceByRole = function(){
        	SpaceService.spaceByRole.query({
        		userId : MeanUser.user._id,
        		role : MeanUser.user.role[0].name
        	}, function(response){
        		$scope.spaceList = response;
        	}, function(err){
        	});
        }

    }
]);