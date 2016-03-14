'use strict';

/* jshint -W098 */
/*Filterd controller for all common filters*/


angular.module('mean.branch').controller('FilterController',
    function ($scope, $rootScope, $stateParams, $location, Global, BranchService, CountryService, ZoneService, CityService, RoleService, UserService) {
        $scope.global = Global;
        $scope.package = {
            name: 'branch'
        };

        //fetching the list of countries
        $scope.listCountry = function () {
            CountryService.country.query(function (countries) {
                $scope.countries = countries;
            });
        };

        //fetching the list of zones based on country
        $scope.listZone = function (countryId) {
            $rootScope.countryId = countryId;
            $scope.countryId = countryId;
            ZoneService.countryZone.query({countryId: $scope.countryId}, function (zones) {
                $scope.zones = zones;
            });
        };

        //fetching the list of cities based on zone
        $scope.listCity = function (zoneId) {
            $scope.zoneId = zoneId;
            $rootScope.zoneId = $scope.zoneId;
            CityService.zoneCity.query({zoneId: $scope.zoneId}, function (cities) {
                $scope.cities = cities;
            });

        };

        //fetching the list of  branches based on city
        $scope.listBranches = function (cityId) {
            $scope.cityId = cityId;
            $rootScope.cityId = $scope.cityId;

            BranchService.cityBranch.query({cityId: $scope.cityId}, function (branches) {
                $scope.branches = branches;
            });

        };

        $scope.course = '';
        $scope.zone = '';
        $scope.city = '';
        $scope.branch = '';
        $scope.filterByLocation = function (country, zone, city, branch) {
            console.log(country);
            console.log(zone);
            console.log(city);
            console.log(branch);
        };

        //fetching the list of roles
        $scope.listRoles = function () {
            RoleService.role.query(function (roles) {
                $scope.roles = roles;
            });
        };

        $scope.findUser = function () {
            UserService.query(function (users) {
                $scope.users = users;
            });
        };

        $scope.RoleFilter = function (roleId) {

            $scope.users = {};
            FilterService.filterRole.query({
                roleId: roleId,
            }, function (users) {
                $scope.users = users;
            });
        };
        /*$scope.RoleFilter=function(roleId){
         console.log(MeanUser.users);
         $scope.users = {};
         UserService.role.query({
         roleId: roleId,
         }, function (users) {
         // $rootScope.$emit('processingDone');
         $scope.users = users;
         });
         };*/
    });