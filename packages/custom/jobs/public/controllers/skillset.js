'use strict';
/* jshint -W098 */
angular.module('mean.jobs').controller('SkillSetController', function ($scope, SkillService, $location, Global, SkillSetService, $http, $rootScope, PROFILE, $stateParams, SKILLSET, MESSAGES, flash, $uibModal,$translate) {
    $scope.global = Global;
    $scope.package = {
        name: 'Skillset',
        modelName: 'Skillset',
        featureName: 'Skill Set'
    };
    $scope.SKILLSET = SKILLSET;
    $scope.PROFILE = PROFILE;
    $scope.SERVICE = SkillSetService;
    $scope.MESSAGES = MESSAGES;
    initializePermission($scope, $rootScope, $location, flash, $scope.package.featureName, MESSAGES);
    initializeBreadCrum($scope, $scope.package.modelName, SKILLSET.URL_PATH.SKILLSETLIST);
    initializePagination($scope, $rootScope, $scope.SERVICE);
    initializeDeletePopup($scope, $scope.package.modelName, MESSAGES, $uibModal);
    $scope.skillsetarray = [
        {
            'main': false
        }
    ];
    $scope.personCallback = function (result) {
        $scope.selectedPerson = result;
    };
    $scope.loadfilterSkills = function () {
        SkillService.skill.query(function (skillsetskilllist) {
            $scope.skillsetskilllist = skillsetskilllist;
            for (var i = 0; i < $scope.skillsetskilllist.length; i++) {
                $scope.skillsetskilllist[i].uniqueid = $scope.skillsetskilllist[i]._id;
            }
        });
    };
    $scope.create = function (isValid) {
        if ($scope.writePermission) {
            if (isValid) {
                $scope.skillset.skill = $scope.skillsetarray;
                $scope.skillset.normalizedname = $scope.skillset.name.replace(/\s/g, "").toLowerCase();
                var skillsetcreate = new SkillSetService.skillsetdetails($scope.skillset);
                skillsetcreate.$save(function (response) {
                    flash.setMessage(MESSAGES.SKILLSET_ADD_SUCCESS);
                    $location.path(SKILLSET.URL_PATH.SKILLSETLIST);
                }, function (error) {
                    $scope.error = error;
                });
            } else {
                $scope.submitted = true;
            }
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };
    $scope.editskillselected = function (selected) {
        if (selected) {
            $scope.singleskillsetdetail.skill[this.$parent.$index].skillid = selected.originalObject.uniqueid;
            $scope.singleskillsetdetail.skill[this.$parent.$index].name = selected.originalObject.name;
        }
    };
    $scope.skillselected = function (selected) {
        if (selected) {
            $scope.skillsetarray[this.$parent.$index].skillid = selected.originalObject.uniqueid;
            $scope.skillsetarray[this.$parent.$index].name = selected.originalObject.name;
        }
    };
    $scope.cancelSkillSet = function () {
        $location.path(SKILLSET.URL_PATH.SKILLSETLIST);
    };
    $scope.addskillrow = function (index) {
        $scope.skillsetarray.push({
            'main': false
        });
    };
    $scope.removeskillrow = function (index) {
        $scope.skillsetarray.splice(index, 1);
    };
    $scope.addeditskillrow = function (index) {
        $scope.singleskillsetdetail.skill.push({
            'main': false
        });
    };
    $scope.removeeditskillrow = function (index) {
        $scope.singleskillsetdetail.skill.splice(index, 1);
    };
    $scope.newskillSet = function () {
        $location.path(SKILLSET.URL_PATH.SKILLSETCREATE);
    };
    $scope.removepop = function (skillset) {
        $scope.deleteObj = skillset;
        $('#deletePopup').modal("show");
    };
    $scope.remove = function (skillset) {
        if ($scope.deletePermission) {
            if (skillset) {
                var deleteskillset = new SkillSetService.skillsetdetails(skillset);
                deleteskillset.$remove(function (response) {
                    flash.setMessage(MESSAGES.SKILLSET_DELETE_SUCCESS);
                    for (var i in $scope.collection) {
                        if ($scope.collection[i] === skillset) {
                            $scope.collection.splice(i, 1);
                        }
                        $('#deletePopup').modal("hide");
                        $location.path(SKILLSET.URL_PATH.SKILLSETLIST);
                    }
                }, function (error) {
                    $scope.error = error;
                });
            }
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };
    $scope.editSkillset = function (urlPath, id) {
        urlPath = urlPath.replace(":skillsetId", id);
        $location.path(urlPath);
    };
    $scope.findskillSet = function (urlPath, id) {
        if ($scope.readPermission) {
            var skillsetidparams = $stateParams.skillsetId;
            SkillSetService.skillsetdetails.get({
                'skillsetId': skillsetidparams
            }, function (response) {
                $scope.singleskillsetdetail = response;
                console.log($scope.singleskillsetdetail);
                for (var i = 0; i < $scope.singleskillsetdetail.skill.length; i++) {
                    $scope.singleskillsetdetail.skill[i].skilllevel = $scope.singleskillsetdetail.skill[i].skilllevel.toString();
                    $scope.singleskillsetdetail.skill[i].name = $scope.singleskillsetdetail.skill[i].skillid.name;
                    $scope.singleskillsetdetail.skill[i].uniqueid = $scope.singleskillsetdetail.skill[i].skillid._id;
                }
            });
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };
    $scope.saveeditedskillset = function (isValid) {
        if ($scope.updatePermission) {
            if (isValid) {
                var skillset = $scope.singleskillsetdetail;
                skillset.normalizedname = skillset.name.replace(/\s/g, "").toLowerCase();
                skillset.$update(function (response) {
                    flash.setMessage(MESSAGES.SKILLSET_UPDATE_SUCCESS);
                    $location.path(SKILLSET.URL_PATH.SKILLSETLIST);
                }, function (error) {
                    $scope.error = error;
                });
            } else {
                $scope.submitted = true;
            }
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };

    $scope.createSkillSet = function () {
        $scope.breadCrumAdd("Create");
    };

    $scope.EditSkillSet = function () {
        $scope.breadCrumAdd("Edit");
    };
});