'use strict';

/* jshint -W098 */

angular.module('mean.team').controller('TeamController',
                function($scope,$rootScope, Global, TeamService, $location, $stateParams, MeanUser) {

	                $scope.package = {
		                name : 'team'
	                };
	                flashmessageOn($rootScope, $scope,flash);
	                $scope.currentUser = MeanUser.user;
	                hideBgImageAndFooter($rootScope);
	                $scope.create = function(isvalid) {
		                if (isvalid) {
			                var team = new TeamService.teamCreate($scope.team);
			                team.$save({
			                    partnerId : $scope.currentUser._id,
			                    roleType : 'partner'
			                }, function(response) {
				                $location.path('/team/list');
				                $scope.team = {};
			                }, function(error) {
				                $scope.error = error;
			                });
		                } else {
			                $scope.submitted = true;
		                }
	                };

	                $scope.remove = function(team) {
		                if (team) {
			                var team = new TeamService.teamEdit(team);
			                    team.$remove({
			                	partnerId : $scope.currentUser._id,
			                	roleType :'partner',
			                	teamId: team._id
			                }, function(response) {
				                for (var i = 0; i < $scope.teams.length; i++) {
					                if (JSON.stringify($scope.teams[i]._id) === JSON.stringify(team)) {
						                $scope.teams.splice(i, 1);
					                }
				                }
				                $location.path('/team/list');
			                });
		                }
	                };
	                $scope.update = function(isvalid) {
		                if (isvalid) {
			                var team = $scope.team;
			                if (!team.updated) {
				                team.updated = [];
			                }
			                team.updated.push(new Date().getTime());
			                team = new TeamService.teamEdit(team);
			                team.$update({
			                	roleType :'partner',
			                	partnerId : $stateParams.partnerId,
			                	teamId: $stateParams.teamId
			                }, function(response) {
				                $location.path('/team/list');
			                }, function(error) {
				                $scope.error = error;
			                });
		                } else {
			                $scope.submitted = true;
		                }
	                };

	                $scope.findOne = function() {
		                TeamService.teamOne.get({
		                    teamId : $stateParams.teamId,
		                    partnerId : $stateParams.partnerId
		                }, function(team) {
			                $scope.team = team;
		                });

	                };

	                $scope.list = function() {
		                TeamService.teamList.query({
		                    partnerId : $scope.currentUser._id,
		                    roleType : 'partner'
		                }, function(response) {
		                   $scope.teams = response;
		                })
	                };
	                $scope.newTeam = function() {
		                $location.path('/team/create');
	                }

	                $scope.cancel = function() {
		                $location.path('/team/list');
	                };

	               
                });