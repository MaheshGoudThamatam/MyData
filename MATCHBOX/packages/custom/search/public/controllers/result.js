'use strict';

/* jshint -W098 */
angular.module('mean.search').controller('RoomResultController',
		function($scope, Global, RoomService, $location, $stateParams, MeanUser, $rootScope, SEARCH, SearchService, BOOKING, RoomResultService, $timeout, NgMap, flash, MESSAGES, URLFactory) {
			
			$scope.package = {
				name : 'search'
			};
			$scope.SEARCH = SEARCH;
			$scope.roomPhotos = [];
			$scope.spacePhotos = [];
			$scope.photos = [];
			//$scope.pageNo = 0;
			$scope.authenticated = MeanUser.loggedin;
			flashmessageOn($rootScope, $scope,flash);
			hideBgImageAndFooter($rootScope);

			$(".absoluteOne").css('width', '100%');
			$(".absoluteOne2").css('width', '50%');
			
			$scope.jqueryWidth = function() {
			if( $(window).width() <= 415){
				$(".listPage-d320").remove();
				$(".detailPage-d320").remove();

				$('#tabs a').on('click', function(e){
	                // console.log('i m here');
	                $('#tabs a.current').removeClass('current');
	                $('.tab-section:visible').fadeOut(1000);
	                $(this.hash).fadeIn(1000);
	                $(this).addClass('current');
	                e.preventDefault();
            	});

	            $('.filterSection').hide();
	            $('#filterMe').on('click',function(){
	                // $('.filterSection').slideToggle('medium');
	                $('.filterSection').slideToggle({
	                	 duration: 400
            			 // step: resizeContentHeight
	                });
	                e.preventDefault();
	            });
	            $('#cancelBtn , #applyBtn').on('click',function(){
	                $('.filterSection').slideUp('medium');
	            });

			}
			else {
				$(".listFullPage").remove();
				$(".detailFullPage").remove();
				$(document).ready(function(){
				$('#tabs a').bind('click', function(e){
	                // console.log('i m here');
	                $('#tabs a.current').removeClass('current');
	                $('.tab-section:visible').fadeOut(1000);
	                $(this.hash).fadeIn(1000);
	                $(this).addClass('current');
	                e.preventDefault();
	           		 });
				$('#listView').hide();

	            $('.filterSection').hide();
	            $('#filterMe').bind('click',function(){
	                // $('.filterSection').slideToggle('medium');
	                $('.filterSection').slideToggle({
	                	 duration: 400
            			 // step: resizeContentHeight
	                });
	                e.preventDefault();
	            });
	            $('#cancelBtn , #applyBtn').on('click',function(){
	                $('.filterSection').slideUp('medium');
	            });
	        });
        	}
		}
			$scope.jqueryWidth();
			$scope.BOOKING = BOOKING;
			$scope.searchElements = {};
			
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
			
			$scope.findSearchRoomsList = function(){
				$scope.searchParameters();
				$scope.isTrainingOrHotDesk = false;
				$scope.isTraining = false;
				$scope.isHotDesk = false;
				
				var queryParams = $location.search();
				
				if(queryParams.roomType === SEARCH.CONSTANT.TRAINING_ROOM || queryParams.roomType === SEARCH.CONSTANT.HOT_DESK){
					$scope.searchElements.fromDate = queryParams.from_date;
					$scope.searchElements.endDate = queryParams.end_date;
					
					$scope.searchElements.excludeSunday = queryParams.excludeSunday;
					$scope.searchElements.excludeHoliday = queryParams.excludeHoliday;
				}
					
   				$scope.searchObj = $scope.searchElements;
				var startTimeBooking = $scope.searchObj.stime;
				var endTimeBooking = $scope.searchObj.etime;
				var datesel = $scope.searchObj.date;
				
				var listRating = false;
				if(queryParams.roomType === SEARCH.CONSTANT.TRAINING_ROOM || queryParams.roomType === SEARCH.CONSTANT.HOT_DESK){
					$scope.bookingStartTime = startTimeBooking;
					$scope.bookingEndTime = endTimeBooking;
						
					$scope.bookingFromDate = $scope.searchObj.fromDate;
					$scope.bookingToDate = $scope.searchObj.endDate;
					$scope.isTrainingOrHotDesk = true;
					if(queryParams.roomType === SEARCH.CONSTANT.TRAINING_ROOM){
						$scope.isTraining = true;
					}
					if(queryParams.roomType === SEARCH.CONSTANT.HOT_DESK){
						$scope.isHotDesk = true;
					}
				} else {
					$scope.bookingStartTime = moment.utc(startTimeBooking).format('LT');
					$scope.bookingEndTime = moment.utc(endTimeBooking).format('LT');
					
					$scope.bookingDate = moment(datesel).format('DD-MM-YYYY');
					$scope.isTrainingOrHotDesk = false;
					$scope.isTraining = false;
					$scope.isHotDesk = false;
				}
				//$scope.searchObj = angular.copy($scope.searchElements);
				if($scope.isPriceSort){
					$scope.searchElements.priceSortObj = $scope.priceSortObj;
				}else if ($scope.isRatingSort){
					$scope.searchElements.ratingSort = $scope.ratingSort;
				}
				
				$scope.searchObj = $scope.searchElements;
				
				if ($rootScope.dateObj) {
				   $rootScope.dateObj = $rootScope.dateObj;
				}
				
				if(!(queryParams.roomType === SEARCH.CONSTANT.TRAINING_ROOM) && !(queryParams.roomType === SEARCH.CONSTANT.HOT_DESK)){
					$scope.searchElements.stime = new Date($scope.searchElements.stime).toUTCString();	
					$scope.searchElements.etime = new Date($scope.searchElements.etime).toUTCString();
				}
				
				if($scope.filterApplied){
					$scope.pageNo = 0;
				} else {
					$scope.pageNo = parseInt(queryParams.pageNo);
				}
				$scope.searchElements.timeZoneOffset = parseInt(queryParams.timeZoneOffset);
				$rootScope.searchObj = $scope.searchObj;

				if(queryParams.roomType === SEARCH.CONSTANT.HOT_DESK){
					$scope.searchElements.fromToDates = $rootScope.dateTimeList;
				}
				
				if ($rootScope.searchAmenities && $rootScope.searchAmenities.length > 0) {
					$scope.searchElements.amenities = [];
					$scope.searchamenities = $rootScope.searchAmenities;
					$scope.searchElements.amenities = $scope.searchamenities;
				}
				
				if((queryParams.roomType === SEARCH.CONSTANT.MEETING_ROOM) || (queryParams.roomType === SEARCH.CONSTANT.BOARD_ROOM)){
					if(new Date($scope.searchElements.stime) > new Date($scope.searchElements.etime)){
						$scope.URLChange = true;
					} else {
						$scope.URLChange = false;
					}
				} else if(queryParams.roomType === SEARCH.CONSTANT.TRAINING_ROOM || queryParams.roomType === SEARCH.CONSTANT.HOT_DESK){
					if((new Date($scope.searchElements.fromDate) > new Date($scope.searchElements.endDate)) || 
							(new Date($scope.searchElements.fromDate + " " + $scope.searchElements.stime) > new Date($scope.searchElements.endDate + " " + $scope.searchElements.stime))){
						$scope.URLChange = true;
					} else {
						$scope.URLChange = false;
					}
				} else {
					$scope.URLChange = false;
				}

				if($scope.URLChange){
					flash.setMessage(URLFactory.MESSAGES.URL_TIME_CHANGE, URLFactory.MESSAGES.ERROR);
				} else {
					var search = new SearchService.search($scope.searchElements);
			    	search.$save({
			    		perPage : 6,
			    		page : $scope.pageNo
			    	}, function(searchedList){
			    		console.log(searchedList);
			    		$rootScope.hotDeskList = searchedList.rooms;
			    		$scope.totalSearchedRooms = searchedList.totalSearchedRooms;
			    		$rootScope.dateDiff = searchedList.dateDiff;
			    		$scope.searchElements.dateDiff = searchedList.dateDiff;
			    		if(!angular.isUndefined(searchedList.rooms) && searchedList.rooms.length > 0){
			    			$scope.rooms = searchedList.rooms;
			    			console.log($scope.rooms);
			    			$rootScope.initMap = true;
			    			NgMap.getMap().then(function(map) {
			    				$scope.map = map;
			    			});
			    			$timeout(function(){
			    				$scope.loadLatLong();
			    			},2000);
			    			/*$scope.$on('mapInitialized', function (event, map) {
			    		        console.log("----inside map initialised function----");
			    		        $scope.map = map;
			    		        $scope.map.bounds = new google.maps.LatLngBounds();
			    		        if($rootScope.initMap){
			    		        	$rootScope.initMap = false;
			    		        	$scope.loadLatLong();
			    				}
			    			});*/
			    			$scope.showNextButton();
			    			$scope.calculatePrice();
			    		}else{
			    			$scope.rooms = searchedList.rooms;
			    			flash.setMessage(URLFactory.MESSAGES.ROOM_NOT_FOUND,URLFactory.MESSAGES.ERROR);
			    		}
			    	}, function(error){
			        	console.log(error);
			    	});
				}
			};
			
			$scope.list = function() {
				if ($rootScope.searchObj) {
					$scope.searchObj = $rootScope.searchObj;
				}
				if (!angular.isUndefined($rootScope.searchedList)) {
					$scope.rooms = $rootScope.searchedList;
					$scope.calculatePrice();
					NgMap.getMap().then(function(map) {
				        $scope.map = map;
				    });
					$timeout(function(){
						$scope.loadLatLong();
					}, 1000);
				}
			};
			
			$scope.detail = function(urlPath, room) {
				if($scope.searchElements.roomType === SEARCH.CONSTANT.TRAINING_ROOM){
					urlPath = urlPath.replace(":roomId", room._id);
					urlPath = urlPath + '?search_lon=' + $scope.searchElements.lon +'&search_lat=' + $scope.searchElements.lat + '&capacitymin='+$scope.searchElements.capacity.min+ '&capacitymax='+$scope.searchElements.capacity.max+ '&start_time='+$scope.searchElements.stime+ '&end_time='+$scope.searchElements.etime +'&roomType='+$scope.searchElements.roomType+'&place='+$scope.searchElements.place+'&from_date='+$scope.searchElements.fromDate+'&end_date='+$scope.searchElements.endDate+'&timeType='+$scope.searchElements.timeType+'&dateselc='+$scope.searchElements.date+'&excludeSunday='+$scope.searchElements.excludeSunday+'&excludeHoliday='+$scope.searchElements.excludeHoliday+'&timeZoneOffset='+$scope.searchElements.timeZoneOffset+'&dateDiff='+$scope.searchElements.dateDiff+'&pageNo='+0;
					$location.url(urlPath);
				} else if($scope.searchElements.roomType === SEARCH.CONSTANT.HOT_DESK){
					urlPath = urlPath.replace(":roomId", room._id);
					urlPath = urlPath + '?search_lon=' + $scope.searchElements.lon +'&search_lat=' + $scope.searchElements.lat + '&capacitymin='+$scope.searchElements.capacity.min+ '&capacitymax='+$scope.searchElements.capacity.max+ '&start_time='+$scope.searchElements.stime+ '&end_time='+$scope.searchElements.etime +'&roomType='+$scope.searchElements.roomType+'&place='+$scope.searchElements.place+'&from_date='+$scope.searchElements.fromDate+'&end_date='+$scope.searchElements.endDate+'&timeType='+$scope.searchElements.timeType+'&dateselc='+$scope.searchElements.date+'&excludeSunday='+$scope.searchElements.excludeSunday+'&excludeHoliday='+$scope.searchElements.excludeHoliday+'&timeZoneOffset='+$scope.searchElements.timeZoneOffset+'&dateDiff='+$scope.searchElements.dateDiff+'&pageNo='+0;
					$location.url(urlPath);
				} else {
					urlPath = urlPath.replace(":roomId", room._id);
					$location.path(urlPath);
				}
			};
             
			   
			$scope.bookNow = function(urlPath,id) {
				console.log($scope.searchElements);
				$scope.searchParameters();
				if($scope.searchElements.roomType === SEARCH.CONSTANT.TRAINING_ROOM){
					urlPath = BOOKING.URL_PATH.BOOKING_TRAINING_ROOM+'?search_lon=' + $scope.searchElements.lon +'&search_lat=' + $scope.searchElements.lat + '&capacitymin='+$scope.searchElements.capacity.min+ '&capacitymax='+$scope.searchElements.capacity.max+ '&start_time='+$scope.searchElements.stime+ '&end_time='+$scope.searchElements.etime +'&roomType='+$scope.searchElements.roomType+'&place='+$scope.searchElements.place+'&from_date='+$scope.searchElements.fromDate+'&end_date='+$scope.searchElements.endDate+'&timeType='+$scope.searchElements.timeType+'&excludeSunday='+$scope.searchElements.excludeSunday+'&excludeHoliday='+$scope.searchElements.excludeHoliday+'&dateDiff=' + $scope.searchElements.dateDiff+'&dateselc='+$scope.searchElements.date+'&pageNo='+$scope.pageNo;
					urlPath = urlPath.replace(":roomId", id);
					$location.url(urlPath);	
				} else if($scope.searchElements.roomType === SEARCH.CONSTANT.HOT_DESK){
					urlPath = BOOKING.URL_PATH.BOOKING_HOT_DESK+'?search_lon=' + $scope.searchElements.lon +'&search_lat=' + $scope.searchElements.lat + '&capacitymin='+$scope.searchElements.capacity.min+ '&capacitymax='+$scope.searchElements.capacity.max+ '&start_time='+$scope.searchElements.stime+ '&end_time='+$scope.searchElements.etime +'&roomType='+$scope.searchElements.roomType+'&place='+$scope.searchElements.place+'&from_date='+$scope.searchElements.fromDate+'&end_date='+$scope.searchElements.endDate+'&timeType='+$scope.searchElements.timeType+'&excludeSunday='+$scope.searchElements.excludeSunday+'&excludeHoliday='+$scope.searchElements.excludeHoliday+'&dateDiff=' + $scope.searchElements.dateDiff+'&dateselc='+$scope.searchElements.date+'&pageNo='+$scope.pageNo;
					urlPath = urlPath.replace(":roomId", id);
					$location.url(urlPath);	
				} else {
					urlPath = BOOKING.URL_PATH.BOOKINGS+'?search_lon=' + $scope.searchElements.lon +'&search_lat=' + $scope.searchElements.lat + '&capacitymin='+$scope.searchElements.capacity.min+ '&capacitymax='+$scope.searchElements.capacity.max+ '&start_time='+$scope.searchElements.stime+ '&end_time='+$scope.searchElements.etime +'&roomType='+$scope.searchElements.roomType+'&place='+$scope.searchElements.place+'&from_date='+$scope.searchElements.fromDate+'&end_date='+$scope.searchElements.endDate+'&timeType='+$scope.searchElements.timeType+'&excludeSunday='+$scope.searchElements.excludeSunday+'&excludeHoliday='+$scope.searchElements.excludeHoliday+'&dateDiff=' + $scope.searchElements.dateDiff+'&dateselc='+$scope.searchElements.date+'&pageNo='+$scope.pageNo;
					urlPath = urlPath.replace(":roomId", id);
					$location.url(urlPath);	
				}
				
				
			};

			$scope.filterDate = function(createdDate) {
				RoomService.roomdatefilter.query({
					"createdDateFilter" : createdDate
				}, function(response) {
					$scope.rooms = response;
				}, function(error) {
					console.log(error);
				});

			};
			$scope.generateTempUrl = function(response) {
				var image = response;
				var res = image.split("upload");
				var resp = res[0] + "upload/w_100,h_100,c_thumb" + res[1];
				return resp;
			}
			$scope.generateTempUrl1 = function(response) {
				var image = response;
				var res = image.split("upload");
				var resp = res[0] + "upload/w_800,h_500,c_thumb" + res[1];
				return resp;
			}

			$scope.spaceImage = function(rooms) {
				$scope.searchedRooms = rooms;
			};

			/*$scope.loadAmenities = function() {
				RoomResultService.amenity.query(function(amenity) {
					$scope.amenities = amenity;
				});
			};*/
			
			$scope.loadLatLong = function() {
				
				$scope.roomPostions = $scope.rooms;
				console.log($scope.markers);
				if($scope.markers){
					delete $scope.markers;
				}
				$scope.markers = [];
				
				for (var i = 0; i < $scope.roomPostions.length; i++) {
					var marker = {};
					marker._id = $scope.roomPostions[i]._id;
					marker.name = $scope.roomPostions[i].name;
					marker.longitude = $scope.roomPostions[i].loc[0];
					marker.latitude = $scope.roomPostions[i].loc[1];
					marker.options = {
						animation : google.maps.Animation.BOUNCE
					};
					$scope.markers.push(marker);
				}
				var myOptions = {
					zoom: 5
				};
				$scope.bounds = new google.maps.LatLngBounds();
				
			    $scope.tempInfoWindows = new google.maps.InfoWindow();
			    $timeout(function(){
			    	$scope.placeMarkers();
			    }, 1000);
				/*$scope.placeMarkers();*/
				
			};
			
			/*$rootScope.GoogleMapMarkers = [];*/
			$scope.placeMarkers = function(){

				if (!angular.isUndefined($rootScope.GoogleMapMarkers) && $rootScope.GoogleMapMarkers.length > 0) {
					for(var i = 0; i < $rootScope.GoogleMapMarkers.length; i++) {
						$rootScope.GoogleMapMarkers[i].setMap(null);
					}
				} else {
					$rootScope.GoogleMapMarkers = [];
				}
				$rootScope.GoogleMapMarkers = [];

				for(var i = 0; i < $scope.markers.length; i++){
					var location = $scope.markers[i];
		            if (location.latitude != "" && location.latitude != null) {
		            	var templocation = location;
		            	var irsInfoBoxHTML = "";
		            	var id = location._id;
		                
			            var point = new google.maps.LatLng(templocation.latitude, templocation.longitude);

			            // extend the bounds to include the new point
			            /*$scope.map.bounds.extend(point);*/
			            console.log($scope.map);
			            $scope.bounds.extend(point);
			            $scope.map.fitBounds($scope.bounds);
			            
			            var zoomChangeBoundsListener = google.maps.event.addListenerOnce($scope.map, 'bounds_changed', function(event) {
			            	if ($scope.map.getZoom()){
		                    	if($scope.map.getZoom() < 12){
		                    		$scope.map.setZoom($scope.map.getZoom());
		                    	} else {
			                    	$scope.map.setZoom(12);
		                    	}
		                    }
			            });
			            $timeout(function(){
			            	google.maps.event.removeListener(zoomChangeBoundsListener)
			            }, 2000);
			            
			            var marker = new google.maps.Marker({
			                position: point,
			                map: $scope.map,
			                title : location.name,
			                _id : location._id,
							icon : '/system/assets/img/custom/icon-maker.png'
			            });

			            $rootScope.GoogleMapMarkers.push(marker);
		            }
		        };
			};
			
			$scope.findOne = function() {
				$scope.searchParameters();
				var queryParams = $location.search();
				
				if(queryParams.roomType === SEARCH.CONSTANT.TRAINING_ROOM || queryParams.roomType === SEARCH.CONSTANT.HOT_DESK){
					$scope.searchElements.fromDate = queryParams.from_date;
					$scope.searchElements.endDate = queryParams.end_date;
				}
				
				$scope.searchObj = $scope.searchElements;
				
				var startTimeBooking = $scope.searchObj.stime;
				var endTimeBooking = $scope.searchObj.etime;
				var datesel = $scope.searchObj.date;
				if(queryParams.roomType === SEARCH.CONSTANT.TRAINING_ROOM || queryParams.roomType === SEARCH.CONSTANT.HOT_DESK){
					$scope.bookingStartTime = startTimeBooking;
					$scope.bookingEndTime = endTimeBooking;
						
					$scope.bookingFromDate = $scope.searchObj.fromDate;
					$scope.bookingToDate = $scope.searchObj.endDate;
					$scope.isTrainingOrHotDesk = true;
					if(queryParams.roomType === SEARCH.CONSTANT.TRAINING_ROOM){
						$scope.isTraining = true;
					}
					if(queryParams.roomType === SEARCH.CONSTANT.HOT_DESK){
						$scope.isHotDesk = true;
					}
				} else {
					$scope.bookingStartTime = moment.utc(startTimeBooking).format('LT');
					$scope.bookingEndTime = moment.utc(endTimeBooking).format('LT');
					
					$scope.bookingDate = moment(datesel).format('DD-MM-YYYY');
					$scope.isTrainingOrHotDesk = false;
					$scope.isTraining = false;
					$scope.isHotDesk = false;
				}
				
				if((queryParams.roomType === SEARCH.CONSTANT.MEETING_ROOM) || (queryParams.roomType === SEARCH.CONSTANT.BOARD_ROOM)){
					if(new Date($scope.searchElements.stime) > new Date($scope.searchElements.etime)){
						$scope.URLChange = true;
					} else {
						$scope.URLChange = false;
					}
				} else if(queryParams.roomType === SEARCH.CONSTANT.TRAINING_ROOM || queryParams.roomType === SEARCH.CONSTANT.HOT_DESK){
					if((new Date($scope.searchElements.fromDate) > new Date($scope.searchElements.endDate)) || 
							(new Date($scope.searchElements.fromDate + " " + $scope.searchElements.stime) > new Date($scope.searchElements.endDate + " " + $scope.searchElements.stime))){
						$scope.URLChange = true;
					} else {
						$scope.URLChange = false;
					}
				} else {
					$scope.URLChange = false;
				}
				
				if($scope.URLChange){
					flash.setMessage(URLFactory.MESSAGES.URL_TIME_CHANGE, URLFactory.MESSAGES.ERROR);
				} else {
					RoomService.roomdetails.get({
						roomId : $stateParams.roomId
					}, function(rooms) {
						$scope.rooms = rooms;
						$rootScope.roomsDetail = $scope.rooms;
						$rootScope.$emit('latLongForRoom');
			    		$rootScope.dateDiff = $scope.searchElements.dateDiff;
						/*$rootScope.$emit('specificMarkerDetail');*/
						$scope.calculateTimetypeDetail();
						$scope.roomPhotos = $scope.rooms.images.map(function(room) {
							return {src: room.url};
						});
						$scope.spacePhotos = $scope.rooms.spaceId.images.map(function(space) {
							return {src: space.url};
						});
	
						$scope.photos = $scope.roomPhotos.concat($scope.spacePhotos);
					});
				}
			};

		    // initial image index
		    $scope._Index = 0;

		    // if a current image is the same as requested image
		    $scope.isActive = function (index) {
		        return $scope._Index === index;
		    };

		    // show prev image
		    $scope.showPrev = function () {
		        $scope._Index = ($scope._Index > 0) ? --$scope._Index : $scope.photos.length - 1;
		    };

		    // show next image
		    $scope.showNext = function () {
		        $scope._Index = ($scope._Index < $scope.photos.length - 1) ? ++$scope._Index : 0;
		    };

		    // show a certain image
		    $scope.showPhoto = function (index) {
		        $scope._Index = index;
		    };
		    
		    $scope.dateDifference = function(fromDate, toDate){
				var date1 = new Date(fromDate);
				var date2 = new Date(toDate);
				var timeDiff = Math.abs(date2.getTime() - date1.getTime());
				var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
				return diffDays;
			}

		   $scope.calculatePrice = function(){
			   	 console.log($scope.calculatePriceNew);
			   	 var splittedStartTime, splittedEndTime;
			   	 var meetBoardStartTime, meetBoardEndTime; 
			   	 if($scope.calculatePriceNew.roomType === SEARCH.CONSTANT.TRAINING_ROOM || $scope.calculatePriceNew.roomType === SEARCH.CONSTANT.HOT_DESK){
				   	 splittedStartTime = $scope.calculatePriceNew.stime.split(" ");
				   	 splittedEndTime = $scope.calculatePriceNew.etime.split(" ");
					 $scope.selectFromDate = $scope.searchElements.fromDate + " " + $scope.searchElements.stime;
					 $scope.selectEndDate = $scope.searchElements.endDate + " " + $scope.searchElements.etime;
					 //$scope.totalDateHoursDiff = $scope.dateDifference($scope.selectFromDate, $scope.selectEndDate);
					 $scope.totalDateHoursDiff = parseInt($rootScope.dateDiff);
			   	 } else {
			   		meetBoardStartTime = $scope.calculatePriceNew.stime.substr($scope.calculatePriceNew.stime.indexOf(' ')+1);
			   		meetBoardEndTime = $scope.calculatePriceNew.etime.substr($scope.calculatePriceNew.stime.indexOf(' ')+1);
			   		splittedStartTime = meetBoardStartTime.split(" ");
				   	splittedEndTime = meetBoardEndTime.split(" ");
			   	 }
			   	 
		    	 var startTime = splittedStartTime[0]; 
			     var startMeridiem = splittedStartTime[1];
			     var stime = startTime.split(":");
			     var sTimeHrs = parseInt(stime[0]);
			     var sTimeMins = parseInt(stime[1]);

		    	 /*var splittedEndTime = $scope.calculatePriceNew.etime.split(" ");*/
			     var endTime = splittedEndTime[0]; 
			     var endMeridiem = splittedEndTime[1];
			     var etime = endTime.split(":");
			     var eTimeHrs = parseInt(etime[0]);
			     var eTimeMins = parseInt(etime[1]);
			     // Calculating hrs
			     if(startMeridiem == "PM" && sTimeHrs != '12'){
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
			     $scope.calculateTimeType($scope.totalHours, $scope.totalDateHoursDiff);
		    };
		    
		    
			 $scope.calculateTimeType = function(totalHours, totalDateHoursDiff) {
				var totalDateHoursDifference = parseInt(totalDateHoursDiff);
				var totalHoursObj = parseInt(totalHours);
				if ($scope.searchElements.timeType === "Half Day") {
					$scope.timeType = 2;
				} else if ($scope.searchElements.timeType === "Full Day") {
					$scope.timeType = 3;
				} else {
					$scope.rooms.map(function(room) {
						if($scope.calculatePriceNew.roomType === SEARCH.CONSTANT.TRAINING_ROOM){
							if(totalHoursObj == 4){
								$scope.timeType = 2;
								//room.pricePerhalfday = room.pricePerhalfday;
								$scope.pricePerHour = $scope.rooms.pricePerhalfday * totalDateHoursDifference;
							} else {
								$scope.timeType = 3;
								//room.pricePerfullday = room.pricePerfullday;
								$scope.pricePerHour = $scope.rooms.pricePerfullday * totalDateHoursDifference;
							}
						} else if($scope.calculatePriceNew.roomType === SEARCH.CONSTANT.HOT_DESK){
							if(totalHoursObj == 4){
								$scope.timeType = 2;
								//room.pricePerhalfday = room.pricePerhalfday;
								$scope.pricePerHour = $scope.rooms.pricePerhalfday * totalDateHoursDifference;
							} else if (totalHoursObj == 8){
								$scope.timeType = 3;
								//room.pricePerfullday = room.pricePerfullday;
								$scope.pricePerHour = $scope.rooms.pricePerfullday * totalDateHoursDifference;
							} else {
								$scope.timeType = 1;
								//room.pricePerhour = room.pricePerhour * parseInt(totalHours);
								$scope.pricePerHour = $scope.rooms.pricePerhour * totalHoursObj * totalDateHoursDifference;
							}
						} else {
							if(totalHoursObj == 4){
								$scope.timeType = 2;
								//room.pricePerhalfday = room.pricePerhalfday;
								$scope.pricePerHour = room.pricePerhalfday;
							} else if (totalHoursObj == 8){
								$scope.timeType = 3;
								//room.pricePerfullday = room.pricePerfullday;
								$scope.pricePerHour = room.pricePerhalfday;
							} else {
								$scope.timeType = 1;
								//room.pricePerhour = room.pricePerhour * parseInt(totalHours);
								$scope.pricePerHour = room.pricePerhour * totalHoursObj;
							}
						}
						console.log('TIME Type : ' + $scope.timeType);
					});
				}
				$scope.roomslist = $scope.rooms;
			};
		    	  
		    	  $scope.calculateTimetypeDetail = function(){
		    		  $scope.searchParameters();
					  $scope.noOfDesks = parseInt($scope.searchElements.capacity.max);
		    		  if($scope.calculatePriceNew.roomType === "Hot Desk" || $scope.calculatePriceNew.roomType === "Training Room"){
						  $scope.selectFromDate = $scope.searchElements.fromDate + " " + $scope.searchElements.stime;
						  $scope.selectEndDate = $scope.searchElements.endDate + " " + $scope.searchElements.etime;
						  //$scope.totalDateHoursDiff = $scope.dateDifference($scope.selectFromDate, $scope.selectEndDate);
						  $scope.totalDateHoursDiff = parseInt($rootScope.dateDiff);

						  	 var splittedStartTime = $scope.calculatePriceNew.stime.split(" ");
					    	 var startTime = splittedStartTime[0]; 	
						     var startMeridiem = splittedStartTime[1];
						     var stime = startTime.split(":");
						     var sTimeHrs = parseInt(stime[0]);
						     var sTimeMins = parseInt(stime[1]);
						     var splittedEndTime = $scope.calculatePriceNew.etime.split(" ");
						     var endTime = splittedEndTime[0]; 
						     var endMeridiem = splittedEndTime[1];
						     var etime = endTime.split(":");
						     var eTimeHrs = parseInt(etime[0]);
						     var eTimeMins = parseInt(etime[1]);
						     // Calculating hrs
						     if(startMeridiem == "PM" && sTimeHrs != '12'){
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
						     console.log($scope.totalHours);
		    		  } else {
		    			 var splittedStartTime = $scope.calculatePriceNew.stime.split(" ");
				    	 var startTime = splittedStartTime[1]; 	
					     var startMeridiem = splittedStartTime[2];
					     var stime = startTime.split(":");
					     var sTimeHrs = parseInt(stime[0]);
					     var sTimeMins = parseInt(stime[1]);
					     var splittedEndTime = $scope.calculatePriceNew.etime.split(" ");
					     var endTime = splittedEndTime[1]; 
					     var endMeridiem = splittedEndTime[2];
					     var etime = endTime.split(":");
					     var eTimeHrs = parseInt(etime[0]);
					     var eTimeMins = parseInt(etime[1]);
					     // Calculating hrs
					     if(startMeridiem == "PM" && sTimeHrs != '12'){
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
		    		  }
					  $scope.calculatePriceDetail($scope.totalHours, $scope.totalDateHoursDiff, $scope.noOfDesks);
				    };

				    
					$scope.calculatePriceDetail = function(totalHours, totalDateHoursDiff, noOfDesks) {
						var totalDateHoursDifference = parseInt(totalDateHoursDiff);
						var totalHoursObj = parseInt(totalHours);
						if ($scope.searchElements.timeType === "Half Day") {
							$scope.timeType = 2;
						} else if ($scope.searchElements.timeType === "Full Day") {
							$scope.timeType = 3;
						} else {
							if($scope.calculatePriceNew.roomType === SEARCH.CONSTANT.TRAINING_ROOM){
								if(totalHoursObj == 4){
									$scope.timeType = 2;
									//room.pricePerhalfday = room.pricePerhalfday;
									$scope.pricePerHour = $scope.rooms.pricePerhalfday * totalDateHoursDifference;
								} else {
									$scope.timeType = 3;
									//room.pricePerfullday = room.pricePerfullday;
									$scope.pricePerHour = $scope.rooms.pricePerfullday * totalDateHoursDifference;
								}
							} else if($scope.calculatePriceNew.roomType === SEARCH.CONSTANT.HOT_DESK){
								if(totalHoursObj == 4){
									$scope.timeType = 2;
									//room.pricePerhalfday = room.pricePerhalfday;
									$scope.pricePerHour = $scope.rooms.pricePerhalfday * totalDateHoursDifference;
									$scope.pricePerHour = $scope.pricePerHour * noOfDesks;
								} else if (totalHoursObj == 8){
									$scope.timeType = 3;
									//room.pricePerfullday = room.pricePerfullday;
									$scope.pricePerHour = $scope.rooms.pricePerfullday * totalDateHoursDifference;
									$scope.pricePerHour = $scope.pricePerHour * noOfDesks;
								} else {
									$scope.timeType = 1;
									//room.pricePerhour = room.pricePerhour * parseInt(totalHours);
									$scope.pricePerHour = $scope.rooms.pricePerhour * totalHoursObj * totalDateHoursDifference;
									$scope.pricePerHour = $scope.pricePerHour * noOfDesks;
								}
							} else {
								if(totalHoursObj == 4){
									$scope.timeType = 2;
									//room.pricePerhalfday = room.pricePerhalfday;
									$scope.pricePerHour = $scope.rooms.pricePerhalfday;
								} else if (totalHoursObj == 8){
									$scope.timeType = 3;
									//room.pricePerfullday = room.pricePerfullday;
									$scope.pricePerHour = $scope.rooms.pricePerfullday;
								} else {
									$scope.timeType = 1;
									//room.pricePerhour = room.pricePerhour * parseInt(totalHours);
									$scope.pricePerHour = $scope.rooms.pricePerhour * totalHoursObj;
								}
							}
							
						}
					};
			    	  
			    	  $scope.loadAmenities = function(){
			    		     $scope.searchamenities = [];
			            	 RoomResultService.amenity.query(function(amenity){
			            		 $scope.amenities = amenity;
			            	 });
			    	  };

						$scope.addAmenities = function() {
							$scope.searchamenities = [];
							for (var i = 0; i < $scope.amenities.length; i++) {
								if ($scope.amenities[i].amenityfilter && ($scope.amenities[i].amenityfilter === true)) {
									$scope.searchamenities.push({
										amenities : {
											$elemMatch : {
												facilityavailable : true,
												amenityId : $scope.amenities[i]._id
											}
										}
									});
								} else if ($scope.amenities[i].amenityfilter && ($scope.amenities[i].amenityfilter === false)) {
									for(var j = 0; j < $scope.searchamenities.length; j++){
										var fromAmenityList = JSON.stringify($scope.searchamenities[j].amenities.$elemMatch.amenityId);
										var removeAmenity = JSON.stringify($scope.amenities[i]._id);
										if(removeAmenity === fromAmenityList){
											$scope.searchamenities.splice(j, 1);
										}
									}
								}
							}
						};
				 		    
				            $scope.filters = function(){
								$scope.searchParameters();
								if ($scope.searchamenities.length >= 0) {
									$scope.searchElements.amenities = [];
									$rootScope.searchAmenities = $scope.searchamenities;
									$scope.searchElements.amenities = $scope.searchamenities;
									$scope.filterApplied = true;
								} else {
									$scope.filterApplied = false;
								}
				            	$scope.findSearchRoomsList();
							};

				              $scope.cssFunction = function(){
								$( document ).ready(function() {
									while( $('.hotel-text .searchHotelInner').height() > $('.hotel-text').height() ) {
										$('.hotel-name a').css('font-size', (parseInt($('.hotel-item .hotel-text .hotel-name a').css('font-size')) - 1) + "px !important" );
									}
								});
				              };
				            
				            /*$scope.priceFilter = function(priceSort){
				            	$scope.isPriceSort = true;
				            	$scope.isRatingSort = false;
				            	//$scope.priceSort = priceSort;
				            	if($scope.timeType === 1){
				            		$scope.priceSortObj = {
				            			timeType: 'Per Hour',
				            			priceSort: priceSort
				            		}
				            	} else if($scope.timeType === 2){
				            		$scope.priceSortObj = {
				            			timeType: 'Half Day',
				            			priceSort: priceSort
				            		}
				            	} else if($scope.timeType === 3){
				            		$scope.priceSortObj = {
				            			timeType: 'Full Day',
				            			priceSort: priceSort
				            		}
				            	}
				            	$scope.findSearchRoomsList();
				          
				            };
				            
				            
				            $scope.ratingFilter = function(ratingSort)
				            {
				            	console.log(ratingSort);
				            	$scope.isRatingSort = true;
				            	$scope.isPriceSort = false;
				            	$scope.ratingSort = ratingSort;
				            	$scope.findSearchRoomsList();
				         
				            };*/
				            
				            $scope.sortingFilter = function(sortObj){
				            	if(sortObj.indexOf("R") !== -1){
				            		$scope.isRatingSort = true;
					            	$scope.isPriceSort = false;
					            	$scope.ratingSort = sortObj;
					            	$scope.findSearchRoomsList();
				            	} else if(sortObj.indexOf("1") !== -1){
				            		$scope.isPriceSort = true;
					            	$scope.isRatingSort = false;
					            	//$scope.priceSort = sortObj;
					            	if($scope.timeType === 1){
					            		$scope.priceSortObj = {
					            			timeType: 'Per Hour',
					            			priceSort: sortObj
					            		}
					            	} else if($scope.timeType === 2){
					            		$scope.priceSortObj = {
					            			timeType: 'Half Day',
					            			priceSort: sortObj
					            		}
					            	} else if($scope.timeType === 3){
					            		$scope.priceSortObj = {
					            			timeType: 'Full Day',
					            			priceSort: sortObj
					            		}
					            	}
					            	$scope.findSearchRoomsList();
				            	} else {
				            		$scope.isPriceSort = false;
					            	$scope.isRatingSort = false;
					            	$scope.findSearchRoomsList();
				            	}
				            }
				            
				            
				            $scope.intializeCounter = function(){
				            	$scope.pagecounter=0;
				            };	
				            
				            
         $scope.next = function(){
			$scope.searchParameters();
			if ($scope.pageNo >= 0) {
				$scope.filterApplied = false;
				$scope.pageNo=$scope.pageNo + 1;
				$location.url(SEARCH.URL_PATH.SEARCH_LIST+'?search_lon=' + $scope.searchElements.lon +'&search_lat=' + $scope.searchElements.lat + '&capacitymin='+$scope.searchElements.capacity.min+ '&capacitymax='+$scope.searchElements.capacity.max+ '&start_time='+$scope.searchElements.stime+ '&end_time='+$scope.searchElements.etime +'&roomType='+$scope.searchElements.roomType+'&place='+$scope.searchElements.place+'&from_date='+$scope.searchElements.fromDate+'&end_date='+$scope.searchElements.endDate+'&excludeSunday='+$scope.searchElements.excludeSunday+'&excludeHoliday='+$scope.searchElements.excludeHoliday+'&timeType='+$scope.searchElements.timeType+'&timeZoneOffset='+$scope.searchElements.timeZoneOffset+'&dateselc='+$scope.searchElements.date+'&pageNo='+$scope.pageNo);
				$scope.findSearchRoomsList();
				$(window).scrollTop(0);
			}
		}
         
        $scope.prev = function(){
        	$scope.searchParameters();
 			if ($scope.pageNo >= 0) {
 				$scope.filterApplied = false;
 				$scope.pageNo=$scope.pageNo - 1;
 				$location.url(SEARCH.URL_PATH.SEARCH_LIST+'?search_lon=' + $scope.searchElements.lon +'&search_lat=' + $scope.searchElements.lat + '&capacitymin='+$scope.searchElements.capacity.min+ '&capacitymax='+$scope.searchElements.capacity.max+ '&start_time='+$scope.searchElements.stime+ '&end_time='+$scope.searchElements.etime +'&roomType='+$scope.searchElements.roomType+'&place='+$scope.searchElements.place+'&from_date='+$scope.searchElements.fromDate+'&end_date='+$scope.searchElements.endDate+'&excludeSunday='+$scope.searchElements.excludeSunday+'&excludeHoliday='+$scope.searchElements.excludeHoliday+'&timeType='+$scope.searchElements.timeType+'&timeZoneOffset='+$scope.searchElements.timeZoneOffset+'&dateselc='+$scope.searchElements.date+'&pageNo='+$scope.pageNo);
 				$scope.findSearchRoomsList();
 			}
		}

        $scope.showNextButton = function(){
        	$scope.modValue = $scope.totalSearchedRooms % 6;
        	$scope.quotValue = Math.floor($scope.totalSearchedRooms / 6);
        	if ($scope.modValue != 0) {
        		$scope.totalPage = $scope.quotValue + 1;
        	} else {
        		$scope.totalPage = $scope.quotValue;
        	}
        	if($scope.pageNo + 1 < $scope.totalPage){
        		$scope.showNext = true;
        	} else {
        		$scope.showNext = false;
        	}
        }
        
		// Function for scroll top
		// Author : Rajesh K
		// Date   : 16/06/2016
		$scope.initializeGoTop = function(){
			var myID = document.getElementById("myID");
			var myScrollFunc = function () {
			    var y = window.scrollY;
			    if (y >= 100) {
			        myID.className = "endPage show"
			    } else {
			        myID.className = "endPage hide"
			    }
			};

			window.addEventListener("scroll", myScrollFunc);
			$(".endPage").click(function() {
			    $('html,body').animate({
			        scrollTop: $(".main").offset().top},
			        'slow');
			});
		}

		// Function to load SpaceId based on roomId
		// Author : Rajesh K
		// Date   : 23/05/2016
		// Input  : Current roomId
		// Output : SpaceId that the respective room belongs to.

		$scope.loadRoomSpace = function() {
			$scope.ratings = [];
			console.log("In fn.");
			var roomId = $stateParams.roomId;

			RoomResultService.getSpaceDetail.query({
			 	"roomId": roomId }, function(room){
				 $scope.roomSpaceId = room.spaceId._id;
				 $scope.loadRating($scope.roomSpaceId);
				 }, function(error) {
					console.log(error);
			});
		}

	// Function to load rating
	// Author : Rajesh K
	// Date   : 23/05/2016
	// Input  : SpaceId retrieved from loadRoomSpace()
	// Output : All the ratings for the respective SpaceId
	
	$scope.loadRating = function(id) {
		$scope.averageRating = 0;
		var spaceId = id;
		$scope.perPageValue = 10;
		if(angular.isUndefined($scope.pageValue)) {
			$scope.pageValue = 1;
		}

		if(angular.isUndefined($scope.ratingArray)) {
			$scope.ratingArray = [];
		}
	
		RoomResultService.loadRating.get({
			"spaceId": spaceId, "perPage": $scope.perPageValue, "page": $scope.pageValue
		}, function(rating) {
			
			$scope.ratingArray = $scope.ratingArray.concat(rating.reviews);
			$scope.totalRating = rating.reviews.length;
			$scope.totalCount = rating.totalCount;
			
			$scope.averageRating = $rootScope.roomsDetail.spaceId.rating.toFixed(2);
			$scope.pageValue++;
		}, function(error) {
			console.log(error);
		});
	};
});
