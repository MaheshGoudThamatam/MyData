angular.module('mean.system').controller('DeleteModalInstanceCtrl', ["$scope", "$uibModalInstance", "popupTitle","popupMessage","deleteObj", function ($scope, $uibModalInstance, popupTitle,popupMessage,deleteObj) {

    $scope.popupTitle=popupTitle;
    $scope.popupMessage=popupMessage;
    $scope.deleteObj=deleteObj;

    $scope.ok = function () {
        $uibModalInstance.close(deleteObj);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}]);