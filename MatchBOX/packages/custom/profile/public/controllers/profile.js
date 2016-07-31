'use strict';

/* jshint -W098 */
angular.module('mean.profile').controller('ProfileController', [ '$scope', 'Global', 'ProfileService', '$rootScope', 'MeanUser', 'Upload','$location',  'URLFactory','flash','BOOKING','MESSAGES','RoleService',
  function SpaceTypeController($scope, Global, ProfileService, $rootScope, MeanUser, Upload, $location, URLFactory, flash,BOOKING,MESSAGES,RoleService ) {
  	$scope.URLFactory = URLFactory;
	$scope.global = Global;
	$scope.BOOKING=BOOKING;
	$scope.MESSAGES=MESSAGES;
	hideBgImageAndFooter($rootScope);
	flashmessageOn($rootScope, $scope,flash);
	if($rootScope.user){
		$scope.userDetailObj = $rootScope.user;
		console.log($scope.userDetail);
	}else{
		$scope.userDetailObj = MeanUser.user;
	}
	console.log($scope.userDetailObj);
	$scope.loadUser = function(){
	$scope.userDetail = MeanUser.user;
	console.log($scope.userDetail);
	}	
	$scope.upadteUser = function(user) {
		var userDetail = new ProfileService.userProfile(user);
		userDetail.$update({
			userId : $scope.userDetail._id
		}, function(userDetail) {
			console.log();
			$scope.userDetail = userDetail;
			if(userDetail.avatar){
			 $scope.image = userDetail.avatar;
                         $scope.res = $scope.image.split("upload");
                         $scope.thumbimg = $scope.res[0] + "upload/w_50,h_50,c_thumb" + $scope.res[1];
			}
			$rootScope.$emit('Pictureupdated');
			if($scope.isProfileUpdate){
				
				$scope.dashboardRedirectionBasedOnRole();
			}
			flash.setMessage(MESSAGES.PROFILE_UPDATE_MESSAGE, MESSAGES.SUCCESS);
		});
	}

	$scope.update = function() {
		$scope.userDetail.profileUpdated = true;
		$scope.upadteUser($scope.userDetail);
		$scope.isProfileUpdate = true;
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
                    console.log("INside header redirect "+found);
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


}
]);
