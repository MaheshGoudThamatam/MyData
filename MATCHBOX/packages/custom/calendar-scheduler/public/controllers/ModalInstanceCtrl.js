angular.module('mean.calendar-scheduler').controller('ModalInstanceCtrl', ["$scope", "$rootScope", "bookingObj","BookingService",
 function ($scope, $rootScope, bookingObj,BookingService) {

    $scope.booking = bookingObj;

    $scope.submit = function(room,bookingForm,schedule,backOfficeBooking) {
        BookingService.loadUserBasedOnEmail.get({
			'userId':backOfficeBooking.email
		}, function(response) {
			$scope.requiredUser = response;
		});
        $rootScope.backOfficeBooking = {};
		$rootScope.backOfficeBooking.room = room;
		$rootScope.backOfficeBooking.space='5728514a84e8dfe0195cd833';
		$rootScope.backOfficeBooking.partner='572850b284e8dfe0195cd832';
		$rootScope.backOfficeBooking.user = $scope.requiredUser;
		//$rootScope.backOfficeBooking.isAgreed = isAgreed;
		if(schedule.constructor === Array){
			$rootScope.backOfficeBooking.scheduleTraining = schedule;
			$rootScope.backOfficeBooking.bookingFrom = backOfficeBooking.selectedFromDate;
			$rootScope.backOfficeBooking.bookingTo = backOfficeBooking.selectedEndDate;
		} else {
			$rootScope.backOfficeBooking.schedule = schedule;
			$rootScope.backOfficeBooking.bookingDate = backOfficeBooking.bookingDate;
		}
		$rootScope.backOfficeBooking.bookingStartTime = backOfficeBooking.bookingStartTime;
		$rootScope.backOfficeBooking.bookingEndTime = backOfficeBooking.bookingEndTime;
		//$rootScope.backOfficeBooking.guest=guest;
		 //$rootScope.booking.price=$scope.totalPrice;
		var booking = new BookingService.createBackofficeBooking($rootScope.backOfficeBooking);
		booking.$save({
			scheduleId : schedule._id
		}, function(response) {
			$rootScope.backOfficeBooking = {};
		}, function(error) {
			$scope.error = error;
		});
		 $uibModalInstance.close($scope.backOfficeBooking);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
	
	
	/*$scope.loadSchedules = function(selectedDate) {
		$scope.selectDate=selectedDate;
		console.log($scope.selectDate);
		var requiredRoomId=5728bce9183fe120281df33b;
		BookingService.loadRoomSchedule.get({
			'roomId':requiredRoomId,
			'selectdate' : $scope.selectDate
		}, function(response) {
			$rootScope.schedule = response;
		      console.log($rootScope.schedule);
		}, function(error) {
			console.log(error);
		});
	};*/
	
}]);