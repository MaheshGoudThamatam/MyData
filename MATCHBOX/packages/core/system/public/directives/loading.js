angular.module('mean.system').directive('loading', ['$http', function($http) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            scope.isLoading = function() {
                return $http.pendingRequests.filter(function(item) { return item.url.indexOf('notifications') < 0; }).length > 0;
            };
            scope.$watch(scope.isLoading, function(value) {
                if (value) {
                    element.css('display', 'inline');
                } else {
                    element.css('display', 'none');
                }
            });
        }
    };
}]);