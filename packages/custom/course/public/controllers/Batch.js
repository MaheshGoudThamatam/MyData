'use strict';
/* jshint -W098 */
angular.module('mean.course').controller('BatchController', function ($scope, $stateParams, Global, BATCHService, $location, $rootScope, COURSE, flash, MESSAGES, $timeout, BRANCH, uiCalendarConfig, $compile,$uibModal,$translate) {
    $scope.global = Global;
    $scope.package = {
        name: 'Course',
        name1: 'Branch',
        modelName: 'Batch',
        featureName: 'Batches'
    };
    $scope.COURSE = COURSE;
    $scope.MESSAGES = MESSAGES;
    $scope.batch = {};
    $scope.batch.mentor = [];
    if ($rootScope.courseobj) {
        $scope.courseObj = $rootScope.courseobj;
        initializeBreadCrum($scope, $scope.package.name, COURSE.URL_PATH.ADMIN_COURSE_LIST, 'Batches','Course Management');
    } else if ($rootScope.branchobj) {
        initializeBreadCrum($scope, $scope.package.name1, BRANCH.URL_PATH.LISTBRANCH.replace(':cityId', $rootScope.branchobj.city), 'Batches','Location Management');
    }
    initializePagination($scope, $rootScope, BATCHService);
    initializePermission($scope, $rootScope, $location, flash, $scope.package.featureName, MESSAGES);
    initializeDeletePopup($scope, $scope.package.modelName, MESSAGES,$uibModal);
    $scope.hasAuthorization = function (batch) {
        if (!batch || !batch.user) {
            return false;
        }
        return MeanUser.isAdmin || batch.user._id === MeanUser.user._id;
    };

    /** <Desc : Array defined for hours>
     * @ PARAMS: <>, ...
     * @ RETURNS: <Array of objects/ hrs>
     * @ <Mahesh> <16-feb-2016> <description of change>
     **/
    $scope.hrsArray = function() {
            $scope.timeinhrs = [{
                option: 'HH',
                value: 'MM'
            }];
            for (var i = 0; i < 24; i++) {
                $scope.hrsMins = {
                    option: ('00' + i).slice(-2),
                    value: ('00' + i).slice(-2)
                };
                $scope.timeinhrs.push($scope.hrsMins);
            }
        }
        /** <Desc : List page Breadcrumb function based on the page reached from either branches or courses>
         * @ PARAMS: <>, ...
         * @ RETURNS: <Braedcrumbs>
         * @ <Mahesh> <16-feb-2016> <description of change>
         **/
    $scope.listBreadcrumb = function() {
        if ($scope.readPermission) {
            if ($rootScope.courseobj) {
                $scope.usersBasedonCourseSkills();
                $scope.cobj = $rootScope.courseobj;
                $scope.courseId = $rootScope.courseobj._id
                $scope.breadCrumAddUrl($scope.package.modelName, COURSE.URL_PATH.ADMIN_BATCH_LIST.replace(':courseId', $scope.courseId), $scope.courseId, $scope.courseId);
                $scope.breadCrumAppend("List");
            } else if ($rootScope.branchobj) {
                $scope.branchId = $rootScope.branchobj._id;
                $scope.breadCrumAddUrl($scope.package.modelName, COURSE.URL_PATH.ADMIN_BATCH_LIST.replace(':courseId', $scope.branchId), $scope.branchId, $scope.branchId);
            }
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };

    /** <Desc : Fetching mentors based on course skills>
     * @ PARAMS: <course Skills array>, ...
     * @ RETURNS: <Array of objects/ Users from user table>
     * @ <Mahesh> <16-feb-2016> <description of change>
     **/
    $scope.usersBasedonCourseSkills = function() {
        $scope.cobj = $rootScope.courseobj;
        $scope.courseId = $rootScope.courseobj.courseSkill;
        var courseIdlist = [];
        for (var i = 0; i < $rootScope.courseobj.courseSkill.length; i++) {
            courseIdlist.push($rootScope.courseobj.courseSkill[i]._id);
        }
        var adddetails = {};
        adddetails.courseIdlist = courseIdlist;
        BATCHService.UsersonCourseSkills.query({
            'courseIdArray': adddetails
        }, function(response) {
            $rootScope.mentors = response;
        }, function(error) {
            $scope.error = error;
        });
    };
    $scope.create = function (urlPath, isValid) {
        if ($scope.writePermission) {
            if (isValid) {
                if ($rootScope.courseobj) {
                    var coursesId = $rootScope.courseobj._id;
                    $scope.batch.course = $rootScope.courseobj._id;
                } else if ($rootScope.branchobj) {
                    var branchId = $rootScope.branchobj._id;
                    $scope.batch.branch = $rootScope.branchobj._id;
                }
                var batch = new BATCHService.batch($scope.batch);
                $scope.breadCrumAdd("Create");
                batch.$save(function (response) {
                    if ($rootScope.courseobj) {
                        urlPath = urlPath.replace(":courseId", coursesId);
                        flash.setMessage(MESSAGES.BATCH_ADD_SUCCESS, MESSAGES.SUCCESS);
                        $location.path(urlPath);
                    } else if ($rootScope.branchobj) {
                        urlPath = urlPath.replace(":courseId", branchId);
                        flash.setMessage(MESSAGES.BATCH_ADD_SUCCESS, MESSAGES.SUCCESS);
                        $location.path(urlPath);
                    }
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
    
    $scope.remove = function (Batch) {
        if (Batch && $scope.deletePermission) {
            var Batch = new BATCHService.batch(Batch);
            Batch.$remove(function (response) {
                deleteObjectFromArray($scope.collection, Batch);
                $('#deletePopup').modal("hide");
                flash.setMessage(MESSAGES.BATCH_DELETE_SUCCESS, MESSAGES.SUCCESS);
            });
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };
    
    $scope.update = function (urlPath, isValid) {
        if ($scope.updatePermission) {
            if (isValid) {
                if ($rootScope.courseobj) {
                    var coursesId = $rootScope.courseobj._id;
                    $scope.batch.course = $rootScope.courseobj._id;
                } else if ($rootScope.branchobj) {
                    var branchId = $rootScope.branchobj._id;
                    $scope.batch.branch = $rootScope.branchobj._id;
                }
                var batch = $scope.batch;
                if (!batch.updated) {
                    batch.updated = [];
                }
                batch.updated.push(new Date().getTime());
                batch.$update(function(response) {
                    if ($rootScope.courseobj) {
                        urlPath = urlPath.replace(":courseId", coursesId);
                        flash.setMessage(MESSAGES.BATCH_UPDATE_SUCCESS, MESSAGES.SUCCESS);
                        $location.path(urlPath);
                    } else if ($rootScope.branchobj) {
                        urlPath = urlPath.replace(":courseId", branchId);
                        flash.setMessage(MESSAGES.BATCH_UPDATE_SUCCESS, MESSAGES.SUCCESS);
                        $location.path(urlPath);
                    }
                });
            }else {
                $scope.submitted = true;
            }
        }else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };
    
    $scope.newBatch = function () {
        $location.path('/admin/batch/create');
    }

    $scope.cancel = function(urlPath) {
            if ($rootScope.courseobj) {
                urlPath = urlPath.replace(":courseId", $rootScope.courseobj._id);
            } else if ($rootScope.branchobj) {
                urlPath = urlPath.replace(":courseId", $rootScope.branchobj._id);
            }
            $location.path(urlPath);
        }
        /** <Desc : Fetching branches based on course id>
         * @ PARAMS: <Course Id>, ...
         * @ RETURNS: <Array of objects/ branches>
         * @ <Mahesh> <16-feb-2016> <description of change>
         **/
    $scope.branchesBasedOnCourse = function() {
        $scope.cobj = $rootScope.courseobj;
        $scope.courseId = $rootScope.courseId;
        BATCHService.branchCourses.query({
            courseId: $scope.courseId
        }, function(branches) {
            $scope.brancheslist = branches;
        });
    };

    $scope.events = [];
    $scope.eventSources = [$scope.events];
    
    $scope.eventsMap = {};
    $scope.eventsST = {};
    $scope.eventsET = {};
    $scope.eventsET = {};

    $scope.findOne = function () {
        $scope.hrsArray();      
        if ($scope.updatePermission) {
            BATCHService.batch.get({
                batchId: $stateParams.batchId
            }, function (batch) {
                $scope.batch = batch;
                /** <Displays Batch Session(Project, Topic, Test) Events in the calendar >
                 * @ PARAMS: <>, <>, ...
                 * @ RETURNS: <>
                 * @ <Anto Steffi> <17-02-16> 
               **/
               
                var eventID = 0;
                for (var i = 0; i < $scope.batch.schedule.length; i++) {
                    var entry = $scope.batch.schedule[i];
                    var event = {
                        start: new Date(entry.startDate),                   
                        stick: true,
                        allDay: true
                    };

                    eventID = eventID + 1;                    

                    if (entry.test) {
                        event.title = 'Test';
                        event.startTime ='Start Time';
                        event.endTime ='End Time'   
                        	event.id = eventID;
                    } else if (entry.project) {
                        event.title = 'Project';
                        event.startTime ='ST';
                        event.endTime ='ET'
                        	event.id = eventID;
                    } else if(entry.topic) {
                        event.title = 'Topic';
                        event.id = eventID;
                        
                    }
                  
                    $scope.events.push(event);                   
                    $scope.eventsMap[event.id] = entry;
                    $scope.eventsST[event.startTime] = entry;
                    $scope.eventsET[event.endTime] = entry;
                }           

            });
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };
    $scope.editbatch = function (urlPath, id) {
        urlPath = urlPath.replace(":batchId", id);
        $location.path(urlPath);
    };
    $scope.createBatchBreadCrumbs = function () {
        $scope.hrsArray();
        if ($rootScope.courseobj) {
            $scope.courseId = $rootScope.courseobj._id
            $scope.breadCrumAddUrl($scope.package.modelName, COURSE.URL_PATH.ADMIN_BATCH_LIST.replace(':courseId', $scope.courseId), $scope.courseId, $scope.courseId);
        } else if ($rootScope.branchobj) {
            $scope.branchId = $rootScope.branchobj._id
            $scope.breadCrumAddUrl($scope.package.modelName, COURSE.URL_PATH.ADMIN_BATCH_LIST.replace(':courseId', $scope.branchId), $scope.branchId, $scope.branchId);
        }
        $scope.breadCrumAppend("Create");
    };

    /** <Desc : edit page Breadcrumb function based on the page reached from either branches or courses>
     * @ PARAMS: <>, ...
     * @ RETURNS: <Braedcrumbs>
     * @ <Mahesh> <16-feb-2016> <description of change>
     **/
    $scope.editBatchBread = function() {
        if ($rootScope.courseobj) {
            $scope.courseId = $rootScope.courseobj._id
            $scope.breadCrumAddUrl($scope.package.modelName, COURSE.URL_PATH.ADMIN_BATCH_LIST.replace(':courseId', $scope.courseId), $scope.courseId, $scope.courseId);
        } else if ($rootScope.branchobj) {
            $scope.branchId = $rootScope.branchobj._id
            $scope.breadCrumAddUrl($scope.package.modelName, COURSE.URL_PATH.ADMIN_BATCH_LIST.replace(':courseId', $scope.branchId), $scope.branchId, $scope.branchId);
        }
        $scope.breadCrumAppend("Edit");
    };
    $scope.viewBatchBread = function () {
        $scope.courseId = $rootScope.courseobj._id
        $scope.breadCrumAddUrl($scope.package.modelName, COURSE.URL_PATH.ADMIN_BATCH_LIST.replace(':courseId', $scope.courseId), $scope.courseId, $scope.courseId);
        $scope.breadCrumAppend("View");
    };
    /** <Desc : While creation to get time in minutes>
     * @ PARAMS: <>, ...
     * @ RETURNS: <mins time>
     * @ <Mahesh> <16-feb-2016> <description of change>
     **/
    $scope.timeinmins = [{
        option: '00',
        value: '00'
    }, {
        option: '15',
        value: '15'
    }, {
        option: '30',
        value: '30'
    }, {
        option: '45',
        value: '45'
    }];
    $scope.batch.batchTimings = {};
    $scope.batch.batchTimings.mon = [{}];
    $scope.batch.batchTimings.tue = [{}];
    $scope.batch.batchTimings.wed = [{}];
    $scope.batch.batchTimings.thu = [{}];
    $scope.batch.batchTimings.fri = [{}];
    $scope.batch.batchTimings.sat = [{}];
    $scope.batch.batchTimings.sun = [{}];
    /** <Desc : Adding batch timings to a days >
     * @ PARAMS: <Day Array>, ...
     * @ RETURNS: <>
     * @ <Mahesh> <16-feb-2016> <description of change>
     **/
    $scope.addbatchtimingsrow = function(timeArray) {
        timeArray.push({});
    };
    /** <Desc : Removing batch timings to a days >
     * @ PARAMS: <Day Array>,<index> ...
     * @ RETURNS: <>
     * @ <Mahesh> <16-feb-2016> <description of change>
     **/
    $scope.removebatchtimingsrow = function(index, timeArray) {
        timeArray.splice(index, 1);
    };
    /** <Desc : To check/validate batch start date >
     * @ PARAMS: <date>, ...
     * @ RETURNS: <Error value/msg>
     * @ <Mahesh> <16-feb-2016> <description of change>
     **/
    $scope.checkError = function(start_date) {
        $scope.Lesserstartvalue = false;
        var curDate = new Date();
        $scope.start_date = $scope.batch.start_date;
        if ($scope.start_date < curDate) {
            $scope.Lesserstartvalue = true;
            $timeout(function () {
                $scope.Lesserstartvalue = false;
            }, 6000);
        } else {
            $scope.Lesserstartvalue = false;
        }
    };
    /** <Desc : counstructing a time object>
     * @ PARAMS: <day ,index>, ...
     * @ RETURNS: <Time object>
     * @ <Mahesh> <16-feb-2016> <description of change>
     **/
    $scope.formatTime = function(day, index) {
        $scope.timeCalculation = [];
        if (day[index].startHH && day[index].startMM && day[index].endHH && day[index].endMM) {
            day[index].start_time = (day[index].startHH + ":" + day[index].startMM + ":00");
            day[index].end_time = (day[index].endHH + ":" + day[index].endMM + ":00");
            var m = moment(day[index].start_time, moment.ISO_8601);
            m.format('HH:mm:ss');
            var m1 = moment(day[index].end_time, moment.ISO_8601);
            m1.format('HH:mm:ss');
            day.dateErr = false;
            $scope.timeCalculation.push(m1._i);
            if (m1._i > m._i) {
                day.dateErr = false;
            } else {
                day.dateErr = true;
            }
        }
    };
    $scope.branchFilter = function (branchId) {
        $scope.batch.branch = branchId;
    };
    $scope.listBatches = function () {
        $scope.currentPage = 1;
        $scope.currentPageSize = 10;
        var query = {};
        query.page = $scope.currentPage;
        query.pageSize = $scope.currentPageSize;
        if ($rootScope.courseobj) {
            $scope.courseObj = $rootScope.courseobj;
            query.course = $stateParams.courseId;
            $rootScope.courseId = $stateParams.courseId;
        } else if ($rootScope.branchobj) {
            query.branch = $stateParams.courseId;
        }
        $scope.loadPagination(query);
    }
    $scope.batchList = function (urlPath, course) {
        if ($rootScope.branchobj) {
            delete $rootScope.branchobj;
        }
        $rootScope.courseobj = course;
        urlPath = urlPath.replace(":courseId", course._id);
        $location.path(urlPath);
    };
        /** <Desc : Adding a mentor to batch object>
     * @ PARAMS: <mentor>, ...
     * @ RETURNS: <Array>
     * @ <Mahesh> <18-feb-2016> <description of change>
     **/
    $scope.addMentor = function(mentor) {
        var found = false;
        var foundIndex = -1;
        for (var i = 0; i < $scope.batch.mentor.length; i++) {
            if ($scope.batch.mentor[i] === mentor._id) {
                found = true;
                foundIndex = i;
            }
        }
        if (found) {
            $scope.batch.mentor.splice(foundIndex, 1);
        } else {
            $scope.batch.mentor.push(mentor._id);
        }
    };
    /** <Desc : Editing a mentor to batch object>
     * @ PARAMS: <mentor>, ...
     * @ RETURNS: <Array>
     * @ <Mahesh> <19-feb-2016> <description of change>
     **/
    $scope.editMentor = function(mentor) {
        var found = false;
        var foundIndex = -1;
        for (var i = 0; i < $scope.batch.mentor.length; i++) {
            if ($scope.batch.mentor[i]._id === mentor._id) {
                found = true;
                foundIndex = i;
            }
        }
        if (found) {
            $scope.batch.mentor.splice(foundIndex, 1);
        } else {
            $scope.batch.mentor.push(mentor._id);
        }
    };
    /** <Calendar Config, Batch Schedule Events Pop Up, Tooltip for events in calendar >
     * @ PARAMS: <Test>, <Topic>,<Project>
     * @ RETURNS: <Displays topic, test and project with name and start date>
     * @ <Anto Steffi> <17-02-16> 
   **/
    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();
    $scope.calendar = {};
    
    $scope.eventClick = function (date, jsEvent, view) {
    
        $scope.selectedEvent = $scope.eventsMap[date.id];
        $scope.selectedEvent.title = date.title; 
        $scope.selectedEventT = $scope.eventsST[date.startTime];
        $scope.selectedEventT.startTime = date.startTime; 
        $scope.selectedEventET = $scope.eventsET[date.endTime];
        $scope.selectedEventET.endTime = date.endTime;
        $scope.showEvent = true;
  
    }
    
    $scope.eventRender = function (event, element, view) {
        element.attr({
            'tooltip': event.title,
            'tooltip-append-to-body': true
        });
        $compile(element)($scope);
    };
    
    $scope.uiConfig = {
        calendar: {
            height: 100,
            editable: true,
            header: {
                left: 'title',
                right: 'today prev,next'
            },        
            eventClick: $scope.eventClick,
            eventRender: $scope.eventRender
           
        }
    };

    $scope.selectedEvent = {};
    $scope.showEvent = false;
    
    /** <Displays topic, test and project with session details in a table >
     * @ PARAMS: <Test>, <Topic>,<Project>
     * @ RETURNS: <Displays topic, test and project with session details>
     * @ <Anto Steffi> <18-02-16> 
   **/
    $scope.getSessionType=function(session){
    	 if (session.test){
    		var TestName = session.test.name;
    		var StartDate = session.startDate;
    		var EndDate = session.endDate;
    		var StartTime = session.test.slots[0].slot.startTime;
    		var EndTime = session.test.slots[0].slot.endTime;
    		return {
    			TestName: TestName,
    			StartDate: StartDate,
    			EndDate: EndDate,
    			StartTime: StartTime,
    			EndTime: EndTime
    			
    		};	
    		
    	}
    	else if (session.project)
    		{
    	    var ProjectName = session.project.projectName;
    		var StartDate = session.startDate;
    		var EndDate = session.endDate;
    		var StartTime = session.project.slots[0].slot.startTime;
    		var EndTime = session.project.slots[0].slot.endTime;
    		return {
    			ProjectName: ProjectName,
    			StartDate: StartDate,
    			EndDate: EndDate,
    			StartTime: StartTime,
    			EndTime: EndTime
    			
    		};
    		}
    	else{
    		var TopicName = session.topic.name;
    		var StartDate = session.startDate;
    		var EndDate = session.endDate;
    		return {
    			TopicName: TopicName,
    			StartDate: StartDate,
    			EndDate: EndDate
    			
    			};
    	}
    };

    /** <To check mentors whether exists are not>
     * @ PARAMS: <mentor object>
     * @ RETURNS: <Boolean value>
     * @ <Mahesh> <19-02-16> 
   **/
    $scope.checkMentors = function(mentor){
        var found = false;
        for (var i = 0; i < $scope.batch.mentor.length; i++) {
            if ($scope.batch.mentor[i]._id === mentor._id) {
                found = true;
                return found;
            }
        }
    };
        /** <To find mentors for course selected>
     * @ PARAMS: <>
     * @ RETURNS: <array of mentors>
     * @ <Mahesh> <19-02-16> 
   **/
    $scope.getMentors = function(){
        $scope.courseMentors = $scope.batch.course;
        $scope.courseId = $scope.batch.course;
        var courseIdlist = [];
        for (var i = 0; i < $scope.batch.course.courseSkill.length; i++) {
            courseIdlist.push($scope.batch.course.courseSkill[i]._id);
        }
        var adddetails = {};
        adddetails.courseIdlist = courseIdlist;
        BATCHService.UsersonCourseSkills.query({
            'courseIdArray': adddetails
        }, function(response) {
            $rootScope.mentors = response;
        }, function(error) {
            $scope.error = error;
        });
    };

});