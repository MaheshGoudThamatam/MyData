angular.module('mean.system').directive('confirmUnsaved', function() {
    return {
        link: function($scope, elem, attrs) {
            window.onbeforeunload = function() {
                if (elem[0].nodeName === 'FORM' && angular.element(elem[0]).hasClass('ng-dirty') && !$scope.saved) {
                    return "You have unsaved changes - are you sure you want to leave the page?";
                }
            }
            $scope.$on('$locationChangeStart', function(event, next, current) {
                if (elem[0].nodeName === 'FORM' && angular.element(elem[0]).hasClass('ng-dirty') && !$scope.saved) {
                    if (!confirm("You have unsaved changes - are you sure you want to leave the page?")) {
                        event.preventDefault();
                    }
                }
            });
        }
    };
});