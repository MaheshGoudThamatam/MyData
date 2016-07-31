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
					place: queryParams.place,
					date: queryParams.dateselc
				};
				$scope.calculatePriceNew = { 
					stime : $scope.searchElements.stime,
					etime : $scope.searchElements.etime
				};
			};
			
			$scope.findSearchRoomsList = function(){
				$scope.searchParameters();
				$scope.isTrainingOrHotDesk = false;
				var queryParams = $location.search();
				
				if(queryParams.roomType === SEARCH.CONSTANT.TRAINING_ROOM || queryParams.roomType === SEARCH.CONSTANT.HOT_DESK){
					$scope.searchElements.fromDate = queryParams.from_date;
					$scope.searchElements.endDate = queryParams.end_date;
				}
					
   				$scope.searchObj = $scope.searchElements;
				var startTimeBooking = $scope.searchObj.stime;
				var endTimeBooking = $scope.searchObj.etime;
				var datesel = $scope.searchObj.date;
				console.log($scope.searchObj);
				
				if(queryParams.roomType === SEARCH.CONSTANT.TRAINING_ROOM || queryParams.roomType === SEARCH.CONSTANT.HOT_DESK){
					$scope.bookingStartTime = startTimeBooking;
					$scope.bookingEndTime = endTimeBooking;
						
					$scope.bookingFromDate = $scope.searchObj.fromDate;
					$scope.bookingToDate = $scope.searchObj.endDate;
					$scope.isTrainingOrHotDesk = true;
				} else {
					$scope.bookingStartTime = moment.utc(startTimeBooking).format('LT');
					$scope.bookingEndTime = moment.utc(endTimeBooking).format('LT');
					
					$scope.bookingDate = moment(datesel).format('DD-MM-YYYY');
					$scope.isTrainingOrHotDesk = false;
				}
				//$scope.searchObj = angular.copy($scope.searchElements);
				
				$scope.searchObj = $scope.searchElements;
				
				if ($rootScope.dateObj) {
				   $rootScope.dateObj = $rootScope.dateObj;
				}
				
				if(!queryParams.roomType === SEARCH.CONSTANT.TRAINING_ROOM && !queryParams.roomType === SEARCH.CONSTANT.HOT_DESK){
					$scope.searchElements.stime = new Date($scope.searchElements.stime);	
					$scope.searchElements.etime= new Date($scope.searchElements.etime);
				}

				$scope.pageNo = parseInt(queryParams.pageNo);

				var search = new SearchService.search($scope.searchElements);
		    	search.$save({
		    		perPage : 6,
		    		page : $scope.pageNo
		    	}, function(searchedList){
		    		$rootScope.hotDeskList = searchedList.rooms;
		    		if(!angular.isUndefined(searchedList.rooms)){
		    			$scope.rooms = searchedList.rooms;
		    			console.log($scope.rooms);
		    			NgMap.getMap().then(function(map) {
		    				$scope.map = map;
		    			});
		    			$timeout(function(){
		    				$scope.loadLatLong();
		    			},1000);
		    			$scope.calculatePrice();
		    		}else{
		    			flash.setMessage(URLFactory.MESSAGES.ROOM_NOT_FOUND,URLFactory.MESSAGES.ERROR);
		    		}
		    	}, function(error){
		        	console.log(error);
		    	});
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
			
			$scope.detail = function(urlPath, id) {
				urlPath = urlPath.replace(":roomId", id);
				$location.path(urlPath);
			};

			$scope.bookNow = function(urlPath,id) {
				if($scope.searchElements.roomType === SEARCH.CONSTANT.TRAINING_ROOM){
					urlPath = BOOKING.URL_PATH.BOOKING_TRAINING_ROOM;
				} else if($scope.searchElements.roomType === SEARCH.CONSTANT.HOT_DESK){
					urlPath = BOOKING.URL_PATH.BOOKING_HOT_DESK;
				} else {
					urlPath = BOOKING.URL_PATH.BOOKINGS;
				}
				console.log(urlPath);
				urlPath = urlPath.replace(":roomId", id);
				$location.path(urlPath);
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
			
			$scope.GoogleMapMarkers = [];
		    
			$scope.loadLatLong = function() {
				
				$scope.roomPostions = $scope.rooms;
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
			    /*$timeout(function(){*/
			    	$scope.placeMarkers();
			    /*}, 1000);*/
					
			};
			$scope.placeMarkers = function(){
				/*$.each($scope.markers, function (i, location) {*/
				for(var i = 0; i < $scope.markers.length; i++){
					var location = $scope.markers[i];
		            if (location.latitude != "" && location.latitude != null) {
		            	var templocation = location;
		            	var irsInfoBoxHTML = "";
		            	var id = location._id;
		                var irsInfoBoxLink = "<span style='text-align:left' align='left'><table width='80%' cellpadding='2'><tr><td width='80%' align='center'><a  title='" + "Go to Location" + "' >";
		                irsInfoBoxHTML = irsInfoBoxLink + ' ' + name + "</a></td></tr><tr><td width='80%' align='center'>" + "</td></tr></table></span>";
		                
			            var point = new google.maps.LatLng(templocation.latitude, templocation.longitude);

			            // extend the bounds to include the new point
			            $scope.bounds.extend(point);
			            $scope.map.fitBounds($scope.bounds);
			            
			            var zoomChangeBoundsListener = google.maps.event.addListenerOnce($scope.map, 'bounds_changed', function(event) {
		                    if ($scope.map.getZoom()){
		                    	$scope.map.setZoom(12);
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

			            $scope.GoogleMapMarkers.push(marker);
			            
			            //var oms = new OverlappingMarkerSpiderfier($scope.map);
			            
			            /*google.maps.event.addListener($scope.map, 'center_changed', function() {
			                // 3 seconds after the center of the map has changed, pan back to the
			                // marker.
			            	$timeout(function(){
			            		$scope.map.panTo($scope.map.getCenter());
			                }, 1000);
			            });
			            
			            google.maps.event.addListener(marker,'click',function(event) {			            	
			            	var latitude = event.latLng.lat();
			            	var longitude = event.latLng.lng();
			            	$timeout(function(){
			            		var point = new google.maps.LatLng(latitude, longitude);
			            		$scope.bounds = new google.maps.LatLngBounds();
			            		$scope.bounds.extend(point);
					            $scope.map.fitBounds($scope.bounds);
			            		$scope.map.setZoom(17);
			            		$scope.map.setCenter(point);
			            	}, 1000);
			            });*/
			            
		            }
		            
		        };
			};
			
			$scope.findOne = function() {
				$scope.searchParameters();
				var queryParams = $location.search();
				$scope.searchObj = $scope.searchElements;
				
				var startTimeBooking=$scope.searchObj.stime;
				var endTimeBooking=$scope.searchObj.etime;
				$scope.bookingStartTime = moment.utc(startTimeBooking).format('LT');
				$scope.bookingEndTime = moment.utc(endTimeBooking).format('LT');
				
				var datesel = $scope.searchObj.date;
				$scope.bookingDate = moment(datesel).format('DD-MM-YYYY');
				
				RoomService.roomdetails.get({
					roomId : $stateParams.roomId
				}, function(rooms) {
					$scope.rooms = rooms;
					$rootScope.roomsDetail = $scope.rooms;
					$rootScope.$emit('latLongForRoom');
					$scope.calculateTimetypeDetail();
					$scope.roomPhotos = $scope.rooms.images.map(function(room) {
						return {src: room.url};
					});
					$scope.spacePhotos = $scope.rooms.spaceId.images.map(function(space) {
						return {src: space.url};
					});

					$scope.photos = $scope.roomPhotos.concat($scope.spacePhotos);
				});
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
		    
		    

		   $scope.calculatePrice = function(){
		    	var startTime=$scope.calculatePriceNew.stime.split(" ");
			     var startMeridiem = startTime[1];
			     var stime = startTime[1].split(":");
			     var sTimeHrs = parseInt(stime[0]);
			     var sTimeMins = parseInt(stime[1]);
			     var endTime=$scope.calculatePriceNew.etime.split(" ");
			     var endMeridiem = endTime[1];
			     var etime = endTime[1].split(":");
			     var eTimeHrs = parseInt(etime[0]);
			     var eTimeMins = parseInt(etime[1]);
			     // Calculating hrs
			     if(startMeridiem == "PM"){
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
		    };
		    
				 $scope.calculateTimeType = function(totalHours) {
					if ($scope.searchElements.timeType === "Half Day") {
						$scope.timeType = 2;
					} else if ($scope.searchElements.timeType === "Full Day") {
						$scope.timeType = 3;
					} else {
						$scope.timeType = 1;
						$scope.rooms.map(function(room) {
							console.log(totalHours);
							room.pricePerhour = room.pricePerhour * parseInt(totalHours);
						});

					}
					$scope.roomslist = $scope.rooms;
				};
		    	  
		    	  
		    	  $scope.calculateTimetypeDetail = function(){
		    		  $scope.searchParameters();
				    	var startTime=$scope.calculatePriceNew.stime.split(" ");
					     var startMeridiem = startTime[1];
					     var stime = startTime[1].split(":");
					     var sTimeHrs = parseInt(stime[0]);
					     var sTimeMins = parseInt(stime[1]);
					     var endTime=$scope.calculatePriceNew.etime.split(" ");
					     var endMeridiem = endTime[1];
					     var etime = endTime[1].split(":");
					     var eTimeHrs = parseInt(etime[0]);
					     var eTimeMins = parseInt(etime[1]);
					    // console.log(eTimeMins - sTimeMins);
					     // Calculating hrs
					     if(startMeridiem == "PM"){
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
					     $scope.calculatePriceDetail($scope.totalHours);
				    };
				    
		    	      $scope.calculatePriceDetail = function(totalHours) {
			    	        if($scope.searchElements.timeType === "Half Day"){
			    	               $scope.timeType = 2;
			    	   }   else if($scope.searchElements.timeType === "Full Day"){
			    	               $scope.timeType = 3;
			    	   }else {
			    	             $scope.timeType = 1;
			    	             $scope.rooms.pricePerhour= $scope.rooms.pricePerhour * totalHours;
			    	   }
			    	  };
			    	  
			    	  $scope.loadAmenities = function(){
			    		     $scope.searchamenities = [];
			            	 RoomResultService.amenity.query(function(amenity){
			            		 $scope.amenities = amenity;
			            	 });
			    	  };

			    	  $scope.addAmenities = function(amenities) {
				 		        var found = false;
				 		        var foundIndex = -1;
				 		        for (var i = 0; i < $scope.searchamenities.length; i++) {
				 		             if ($scope.searchamenities[i] === amenities._id) {
				 		                found = true;
				 		                foundIndex = i;
				 		            }
				 		        }
				 		        if (found) {
				 		            $scope.searchamenities.splice(foundIndex, 1);
				 		        } else {
				 		            $scope.searchamenities.push(amenities._id);
				 		        }
				 		    };
				 		    
				 		    
				 		    
				            $scope.filters = function()
				            {
				            	   $scope.searchParameters();
				            	if($scope.searchamenities.length>0){
				            		$scope.searchElements.amenities = [];
				            		$scope.searchElements.amenities= $scope.searchamenities;
				            	}
				             var search = new SearchService.search($scope.searchElements);
						    	    search.$save(function(searchedList){
						    		$scope.rooms = searchedList.rooms;
						    	}, function(error){
						        	console.log(error);
						    	});

				             };

				              $scope.cssFunction = function(){
								$( document ).ready(function() {
									console.log($('.hotel-text .searchHotelInner').height() );
									console.log("=============================================");;
									console.log($('.hotel-text').height() );
									while( $('.hotel-text .searchHotelInner').height() > $('.hotel-text').height() ) {
										$('.hotel-name a').css('font-size', (parseInt($('.hotel-item .hotel-text .hotel-name a').css('font-size')) - 1) + "px !important" );
									}
								});
				              };
				            
				            $scope.priceFilter = function(priceSort){
				            	$scope.findSearchRoomsList();
				            	    RoomService.roomspricesort.query({
									"selectedPrice" : priceSort,
									rooms:$scope.rooms
								}, function(response) {
									$scope.rooms = response;
								}, function(error) {
									console.log(error);
								});

				            };
				            
				            
				            $scope.ratingFilter = function(ratingSort)
				            {
				            	RoomService.roomsratingsort.query({
									"selectedRating" : ratingSort
								}, function(response) {
									$scope.rooms = response;
								}, function(error) {
									console.log(error);
								});
				            };
				            
				            
				            $scope.intializeCounter = function(){
				            	$scope.pagecounter=0;
				            };	
				            
				            
         $scope.next = function(){
			$scope.searchParameters();
			if ($scope.pageNo >= 0) {
				$scope.pageNo=$scope.pageNo + 1;
				$location.url(SEARCH.URL_PATH.SEARCH_LIST+'?search_lon=' + $scope.searchElements.lon +'&search_lat=' + $scope.searchElements.lat + '&capacitymin='+$scope.searchElements.capacity.min+ '&capacitymax='+$scope.searchElements.capacity.max+ '&start_time='+$scope.searchElements.stime+ '&end_time='+$scope.searchElements.etime +'&roomType='+$scope.searchElements.roomType+'&place='+$scope.searchElements.place+'&from_date='+$scope.searchElements.fromDate+'&end_date='+$scope.searchElements.endDate+'&timeType='+$rootScope.dateObj.timeType+'&dateselc='+$rootScope.dateObj.date+'&pageNo='+$scope.pageNo);
				$scope.findSearchRoomsList();
			}

		}
         
         $scope.prev = function(){
        	 $scope.searchParameters();
 			if ($scope.pageNo >= 0) {
 				$scope.pageNo=$scope.pageNo - 1;
 				$location.url(SEARCH.URL_PATH.SEARCH_LIST+'?search_lon=' + $scope.searchElements.lon +'&search_lat=' + $scope.searchElements.lat + '&capacitymin='+$scope.searchElements.capacity.min+ '&capacitymax='+$scope.searchElements.capacity.max+ '&start_time='+$scope.searchElements.stime+ '&end_time='+$scope.searchElements.etime +'&roomType='+$scope.searchElements.roomType+'&place='+$scope.searchElements.place+'&from_date='+$scope.searchElements.fromDate+'&end_date='+$scope.searchElements.endDate+'&timeType='+$rootScope.dateObj.timeType+'&dateselc='+$rootScope.dateObj.date+'&pageNo='+$scope.pageNo);
 				$scope.findSearchRoomsList();
 			}
        	
			
		}


				            

				             
		});
