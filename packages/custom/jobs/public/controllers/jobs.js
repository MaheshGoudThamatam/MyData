'use strict';
/* jshint -W098 */

angular.module('mean.jobs').controller('JobsController', function ($scope, SkillService, $location, Global, Jobs, $http, $rootScope, PROFILE, $stateParams, JOBS, MESSAGES, $uibModal,$translate) {
    $scope.global = Global;
    $scope.PROFILE = PROFILE;
    $scope.SERVICE = Jobs;
    $scope.JOBS = JOBS;
    $scope.MESSAGES = MESSAGES;
    $scope.jobsfilter = [];
    initializePagination($scope, $rootScope, $scope.SERVICE);

    $scope.package = {
        name: 'jobs',
        modelName: 'Jobs'
    };
    initializeDeletePopup($scope, $scope.package.modelName, MESSAGES, $uibModal);
    initializeBreadCrum($scope, $scope.package.modelName, JOBS.URL_PATH.JOBSLIST,'Jobs','Job Management');

    $scope.skillsarray = [];
    $scope.addjobs = function () {
        $http.get("/api/addjobs").success(function (response) {
        }).error(function (response) {
        });
    };
    $scope.loadInput = function ($query) {
        return $scope.skillList.filter(function (skill) {
            return skill.name.toLowerCase().indexOf($query.toLowerCase()) != -1;
        });
    };
    $scope.loadfilterSkills = function () {
        SkillService.skill.query(function (skillList) {
            $scope.skillList = skillList;
        });
    };
    $scope.filterinputadded = function () {
        var myfilterjobs = $scope.jobsfilter;
        var myfilterarray = [];
        for (var i = 0; i < myfilterjobs.length; i++) {
            myfilterarray.push(myfilterjobs[i]._id);
        }
        var myfilter = {};
        myfilter.filteredarray = myfilterarray;
        var query = {};
        query.page = 1;
        query.pageSize = $scope.currentPageSize;
        query.filterinput = myfilter;
        $scope.loadPagination(query);
    };
    $scope.filterinputremoved = function () {
        var myfilterjobs = $scope.jobsfilter;
        var myfilterarray = [];
        for (var i = 0; i < myfilterjobs.length; i++) {
            myfilterarray.push(myfilterjobs[i]._id);
        }
        var myfilter = {};
        myfilter.filteredarray = myfilterarray;
        var query = {};
        query.page = 1;
        query.pageSize = $scope.currentPageSize;
        query.filterinput = myfilter;
        $scope.loadPagination(query);
    };
    $scope.joblistpage = function () {
        $location.path(JOBS.URL_PATH.JOBSLIST)
    };
    $scope.listjobs = function () {

        $scope.currentPage = 1;
        $scope.currentPageSize = 10;
        var query = {};
        query.page = $scope.currentPage;
        query.pageSize = $scope.currentPageSize;
        $scope.loadPagination(query);
    };
    $scope.completejobdetail = function () {
        var jobidparams = $stateParams.jobId;
        Jobs.jobdetails.get({
            'jobId': jobidparams
        }, function (response) {
            $scope.singlejobdetail = response;
        });
    };
    $scope.redirectdashboard = function () {
        $location.path(PROFILE.URL_PATH.DASHBOARD);
    }
    $scope.createJob = function () {
        $scope.breadCrumAdd("List");
    };
    $scope.editJobs = function (urlPath, id) {
        urlPath = urlPath.replace(":jobId", id);
        $location.path(urlPath);
    };
});