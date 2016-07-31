'use strict';

/* jshint -W098 */
angular.module('mean.booking').controller('BookingTrainingController', ['$scope', 'Global','RoomService','BOOKING','$location','$stateParams','MeanUser','BookingTrainingService','$rootScope','SpaceService','$interval',
  function($scope, Global,RoomService,BOOKING,$location,$stateParams,MeanUser,BookingTrainingService,$rootScope,SpaceService,$interval) {
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
			$rootScope.dateObj = $rootScope.dateObj;
		}
		$scope.findOneRoom = function() {
			RoomService.roomdetails.get({
				roomId : $stateParams.roomId
			}, function(room) {
				$scope.room = room;
				$rootScope.roomsDetail = $scope.room;
				$rootScope.$emit('latLongForRoom');
				$scope.loadSchedules();
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
		
		$scope.submitPayUMoney=function(data){
            jQuery("#payu_hash").val(data.hash);
            jQuery("#payu_key").val(data.key);
            jQuery("#payu_txnid").val(data.txnid);
            jQuery("#payu_amount").val(data.amount);
            jQuery("#payu_productinfo").val(data.productinfo);
            jQuery("#payu_firstname").val(data.firstname);
            jQuery("#payu_email").val(data.email);
            jQuery("#payu_surl").val(data.surl);
            jQuery("#payu_furl").val(data.furl);
            jQuery("#payu_curl").val(data.curl);
            jQuery("#payu_phone").val(data.phone);
            jQuery("#payu_service").val(data.service_provider);

            jQuery("#payumoneyForm").attr("action", "https://test.payu.in/_payment");
            jQuery("#payumoneyForm").attr("method", "post");
            jQuery("#payumoneyForm").submit();
        };

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
			var booking = new BookingTrainingService.createBooking($rootScope.booking);
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
				var attendee = new BookingTrainingService.createAttendee($scope.attendee);
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

		$scope.loadSchedules = function() {
			
			$scope.selectFromDate = $rootScope.dateObj.fromDate;
			$scope.selectEndDate = $rootScope.dateObj.endDate;
			console.log($scope.selectFromDate);
			console.log($scope.selectEndDate);
			BookingTrainingService.loadRoomSchedule.query({
				'roomId':$stateParams.roomId,
				'selectFromDate' : $scope.selectFromDate,
				'selectEndDate' : $scope.selectEndDate
			}, function(response) {
				$scope.schedule = response;
				console.log($scope.schedule);
				$scope.scheduleSpliceIndexArray = [];
				$scope.scheduleIndexArray = [];
				for(var i = 0; i < $scope.schedule.length; i++){
					if($scope.schedule[i].currentAval.length === 0){
						$scope.scheduleSpliceIndexArray.push($scope.schedule[i]);
					} else {
						$scope.scheduleIndexArray.push($scope.schedule[i]);
					}
				}
				
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
			     
			     $scope.totalHours = $scope.schedule.length - $scope.scheduleSpliceIndexArray.length;
			     
			     // Calculating mins
			     if((eTimeMins - sTimeMins) > 0){
			    	 $scope.totalHours = (eTimeHrs - sTimeHrs + 0.5) * $scope.totalHours;
			     } else if((eTimeMins - sTimeMins) < 0){
			    	 $scope.totalHours = (eTimeHrs - sTimeHrs - 0.5) * $scope.totalHours;
			     } else {
			    	 $scope.totalHours = (eTimeHrs - sTimeHrs) * $scope.totalHours;
			     }
			     
			     $scope.calculateTimeType($scope.totalHours);
			     
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
			BookingTrainingService.loadBookings.query(function (bookings) {
                $scope.bookings = bookings;
            });
		};
		
		$scope.loadPartnerBooking=function(){
			$scope.user=$rootScope.user._id;
			BookingTrainingService.loadPartnerBooking.query({
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
