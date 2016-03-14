'use strict';
/* jshint -W098 */
angular.module('mean.jobs').controller('RecommendedJobsController', ['$scope', 'SkillService', '$location', 'Global', 'RecommendedJobs', '$http', '$rootScope', 'PROFILE', '$stateParams','$translate',
    function($scope, SkillService, $location, Global, RecommendedJobs, $http, $rootScope, PROFILE, $stateParams,$translate) {
        $scope.global = Global;
        $scope.PROFILE = PROFILE;
        $scope.SERVICE = RecommendedJobs;
        $scope.jobsfilter = [];
        initializePagination($scope, $rootScope, $scope.SERVICE);
        $scope.package = {
            name: 'jobs'
        };
        $scope.recommendedlistjobs = function() {
            $scope.currentPage = 1;
            $scope.currentPageSize = 10;
            var query = {};
            query.page = $scope.currentPage;
            query.pageSize = $scope.currentPageSize;
            $scope.loadPagination(query);
        };
        $scope.recommendedjobscheck = function() {
            RecommendedJobs.skilldetails.query(function(response) {
                $scope.checkedskilllist = response;
                for (var i = 0; i < $scope.checkedskilllist.length; i++) {
                    $scope.checkedskilllist[i].check = true;
                }
            }, function(error) {
                console.log(error);
            });
        };
        $scope.skillchange = function(check) {
            check = !check;
            var myarray = [];
            for (var i = 0; i < $scope.checkedskilllist.length; i++) {
                if ($scope.checkedskilllist[i].check) {
                    myarray.push($scope.checkedskilllist[i]._id);
                }
            }
            var myfilter = {};
            myfilter.filteredarray = myarray;
            var query = {};
            query.page = $scope.currentPage;
            query.pageSize = $scope.currentPageSize;
            query.filterinput = myfilter;
            $scope.loadPagination(query);
        };
    }
]);