'use strict';

/* jshint -W098 */
angular.module('mean.users').controller('changePasswordController', [ '$scope', 'Global', 'ChangePasswordService', '$rootScope', 'MeanUser', '$location', 'USERPROFILE','BOOKING','flash','MESSAGES',
                                                                      function SpaceTypeController($scope, Global, ChangePasswordService, $rootScope, MeanUser, $location, USERPROFILE,BOOKING,flash,MESSAGES) {
	$scope.global = Global;
	$scope.BOOKING=BOOKING;

	if($rootScope.user){
		$scope.userDetail = MeanUser.user;
	}else{
		$scope.userDetail = MeanUser.user;
		$scope.image = $scope.userDetail.avatar;
                         $scope.res = $scope.image.split("upload");
                         $scope.thumbimg = $scope.res[0] + "upload/w_50,h_50,c_thumb" + $scope.res[1];
	}

	$scope.userObj = {};

	$scope.updatePassword = function(isValid,userObj) {
		 $scope.err = [];
		if (isValid) {
		var changePassword = new ChangePasswordService.changePassword(userObj);
		changePassword.$update({
		}, function(response) {
			$scope.userObj = {};
				 $rootScope.user = $scope.userDetail;
				 flash.setMessage(MESSAGES.PASSWORD_CHANGED_SUCCESS,MESSAGES.SUCCESS);
			        $location.path(USERPROFILE.URL_PATH.USER_PROFILE.replace(':userId',  $scope.userDetail._id));
			
		},function (error) {
		 if (error.data instanceof Array) {
                        $scope.err = error.data;
                    } else {
                        $scope.err = [];
                        $scope.err.push(error.data);
                    }
		});
	}else{
	$scope.submitted = true;
};
}

	$scope.changepassword = function(){
		$location.path('/change-password');
		
	}
	$scope.userProfile = function(){
		$location.path('/user-profile');
	}
	$scope.userBookings=function(){
		$location.path(BOOKING.URL_PATH.USER_MYBOOKINGS);
	}
}
]);


