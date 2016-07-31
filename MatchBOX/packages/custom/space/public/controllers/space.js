'use strict';

/* jshint -W098 */

var spaceModule = angular.module('mean.space',['datatables']);
spaceModule.controller('SpaceController', [ '$scope', '$rootScope', '$location', '$stateParams', 'Global', 'URLFactory', 'SpaceService','RoomService', 'Upload', 'MeanUser', 'flash', 'ShareHolidaysService','$parse', 'SpaceTypeService','$timeout','MESSAGES','DTOptionsBuilder','DTColumnDefBuilder',
    function($scope, $rootScope, $location, $stateParams, Global, URLFactory, SpaceService,RoomService, Upload, MeanUser, flash, ShareHolidaysService, $parse, SpaceTypeService, $timeout,MESSAGES,DTOptionsBuilder,DTColumnDefBuilder) {

		$scope.global = Global;
		$scope.package = {
				name : 'space',
				modelName: 'Spaces',
				featureName: 'Spaces'
		};
		initializePermission($scope, $rootScope, $location, $scope.package.featureName, flash, URLFactory.MESSAGES);
		hideBgImageAndFooter($rootScope);
		$scope.SERVICE = SpaceService;
		$scope.SPACE = URLFactory.SPACE;
		$scope.MESSAGES=MESSAGES;
		flashmessageOn($rootScope, $scope,flash);
		$scope.counter = 0;
		$scope.showroomtypecheck = false;
		$scope.roomtypevalue = "";
		$scope.room = {};
		$scope.room.images = [];
		$scope.loaderEnabled = false;
		$scope.hotDesk=false;
		
		if(angular.isDefined($rootScope.loggedInUser)){
			if($rootScope.loggedInUser.hasRole.match(/admin/i)){
				$scope.hidePartnerDropDown = false;
			} else {
				$scope.hidePartnerDropDown = true;
			}
		};
		
		$scope.partnerAssignment = function(){
			if(angular.isDefined($rootScope.loggedInUser)){
				if(!$rootScope.loggedInUser.hasRole.match(/admin/i)){
					$scope.space.partner = $rootScope.loggedInUser._id;
				} 
			};
		};

		$scope.checkingLoggedinUserIsAdmin=function(){
			RoomService.checkingadmin.get({}, function(response) {
		                 $scope.adminId=response._id;
		                 $scope.loggedinuserrole=MeanUser.user.role;
		                 var checkingadmin=$scope.loggedinuserrole.indexOf($scope.adminId);
		                 if(checkingadmin < 0)
		                 {
		                 	$scope.loggedinuserisadmin=false;
		                 }
		                 else
		                 {
		                 	$scope.loggedinuserisadmin=true;
		                 }	
		              }, function(error) {
		                  $scope.error = error;
                    });
		};
		
		$scope.assignSpaceObject = function(){
			$scope.space = {};
			$scope.space.images = [];
			$scope.partnerAssignment();
			// $scope.booleanVariablesAssignment();
		};
		
		$scope.booleanVariablesAssignment = function(){
			$rootScope.edit = false;
			$scope.enableAddMoreForm = false;
			$scope.addMore = false;
		};
		
		$scope.addSpace = function() {
			$location.path(URLFactory.SPACE.URL_PATH.SPACE_CREATE);
		}
		
		$scope.find = function(){

			$scope.dtOptions = DTOptionsBuilder.newOptions().withPaginationType('full_numbers').withDisplayLength(10);
			$scope.dtColumnDefs = [
			                   DTColumnDefBuilder.newColumnDef(0).notVisible(),
			                   DTColumnDefBuilder.newColumnDef(1),
			                   DTColumnDefBuilder.newColumnDef(2),
			                   DTColumnDefBuilder.newColumnDef(3),
			                   DTColumnDefBuilder.newColumnDef(4).notSortable()    
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
			if($rootScope.loggedInUser.isPartner){
				var query = {
					partnerId: $rootScope.loggedInUser._id 
				};
				SpaceService.spacePartner.query(query, function(result){
					$scope.spaces = result;
					if($scope.spaces.length == 0){
						$location.path(URLFactory.SPACE.URL_PATH.SPACE_CREATE);
					}
				});
			} else {
				var query = {};
				SpaceService.page.query(query, function(result){
					$scope.spaces = result;
					if($scope.spaces.length == 0){
						$location.path(URLFactory.SPACE.URL_PATH.SPACE_CREATE);
					}
				});
			}
		};

		$scope.loadSpaceType = function(){
			SpaceTypeService.page.query({}, function(spaceTypes){
				$scope.spaceTypes = spaceTypes;
			});
		};
		$scope.findSpace = function(){
			SpaceService.crud.get({
								spaceId : $stateParams.spaceId
							}, function(space) {
								if(space.images.length > 0){
									for (var i=0; i< space.images.length ; i++){
										if(space.images[i].url){
											space.images[i].tempUrl = $scope.generateTempUrl(space.images[i].url);
										}
									}
								}
								$scope.space = space;
							});
		}
		
		$scope.loadPartners = function(){
			SpaceService.partner.query({
				userType : 'partner'
			}, function(partners){
				$scope.partners = partners;
			})
		};
		
		$scope.setDefaultTime = function(){
			$scope.mytime = new Date();
			$scope.mytime.setHours( 9 );
			$scope.mytime.setMinutes( 0 );
			
			$scope.myEndTime = new Date($scope.mytime);
			$scope.myEndTime.setHours(18);
		};
		
		$scope.setDefaultTime();
	
		$scope.hstep = 1;
		$scope.mstep = 15;
	
		$scope.options = {
			hstep: [1, 2, 3],
			mstep: [1, 5, 10, 15, 25, 30]
		};
	
		$scope.ismeridian = false;
		$scope.toggleMode = function() {
			$scope.ismeridian = ! $scope.ismeridian;
		};

		/*
		 * $scope.update = function(date) { var d = new Date(); console.log(d);
		 * d.setHours( 14 ); d.setMinutes( 0 ); console.log(d); date = d; };
		 */

		/**
		 * Function for replacing $scope.apply
		 */
		$scope.safeApply = function(fn) {
			var phase = this.$root.$$phase;
			if(phase == '$apply' || phase == '$digest') {
				if(fn && (typeof(fn) === 'function')) {
					fn();
				}
			} else {
				this.$apply(fn);
			}
		};
		
		/**
		 * Function called on change of time
		 */
		$scope.changed = function (startTime, endTime, index) {
			var the_string = 'err' + index;
	
			// Get the model
			var model = $parse(the_string);
			// Assigns a value to it
			var sTime = startTime.getHours();
			var eTime = endTime.getHours();
			if(eTime - sTime < 1){
				model.assign($scope, true);
	
				// Apply it to the scope
				$scope.safeApply();
			}else{
				model.assign($scope, false);
				$scope.safeApply();
			}
		};
		
		$scope.setFullDay = function(hoursObj) {
			var date = new Date();
			date.setHours(0);
			date.setMinutes(0);
			hoursObj.startTime = date;
			hoursObj.endTime = date;
		}
		
		$scope.toggleAllDay = function(hoursObj) {
			if(hoursObj.isAllday && hoursObj.isClosed){
				hoursObj.isClosed = false;
			}
			if(!hoursObj.isAllday && !hoursObj.isClosed){
				$scope.setDefaultTime();
				hoursObj.startTime = $scope.mytime;
				hoursObj.endTime = $scope.myEndTime;
			}
		}
		
		$scope.toggleClosed = function(hoursObj) {
			if(hoursObj.isClosed && hoursObj.isAllday){
				hoursObj.isAllday = false;
			}
			if(!hoursObj.isAllday && !hoursObj.isClosed){
				$scope.setDefaultTime();
				hoursObj.startTime = $scope.mytime;
				hoursObj.endTime = $scope.myEndTime;
			}
		}
	
		if($scope.space){
			if(angular.isUndefined($scope.space.teams)){
				$scope.space.teams = [];
				var teamObj = {};
				$scope.space.teams.push(teamObj);
			}
		}
		/**
		 * Function for cloudinary api call for uploading images
		 */
	    
		$scope.fileValidation = {};
		$scope.uploadImage = function(image){
	        if (angular.isArray(image)) {
	            image = image[0];
	        }
	
	        // This is how I handle file types in client side
	        if (image.type !== 'image/png' && image.type !== 'image/jpeg') {
	            alert('Only PNG and JPEG are accepted.');
	            return;
	        }
	        if (image.size > (1024 * 1024)) {
	            alert('file size exceeded.');
	            return;
	        }
	           
	        var user = MeanUser.user;
	        var userId = user._id;
	        $scope.isImageUploaded = false;
	        var isImage = false;
	        $scope.loaderEnabled = true;
	        $scope.upload = Upload.upload({
	            url: '/api/config/'+ userId + '/cupload',
	            method: 'POST',
	            file: image
	        }).success(function (response) {
	        	$scope.loaderEnabled = false;
	        	var resp = $scope.generateTempUrl(response.url);
	        	    $scope.imageObj = {};
	     	   		$scope.imageObj.url = response.url;
	     	   		$scope.imageObj.tempUrl = resp;
	     	   		$scope.space.images.push($scope.imageObj);
	     	   		$scope.counter = $scope.counter+1;
	        }).error(function (err) {
	            	console.log(err);
	        });
		};
		
		
		$scope.generateTempUrl = function(response) {
			var image = response;
     	   	 var res = image.split("upload");
        	 var resp = res[0] + "upload/w_200,h_200,c_thumb" + res[1];
        	 return resp;
        }
	
		$scope.create = function(partnerDetailForm){
			if (partnerDetailForm.$valid) {
                $scope.space.createdBy=MeanUser.user._id;

				if($scope.space.images.length > 0){
					for (var i=0; i< $scope.space.images.length ; i++){
						if($scope.space.images[i].tempUrl){
							delete $scope.space.images[i].tempUrl;
						}
					}
				}
				
				var space = new SpaceService.crud($scope.space);
				space.$save(function(space){
				
					if(space.images.length > 0){
						for (var i=0; i< space.images.length ; i++){
							if(space.images[i].url){
								space.images[i].tempUrl = $scope.generateTempUrl(space.images[i].url);
							}
						}
					}
				
					$scope.space = space;
					$scope.addMore = true;
				},function (error) {
					$scope.error = error;
				});
			} else {
				$scope.submitted = true;
			}
		};
		

		$scope.loadAmenities = function(appliesto_id) {
			SpaceService.amenity.query({
				appliesToId : appliesto_id, 
				partOf : 'space'
			}, function(amenities){
				console.log(amenities);
				if($scope.enableAddMoreForm || $rootScope.edit) {
					$scope.space.space_type = appliesto_id;
					$scope.space.amenities = [];
					$scope.amenities = amenities;
					for(var i=0; i<$scope.amenities.length; i++){
						var amenityObj = {};
						amenityObj.amenityId = $scope.amenities[i]._id;
						amenityObj.name = $scope.amenities[i].name;
						amenityObj.icon = $scope.amenities[i].icon;
						if($scope.amenities[i].isStatus){
							amenityObj.isStatus = $scope.amenities[i].isStatus;
							amenityObj.isApplicable = true;
							amenityObj.isChargeable = false;
							amenityObj.facilityavailable = true;
						}else
						{
							amenityObj.isStatus = $scope.amenities[i].isStatus;
							amenityObj.isApplicable = false;
							amenityObj.isChargeable = false;
							amenityObj.facilityavailable = false;
						}
						$scope.space.amenities.push(amenityObj);
					}
				}
			});
		};
		
		$scope.toggleAmenityApplicable = function(amenity){
			if(amenity.isChargeable && !amenity.isApplicable){
				amenity.isChargeable = false;
				$scope.amenityChargeable = false;
				
			}
			amenity.facilityavailable = amenity.isApplicable;
		};
		$scope.amenityChargeable = false;
		$scope.toggleAmenityChargeable = function(amenity){
			if(amenity.isChargeable && !amenity.isApplicable){
				amenity.isApplicable = true;
				$scope.amenityChargeable = true;
				
			}
			amenity.facilityavailable = amenity.isApplicable;
			
		};
		
		$scope.enableAddMore = function(){
			$scope.enableAddMoreForm = true;
			$scope.space.officeHours = [];
			var days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
			for (var i=0; i< days.length; i++){
				var obj = {};
				obj.day = days[i];
				obj.startTime = $scope.mytime;
				obj.endTime = $scope.myEndTime;
				$scope.space.officeHours.push(obj);
			}
			$scope.loadAmenities($scope.space.space_type);
		};

		$scope.enableAddMoreRoom=function(){

			$scope.enableAddMoreForm = true;
			$scope.officeHoursRoomsSlot = [];
			var days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
			if($scope.loadedspaceobject.officeHours)
			  {	
					for (var i=0; i< $scope.loadedspaceobject.officeHours.length; i++){

                      if($scope.loadedspaceobject.officeHours[i].isAllday)
                      {
                      	  var obj = {};
						  obj.day = days[i];


                        $scope.mytime = new Date();
					    $scope.mytime.setHours(0);
					    $scope.mytime.setMinutes(0);
					    $scope.mytime.setSeconds(0);
					    $scope.mytime.setMilliseconds(0);
						obj.startTime = $scope.mytime;

						obj.min=$scope.mytime;

						$scope.myEndTime = new Date();
					    $scope.myEndTime.setHours(0);
					    $scope.myEndTime.setMinutes(0);
					    $scope.myEndTime.setSeconds(0);
					    $scope.myEndTime.setMilliseconds(0);
						obj.endTime = $scope.myEndTime;


						$scope.myEndTimeMaximum = new Date();
					    $scope.myEndTimeMaximum.setHours(23);
					    $scope.myEndTimeMaximum.setMinutes(59);
					    $scope.myEndTimeMaximum.setSeconds(0);
					    $scope.myEndTimeMaximum.setMilliseconds(0);

						obj.max=$scope.myEndTimeMaximum;

						obj.isAllday=$scope.loadedspaceobject.officeHours[i].isAllday;

						obj.isClosed=$scope.loadedspaceobject.officeHours[i].isClosed;

						obj.isAlldaylogic=$scope.loadedspaceobject.officeHours[i].isAllday;

						$scope.officeHoursRoomsSlot.push(obj);


                      }

                     else
                     {

						var obj = {};
						obj.day = days[i];
					
						var mynewstarttime=new Date($scope.loadedspaceobject.officeHours[i].startTime);
						var mynewsethourstarttime=mynewstarttime.getHours();
						var mynewsetminutestarttime=mynewstarttime.getMinutes();
						var mynewsetsecondstarttime=mynewstarttime.getSeconds();
						var mynewsetmillisecondstarttime=mynewstarttime.getMilliseconds();

						var mynewendtime=new Date($scope.loadedspaceobject.officeHours[i].endTime);
						var mynewsethourendtime=mynewendtime.getHours();
						var mynewsetminutendtime=mynewendtime.getMinutes();
					    var mynewsetsecondendtime=mynewendtime.getSeconds();
					    var mynewsetmillisecondendtime=mynewendtime.getMilliseconds();

						$scope.mytime = new Date();
					    $scope.mytime.setHours(mynewsethourstarttime);
					    $scope.mytime.setMinutes(mynewsetminutestarttime);
					    $scope.mytime.setSeconds(mynewsetsecondstarttime);
					    $scope.mytime.setMilliseconds(mynewsetmillisecondstarttime);
						obj.startTime = $scope.mytime;

						obj.min=$scope.mytime;

						$scope.myEndTime = new Date();
					    $scope.myEndTime.setHours(mynewsethourendtime);
					    $scope.myEndTime.setMinutes(mynewsetminutendtime);
					    $scope.myEndTime.setSeconds(mynewsetsecondendtime);
					    $scope.myEndTime.setMilliseconds(mynewsetmillisecondendtime);
						obj.endTime = $scope.myEndTime;

						obj.max=$scope.myEndTime;

						obj.isAllday=$scope.loadedspaceobject.officeHours[i].isAllday;

						obj.isClosed=$scope.loadedspaceobject.officeHours[i].isClosed;

						obj.isAlldaylogic=$scope.loadedspaceobject.officeHours[i].isAllday;

						$scope.officeHoursRoomsSlot.push(obj);

				     }
				     

			  }

		  }	

		};
		
		$scope.generateSpaceHoliday = function(){
			$scope.space.space_holiday = [];
			var spaceHolidays = ShareHolidaysService.getHolidays();
			var spaceHoliday = {};
			for(var i = 0; i < spaceHolidays.length; i++){
				spaceHoliday = spaceHolidays[i];
				spaceHoliday.has_admin_created = spaceHolidays[i].has_admin_created;
				$scope.space.space_holiday.push(spaceHoliday);
			}
		};
		
		$scope.createMore = function(partnerMoreDetailForm){
			$scope.generateSpaceHoliday();
			if (partnerMoreDetailForm.$valid) {
				var space = new SpaceService.crud($scope.space);
				space.$update({
					spaceId: $scope.space._id
				}, function(space){
					$scope.space = space;
					flash.setMessage(URLFactory.MESSAGES.SPACE_CREATE_SUCCESS,URLFactory.MESSAGES.SUCCESS);
					$location.path($scope.SPACE.URL_PATH.SPACE_LIST);
					$rootScope.edit = false;
				},function (error) {
					$scope.error = error;
				});
			} else {
				$scope.submitted = true;
			}
		};
	
		$scope.update = function(partnerDetailForm, partnerMoreDetailForm){
			$scope.generateSpaceHoliday();
			// $location.path($scope.SPACE.URL_PATH.SPACE_LIST);
			if(partnerDetailForm.$valid && partnerMoreDetailForm.$valid){
				if($scope.space.images.length > 0){
					for (var i=0; i< $scope.space.images.length ; i++){
						if($scope.space.images[i].tempUrl){
							delete $scope.space.images[i].tempUrl;
						}
					}
				}
				$scope.space.partner = $scope.space.partner._id;
				var space = new SpaceService.crud($scope.space);
				space.$update({
					_id : $scope.space.id
				},function(space){
					if(space.images.length > 0){
						for (var i=0; i< space.images.length ; i++){
							if($scope.space.images[i].url){
								$scope.space.images[i].tempUrl = $scope.generateTempUrl($scope.space.images[i].url);
							}
						}
					}
					$scope.space = space;
					flash.setMessage(URLFactory.MESSAGES.SPACE_UPDATE_SUCCESS,URLFactory.MESSAGES.SUCCESS);
					$location.path($scope.SPACE.URL_PATH.SPACE_LIST);
				},function (error) {
					$scope.error = error;
				});
			} else {
				$scope.submitted = true;
			}
		};

		$scope.edit = function(space){
			if(space.officeHours.length === 0){
				var days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
				for (var i=0; i< days.length; i++){
					var obj = {};
					obj.day = days[i];
					obj.startTime = $scope.mytime;
					obj.endTime = $scope.myEndTime;
					space.officeHours.push(obj);
				}
			}
			if(space.images.length > 0){
				for (var i=0; i< space.images.length ; i++){
					if(space.images[i].url){
						space.images[i].tempUrl = $scope.generateTempUrl(space.images[i].url);
					}
				}
			}

			$rootScope.edit = true;
			$location.path($scope.SPACE.URL_PATH.SPACE_UPDATE.replace(':spaceId', space._id));
		};
	
		$scope.delete = function(space){
			var spaceObj = new SpaceService.crud(space);
			spaceObj.$remove(function(response){
				var index = $scope.spaces.indexOf(space);
				$scope.spaces.splice(index, 1);
				flash.setMessage(URLFactory.MESSAGES.SPACE_DELETE_SUCCESS,URLFactory.MESSAGES.SUCCESS);
			});
		};
	
		$scope.cancel = function(){
			$location.path(URLFactory.SPACE.URL_PATH.SPACE_LIST);
		};
		
		$scope.teamRoles = function(){
			SpaceService.teamRole.query(function (teamRoles) {
				$scope.teamRoles = teamRoles;
			});
        };
		
	     $scope.addTeamMember = function () {
	    	 var teamObj = {};
	         $scope.space.teams.push(teamObj);
	     };
	     
	     $scope.removeTeamMember = function (index) {
	         $scope.space.teams.splice(index, 1);
	     };
	
		$scope.removeImage = function (index, form, space) {
	        if (space.images.length > 0) {
	            $timeout(function () {
	            	space.images.splice(index, 1);
	            	$scope.counter = $scope.counter-1;
	            }, 1000);
	        }

	    };
	    
	    $scope.isSpaceDefined = function(){
			if(angular.isDefined($rootScope.spaceObj)){
				$scope.space = $rootScope.spaceObj;
				$scope.enableAddMoreForm = true;
				delete $rootScope.spaceObj;
			};
			if(angular.isDefined($rootScope.space)){
				$scope.space = $rootScope.space;
				delete $rootScope.space;
			};
	    }
		
	    $scope.createHoliday = function(){
	    	$rootScope.spaceObj = $scope.space;
	    	$location.path(URLFactory.SPACE.URL_PATH.SPACE_HOLIDAY_LIST);
	    };
	    
	    $scope.removeTeamMember=function(index){
	        var teamObj = {};
	        $scope.space.teams.splice(index, 1);
	    };

	       $scope.spaceaddroom=function(spacedetailobject){
	       	       var  urlPath = URLFactory.SPACE.URL_PATH.SPACE_ADDROOM.replace(":spaceId", spacedetailobject._id); 
	       	         $location.path(urlPath);  
	             }; 

	              $scope.showroomtype=function(){
	              	 if($scope.spaceofficeHourscheck.length == 0)
	              	   {
                          flash.setMessage(URLFactory.MESSAGES.OFFICE_HOURS_NOT_ADDED,URLFactory.MESSAGES.ERROR);
                          $location.path(URLFactory.SPACE.URL_PATH.SPACE_LIST);
	              	   }
	              	   else
	              	   {
                          $scope.showroomtypecheck = !$scope.showroomtypecheck;
	              	   }	
                     
	             };

	              $scope.changingroomtype=function(roomtype){
	              	$scope.enableAddMoreRoom();
	              	$scope.roomtypevalue = $scope.room.roomtype;
	              	
	              	RoomService.getroomtypename.get({
		                  'roomTypeId': roomtype
		              }, function(response) {
		                   $scope.roomtypename=response.name;
		                    $scope.hotDesk=false;
	                        var seats = 0;
			              	var startCapacity = 0;
			              	$scope.roomseats =[];
			              	if($scope.roomtypename == "Hot Desk")
			              	{	  
		                      $scope.hotDesk=true;
		                    }
		                    if($scope.roomtypename == "Meeting Room")
			              	{	   
		                    	 seats = 8;
		                    	 startCapacity = 2;
		                    } 
		                    if($scope.roomtypename == "Training Room")
			              	{	  
		                    	seats = 50;
		                   	 	startCapacity = 11;
		                    } 
		                    if($scope.roomtypename == "Board Room")
			              	{	  
		                    	seats = 30;
		                    	startCapacity = 9;
		                    } 
		                    if($scope.roomtypename == "Virtual Office")
			              	{	  
		                     $scope.roomseats=[];
		                    } 
		                     if($scope.roomtypename == "Plug-N-Play")
			              	{	  
		                      $scope.roomseats=[];
		                    }   
		                     
		                     for(var i= startCapacity; i<=seats ; i++){
		                    	 var obj = {"capacityvalue" : i}
		                    	 $scope.roomseats.push(obj);
		                     }

		              }, function(error) {
		                  $scope.error = error;
                    });
	             };  

	              $scope.createroom=function(isValid){
	              	if(isValid)
	              	  {	
	              	  	if($scope.loggedinuserisadmin)
	              	  	{
                             $scope.room.isAdminAdded=true;  
	              	  	}    
	              	  	if($scope.room.images.length > 0){
					        for (var i=0; i< $scope.room.images.length ; i++){
								if($scope.room.images[i].tempUrl){
									delete $scope.room.images[i].tempUrl;
								}
							}
						}
				      $scope.room.createdBy=MeanUser.user._id;		
	              	  $scope.room.spaceId=$stateParams.spaceId;
	              	  $scope.room.loc=$scope.loc;
	              	  $scope.room.roomsslotschedule=$scope.officeHoursRoomsSlot;
	              	  $scope.room.space_holiday=$scope.loadedspaceobject.space_holiday;
	              	  $scope.room.partner=$scope.partner;
	              	for(var i =0;i<$scope.room.amenities.length;i++){
                		if($scope.room.amenities[i].isApplicable && $scope.room.amenities[i].isChargeable){
                			$scope.room.amenities[i].facilityavailable = true;
                		}
                	}
			          var roomcreate = new RoomService.roomdetails($scope.room);
			          
		                roomcreate.$save(function (response) {
		                	if($scope.room.images.length > 0){
						for (var i=0; i< $scope.room.images.length ; i++){
							if($scope.room.images[i].url){
								$scope.room.images[i].tempUrl = $scope.generateTempUrl($scope.room.images[i].url);
							}
						}
					}
		                	
		                	
		                	flash.setMessage(URLFactory.MESSAGES.ROOM_ADD_SUCCESS,URLFactory.MESSAGES.SUCCESS);
                            $location.path(URLFactory.SPACE.URL_PATH.SPACE_LIST);
		                }, function (error) {
		                    $scope.error = error;
		                });

		              }  
		            else {
                           $scope.submitted = true;
                         }
	             }; 

	              $scope.loadspaceloc=function(){
		                SpaceService.crud.get({'spaceId':$stateParams.spaceId},function (response) {
		                	$scope.loadedspaceobject=response;
		                	$scope.spaceofficeHourscheck=response.officeHours;
		                    $scope.loc=response.loc;
		                    $scope.spaceAmenity = response.amenities;
		                    $scope.partner = response.partner;
		                  $scope.selectedspaceamenity = angular.copy($scope.spaceAmenity);
		                  $scope.loadRoomAmenities();
		                }, function (error) {
		                    $scope.error = error;
		                });
	             }; 

	              $scope.loadroomtypes=function(){
	              	 RoomService.loadroomtypes.query(function(response){
                        $scope.roomtypeoptions=response;
	              	 },function(error){
                         console.log(error);
	              	 });
	             }; 

	              $scope.cancelAddingRoom=function(){
                     $location.path(URLFactory.SPACE.URL_PATH.SPACE_LIST);
	             }; 

	              $scope.loadRoomAmenities=function(){
                     RoomService.amenityroomlist.query(function(response){
                        $scope.amenities=[];
                        for(var i=0;i<response.length;i++)
                        	
                        {
                        	console.log(response);
                        	$scope.amenities.push({
                                   "amenityId":response[i]._id,
                                   "facilityavailable":false,
                                   "name":response[i].name,
                                   "icon":response[i].icon ,
                                   "isStatus":response[i].isStatus                                
                        		});
                        }
                        for(var i=0;i<$scope.selectedspaceamenity.length;i++)
                        	{
                        	
                        	$scope.amenities.push($scope.selectedspaceamenity[i]);
                        	}
                        
                        $scope.room.amenities=$scope.amenities;
                     },function(error){
                        console.log(error);
                     });
	             };  
	             $scope.fileValidation = {};
	    $scope.roomImageEnabled = false;
		$scope.roomImageUpload = function(image){
	        if (angular.isArray(image)) {
	            image = image[0];
	        }
	
	        // This is how I handle file types in client side
	        if (image.type !== 'image/png' && image.type !== 'image/jpeg') {
	            alert('Only PNG and JPEG are accepted.');
	            return;
	        }
	        if (image.size > (1024 * 1024)) {
	            alert('file size exceeded.');
	            return;
	        }
	           
	        var user = MeanUser.user;
	        var userId = user._id;
	        $scope.isImageUploaded = false;
	        var isImage = false;
	        $scope.roomImageEnabled = true;
	        $scope.upload = Upload.upload({
	            url: '/api/config/'+ userId + '/cupload',
	            method: 'POST',
	            file: image
	        }).success(function (response) {
	        	$scope.roomImageEnabled = false;
	        	var resp = $scope.generateTempUrl(response.url);
	     	   		$scope.imageObj = {};
	     	   		$scope.imageObj.url = response.url;
	     	   		$scope.imageObj.tempUrl = resp;
	     	   		$scope.room.images.push($scope.imageObj);
	     	   		$scope.counter = $scope.counter+1;
	        }).error(function (err) {
	            	console.log(err);
	        });
		};  
		$scope.generateTempUrl = function(response) {
           var image = response;
           var res = image.split("upload");
          var resp = res[0] + "upload/w_200,h_200,c_thumb" + res[1];
          return resp;
        
	
	};
	$scope.removeRoomImage = function (index, form, room) {
	        if (room.images.length > 0) {
	            $timeout(function () {
	            	room.images.splice(index, 1);
	            }, 1000);
	        }

	    };

	    $scope.loadRoomsAllotedToParticulerSpace = function () {

	    	RoomService.loadroomparticulertospace.query({'particulerroomsspaceId':$stateParams.spaceId},function(response){
	    		$scope.roomsparticulertospace=response;
	    	},function(error){
                  console.log(error);
	    	});

	    };
	    $scope.toggleSpaceAmenityApplicable = function(spaceamenity){
			if(spaceamenity.isChargeable && !spaceamenity.isApplicable){
				spaceamenity.isChargeable = false;
				$scope.spaceamenityChargeable = false;
				
			}
			spaceamenity.facilityavailable=spaceamenity.isApplicable;
		};
		$scope.spaceamenityChargeable = false;
		$scope.toggleSpaceAmenityChargeable = function(spaceamenity){
			if(spaceamenity.isChargeable && !spaceamenity.isApplicable){
				spaceamenity.isApplicable = true;
				$scope.spaceamenityChargeable = true;
			}
			//$scope.amenityChargeable = false;
			spaceamenity.facilityavailable=spaceamenity.isApplicable;
			
		};

		 $scope.setDefaultTimeAddRoom = function(hoursObj){
          $scope.mytime = new Date(hoursObj.startTime);
          $scope.mytime.setHours( 9 );
          $scope.mytime.setMinutes( 0 );
          
          $scope.myEndTime = new Date(hoursObj.endTime);
          $scope.myEndTime.setHours(18);
          $scope.myEndTime.setMinutes(0);
        };

	$scope.setFulldayAddRoom = function(hoursObj){
      $scope.mytime = new Date();
      $scope.mytime.setHours(0);
      $scope.mytime.setMinutes(0);
      
      $scope.myEndTime = new Date();
      $scope.myEndTime.setHours(0);
      $scope.myEndTime.setMinutes(0);
    };

    $scope.toggleAllDayAddRoom = function(hoursObj) {
      if(hoursObj.isAllday && hoursObj.isClosed){
        hoursObj.isClosed = false;
      }
      if(hoursObj.isAllday)
      {
        $scope.setFulldayAddRoom(hoursObj);
        hoursObj.startTime = $scope.mytime;
        hoursObj.endTime = $scope.myEndTime;
      }
      if(!hoursObj.isAllday && !hoursObj.isClosed){
        
        $scope.mytimemin = new Date();
          $scope.mytimemin.setHours(0);
          $scope.mytimemin.setMinutes(0);
          $scope.mytimemin.setSeconds(0);
          $scope.mytimemin.setMilliseconds(0);

        hoursObj.min=$scope.mytimemin;

        $scope.myEndTimemax = new Date();
          $scope.myEndTimemax.setHours(23);
          $scope.myEndTimemax.setMinutes(59);
          $scope.myEndTimemax.setSeconds(0);
          $scope.myEndTimemax.setMilliseconds(0);

        hoursObj.max=$scope.myEndTimemax;

        $scope.setDefaultTimeAddRoom(hoursObj);
        hoursObj.startTime = $scope.mytime;
        hoursObj.endTime = $scope.myEndTime;
      }
                 
    };
		$scope.toggleClosedAddRoom = function(hoursObj) {
			if(hoursObj.isClosed && hoursObj.isAllday){
				hoursObj.isAllday = false;
			}
			if(!hoursObj.isAllday && !hoursObj.isClosed){
				$scope.setDefaultTimeAddRoom(hoursObj);
				hoursObj.startTime = $scope.mytime;
				hoursObj.endTime = $scope.myEndTime;


				$scope.mytime = new Date(hoursObj.startTime);
			    $scope.mytime.setHours(0);
			    $scope.mytime.setMinutes(0);
			    $scope.mytime.setSeconds(0);
			    $scope.mytime.setMilliseconds(0);

				hoursObj.min=$scope.mytime;

				$scope.myEndTime = new Date(hoursObj.endTime);
			    $scope.myEndTime.setHours(23);
			    $scope.myEndTime.setMinutes(59);
			    $scope.myEndTime.setSeconds(0);
			    $scope.myEndTime.setMilliseconds(0);

				hoursObj.max=$scope.myEndTime;
			}
		};
	



	}
]);

/**
 * Direrctive Declaration Phone no. Validation
 */
spaceModule.directive('input', function () {
    return {
        restrict: 'E',
        require: '?ngModel',
        link: function (scope, elm, attr, ctrl) {
            if (!ctrl) {
                return;
            }
            if (attr.type == 'text' && attr.ngPattern === '/[0-9]/') {
                elm.bind('keyup', function () {
                    var text = this.value;
                    this.value = text.replace(/[a-zA-Z]/g, '');
                });
            }
        }
    }
});
