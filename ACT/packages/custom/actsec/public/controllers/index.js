'use strict';
angular.module('mean.system').controller('IndexController', ['$scope', 'Global', 'utilityService', 'NgTableParams', '$http', 'MeanUser', 'CONFIG', 'CompanyService', function($scope, Global, utilityService, NgTableParams, $http, MeanUser, CONFIG, CompanyService) {
    $scope.global = Global;
    $scope.loggedUser = MeanUser.user;
    $scope.dateObj = {};
    $scope.config = CONFIG;
    $scope.dateObj.month = "all";
    $scope.easyPieoptions = {
        animate: {
            duration: 500,
            enabled: true
        },
        barColor: '#2C3E50',
        scaleColor: false,
        lineWidth: 5,
        lineCap: 'round',
        size: 200,
        trackColor: '#f2f2f2',
        scaleColor: '#dfe0e0',
        scaleLength: 10
    };
    var userFeatureKeys = Object.keys(MeanUser.user.role.permissions);
    //for input values changing year range and month
    $scope.year = 2016;
    $scope.previousYear = function() {
        $scope.year = $scope.year - 1;
    };
    $scope.nextYear = function() {
        $scope.year = $scope.year + 1;
    };
    $scope.monthAssign = function() {
        $scope.getDashboardData();
    }
    $scope.getDashboardData = function() {
        if ($scope.dateObj.month) {
            $scope.dateObj.month = $scope.dateObj.month;
        } else {
            $scope.dateObj.month = "all"
        }
        $scope.dateObj.year = $scope.year;
        $scope.getAuditData();
        $scope.getSecurityTaskData();
        $scope.getIncidentData();
        $scope.getTrainingData();
    };
    $scope.getAuditData = function() {
        $http({
            url: '/api/audits/auditPercentage',
            method: 'POST',
            data: $scope.dateObj
        }).success(function(response, status, headers, config) {
            $scope.auditDetail = response;
            if ($scope.auditDetail.percentage <= 0 || !$scope.auditDetail.percentage || $scope.auditDetail.percentage == '') {
                $scope.auditDetail.percentage = 0;
            }
            $scope.percent1 = (response.completedAudits / response.totalAudits) * 100;
        });
    };
    $scope.getSecurityTaskData = function() {
        $http({
            url: '/api/dashboard/securitytask',
            method: 'POST',
            data: $scope.dateObj
        }).success(function(response, status, headers, config) {
            $scope.securitytaskDetail = response;
            $scope.percent2 = (response.completedTasks.length / response.securityfound.length) * 100;
            if ($scope.percent2 <= 0 || !$scope.percent2 || $scope.percent2 == '') {
                $scope.percent2 = 0;
            }
        });
    };
    $scope.getIncidentData = function() {
        $http({
            url: '/api/incidenttype/dashboardresult',
            method: 'POST',
            data: $scope.dateObj
        }).success(function(response, status, headers, config) {
            $scope.incidentDetail = response;
            $scope.incidentGraphArray = [];
            for (var incidentObj in response) {
                $scope.incidentGraphArray.push(response[incidentObj]);
            };
            if ($scope.incidentGraphArray.length <= 0) {
                $scope.incidentGraphArray = [];
            };
        });
    };
    $scope.amChartOptions = {
        data: [],
        type: "serial",
        theme: 'white',
        categoryField: "name",
        rotate: false,
        pathToImages: 'https://cdnjs.cloudflare.com/ajax/libs/amcharts/3.13.0/images/',
        legend: {
            enabled: true
        },
        categoryAxis: {
            gridPosition: "start",
            parseDates: false,
            labelRotation:30
        },
        valueAxes: [{
            position: "bottom",
            title: "In Numbers"
        }],
        graphs: [{
            type: "column",
            title: "Incidents",
            valueField: "count",
            fillAlphas: 2,
        }]
    };
    $scope.amChartdata = {
        data: [],
        type: "serial",
        theme: 'white',
        categoryField: "name",
        rotate: false,
        pathToImages: 'https://cdnjs.cloudflare.com/ajax/libs/amcharts/3.13.0/images/',
        legend: {
            enabled: true
        },
        categoryAxis: {
            gridPosition: "start",
            parseDates: false,
            labelRotation:30
        },
        valueAxes: [{
            position: "bottom",
            title: "In Numbers"
        }],
        graphs: [{
            type: "column",
            title: "Users",
            valueField: "count",
            fillAlphas: 2,
        }]
    };
    $scope.getTrainingData = function() {
        $http({
            url: '/api/dashboardUser/training',
            method: 'GET',
        }).success(function(response, status, headers, config) {
            $scope.trainingDetail = response;
        });
    };
    $scope.$watch('trainingDetail', function(array) {
        if (array) {
            $scope.amChartdata = {
                data: array,
                type: "serial",
                theme: 'white',
                categoryField: "name",
                rotate: false,
                pathToImages: 'https://cdnjs.cloudflare.com/ajax/libs/amcharts/3.13.0/images/',
                legend: {
                    enabled: true
                },
                categoryAxis: {
                    gridPosition: "start",
                    parseDates: false
                },
                valueAxes: [{
                    position: "bottom",
                    title: "In Numbers"
                }],
                graphs: [{
                    type: "column",
                    title: "Users",
                    valueField: "count",
                    fillAlphas: 2,
                }]
            };
            $scope.$broadcast('amCharts.updateData', array, 'trainingChart');
        }
    });
    $scope.$watch('incidentGraphArray', function(array) {
        if (array) {
            $scope.amChartOptions = {
                data: array,
                type: "serial",
                theme: 'white',
                categoryField: "name",
                rotate: false,
                pathToImages: 'https://cdnjs.cloudflare.com/ajax/libs/amcharts/3.13.0/images/',
                legend: {
                    enabled: true
                },
                categoryAxis: {
                    gridPosition: "start",
                    parseDates: false
                },
                valueAxes: [{
                    position: "bottom",
                    title: "In Numbers"
                }],
                graphs: [{
                    type: "column",
                    title: "Incidents",
                    valueField: "count",
                    fillAlphas: 2,
                }]
            };
            $scope.$broadcast('amCharts.updateData', array, 'incidentChart');
        }
    });
    $scope.checkFeature = function(featureId) {
        if (userFeatureKeys.indexOf(featureId) > -1) {
            return true;
        }
    };
    $scope.checkAdminData = function() {
        $http({
            url: '/api/userInfo',
            method: 'GET',
        }).success(function(response, status, headers, config) {
            if (response.Admin) {
                CompanyService.company.query({}, function(companies) {
                    $scope.companyArray = companies;
                    $scope.companies = $scope.companyArray.length;
                });
            } else {
                $scope.getDashboardData()
            }
        });
    };
}]);