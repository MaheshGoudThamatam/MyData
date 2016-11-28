'use strict';

/* jshint -W098 */

var spaceModule = angular.module('mean.space',['datatables']);

spaceModule.controller('SpaceController', [ '$scope', '$rootScope', '$location', '$stateParams', 'Global', 'URLFactory', 'SpaceService','RoomService', 'Upload', 'MeanUser', 'flash', 'ShareHolidaysService','$parse', 'SpaceTypeService','$timeout','MESSAGES','DTOptionsBuilder','DTColumnDefBuilder','NgMap','SearchService',
    function($scope, $rootScope, $location, $stateParams, Global, URLFactory, SpaceService,RoomService, Upload, MeanUser, flash, ShareHolidaysService, $parse, SpaceTypeService, $timeout,MESSAGES,DTOptionsBuilder,DTColumnDefBuilder,NgMap,SearchService) {

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
		
		$scope.paymentPlan = ["Monthly Plan","Quaterly Plan","Half Yearly Plan","Yearly Plan"];
		
		
		flashmessageOn($rootScope, $scope,flash);
		$scope.counter = 0;
		$scope.showroomtypecheck = false;
		$scope.roomtypevalue = "";
		$scope.room = {};
		$scope.room.images = [];
		$scope.loaderEnabled = false;
		$scope.hotDesk=false;
		$scope.user=MeanUser.user;
		$scope.mapError = false;
        $scope.dragMarker = true;
        $scope.zoomLevel = 2;
		$scope.disableInput = true;
		$scope.contactDetail = true;
		$scope.readOnly = false;
       // $scope.address = [0,0];
        
        $scope.contactTypes = [{
        	contactType : 'Mobile'
        }, {
        	contactType : 'Landline'
        }];
        
        $("#contact_details_1_contactNo").intlTelInput({
        	  initialCountry: "auto",
        	  geoIpLookup: function(callback) {
        	    $.get('http://ipinfo.io', function() {}, "jsonp").always(function(resp) {
        	      var countryCode = (resp && resp.country) ? resp.country : "";
        	      callback(countryCode);
        	    });
        	  },
        	  utilsScript: "../../../../../bower_components/intl-tel-input/build/js/utils.js" // just for formatting/placeholders etc
        });
        
        $("#contact_details_2_contactNo").intlTelInput({
	      	  initialCountry: "auto",
	      	  geoIpLookup: function(callback) {
	      	    $.get('http://ipinfo.io', function() {}, "jsonp").always(function(resp) {
	      	      var countryCode = (resp && resp.country) ? resp.country : "";
	      	      callback(countryCode);
	      	    });
	      	  },
	      	  utilsScript: "../../../../../bower_components/intl-tel-input/build/js/utils.js"
       });
        
        $("#contact_details_1_contactNo").on("keyup change", function() {
        	$scope.contact_details_contactNo_1 = $("#contact_details_1_contactNo").intlTelInput("getNumber");
        });
        
        $("#contact_details_2_contactNo").on("keyup change", function() {
        	$scope.contact_details_contactNo_2 = $("#contact_details_2_contactNo").intlTelInput("getNumber");
        });
        
        
        $( "#contact_details_1_contactNo" ).blur(function() {
			$("#contact_details_1_contactNo").val($("#contact_details_1_contactNo").intlTelInput("getNumber", intlTelInputUtils.numberFormat.NATIONAL));
		});
        
		$( "#contact_details_2_contactNo" ).blur(function() {
			$("#contact_details_2_contactNo").val($("#contact_details_2_contactNo").intlTelInput("getNumber", intlTelInputUtils.numberFormat.NATIONAL));
		});
        
		
		if(angular.isDefined($rootScope.loggedInUser)){
			if($rootScope.loggedInUser.hasRole=='Admin'){
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
		
		/*$scope.cleave = new Cleave('.input-phone', {
		    phone: true,
		    //phoneRegionCode: '{country}'
		    phoneRegionCode: 'IN'
		});*/
		
		$scope.loadCities = function(){
			SearchService.city.query({}, function(response){
				$scope.cities = response;
				var index = 0;
				var item = { 
					_id : '1',
					city : 'Select city' 
				}
				$scope.cities.splice(index, 0, item);
			}, function(err){
				console.log(err);
			});
		};
		
		$scope.onContactTypeChange = function(space){
			console.log(space);
		};
		
		/*$scope.loadCountryCode = function(contactType){
			$scope.countryCodes = [];
			$scope.disableInput = false;
			if(contactType.contactType === 'Mobile'){
				var country_code = {
					code : $scope.selectedCity.country_code
				}
				$scope.countryCodes.push(country_code);
			} else if(contactType.contactType === 'Landline'){
				for(var i = 0; i < $scope.selectedCity.STD_code.length; i++){
					var country_code = {
						code : $scope.selectedCity.STD_code[i]
					}
					$scope.countryCodes.push(country_code);
				}
			}
		};
		
		$scope.assignCountryCode = function (selected) {
			$scope.selectedCountryCode = selected.title;
	    };
		
	    $scope.onFocus = function (space, contactPostion) {
	    	if(contactPostion === 1){
		    	$scope.contact_details_1_contactPostion = contactPostion;
	    	} else {
		    	$scope.contact_details_2_contactPostion = contactPostion;
	    	}
	    };*/
		
		$scope.assignCityToSpace = function(space){
			console.log(space.city);
			$scope.selectedCity = space.city;
			$scope.space.state = space.city.state;
			$scope.space.country = space.city.country;
			$scope.contactDetail = false;
			$scope.space.address1 = "";
			$scope.space.address2 = "";
			$scope.space.locality = "";
			$scope.space.postal_code = "";
			/*var contactType = {
	        	contactType : 'Mobile'
	        };
			$scope.loadCountryCode(contactType);*/
		};

		$scope.checkingLoggedinUserIsAdmin=function(){
			RoomService.checkingadmin.get({}, function(response) {
		                 $scope.adminId=response._id;
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
		              }, function(error) {
		                  $scope.error = error;
                    });
		};
		
		$scope.assignSpaceObject = function(){
			$scope.space = {};
			$scope.space.city = { 
				_id : '1',
				city : 'Select city' 
			};
			$scope.space.contact_details_1 = {
	        	contactType : 'Mobile'
	        };
			$scope.space.contact_details_2 = {
	        	contactType : 'Mobile'
	        };
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
			                   DTColumnDefBuilder.newColumnDef(4),
			                   DTColumnDefBuilder.newColumnDef(5).notSortable()    
			                   ];
			window.alert = (function() {
			    var nativeAlert = window.alert;
			    return function(message) {
			        // window.alert = nativeAlert;
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
			} else if($rootScope.loggedInUser.hasRole == 'BackOffice'|| $rootScope.loggedInUser.hasRole=='FrontOffice'){
				SpaceService.backOfficeSpace.query({
					'user' : MeanUser.user
				},function(response) {
					$scope.spaces=response;
			    });
			}
			else {
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
		
		$scope.fetchMapEdit = function(space){
            var address = undefined;
            $scope.mapError = true;
            if (space.address1){
                if (space.address2){
                    /*if (space.city){*/
                 	   if(space.state){
                 		   if(space.country){
                 			   if(space.postal_code){
                             	   $scope.zoomLevel = 15;
                                    //$scope.space = space
                                    $scope.mapError = false;
                                    address = {
                             		   address1: space.address1,
                             		   address2:space.address2,
                             		   locality:space.locality,
                             		   city:space.city,
                             		   state:space.state,
                             		   country:space.country,
                             		   postal_code:space.postal_code
                                    }
                 			   }
                 		   }	
                        	}
                     /*}*/
                	}
             }
            $scope.addAddress(address)
      };
		
		$scope.findSpace = function(){
			$scope.readOnly = true;
			$scope.contactDetail = false;
			SpaceService.crud.get({
				spaceId : $stateParams.spaceId
			}, function(space) {
				var lat = space.loc[1];
			    var lng = space.loc[0];
			    //$scope.address = new google.maps.LatLng(lat, lng);
			    $scope.address = [];
			    $scope.address.push(lat);
			    $scope.address.push(lng);
				
				/*$scope.spaceTypeObj = {
					   address1: space.address1,
              		   address2:space.address2,
              		   city:space.city,
              		   state:space.state,
              		   country:space.country,
              		   postal_code:space.postal_code
				}
				$scope.fetchMapEdit($scope.spaceTypeObj);*/
	
				for (var j=0; j< space.teams.length ; j++){
					space.teams[j].role=space.teams[j].role[0]._id;
				}
				
				for(var i = 0; i < $scope.cities.length; i++){
					if(space.city === $scope.cities[i].city){
						space.city = {
							_id : $scope.cities[i]._id,
							city : $scope.cities[i].city
						}
					}
				}
				
				$scope.zoomLevel = 15;
				$scope.space = space;
				$scope.loadAmenities($scope.space.space_type._id);
				if($scope.space.contact_details_1.contactNo){
					var contactNo = $scope.space.contact_details_1.contactNo;
					//var extCode = contactNo.slice(0, (contactNo.length-10));
					var extCode = contactNo.slice(0, 3);
					contactNo = contactNo.replace(extCode, '');
					$("#contact_details_1_contactNo").intlTelInput("setNumber", contactNo);
				}
				if($scope.space.contact_details_2.contactNo){
					var contactNo = $scope.space.contact_details_2.contactNo;
					var extCode = contactNo.slice(0, 3);
					contactNo = contactNo.replace(extCode, '');
					$("#contact_details_2_contactNo").intlTelInput("setNumber", contactNo);
				}
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
			date.setSeconds(0);
			date.setMilliseconds(0);
			hoursObj.startTime = date;
			var enddate = new Date();
			enddate.setHours(0);
			enddate.setMinutes(0);
	        enddate.setSeconds(0);
            enddate.setMilliseconds(0);
			hoursObj.endTime = enddate;
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
	            /* alert('Only PNG and JPEG are accepted.'); */
	            flash.setMessage(MESSAGES.FILETYPE,MESSAGES.ERROR);
	            return;
	        }
	        if (image.size > (10*(1024 * 1024))) {
	           /* alert('file size exceeded.'); */
	        	flash.setMessage(MESSAGES.FILESIZEEXCEEDED,MESSAGES.ERROR);
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
	        	flash.setMessage(MESSAGES.IMAGESUCCESS,MESSAGES.SUCCESS);
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
			console.log(partnerDetailForm);
			if($scope.contact_details_contactNo_1){
				$scope.space.contact_details_1.contactNo = $scope.contact_details_contactNo_1;
			}
			if($scope.contact_details_contactNo_2){
				$scope.space.contact_details_2.contactNo = $scope.contact_details_contactNo_2;
			}
			if (partnerDetailForm.$valid) {
				NgMap.getMap({id : 'spaceMap'}).then(function(map) {
	        		  $scope.space.loc=[];
	        		   if ($scope.lat && $scope.lng){
	        		     $scope.space.loc.push($scope.lat);
	        		     $scope.space.loc.push($scope.lng);
	        		   } else {
	        			 $scope.space.loc.push(map.markers[0].position.lng());
	        			 $scope.space.loc.push(map.markers[0].position.lat());
	        			 }
	        		   console.log($scope.space.loc);
					if($scope.space.images.length == 0)
					  {
	                     flash.setMessage(URLFactory.MESSAGES.SPACE_CREATE_IMAGE_VALIDATION_MESSAGE,URLFactory.MESSAGES.ERROR);
					  }	
	                 else
	                 {
		                $scope.space.createdBy=MeanUser.user._id;
						if($scope.space.images.length > 0){
							for (var i=0; i< $scope.space.images.length ; i++){
								if($scope.space.images[i].tempUrl){
									delete $scope.space.images[i].tempUrl;
								}
							}
						}
						$scope.space.officeHours = [];
						var days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
						for (var i=0; i< days.length; i++){
							var obj = {};
							obj.day = days[i];
							obj.startTime = $scope.mytime;
							obj.endTime = $scope.myEndTime;
							$scope.space.officeHours.push(obj);
						}
						
						var city = $scope.space.city.city;
						delete $scope.space.city;
						$scope.space.city = city;
						console.log($scope.space);
						var space = new SpaceService.crud($scope.space);
						space.$save(function(space){
							$scope.zoomLevel = 14;
							if(space.images.length > 0){
								for (var i=0; i< space.images.length ; i++){
									if(space.images[i].url){
										space.images[i].tempUrl = $scope.generateTempUrl(space.images[i].url);
									}
								}
							}
	
		                    for (var j=0; j< space.teams.length ; j++){
							   space.teams[j].role=space.teams[j].role[0]._id;
							 }
		                    
		                    for(var i = 0; i < $scope.cities.length; i++){
		    					if(space.city === $scope.cities[i].city){
		    						space.city = {
		    							_id : $scope.cities[i]._id,
		    							city : $scope.cities[i].city
		    						}
		    					}
		    				}
	
							$scope.space = space;
							console.log($scope.space);
							/*
							 * console.log("space details...");
							 * console.log($scope.space);
							 * console.log($scope.space.teams); for(var i=0 ;i<$scope.space.teams.length;i++){
							 * console.log("in for loop");
							 * console.log($scope.space.teams[i].role);
							 * $scope.space.teams[i].role=$scope.space.teams[i].role[0].name;
							 * console.log($scope.space.teams[i].role);
							 * console.log("end of for loop"); }
							 */
							
							$scope.addMore = true;
						},function (error) {
							$scope.error = error;
						});
	
	              } // closing inside else
	
				});
			} else {
				$scope.submitted = true;
				window.alert("Please fill all the required field");
			}
		
		};

		$scope.loadAmenities = function(appliesto_id) {
			$scope.loadRequiredAmeneties = true;
			SpaceService.amenity.query({
				appliesToId : appliesto_id, 
				partOf : 'space'
			}, function(amenities){
				if($scope.enableAddMoreForm || $rootScope.edit || $scope.loadRequiredAmeneties) {
					
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

						obj.isClosedaylogic=$scope.loadedspaceobject.officeHours[i].isClosed;

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

						obj.isClosedaylogic=$scope.loadedspaceobject.officeHours[i].isClosed;

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
	
		$scope.update = function(partnerDetailForm, partnerMoreDetailForm, formType){
			if($scope.contact_details_contactNo_1){
				$scope.space.contact_details_1.contactNo = $scope.contact_details_contactNo_1;
			}
			if($scope.contact_details_contactNo_2){
				$scope.space.contact_details_2.contactNo = $scope.contact_details_contactNo_2;
			}
            for(var j=0;j<$scope.space.officeHours.length;j++){
                    var startTimeDateTimeObject=new Date($scope.space.officeHours[j].startTime);
                        var starttimehourscreateroom=startTimeDateTimeObject.getHours();
                        var starttimeminutescreateroom=startTimeDateTimeObject.getMinutes();
                        var startTimeMinutes = starttimehourscreateroom*60+starttimeminutescreateroom; 
                        $scope.space.officeHours[j].checkingStartTimeNumber=startTimeMinutes;   

                    var endTimeDateTimeObject=new Date($scope.space.officeHours[j].endTime);
                        var endtimehourscreateroom=endTimeDateTimeObject.getHours();
                        var endtimeminutescreateroom=endTimeDateTimeObject.getMinutes();

                        if($scope.space.officeHours[j].isAllday)
                        {
                          var endTimeMinutes = endtimehourscreateroom*60+endtimeminutescreateroom+1440;
                        } 
                        else
                        {
                           var endTimeMinutes = endtimehourscreateroom*60+endtimeminutescreateroom;
                        } 

                         $scope.space.officeHours[j].checkingEndTimeNumber=endTimeMinutes;
                  }  



			$scope.generateSpaceHoliday();
			// $location.path($scope.SPACE.URL_PATH.SPACE_LIST);
			if(partnerDetailForm.$valid && partnerMoreDetailForm.$valid){
                 if($scope.space.images.length == 0)
				  {
                     flash.setMessage(URLFactory.MESSAGES.SPACE_CREATE_IMAGE_VALIDATION_MESSAGE,URLFactory.MESSAGES.ERROR);
				  }	
                  else
                  {
					if($scope.space.images.length > 0){
						for (var i=0; i< $scope.space.images.length ; i++){
							if($scope.space.images[i].tempUrl){
								delete $scope.space.images[i].tempUrl;
							}
						}
					}
					$scope.space.partner = $scope.space.partner._id;
					var city = $scope.space.city.city;
					delete $scope.space.city;
					$scope.space.city = city;
					var newSpace = $scope.space;
					console.log(newSpace);
					var spaceUpdated = new SpaceService.crud(newSpace);
					NgMap.getMap({id : 'spaceMap'}).then(function(map) {
						$scope.spac = {};
			      		  $scope.spac.loc=[];
			      		   if ($scope.lat && $scope.lng){
			      			   console.log("hi");
			      		     $scope.spac.loc.push($scope.lng);
			      		     $scope.spac.loc.push($scope.lat);
			      		    } 
								 else { 
									 console.log("hello");
								  $scope.spac.loc.push(newSpace.loc[0]);
								  $scope.spac.loc.push(newSpace.loc[1]); 
								  }
								 console.log($scope.spac.loc);
			      		 spaceUpdated.loc = $scope.spac.loc;
					spaceUpdated.$update({
						_id : $scope.space.id
					},function(space){
						console.log(space);
						if(space.isConflict)
						{
		                   $("#spaceEditFailurSchedule").modal('show');
						}
						else
						{
							if(space.images.length > 0){
								for (var i=0; i< space.images.length ; i++){
									if($scope.space.images[i].url){
										$scope.space.images[i].tempUrl = $scope.generateTempUrl($scope.space.images[i].url);
									}
								}
							}
							for(var i = 0; i < $scope.cities.length; i++){
								if(space.city === $scope.cities[i].city){
									space.city = {
										_id : $scope.cities[i]._id,
										city : $scope.cities[i].city
									}
								}
							}
							$scope.space = space;
							console.log($scope.space);
							if(formType === 'CREATE'){
								flash.setMessage(URLFactory.MESSAGES.SPACE_DETAIL_SUCCESS,URLFactory.MESSAGES.SUCCESS);
							} else if(formType === 'EDIT'){
								flash.setMessage(URLFactory.MESSAGES.SPACE_UPDATE_SUCCESS,URLFactory.MESSAGES.SUCCESS);
							}
							$location.path($scope.SPACE.URL_PATH.SPACE_LIST);
					   }		
					},function (error) {
						$scope.error = error;
					});
					});

			   }		
			} else {
				$scope.submitted = true;
				window.alert("Please fill all the required field");
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
			var retVal = confirm("Are you sure you want to delete this space?");
			if(retVal){
				var spaceObj = new SpaceService.crud(space);
				spaceObj.$remove(function(response){
					console.log(response);
					var index = $scope.spaces.indexOf(space);
					$scope.spaces.splice(index, 1);
					flash.setMessage(URLFactory.MESSAGES.SPACE_DELETE_SUCCESS,URLFactory.MESSAGES.SUCCESS);
				}, function(err){
					console.log(err);
					flash.setMessage(URLFactory.MESSAGES.SPACE_DELETE_FAILURE,URLFactory.MESSAGES.ERROR);
				});
			}
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
	     

	
		$scope.removeImage = function (index, form, space) {
			var retVal = confirm("Are you sure you want to delete this image?");
			if(retVal){
		        if (space.images.length > 0) {
		            $timeout(function () {
		            	space.images.splice(index, 1);
		            	$scope.counter = $scope.counter-1;
		            }, 1000);
		        }
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
	              	   else if($scope.spaceapprovecheck == "Pending")
	              	   {
                          flash.setMessage(URLFactory.MESSAGES.SPACE_NOT_APPROVED,URLFactory.MESSAGES.ERROR);
                          $location.path(URLFactory.SPACE.URL_PATH.SPACE_LIST);
	              	   }
	              	   else
	              	   {
                          $scope.showroomtypecheck = !$scope.showroomtypecheck;
	              	   }	
                     
	             };
	             $scope.hidePerHour=false;
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
			              	$scope.isVirtualOffice =  false;
			              	if($scope.roomtypename == "Hot Desk")
			              	{	  
			              	  $scope.hidePerHour=false;	
		                      $scope.hotDesk=true;
		                    }
		                    if($scope.roomtypename == "Meeting Room")
			              	{	
		                    	$scope.hidePerHour=false;
		                    	 seats = 8;
		                    	 startCapacity = 2;
		                    } 
		                    if($scope.roomtypename == "Training Room")
			              	{	
		                    	$scope.hidePerHour=true;  
		                    	seats = 50;
		                   	 	startCapacity = 11;
		                    } 
		                    if($scope.roomtypename == "Board Room")
			              	{	
		                    	$scope.hidePerHour=false;
		                    	seats = 30;
		                    	startCapacity = 9;
		                    } 
		                    if($scope.roomtypename == "Virtual Office")
			              	{	
		                    	$scope.hidePerHour=false;  
		                    	$scope.virtualOffice = {};
		                    	$scope.isVirtualOffice =  true;
		                    	$scope.facilities = [];
		                    	SpaceService.virtualOfficeFacilities.query({}, function(facilities){
		        					$scope.facilities = facilities;
		        					$scope.virtualOffice.packages = [];
			                    	var obj = {};
			                    	obj.facilityList = [];
			                    	obj.paymentPlan = [];
			                    	for(var i=0; i<$scope.facilities.length; i++){
			                    		var facilityObj = {};
			                    		facilityObj.isAvailable = false;
			                    		facilityObj.facility = facilities[i].name;
			                    		facilityObj.description = facilities[i].description;
			                    		obj.facilityList.push(facilityObj);
			                    	}
			                    	for(var j=0; j <$scope.paymentPlan.length; j++){
			                    		var paymentObj = {};
			                    		paymentObj.plan = $scope.paymentPlan[j];
			                    		obj.paymentPlan.push(paymentObj);
			                    	}
			                    	$scope.virtualOffice.packages.push(obj);
			                    	console.log($scope.virtualOffice.packages);
		        					
		        				});
		                    } 
		                     if($scope.roomtypename == "Plug-N-Play")
			              	{	  
		                      $scope.roomseats=[];
		                    }   
		                     
		                     
		                     if($scope.roomtypename != "Virtual Office"){
		                    	 for(var i= startCapacity; i<=seats ; i++){
			                    	 var obj = {"capacityvalue" : i}
			                    	 $scope.roomseats.push(obj);
			                     }
		                     }
		                    

		              }, function(error) {
		                  $scope.error = error;
                    });
	             };  
	             
	             
	             
	             
	             $scope.addPackage = function() {
	            	 var obj = {};
                 	obj.facilityList = [];
                 	obj.paymentPlan = [];
	            	 for(var i=0; i<$scope.facilities.length; i++){
                 		var facilityObj = {};
                 		facilityObj.isAvailable = false;
                 		facilityObj.facility = $scope.facilities[i].name;
                 		facilityObj.description = $scope.facilities[i].description;
                 		obj.facilityList.push(facilityObj);
                 	}
	            	 for(var j=0; j<$scope.paymentPlan.length; j++){
                 		var paymentObj = {};
                 		paymentObj.plan = $scope.paymentPlan[j];
                 		obj.paymentPlan.push(paymentObj);
                 	}
                 	$scope.virtualOffice.packages.push(obj);
	     		}
	             
	             
	             
	             
	             $scope.createVirtualOffice = function(isValid) {
	            	 if(isValid)
	            	 {
	            		 $scope.virtualOffice.createdBy=MeanUser.user._id;	
	            		 $scope.virtualOffice.spaceId=$stateParams.spaceId;
	            		 $scope.virtualOffice.loc=$scope.loc;
	            		 $scope.virtualOffice.roomtype = $scope.room.roomtype;
	            		 $scope.virtualOffice.partner=$scope.partner;

                         for(var i=0;i<$scope.virtualOffice.packages.length;i++)
                         {

                         	var str = $scope.virtualOffice.packages[i].packageUrl;
                            var checkhttp = str.indexOf("http://");
                            if(checkhttp == -1)
                            {
                            	$scope.virtualOffice.packages[i].packageUrl="http://"+$scope.virtualOffice.packages[i].packageUrl;
                            }
                         }

	            		 var virtualOfficeCreate = new SpaceService.virtualOffice($scope.virtualOffice);
	            		 console.log($scope.virtualOffice);
	            		 virtualOfficeCreate.$save(function (response) {
			                	flash.setMessage(URLFactory.MESSAGES.ROOM_ADD_SUCCESS,URLFactory.MESSAGES.SUCCESS);
	                            $location.path(URLFactory.SPACE.URL_PATH.SPACE_LIST);
			                }, function (error) {
			                    $scope.error = error;
			                });
	            	 }
	               else 
	                 {
                           $scope.submitted = true;
                      }

	             }
	             

	              $scope.createroom=function(isValid){
	              	if(isValid)
	              	  {	

	              	  	if($scope.room.images.length == 0)
	              	  	 {
                            flash.setMessage(URLFactory.MESSAGES.ROOM_CREATE_IMAGE_VALIDATION_MESSAGE,URLFactory.MESSAGES.ERROR);
	              	  	 } 
                         else
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

		              	for(var j=0;j<$scope.room.roomsslotschedule.length;j++){
	                		var startTimeDateTimeObject=new Date($scope.room.roomsslotschedule[j].startTime);
	                        var starttimehourscreateroom=startTimeDateTimeObject.getHours();
	                        var starttimeminutescreateroom=startTimeDateTimeObject.getMinutes();
	                        var startTimeMinutes = starttimehourscreateroom*60+starttimeminutescreateroom; 
	                        $scope.room.roomsslotschedule[j].startTimeMinutes=startTimeMinutes;   

	                		var endTimeDateTimeObject=new Date($scope.room.roomsslotschedule[j].endTime);
	                        var endtimehourscreateroom=endTimeDateTimeObject.getHours();
	                        var endtimeminutescreateroom=endTimeDateTimeObject.getMinutes();

	                        if($scope.room.roomsslotschedule[j].isAllday)
	                        {
	                          var endTimeMinutes = endtimehourscreateroom*60+endtimeminutescreateroom+1440;
	                        } 
	                        else
	                        {
	                           var endTimeMinutes = endtimehourscreateroom*60+endtimeminutescreateroom;
	                        } 

	                        $scope.room.roomsslotschedule[j].endTimeMinutes=endTimeMinutes; 
	                	}


	                    for(var i =0;i<$scope.room.amenities.length;i++){
	                		if($scope.room.amenities[i].isApplicable && $scope.room.amenities[i].isChargeable){
	                			$scope.room.amenities[i].facilityavailable = true;
	                		}
	                	}

				           var roomcreate = new RoomService.roomdetails($scope.room);
				          
				                roomcreate.$save(function (response) {
				                	 $("#addRoomButtonSpace").attr("disabled", true);
				                	if($scope.room.images.length > 0){
								for (var i=0; i< $scope.room.images.length ; i++){
									if($scope.room.images[i].url){
										$scope.room.images[i].tempUrl = $scope.generateTempUrl($scope.room.images[i].url);
									}
								}
							}
			                	
			                	
			                	flash.setMessage(MESSAGES.ROOM_ADD_SUCCESS,URLFactory.MESSAGES.SUCCESS);
	                            $location.path($scope.SPACE.URL_PATH.SPACE_LIST);
			                }, function (error) {
			                    $scope.error = error;
			                });

				         }  // closing inside else

		              }  
		            else {
                           $scope.submitted = true;
                         }
	             }; 

	              $scope.loadspaceloc=function(){
		                SpaceService.crud.get({'spaceId':$stateParams.spaceId},function (response) {
		                	$scope.loadedspaceobject=response;
		                	$scope.spaceofficeHourscheck=response.officeHours;
		                	$scope.spaceapprovecheck=response.approveStatus;
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
	            /* alert('Only PNG and JPEG are accepted.'); */
	        	flash.setMessage(MESSAGES.FILETYPE,MESSAGES.ERROR);
	            return;
	        }
	        if (image.size > (10*(1024 * 1024))) {
/* alert('file size exceeded.'); */
	        	flash.setMessage(MESSAGES.FILESIZEEXCEEDED,MESSAGES.ERROR);
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
	        	flash.setMessage(MESSAGES.IMAGESUCCESS,MESSAGES.SUCCESS);
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
		
		
		
		$scope.virtualOfficeImageUpload = function(image){
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
	      // var isImage = false;
	       $scope.roomImageEnabled = true;
	        $scope.upload = Upload.upload({
	            url: '/api/config/'+ userId + '/cupload',
	            method: 'POST',
	            file: image
	        }).success(function (response) {
	        	    $scope.roomImageEnabled = false;
	     	   		$scope.virtualOffice.image = response.url;
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
			// $scope.amenityChargeable = false;
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
      $scope.mytime.setSeconds(0);
      $scope.mytime.setMilliseconds(0);
      
      $scope.myEndTime = new Date();
      $scope.myEndTime.setHours(0);
      $scope.myEndTime.setMinutes(0);
      $scope.myEndTime.setSeconds(0);
      $scope.myEndTime.setMilliseconds(0);
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


       $scope.setFulldayClosedRoom = function(hoursObj){

       	    var mynewstarttime=new Date(hoursObj.startTime);
			var mynewsethourstarttime=mynewstarttime.getHours();
			var mynewsetminutestarttime=mynewstarttime.getMinutes();
			var mynewsetsecondstarttime=mynewstarttime.getSeconds();
			var mynewsetmillisecondstarttime=mynewstarttime.getMilliseconds();

			      $scope.mytime = new Date();
			      $scope.mytime.setHours(mynewsethourstarttime);
			      $scope.mytime.setMinutes(mynewsetminutestarttime);
			      $scope.mytime.setSeconds(mynewsetsecondstarttime);
			      $scope.mytime.setMilliseconds(mynewsetmillisecondstarttime);


			  var mynewendtime=new Date(hoursObj.endTime);
			  var mynewsethourendtime=mynewendtime.getHours();
			  var mynewsetminutendtime=mynewendtime.getMinutes();
			  var mynewsetsecondendtime=mynewendtime.getSeconds();
			  var mynewsetmillisecondendtime=mynewendtime.getMilliseconds();
	      
			      $scope.myEndTime = new Date();
			      $scope.myEndTime.setHours(mynewsethourendtime);
			      $scope.myEndTime.setMinutes(mynewsetminutendtime);
			      $scope.myEndTime.setSeconds(mynewsetsecondendtime);
			      $scope.myEndTime.setMilliseconds(mynewsetmillisecondendtime);

       };  


		$scope.toggleClosedAddRoom = function(hoursObj) {
			if(hoursObj.isClosed && hoursObj.isAllday){
				hoursObj.isAllday = false;
			}
			 if(hoursObj.isClosed)
		      {
		        $scope.setFulldayClosedRoom(hoursObj);
		        hoursObj.startTime = $scope.mytime;
		        hoursObj.endTime = $scope.myEndTime;
		      }
			if(!hoursObj.isAllday && !hoursObj.isClosed){

		        $scope.setFulldayClosedRoom(hoursObj);
				hoursObj.startTime = $scope.mytime;
				hoursObj.endTime = $scope.myEndTime;
				
			}
		};

		$scope.cancelScheduleEditSpace=function()
		{
			$location.path($scope.SPACE.URL_PATH.SPACE_LIST);
		};

		$scope.setClosedDaySpace=function(hoursObj)
		{

			var date = new Date();
			date.setHours(0);
			date.setMinutes(0);
			date.setSeconds(0);
			date.setMilliseconds(0);
			hoursObj.startTime = date;
			var enddate = new Date();
			enddate.setHours(0);
			enddate.setMinutes(0);
	        enddate.setSeconds(0);
            enddate.setMilliseconds(0);
			hoursObj.endTime = enddate;

		};
	     
		/*
		 * Loading spaces for back office
		 */
			$scope.findBackOffice=function(){
				console.log("in find back office");
				console.log(MeanUser.user.hasRole);
				if(MeanUser.user.hasRole == 'BackOffice'|| 'FrontOffice'){
					SpaceService.backOfficeSpace.query({
						'user' : MeanUser.user
					},function(response) {
						console.log(response);
				    });
				}else{
					
				}
					
				};


	            $scope.sendToSpaceApproval=function(space){
			      	     SpaceService.sendToSpaceApprove.update({"spaceId":space._id},function(response){ 
			      	          flash.setMessage(URLFactory.MESSAGES.SPACE_SENT_FOR_APPROVAL_SUCCESS,URLFactory.MESSAGES.SUCCESS);          
		                      space.sentToAdminApproval=true;
		                 },function(error){
		                       console.log(error);
		                 });
				
				};	



				$scope.removeVirtualofficePackage=function(index)
		       {
                 $scope.virtualOffice.packages.splice(index, 1);
		       };		
						
				

				
				$scope.loadvirtualOffices = function() {
						RoomService.virtualOfficeDetailsBySpace.query({spaceId : $stateParams.spaceId},function(response) {
			                  $scope.virtualOffices = response;
			              }, function(error) {
			                  console.log(error);
			              });
		          };
		          
		          
		          /**
					 * Check if all address fields is added and call the
					 * function to add marker in map
					 * 
					 * @params {location} location details which is already
					 *         filled in form to fetch address for map
					 */        
		            $scope.fetchMap = function(space){
		                   var address = undefined;
		                   $scope.mapError = true;
	                       if (space.address1){
	                           if (space.address2){
                                   /*if (space.city){*/
                                	   if(space.state){
                                		   if(space.country){
                                			   if(space.postal_code){
			                                	   $scope.zoomLevel = 15;
			                                       $scope.space = space
			                                       $scope.mapError = false;
			                                       address = {
		                                    		   address1: space.address1,
		                                    		   address2:space.address2,
		                                    		   locality:space.locality,
		                                    		   city:$scope.selectedCity.city,
		                                    		   state:space.state,
		                                    		   country:space.country,
		                                    		   postal_code:space.postal_code
			                                       }
                                			   }
                                		   }	
                                       	}
                                    /*}*/
	                           	}
	                        }
		                   $scope.addAddress(address)
		             };
		             /**
						 * Fetch position on Changing marker position
						 */                
		              $scope.dragFn = function(){
		                   $scope.lat=this.position.lat();
		                   $scope.lng=this.position.lng();
		                 };
		             
		             /**
						 * Add marker on map if address is added
						 * 
						 * @params {address} address of location based on which
						 *         marker is added in map
						 */               
		              $scope.addAddress = function(address){
		            	  if (!angular.isUndefined(address)) {
	                         $scope.address = address.address1 + ' ' + address.address1 + ' ' + address.locality + ' ' + address.city + ' ' + address.state +' ' + address.country + ' ' + address.postal_code;
	                      } else {
	                         $scope.address = undefined;
	                      }
		            	  /*$scope.lat = this.position.lat();
		            	  $scope.lng = this.position.lng();*/
		            	  console.log($scope.address);
		              };
		             
		              /**
						 * Initialize map
						 */
		              $scope.$on('mapInitialized', function(evt, map){
		                });
		             
				

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
