'use strict';

angular.module('mean.skill').controller('BadgeController', function ($scope,BadgeService, $stateParams, $location, $rootScope, SkillService, flash ,$uibModal,$translate, URLFactory) {
    $scope.URLFactory = URLFactory;
    $scope.package = {
        name: 'skill',
        featureName: 'Badges',
        modelName: 'Badge'
    };

    initializePermission($scope, $rootScope, $location, flash, $scope.package.featureName, URLFactory.MESSAGES);
    initializeBreadCrum($scope, $scope.package.modelName, URLFactory.SKILL.URL_PATH.BADGE_LIST);
    pageTitleMessage($scope,$translate,'skills.badge.WELCOME','skills.badge.TITLE_DESC');
    initializePagination($scope, $rootScope, BadgeService);
    initializeDeletePopup($scope, $scope.package.modelName, URLFactory.MESSAGES,$uibModal);
    $scope.findSkill = function () {
        SkillService.skill.query(function (skills) {
            $scope.skills = skills;
        });
    };

    $scope.newBadge = function () {
        $location.path(URLFactory.SKILL.PATH.BADGE_CREATE);
    };

    $scope.createBadge = function () {
        $scope.badge = {};
        $scope.breadCrumAdd("Create");
    };

    $scope.create = function (isValid) {
        if ($scope.writePermission) {
            if (isValid) {
                var badge = new BadgeService.badge($scope.badge);
                badge.$save(function (response) {
                    flash.setMessage(MESSAGES.BADGE_ADD_SUCCESS, URLFactory.MESSAGES.SUCCESS);
                    $location.path(URLFactory.SKILL.PATH.BADGE_LIST);
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

    $scope.remove = function (Badge) {
        if (Badge && $scope.deletePermission) {
            var badge = new BadgeService.badge(Badge);
            badge.$remove(function (response) {
                deleteObjectFromArray($scope.collection, Badge);
                $('#deletePopup').modal("hide");
                flash.setMessage(URLFactory.MESSAGES.BADGE_DELETE_SUCCESS, URLFactory.MESSAGES.SUCCESS);
                $location.path(URLFactory.SKILL.PATH.BADGE_LIST);
            });
        } else {
            flash.setMessage(URLFactory.MESSAGES.PERMISSION_DENIED, URLFactory.MESSAGES.ERROR);
            $location.path(URLFactory.MESSAGES.DASHBOARD_URL);
        }
    };

    $scope.update = function (isValid) {
        if ($scope.updatePermission) {
            if (isValid) {
                var badge = $scope.badge;
                if (!badge.updated) {
                    badge.updated = [];
                }
                badge.updated.push(new Date().getTime());

                badge.$update(function () {
                    flash.setMessage(URLFactory.MESSAGES.BADGE_UPDATE_SUCCESS, URLFactory.MESSAGES.SUCCESS);
                    $location.path(URLFactory.SKILL.PATH.BADGE_LIST);
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
    $scope.findOne = function () {
        if ($scope.updatePermission) {
            BadgeService.badge.get({
                badgeId: $stateParams.badgeId
            }, function (badge) {
                $scope.badge = badge;
                $scope.breadCrumAdd("Edit");
            });
        } else {
            flash.setMessage(URLFactory.MESSAGES.PERMISSION_DENIED, URLFactory.MESSAGES.ERROR);
            $location.path(URLFactory.MESSAGES.DASHBOARD_URL);
        }
    };
    $scope.cancelBadge = function () {
        $location.path(URLFactory.SKILL.PATH.BADGE_LIST);
    };

    $scope.editBadge = function (urlPath, id) {
        urlPath = urlPath.replace(":badgeId", id);
        $location.path(urlPath);
    };
});