(function() {
    'use strict';

    /* jshint -W098 */
    angular.module('mean.assets').controller('AssetsController', AssetsController);
    AssetsController.$inject = ['$scope', 'Global', 'Assets', '$stateParams', 'ASSETS', '$location', 'BuildingService', 'LocationService', 'SITE'];

    function AssetsController($scope, Global, Assets, $stateParams, ASSETS, $location, BuildingService, LocationService, SITE) {
        $scope.global = Global;
        $scope.package = {
            name: 'assets'
        };
        $('.datePicker').datetimepicker({
            format: 'DD/MM/YYYY'
        });

        $scope.cameraSystem = function(){
            var urlPath = ASSETS.PATH.CAMERA_LIST;
            urlPath = urlPath.replace(":buildingId", $stateParams.buildingId);
            $location.path(urlPath);
        };

        $scope.burglarAlarm = function(){
            var urlPath = ASSETS.PATH.BURGLARALARM_LIST;
            urlPath = urlPath.replace(":buildingId", $stateParams.buildingId);
            $location.path(urlPath);
        };

        $scope.guarding = function(){
            var urlPath = ASSETS.PATH.GUARDLIST;
            urlPath = urlPath.replace(":buildingId", $stateParams.buildingId);
            $location.path(urlPath);
        };

        $scope.accessControl = function(){
            var urlPath = ASSETS.PATH.ASSETS_ACCESSCONTROL_LIST;
            urlPath = urlPath.replace(":buildingId", $stateParams.buildingId);
            $location.path(urlPath);
        };

        $scope.initBuilding = function(){
            BuildingService.building.get({
                buildingId: $stateParams.buildingId
            }, function(building) {
                $scope.building = building
                LocationService.location.get({
                    locationId: building.location
                }, function(location) {
                    $scope.location = location
                })
            })
        };

        $scope.buildingList = function(){
            var urlPath = SITE.PATH.BUILDING_LIST;
            urlPath = urlPath.replace(":buildingId", $stateParams.buildingId);
            $location.path(urlPath);
        }
    }


})();
