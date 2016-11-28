
'use strict';

/* jshint -W098 */
angular.module('mean.plugNplay',['ngMap', 'datatables']).controller('PlugNplayController', [ '$scope', '$rootScope', '$location', '$stateParams', 'Global', 'URLFactory', 'PlugNplayService', 'flash','MESSAGES','MeanUser','Upload','$timeout','DTOptionsBuilder','DTColumnDefBuilder','PLUGNPLAY','SearchService','$uibModal','NgMap',
    function ($scope, $rootScope, $location, $stateParams, Global, URLFactory, PlugNplayService, flash,MESSAGES,MeanUser,Upload,$timeout,DTOptionsBuilder,DTColumnDefBuilder,PLUGNPLAY,SearchService,$uibModal,NgMap) {
		$scope.global = Global;
		$scope.package = {
			name : 'plugNplay',
	        modelName: 'Plug-N-Play',
	        featureName: 'Plug-N-Play'
	    };
		
		$scope.plugNplay = {};
		$scope.plugNplay.loc = [];
		$scope.PLUGNPLAY=PLUGNPLAY;
		$scope.plugNPlayAreas=[{}];
		$scope.plugNPlayImages=[{}];
		$scope.areaSelectedArray=[];
		$scope.imageSelectedArray=[];
		 $scope.contactTypes = [{
        	contactType : 'Mobile'
        }, {
        	contactType : 'Landline'
        }];

        $scope.modalTrue = true;
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

        $("#contact_details_2_contactNo").on("keyup change", function() {
        	$scope.contact_details_contactNo_2 = $("#contact_details_2_contactNo").intlTelInput("getNumber");
        });
    	$scope.isNumberInvalid = false;
		$( "#contact_details_2_contactNo" ).blur(function() {
			$("#contact_details_2_contactNo").val($("#contact_details_2_contactNo").intlTelInput("getNumber", intlTelInputUtils.numberFormat.NATIONAL));
			 if ($.trim($("#contact_details_2_contactNo").val())) {
    			if ($("#contact_details_2_contactNo").intlTelInput("isValidNumber")) {
    				$scope.isNumberInvalid = false;
    				console.log($scope.isNumberInvalid);
    			}
    			else {
    				$scope.isNumberInvalid = true;
    				console.log($scope.isNumberInvalid);
    			}
    		}
		});

		$scope.showForm =function(){
	        $scope.showformcheck = !$scope.showformcheck;
	    };
	    flashmessageOn($rootScope, $scope,flash);
	    $scope.MESSAGES=MESSAGES;

		$scope.plugnplayUser = {};

		$scope.plugnplayUser.spaceType = {
			id : '1',
			desks : 'Business Centre'
		} //This sets the default value of the select in the ui
		$scope.spaceTypeList = {
			spaceTypeOptions : [ {
				id : '1',
				spaceType : 'Business Centre'
			}, {
				id : '2',
				spaceType : 'Co-working Space'
			} ]
		};
		
		$scope.plugnplayUser.noOfDesks = {
			id : '1',
			desks : '0-5'
		} //This sets the default value of the select in the ui
		$scope.deskList = {
			deskOptions : [ {
				id : '1',
				desks : '0-5'
			}, {
				id : '2',
				desks : '5-10'
			}, {
				id : '3',
				desks : '10-15'
			}, {
				id : '4',
				desks : '15-20'
			}, {
				id : '5',
				desks : 'more than 20'
			} ]
		};
		
		$scope.plugnplayUser.duration = {
			id : '1',
			duration : '1-3 months'
		} //This sets the default value of the select in the ui
		$scope.durationList = {
			durationOptions : [ {
				id : '1',
				duration : '1-3 months'
			}, {
				id : '2',
				duration : '3-6 months'
			}, {
				id : '3',
				duration : 'More than 6 months'
			} ]
		};
		
		$scope.plugnplayUser.budget = {
			id : '1',
			budget : '0-10000 (INR)'
		} //This sets the default value of the select in the ui
		$scope.budgetList = {
			budgetOptions : [ {
				id : '1',
				budget : '0-10000 (INR)'
			}, {
				id : '2',
				budget : '10000-15000 (INR)'
			}, {
				id : '3',
				budget : 'More than 15000 (INR)'
			} ]
		};
		
	    /**
	     * Initialize popup
	     */
	    $scope.initializePopup = function($scope, modelName, MESSAGES, $uibModal) {
	    	$scope.modalPopupSuccess = function() {
	    		var modalInstancePP = $uibModal.open({
	    			templateUrl: 'plugNplay/views/plugNplayUserSuccess.html',
	    			controller: 'PlugNplayController',
	    			size: 'lg',
    				backdrop: 'static',
  					keyboard: false
	    		});
	    	};

            $scope.modalPopupPlugNPlay = function() {
                var modalInstancePP = $uibModal.open({
                    templateUrl: 'plugNplay/views/plugNplayUserForm.html',
                    controller: 'PlugNplayController',
                    size: 'lg',
                    backdrop: 'static',
                    keyboard: false
                });
            };
	    	
	    };
	    
	    $scope.initializePopup($scope, $scope.package.modelName, URLFactory.MESSAGES, URLFactory.uibModal);    

	    $scope.getLatitudeLongitude = function(address) {
			// If adress is not supplied, use default value 'Ferrol, Galicia, Spain'
			//address = address || 'Bangalore';
			// Initialize the Geocoder
	    	console.log(address);
			var geocoder = new google.maps.Geocoder();
			if (geocoder) {
				geocoder.geocode({
					'address': address
				}, function (results, status) {
					console.log(status);
					console.log(results);
					if (status == google.maps.GeocoderStatus.OK) {
						var lon = results[0].geometry.location.lng();
						var lat = results[0].geometry.location.lat();

						$scope.plugNplay.loc.push(lon);
						$scope.plugNplay.loc.push(lat);
						var plugNplay = new PlugNplayService.crud($scope.plugNplay);
						plugNplay.$save({
				    	}, function(response){
				    		console.log(response);
				    		
				    	}, function(error){
				        	console.log(error);
				    	});
					}
					
				});
			}
		};
		
		$scope.createplugNplay = function(){
			console.log($scope.plugNplay)
			var address = $scope.plugNplay.address1 + ', ' + $scope.plugNplay.address2 + ', ' + $scope.plugNplay.city + 
							', ' + $scope.plugNplay.state + ', ' + $scope.plugNplay.country;
			console.log(address);
			var loc = $scope.getLatitudeLongitude(address);
			console.log(loc);
		
		};
		
		$scope.onFileSelect = function(image) {
			if (angular.isArray(image)) {
				image = image[0];
			}

			// This is how I handle file types in client side
			if (image.type !== 'image/png' && image.type !== 'image/jpeg') {
				alert('Only PNG and JPEG are accepted.');
				//flash.setMessage(MESSAGES.FILETYPE,MESSAGES.ERROR);
				return;
			}
			if (image.size > (1024 * 1024)) {
	            alert('file size exceeded.');
	        	//flash.setMessage(MESSAGES.FILESIZEEXCEEDED,MESSAGES.ERROR);
	            return;
	        }
			var user = MeanUser.user;
			var userId = user._id;
			$scope.isImageUploaded = false;
			$scope.loaderEnabled = true;
			$scope.upload = Upload.upload({
						url : '/api/config/' + userId + '/cupload',
						method : 'POST',
						file : image
					})
					.success(function(response) {
						$scope.loaderEnabled = false;
			  //      	flash.setMessage(MESSAGES.IMAGESUCCESS,MESSAGES.SUCCESS);
					//	alert("image uploaded");
						flash.setMessage(URLFactory.MESSAGES.PLUGNPLAYCREATEIMAGE,MESSAGES.SUCCESS);
						$timeout(function () {
				        	var resp = $scope.generateTempUrl(response.url)
			     	   		//$scope.plugNplay.tempUrl = resp;
				        	$scope.plugNplay.image.push(resp);
				        	console.log($scope.plugNplay);
				        	//$scope.plugNplay.image =$scope.plugNplay.tempUrl;
				        	//console.log($scope.plugNplay.image);
				        	//$scope.createPlugandPlay($scope.plugNplay.image);
				        	$scope.update();
			            }, 1000);
						
					})
					.error(function(err) {
				if (err) {}
			});
		};
		
		$scope.generateTempUrl = function(response) {
			var image = response;
     	   	 var res = image.split("upload");
        	 var resp = res[0] + "upload/w_200,h_200,c_thumb" + res[1];
        	 return resp;
        	 console.log(resp);
        };
        
        $scope.createPlugandPlay = function(plugNPlayImage) {
        	console.log("in creatre plug and play");
        	console.log(plugNPlayImage);
        	$scope.plugNplay.image=plugNPlayImage;
        	console.log($scope.plugNplay);
				var plugNplay = new PlugNplayService.plugNPlay($scope.plugNplay);
				console.log(plugNplay);
				plugNplay.$save(function(response) {
					console.log(response);
					
				});
		};
		$scope.listPlugNplay=function(){
			$scope.dtOptions = DTOptionsBuilder.newOptions().withPaginationType('full_numbers').withDisplayLength(10);
			$scope.dtColumnDefs = [
			                   DTColumnDefBuilder.newColumnDef(0).notVisible(),
			                   DTColumnDefBuilder.newColumnDef(1),
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
			PlugNplayService.plugNPlay.query(function (plugNplays) {
	                $scope.plugNplays = plugNplays;
	            });
		};
		
		$scope.redirectToDetails=function(urlPath,id){
			  urlPath = urlPath.replace(":plugNplayId", id);
              $location.path(urlPath);
		}
		$scope.findOnePlugNplay=function(){
			
		    $scope.dtOptions1 = DTOptionsBuilder.newOptions().withPaginationType('full_numbers').withDisplayLength(10);
			$scope.dtColumnDefs1 = [
			                   DTColumnDefBuilder.newColumnDef(0),
			                   DTColumnDefBuilder.newColumnDef(1),
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
			PlugNplayService.plugNPlay.get({
				plugNplayId : $stateParams.plugNplayId
			}, function(plugNplay) {
				console.log(plugNplay.city);
				$scope.selectLocationObj(plugNplay.city);
				$scope.plugNplay = plugNplay;
			});
		};
		$scope.addArea=function(area){
				console.log(area);
				document.getElementById("plagNplayAreasForm").reset();
				console.log("in add area");
				console.log(area);
				$scope.plugNplay.areas.push(area);
				console.log($scope.plugNplay.areas);
				$scope.update();
				flash.setMessage(URLFactory.MESSAGES.PLUGNPLAYCREATE,MESSAGES.SUCCESS);
		};
		$scope.addImage=function(image){
			console.log("in add image");
			console.log(image);
			$scope.plugNPlayImages.push(image);
			console.log($scope.plugNPlayImages);
		};
		
 		

		
		$scope.update=function(){
			console.log($scope.plugNplay);
			var plugNplay = $scope.plugNplay;
            if (!plugNplay.updated) {
            	plugNplay.updated = [];
            }
            plugNplay.updated.push(new Date().getTime());
            plugNplay.$update(function () {
            	console.log("in update");
            });
            $scope.imageSelectedArray=[];
            $scope.areaSelectedArray=[];
		};
		
		/*$scope.deleteArea=function(index){
			$scope.plugNplayAreaSelected=[];
			console.log("in delete area");
			console.log(index);
			//console.log(plugNplayAreaSelected);
			 alert($scope.checked);
			 console.log($scope.checked);
			 console.log($scope.plugNplay);
	          $scope.plugNplay.areas.splice(function(record){
	              return $scope.checked[$index];
	          },1);
	          console.log("end of delete");
		};*/
		 $scope.deleteArea=function(){
			var retVal = confirm("Are you sure you want to delete this area?");
			if(retVal){
				for(var i=0;i<$scope.areaSelectedArray.length;i++){
					$scope.plugNplay.areas.splice($scope.areaSelectedArray[i], 1);
					console.log($scope.plugNplay.areas);
					$scope.update();	
					$location.path($location.path());
					flash.setMessage(URLFactory.MESSAGES.PLUGNPLAYDELETEAREA,MESSAGES.SUCCESS);
				}
			}
		 };
		
		 $scope.deleteImage=function(){
			var retVal = confirm("Are you sure you want to delete this image?");
			if(retVal){
				for(var i=0;i<$scope.imageSelectedArray.length;i++){
					$scope.plugNplay.image.splice($scope.imageSelectedArray[i], 1);
					console.log($scope.plugNplay.image);
					$scope.update();	
					
					flash.setMessage(URLFactory.MESSAGES.PLUGNPLAYDELETEIMAGE,MESSAGES.SUCCESS);
		 		}
			}
		 };
		 
		// $scope.checkedArea=[];
		 $scope.selectedArea=function(index,checked){
			 console.log("in select area");
			 console.log(index);
			 console.log(checked);
			 console.log($scope.areaSelectedArray);
			// if()
			 if(checked==true){
				 $scope.areaSelectedArray.push(index);
				 console.log($scope.areaSelectedArray);
			 }else{
				 console.log("in else");
				 $scope.areaSelectedArray.splice(index, 1);
				 console.log($scope.areaSelectedArray);
			 }
			
		 };
		 
		 $scope.selectedImage=function(index,checkedImage){
			 console.log("in select image");
			 console.log(index);
			 console.log(checkedImage);
			 if(checkedImage==true){
				 console.log($scope.imageSelectedArray);
				 $scope.imageSelectedArray.push(index);
				 console.log($scope.imageSelectedArray);	 
			 }else{
				 console.log("in else");
				 $scope.imageSelectedArray.splice(index, 1);
				 console.log($scope.imageSelectedArray);
			 }
			 
		 };
		 $scope.BackToPlugNPlay=function(){
            $('.modal').hide();
			$location.path(PLUGNPLAY.URL_PATH.PLUGANDPLAY);
		 };
		 $scope.selectedLocation = {};

			$scope.selectLocationObj =  function(index) {
				console.log("in slelct loation");
				console.log(index);
				SearchService.areas.get({
					city: index
				}, function(location){
					console.log(location);
					$scope.localityAreas = location.areas;
					for (var i = 0; i < $scope.localityAreas.length; i++) {
		                $scope.localityAreas[i].uniqueid = $scope.localityAreas[i]._id;
		            }
				});
			};
			
			$scope.resultPlugNPlay=function(){
				console.log("in room resukt");
				var queryParams = $location.search();
				$scope.resultLocation=queryParams;
				console.log($scope.resultLocation);
				PlugNplayService.plugNPlayForSearch.get({
					citySelected: $scope.resultLocation.search_city
				}, function(location){
					console.log(location);
					$rootScope.roomsDetail = $scope.resultLocation;
					console.log($rootScope.roomsDetail);
					var loc = $rootScope.roomsDetail.loc.split(",");
					delete $rootScope.roomsDetail.loc;
					$rootScope.roomsDetail.loc = [];
					$rootScope.roomsDetail.loc.push(parseFloat(loc[1]));
					$rootScope.roomsDetail.loc.push(parseFloat(loc[0]));
					NgMap.getMap().then(function(map) {
	    				$scope.map = map;
	    				console.log(map);
	    			});
					console.log($scope.map);
					$timeout(function(){
			    		$scope.loadLatLong();
			    	}, 2000);
					console.log("after map load");
					$scope.resultLocationImages=location.image;
					console.log($scope.resultLocationImages);
				});
			};	    
			
							$scope.dateInvalid = false;
			$scope.savePlugnplayUser = function(plugnplayUser,isValid){
							$scope.dateInvalid = false;
							$scope.nameInvalid = false;
							plugnplayUser.phonenumber = $('#contact_details_2_contactNo').val().replace(" ","");
				if(isValid){
					if(!plugnplayUser.phonenumber || plugnplayUser.phonenumber.length < 10) {
						flash.setMessage(MESSAGES.PHONE_NUMBER,MESSAGES.ERROR);
						
					}
						else {
							var plugNplay = new PlugNplayService.plugnplayUser(plugnplayUser);
							console.log(plugNplay);
							plugNplay.$save(function(response) {
								console.log(response);
								 $("#plugNPlayUserForm").hide();
								  $(".modal-backdrop").hide();
								$scope.modalPopupSuccess();
								
							});
						}
					}
					else
					{

						if($('input[name="first_name"]').val().length < 4){
							$scope.nameInvalid = true;
						}
						if($('.lineHg').val() == ""){
							$scope.dateInvalid = true;
						}
						$scope.submitted = true;
						$scope.submittedStartDate = true;
					}
				
			};
			
			$scope.areaCityDetails=function(){
				console.log($scope.plugnplayUser);
				$scope.initPhonePulgnplay();
				var queryParams = $location.search();
				$scope.resultLocationpopUp = queryParams;
				if($scope.resultLocationpopUp && $scope.resultLocationpopUp.search_place){
					$scope.plugnplayUser.area = $scope.resultLocationpopUp.search_place;
					$scope.plugnplayUser.city = $scope.resultLocationpopUp.search_city;
				} else { 
					$scope.plugnplayUser.area = $rootScope.plugNPlaySearchObj.place;
					$scope.plugnplayUser.city = $rootScope.plugNPlaySearchObj.city;
				}
				if($scope.modalTrue) {
					$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
						$("#plugNPlayUserForm").show();
					});
				}
			};
			$scope.backToSearch=function(){
				 $("#plugNPlayUserForm").hide();
				 $("#plugNPlayUserSuccess").hide();
				  $(".modal-backdrop").hide();
                  $('.modal').hide();
				$location.url('/');
			}
			
			$scope.loadLatLong = function() {
				console.log($rootScope.roomsDetail);
		    	if (!angular.isUndefined($rootScope.roomsDetail)) {
					$scope.roomPostions = $rootScope.roomsDetail;
					
					if (!angular.isUndefined($rootScope.GoogleMapMarkers)) {
						for(var i = 0; i < $rootScope.GoogleMapMarkers.length; i++) {
							if(JSON.stringify($rootScope.GoogleMapMarkers[i]._id) !== JSON.stringify($scope.roomPostions._id)){
								$rootScope.GoogleMapMarkers[i].setMap(null);
							}
					    }
					}
					var myLatlng = {
						lat : $scope.roomPostions.loc[1],
						lng : $scope.roomPostions.loc[0]
					};
					$scope.bounds = new google.maps.LatLngBounds();
					
				    $scope.tempInfoWindows = new google.maps.InfoWindow();
				    $timeout(function(){
				    	$scope.initMap(myLatlng);
				    }, 1000);
					
				}
			};

			$scope.initMap = function(myLatlng) {
				
				var point = new google.maps.LatLng(myLatlng.lat, myLatlng.lng);
	            // extend the bounds to include the new point
	            $scope.bounds.extend(point);
	            $scope.map.fitBounds($scope.bounds);
	            
				var marker = new google.maps.Marker({
					position : point,
					map : $scope.map,
					title : $scope.roomPostions.name,
					icon : '../../../core/system/assets/img/custom/icon-maker.png'
				});
				
				console.log(marker);
				console.log($scope.map);
				
				$scope.map_center = [$scope.roomPostions.loc[1], $scope.roomPostions.loc[0]];

				var zoomChangeBoundsListener = google.maps.event.addListenerOnce($scope.map, 'bounds_changed', function(event) {
                    if ($scope.map.getZoom()){
                    	$scope.map.setZoom(17);
                    }
	            });
	            $timeout(function(){
	            	google.maps.event.removeListener(zoomChangeBoundsListener)
	            }, 2000);
				
			};

			$scope.loadCalendarPlugnplay = function() {
				if($('.lineHg').val() == ""){
					$scope.dateInvalid = false;
				}
				$scope.submittedStartDate = false;
				// calEventObj.excludeSunday = true;
				// calEventObj.excludeHoliday = true;
				$('input[name="startDate"]').daterangepicker(
						{ 
							minDate: moment(),
							maxDate: moment().add(90, 'days'),
							singleDatePicker: true,
							drops: "up"
						});
				$('input[name="startDate"]').focus();
			};
			$scope.nameInvalid = false;
			$scope.validateName = function(name) {
				$scope.nameInvalid = false;
					if($('input[name="first_name"]').val().length < 4){
						$scope.nameInvalid = true;
					}
					else
						$scope.nameInvalid = false;
			};

			$( 'input[name="first_name"]' ).blur(function() {
				$scope.nameInvalid = false;
				if($('input[name="first_name"]').val().length < 4){
					$scope.nameInvalid = true;
				}
				else
					$scope.nameInvalid = false;

			});
			
			$scope.initPhonePulgnplay = function () {
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

				$("#contact_details_2_contactNo").on("keyup change", function() {
				$scope.contact_details_contactNo_2 = $("#contact_details_2_contactNo").intlTelInput("getNumber");
				});
				$scope.isNumberInvalid = false;
				$( "#contact_details_2_contactNo" ).blur(function() {
				$("#contact_details_2_contactNo").val($("#contact_details_2_contactNo").intlTelInput("getNumber", intlTelInputUtils.numberFormat.NATIONAL));
				if ($.trim($("#contact_details_2_contactNo").val())) {
				if ($("#contact_details_2_contactNo").intlTelInput("isValidNumber")) {
					$scope.isNumberInvalid = false;
					console.log($scope.isNumberInvalid);
				}
				else {
					$scope.isNumberInvalid = true;
					console.log($scope.isNumberInvalid);
				}
				}
				});
			};
	}
]);
