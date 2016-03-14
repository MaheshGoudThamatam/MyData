'use strict';


angular.module('mean.onlinetest').controller('OnlinetestController', function ($scope, $stateParams, Global, OnlinetestService, $location, $rootScope, MESSAGES, ONLINETEST, flash, SkillService, $uibModal,$translate) {
    $scope.global = Global;
    $scope.test = '';
    $scope.MESSAGES = MESSAGES;
    $scope.ONLINETEST = ONLINETEST;
    $scope.SERVICE = OnlinetestService;
    $scope.package = {
        name: 'onlinetest',
        modelName: 'Onlinetest',
        featureName: 'Online Tests'
    };
    initializeDeletePopup($scope, $scope.package.modelName, MESSAGES, $uibModal);
    initializeBreadCrum($scope, $scope.package.modelName, ONLINETEST.URL_PATH.LISTONLINETEST,"Online Test", "Online Test Management");
    initializePagination($scope, $rootScope, $scope.SERVICE);
    initializePermission($scope, $rootScope, $location, flash, $scope.package.featureName, MESSAGES);
    /**
     * Add Test Skill into array of TestSKill in online test
     */
    $scope.onlinetest = {};
    $scope.onlinetest.testSkills = [
        {}
    ];

    //***************Fetch Sub Skill Based On Skill In Database***************//
    $scope.gettestSkill = function () {
        for (var i = 0, len = $scope.onlinetest.testSkills.length; i < len; i++) {
            for (var j = 0, len1 = $scope.skillList.length; j < len1; j++) {
                if ($scope.skillList[j].name === $scope.onlinetest.testSkills[i].skill) {
                    $scope.onlinetest.testSkills[i].subSkills = $scope.skillList[j].subSkills;
                }
            }
        }
    };

    //***************Fetch Skills***************//
    $scope.loadSkillList = function () {
        $scope.skillNames = [];
        SkillService.skill.query(function (skillList) {
            $scope.skillList = skillList;
            if ($scope.onlinetest) {
                $scope.gettestSkill();
            }
        });
        $scope.selectedSkill = {};
        $scope.selectedSkill.subSkills = [];
        $scope.selectedSkill.subSkills.skillName = [];
    };
    // find the test by test id
    $scope.findOne = function () {
        if ($scope.updatePermission) {
            OnlinetestService.onlinetest.get({
                onlinetestId: $stateParams.onlinetestId
            }, function (onlinetest) {
                $scope.onlinetest = onlinetest;
                if ($scope.skillList) {
                    for (var i = 0; i < $scope.skillList.length; i++) {
                        for (var j = 0; j < $scope.onlinetest.testSkills.length; j++) {
                            if ($scope.skillList[i].name === $scope.onlinetest.testSkills[j].skill) {
                                $scope.onlinetest.testSkills[j].skill = $scope.skillList[i];
                            }
                        }
                    }
                }
            });
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };
    $scope.errorChc = function () {
        $scope.uniqueChc = true;
        return $scope.uniqueChc;
    };
    // create the test
    $scope.create = function (isvalid) {
        $scope.onlinetest.testSkills = $scope.onlinetest.testSkills.filter(function (testSkill) {
            if (testSkill.skill) {
                return testSkill;
            }
        });
        if ($scope.writePermission) {
            if (isvalid) {
                for (var i = 0, len = $scope.onlinetest.testSkills.length; i < len; i++) {
                    delete $scope.onlinetest.testSkills[i].subSkills;
                    $scope.skillNameTemp = $scope.onlinetest.testSkills[i].skill.name;
                    delete $scope.onlinetest.testSkills[i].skill;
                    $scope.onlinetest.testSkills[i].skill = $scope.skillNameTemp;

                }
                var onlinetest = new OnlinetestService.onlinetest(
                    $scope.onlinetest);
                onlinetest.$save(function (response) {
                    flash.setMessage(MESSAGES.ONLINETEST_ADD_SUCCESS,
                        MESSAGES.SUCCESS);
                    $location.path(ONLINETEST.URL_PATH.LISTONLINETEST);
                    $scope.onlinetest = {};
                }, function (error) {
                    $scope.error = error;
                    $scope.uniqueChc = false;
                    if ($scope.skillList) {
                        for (var i = 0; i < $scope.skillList.length; i++) {
                            for (var j = 0; j < $scope.onlinetest.testSkills.length; j++) {
                                if ($scope.skillList[i].name === $scope.onlinetest.testSkills[j].skill) {
                                    $scope.onlinetest.testSkills[j].skill = $scope.skillList[i];
                                }
                            }
                        }
                    }
                });
            } else {
                $scope.submitted = true;
            }
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };

    // update the test

    $scope.update = function (isvalid) {
        $scope.onlinetest.testSkills = $scope.onlinetest.testSkills.filter(function (testSkill) {
            if (testSkill.skill) {
                return testSkill;
            }
        });
        if ($scope.updatePermission) {
            if (isvalid) {
                for (var i = 0, len = $scope.onlinetest.testSkills.length; i < len; i++) {
                    delete $scope.onlinetest.testSkills[i].subSkills;
                    $scope.skillNameTemp = $scope.onlinetest.testSkills[i].skill.name;
                    delete $scope.onlinetest.testSkills[i].skill;
                    $scope.onlinetest.testSkills[i].skill = $scope.skillNameTemp;

                }
                var onlinetest = $scope.onlinetest;
                if (!onlinetest.updated) {
                    onlinetest.updated = [];
                }
                onlinetest.updated.push(new Date().getTime());

                onlinetest.$update(function () {
                    flash.setMessage(MESSAGES.ONLINETEST_UPDATE_SUCCESS,
                        MESSAGES.SUCCESS);
                    $location.path(ONLINETEST.URL_PATH.LISTONLINETEST);
                }, function (error) {
                    $scope.error = error;
                    $scope.uniqueChc = false;
                    if ($scope.skillList) {
                        for (var i = 0; i < $scope.skillList.length; i++) {
                            for (var j = 0; j < $scope.onlinetest.testSkills.length; j++) {
                                if ($scope.skillList[i].name === $scope.onlinetest.testSkills[j].skill) {
                                    $scope.onlinetest.testSkills[j].skill = $scope.skillList[i];
                                }
                            }
                        }
                    }
                });
            } else {
                $scope.submitted = true;
            }
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };

    $scope.remove = function (Onlinetest) {
        if (Onlinetest && $scope.deletePermission) {
            if (Onlinetest) {
                var onlinetest = new OnlinetestService.onlinetest(Onlinetest);
                onlinetest.$remove(function (response) {
                    for (var i in $scope.collection) {
                        if ($scope.collection[i] === Onlinetest) {
                            $scope.collection.splice(i, 1);
                        }
                        $('#deletePopup').modal("hide");
                        flash.setMessage(MESSAGES.ONLINETEST_DELETE_SUCCESS,
                            MESSAGES.SUCCESS);
                        $location.path(ONLINETEST.URL_PATH.LISTONLINETEST);
                    }
                });
            }
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };

    /**
     * Cancel the Online test
     */
    $scope.cancelOnlinetest = function () {
        $location.path(ONLINETEST.URL_PATH.LISTONLINETEST);
    };

    //***************Test Skill***************//
    $scope.addTestskill = function (index) {
        $scope.onlinetest.testSkills.push({});
        $scope.selectedSkill[index + 1] = {};
        $scope.selectedSkill.subSkills = [];
    };
    $scope.removeTestskill = function (testSkill) {
        var index = $scope.onlinetest.testSkills.indexOf(testSkill);
        $scope.onlinetest.testSkills.splice(index, 1);
    };
    $scope.editonlinetest = function (urlPath, id) {
        urlPath = urlPath.replace(":onlinetestId", id);
        $location.path(urlPath);
    };
    $scope.newOnlinetest = function () {
        $location.path(ONLINETEST.URL_PATH.CREATEONLINETEST);
    };
    $scope.createOnlinetest = function () {
        $scope.breadCrumAdd("Create");
    };
    $scope.newOnlinetest = function () {
        $location.path(ONLINETEST.URL_PATH.CREATEONLINETEST);
    };
    $scope.detailOnlinetest = function () {
        $scope.breadCrumAdd("View");
    };
    $scope.loadNewOnlinetest = function () {
        $scope.breadCrumAdd("List");
    };
    $scope.editOnlinetest = function () {
        $scope.breadCrumAdd("Edit");
    };
});
			
