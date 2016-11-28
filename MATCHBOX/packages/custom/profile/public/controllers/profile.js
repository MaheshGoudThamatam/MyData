'use strict';

/* jshint -W098 */
angular.module('mean.profile').controller('ProfileController', [ '$scope', 'Global', 'ProfileService', '$rootScope', 'MeanUser', 'Upload','$location',  'URLFactory','flash','BOOKING','MESSAGES','RoleService',
  function SpaceTypeController($scope, Global, ProfileService, $rootScope, MeanUser, Upload, $location, URLFactory, flash,BOOKING,MESSAGES,RoleService ) {
  	$scope.URLFactory = URLFactory;
	$scope.global = Global;
	$scope.BOOKING=BOOKING;
	$scope.MESSAGES=MESSAGES;
	$scope.contactDetail = {};
	hideBgImageAndFooter($rootScope);
	flashmessageOn($rootScope, $scope,flash);
	
	if($rootScope.user){
		$scope.userDetailObj = $rootScope.user;
	}else{
		$scope.userDetailObj = MeanUser.user;
	}
	
	
	$("#contactPhoneNo").intlTelInput({
  	  initialCountry: "auto",
  	  geoIpLookup: function(callback) {
  	    $.get('http://ipinfo.io', function() {}, "jsonp").always(function(resp) {
  	      var countryCode = (resp && resp.country) ? resp.country : "";
  	      callback(countryCode);
  	    });
  	  },
  	  utilsScript: "../../../../../bower_components/intl-tel-input/build/js/utils.js" // just for formatting/placeholders etc
	});
	  
	$("#contactPhoneNo").on("keyup change", function() {
    	$scope.contactPhoneNo = $("#contactPhoneNo").intlTelInput("getNumber");
    });
	
	$( "#contactPhoneNo" ).blur(function() {
		$("#contactPhoneNo").val($("#contactPhoneNo").intlTelInput("getNumber", intlTelInputUtils.numberFormat.NATIONAL));
	});
	
	
	$scope.loadUser = function(){
		 $scope.userDetail = MeanUser.user;
		 if(!$scope.userDetail.phone){
			 $scope.userDetail.phone;
		 } else {
			 var contactNo = $scope.userDetail.phone + '';
			 var extCode = contactNo.slice(0, (contactNo.length-10));
			 //var extCode = contactNo.slice(0, 2);
			 contactNo = contactNo.replace(extCode, '');
			 //contactNo = parseInt(contactNo);
			 $("#contactPhoneNo").intlTelInput("setNumber", contactNo);
			 $("#contactPhoneNo").val(contactNo.intlTelInput("getNumber", intlTelInputUtils.numberFormat.NATIONAL));
		 }
	}	
	
	$scope.upadteUser = function(user) {
		var userDetail = new ProfileService.userProfile(user);
		userDetail.$update({
			userId : $scope.userDetail._id
		}, function(userDetail) {
			$scope.userDetail = userDetail;
			if(userDetail.avatar){
			 $scope.image = userDetail.avatar;
                         $scope.res = $scope.image.split("upload");
                         $scope.thumbimg = $scope.res[0] + "upload/w_50,h_50,c_thumb" + $scope.res[1];
			}
			$rootScope.$emit('Pictureupdated');
			if($scope.isProfileUpdate){
				
				// $scope.dashboardRedirectionBasedOnRole();
			}
			flash.setMessage(MESSAGES.PROFILE_UPDATE_MESSAGE, MESSAGES.SUCCESS);
		});
	}
   $scope.submitted = false;
   $scope.isPhNoInvalid = false;
	$scope.update = function(obj, profileFormDetail) {
		console.log(obj);
		console.log(profileFormDetail);
	    $scope.phNumberVal = $("#contactPhoneNo").val();
	    console.log($scope.phNumberVal);
	    if(profileFormDetail.$valid)
	    {
	      if(!$scope.phNumberVal || $scope.phNumberVal.length < 10){
	        $scope.isPhNoInvalid = true;
	      }
	      else {
	
	        // var temp = $("#contactPhoneNo").intlTelInput("getNumber", intlTelInputUtils.numberFormat.NATIONAL);
	        var temp = $("#contactPhoneNo").intlTelInput("getNumber");
	        temp.replace(" ","");
	        $scope.userDetail.phone = temp;
	        $scope.isPhNoInvalid = false;
	        $scope.submitted = false;
	        $scope.userDetail.profileUpdated = true;
	        $scope.upadteUser($scope.userDetail);
	        $scope.isProfileUpdate = true;      
	      }
	    }
	    else {
	      flash.setMessage(MESSAGES.ALL_FIELDS_REQUIRED, MESSAGES.ERROR);
	       $scope.submitted = true;
	    }
	};
	
	
	
	
	$scope.onFileSelect = function (image) {
           if (angular.isArray(image)) {
               image = image[0];
           }
           // This is how I handle file types in client side
           if (image.type !== 'image/png' && image.type !== 'image/jpeg') {
               alert('Only PNG and JPEG are accepted.');
               return;
           }
           var userId = $scope.userDetail._id;
           $scope.isImageUploaded = false;
            $scope.loaderEnabled = true;
           $scope.upload = Upload.upload({
               url: '/api/config/'+ userId + '/cupload',
               method: 'POST',
               file: image
           }).success(function (response) {
           	 $scope.loaderEnabled = false;
             $scope.userDetailObj.avatar =  response.url;
             $scope.isProfileUpdate = false;
             $scope.upadteUser($scope.userDetailObj);
             flash.setMessage(MESSAGES.IMAGESUCCESS, MESSAGES.SUCCESS);
           }).error(function (err) {
               if(err){}
           });
       };
       
       $scope.changePassword = function () {
    	   $location.path('/change-password');
       }
       
    $scope.userBookings=function(){
   		$location.path(BOOKING.URL_PATH.USER_MYBOOKINGS);
   	};
   	$scope.dashboardRedirectionBasedOnRole = function () {
            RoleService.role.query({}, function (roles) {
                $scope.roles = roles;
                if (MeanUser.user) {
                    var found = false;
                    for (var i = 0; i < MeanUser.user.role.length; i++) {
                        for (var j = 0; j < $scope.roles.length; j++) {
                            if (JSON.stringify(MeanUser.user.role[i]) === JSON.stringify($scope.roles[j]._id)) {
                                $scope.loggedInRole = $scope.roles[j];
                                found = true;
                                break;
                            }
                        }
                        if (found) {
                            break;
                        }
                    }
                    $scope.isUser = true;
                    if (found) {
                        if ($scope.loggedInRole.name.match(/partner/i)) {
                            $scope.isUser = false;
                            $rootScope.loggedInUser.hasRole = 'Partner';
                            $rootScope.loggedInUser.isPartner = true;
                            $scope.dashboardUrl = URLFactory.SPACE.URL_PATH.SPACE_LIST;
                            if (angular.isUndefined($location.search().nord)) {
                                $location.path($scope.dashboardUrl);
                            }
                        } else if ($scope.loggedInRole.name.match(/backoffice/i)) {
                            $scope.isUser = false;
                        } else if ($scope.loggedInRole.name.match(/frontoffice/i)) {
                            $scope.isUser = false;
                        } else if ($scope.loggedInRole.name.match(/admin/i)) {
                            $scope.isUser = false;
                            $rootScope.loggedInUser.hasRole = 'Admin';
                            $rootScope.loggedInUser.isPartner = false;
                            $scope.dashboardUrl = URLFactory.SUPERADMIN.URL_PATH.LIST_PARTNERS;
                            if (angular.isUndefined($location.search().nord)) {
                                $location.path($scope.dashboardUrl);
                            }
                        } else {
                            $scope.isUser = true;
                            $location.path('/');
                        }
                    }
                    else{
                    	 $location.path('/');
                    }
                }
            });
        };
        $scope.contactDetail.spaceType = "Hotel";
        $scope.captchaResponse = false;
        $scope.submitQuery = function(contactUsForm) {
          if(contactUsForm.$valid){
              if(contactUsForm.$error.recaptcha)
              {
                  flash.setMessage(MESSAGES.CAPTCHA_REQ, MESSAGES.ERROR);
              }
              else {
                  ProfileService.contactPage.save($scope.contactDetail, function(response) {
                      flash.setMessage(MESSAGES.CONTACT_QUERY, MESSAGES.SUCCESS);
                      $scope.contactDetail = {};
                      grecaptcha.reset();
                      $scope.submitted = false;
                      $scope.contactDetail.spaceType = "Hotel";
                      $scope.captchaResponse = false;
                  },function(err){
                      flash.setMessage(MESSAGES.WENT_WRONG, MESSAGES.SUCCESS);
                  });
              }
          }
          else {
            $scope.submitted = true;
          }
        };

        $scope.setResponse = function(captchaRes) {
          if(captchaRes) {
            $scope.captchaResponse = true;
          }
          else{
            flash.setMessage(MESSAGES.CAPTCHA_REQ, MESSAGES.ERROR);
          }
        };
        $scope.cancel = function() {
          $location.path('/');
        };

        
        $scope.initPhoneProfile = function() {
          $("#contactPhoneNo").intlTelInput({
                    initialCountry: "auto",
                    geoIpLookup: function(callback) {
                      $.get('http://ipinfo.io', function() {}, "jsonp").always(function(resp) {
                        var countryCode = (resp && resp.country) ? resp.country : "";
                        callback(countryCode);
                      });
                    },
                    utilsScript: "../../../../../bower_components/intl-tel-input/build/js/utils.js" // just for formatting/placeholders etc
                });
                
                $("#contactPhoneNo").on("keyup change", function() {
                  $scope.contact_details_contactNo_1 = $("#contactPhoneNo").intlTelInput("getNumber");
                });

                $( "#contactPhoneNo" ).blur(function() {
                  // $("#contactPhoneNo").val($("#contactPhoneNo").intlTelInput("getNumber", intlTelInputUtils.numberFormat.NATIONAL));
                  // $scope.checkPhoneNumber($("#contactPhoneNo").val());
                  $scope.phNumberVal = $("#contactPhoneNo").val();
                });
                if($scope.userDetail.phone){
                  // console.log($scope.userDetail.phone);
                  var phIntl = '+'+$scope.userDetail.phone;
                  $("#contactPhoneNo").intlTelInput("setNumber", phIntl);
                }
        };
        $scope.flagTrueProfile = function() {
          $scope.isPhNoInvalid = false;
        };
}
]);
