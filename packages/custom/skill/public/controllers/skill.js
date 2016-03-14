'use strict';
/* jshint -W098 */

angular.module('mean.skill').controller('SkillController', function ($scope, SkillService, $stateParams, $location, $rootScope, flash, $uibModal, $translate, URLFactory) {
    $scope.URLFactory = URLFactory;
    $scope.package = {
        name: 'skill',
        modelName: 'Skill',
        featureName: 'Skills'
    };

    initializeBreadCrum($scope, $scope.package.modelName, URLFactory.SKILL.PATH.SKILL_LIST);
    pageTitleMessage($scope,$translate,'skills.WELCOME','skills.TITLE_DESC');
    initializePagination($scope, $rootScope, SkillService);
    initializeDeletePopup($scope, $scope.package.modelName, URLFactory.MESSAGES, $uibModal);
    initializePermission($scope, $rootScope, $location, flash, $scope.package.featureName, URLFactory.MESSAGES);


    $scope.setSubSkill = function () {
        if ($scope.skill.subSkills.length == 0) {
            $scope.skill.subSkills = [
                {}
            ];
        }
    };
    $scope.createSkill = function () {
        $scope.skill = {};
        $scope.skill.subSkills = [
            {}
        ];
        $scope.breadCrumAdd("Create");
    };

    $scope.create = function (isValid) {
        console.log($scope.writePermission);
        $scope.skill.subSkills = $scope.skill.subSkills.filter(function (subSkill) {
            if (subSkill.skillName) {
                return subSkill;
            }
        });
        if ($scope.writePermission) {
            if (isValid) {
                var skill = new SkillService.skill($scope.skill);
                skill.$save(function (response) {
                    flash.setMessage(URLFactory.MESSAGES.SKILL_ADD_SUCCESS, URLFactory.MESSAGES.SUCCESS);
                    $location.path(URLFactory.SKILL.PATH.SKILL_LIST);
                }, function (error) {
                    $scope.error = error;
                });
            } else {
                $scope.submitted = true;
            }
        } else {
            flash.setMessage(URLFactory.MESSAGES.PERMISSION_DENIED, URLFactory.MESSAGES.ERROR);
            $location.path(URLFactory.MESSAGES.DASHBOARD_URL);
        }
    };
    $scope.remove = function (Skill) {
        if (Skill && $scope.deletePermission) {
            if (Skill) {
                var skill = new SkillService.skill(Skill);
                skill.$remove(function (response) {
                    deleteObjectFromArray($scope.collection, Skill);
                    $('#deletePopup').modal("hide");
                    flash.setMessage(URLFactory.MESSAGES.SKILL_DELETE_SUCCESS, URLFactory.MESSAGES.SUCCESS);
                    $location.path(URLFactory.SKILL.PATH.SKILL_LIST);
                });
            }
        } else {
            flash.setMessage(URLFactory.MESSAGES.PERMISSION_DENIED, URLFactory.MESSAGES.ERROR);
            $location.path(URLFactory.MESSAGES.DASHBOARD_URL);
        }
    };

    $scope.update = function (isValid) {
        if (isValid) {
            var skill = $scope.skill;
            $scope.skill.subSkills = $scope.skill.subSkills.filter(function (subSkill) {
                if (subSkill.skillName) {
                    return subSkill;
                }
            });
            if (!skill.updated) {
                skill.updated = [];
            }

            skill.updated.push(new Date().getTime());
            skill.$update(function () {
                flash.setMessage(URLFactory.MESSAGES.SKILL_UPDATE_SUCCESS, URLFactory.MESSAGES.SUCCESS);
                $location.path(URLFactory.SKILL.PATH.SKILL_LIST);
            }, function (error) {
                $scope.error = error;
            });
        } else {
            $scope.submitted = true;
        }
    };
    $scope.findOne = function () {
        SkillService.skill.get({
            skillId: $stateParams.skillId
        }, function (skill) {
            $scope.skill = skill;
            $scope.setSubSkill();
            $scope.breadCrumAdd("Edit");
        });
    };
    $scope.cancelSkill = function () {
        $location.path(URLFactory.SKILL.PATH.SKILL_LIST);
    };
    $scope.newSkill = function () {
        $location.path(URLFactory.SKILL.PATH.SKILL_CREATE);
    };

    $scope.editSkill = function (urlPath, id) {
        urlPath = urlPath.replace(":skillId", id);
        $location.path(urlPath);
    };
    //***************Mentor Experience***************//
    $scope.addSubskill = function () {
        $scope.skill.subSkills.push({});
    };
    $scope.removeSubskill = function (subSkill) {
        var index = $scope.skill.subSkills.indexOf(subSkill);
        $scope.skill.subSkills.splice(index, 1);
    };
});