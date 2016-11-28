'use strict';

/* jshint -W098 */
angular.module('mean.booking').controller('BookingTrainingController', ['$scope', 'Global','RoomService','BOOKING','$location','$stateParams','MeanUser','BookingTrainingService','$rootScope','SpaceService','$interval','$cookies','flash', 'BookingService','ProfileService','MESSAGES','URLFactory','DTOptionsBuilder','DTColumnDefBuilder','SEARCH', 'BookingHotDeskService','RoleService',
  function($scope, Global,RoomService,BOOKING,$location,$stateParams,MeanUser,BookingTrainingService,$rootScope,SpaceService, $interval, $cookies, flash, BookingService,ProfileService,MESSAGES,URLFactory,DTOptionsBuilder,DTColumnDefBuilder,SEARCH, BookingHotDeskService, RoleService) {
		$scope.global = Global;
		$scope.package = {
			name : 'booking'
		};
		hideBgImageAndFooter($rootScope);
        $scope.authenticated = MeanUser.loggedin;
        $rootScope.$on('loggedin', function() {
            $scope.authenticated = true;
            $scope.getPartner();
        });
        
		$scope.cancelreason = "";
		$scope.showcancelbookingreason=false;
		$scope.disabledNoInPopup=false;
		$scope.cancelreasondescription = "";
		$scope.initiatedBy = "";
		$scope.addAttendeeForm = [ {} ];
		$scope.BOOKING = BOOKING;
		flashmessageOn($rootScope, $scope,flash);
		$scope.guest = {};
		$scope.login = {};
		$scope.loggeduser = {};
		$scope.loggeduser.phone = "";
		$scope.specialNote = {};
		$scope.validated = true;
		$scope.emailError = false;
        $scope.queryParams = $location.search();
        if ($rootScope.searchObj) {
            $scope.searchObj = $rootScope.searchObj;
        }

		if ($rootScope.dateObj) {
			$rootScope.dateObj = $rootScope.dateObj;
		}
		
		$scope.searchParameters = function(){
			var queryParams = $location.search();
			$scope.searchElements = {
				capacity :{
					min : queryParams.capacitymin,
					max:  queryParams.capacitymax
				},
				lon : queryParams.search_lon,
				lat: queryParams.search_lat,
				etime: queryParams.end_time,
				stime: queryParams.start_time,
				roomType: queryParams.roomType,
				timeType: queryParams.timeType,
				place: queryParams.place,
				/*fromToDates : queryParams.fromToDates.split(','),*/
				date: queryParams.dateselc,
				timeZoneOffset: parseInt(queryParams.timeZoneOffset)
			};
			$scope.calculatePriceNew = { 
				roomType : $scope.searchElements.roomType,
				stime : $scope.searchElements.stime,
				etime : $scope.searchElements.etime
			};
			/*if(queryParams.roomType === SEARCH.CONSTANT.TRAINING_ROOM || queryParams.roomType === SEARCH.CONSTANT.HOT_DESK){
				$scope.searchElements.fromToDates = queryParams.fromToDates.split(',');
			}*/
			if(queryParams.from_date){
				$scope.searchElements.fromDate = queryParams.from_date;
			} 
			if(queryParams.end_date){
				$scope.searchElements.endDate = queryParams.end_date;
			}
			
			if(queryParams.excludeHoliday){
				$scope.searchElements.excludeHoliday = queryParams.excludeHoliday;
			}
			if(queryParams.excludeSunday){
				$scope.searchElements.excludeSunday = queryParams.excludeSunday;
			}
			if(queryParams.dateDiff){
				$scope.searchElements.dateDiff = queryParams.dateDiff;
			}
		};
		
		$scope.findOneRoom = function() {
			$('#preloader').hide();
			$('.taxCharge').css("display", "inline");
			$scope.queryParams = $location.search();
			console.log($scope.queryParams);
			$scope.timeout=$scope.queryParams.timeout;
			if($scope.timeout == true){
				console.log("in iffff");
				$scope.showMessage=true;
			}else{
				$scope.showMessage=false;
			}
			$scope.retry=$scope.queryParams.retry;
			var booking = $scope.queryParams.booking;
			if(booking){
				BookingService.loadBookings.get({
		    		bookingId: booking
		            }, function(booking) {
		            	console.log(booking);
		            	$scope.booking=booking;
				});
			}else{
				console.log("no operations");
			}
			RoomService.roomdetails.get({
				roomId : $stateParams.roomId
			}, function(room) {
				$scope.room = room;
				$rootScope.roomsDetail = $scope.room;
				$rootScope.$emit('latLongForRoom');

				/*

					Author : Rajesh
					Date   : 18-08-2016

					Condition to check whether service tax is applicable.
					If service registration number exists in space, the service tax is applicable.
					Otherwise 0% of tax is applied.
					*****************************************************************************
					** In case, service tax is fetched from DB based on "BOOKING START DATE",  **
					** assign the applicable service tax value to "$scope.serviceTax_value"    **
					*****************************************************************************

				*/
				if($scope.room.spaceId.service_tax && $scope.room.spaceId.service_tax.trim().length > 0) {
					$scope.serviceTax_applicable = true;
					$scope.serviceTax_value = 15;
				}
				else
				{
					$scope.serviceTax_applicable = false;
					$scope.serviceTax_value = 0;
				}

				$scope.loadSchedules();
				//$scope.calculateServiceTax($rootScope.roomsDetail.pricePerhour);
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
		
		$scope.byPassPayUMoney = function(data){
			var successPayUMoneyURL = new BookingService.successPayUMoneyURL(data);
			successPayUMoneyURL.$save({}, function(response) {
				var url = '/booking/success' + '?booking_id=' + data.txnid + '&nord';
				$location.url(url);
			}, function(error) {
				$scope.error = error;
				console.log($scope.error);
				/*if($scope.error.data && $scope.error.data.ERRCODE && ($scope.error.data.ERRCODE === 1100)){
					flash.setMessage($scope.error.data.ERRBOOKING, MESSAGES.ERROR);
				}*/
			});
		}
		
		$scope.submitPayUMoney = function(data){
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
            if(data.user && data.user.phone){
                jQuery("#payu_phone").val(data.user.phone);
            } else {
                jQuery("#payu_phone").val(9876543210);
            }
            jQuery("#payu_service").val(data.service_provider);
            
            var currentURL = window.location.href;
            if(currentURL.indexOf('mymatchbox.in') > -1){
            	jQuery("#payumoneyForm").attr("action", "https://secure.payu.in/_payment");
            } else {
            	console.log('TEST');
                jQuery("#payumoneyForm").attr("action", "https://test.payu.in/_payment");
            }
            jQuery("#payumoneyForm").attr("method", "post");
            jQuery("#payumoneyForm").submit();
        };
        
        $scope.post = function(path, params, method) {
            method = method || "post"; // Set method to post by default if not specified.

            // The rest of this code assumes you are not using a library.
            // It can be made less wordy if you use one.
            var form = document.createElement("form");
            form.setAttribute("method", method);
            form.setAttribute("action", path);

            for(var key in params) {
                if(params.hasOwnProperty(key)) {
                    var hiddenField = document.createElement("input");
                    hiddenField.setAttribute("type", "hidden");
                    hiddenField.setAttribute("name", key);
                    hiddenField.setAttribute("value", params[key]);

                    form.appendChild(hiddenField);
                }
            }

            document.body.appendChild(form);
            form.submit();
        };

		$scope.bookNow = false;
		$scope.payBookNow = function(room, isAgreed, guest, specialNoteDesc, loggeduserDetail) {
			var schedule = $scope.scheduleIndexArray; 
			$rootScope.booking = {};
			$rootScope.booking.roomPrice = {};
			$rootScope.booking.room = room;
			$rootScope.booking.space = room.spaceId;
			$rootScope.booking.partner = room.spaceId.partner;
			//$rootScope.booking.user = $rootScope.user;
			if(MeanUser.user.email == undefined) {
				$rootScope.booking.user = undefined;
			} else {
				$rootScope.booking.user = MeanUser.user;
			}
			$rootScope.booking.isAgreed = isAgreed;
			$rootScope.booking.scheduleTraining = schedule;
			/*$rootScope.booking.bookingFrom = $scope.selectFromDate.toISOString().substr(0,10) + "T00:00:00.000Z";
			$rootScope.booking.bookingTo = $scope.selectEndDate.toISOString().substr(0,10) + "T00:00:00.000Z";*/
			$rootScope.booking.bookingStartTime = $scope.searchObj.stime;
			$rootScope.booking.bookingEndTime = $scope.searchObj.etime;
			$rootScope.booking.fromDate = $scope.searchObj.fromDate;
			$rootScope.booking.endDate = $scope.searchObj.endDate;
			$rootScope.booking.no_of_days = $scope.no_of_days;
			$rootScope.booking.bookingDate = $scope.searchObj.stime;
			$rootScope.booking.timeZoneOffset = $scope.searchObj.timeZoneOffset;
			$rootScope.booking.guest = guest;
			$rootScope.booking.price = $scope.totalPrice;
			$rootScope.booking.totalHours = $scope.totalHours;
			/*$rootScope.booking.priceWithoutTax = $rootScope.priceReqired;*/
			$rootScope.booking.priceWithoutTax = $scope.totalPricePerHour;
		    $rootScope.booking.capacity = $scope.searchObj.capacity.min;
		    $rootScope.booking.roomPrice.pricePerHour = room.pricePerhour;
		    $rootScope.booking.roomPrice.pricePerHalfday = room.pricePerhalfday;
		    $rootScope.booking.roomPrice.pricePerFullday = room.pricePerfullday;
		    $rootScope.booking.specialNoteDescription = specialNoteDesc;
	        $rootScope.booking.address = {};
	        console.log(loggeduserDetail);
	        if(loggeduserDetail){
				$rootScope.booking.address.address1 = loggeduserDetail.address1;
				$rootScope.booking.address.address2 = loggeduserDetail.address2;
				$rootScope.booking.address.city = loggeduserDetail.city;
				$rootScope.booking.address.state = loggeduserDetail.state;
				$rootScope.booking.address.pinCode = loggeduserDetail.pinCode
				$rootScope.booking.address.country = loggeduserDetail.country;
			}
		    
		    var isGuest = Object.keys(guest).length === 0 && guest.constructor === Object;
            if(isGuest && $scope.promoCode){
                $rootScope.booking.promoCode = $scope.promoCode._id;
            }
			var booking = new BookingTrainingService.createBooking($rootScope.booking);
			booking.$save({
				/*scheduleId : schedule._id*/
			}, function(response) {
				$rootScope.newBookingId = response._id;
				$rootScope.booking = {};
				$scope.bookNow = true;
				//angular.element('#step3').addClass("step-select");
				angular.element('#step2').addClass("step-select");
				if(response.amount == 0){
					$scope.byPassPayUMoney(response);
				} else {
					$scope.submitPayUMoney(response);
				}
			}, function(error) {
				$scope.bookNow = false;
				$scope.error = error;
				if($scope.error.data && $scope.error.data.ERRCODE && ($scope.error.data.ERRCODE === 1100)){
					flash.setMessage($scope.error.data.ERRBOOKING, MESSAGES.ERROR);
				}
				if($scope.error.data.ERRCODE && ($scope.error.data.ERRCODE === 5001)){
					flash.setMessage($scope.error.data.ERRBOOKING, MESSAGES.ERROR);
				}
			});

		};

		$scope.loadCurrentUser = function() {
			$rootScope.user = angular.copy(MeanUser.user);
			if($rootScope.user.phone){
				$scope.loggeduser.phone = $rootScope.user.phone;
			}
		};

		/*$scope.createAttendee = function(isvalid, attendee) {
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
		};*/
		
		$scope.calculateTimeType = function(totalHrs, totalDateHoursDiff) {
			var perDayTotalHours = totalHrs / totalDateHoursDiff;
			console.log(perDayTotalHours);
			$scope.queryParams = $location.search();
			if($scope.queryParams.timeType === "Half Day"){
				$scope.timeType = 2;
			}else if($scope.queryParams.timeType === "Full Day"){
				$scope.timeType = 3;
			}else{
				$scope.timeType = 1;
				if(perDayTotalHours === 4){
					$scope.timeType = 2;
					$scope.pricePerHour = $scope.room.pricePerhalfday * (totalHrs / 4);
				} else {
					$scope.timeType = 3;
					$scope.pricePerHour = $scope.room.pricePerfullday * (totalHrs / 8);
				} /*else if(totalHrs > 4 && totalHrs < 8){
					var halfDayPrice = $scope.room.pricePerhalfday * 4;
					var perHourPrice = $scope.room.pricePerhour * (totalHrs - 4);
					$scope.pricePerHour = halfDayPrice + perHourPrice;
				} else if(totalHrs > 8){
					var fullDayPrice = $scope.room.pricePerhalfday * 8;
					var perHourPrice = $scope.room.pricePerhour * (totalHrs - 8);
					$scope.pricePerHour = fullDayPrice + perHourPrice;
				} */
			}
		}

		$scope.loadSchedules = function() {
			
			$scope.selectFromDate = $scope.queryParams.from_date + " " + $scope.queryParams.start_time;
			$scope.selectEndDate = $scope.queryParams.end_date + " " + $scope.queryParams.end_time;
			
			BookingTrainingService.loadRoomSchedule.query({
				'roomId':$stateParams.roomId,
				'selectFromDate' : $scope.selectFromDate,
				'selectEndDate' : $scope.selectEndDate
			}, function(response) {
				$scope.schedule = response;
				$scope.scheduleSpliceIndexArray = [];
				$scope.scheduleIndexArray = [];
				for(var i = 0; i < $scope.schedule.length; i++){
					if($scope.schedule[i].currentAval.length === 0){
						$scope.scheduleSpliceIndexArray.push($scope.schedule[i]);
					} else {
						$scope.scheduleIndexArray.push($scope.schedule[i]);
					}
				}
				
				var startTime = $scope.queryParams.start_time.split(" ");
			     var startMeridiem = startTime[1];
			     var stime = startTime[0].split(":");
			     var sTimeHrs = parseInt(stime[0]);
			     var sTimeMins = parseInt(stime[1]);
			    
			     var endTime = $scope.queryParams.end_time.split(" ");
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
			     if(startMeridiem == "AM"  && sTimeHrs == '12'){
			          sTimeHrs = sTimeHrs - 12;
			     }
			     if(endMeridiem == "AM" && eTimeHrs == '12'){
			          eTimeHrs = eTimeHrs - 12;
			     }
			     
			     $scope.searchParameters();
			     /*$scope.totalHours = $scope.scheduleIndexArray.length - $scope.scheduleSpliceIndexArray.length;*/
			     //$scope.totalHours = $scope.dateDifference($scope.selectFromDate, $scope.selectEndDate);
			     var dateRange = new BookingTrainingService.dateRange($scope.searchElements);
				 dateRange.$save({}, function(dateRange){
				     $scope.no_of_days = dateRange.dateDiff;
				     $scope.totalHours = dateRange.dateDiff;
				     var totalDateHoursDiff = $scope.totalHours;
				     $scope.totalDays = $scope.totalHours;
				     
				     // Calculating mins
				     if((eTimeMins - sTimeMins) > 0){
				    	 $scope.totalHours = (eTimeHrs - sTimeHrs + 0.5) * $scope.totalHours;
				     } else if((eTimeMins - sTimeMins) < 0){
				    	 $scope.totalHours = (eTimeHrs - sTimeHrs - 0.5) * $scope.totalHours;
				     } else {
				    	 if((eTimeHrs - sTimeHrs) === 4){
				    		 $scope.totalHours = (eTimeHrs - sTimeHrs) * $scope.totalHours;
				    	 } else {
					    	 $scope.totalHours = ((eTimeHrs - sTimeHrs) - 1) * $scope.totalHours;
				    	 }
				     }
				     
				     $scope.calculateTimeType($scope.totalHours, totalDateHoursDiff);
				 }, function(error) {
					 console.log(error);
				 });
			}, function(error) {
				console.log(error);
			});
		};
		
		$scope.dateDifference = function(fromDate, toDate){
			var date1 = new Date(fromDate);
			var date2 = new Date(toDate);
			var timeDiff = Math.abs(date2.getTime() - date1.getTime());
			var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
			return diffDays;
		}
		
		$scope.checkBlocked = function(schedule, room, isAgreed) {
			$scope.bookedSchedule = schedule;
			var currentSchedule = $scope.bookedSchedule.currentAval;
			for (var i = 0; i < currentSchedule.length; i++) {
				var blocked = currentSchedule[i].blocked;
				if (blocked) {
				} else {
					$scope.payBookNow(room, isAgreed);
				}
			}
		};
		
		$scope.loadBooking=function(){
			BookingTrainingService.loadBookings.query(function (bookings) {
                $scope.bookings = bookings;
            });
		};
		
		$scope.loadPartnerBooking=function(){
			$scope.user = $rootScope.user._id;
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
		
		$scope.calculateServiceTax = function(timeType, price){
			//var days = $scope.totalDays;
			$rootScope.priceReqired = price;
			$scope.totalPricePerHour = price * ($scope.totalDays);
			$scope.totalPricePerHourAmt = $scope.totalPricePerHour;
            $scope.discount = $scope.totalPricePerHour - 0;
			$scope.servicetax = $scope.discount * ($scope.serviceTax_value/100);
			$scope.totalPrice = $scope.discount + $scope.servicetax;
			$rootScope.totalPrice = $scope.totalPrice;
			
			/*if (timeType == 1){
				$rootScope.priceReqired = price;
				$scope.totalPricePerHour = price * $scope.totalHours;
	            $scope.discount = $scope.totalPricePerHour - 0;
			} else if(timeType == 2){
			    $rootScope.priceReqired = price;
				$scope.totalPricePerHour = price * ($scope.totalHours / 4);
	            $scope.discount = $scope.totalPricePerHour  - 0;
			} else {
			    $rootScope.priceReqired = price;
				$scope.totalPricePerHour = price * ($scope.totalHours / 16);
	            $scope.discount = $scope.totalPricePerHour  - 0;
			}
			$scope.servicetax = $scope.discount * (15/100);
			$scope.totalPrice = $scope.discount + $scope.servicetax;*/
		};

		$scope.loadGuest=function(){
			$scope.guest = {};
		};
		
		/*$scope.loadAttendees=function(userBookingId){
			//var queryParams = $location.search();
			//var bookingId = queryParams.booking_id;
			BookingService.loadAttendees.query({
				'booking' :userBookingId
			}, function(response) {
				$scope.attendeesDetails = response;
				console.log($scope.attendeesDetails);
				if($scope.attendeesDetails.length > 0){
					//$scope.addAttendeeForm = $scope.attendeesDetails;
				}
			}, function(error) {
				console.log(error);
			});
			
		};*/
		
		/*$scope.loginUser = function() {
			$cookies.put('loginCookie', 'userLoggingin');
			$cookies.put('BookingId', $stateParams.roomId);
			MeanUser.login($scope.login.user);
		};*/
							
		$scope.redirectBack=function(){
			$location.path(BOOKING.URL_PATH.USER_MYBOOKINGS);
		}
		
		$scope.redirectBackAdminBooking=function(){
			$location.path(BOOKING.URL_PATH.ADMINBOOKINGLIST);
		}
		
		// Function to submit review
		// Author : Rajesh K
		// Date   : 20/05/2016
		// Input  : rating, comments and title
		// Output : display rating saved successfully message and redirect

		$scope.reviewedTrue = false;
		$scope.getBookingDetail = function(){
			$scope.review = {};
			var bookingid = $stateParams.bookingId;
			BookingService.loadBookings.get({
				bookingId : bookingid
			}, function(booking) {
				console.log(booking);
				$scope.reviewed = booking.reviewed;
				if ($scope.reviewed) {
					$scope.reviewedTrue = true;
				}
				$scope.spaceName = booking.space.name;
				$scope.roomName = booking.room.name;
				$scope.bookingDate = booking.bookingDate;
				$scope.userIdBooked = booking.user._id;
				$scope.bookedId = booking._id;
			});
		}
		
		$scope.reviewedDone = false;
		$scope.submitReview = function(){
			console.log($scope.review);
			$scope.review.createdBy = $scope.userIdBooked;
			var review = new BookingService.submitReview($scope.review);
				review.$save({bookingId: $scope.bookedId},function(response) {
					console.log(response);
					$scope.reviewedDone = true;
					$scope.review = {};
			});
		};
		$scope.upadteUser = function(phno,user,addressDetail) {
			// var userDetail = new ProfileService.userProfile(user);
			var userDetail = {};
			userDetail.phone = phno;
			userDetail.userId = user._id;
			userDetail.address1 = addressDetail.address1;
			userDetail.address2 = addressDetail.address2;
			userDetail.city = addressDetail.city;
			userDetail.state = addressDetail.state;
			userDetail.pinCode = addressDetail.pinCode
			userDetail.country = addressDetail.country;
			// console.log(userDetail);
			// console.log(userDetail._id);
			ProfileService.userProfile.update(userDetail, function(userDetail) {
				// console.log("Executed");
			}, function(err){
				console.log(err);
			});
		}

		$scope.validateLoginPayBookNow = function(room, isAgreed,guest, specialNoteDesc,loggeduserDetail){
			if(angular.isDefined(MeanUser.user.first_name)){
				console.log(MeanUser.user);
				console.log("rootscope user");
				console.log($rootScope.user.phone);
				console.log($scope.loggeduser.phone);
				if($rootScope.user.phone && loggeduserDetail.address1 && loggeduserDetail.address2 && loggeduserDetail.city && loggeduserDetail.state && loggeduserDetail.pinCode && loggeduserDetail.country){
					$scope.userdtls = {};
					//$scope.userdtls.phone = ""; 
					$scope.validated = true;
					$scope.loggedusers = MeanUser.user;
					$scope.upadteUser($scope.loggeduser.phone, $scope.loggedusers, loggeduserDetail);
					$scope.payBookNow(room,isAgreed,guest, specialNoteDesc, loggeduserDetail);
				} else if($scope.loggeduser.phone && loggeduserDetail.address1 && loggeduserDetail.address2 && loggeduserDetail.city && loggeduserDetail.state && loggeduserDetail.pinCode && loggeduserDetail.country){
					$scope.userdtls = {};
					//$scope.userdtls.phone = "";
					$scope.loggedusers = MeanUser.user;
					//$scope.usrdtls.phone = $scope.loggeduser.phone;
					$scope.upadteUser($scope.loggeduser.phone, $scope.loggedusers, loggeduserDetail);
					$scope.validated = true;
					$scope.payBookNow(room,isAgreed,guest, specialNoteDesc, loggeduserDetail);
				} else {
					//flash.setMessage(MESSAGES.ALL_FIELDS_REQUIRED,MESSAGES.ERROR);
				}
				
			}
			else if(guest.first_name && guest.email && guest.phone){
				BookingService.loadUserBasedOnEmail.get({
					'userId':guest.email
				}, function(response) {
					if(response._id == undefined){
						if(loggeduserDetail.address1 && loggeduserDetail.address2 && loggeduserDetail.city && loggeduserDetail.state && loggeduserDetail.pinCode && loggeduserDetail.country){
							$scope.emailError = false;
							$scope.validated = true;
							$scope.payBookNow(room,isAgreed,guest, specialNoteDesc, loggeduserDetail);
						} else {
							flash.setMessage(MESSAGES.ALL_ADDRESS_FIELDS_REQUIRED,MESSAGES.ERROR);
						}
					} else {
						$scope.emailError = true;
					}
				});
			}
			else{
				$scope.validated = false;
			};
		}
		
		$scope.validateLogin = function(room, isAgreed,guest,code, specialNoteDesc,loggeduserDetail){
			if(code){
				BookingService.ValidateCoupon.get({promoCodeId : code}, function(response){
		     		$scope.promoMsg = response.obj.msg;
		     		if(response.obj.msg == 'expired'){
			     		$scope.codeExpired = true;
			     		$scope.codeUsed = false;
				     	$scope.codeValid = false;
						$scope.codeInvalid = false;
			     	} else {
			     		$scope.codeExpired = false;
			     		/*$scope.codeUsed = false;
				     	$scope.codeValid = false;
						$scope.codeInvalid = false;*/
			     	}
		     		
		     		if(!$scope.codeExpired){
		     			$scope.validateLoginPayBookNow(room, isAgreed,guest, specialNoteDesc, loggeduserDetail);
		     		}
				
				}, function(err){
		     		 console.log(err);
		     		 $scope.codeUsed = false;
			     	 $scope.codeValid = false;
					 $scope.codeInvalid = true;
					 $scope.codeExpired = false;
					 $scope.reCalculateTotalAmt();
		     	});
			} else {
				$scope.validateLoginPayBookNow(room, isAgreed,guest, specialNoteDesc, loggeduserDetail);
			}

		};
		
		$scope.loginUser = function(){
			$('#preloader').show();
			$('.taxCharge').css("display", "none");
			var queryParams = $location.search();
			console.log(queryParams);
			var requiredSearch=JSON.stringify(queryParams);
			 $cookies.put('loginCookie', 'userLoggingin');
			 $cookies.put('BookingId',$stateParams.roomId );
			 $cookies.put('searchObject',requiredSearch);
			 $cookies.put('roomType','TrainingRoom');
			 MeanUser.login($scope.login.user);
		};

		 $scope.codeInvalid = false;
		 $scope.codeValid = false;
		 $scope.codeUsed = false;
		 $scope.clickCount = 0;
		 $scope.promoMsg = 'invalid';
		 $scope.codeExpired = false;
	     $scope.ValidateCouponCode = function(code) {
		     	$scope.clickCount = 1;
		     	if($scope.clickCount === 1){
		     		$scope.totalPricePerHour = $scope.totalPricePerHourAmt;
		     	}
		     	$scope.reCalculateTotalAmt();
		     	BookingService.ValidateCoupon.get({promoCodeId : code}, function(response){
		     		$scope.promoMsg = response.obj.msg;
		     		if(response.obj.msg == 'expired'){
			     		$scope.codeExpired = true;
			     	} else {
			     		$scope.codeExpired = false;
			     	}
		     		if(response.obj.msg == 'valid') {
			     		$scope.promoCode = response.obj.promoCode;
			     		if($scope.promoCode.isPercent) {
			     			$scope.promoCodeDiscountPercentage = $scope.promoCode.value;
				     		$scope.totalPricePerHour = $scope.totalPricePerHour - (($scope.totalPricePerHour * $scope.promoCode.value) / 100);
				     		 $scope.discount= $scope.totalPricePerHour - 0;
							 $scope.servicetax=$scope.discount*($scope.serviceTax_value/100);
							 $scope.totalPrice=$scope.discount + $scope.servicetax;
							 	$scope.codeInvalid = false;
				     			$scope.codeValid = true;
			 					$scope.codeUsed = false;
				     	}
				     	else {
				     		/*if($scope.promoCode.value < $scope.totalPricePerHourAmt){*/
			     				$scope.promoCodeDiscountValue = $scope.promoCode.value;
			     				if(($scope.totalPricePerHour - $scope.promoCode.value) > 0){
									$scope.totalPricePerHour = $scope.totalPricePerHour - $scope.promoCode.value;
		     					} else {
		     						$scope.totalPricePerHour = 0;
		     					}
							 	$scope.discount= $scope.totalPricePerHour - 0;
								$scope.servicetax=$scope.discount*($scope.serviceTax_value/100);
								$scope.totalPrice=$scope.discount + $scope.servicetax;
								$scope.codeInvalid = false;
				     			$scope.codeValid = true;
			 					$scope.codeUsed = false;
				     		/*} else {
				     			$scope.codeInvalid = true;
				     			$scope.codeValid = false;
			 					$scope.codeUsed = false;
								$scope.reCalculateTotalAmt();
				     		}*/
				     	}
			     	}
			     	else if(response.obj.msg == 'invalid') {
			     		$scope.codeInvalid = true;
			     		$scope.codeValid = false;
			 			$scope.codeUsed = false;
			 			$scope.reCalculateTotalAmt();
			     	}
			     	else if(response.obj.msg == 'used'){
			     		 $scope.codeUsed = true;
			     		 $scope.codeValid = false;
						 $scope.codeInvalid = false;
						 $scope.reCalculateTotalAmt();
			     	}
			     	else {
			     		$scope.codeUsed = false;
			     		$scope.codeValid = false;
						$scope.codeInvalid = false;
						$scope.reCalculateTotalAmt();
			     	}
		     	}, function(err){
		     		console.log(err);
		     		 $scope.codeUsed = false;
			     	 $scope.codeValid = false;
					 $scope.codeInvalid = true;
					 $scope.codeExpired = false;
					 $scope.reCalculateTotalAmt();
		     	});
		     };


	    $scope.reCalculateTotalAmt = function(){

     		$scope.totalPricePerHour = $scope.totalPricePerHourAmt;
     		$scope.discount= $scope.totalPricePerHour - 0;
			$scope.servicetax=$scope.discount*($scope.serviceTax_value/100);
			$scope.totalPrice=$scope.discount + $scope.servicetax;
	    }

	    $scope.resetpromoCodeField = function() {
	     	$('#promoCodeField').val("");
	     	$scope.codeUsed = false;
	     	$scope.codeValid = false;
			$scope.codeInvalid = false;
			$scope.codeExpired = false;
			$scope.reCalculateTotalAmt();
	    }

	    $scope.socailLoginRedc = function() {
			if (confirm('You will be redirected to facebook.com for authorization.Do you want to continue?')) {
				console.log("redirect page.");
	    		$location.path('/api/auth/facebook');
			}
			else
			{
				console.log("cancel");
			}
	    };
	    $scope.signupRedc = function() {
	    	if (confirm('You will be redirected to sign up page.Do you want to continue?')) {
				console.log("redirect page.");
	    		$location.path('');
			}
			else
			{
				console.log("cancel");
			}
	    };

	   $scope.initializePopup = function($scope, modelName, MESSAGES, $uibModal) {
			$scope.modalPopupToC = function() {
				var modalInstancePP = $uibModal.open({
					templateUrl: 'booking/views/toc_modal.html',
					controller: 'BookingController',
					size: 'lg',
					backdrop: 'static'
				});

			};

			$scope.modalPopupPrivacyPolicy = function() {
				var modalInstancePP = $uibModal.open({
					templateUrl: 'booking/views/privacy_policy_modal.html',
					controller: 'BookingController',
					size: 'lg',
					backdrop: 'static'
				});
			};

		};

		$scope.initializePopup($scope, $scope.package.modelName, MESSAGES, URLFactory.uibModal);

	    $scope.redirectTCOND = function() {
			$scope.modalPopupToC();
	    };

	    $scope.redirectModalPrivacyPolicy = function() {
	  		// var url = '/privacy-policy';
			// window.open(url,'popUpWindow','height=690,width=1100,left=50%,top=25%,resizable=yes,scrollbars=yes,toolbar=yes,menubar=no,location=no,directories=no,status=yes')
			$("#bookingtocModal").remove();
			$(".modal-backdrop").remove();
			$('.modal').remove();
			$scope.modalPopupPrivacyPolicy();
	    };

	    $scope.closeModal = function(){
			 $("#bookingtocModal").remove();
			 $(".modal-backdrop").remove();
			 $('.modal').remove();
		}
		
		$scope.closePrivacyPolicyModal = function(){
			 $("#bookingprivacyModal").remove();
			 $(".modal-backdrop").remove();
			 $('.modal').remove();
		}
		
		$scope.guestForm = false;
		$scope.requiredPriceBookingHr = false;
		$scope.loadBookingDetails = function() {
			$scope.dtOptions4 = DTOptionsBuilder.newOptions().withPaginationType('full_numbers').withDisplayLength(10);
			$scope.dtColumnDefs4 = [
					DTColumnDefBuilder.newColumnDef(0).notVisible(),
					DTColumnDefBuilder.newColumnDef(1),
					DTColumnDefBuilder.newColumnDef(2),
					DTColumnDefBuilder.newColumnDef(3), ];
			window.alert = (function() {
				var nativeAlert = window.alert;
				return function(message) {
					// window.alert = nativeAlert;
					message.indexOf("DataTables warning") >= 0 ? console.warn(message) : nativeAlert(message);
				}
			})();
			var queryParams = $location.search();
			$scope.bookingDetailId = queryParams.booking_id;
			BookingService.loadBookings.get({
				bookingId : $scope.bookingDetailId
			},
			function(booking) {
				$scope.bookingDetail = booking;
				//$scope.noOfDesks = parseInt(queryParams.capacity.max);
				$scope.roomTypeString = $scope.bookingDetail.room.roomtype.name;
				$scope.noOfDesks = $scope.bookingDetail.relatedBookedRooms.length;
				$rootScope.roomsDetail = $scope.bookingDetail.room;
				$rootScope.$emit('latLongForRoom');
				$scope.bookingStartTimeSuccess = new Date($scope.bookingDetail.bookingStartTime);
				$scope.bookingEndTimeSuccess = new Date($scope.bookingDetail.bookingEndTime);
				$scope.bookingDetailTotalPrice = $scope.bookingDetail.priceWithoutTax * $scope.bookingDetail.totalHours;
				$scope.morecapacity = $scope.bookingDetail.capacity + 5;
                $scope.validateCancelTime($scope.bookingDetail.bookingStartTime);
				console.log(booking);
				/*booking.room.roomtype.name*/
				if (!booking.user) {
					$scope.guestForm = true;
				} else {
					$scope.guestForm = false;
				}
				
				if(booking.user && ( JSON.stringify(MeanUser.user._id) === JSON.stringify(booking.user._id) )){
                	$scope.isBookedBy = true;
                } else if(booking.guestUser && ( JSON.stringify(MeanUser.user._id) === JSON.stringify(booking.guestUser._id) )){
                	$scope.isBookedBy = true;
                } else {
                	$scope.isBookedBy = false;
                }
				$scope.selectFromDate = booking.fromDate + " " + booking.startTime;
				$scope.selectEndDate = booking.endDate + " " + booking.endTime;
				//$scope.totalDateHoursDiff = $scope.dateDifference($scope.selectFromDate, $scope.selectEndDate);
				$scope.searchParameters();
				var dateRange = new BookingTrainingService.dateRange($scope.searchElements);
				dateRange.$save({}, function(dateRange){
					$scope.totalDateHoursDiff = dateRange.dateDiff;
					$scope.totalDateHoursDiff = booking.no_of_days;
					var totalDateHoursDifference = parseInt($scope.totalDateHoursDiff);
					var totalHoursObj = (parseInt(booking.totalHours) / totalDateHoursDifference);
					//booking.roomPrice = booking.room;
						
					if(booking.room.roomtype.name === SEARCH.CONSTANT.TRAINING_ROOM){
						if(totalHoursObj == 4){
							$scope.timeType = 2;
							$scope.requiredPriceBooking = booking.roomPrice.pricePerHalfday;
						} else {
							$scope.timeType = 3;
							$scope.requiredPriceBooking = booking.roomPrice.pricePerFullday;
						}
					} else if(booking.room.roomtype.name === SEARCH.CONSTANT.HOT_DESK){
						if(totalHoursObj == 4){
							$scope.timeType = 2;
							$scope.requiredPriceBooking = booking.roomPrice.pricePerHalfday;
							// Calculate number of hours per day.
							var totalDaysCount = $scope.bookingDetail.totalHours / $scope.totalDateHoursDiff;
							$scope.actualPrice = booking.roomPrice.pricePerHalfday  * $scope.totalDateHoursDiff;
							$scope.actualPrice = $scope.actualPrice * $scope.noOfDesks;
						} else if (totalHoursObj == 8){
							$scope.timeType = 3;
							$scope.requiredPriceBooking = booking.roomPrice.pricePerFullday;
							// Calculate number of hours per day.
							var totalDaysCount = $scope.bookingDetail.totalHours / $scope.totalDateHoursDiff;
							$scope.actualPrice = booking.roomPrice.pricePerFullday  * $scope.totalDateHoursDiff;
							$scope.actualPrice = $scope.actualPrice * $scope.noOfDesks;
						} else {
							$scope.timeType = 1;
							$scope.requiredPriceBookingHr = true;
							$scope.requiredPriceBooking = booking.roomPrice.pricePerHour;
							// Calculate number of hours per day.
							var totalDaysCount = $scope.bookingDetail.totalHours / $scope.totalDateHoursDiff;
							$scope.actualPrice = (booking.roomPrice.pricePerHour * totalDaysCount) * $scope.totalDateHoursDiff;
							$scope.actualPrice = $scope.actualPrice * $scope.noOfDesks;
						}
					} else {
						console.log('Meeting Room');
					}
	                $scope.validateCancelTimeForBooking($scope.bookingDetail.bookingStartTime);
					$scope.loadAttendees($scope.bookingDetail._id);
		    	}, function(error){
		        	console.log(error);
		    	});
			});
		};
		
		$scope.loadAttendees = function(userBookingId) {
			
			BookingService.loadAttendees.query({
				'booking' : userBookingId
			},
			function(response) {
				$scope.attendeesDetails = response;
				$scope.requiredLength = $scope.attendeesDetails.length + 5;
				if($scope.attendeesDetails.length > 0){
					//$scope.addAttendeeForm = $scope.attendeesDetails;
				}
			}, function(error) {
				console.log(error);
			});
			
			$scope.dtOptions3 = DTOptionsBuilder.newOptions().withPaginationType('full_numbers').withDisplayLength(10);
			$scope.dtColumnDefs3 = [
					DTColumnDefBuilder.newColumnDef(0).notVisible(),
					DTColumnDefBuilder.newColumnDef(1),
					DTColumnDefBuilder.newColumnDef(2),
					DTColumnDefBuilder.newColumnDef(3), ];
			window.alert = (function() {
				var nativeAlert = window.alert;
				return function(message) {
					// window.alert = nativeAlert;
					message.indexOf("DataTables warning") >= 0 ? console.warn(message) : nativeAlert(message);
				}
			})();
		};
		
		$scope.createAttendee = function(isvalid, attendee) {
			var queryParams = $location.search();
			if (isvalid) {
				var queryParams = $location.search();
				console.log($scope.addAttendeeForm);
				document.getElementById("AttendeeForm").reset();
				for (var i=0; i < $scope.addAttendeeForm.length; i++){
					$scope.addAttendeeForm[i].booking=queryParams.booking_id;
				}
				console.log($scope.addAttendeeForm);
				var attendee = new BookingService.createAttendee($scope.addAttendeeForm);
				attendee.$save(function(response) {
					$scope.attendee = {};
					$scope.addAttendeeForm = [{}];
					$scope.loadAttendees(response.booking);
					flash.setMessage(URLFactory.MESSAGES.ATTENDEE_ADDED_SUCCESS,MESSAGES.SUCCESS);
				});
			} else {
				$scope.submitted = true;
				flash.setMessage(MESSAGES.PLEASE_FILL_DATA,MESSAGES.ERROR);
			}
		};
		
		$scope.addAttendee = function(isvalid, attendee, bookingId) {
			if (isvalid) { 
				$scope.addAttendeeForm.push({});
				$scope.submitted = false;
			} else {
				$scope.submitted = true;
			}
		};
		
		$scope.removeAttendee = function(index){
	        $scope.addAttendeeForm.splice(index, 1);
	    };

        /*$scope.cancelBooking = function(bookingObj){
            var retVal = confirm("Are you sure you want to cancel this booking?");
            if(retVal){
                $scope.cancelArray = [];
                $scope.cancel = {};
                $scope.cancel.startTime = bookingObj.bookingStartTime;
                $scope.cancel.endTime = bookingObj.bookingEndTime;
                $scope.cancel.isBlocked = true;
                $scope.cancel.bookedId = bookingObj._id;
                $scope.cancelArray.push($scope.cancel);
                var cancelselectedBooking = new BookingHotDeskService.cancelBookings($scope.cancel);
                cancelselectedBooking.$save(function(response) {
                    BookingService.loadParticularrole.get({
                        role : 'Admin'
                    },
                    function(adminrole) {
                        $scope.adminId = adminrole._id;
                        $scope.loggedinuserrole = [];
                        for (var i = 0; i < MeanUser.user.role.length; i++) {
                            $scope.loggedinuserrole.push(MeanUser.user.role[i]._id);
                        }

                        var checkingadmin = $scope.loggedinuserrole.indexOf($scope.adminId);
                        if (checkingadmin < 0) {
                            $scope.loggedinuserisadmin = false;
                        } else {
                            $scope.loggedinuserisadmin = true;
                        }

                        if ($scope.loggedinuserisadmin) {
                            $location.path('/admin/bookings');
                        } else {
                            $location.path('/bookings/mybookings');
                        }
                    });
                });
            }
        };*/
	    
		$scope.cancelBooking = function() {
			if($scope.isAdmin){
				$('#cancelBookingAdminModel').modal('show');
			}
			else {
				$("#cancelBookingModel").modal('show');
			}
		}

        $scope.getPartner = function() {
            BookingService.loadParticularrole.get({
                role: 'Partner'
            }, function(rolePartner) {

                $scope.partnerId = rolePartner._id;
                $scope.loggedinuserrolepartner = [];
                for (var i = 0; i < MeanUser.user.role.length; i++) {
                    $scope.loggedinuserrolepartner.push(MeanUser.user.role[i]._id);
                }

                var checkingpartner = $scope.loggedinuserrolepartner.indexOf($scope.partnerId);
                if (checkingpartner < 0) {
                    $scope.found = false;
                } else {
                    $scope.found = true;
                }

            });
        };

        $scope.validateCancelTime = function(bookingtime) {
            $scope.diff = (new Date(bookingtime) < new Date());
            if ($scope.diff) {
                $scope.isLess = true;
            } else {
                $scope.isLess = false;
            }
        };
        
        $scope.validateCancelTimeForBooking = function(bookingtime){
	    	 console.log(new Date(bookingtime));
    		 $scope.diff =  (new Date(bookingtime) <  new Date());
    		 if($scope.diff){
    			 $scope.isLess = true;
    		 } else {
    			 $scope.isLess = false;
    		 }
	     },
        
        $scope.redirectBackBooking=function(){
	    	$location.path(BOOKING.URL_PATH.USER_MYBOOKINGS); 
	    };
	    
	    $scope.loadReasonForBookingCancel = function(){
			BookingService.loadReasonsForCancelBooking.query(function(response){
               $scope.cancelbookingreasons = response;
			},function(err){
				console.log(err);
			});
		};

		
		$scope.confirmCancelledBooking = function(){
			$scope.cancelArray = [];
		    $scope.cancel = {};
		    $scope.cancel.startTime = $scope.bookingStartTime;
	     	$scope.cancel.endTime = $scope.bookingEndTime;
	     	$scope.cancel.isBlocked = true;
	     	$scope.cancel.bookedId = $scope.bookingDetail._id;
	     	$scope.cancelArray.push($scope.cancel);
	     	$scope.cancel.reason=$scope.cancelreason;

	     	// $scope.cancel.reasondescription=$scope.cancelreasondescription;
	     	// $scope.cancel.initiatedBy = $scope.initiatedBy;
	     	if($scope.cancel.reason == "Other"){
	     		$scope.cancel.reasondescription=$scope.cancelreasondescription;
	     	}
	     	else {
	     		$scope.cancel.reasondescription = 'N/A';
	     	}
	     	$scope.cancel.initiatedBy = $scope.initiatedBy;
	     	$scope.cancel.cancelledBy = MeanUser.user._id;

	     	var cancelselectedBooking = new BookingHotDeskService.cancelBookings($scope.cancel);
			cancelselectedBooking.$save(function(response) {
				BookingService.loadParticularrole.get({
		    		role: 'Admin'
		        }, function (adminrole) {
					$scope.adminId = adminrole._id;
					$scope.loggedinuserrole = [];
					for (var i = 0; i < MeanUser.user.role.length; i++) {
						$scope.loggedinuserrole.push(MeanUser.user.role[i]._id);
					}

					var checkingadmin = $scope.loggedinuserrole.indexOf($scope.adminId);
					if (checkingadmin < 0) {
						$scope.loggedinuserisadmin = false;
					} else {
						$scope.loggedinuserisadmin = true;
					}

					if ($scope.loggedinuserisadmin) {
						flash.setMessage(URLFactory.MESSAGES.CANCEL_BOOKING, MESSAGES.SUCCESS);
						$location.path('/admin/bookings');
					} else {
						flash.setMessage(URLFactory.MESSAGES.CANCEL_BOOKING, MESSAGES.SUCCESS);
						$location.path('/bookings/mybookings');
					}
		        });
			});
		};

		$scope.cancelConfirmCancelledBooking = function() {
			BookingService.loadParticularrole.get({
				role : 'Admin'
			},
			function(adminrole) {

				$scope.adminId = adminrole._id;
				$scope.loggedinuserrole = [];
				for (var i = 0; i < MeanUser.user.role.length; i++) {
					$scope.loggedinuserrole.push(MeanUser.user.role[i]._id);
				}

				var checkingadmin = $scope.loggedinuserrole.indexOf($scope.adminId);
				if (checkingadmin < 0) {
					$scope.loggedinuserisadmin = false;
				} else {
					$scope.loggedinuserisadmin = true;
				}

				if ($scope.loggedinuserisadmin) {
					$location.path('/admin/bookings');
				} else {
					$location.path('/bookings/mybookings');
				}
			});
		};

	    $scope.showBookingCancelReasons = function(){
	     	$scope.showcancelbookingreason = true;
	     	$scope.disabledNoInPopup = true;	
	    };
		$scope.isAdmin = function() {
			if (MeanUser.user.hasRole == 'Admin') {
				return true;
			} else {
				return false;
			}
		};
		
	    $scope.retryPayment=function(){
			var queryParams = $location.search();
			BookingService.loadBookingRetryPayment.get({
	    		bookingId: queryParams.booking
	            }, function(booking) {
	            	$scope.booking=booking;
	            	$scope.submitPayUMoney(booking);
			});
		};
		
		 $scope.showMessage=false;
	     $scope.cancelBookingRetry = function(){
		     	var retVal = confirm("Are you sure you want to cancel this booking?");
				if(retVal){
					var queryParms = $location.search();
			     	$scope.cancelArray = [];
			     	$scope.cancel = {};
			     	$scope.cancel.startTime = $scope.bookingStartTime;
			     	$scope.cancel.endTime = $scope.bookingEndTime;
			     	$scope.cancel.isBlocked = true;
			     	$scope.cancel.bookedId = queryParms.booking;
			     	$scope.cancelArray.push($scope.cancel);
			     	var cancelselectedBooking = new BookingService.cancelRetry($scope.cancel);
						cancelselectedBooking.$save(function(response) {
							$scope.showMessage=true;
					});
				}
		     };

		$scope.confirmAdminCancel = function(){
			$('.adminCancelNo').addClass('cursorNotAllowed');
	     	$scope.showAdminCancellbookingreason = true;
	     	$scope.disabledNoInAdminPopup = true;
	    };
		
		$scope.loadReasonAdminBookingCancel = function(){
			BookingService.loadReasonsAdminCancelBooking.query(function(response){
               $scope.adminCancelbookingreasons = response;
			},function(err){
				console.log(err);
			});
		};

		$scope.checkLoggedInUsersRole = function(){
			RoleService.role.query({}, function(response){
       		 	$scope.roleList = response;
       		 	var rolesOfUser = MeanUser.user.role;
       		 	$scope.isAdministrator = false;
       		 	$scope.isPartner = false;
       		 	$scope.isBackOffice = false;
       		 	$scope.isFrontOffice = false;
       		 	$scope.isNormalUser = false;
       		 	if(rolesOfUser.length > 0){
       		 		for(var i = 0; i < $scope.roleList; i++){
       		 			for(var j = 0; j < rolesOfUser.length; j++){
       		 				if(($scope.roleList[i].name === 'Admin') && ($scope.roleList[i].name === rolesOfUser[j].name)){
       		 					$scope.isAdministrator = true;
       		 				} else if(($scope.roleList[i].name === 'Partner') && ($scope.roleList[i].name === rolesOfUser[j].name)){
       		 					$scope.isPartner = true;
       		 				} else if(($scope.roleList[i].name === 'BackOffice') && ($scope.roleList[i].name === rolesOfUser[j].name)){
       		 					$scope.isBackOffice = true;
       		 				} else if(($scope.roleList[i].name === 'FrontOffice') && ($scope.roleList[i].name === rolesOfUser[j].name)){
       		 					$scope.isFrontOffice = true;
       		 				} else {
           					 
       		 				}
       		 			}
       		 		}
       		 	} else {
       		 		$scope.isNormalUser = true;
       		 	}
			}, function(err){
				console.log(err);
			});
        }
		
  }]);
