'use strict';

/* jshint -W098 */
angular.module('mean.booking',['datatables','ngResource']).controller('BookingController', ['$scope', 'Global','RoomService','BOOKING','$location','$stateParams','MeanUser','BookingService','$rootScope','SpaceService','$interval','DTOptionsBuilder','DTColumnDefBuilder','$cookies',
  function($scope, Global,RoomService,BOOKING,$location,$stateParams,MeanUser,BookingService,$rootScope,SpaceService,$interval,DTOptionsBuilder,DTColumnDefBuilder,$cookies) {
		$scope.global = Global;
		$scope.package = {
			name : 'booking'
		};
		$scope.login = {};
		$scope.authenticated= MeanUser.loggedin;
		hideBgImageAndFooter($rootScope);
		flashmessageOn($rootScope, $scope,flash);
		$scope.addAttendeeForm = [ {} ];
		$scope.BOOKING = BOOKING;
		$scope.attendee={};
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

		$scope.bookNow = false;
		$scope.PayBoookNow = function(schedule, room, isAgreed,guest) {
			console.log(guest);
			$rootScope.booking = {};
			$rootScope.booking.room = room;
			$rootScope.booking.space=room.spaceId;
			$rootScope.booking.partner=room.spaceId.partner;
		//	$rootScope.booking.user = $rootScope.user;
			$rootScope.booking.isAgreed = isAgreed;
			$rootScope.booking.schedule = schedule;
			$rootScope.booking.bookingStartTime = $scope.searchObj.stime;
			console.log($scope.searchObj);
			$rootScope.booking.bookingEndTime = $scope.searchObj.etime;
			$rootScope.booking.bookingDate = $scope.searchObj.stime;
			$rootScope.booking.guest=guest;
			 $rootScope.booking.price=$scope.totalPrice;
			 $rootScope.booking.totalHours=$scope.totalHours;
			 $rootScope.booking.priceWithoutTax=$rootScope.priceReqired;
			var booking = new BookingService.createBooking($rootScope.booking);
			booking.$save({
				scheduleId : schedule._id
			}, function(response) {
				console.log(response);
				$rootScope.newBookingId = response._id;
				$rootScope.booking = {};
				$scope.bookNow = true;
				angular.element('#step2').addClass("step-select");
                //$scope.post('https://test.payu.in/_payment',response,'POST');
                $scope.submitPayUMoney(response);
			}, function(error) {
				$scope.bookNow = false;
				$scope.error = error;
			});

		};

		$scope.loadCurrentUser = function() {
			$rootScope.user = angular.copy(MeanUser.user);
			console.log($rootScope.user);

		};
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
		$scope.loadCurrentUser = function() {
			$rootScope.user = angular.copy(MeanUser.user);
			console.log($rootScope.user);
		  };
		/*$scope.loadBookings=function(){
		     BookingService.createBooking.query(function (bookings) {
		         $scope.bookings = bookings;
		         });    
		  };  */

		$scope.createAttendee = function(isvalid, attendee) {
			if (isvalid) {
				//$scope.attendee.booking = $rootScope.newBookingId;
				var queryParams = $location.search();
				$scope.attendee.booking = queryParams.booking_id;
				var attendee = new BookingService.createAttendee($scope.attendee);
				attendee.$save(function(response) {
					$scope.attendee = {};
				});
			} else {
				$scope.submitted = true;
			}
			$scope.loadAttendees();
		};
		$scope.loadBookingDetails = function() {
				var queryParams = $location.search();
				$scope.bookingDetailId = queryParams.booking_id;
				BookingService.loadBookings.get({
		    		bookingId: $scope.bookingDetailId
		            }, function (booking) {
		                $scope.bookingDetail = booking;
		                $scope.bookingStartTimeSuccess=new Date($scope.bookingDetail.bookingStartTime);
		                $scope.bookingEndTimeSuccess=new Date($scope.bookingDetail.bookingEndTime);
		                $scope.bookingDetailTotalPrice=$scope.bookingDetail.priceWithoutTax*$scope.bookingDetail.totalHours;
		                
		            });
		};
		$scope.loadMyBookingDetails = function() {
			$scope.bookingDetailId = $stateParams.bookingId;
				BookingService.loadBookings.get({
		    		bookingId: $scope.bookingDetailId
		            }, function (booking) {
		                $scope.bookingDetail = booking;
		                $scope.bookingStartTime=new Date($scope.bookingDetail.bookingStartTime);
		                $scope.bookingEndTime=new Date($scope.bookingDetail.bookingEndTime);
		            });
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
			//$scope.selectDate=$scope.localTimeToServer($scope.searchObj.stime);
			$scope.selectDate=$scope.searchObj.stime;
			BookingService.loadRoomSchedule.get({
				'roomId':$stateParams.roomId,
				'selectdate' : $scope.selectDate
			}, function(response) {
				$rootScope.schedule = response;
				//console.log($rootScope.schedule);
			}, function(error) {
				console.log(error);
			});
			//console.log("in load schedules" + $rootScope.dateObj);
			
		     var startTime=$rootScope.dateObj.sTime.split(" ");
		     var startMeridiem = startTime[1];
		     var stime = startTime[0].split(":");
		     var sTimeHrs = parseInt(stime[0]);
		     var sTimeMins = parseInt(stime[1]);
		    // console.log(startTime);
		     var endTime=$rootScope.dateObj.etime.split(" ");
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
					console.log("error in booking");
				} else {
					$scope.PayBoookNow(room, isAgreed);
				}
			}
		};
		$scope.loadBooking=function(){
			$scope.dtOptions1 = DTOptionsBuilder.newOptions().withPaginationType('full_numbers').withDisplayLength(10);
			$scope.dtColumnDefs1 = [
			                   DTColumnDefBuilder.newColumnDef(0).notVisible(),
			                   DTColumnDefBuilder.newColumnDef(1),
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
			BookingService.loadBookings.query(function (bookings) {
                $scope.bookings = bookings;
                });
		};
		$scope.loadPartnerBooking=function(){
			$scope.dtOptions2 = DTOptionsBuilder.newOptions().withPaginationType('full_numbers').withDisplayLength(10);
			$scope.dtColumnDefs2 = [
			                   DTColumnDefBuilder.newColumnDef(0).notVisible(),
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
			console.log(MeanUser.user);
			BookingService.loadPartnerBooking.query({
				'partner' :$scope.partnerUser
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
		$scope.calculateServiceTax=function(timeType,price){
			if (timeType==1){
				$rootScope.priceReqired=price;
				$scope.totalPricePerHour=price * $scope.totalHours;
	            $scope.discount= $scope.totalPricePerHour - 0;
				$scope.servicetax=$scope.discount*(14.5/100);
				$scope.totalPrice=$scope.discount + $scope.servicetax;
			}
			else{
		    $rootScope.priceReqired=price;
			$scope.totalPricePerHour=price;
            $scope.discount= price - 0;
			$scope.servicetax=$scope.discount*(14.5/100);
			$scope.totalPrice=$scope.discount + $scope.servicetax;
			}
		};
		$scope.loadGuest=function(){
			$scope.guest = {};
		};
		//$scope.userBookings = [];
	
		$scope.loadUserBooking=function(){
			$scope.dtOptions = DTOptionsBuilder.newOptions().withPaginationType('full_numbers').withDisplayLength(10);
			$scope.dtColumnDefs = [
			                   DTColumnDefBuilder.newColumnDef(0).notVisible(),
			                   DTColumnDefBuilder.newColumnDef(1),
			                   DTColumnDefBuilder.newColumnDef(2),
			                   DTColumnDefBuilder.newColumnDef(3),
			                   DTColumnDefBuilder.newColumnDef(4),
			                   DTColumnDefBuilder.newColumnDef(5),
			                   DTColumnDefBuilder.newColumnDef(6),
			                   DTColumnDefBuilder.newColumnDef(7),
			                   DTColumnDefBuilder.newColumnDef(8).notSortable()
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
			$scope.image = $scope.$scope.logUser.avatar;
                         $scope.res = $scope.image.split("upload");
                         $scope.thumbimg = $scope.res[0] + "upload/w_50,h_50,c_thumb" + $scope.res[1];
			$scope.userBookingUser=$scope.logUser._id;
			BookingService.loadUserBookings.query({
				'user' : $scope.userBookingUser
			},function(response) {
				$scope.userBookings= response;
		    });
			
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
			    	     $scope.finalCommissionValue=(bookingPrice*$scope.requiredCommissionPercentage)/100;
			    	     $scope.PartnerFinalPrice=bookingPrice-$scope.finalCommissionValue;
					}
		    	     
				});
	    	      
	     };
	     $scope.redirectAttendee=function(id,urlPath){
	    	  urlPath = urlPath.replace(":bookingId", id);
              $location.path(urlPath);
	     };
	     $scope.loadAttendees=function(){
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
				        //window.alert = nativeAlert;
				        message.indexOf("DataTables warning") >= 0 ?
				        		  console.warn(message) :
				        	            nativeAlert(message);
				    }
				})();
				var queryParams = $location.search();
				var bookingId = queryParams.booking_id;
				BookingService.loadAttendees.query({
					'booking' :bookingId
				}, function(response) {
					$scope.attendeesDetails = response;
				});
				
			};
		$scope.loginUser = function(){
			 $cookies.put('loginCookie', 'userLoggingin');
			 $cookies.put('BookingId',$stateParams.roomId );
			 console.log($stateParams.roomId);
			 MeanUser.login($scope.login.user);
		};

  }
]);
