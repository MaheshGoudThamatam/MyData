/*
 * <Author:Akash Gupta>
 * <Date:25-07-2016>
 * <functions: create, getAll, getSingle>
 */

(function() {
    'use strict';

    /* jshint -W098 */
    angular.module('mean.securitytasks').controller('SecuritytasksController', SecuritytasksController);

    SecuritytasksController.$inject = ['$scope', 'Global', 'SecurityTasksService', '$stateParams', 'RiskService', 'UserService', 'SECURITYTASKS', '$location', 'utilityService', 'NgTableParams', 'MeanUser', 'RISK', '$window', 'Upload', '$http','CONFIG','BuildingService','LocationService'];

    function SecuritytasksController($scope, Global, SecurityTasksService, $stateParams, RiskService, UserService, SECURITYTASKS, $location, utilityService, NgTableParams, MeanUser, RISK, $window, Upload, $http,CONFIG,BuildingService,LocationService) {
        $scope.global = Global;
        $scope.package = {
            name: 'securitytasks'
        };
        $scope.CONFIG = CONFIG;
        $scope.subTaskObj = {};
        $scope.securityTaskFromDB = true;
        $scope.cost = {};
        //TODO: have to be changed once article data is confirmed by client
        $scope.articles = [{
            name: 'Fire Extinguisher'
        }, {
            name: 'Evacuation Plan'
        }, {
            name: 'Fire Alarm'
        }, {
            name: 'Emergency'
        }]

        /**
         * Initialize datepicker
         */
        $('#deadlineDate').datetimepicker({
            format: 'YYYY-MM-DD',
            minDate: new Date()
        });

        /**
         * Initialize datepicker
         */
        $scope.initializeDatePicker = function() {
            $('#todo-task-modal').find('.securityTaskDeadline').datetimepicker({
                format: 'YYYY-MM-DD',
                minDate: new Date()
            });
            $scope.assignSecurityTaskDeadline();
        };

        /**
         * Create function for security tasks
         * @params: {isValid} Check frontend validation for security task form.
         */
        $scope.create = function(isValid) {
            if (angular.isUndefined($scope.securityTask)) {
                $scope.securityTask = {};
            }
            if (isValid && $scope.securityTask.deadline && $scope.securityTask.subTasks) {
                var securityTask = new SecurityTasksService.securityTask($scope.securityTask);
                securityTask.$save(function(response) {
                    $scope.saved = true;
                    if(securityTask.responsible_action == MeanUser.user._id){
                    $location.path(SECURITYTASKS.URL_PATH.MYTASK_LIST);
                    }else{
                    	$location.path(SECURITYTASKS.URL_PATH.ALLTASK_LIST);
                    }
                    utilityService.flash.success("Security Task Created Successfully");
                }, function(error) {
                    $scope.error = error;
                });
            } else {
                if (!$scope.securityTask.deadline) {
                    $scope.isDeadline = false;
                }
                if (!$scope.securityTask.subTasks) {
                    $scope.submitted1 = true;
                }
                utilityService.flash.error("You have some form errors, Please check again");
                $scope.submitted = true;
            }
        };

        /**
         * Fetch risk list based on building for that company
         */
        $scope.fetchRisk = function(building) {
            $scope.risks = {};
            SecurityTasksService.riskBasedonBuilding.query({
                buildingId: building
            }, function(risks) {
                if (risks.length > 0) {
                    $scope.risks = risks;
                } else {
                    var title = "No Risk Found for this building.";
                    var message = "Please add risk first, do you want to create risk?";
                    utilityService.genericConfirm(title, message, function() {
                        //TODO: this will completely reload the window & need to find a better solution later
                        $window.location.href = RISK.PATH.CREATE_RISK;
                    }, function() {

                    });
                }
            })
            $scope.user(building); //Fetch user based on building
        };

        /**
         * fetch all user for current company based on building passed
         * @params: {building} building obj based on which user is fetched
         */
        $scope.user = function(building) {
            SecurityTasksService.allUser.query({
                buildingId: building
            }, function(users) {
                $scope.users = users;
            })
        };

        /**
         * assign datepicker to scope variable
         */
        $("#deadlineDate").on("dp.change", function(event) {
            if (event.date != false) {
                if (angular.isUndefined($scope.securityTask)) {
                    $scope.securityTask = {};
                }
                if (event.date._strict == false) {
                    $scope.securityTask.deadline = event.date.format('YYYY-MM-DD');
                } else {
                    $scope.securityTask.deadline = event.date.utc().format('YYYY-MM-DD');
                }
                $scope.isDeadline = true;
            }
        });

        /**
         * redirection to security task list page
         */
        $scope.cancel = function() {
            $location.path(SECURITYTASKS.URL_PATH.ALLTASK_LIST)
        };

        /**
         * fetch alltask and mytask list
         */
        $scope.allTasks = function() {
            var currentUser = MeanUser.user;
            var allTask = [];
            SecurityTasksService.securityTask.query({}, function(tasks) {
                tasks = tasks[0];
                if (tasks.alltask) {
                    for (var i = 0; i < tasks.alltask.length; i++) {
                        tasks.alltask[i].deadline = new Date(tasks.alltask[i].deadline).toISOString().slice(0, 10);
                        if (tasks.alltask[i].responsible_action) {
                            if (JSON.stringify(tasks.alltask[i].responsible_action._id) != JSON.stringify(currentUser._id)) {
                                allTask.push(tasks.alltask[i]);
                            }
                        } else {
                            allTask.push(tasks.alltask[i]);
                        }
                        var queryParam = $location.search();
                        if(queryParam.secId){
                        	var secId = queryParam.secId;
                        	$scope.getUrl(secId);
                        }else{
                        	$location.search('');
                        }
                    }
                    $scope.allSecurityTasks = allTask;
                    $scope.allSecurityTasksArray = allTask;
                    $scope.allTaskTable = new NgTableParams(utilityService.ngTableOptions(), {
                        dataset: $scope.allSecurityTasksArray
                    });
                }
                if (tasks.mytask) {
                    for (var i = 0; i < tasks.mytask.length; i++) {
                        tasks.mytask[i].deadline = new Date(tasks.mytask[i].deadline).toISOString().slice(0, 10);
                    }
                    $scope.mySecurityTasks = tasks.mytask;
                    $scope.mySecurityTasksArray = tasks.mytask;
                    $scope.myTaskTable = new NgTableParams(utilityService.ngTableOptions(), {
                        dataset: $scope.mySecurityTasksArray
                    });
                }
                if (tasks.externalTask) {
                    $scope.externalTasks = tasks.externalTask;
                    $scope.externalTasksArray = tasks.externalTask;
                    $scope.externalTaskTable = new NgTableParams(utilityService.ngTableOptions(), {
                        dataset: $scope.externalTasksArray
                    });
                }
            })
        };

        /*
         * redirect to create security task list page
         */
        $scope.newTask = function() {
            $location.path(SECURITYTASKS.URL_PATH.SECURITYTASKS_ADD)
        };

        /**
         * function to create subtask
         */
        $scope.addSubtask = function(isValid) {
            if (isValid) {
                if (angular.isUndefined($scope.securityTask)) {
                    $scope.securityTask = {};
                }
                if (angular.isUndefined($scope.securityTask.subTasks)) {
                    $scope.securityTask.subTasks = [];
                }
                $scope.securityTask.subTasks.push($scope.subTask);
                $scope.subTask = {};
                if ($scope.submitted1 == true) {
                    $scope.submitted1 = false
                }
                utilityService.flash.success("Subtask Created Successfully");
                $scope.initializeSubTaskTable($scope.securityTask.subTasks);
            } else {
                utilityService.flash.error("You have some form errors, Please check again");
                $scope.submitted1 = true;
            }
        };

        /**
         * remove created subTask from scope variable
         */
        $scope.removeSubTask = function(subTask) {
            var index = $scope.securityTask.subTasks.indexOf(subTask);
            for (var i = 0; i < $scope.subTaskTable.settings().dataset.length; i++) {
                if (subTask == $scope.subTaskTable.settings().dataset[i]) {
                    $scope.subTaskTable.settings().dataset.splice(i, 1)
                }
            }
            $scope.securityTask.subTasks.splice(index, 1);
            if ($scope.securityTask.subTasks.length == 0) {
                delete $scope.securityTask.subTasks;
            }
            $scope.subTaskTable.reload().then(function(data) {
                if (data.length === 0 && $scope.subTaskTable.total() > 0) {
                    $scope.subTaskTable.page($scope.subTaskTable.page() - 1);
                    $scope.subTaskTable.reload();
                }
            });
            utilityService.flash.success("Subtask Deleted Successfully");
        }

        /**
         * initialize subtask tables
         * @params {subTasks},  Array contain all subTask object
         */
        $scope.initializeSubTaskTable = function(subTasks) {
            $scope.subTaskTable = new NgTableParams(utilityService.ngTableOptions(), {
                dataset: subTasks
            });
        };

        /**
         * bind data of security task to perform audit page
         */
        $scope.getDetails = function(task) {
            $scope.selectedTask = task;
            $scope.getSubtask(task); //Fetch Subtasks
            $scope.user(task.building); //Fetch users
            $scope.getHoursCost(task);
            $scope.logHour = {};
            $scope.cost = {};
            $scope.submittedCost = false;
            $scope.submittedHour = false;
            $scope.submittedSubtask = false;
            $scope.submitted1 = false;
            $scope.followUpPerson = {};
            $scope.responsiblePerson = {};
            $scope.securityTaskFromDB = true;
            $scope.allexternalTask(task);
        };

        /**
         * Fetch all subtask related to that security task
         * @params: {securityTask} Object contain security task
         */
        $scope.getSubtask = function(securityTask) {
            SecurityTasksService.subTask.query({ securitytaskId: securityTask._id }, function(subTasks) {
                $scope.subTasks = subTasks;
                $scope.initializeSubTaskTable(subTasks); //initialize ng table for subtask
                $scope.calculateSubtask(null, subTasks); //calculate subtask completion percentage
            })
        };

        /**
         * Create function to add hours to subTask
         * @params: {isValid} Check form data is valid or not
         */
        $scope.addHours = function(isValid) {
            if (isValid) {
                $scope.logHour.securitytask = $scope.selectedTask;
                var logHour = new SecurityTasksService.logHours($scope.logHour);
                logHour.$save(function(response) {
                    $scope.calculateHours(response.actual_time);
                    utilityService.flash.success("Hours added Successfully");
                    $scope.logHourTable.settings().dataset.push(response);
                    $scope.logHourTable.reload();
                    $scope.logHour = {};
                }, function(error) {
                    $scope.error = error;
                });
                if ($scope.submittedHour == true) {
                    $scope.submittedHour = false;
                }
            } else {
                utilityService.flash.error("You have some form errors, Please check again");
                $scope.submittedHour = true;
            }
        };

        /**
         * initialize log hours table
         * @params {logHours},  Array contain all logHour object
         */
        $scope.initializeLogHoursTable = function(logHours) {
            $scope.logHourTable = new NgTableParams(utilityService.ngTableOptions(), {
                dataset: logHours
            });
        };

        /**
         * initialize Cost table
         * @params {logHours},  Array contain all cost object
         */
        $scope.initializeCostTable = function(costs) {
            $scope.costTable = new NgTableParams(utilityService.ngTableOptions(), {
                dataset: costs
            });
        };

        /**
         * fetch hours & cost and calculate total Hours, & cost and assign to scope variable
         * @params: {securityTask} Object contain security task
         */
        $scope.getHoursCost = function(securityTask) {
            var totalHours = 0,
                totalCosts = 0;
            SecurityTasksService.listLogHours.query({ securitytaskId: securityTask._id }, function(response) {
                for (var i = 0; i < response.loghour.length; i++) {
                    totalHours = totalHours + response.loghour[i].actual_time;
                };
                for (var j = 0; j < response.cost.length; j++) {
                    totalCosts = totalCosts + response.cost[j].actual_cost;
                };
                $scope.logHours = response.loghour;
                $scope.costArray = response.cost;
                $scope.initializeLogHoursTable(response.loghour);
                $scope.initializeCostTable(response.cost);
                $scope.totalHours = totalHours;
                $scope.totalCosts = totalCosts;
            })
        };

        /**
         * create function to add hours to subTask
         * @params: {isValid} Check form data is valid or not
         */
        $scope.addCosts = function(isValid) {
            if (isValid) {
                $scope.cost.securitytask = $scope.selectedTask;
                var subTaskCost = new SecurityTasksService.logCosts($scope.cost);
                subTaskCost.$save(function(response) {
                    $scope.calculateCost(response.actual_cost);
                    utilityService.flash.success("Cost Added Successfully");
                    $scope.costTable.settings().dataset.push(response);
                    $scope.costTable.reload();
                    $scope.cost = {};
                }, function(error) {
                    $scope.error = error;
                });
                if ($scope.submittedCost == true) {
                    $scope.submittedCost = false;
                }
            } else {
                utilityService.flash.error("You have some form errors, Please check again");
                $scope.submittedCost = true;
            }
        };

        /**
         * reCalculate total cost of security task after adding cost to subtask
         * @params: {cost} cost of newly created subtask to concat with exist total cost variable
         */
        $scope.calculateCost = function(cost) {
            $scope.totalCosts = $scope.totalCosts + cost;
        };

        /**
         * reCalculate total cost of security task after removing cost from subtask
         * @params: {cost} cost of newly created subtask to concat with exist total cost variable
         */

        $scope.calculateCostonRemoving = function(cost) {
            $scope.totalCosts = $scope.totalCosts - cost;
        };

        /**
         * reCalculate total hours of security task after adding hours to subtask
         * @params: {hours} hour of newly created subtask to concat with exist total hours variable
         */
        $scope.calculateHours = function(hours) {
            $scope.totalHours = $scope.totalHours + hours;
        };

        /**
         * reCalculate total hours of security task after removing hours from subtask
         * @params: {hours} hour of newly created subtask to concat with exist total hours variable
         */
        $scope.calculateHoursonRemoving = function(hours) {
            $scope.totalHours = $scope.totalHours - hours;
        };

        /**
         * function to save subTask status(isPerformed field)
         * @params: {subTask} contain subtask object
         */
        $scope.completeSubtask = function(subTask) {
            if (subTask.isPerformed == false) {
                var subTaskObj = new SecurityTasksService.subTaskCreate(subTask);
                subTaskObj.updatedAt = new Date();
                subTaskObj.isPerformed = true;
                subTaskObj.$update({
                    subtaskId: subTaskObj._id
                }, function(response) {
                    utilityService.flash.success('Subtask Completed successfully');
                    for (var i = 0; i < $scope.subTasks.length; i++) {
                        if (JSON.stringify(response._id) == JSON.stringify($scope.subTasks[i]._id)) {
                            $scope.subTasks[i].isPerformed = true;
                        }
                    }
                    $scope.calculateSubtask(subTask, $scope.subTasks);
                }, function(error) {
                    $scope.error = error;
                });
            };
        };

        /**
         * check if loggedin user is security manager or not
         */
        $scope.findSecurityManager = function() {
            var user = MeanUser.user;
            if (user.role.name == 'Security Manager') {
                $scope.isSecurityManager = true;
            } else {
                $scope.isSecurityManager = false;
            }
        };

        /**
         * calculate percentage of subTask completed
         * @params: {subTask} contain subtask object
         * @params: {subTasks} contain array of subtasks
         */
        $scope.calculateSubtask = function(subTask, subTasks) {
            if (subTask == null || subTask == undefined) {
                var complete = 0;
                for (var i = 0; i < subTasks.length; i++) {
                    if (subTasks[i].isPerformed == true) {
                        complete = complete + 1;
                    }
                }
                if (complete > 0) {
                    var percentage = (complete * 100) / subTasks.length;
                    percentage = +percentage.toFixed(2);
                } else {
                    percentage = 0;
                }
                $scope.subtaskPercentage = percentage;
            } else
            if (subTask) {
                var complete = 0;
                for (var i = 0; i < $scope.subTasks.length; i++) {
                    if ($scope.subTasks[i].isPerformed == true) {
                        complete = complete + 1;
                    }
                }
                var percentage = (complete * 100) / subTasks.length;
                percentage = +percentage.toFixed(2);
                $scope.subtaskPercentage = percentage;
            }
        };

        /**
         * function to add subTask from perform security task page
         * @params: {isValid} Check form data is valid or not
         * @params: {data} subtask object which have to be created
         */
        $scope.addSubtaskPerformPage = function(isValid, data) {
            if (isValid) {
                var subTaskObj = data;
                subTaskObj.building = $scope.selectedTask.building;
                subTaskObj.company = MeanUser.user.company._id;
                subTaskObj.security_task = $scope.selectedTask._id;
                var subTask = new SecurityTasksService.subTaskCreate(subTaskObj);
                subTask.$save(function(response) {
                    utilityService.flash.success("Sub Task Created Successfully");
                    $scope.subTaskTable.settings().dataset.push(response);
                    $scope.subTaskTable.reload();
                    $scope.calculateSubtask(subTask, $scope.subTasks);
                    $scope.subTaskObj = {};
                    if ($scope.submittedSubtask == true) {
                        $scope.submittedSubtask = false;
                    }
                }, function(error) {
                    $scope.error = error;
                });
            } else {
                utilityService.flash.error("You have some form errors, Please check again");
                $scope.submittedSubtask = true;
            }
        };

        /**
         * Fetch building list based on building available in user model
         */
        $scope.buildingList = function() {
            var buildings = [];
            UserService.locationAndBuilding.query({}, function(response) {
                for (var i = 0; i < response.length; i++) {
                    if (response[i].buildings.length > 0) {
                        for (var j = 0; j < response[i].buildings.length; j++) {
                            buildings.push(response[i].buildings[j]);
                        }
                    }
                }
                $scope.buildings = buildings;
            })
        };

        /**
         * redirect to create external task page
         */
        $scope.externalTask = function() {
            var user = MeanUser.user;
            var url = SECURITYTASKS.URL_PATH.EXTERNAL_SECURITY_TASK;
            url = url.replace(':companyId', user.company._id);
            $location.path(url);
        };

        /**
         * redirect to view external task page
         */
        $scope.externalTaskRedirect = function(task) {
        	$('#todo-task-modal').modal('hide');
            var user = MeanUser.user;
            var url = SECURITYTASKS.URL_PATH.EXTERNAL_TASK_VIEW;
            url = url.replace(':companyId', user.company._id).replace(':externalsecuritytaskId', task._id);
            $location.path(url);
        };


        $scope.attachCostInvoice = function(file, cost) {
            if (file) {
                if (file.name.split('.').pop() !== 'pdf' && file.name.split('.').pop() !== 'jpeg' && file.name.split('.').pop() !== 'jpg') {
                    utilityService.flash.error('Only pdf and jpg/jpeg are accepted.');
                    return;
                } else {
                    $scope.upload = Upload.upload({
                        url: "/api/securityTask/attachCostInvoice",
                        method: 'POST',
                        data: {
                            file: file
                        }
                    }).progress(function(event) {}).success(function(data, status, headers, config) {
                        utilityService.flash.success('Uploaded successfully');
                        $scope.attachInvoicePath = data;
                        for (var i = 0; i < $scope.costArray.length; i++) {
                            if ($scope.costArray[i] == cost) {
                                $scope.costArray[i].attach_invoice = data;
                            }
                        }
                        $scope.cost.attach_invoice = data;
                        $scope.attachInvoiceCost = data.split('\\').pop().split('/').pop();
                    }).error(function(err) {
                        $scope.attachInvoiceCost = err;
                    });
                }
            }
        };
        $scope.downloadInvoice = function(costs) {
            $http({
                url: '/api/fileDownload?filename=' + costs.attach_invoice,
                method: 'GET',
                responseType: 'arraybuffer'
            }).success(function(response, status, headers, config) {
                var fileName = headers('content-disposition').split('=').pop();
                var contenttype = headers('content-type');
                var blob = new Blob([response], {
                    type: contenttype
                });
                saveAs(blob, fileName);
            });
        };

        /**
         * Delete subtask
         * @params: {SubTask} contain subTask object
         */
        $scope.deleteSubTask = function(SubTask) {
            if (SubTask) {
                var title = "Are you sure?";
                var body = "<div class='text-error'>All the costs and hours assigned to this subtask will also be deleted.</div>";
                utilityService.genericConfirm(title, body, function(response) {
                    if (response) {
                        var message = "Sub Task Deleted Successfully";
                        var subTask = new SecurityTasksService.subTaskCreate(SubTask);
                        subTask.$remove(function(response) {
                            for (var i = 0; i < $scope.subTaskTable.settings().dataset.length; i++) {
                                if (SubTask == $scope.subTaskTable.settings().dataset[i]) {
                                    $scope.subTaskTable.settings().dataset.splice(i, 1)
                                }
                            }
                            for (var i = 0; i < $scope.subTasks.length; i++) {
                                if (SubTask == $scope.subTasks[i]) {
                                    $scope.subTasks.splice(i, 1);
                                }
                            }
                            $scope.calculateSubtask(null, $scope.subTasks);
                            $scope.subTaskTable.reload().then(function(data) {
                                if (data.length === 0 && $scope.subTaskTable.total() > 0) {
                                    $scope.subTaskTable.page($scope.subTaskTable.page() - 1);
                                    $scope.subTaskTable.reload();
                                }
                            });
                            //Delete Hours related to task
                            if (response.hours.length > 0) {
                                for (var l = 0; l < response.hours.length; l++) {
                                    $scope.calculateHoursonRemoving(response.hours[l].actual_time);
                                    for (var i = 0; i < $scope.logHourTable.settings().dataset.length; i++) {
                                        if (JSON.stringify(response.hours[l]._id) == JSON.stringify($scope.logHourTable.settings().dataset[i]._id)) {
                                            $scope.logHourTable.settings().dataset.splice(i, 1)
                                        }
                                    }
                                    for (var i = 0; i < $scope.logHours.length; i++) {
                                        if (JSON.stringify(response.hours[l]._id) == JSON.stringify($scope.logHours[i]._id)) {
                                            $scope.logHours.splice(i, 1);
                                        }
                                    }
                                    $scope.logHourTable.reload();
                                }
                            }
                            //Delete costs related to task
                            if (response.costs.length > 0) {
                                for (var l = 0; l < response.costs.length; l++) {
                                    $scope.calculateCostonRemoving(response.costs[l].actual_cost);
                                    for (var i = 0; i < $scope.costTable.settings().dataset.length; i++) {
                                        if (JSON.stringify(response.costs[l]._id) == JSON.stringify($scope.costTable.settings().dataset[i]._id)) {
                                            $scope.costTable.settings().dataset.splice(i, 1)
                                        }
                                    }
                                    for (var i = 0; i < $scope.costArray.length; i++) {
                                        if (JSON.stringify(response.costs[l]._id) == JSON.stringify($scope.costArray[i]._id)) {
                                            $scope.costArray.splice(i, 1);
                                        }
                                    }
                                    $scope.costTable.reload();
                                }
                            }
                            utilityService.flash.success(message);
                        }, function(err) {
                            utilityService.flash.error(err.data);
                        })
                    }
                })
            }
        };

        /**
         * Delete subtask
         * @params: {LogHour} contain LogHour object
         */
        $scope.deleteLogHour = function(LogHour) {
            if (LogHour) {
                utilityService.delConfirm(function(result) {
                    var message = "Cancel";
                    if (result) {
                        if (!LogHour.task.isPerformed) {
                            message = "Log Hour Deleted Successfully";
                            var logHour = new SecurityTasksService.logHours(LogHour);
                            logHour.$remove(function(response) {
                                $scope.calculateHoursonRemoving(response.actual_time);
                                for (var i = 0; i < $scope.logHourTable.settings().dataset.length; i++) {
                                    if (LogHour == $scope.logHourTable.settings().dataset[i]) {
                                        $scope.logHourTable.settings().dataset.splice(i, 1)
                                    }
                                }
                                for (var i = 0; i < $scope.logHours.length; i++) {
                                    if (LogHour == $scope.logHours[i]) {
                                        $scope.logHours.splice(i, 1);
                                    }
                                }
                                $scope.logHourTable.reload().then(function(data) {
                                    if (data.length === 0 && $scope.logHourTable.total() > 0) {
                                        $scope.logHourTable.page($scope.logHourTable.page() - 1);
                                        $scope.logHourTable.reload();
                                    }
                                });
                                utilityService.flash.success(message);
                            }, function(err) {
                                if (err) {
                                    if (err.status == 405) {
                                        utilityService.flash.error(err.data.error);
                                    } else {
                                        $scope.error = err;
                                    }
                                }
                            })
                        } else {
                            utilityService.flash.error('Not Allowed');
                        }
                    }
                });
            }
        };

        /**
         * Delete subtask
         * @params: {Cost} contain Cost object
         */
        $scope.deleteCost = function(Cost) {
            if (Cost) {
                utilityService.delConfirm(function(result) {
                    var message = "Cancel";
                    if (result) {
                        if (!Cost.task.isPerformed) {
                            message = "Log Hour Deleted Successfully";
                            var cost = new SecurityTasksService.logCosts(Cost);
                            cost.$remove(function(response) {
                                $scope.calculateCostonRemoving(Cost.actual_cost);
                                for (var i = 0; i < $scope.costTable.settings().dataset.length; i++) {
                                    if (Cost == $scope.costTable.settings().dataset[i]) {
                                        $scope.costTable.settings().dataset.splice(i, 1)
                                    }
                                }
                                for (var i = 0; i < $scope.costArray.length; i++) {
                                    if (Cost == $scope.costArray[i]) {
                                        $scope.costArray.splice(i, 1);
                                    }
                                }
                                $scope.costTable.reload().then(function(data) {
                                    if (data.length === 0 && $scope.costTable.total() > 0) {
                                        $scope.costTable.page($scope.costTable.page() - 1);
                                        $scope.costTable.reload();
                                    }
                                });
                                utilityService.flash.success(message);
                            }, function(err) {
                                if (err) {
                                    if (err.status == 405) {
                                        utilityService.flash.error(err.data.error);
                                    } else {
                                        $scope.error = err;
                                    }
                                }
                            })
                        } else {
                            utilityService.flash.error('Not Allowed');
                        }
                    }
                });
            }
        };

        /**
         * finish performed status of security task as true.
         * @params: {task} security task object
         */
        $scope.closeSecurityTask = function(task) {
            var openTask = 0;
            var openExternaltask = 0;
            $scope.selectedTask.finish = false;
            for (var i = 0; i < $scope.subTasks.length; i++) {
                if ($scope.subTasks[i].isPerformed == false) {
                    openTask = openTask + 1;
                }
            }
            for (var i = 0; i < $scope.allexternalTasks.length; i++) {
                if ($scope.allexternalTasks[i].status != 'COMPLETED') {
                    openExternaltask = openExternaltask + 1;
                }
            }
            var title = '';
            if (openTask > 0) {
                var body = "<div>There are still " + openTask + " subtask not finished. Please finish them first.</div>";
                utilityService.dialog(title, body, function() {});
            } else
            if (openExternaltask > 0) {
                var body = "<div>There are still " + openExternaltask + " external security task not finished. Please finish them first.</div>";
                utilityService.dialog(title, body, function() {});
            } else
            if (openTask == 0 && openExternaltask == 0) {
                title = "Are you sure?";
                var body = "<div>Once security task is finished you cannot add more subtask</div>";
                var saveFunction = function(response) {
                    if (response) {
                        var securityTask = new SecurityTasksService.securityTask(task);
                        securityTask.completedAt = new Date();
                        securityTask.updatedAt = new Date();
                        securityTask.$update({
                            securityTaskId: securityTask._id
                        }, function(responseObj) {
                            if (angular.isUndefined($scope.selectedTask)) {
                                $scope.selectedTask = {};
                            }
                            $scope.selectedTask.status = true;
                            utilityService.flash.success('Security Task Finished Successfully');
                            $scope.selectedTask.finish = true;
                        }, function(error) {
                            if (error.data.hasCost == false && error.data.hasHour == false) {
                                utilityService.flash.error('Please add costs and hours');
                            } else
                            if (error.data.hasCost == false) {
                                utilityService.flash.error('Please add costs');
                            } else
                            if (error.data.hasHour == false) {
                                utilityService.flash.error('Please add hours');
                            }
                        })
                    }
                };
                utilityService.genericConfirm(title, body, saveFunction)
            }
            $location.search('');
        };

        /**
         * assign responsible person to security task
         * @params: {securityTaskObj} Security task object
         * @params: {responsible} User obect of person assign as responsible to security task
         */
        $scope.assignResponsible = function(securityTaskObj, responsible) {
            var title = "Assign Responsible person";
            var body = "<div>Are you sure you want to assign " + responsible.firstname + " " + responsible.lastname + " to this security task as responsible person?</div>";
            var assign = function(response) {
                if (response) {
                    var securityTask = new SecurityTasksService.securityTask(securityTaskObj);
                    securityTask.updatedAt = new Date();
                    securityTask.responsible_action = responsible._id;
                    securityTask.$update({
                        securityTaskId: securityTask._id
                    }, function(responseObj) {
                        if (angular.isUndefined($scope.selectedTask)) {
                            $scope.selectedTask = {};
                        }
                        $scope.selectedTask.responsible_action = responsible; //assign value of follow up in frontend side

                        if (JSON.stringify(responsible._id) == JSON.stringify(MeanUser.user._id)) {
                            $scope.mySecurityTasks.push(securityTaskObj);
                            for (var i = 0; i < $scope.allSecurityTasks.length; i++) {
                                if ($scope.allSecurityTasks[i] == securityTaskObj) {
                                    $scope.allSecurityTasks.splice(i, 1);
                                }
                            }
                        }

                        utilityService.flash.success('Responsible Person assigned Successfully');
                    }, function(error) {

                    })
                }
            };
            utilityService.genericConfirm(title, body, assign)
        };

        /**
         * assign follow up person to security task
         * @params: {securityTaskObj} Security task object
         * @params: {followUp} User obect of person assign as follow up to security task
         */
        $scope.assignFollowUp = function(securityTaskObj, followUp) {
            var title = "Assign Follow up person";
            var body = "<div>Are you sure you want to assign " + followUp.firstname + " " + followUp.lastname + " to this security task as followup person?</div>";
            var assign = function(response) {
                if (response) {
                    var securityTask = new SecurityTasksService.securityTask(securityTaskObj);
                    securityTask.updatedAt = new Date();
                    securityTask.responsible_followUp = followUp._id;
                    securityTask.$update({
                        securityTaskId: securityTask._id
                    }, function(responseObj) {
                        if (angular.isUndefined($scope.selectedTask)) {
                            $scope.selectedTask = {};
                        }
                        $scope.selectedTask.responsible_followUp = followUp; //assign value of follow up in frontend side
                        utilityService.flash.success('Followup Person assigned Successfully');
                    }, function(error) {

                    })
                }
            };
            utilityService.genericConfirm(title, body, assign)
        };

        /**
         * enable or disable form to edit security task details
         */
        $scope.editSecurityTask = function(selectedTask) {
            if (selectedTask) {
                if (angular.isUndefined($scope.securityTaskObj)) {
                    $scope.securityTaskObj = {};
                }
                angular.copy(selectedTask, $scope.securityTaskObj)
                $scope.securityTaskObj.responsible_action = selectedTask.responsible_action._id;
                $scope.securityTaskObj.responsible_followUp = selectedTask.responsible_followUp._id;
                $scope.securityTaskObj.deadline = new Date(selectedTask.deadline).toISOString().slice(0, 10);
            }
            $scope.securityTaskFromDB = !$scope.securityTaskFromDB;
        };

        $scope.updateSecurityTask = function(isValid, securityTaskObj) {
            if (isValid && $scope.securityTaskObj.deadline) {
                $scope.noDeadline = false;
                var securityTask = new SecurityTasksService.securityTask($scope.securityTaskObj);
                securityTask.updatedAt = new Date();
                securityTask.status = false;
                securityTask.$update({
                    securityTaskId: securityTaskObj._id
                }, function(response) {
                    $scope.selectedTask = response;
                    for (var i = 0; i < $scope.allSecurityTasksArray.length; i++) {
                        if (JSON.stringify($scope.allSecurityTasksArray[i]._id) == JSON.stringify(response._id)) {
                            $scope.allSecurityTasksArray[i] = response;
                            if (JSON.stringify($scope.allSecurityTasksArray[i].responsible_action._id) == JSON.stringify(MeanUser.user._id)) {
                                $scope.allSecurityTasksArray.splice(i, 1);
                                $scope.mySecurityTasksArray.push(response);
                            }
                        }
                    }
                    for (var i = 0; i < $scope.mySecurityTasksArray.length; i++) {
                        if (JSON.stringify($scope.mySecurityTasksArray[i]._id) == JSON.stringify(response._id)) {
                            $scope.mySecurityTasksArray[i] = response;
                            if (JSON.stringify($scope.mySecurityTasksArray[i].responsible_action._id) != JSON.stringify(MeanUser.user._id)) {
                                $scope.mySecurityTasksArray.splice(i, 1);
                                $scope.allSecurityTasksArray.push(response);
                            }
                        }
                    }
                    $scope.selectedTask.deadline = new Date(response.deadline).toISOString().slice(0, 10);
                    utilityService.flash.success('Security Task Completed successfully');
                    $scope.editSecurityTask();
                }, function(error) {
                    $scope.error = error;
                });
            } else {
                utilityService.flash.error("You have some form errors, Please check again");
                $scope.submitted = true;
                $scope.noDeadline = true;
            }
        };

        /**
         * assign datepicker to scope variable
         */
        $scope.assignSecurityTaskDeadline = function() {
            $('#todo-task-modal').find('.securityTaskDeadline').on("dp.change", function(event) {
                if (event.date != false) {
                    if (angular.isUndefined($scope.securityTaskObj)) {
                        $scope.securityTaskObj = {};
                    }
                    if (event.date._strict == false) {
                        $scope.securityTaskObj.deadline = event.date.format('YYYY-MM-DD');
                    } else {
                        $scope.securityTaskObj.deadline = event.date.utc().format('YYYY-MM-DD');
                    }
                }
            });
        };

        /**
         *Fetch security task and external security task 
         *
         */
        $scope.fetchSecurityTasks = function() {
            SecurityTasksService.budget.query({}, function(tasks) {
                $scope.tasks = tasks;
            })
        }



        $scope.generatePdf = function() {
            var a = $('#tasksListContainer').html();
            $('#tasksListContainer').append('<div id="copy" >' + a + '</div>');
            $('#copy').find('form').each(function() { $(this).remove() });
            var b = $('#copy').html();
            utilityService.generatePdf(b, "perform-task")
        }

        $scope.downloadAttachedAuditSecurityTask = function(downloadpath) {
            $http({
                url: '/api/fileDownload?filename=' + downloadpath,
                method: 'GET',
                responseType: 'arraybuffer'
            }).success(function(response, status, headers, config) {
                var fileName = headers('content-disposition').split('=').pop();
                var contenttype = headers('content-type');
                var blob = new Blob([response], {
                    type: contenttype
                });
                saveAs(blob, fileName);
            });
        };

        $scope.restrictInput = function(event) {
            if (event.keyCode != 9 && event.keyCode != 8) {
                return event.preventDefault();
            }
        };

        $scope.redirectToExternaltask = function(externalTasksName) {
            var user = MeanUser.user;
            $('#todo-task-modal').modal('hide');
            $location.url('/externalsecuritytask/' + user.company._id + '/create' + '?securitytaskName=' + $scope.selectedTask.task_name + '&securitytaskId=' + $scope.selectedTask._id + '&externaltaskName=' + externalTasksName);
        };

        $scope.allexternalTask = function(task) {
            SecurityTasksService.allexternaltasks.query({
                securitytaskId: task._id
            }, function(response) {
                $scope.allexternalTasks = response;
                $scope.externalTaskTable = new NgTableParams(utilityService.ngTableOptions(), {
                    dataset: $scope.allexternalTasks
                })
            })
        };
        
        $scope.myTask = function(){
        	$location.path(SECURITYTASKS.URL_PATH.MYTASK_LIST);
        };
        
        
        $scope.alltask = function(){
        	$location.path(SECURITYTASKS.URL_PATH.ALLTASK_LIST);
        };
        
        
        $scope.externaltask = function(){
        	$location.path(SECURITYTASKS.URL_PATH.EXTERNALTASK_LIST);
        };
        
        $scope.$watch('allTaskFilter', function(needle) {
            if (angular.isDefined(needle)) {
                if (angular.isDefined($scope.allTaskTable)) {
                    $scope.allTaskTable.settings().dataset = $scope.allSecurityTasksArray.filter(function(item) {
                        /**
                         * [haystack] Concatenate all the fields from the data object that needs to be searched against.
                         * @type {[String]}
                         */
                    	if(item.status){
                    		item.statusField = CONFIG.status.PERFORMED;
                    	}else{
                    		item.statusField = CONFIG.status.PENDING;
                    	}
                    	if (item.responsible_action) {
                    		var haystack = item.task_name + item.deadline + item.state + item.statusField + item.responsible_action.firstname + item.responsible_action.lastname;
                    	} else {
                    		var haystack = item.task_name + item.deadline + item.state + item.statusField + 'Unassigned';
                    	}
                        needle = utilityService.escapeRegExp(needle);
                        var re = new RegExp(needle, "i");
                        return haystack.search(re) > -1;
                    });
                    $scope.allTaskTable.reload();
                }
            }
        });
        
        $scope.$watch('myTaskFilter', function(needle) {
            if (angular.isDefined(needle)) {
                if (angular.isDefined($scope.myTaskTable)) {
                    $scope.myTaskTable.settings().dataset = $scope.mySecurityTasksArray.filter(function(item) {
                        /**
                         * [haystack] Concatenate all the fields from the data object that needs to be searched against.
                         * @type {[String]}
                         */
                    	if(item.status){
                    		item.statusField = CONFIG.status.PERFORMED;
                    	}else{
                    		item.statusField = CONFIG.status.PENDING;
                    	}
                    	if (item.responsible_action) {
                    		var haystack = item.task_name + item.deadline + item.state + item.statusField + item.responsible_action.firstname + item.responsible_action.lastname;
                    	} else {
                    		var haystack = item.task_name + item.deadline + item.state + item.statusField + 'Unassigned';
                    	}
                        needle = utilityService.escapeRegExp(needle);
                        var re = new RegExp(needle, "i");
                        return haystack.search(re) > -1;
                    });
                    $scope.myTaskTable.reload();
                }
            }
        });
        
        $scope.$watch('externalTaskFilter', function(needle) {
            if (angular.isDefined(needle)) {
                if (angular.isDefined($scope.externalTaskTable)) {
                    $scope.externalTaskTable.settings().dataset = $scope.externalTasksArray.filter(function(item) {
                    	var haystack = item.task_name + item.name + item.createdAt + item.status;
                        needle = utilityService.escapeRegExp(needle);
                        var re = new RegExp(needle, "i");
                        return haystack.search(re) > -1;
                    });
                    $scope.externalTaskTable.reload();
                }
            }
        });
        
        $scope.getUrl =  function(secId){
        	SecurityTasksService.securityTask.get({
        		securityTaskId: secId
            }, function(secTask) {
                $scope.secTask = secTask;
                $('#todo-task-modal').modal({
                    backdrop: 'static',
                    keyboard: false, 
                    show: true
            });
                $scope.getDetails(secTask);
            });
        };
        
        $scope.closeModal = function(){
        	$('#todo-task-modal').modal('hide');
        	$location.search('');
        }
      }
})();
