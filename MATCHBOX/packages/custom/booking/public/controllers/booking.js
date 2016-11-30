'use strict';

/* jshint -W098 */
angular.module('mean.booking',['datatables','ngResource']).controller('BookingController', ['$scope', 'Global','RoomService','BOOKING','$location','$stateParams','MeanUser','BookingService','$rootScope','SpaceService','$interval','DTOptionsBuilder','DTColumnDefBuilder','$cookies','flash','ProfileService','URLFactory','MESSAGES', '$window','RoleService',
  function($scope, Global,RoomService,BOOKING,$location,$stateParams,MeanUser,BookingService,$rootScope,SpaceService,$interval,DTOptionsBuilder,DTColumnDefBuilder,$cookies,flash, ProfileService,URLFactory,MESSAGES, $window, RoleService) {
		$scope.global = Global;
		$scope.cancelreason = "";
		$scope.showcancelbookingreason=false;
		$scope.disabledNoInPopup=false;
		$scope.cancelreasondescription = "";
		$scope.initiatedBy = "";
		$scope.package = {
			name : 'booking'
		};
		$scope.validated = true;
		$scope.emailError = false;
		$scope.login = {};
		$scope.loggeduser = {};
		$scope.loggeduser.phone = "";
		hideBgImageAndFooter($rootScope);
		flashmessageOn($rootScope, $scope,flash);
		$scope.addAttendeeForm = [ {} ];
		//$scope.BOOKING = BOOKING;
		$scope.BOOKING = URLFactory.BOOKING;
		$scope.MESSAGES=MESSAGES;
		$scope.attendee={};
		$scope.discountCoupon = {};
        $scope.specialNote = {};
        $scope.authenticated = MeanUser.loggedin;
        $rootScope.$on('loggedin', function() {
            $scope.authenticated = true;
            $scope.getPartner();
        });
        $scope.queryParams = $location.search();
		if ($rootScope.searchObj) {
			$scope.searchObj = $rootScope.searchObj;
			console.log($scope.searchObj);
		}

		if ($rootScope.dateObj) {
			$rootScope.dateObj = $rootScope.dateObj;
		}
		
		$scope.loadCurrentUser = function() {
			console.log($rootScope.user);
			$rootScope.user = angular.copy(MeanUser.user);
			if($rootScope.user.phone){
				$scope.loggeduser.phone = $rootScope.user.phone;
			}
			$scope.loggeduser.address1 = $rootScope.user.address1;
			$scope.loggeduser.address2 = $rootScope.user.address2;
			$scope.loggeduser.city = $rootScope.user.city;
			$scope.loggeduser.state = $rootScope.user.state;
			$scope.loggeduser.pinCode = $rootScope.user.pinCode
			$scope.loggeduser.country = $rootScope.user.country;
		};
		
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
			$scope.searchParameters();
			$('#preloader').hide();
			$('.taxCharge').css("display", "inline");
			var queryParams = $location.search();
			console.log(queryParams);
			$scope.timeout=queryParams.timeout;
			console.log($scope.timeout);
			if($scope.timeout == true){
				console.log("in iffff");
				$scope.showMessage=true;
			}else{
				$scope.showMessage=false;
			}
			$scope.retry=queryParams.retry;
			var booking = queryParams.booking;
			var datesel = queryParams.dateselc;
			var stimesel=queryParams.start_time;
			var etimesel=queryParams.end_time;
			$scope.capacity=queryParams.capacitymin;
			$scope.bookingDate = moment(datesel).format('DD-MM-YYYY');
			$scope.sTimeSelc=moment(stimesel).format('LT');
			$scope.eTimeSelc=moment(etimesel).format('LT');
			console.log(booking);
			if(booking){
				BookingService.loadBookings.get({
		    		bookingId: booking
		            }, function(booking) {
		            	console.log(booking);
		            	$scope.booking=booking;
		            	console.log($scope.booking.status);
				});
			}else{
				console.log("no operations");
			}
			
			
			if(new Date($scope.searchElements.stime) > new Date($scope.searchElements.etime)){
				$scope.URLChange = true;
			} else {
				$scope.URLChange = false;
			}

			if($scope.URLChange){
				flash.setMessage(URLFactory.MESSAGES.URL_TIME_CHANGE, URLFactory.MESSAGES.ERROR);
			} else {
				RoomService.roomdetails.get({
					roomId : $stateParams.roomId
				}, function(room) {
					$scope.room = room;
					console.log(room);
					$rootScope.roomsDetail = $scope.room;
					$rootScope.$emit('latLongForRoom');
					$scope.loadSchedules(stimesel,$scope.sTimeSelc,$scope.eTimeSelc);
					
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
					// console.log($scope.serviceTax_applicable);
					// console.log($scope.serviceTax_value);
					$scope.calculateServiceTax($rootScope.roomsDetail);
				});
			}
			
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

		$scope.PayBoookNow = function(schedule, room, isAgreed,guest, specialNoteDesc, loggeduserDetail) {
			var queryParams = $location.search();
			var startTimeFormatOne=new Date(queryParams.start_time).toISOString();
			var endTimeFormatOne=new Date(queryParams.end_time).toISOString();
			$rootScope.booking = {};
			//$rootScope.booking.roomPrice={};
			if(MeanUser.user.email == undefined){
				$rootScope.booking.user = undefined;
			}else{
				$rootScope.booking.user = MeanUser.user;
			     }      
					$rootScope.booking.room = room._id;
					$rootScope.booking.space=room.spaceId;
					$rootScope.booking.partner=room.spaceId.partner;
					//$rootScope.booking.user = $rootScope.requiredUserBookingId;
					$rootScope.booking.isAgreed = isAgreed;
					console.log($rootScope.booking.isAgreed);
					$rootScope.booking.schedule = schedule;
					$rootScope.booking.bookingStartTime = startTimeFormatOne;
					$rootScope.booking.bookingEndTime = endTimeFormatOne;
				//  $rootScope.booking.bookingDate =queryParams.datesel;
					$rootScope.booking.guest=guest;
					 $rootScope.booking.price=$scope.totalPrice;
					 $rootScope.booking.totalHours=$scope.totalHours;
					 $rootScope.booking.priceWithoutTax=$scope.totalPricePerHour;
					 $rootScope.booking.capacity=$scope.capacity;
					/* $rootScope.booking.roomPrice.pricePerHour=room.pricePerhour;
					 $rootScope.booking.roomPrice.pricePerHalfday=room.pricePerhalfday;
					 $rootScope.booking.roomPrice.pricePerFullday=room.pricePerfullday;*/
                     var bookingStartOne = new Date(startTimeFormatOne);
                     var starttimehours = bookingStartOne.getHours();
                     var starttimeminutes = bookingStartOne.getMinutes();
                     var bookingStartTimeNumber = starttimehours * 60 + starttimeminutes;

                     var bookingEndOne = new Date(endTimeFormatOne);
			         var endtimehours = bookingEndOne.getHours();
			         var endtimeminutes = bookingEndOne.getMinutes();
			         var bookingEndTimeNumber = endtimehours * 60 + endtimeminutes;

			         $rootScope.booking.bookingStartTimeNumber = bookingStartTimeNumber;
                     $rootScope.booking.bookingEndTimeNumber = bookingEndTimeNumber;
                     $rootScope.booking.specialNoteDescription = specialNoteDesc;
                     $rootScope.booking.address = {};
                     if(loggeduserDetail){
						$rootScope.booking.address.address1 = loggeduserDetail.address1;
						$rootScope.booking.address.address2 = loggeduserDetail.address2;
						$rootScope.booking.address.city = loggeduserDetail.city;
						$rootScope.booking.address.state = loggeduserDetail.state;
						$rootScope.booking.address.pinCode = loggeduserDetail.pinCode
						$rootScope.booking.address.country = loggeduserDetail.country;
                     }
                     $rootScope.booking.service_tax = $scope.serviceTax_value;
                     var isGuest = Object.keys(guest).length === 0 && guest.constructor === Object;
                    
                     if(isGuest && $scope.promoCode){
	                     $rootScope.booking.promoCode = $scope.promoCode._id;
	                 }
					var booking = new BookingService.createBooking($rootScope.booking);
					// console.log("==============================================================================================================");
					// console.log(booking);
					// console.log("==============================================================================================================");
					booking.$save({
						scheduleId : schedule._id
					}, function(response) {
						console.log(response);
						$rootScope.newBookingId = response._id;
						$rootScope.booking = {};
						$scope.bookNow = true;
						angular.element('#step2').addClass("step-select");
						if(response.amount == 0){
							$scope.byPassPayUMoney(response);
						} else {
							$scope.submitPayUMoney(response);
						}
		                //$scope.post('https://test.payu.in/_payment',response,'POST');
						/*} else {
							var urlPath = BOOKING.URL_PATH.BOOKINGSUCCESS + '?booking_id=' + $rootScope.newBookingId;
							$location.path(urlPath);
						}*/
					}, function(error) {
						$scope.bookNow = false;
						$scope.error = error;
						console.log($scope.error);
						if($scope.error.data && $scope.error.data.ERRCODE && ($scope.error.data.ERRCODE === 1100)){
							flash.setMessage($scope.error.data.ERRBOOKING, MESSAGES.ERROR);
						}
						if($scope.error.data.ERRCODE && ($scope.error.data.ERRCODE === 5001)){
							flash.setMessage($scope.error.data.ERRBOOKING, MESSAGES.ERROR);
						}
					});
		};

		$scope.retryPayment=function(){
			var queryParams = $location.search();
			BookingService.loadBookingRetryPayment.get({
	    		bookingId: queryParams.booking
	            }, function(booking) {
	            	$scope.booking=booking;
	            	$scope.submitPayUMoney(booking);
			});
		}
		
		//$scope.emailError=true;
		$scope.validateLoginPayBookNow = function(schedule, room, isAgreed,guest, specialNoteDesc,loggeduserDetail){
			// console.log("in validate fn.");;
			if(angular.isDefined(MeanUser.user.first_name)){
				// console.log("in if condition");
				/*if($rootScope.user.phone && loggeduserDetail.address1 && loggeduserDetail.address2 && loggeduserDetail.city && loggeduserDetail.state && loggeduserDetail.pinCode && loggeduserDetail.country){*/
				if($rootScope.user.phone){	
					$scope.userdtls = {};
					//$scope.userdtls.phone = "";
					$scope.validated = true;
					$scope.loggedusers = MeanUser.user;
					$scope.upadteUser($scope.loggeduser.phone, $scope.loggedusers, loggeduserDetail);
					$scope.PayBoookNow(schedule,room,isAgreed,guest, specialNoteDesc, loggeduserDetail);
				/*} else if($scope.loggeduser.phone && loggeduserDetail.address1 && loggeduserDetail.address2 && loggeduserDetail.city && loggeduserDetail.state && loggeduserDetail.pinCode && loggeduserDetail.country){*/
				} else if($scope.loggeduser.phone){
					$scope.userdtls = {};
					//$scope.userdtls.phone = "";
					$scope.loggedusers = MeanUser.user;
					//$scope.usrdtls.phone = $scope.loggeduser.phone;
					$scope.upadteUser($scope.loggeduser.phone, $scope.loggedusers, loggeduserDetail);
					$scope.validated = true;
					$scope.PayBoookNow(schedule,room,isAgreed,guest, specialNoteDesc, loggeduserDetail);
				} else {
					//flash.setMessage(MESSAGES.ALL_ADDRESS_FIELDS_REQUIRED,MESSAGES.ERROR);
				}
				
			}
			else if(guest.first_name && guest.email && guest.phone){
				/*
				 * considering the guest email and verifying with users
				 * 
				 */
		    	  BookingService.loadUserBasedOnEmail.get({
						'userId':guest.email
					}, function(response) {
						if(response._id == undefined){
							/*if(loggeduserDetail.address1 && loggeduserDetail.address2 && loggeduserDetail.city && loggeduserDetail.state && loggeduserDetail.pinCode && loggeduserDetail.country){*/
								$scope.emailError = false;
								$scope.validated = true;
								$scope.PayBoookNow(schedule,room,isAgreed,guest, specialNoteDesc, loggeduserDetail);
							/*} else {
								flash.setMessage(MESSAGES.ALL_ADDRESS_FIELDS_REQUIRED,MESSAGES.ERROR);
							}*/
						}
						else{
							$scope.emailError=true;
						}
					});
				      
				      /*
						  * end of considering the guest email and verifying with users
						  * 
						  */
					}
			else{
				$scope.validated = false;
			};
		}
		
		$scope.validateLogin = function(schedule, room, isAgreed,guest, code, specialNoteDesc,loggeduserDetail){
			//$scope.PayBoookNow(schedule,room,isAgreed,guest);
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
		     			$scope.validateLoginPayBookNow(schedule, room, isAgreed,guest, specialNoteDesc, loggeduserDetail);
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
				$scope.validateLoginPayBookNow(schedule, room, isAgreed,guest, specialNoteDesc, loggeduserDetail);
			}

		};
		
		$scope.upadteUser = function(phno,user, addressDetail) {
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
				
				/*userDetail.$update({
					userId : user._id
				}, function(userDetail) {*/
				
			});
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
      $scope.post=function(path, params, method) {
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
		$scope.createAttendee = function(isvalid, attendee) {
			var queryParams = $location.search();
			if (isvalid) {
				var queryParams = $location.search();
				document.getElementById("AttendeeForm").reset();
				for (var i=0;i<$scope.addAttendeeForm.length;i++){
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
		$scope.createAttendeeByAdmin = function(isvalid, attendee) {
			if (isvalid) {
				document.getElementById("AttendeeFormAdmin").reset();
				for (var i=0;i<$scope.addAttendeeForm.length;i++){
					$scope.addAttendeeForm[i].booking=$stateParams.bookingId;
				}
				var attendee = new BookingService.createAttendee($scope.addAttendeeForm);
				attendee.$save(function(response) {
					$scope.attendee = {};
					console.log(response);
					$scope.loadAttendees(response.booking);
					flash.setMessage(URLFactory.MESSAGES.ATTENDEE_ADDED_SUCCESS,MESSAGES.SUCCESS);
				});
			} else {
				$scope.submitted = true;
			}
			
		};
		$scope.createAttendeeByMyBooking = function(isvalid, attendee) {
			if (isvalid) {
				document.getElementById("AttendeeForm").reset();
				for (var i=0;i<$scope.addAttendeeForm.length;i++){
					$scope.addAttendeeForm[i].booking=$stateParams.bookingId;
				}
				var attendee = new BookingService.createAttendee($scope.addAttendeeForm);
				attendee.$save(function(response) {
					$scope.attendee = {};
					$scope.loadAttendees(response.booking);
					flash.setMessage(URLFactory.MESSAGES.ATTENDEE_ADDED_SUCCESS,MESSAGES.SUCCESS);
				});
			} else {
				$scope.submitted = true;
			}
			
		};
		$scope.guestForm=false;
		$scope.requiredPriceBookingHr = false;
		$scope.loadBookingDetails = function() {
			$scope.dtOptions4 = DTOptionsBuilder.newOptions().withPaginationType('full_numbers').withDisplayLength(10);
			$scope.dtColumnDefs4 = [
			                   DTColumnDefBuilder.newColumnDef(0).notVisible(),
			                   DTColumnDefBuilder.newColumnDef(1),
			                   DTColumnDefBuilder.newColumnDef(2),
			                   DTColumnDefBuilder.newColumnDef(3),
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
				var queryParams = $location.search();
				$scope.bookingDetailId = queryParams.booking_id;
				BookingService.loadBookings.get({
		    		bookingId: $scope.bookingDetailId
		            }, function (booking) {
		                $scope.bookingDetail = booking;
		                $rootScope.roomsDetail = $scope.bookingDetail.room;
						$rootScope.$emit('latLongForRoom');
		                $scope.bookingStartTimeSuccess=new Date($scope.bookingDetail.bookingStartTime);
		                $scope.bookingEndTimeSuccess=new Date($scope.bookingDetail.bookingEndTime);
		                $scope.bookingDetailTotalPrice=$scope.bookingDetail.priceWithoutTax*$scope.bookingDetail.totalHours;
		                $scope.morecapacity=$scope.bookingDetail.capacity + 5;
		                if(!booking.user){
		                	$scope.guestForm=true;
		                }else{
		                	$scope.guestForm=false;
		                }
		                if(booking.user && ( JSON.stringify(MeanUser.user._id) === JSON.stringify(booking.user._id) )){
		                	$scope.isBookedBy = true;
		                } else if(booking.guestUser && ( JSON.stringify(MeanUser.user._id) === JSON.stringify(booking.guestUser._id) )){
		                	$scope.isBookedBy = true;
		                } else {
		                	$scope.isBookedBy = false;
		                }
		                if(booking.totalHours == 4){
		                	$scope.requiredPriceBooking =booking.roomPrice.pricePerHalfday;
		                }else if(booking.totalHours == 8){
		                	$scope.requiredPriceBooking =booking.roomPrice.pricePerFullday;
		                }else{
		                	// scope.requiredPriceBookingHr is used to identify that price is for hour.
		                	$scope.requiredPriceBookingHr = true;
		                	$scope.requiredPriceBooking = booking.roomPrice.pricePerHour;
		                }
		                $scope.validateCancelTimeForBooking($scope.bookingDetail.bookingStartTime);
		                $scope.loadAttendees($scope.bookingDetail._id);
		            });
		};
		$scope.loadMyBookingDetails = function() {
			$scope.bookingDetailId = $stateParams.bookingId;
				BookingService.loadBookings.get({
		    		bookingId: $scope.bookingDetailId
		            }, function (booking) {
		                $scope.bookingDetail = booking;
		                $rootScope.roomsDetail = $scope.bookingDetail.room;
						$rootScope.$emit('latLongForRoom');
		                $scope.bookingStartTime=new Date($scope.bookingDetail.bookingStartTime);
		                $scope.bookingEndTime=new Date($scope.bookingDetail.bookingEndTime);
		                $scope.bookingEndTimeSuccess=new Date($scope.bookingDetail.bookingEndTime);
		                $scope.bookingDetailTotalPrice=$scope.bookingDetail.priceWithoutTax*$scope.bookingDetail.totalHours;
		                $scope.validateCancelTime($scope.bookingDetail.bookingStartTime);
		                if(!booking.user){
		                	$scope.guestForm=true;
		                }else{
		                	$scope.guestForm=false;
		                }
		                if(booking.totalHours == 4){
		                	$scope.requiredPriceBooking =booking.pricePerhalfday;
		                }else if(booking.totalHours == 8){
		                	$scope.requiredPriceBooking =booking.pricePerfullday;
		                }else{
		                	$scope.requiredPriceBooking =booking.pricePerhour;
		                }
		                $scope.loadAttendees($scope.bookingDetail._id);
		                
		            });
		};

		$scope.addAttendee = function(AttendeeForm,attendee,bookingId) {
			var isvalid = AttendeeForm.$valid;
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

		/*$scope.calculateTimeType = function(totalHrs) {
			if($rootScope.dateObj.timeType === "Half Day"){
				$scope.timeType = 2;
			}else if($rootScope.dateObj.timeType === "Full Day"){
				$scope.timeType = 3;
			}else{
				$scope.timeType = 1;
				$scope.pricePerHour = $scope.room.pricePerhour * totalHrs;
			}
		}*/
		$scope.calculateTimeType = function(totalHrs) {
				$scope.timeType = 1;
				if(totalHrs === 4){
					$scope.pricePerHour = $scope.room.pricePerhalfday;
				} else if(totalHrs === 8){
					$scope.pricePerHour = $scope.room.pricePerfullday;
				} /*else if(totalHrs > 4 && totalHrs < 8){
					var halfDayPrice = $scope.room.pricePerhalfday * 4;
					var perHourPrice = $scope.room.pricePerhour * (totalHrs - 4);
					$scope.pricePerHour = halfDayPrice + perHourPrice;
				} else if(totalHrs > 8){
					var fullDayPrice = $scope.room.pricePerhalfday * 8;
					var perHourPrice = $scope.room.pricePerhour * (totalHrs - 8);
					$scope.pricePerHour = fullDayPrice + perHourPrice;
				} */else {
					$scope.pricePerHour = $scope.room.pricePerhour * totalHrs;
				}
		}

		$scope.loadSchedules = function(selectedDate,selectedStime,selectedEtime) {
			$scope.selectDate=selectedDate;
			BookingService.loadRoomSchedule.get({
				'roomId':$stateParams.roomId,
				'selectdate' : $scope.selectDate
			}, function(response) {
				$rootScope.schedule = response;
			}, function(error) {
			});
			
		     var startTime=selectedStime.split(" ");
		     var startMeridiem = startTime[1];
		     var stime = startTime[0].split(":");
		     var sTimeHrs = parseInt(stime[0]);
		     var sTimeMins = parseInt(stime[1]);
		    // console.log(startTime);
		     var endTime=selectedEtime.split(" ");
		     var endMeridiem = endTime[1];
		     var etime = endTime[0].split(":");
		     var eTimeHrs = parseInt(etime[0]);
		     var eTimeMins = parseInt(etime[1]);
		    // console.log(eTimeMins - sTimeMins);
		     // Calculating hrs
		     if(startMeridiem == "PM"  && sTimeHrs != '12'){
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
		  // Calculating mins
		     if((eTimeMins - sTimeMins) > 0){
		    	 $scope.totalHours = eTimeHrs - sTimeHrs + 0.5;
		     } else if((eTimeMins - sTimeMins) < 0){
		    	 $scope.totalHours = eTimeHrs - sTimeHrs - 0.5;
		     } else {
		    	 $scope.totalHours = (eTimeHrs - sTimeHrs);
		     }
		     $scope.calculateTimeType($scope.totalHours);
		   //  console.log(endTime);
			
			/*$interval(function() {
			    $scope.totalHours = (endTime - startTime)/1000;
			}, 1000);*/
			
		};
		$scope.checkBlocked = function(schedule, room, isAgreed) {
			$scope.bookedSchedule = schedule;
			var currentSchedule = $scope.bookedSchedule.currentAval;
			for (var i = 0; i < currentSchedule.length; i++) {
				var blocked = currentSchedule[i].blocked;
				if (blocked) {
				} else {
					$scope.PayBoookNow(room, isAgreed);
				}
			}
		};
		$scope.loaderEnabled = false;
		$scope.loadBooking=function(){
			$scope.dtOptions1 = DTOptionsBuilder.newOptions().withOption('order', []).withPaginationType('full_numbers').withDisplayLength(10);
			$scope.dtColumnDefs1 = [
			                   //DTColumnDefBuilder.newColumnDef(0).notVisible(),
			                   DTColumnDefBuilder.newColumnDef(0),
			                   DTColumnDefBuilder.newColumnDef(1),
			                   DTColumnDefBuilder.newColumnDef(2),
			                   DTColumnDefBuilder.newColumnDef(3),
			                   DTColumnDefBuilder.newColumnDef(4),
			                   DTColumnDefBuilder.newColumnDef(5),
			                   DTColumnDefBuilder.newColumnDef(6),
			                   DTColumnDefBuilder.newColumnDef(7),
			                   DTColumnDefBuilder.newColumnDef(8),
			                   DTColumnDefBuilder.newColumnDef(9),
			                   DTColumnDefBuilder.newColumnDef(10),
			                   DTColumnDefBuilder.newColumnDef(11).notSortable()
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
			$scope.loaderEnabled = true;
			BookingService.dashboardBookings.query(function (bookings) {
                	$scope.bookings = bookings;
                	$scope.loaderEnabled = false;
                });
		};
		$scope.loadPartnerBooking=function(){
			$scope.dtOptions2 = DTOptionsBuilder.newOptions().withOption('order', []).withPaginationType('full_numbers').withDisplayLength(10);
			$scope.dtColumnDefs2 = [
			                   //DTColumnDefBuilder.newColumnDef(0).notVisible(),
			                   DTColumnDefBuilder.newColumnDef(0),
			                   DTColumnDefBuilder.newColumnDef(1),
			                   DTColumnDefBuilder.newColumnDef(2),
			                   DTColumnDefBuilder.newColumnDef(3),
			                   DTColumnDefBuilder.newColumnDef(4),
			                   DTColumnDefBuilder.newColumnDef(5),
			                   DTColumnDefBuilder.newColumnDef(6),
			                   DTColumnDefBuilder.newColumnDef(7),
			                   DTColumnDefBuilder.newColumnDef(8).notSortable(),
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
			$scope.partnerUser=MeanUser.user._id;
			BookingService.dashboardBookings.query({}, function(response) {
				$scope.partnerBookings = response;
			});
			
		};
		$scope.bookingTable=false;
		$scope.loadBookingBasedOnUser=function(){
			if(MeanUser.user.hasRole== 'Admin'){
				$scope.bookingTable=false;
				$scope.loadBooking();
				
			}
			else{
				$scope.bookingTable=true;
				$scope.loadPartnerBooking();
			}
			
		};
	
		 $scope.priceDetails=false;
		 $scope.priceDetailsPerHalf=false;
		$scope.calculateServiceTax=function(room){
			    if($scope.totalHours == 4){
			    	$scope.priceDetailsPerHalf=true;
			    	$scope.priceDetails=true;
			    	$rootScope.priceReqired=room.pricePerhalfday;
					$scope.totalPricePerHour=room.pricePerhalfday;
			 		$scope.totalPricePerHourAmt = $scope.totalPricePerHour;
		            $scope.discount= $scope.totalPricePerHour - 0;
					$scope.servicetax=$scope.discount*($scope.serviceTax_value/100);
					$scope.totalPrice=$scope.discount + $scope.servicetax;
					$rootScope.totalPrice = $scope.totalPrice;
			    }else if ($scope.totalHours == 8){
			    	$scope.priceDetails=true;
			    	$scope.priceDetailsPerHalf=true;
			    	$rootScope.priceReqired=room.pricePerfullday;
					$scope.totalPricePerHour=room.pricePerfullday;
			 		$scope.totalPricePerHourAmt = $scope.totalPricePerHour;
		            $scope.discount= $scope.totalPricePerHour - 0;
					$scope.servicetax=$scope.discount*($scope.serviceTax_value/100);
					$scope.totalPrice=$scope.discount + $scope.servicetax;
					$rootScope.totalPrice = $scope.totalPrice;
			    }else{
			    	$scope.priceDetails=false;
			    	$scope.priceDetailsPerHalf=false;
			    	$rootScope.priceReqired=room.pricePerhour;
					$scope.totalPricePerHour=room.pricePerhour * $scope.totalHours;
			 		$scope.totalPricePerHourAmt = $scope.totalPricePerHour;
		            $scope.discount= $scope.totalPricePerHour - 0;
					$scope.servicetax=$scope.discount*($scope.serviceTax_value/100);
					$scope.totalPrice=$scope.discount + $scope.servicetax;	
					$rootScope.totalPrice = $scope.totalPrice;
			    }
				
			/*}
			else{
		    $rootScope.priceReqired=price;
			$scope.totalPricePerHour=price;
            $scope.discount= price - 0;
			$scope.servicetax=$scope.discount*(15/100);
			$scope.totalPrice=$scope.discount + $scope.servicetax;
			}*/
		};
		$scope.loadGuest=function(){
			$scope.guest = {};
		};
		//$scope.userBookings = [];
	
		$scope.loadUserBooking=function(){
		    $scope.currentDate = new Date();
		    if( $(window).width() <= 415){
				$scope.dtOptions = DTOptionsBuilder.newOptions().withOption('order', []).withPaginationType('full_numbers').withDisplayLength(10).withOption('scrollX', 200);
		    }
		    else {
				$scope.dtOptions = DTOptionsBuilder.newOptions().withOption('order', []).withPaginationType('full_numbers').withDisplayLength(10);
		    }
			
			$scope.dtColumnDefs = [
				                   //DTColumnDefBuilder.newColumnDef(0).notVisible(),
				                   DTColumnDefBuilder.newColumnDef(0),
				                   DTColumnDefBuilder.newColumnDef(1).withOption('sType', 'date'),
				                   DTColumnDefBuilder.newColumnDef(2),
				                   DTColumnDefBuilder.newColumnDef(3),
				                   DTColumnDefBuilder.newColumnDef(4),
				                   DTColumnDefBuilder.newColumnDef(5),
				                   DTColumnDefBuilder.newColumnDef(6),
				                   DTColumnDefBuilder.newColumnDef(7),
				                   DTColumnDefBuilder.newColumnDef(8),
				                   DTColumnDefBuilder.newColumnDef(9).notSortable()
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
			$scope.logUser=MeanUser.user;
			$scope.loaderEnabled = true;
			BookingService.loadUserBookings.query({
				'user' : MeanUser.user._id
			},function(response) {
				$scope.userBookings = response;
				/*for (var i = 0; i < $scope.userBookings.length; i++) {
					//$scope.userBookings[i].bookingNewdate = new Date($scope.userBookings[i].bookingEndTime);
					if(($scope.userBookings[i].room.roomtype.name === 'Hot Desk') || ($scope.userBookings[i].room.roomtype.name === 'Training Room')){
						$scope.userBookings[i].bookingNewdate = new Date($scope.userBookings[i].endDate + ' ' + $scope.userBookings[i].endTime);
					} else {
						$scope.userBookings[i].bookingNewdate = new Date($scope.userBookings[i].bookingEndTime);
					}
				}*/
				// console.log($scope.userBookings);
				$scope.loaderEnabled = false;

		    });
			
		};

		$scope.reviewdMessage = function() {
			flash.setMessage(URLFactory.MESSAGES.REVIEW_ALREADY_SUBMITTED,MESSAGES.SUCCESS);
		};
		
		
		
		$scope.userProfile = function(){
			$location.path('/user-profile');
		};
		 $scope.changePassword = function () {
	    	   $location.path('/change-password');
	     };
	     $scope.calculatePriceAfterCommission=function(requiredRoomType,bookedPartner,bookingPrice){
	    	 var roomCommission=bookedPartner.commissionPercentage;
	    	 BookingService.loadRequredRoomType.query({
					'RoomType' :requiredRoomType,
					'logUserPartner':bookedPartner._id
				}, function(response) {
					$scope.requiredRoomType=response;
					for(var i=0; i<=$scope.requiredRoomType.length;i++){
						$scope.requiredCommissionPercentage=$scope.requiredRoomType[i].commission;
						console.log($scope.requiredCommissionPercentage);
			    	     $scope.finalCommissionValue=bookingPrice*($scope.requiredCommissionPercentage/100);
			    	     console.log($scope.finalCommissionValue);
			    	     $scope.PartnerFinalPrice=bookingPrice-$scope.finalCommissionValue;
			    	     console.log($scope.finalCommissionValue);
					}
		    	     
				});
	    	      
	     };
	     $scope.redirectAttendee=function(booking, urlPath){
		     	console.log("in fn.");
		    	 RoomService.loadroomtypes.query({}, function(roomTypes){
		    		 for(var i = 0; i < roomTypes.length; i++){
		    			 if(JSON.stringify(roomTypes[i]._id) === JSON.stringify(booking.room.roomtype._id)){
		    				 if((roomTypes[i].name.indexOf('Hot') > -1) || roomTypes[i].name.indexOf('Training') > -1){
	                             var url = BOOKING.URL_PATH.BOOKINGRSUCCESSTRAININGROOM + "?booking_id=" + booking._id + '&nord';
	                             console.log(url);
	                             $window.location.href = url;
	                             // $location.path(url);
	                         }
	                         if((roomTypes[i].name.indexOf('Meeting') > -1) || roomTypes[i].name.indexOf('Board') > -1){
	                             var url = BOOKING.URL_PATH.BOOKINGSUCCESS + "?booking_id=" + booking._id + '&nord';
	                             console.log(url);
	                             $window.location.href = url;
		    		             // $location.path(url);
		    				 }
		    			 }
		    		 }
		    	 });
		     };
	     $scope.loadAttendees=function(userBookingId){
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
					$scope.requiredLength=$scope.attendeesDetails.length+5;
				}, function(error) {
					console.log(error);
				});
				$scope.dtOptions3 = DTOptionsBuilder.newOptions().withPaginationType('full_numbers').withDisplayLength(10);
				$scope.dtColumnDefs3 = [
						                   DTColumnDefBuilder.newColumnDef(0).notVisible(),
						                   DTColumnDefBuilder.newColumnDef(1),
						                   DTColumnDefBuilder.newColumnDef(2),
						                   DTColumnDefBuilder.newColumnDef(3),
						                   ];
				window.alert = (function() {
					var nativeAlert = window.alert;
					return function(message) {
						// window.alert = nativeAlert;
						message.indexOf("DataTables warning") >= 0 ? console
								.warn(message)
								: nativeAlert(message);
					}
				})();
				
			};
			
		$scope.loginUser = function(){
			$('#preloader').show();
			$('.taxCharge').css("display", "none");
			var queryParams = $location.search();
			var requiredSearch=JSON.stringify(queryParams);
			 $cookies.put('loginCookie', 'userLoggingin');
			 $cookies.put('BookingId',$stateParams.roomId );
			 $cookies.put('searchObject',requiredSearch);
			 $cookies.put('roomType','');
			 MeanUser.login($scope.login.user);
		};
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
		    		bookingId: bookingid
		            }, function (booking) {
		            	// console.log(booking);
		               $scope.reviewed = booking.reviewed;
		               $rootScope.bookingdetails = booking;
		               // console.log($rootScope.bookingdetails);
		               if($scope.reviewed){
		               		$scope.reviewedTrue = true;
		               }
		               $scope.spaceName = booking.space.name;
		               $scope.roomName = booking.room.name;
		               $scope.bookingDate = booking.bookingDate;
		               $scope.userIdBooked = booking.user._id;
		               $scope.bookedId = booking._id;
		               $scope.bookingDetailObj = booking;
		               $scope.bookingDetailObjStartTime = new Date($scope.bookingDetailObj.bookingStartTime);
		               $scope.bookingDetailObjEndTime = new Date($scope.bookingDetailObj.bookingEndTime);
		            });
		}

		$scope.redirectMyBooking = function() {
			if($scope.authenticated) {
				$location.path('/bookings/mybookings');
			}
			else {
				$location.path('/');
			}
		};
		$scope.reviewedDone = false;
		$scope.submitReview = function(){
			if(!$scope.review.rating) {
				flash.setMessage(URLFactory.MESSAGES.ALL_FIELDS_REQUIRED,MESSAGES.ERROR);
			}
			else {
					// console.log($scope.review);
					$scope.review.createdBy = $scope.userIdBooked;
					var review = new BookingService.submitReview($scope.review);
						review.$save({bookingId: $scope.bookedId},function(response) {
							console.log(response);
							$scope.reviewedDone = true;
							$scope.review = {};
							if($scope.reviewedDone){
								$scope.redirectMyBooking();
								flash.setMessage(URLFactory.MESSAGES.REVIEW_SUBMITTED,MESSAGES.SUCCESS);
							}
					});
				}
		}
		
		 $scope.bookingreview=function(id,urlPath){
	    	  urlPath = urlPath.replace(":bookingId", id);
             $location.path(urlPath);
             
	     };

	     $scope.cancelBooking = function(){
	     	if($scope.isAdmin){
				$('#cancelBookingAdminModel').modal('show');
			}
			else {
				$("#cancelBookingModel").modal('show');
			}
	     },
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
		     },

	     $scope.validateCancelTime = function(bookingtime){

	     		$scope.diff =  (new Date(bookingtime) <  new Date());
	     		if($scope.diff){
	     			$scope.isLess = true;
	     		}else{
	     			$scope.isLess = false;
	     		}

	     },
	     
	     $scope.validateCancelTimeForBooking = function(bookingtime){
	    	 console.log(new Date(bookingtime));
     		 $scope.diff =  (new Date(bookingtime) <  new Date());
     		 if($scope.diff){
     			 $scope.isLess = true;
     		 } else {
     			 $scope.isLess = false;
     		 }
	     },
	     
	     $scope.getPartner = function(){
	     				BookingService.loadParticularrole.get({
		    		role: 'Partner'
		            }, function (rolePartner) {
                        
                         $scope.partnerId=rolePartner._id;
	                     $scope.loggedinuserrolepartner=[];
	                     for(var i=0;i<MeanUser.user.role.length;i++)
	                     {
	                            $scope.loggedinuserrolepartner.push(MeanUser.user.role[i]._id);
	                     }
	                     
	                     var checkingpartner=$scope.loggedinuserrolepartner.indexOf($scope.partnerId);
	                     if(checkingpartner < 0)
	                     {
	                      $scope.found=false;
	                     }
	                     else
	                     {
	                      $scope.found=true;
	                     } 


		            });
	     }
	     $scope.redirectBackBooking=function(){
	    	$location.path(BOOKING.URL_PATH.USER_MYBOOKINGS); 
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

		$scope.initializePopup($scope, $scope.package.modelName, URLFactory.MESSAGES, URLFactory.uibModal);

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
		};
		
		$scope.closePrivacyPolicyModal = function(){
			 $("#bookingprivacyModal").remove();
			 $(".modal-backdrop").remove();
			 $('.modal').remove();
		};

		$scope.loadReasonForBookingCancel = function(){

			BookingService.loadReasonsForCancelBooking.query(function(response){
               $scope.cancelbookingreasons=response;
			},function(err){

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
		     	if($scope.cancel.reason == "Other"){
		     		$scope.cancel.reasondescription=$scope.cancelreasondescription;
		     	}
		     	else {
		     		$scope.cancel.reasondescription = 'N/A';
		     	}
		     	$scope.cancel.initiatedBy = $scope.initiatedBy;
		     	$scope.cancel.cancelledBy = MeanUser.user._id;
		     	
		     	var cancelselectedBooking = new BookingService.cancelBookings($scope.cancel);
					cancelselectedBooking.$save(function(response) {
					BookingService.loadParticularrole.get({
			    		role: 'Admin'
			            }, function (adminrole) {

	                         $scope.adminId=adminrole._id;
		                     $scope.loggedinuserrole=[];
		                     for(var i=0;i<MeanUser.user.role.length;i++)
		                     {
		                            $scope.loggedinuserrole.push(MeanUser.user.role[i]._id);
		                     }
		                     
		                     var checkingadmin=$scope.loggedinuserrole.indexOf($scope.adminId);
		                     if(checkingadmin < 0)
		                     {
		                      $scope.loggedinuserisadmin=false;
		                     }
		                     else
		                     {
		                      $scope.loggedinuserisadmin=true;
		                     } 

			                   if($scope.loggedinuserisadmin){
			                	flash.setMessage(URLFactory.MESSAGES.CANCEL_BOOKING,MESSAGES.SUCCESS);   
				               	$location.path('/admin/bookings');
				               }else{
				            	   flash.setMessage(URLFactory.MESSAGES.CANCEL_BOOKING,MESSAGES.SUCCESS);
				               		$location.path('/bookings/mybookings');
				               }

			            });
						
						
				});
			
		};

		$scope.cancelConfirmCancelledBooking = function(){

			BookingService.loadParticularrole.get({
			    		role: 'Admin'
			            }, function (adminrole) {

	                         $scope.adminId=adminrole._id;
		                     $scope.loggedinuserrole=[];
		                     for(var i=0;i<MeanUser.user.role.length;i++)
		                     {
		                         $scope.loggedinuserrole.push(MeanUser.user.role[i]._id);
		                     }
		                     
		                     var checkingadmin=$scope.loggedinuserrole.indexOf($scope.adminId);
		                     if(checkingadmin < 0)
		                     {
		                      $scope.loggedinuserisadmin=false;
		                     }
		                     else
		                     {
		                      $scope.loggedinuserisadmin=true;
		                     } 

			                   if($scope.loggedinuserisadmin){   
				               	$location.path('/admin/bookings');
				               }else{
				               		$location.path('/bookings/mybookings');
				               }

			            });
			
		     };


		     $scope.showBookingCancelReasons = function(){
		     	$scope.showcancelbookingreason=true;
		     	$scope.disabledNoInPopup=true;	
		     };

             $scope.isAdmin = function() {
                if (MeanUser.user.hasRole== 'Admin') {
                    return true;
                } else {
                    return false;
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
  }
]);
