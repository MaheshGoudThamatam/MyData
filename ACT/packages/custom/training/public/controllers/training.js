(function() {
    'use strict';

    /* jshint -W098 */
    angular.module('mean.training').controller('TrainingController', TrainingController);
    TrainingController.$inject = ['$scope', 'Global', 'TrainingService', '$stateParams', 'utilityService', '$location', '$timeout', 'TRAINING', 'UserService', 'NgTableParams', '$http'];

    function TrainingController($scope, Global, TrainingService, $stateParams, utilityService, $location, $timeout, TRAINING, UserService, NgTableParams, $http) {
        $scope.global = Global;
        $scope.package = {
            name: 'training'
        };

        $scope.backendValidation = true;
        $scope.bindPopover = function() {
            $('[data-toggle="popover"]').popover({
                placement: 'top',
                trigger: 'hover'
            });
        }

        $scope.fetchUser = function() {
            TrainingService.users.query(function(users) {
                $scope.users = users;
                $scope.loadTraining();
            });
        };

        $scope.findOne = function(trainingId) {
            $scope.maxLength1 = false;
            $scope.maxLength = false;
            $scope.submitted1 = false;
            $scope.submitted = false;
            TrainingService.training.get({
                trainingId: trainingId
            }, function(training) {
                $scope.training = training;
            });
        };

        $scope.loadTraining = function() {
            $scope.submitted1 = false;
            $scope.submitted = false;
            TrainingService.training.query(function(trainings) {
                $scope.trainingTables = trainings;
                $scope.trainingTable = new NgTableParams(utilityService.ngTableOptions(), {
                    dataset: $scope.trainingTables
                });
            });
        };

        /**
         * Watch for displaying page counts for the table
         */
        $scope.$watch('trainingTables', function(array) {
            if (angular.isDefined(array)) {
                if (angular.isDefined($scope.trainingTable)) {
                    $scope.trainingTable.settings(utilityService.ngTableCounts(array));
                }
            }
        });

        /**
         * $watch for the <input> element for table global filter.
         * 'tableFilter' is the ng-model of the <input> element (see .html)
         * Whenever the value changes, the table data is filtered and the table is reloaded. 
         * 
         * Note: This will not work for tables with server-side pagination. Filtering will also have to be done server-side.
         */
        $scope.$watch('tableFilter', function(needle) {
            if (angular.isDefined(needle)) {
                if (angular.isDefined($scope.trainingTable)) {
                    $scope.trainingTable.settings().dataset = $scope.trainingTables.filter(function(item) {
                        /**
                         * [haystack] Concatenate all the fields from the data object that needs to be searched against.
                         * @type {[String]}
                         */
                        var haystack = item.training_name + item.shortName;

                        // Build a regex to perform non-case-sensitive search
                        needle = utilityService.escapeRegExp(needle);
                        var re = new RegExp(needle, "i")
                        return haystack.search(re) > -1;
                    });
                    $scope.trainingTable.reload();
                }
            }
        });

        $scope.createTraining = function(isValid) {
            if (isValid) {
                var training = new TrainingService.training($scope.training);
                training.$save(function(response) {
                    $scope.backendValidation = false;
                    $scope.saved = true;
                    utilityService.flash.success("Training Created Successfully");
                    $scope.trainingTable.settings().dataset.push(response);
                    $scope.trainingTable.reload();
                    $scope.training = {};
                    $scope.submitted = false;
                }, function(error) {
                    $scope.error = error;
                    for (var i = 0; i < $scope.error.data.length; i++) {
                        if ($scope.error.data[i].param == "training_name") {
                            $scope.backendValidation = true;
                        }
                    }
                });
            } else {
                $scope.submitted = true;
                $scope.maxLength = true;
                utilityService.flash.error("You have some form errors, Please check again");
            }

        };

        $scope.maxErr = function() {
            $scope.maxLength = false;
            $scope.maxLength1 = false;
        };

        $scope.back = function() {
            $location.path(TRAINING.URL_PATH.TRAININGCREATE);
        };

        $scope.editTraining = function(isValid) {
            if (isValid) {
                var training = $scope.training;
                training.updatedAt = new Date();
                training.$update({
                    trainingId: $scope.training._id
                }, function(response) {
                    $scope.backendValidation = false;
                    for (var i = 0; i < $scope.trainingTable.settings().dataset.length; i++) {
                        if (JSON.stringify($scope.trainingTable.settings().dataset[i]._id) == JSON.stringify(response._id)) {
                            $scope.trainingTable.settings().dataset.splice(i, 1, response);
                        }
                    }
                    $scope.trainingTable.reload();
                    $scope.saved = true;
                    utilityService.flash.success('Training updated successfully');
                    $scope.submitted1 = false;
                    $('#myModal').modal('hide');
                    $scope.training = {};
                }, function(error) {
                    $scope.error = error;
                    for (var i = 0; i < $scope.error.data.length; i++) {
                        if ($scope.error.data[i].param == "training_name") {
                            $scope.backendValidation = true;
                        }
                    }
                });
            } else {
                $scope.maxLength1 = true;
                $scope.submitted1 = true;
                utilityService.flash.error("You have some form errors, Please check again");
            }
        };

        $scope.close = function() {
            $scope.training = {};
            $('#myModal').modal('hide');
            $scope.backendValidation = false;
            $scope.submitted1 = false;
            $scope.submitted = false;
        };

        $scope.selectedTraining = function($event, user, trainingTb) {
            $http({
                method: 'PUT',
                data: {
                    userId: user._id,
                    trainingId: trainingTb._id,
                    assign: $($event.currentTarget)[0].checked
                },
                url: '/api/user/updateTraining'
            }).then(function successCallback(response) {

            }, function errorCallback(response) {
                //TODO: Log this error
            });
        };

        $scope.checkTraining = function(user, training) {
            if (user.trainings.indexOf(training._id) > -1) {
                return true;
            } else {
                return false;
            }
        };

        $scope.remove = function(Training) {
            if (Training) {
                var title = "Are you sure?";
                var body = "<div class='text-danger'>Deleting a training will cause it to be unassigned from all users.</div>";
                utilityService.genericConfirm(title, body, function(response) {
                    var message = "";
                    if (response) {
                        message = "Training deleted successfully";
                        var training = new TrainingService.training(Training);
                        Training.$remove(function(response) {
                            for (var i = 0; i < $scope.trainingTable.settings().dataset.length; i++) {
                                if (Training == $scope.trainingTable.settings().dataset[i]) {
                                    $scope.trainingTable.settings().dataset.splice(i, 1)
                                }
                            }
                            for (var i = 0; i < $scope.trainingTables.length; i++) {
                                if (Training == $scope.trainingTables[i]) {
                                    $scope.trainingTables.splice(i, 1);
                                }
                            }
                            $scope.trainingTable.reload().then(function(data) {
                                if (data.length === 0 && $scope.trainingTable.total() > 0) {
                                    $scope.trainingTable.page($scope.trainingTable.page() - 1);
                                    $scope.trainingTable.reload();
                                }
                            });
                            $location.path(TRAINING.URL_PATH.TRAININGMANAGE);
                        });
                        utilityService.flash.success(message);
                    }
                });
            }
        };
    }

})();