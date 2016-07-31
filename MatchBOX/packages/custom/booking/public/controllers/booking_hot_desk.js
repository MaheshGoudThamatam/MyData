'use strict';

/* jshint -W098 */
angular.module('mean.booking').controller('BookingHotDeskController', ['$scope', 'Global','RoomService','BOOKING','$location','$stateParams','MeanUser','BookingHotDeskService','$rootScope','SpaceService','$interval',
  function($scope, Global,RoomService,BOOKING,$location,$stateParams,MeanUser,BookingHotDeskService,$rootScope,SpaceService,$interval) {
		$scope.global = Global;
		$scope.package = {
			name : 'booking'
		};
		hideBgImageAndFooter($rootScope);
		$scope.addAttendeeForm = [ {} ];
		$scope.BOOKING = BOOKING;
		flashmessageOn($rootScope, $scope,flash);
		if ($rootScope.searchObj) {
			$scope.searchObj = $rootScope.searchObj;
		}

		if ($rootScope.dateObj) {
			$scope.dateObj = $rootScope.dateObj;
		}
		
		$scope.findOneRoom = function() {
			var queryParams = $location.search();
			RoomService.roomdetails.get({
				roomId : $stateParams.roomId
			}, function(room) {
				$scope.room = room;
				$rootScope.roomsDetail = $scope.room;
				$rootScope.$emit('latLongForRoom');
				if(angular.isDefined($rootScope.hotDeskList)){
					$scope.hotDeskList = $rootScope.hotDeskList;
				}
				var hotDeskSeats = parseInt(queryParams.capacitymax);
				for(var i = 0; i < $scope.hotDeskList.length; i++){
					var hotDeskListIds = $scope.hotDeskList[i].relatedHotDeskIds;
					var counter = 0;
					for(var j = 0; j < hotDeskSeats; j++){
						counter++;
						$scope.loadSchedules(hotDeskListIds[j], hotDeskSeats, counter);
					}
				}
			});
		};

		$scope.serverTimeToLocal = function(timeString) {
			var serverdate = new Date(timeString);
			serverdate = new Date(serverdate.getTime() + (serverdate.getTimezoneOffset() * 60000));
			return serverdate;
		}

		$scope.localTimeToServer = function(timeDate) {
			timeDate = new Date(timeDate.getTime() - (timeDate.getTimezoneOffset() * 60000));
			return timeDate.toISOString();
		}

		$scope.bookNow = false;
		$scope.payBookNow = function(room, isAgreed) {
			var schedule = $scope.scheduleIndexArray; 
			$rootScope.booking = {};
			$rootScope.booking.room = room;
			$rootScope.booking.space = room.spaceId;
			$rootScope.booking.partner = room.spaceId.partner;
			$rootScope.booking.user = $rootScope.user;
			$rootScope.booking.isAgreed = isAgreed;
			$rootScope.booking.scheduleTraining = schedule;
			/*$rootScope.booking.bookingFrom = $scope.selectFromDate.toISOString().substr(0,10) + "T00:00:00.000Z";
			$rootScope.booking.bookingTo = $scope.selectEndDate.toISOString().substr(0,10) + "T00:00:00.000Z";*/
			$rootScope.booking.bookingStartTime = $scope.searchObj.stime;
			$rootScope.booking.bookingEndTime = $scope.searchObj.etime;
			$rootScope.booking.fromDate = $scope.searchObj.fromDate;
			$rootScope.booking.endDate = $scope.searchObj.endDate;
			$rootScope.booking.bookingDate = $scope.searchObj.stime;
			var booking = new BookingHotDeskService.createBooking($rootScope.booking);
			booking.$save({
				/*scheduleId : schedule._id*/
			}, function(response) {
				$rootScope.newBookingId = response._id;
				$rootScope.booking = {};
				$scope.bookNow = true;
				angular.element('#step3').addClass("step-select");
				angular.element('#step2').addClass("step-select");
			}, function(error) {
				$scope.bookNow = false;
				$scope.error = error;
			});

		};

		$scope.loadCurrentUser = function() {
			$rootScope.user = angular.copy(MeanUser.user);
		};

		$scope.createAttendee = function(isvalid, attendee) {
			// $scope.attendee={};
			if (isvalid) {
				$scope.attendee.booking = $rootScope.newBookingId;
				var attendee = new BookingHotDeskService.createAttendee($scope.attendee);
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
		
		$scope.calculateTimeType = function(totalHrs) {
			if($rootScope.dateObj.timeType === "Half Day"){
				$scope.timeType = 2;
			}else if($rootScope.dateObj.timeType === "Full Day"){
				$scope.timeType = 3;
			}else{
				$scope.timeType = 1;
				$scope.pricePerHour = $scope.room.pricePerhour * totalHrs;
			}
		}


		$scope.scheduleSpliceIndexArray = [];
		$scope.scheduleIndexArray = [];
		
		$scope.loadSchedules = function(hotDeskId, hotDeskListIdsLength, counter) {
			$scope.selectFromDate = $rootScope.dateObj.fromDate;
			$scope.selectEndDate = $rootScope.dateObj.endDate;
			BookingHotDeskService.loadRoomSchedule.query({
				'roomId': hotDeskId,
				'selectFromDate' : $scope.selectFromDate,
				'selectEndDate' : $scope.selectEndDate
			}, function(response) {
				$scope.counter++;
				$scope.schedule = response;
				for(var i = 0; i < $scope.schedule.length; i++){
					if($scope.schedule[i].currentAval.length === 0){
						$scope.scheduleSpliceIndexArray.push($scope.schedule[i]);
					} else {
						$scope.scheduleIndexArray.push($scope.schedule[i]);
					}
				}

				if(counter === hotDeskListIdsLength){
					console.log($scope.scheduleIndexArray);
					var startTime = $rootScope.dateObj.sTime.split(" ");
				     var startMeridiem = startTime[1];
				     var stime = startTime[0].split(":");
				     var sTimeHrs = parseInt(stime[0]);
				     var sTimeMins = parseInt(stime[1]);
				    
				     var endTime=$rootScope.dateObj.etime.split(" ");
				     var endMeridiem = endTime[1];
				     var etime = endTime[0].split(":");
				     var eTimeHrs = parseInt(etime[0]);
				     var eTimeMins = parseInt(etime[1]);
				    
				     // Calculating hrs
				     if(startMeridiem == "PM"){
				    	 sTimeHrs = sTimeHrs + 12;
				     }
				     if(endMeridiem == "PM" && eTimeHrs != '12'){
				    	 eTimeHrs = eTimeHrs + 12;
				     }
				     
				     $scope.totalHours = $scope.scheduleIndexArray.length - $scope.scheduleSpliceIndexArray.length;
				     
				     // Calculating mins
				     if((eTimeMins - sTimeMins) > 0){
				    	 $scope.totalHours = (eTimeHrs - sTimeHrs + 0.5) * $scope.totalHours;
				     } else if((eTimeMins - sTimeMins) < 0){
				    	 $scope.totalHours = (eTimeHrs - sTimeHrs - 0.5) * $scope.totalHours;
				     } else {
				    	 $scope.totalHours = (eTimeHrs - sTimeHrs) * $scope.totalHours;
				     }
				     
				     $scope.calculateTimeType($scope.totalHours);
				}
			     
			}, function(error) {
				console.log(error);
			});
		};
		
		$scope.checkBlocked = function(schedule, room, isAgreed) {
			$scope.bookedSchedule = schedule;
			var currentSchedule = $scope.bookedSchedule.currentAval;
			for (var i = 0; i < currentSchedule.length; i++) {
				var blocked = currentSchedule[i].blocked;
				if (blocked) {
					console.log("error in booking");
				} else {
					$scope.PayBoookNow(room, isAgreed);
				}
			}
		};
		
		$scope.loadBooking=function(){
			BookingHotDeskService.loadBookings.query(function (bookings) {
                $scope.bookings = bookings;
            });
		};
		
		$scope.loadPartnerBooking=function(){
			$scope.user=$rootScope.user._id;
			BookingHotDeskService.loadPartnerBooking.query({
				'partner' : $scope.user
			}, function(response) {
				$scope.partnerBookings = response;
			});
			
		};
		
		$scope.bookingTable=false;
		$scope.loadBookingBasedOnUser=function(){
			if($rootScope.loggedInUser.isPartner){
				$scope.bookingTable=true;		
				$scope.loadPartnerBooking();
			}else{
				$scope.bookingTable=false;
				$scope.loadBooking();
			}
			
		};		

  }
]);
