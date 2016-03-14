'use strict';
/* jshint -W098 */
angular.module('mean.course').controller('UserCounsellingController', function($scope, $stateParams, Global, UserCounsellingService, MeanUser, $location, $rootScope,$translate) {
    $scope.global = Global;
    $scope.package = {
        name: 'course'
    };
    $scope.hasAuthorization = function(userCounselling) {
        if (!userCounselling || !userCounselling.user) {
            return false;
        }
        return MeanUser.isAdmin || userCounselling.user._id === MeanUser.user._id;
    };
    $scope.find = function() {
        UserCounsellingService.query(function(userCounsellings) {
            $scope.userCounsellings = userCounsellings;
        });
    };
    $scope.create = function(isValid, user) {
        if (isValid) {
            $scope.user = angular.copy(MeanUser.user);
            $scope.userCounselling.user = $scope.user;
            var userCounselling = new UserCounsellingService($scope.userCounselling);
            userCounselling.$save(function(response) {
                $location.path('/admin/userCounselling');
                $scope.userCounselling = {};
            });
        } else {
            $scope.submitted = true;
        }
    };
    $scope.remove = function(UserCounselling) {
        if (UserCounselling) {
            UserCounselling.$remove(function(response) {
                for (var i in $scope.userCounsellings) {
                    if ($scope.userCounsellings[i] === UserCounselling) {
                        $scope.userCounsellings.splice(i, 1);
                    }
                }
                $location.path('/admin/userCounselling');
            });
        } else {
            $scope.userCounselling.$remove(function(response) {
                $location.path('/admin/userCounselling');
            });
        }
    };
    $scope.update = function(isValid) {
        if (isValid) {
            var userCounselling = $scope.userCounselling;
            if (!userCounselling.updated) {
                userCounselling.updated = [];
            }
            userCounselling.updated.push(new Date().getTime());
            userCounselling.$update(function() {
                $location.path('/admin/userCounselling');
            });
        } else {
            $scope.submitted = true;
        }
    };
    $scope.findOne = function() {
        UserCounsellingService.get({
            userCounsellingId: $stateParams.userCounsellingId
        }, function(userCounselling) {
            $scope.userCounselling = userCounselling;
        });
    };
    $scope.editonlinetest = function(urlPath, id) {
        urlPath = urlPath.replace(":onlinetestId", id);
        $location.path(urlPath);
    };
});