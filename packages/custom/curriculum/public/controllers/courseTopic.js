angular.module('mean.curriculum').controller('CourseTopicController', function ($scope, Global, $rootScope, CourseTopicService, CURRICULUM, $location, $stateParams, OnlinetestService, CourseTestService, COURSE, MESSAGES, flash, CourseService, CourseprojectService,$uibModal) {

    $scope.global = Global;
    $scope.package = {
        name: 'curriculum',
        name1: 'Course',
        modelName: 'CourseCurriculum',
        featureName: 'Courses'

    };
    $scope.SERVICE = CourseTestService;

    initializeBreadCrum($scope, $scope.package.name1, COURSE.URL_PATH.ADMIN_COURSE_LIST,'Curriculum','Course Management');

    initializeDeletePopup($scope, $scope.package.modelName, MESSAGES, $uibModal);

    initializePermission($scope, $rootScope, $location, flash, $scope.package.featureName, MESSAGES);

    initializePagination($scope, $rootScope, $scope.SERVICE);

    $scope.CURRICULUM = CURRICULUM;
    $scope.COURSE = COURSE;
    $scope.MESSAGES = MESSAGES;

    $scope.hasAuthorization = function (curriculum) {
        if (!curriculum || !curriculum.user) {
            return false;
        }
        return MeanUser.isAdmin
            || curriculum.user._id === MeanUser.user._id;
    };

    $scope.curriculumBreadCrum = function () {
        $scope.breadCrumAdd("Curriculum");
    };

    var courseId = $stateParams.courseId;
    $rootScope.courseId = $stateParams.courseId;
    $scope.isVisible = [ false, false, false ];
    $scope.curriculum = {};
    $scope.curriculum.topics = [
        {}
    ];
    $scope.curriculum.subtopic = [
        {}
    ];
    $scope.topicarray = {};

    $scope.skillLevel = [
        {
            option: "1",
            value: "1"
        },
        {
            option: "2",
            value: "2"
        },
        {
            option: "3",
            value: "3"
        },
        {
            option: "4",
            value: "4"
        },
        {
            option: "5",
            value: "5"
        }
    ];

    $scope.minitues = [
        {
            option: "0",
            value: "0"
        },
        {
            option: "30",
            value: "30"
        }
    ];

    $scope.testTypeList = [
        {
            option: "General",
            value: "General"
        },
        {
            option: "Pre-Assesement",
            value: "Pre-Assesement"
        },
        {
            option: "Post-Assesement",
            value: "Post-Assesement"

        }
    ];

    $scope.findCurriculum = function () {
        CourseTestService.coursetest.query({
            courseId: $stateParams.courseId
        }, function (curriculum) {
            $scope.collection = curriculum;
        });
    };

    $scope.selectType = [ false, false, false ];

    $scope.isMore = [ false, false, false ];
    $scope.addMore = function (index) {
        $scope.isMore[index] = true;
    };

    $scope.addC = function (add, index) {
        if (add.name == 'Test') {
            $scope.isTopicSelected = false;
            $scope.isTestSelected = true;
            $scope.isProjectSelected = false;
            $scope.addTest(index);
        } else if (add.name == 'Topic') {
            $scope.isTopicSelected = true;
            $scope.isTestSelected = false;
            $scope.isProjectSelected = false;
            $scope.addTopic(index);
        } else if (add.name == 'Project') {
            $scope.isTopicSelected = false;
            $scope.isTestSelected = false;
            $scope.isProjectSelected = true;
            $scope.addAssignment(index);
        } else {
            $scope.isTopicSelected = false;
            $scope.isTestSelected = false;
            $scope.isProjectSelected = false;
            $scope.subtopicAdd(index);
        }
        $scope.selectType[index] = false;
    };
    $scope.isSelect = true;
    $scope.curriculumArray = {};
    $scope.curriculumArray.topics = [
        {}
    ];

    $scope.addCurriculum = function (form, isValid, index) {
        if (isValid) {
            $scope.curriculumArray.topics.push({});
            $scope.isTopicSelected = true;
            $scope.isTestSelected = true;
            $scope.isProjectSelected = true;
            $scope.isMore[index] = false;
            $scope.isSelect = true;
            var urlPath = CURRICULUM.URL_PATH.CURRICULUMLIST;
            $scope.create($scope.curriculumArray.topics, urlPath, form);
            $scope.curriculumArray = {};
            $scope.curriculumArray.topics = [
                {}
            ];
            $scope.isTest[index - 1] = false;
            for (var i = 0; i < $scope.isMore.length; i++) {
                $scope.isMore[i] = false;
            }
            form = {};
        } else {
            $scope.submitted = true;
        }
    };
    $scope.addTopic = function (index) {
        $scope.isTopicSelected = true;
        $scope.isTestSelected = false;
        $scope.isProjectSelected = false;
        $scope.isMore[index] = true;
        $scope.isMore[index - 1] = false;
    };

    $scope.isEdit = [ false, false, false ];
    $scope.testEdit = [ false, false, false ];
    $scope.projectEdit = [ false, false, false ];

    $scope.editTopic = function (topicId, index) {
        $scope.isEdit[index] = true;
        $scope.selectType[index] = false;
        $scope.isMore[index] = false;
        $scope.findOne(topicId);
    };

    $scope.Testedit = function (topicId, index) {
        $scope.testEdit[index] = true;
        $scope.findOne(topicId);
    };

    //****project edit*****//*
    $scope.projectedit = function (topicId, index) {
        $scope.projectEdit[index] = true;
        $scope.findProject();
        var assignment = $scope.projects;
        var course = $scope.course.courseSkill;
        for (var i = 0; i < course.length; i++) {
            for (var j = 0; j < assignment.length; j++) {
                var project = assignment[j].requiredSkill;
                for (var k = 0; k < project.length; k++) {
                    var assign = project[k].skill;
                    var level = project[k].level;

                    var skill = course[i].skillName;
                    var pre_requistite = course[i].pre_requisite;
                    var target_value = course[i].target_value;
                    if (assign.name == skill.name && level >= pre_requistite && level <= target_value) {
                        var found = false;
                        if ($scope.assignments.length == 0) {
                            $scope.assignments
                                .push(assignment[j]);
                        } else {
                            for (var l = 0; l < $scope.assignments.length; l++) {
                                if ($scope.assignments[l]._id == assignment[j]._id) {
                                    found = true;
                                }
                            }
                            if (!found) {
                                $scope.assignments
                                    .push(assignment[j]);
                            }
                        }
                    }
                }

            }
        }
        $scope.courseProjects = $scope.assignments;
        $scope.findOne(topicId);
    };

    //****getting one topic details*****//*
    $scope.findOne = function (topicId) {
        CourseTestService.test
            .get(
            {
                coursetestId: topicId
            },
            function (topic) {
                $scope.topic = topic;
                if (topic.test) {
                    var test = topic.test;
                    var skills = test.testSkills;
                    var course = $scope.course.courseSkill;
                    for (var i = 0; i < course.length; i++) {
                        for (var k = 0; k < skills.length; k++) {
                            var skilltest = skills[k].skill;
                            var start = skills[k].complexitystart;
                            var end = skills[k].complexityend;

                            var skillcourse = course[i].skillName;
                            var pre_requistite = course[i].pre_requisite;
                            var target_value = course[i].target_value;
                            if ((skilltest == skillcourse.name) && (pre_requistite >= start && end <= target_value)) {
                                var test = {};
                                $scope.test = topic.test;
                                $scope.test.skill = skillcourse.name;
                                $scope.test.start = start;
                                $scope.test.end = end;

                            }
                        }
                    }
                    $scope.onlinetest = $scope.test;
                }
                if (topic.topic) {
                    $scope.topic = topic;
                    $scope.topic.sHr = parseInt($scope.topic.sessionHrs);
                    $scope.topic.sMin = ((parseFloat($scope.topic.sessionHrs) - $scope.topic.sHr)
                        .toFixed(2)) * 100;
                    $scope.topic.lHr = parseInt($scope.topic.labHrs);
                    $scope.topic.lMin = ((parseFloat($scope.topic.labHrs) - $scope.topic.lHr)
                        .toFixed(2)) * 100;
                    $scope.topic.aHr = parseInt($scope.topic.AssignmentHrs);
                    $scope.topic.aMin = ((parseFloat($scope.topic.AssignmentHrs) - $scope.topic.aHr)
                        .toFixed(2)) * 100;
                    $rootScope.editTopic = $scope.topic;
                }
                if (topic.project) {
                    var project = topic.project;
                    var skills = project.requiredSkill;
                    var course = $scope.course.courseSkill;
                    for (var i = 0; i < course.length; i++) {
                        for (var k = 0; k < skills.length; k++) {
                            var skilltest = skills[k].skill;
                            var level = skills[k].level;

                            var skillcourse = course[i].skillName;
                            var pre_requistite = course[i].pre_requisite;
                            var target_value = course[i].target_value;
                            if ((skilltest.name == skillcourse.name) && (level >= pre_requistite && level <= target_value)) {
                                var project = {};
                                $scope.project = topic.project;
                                $scope.project.skill = skillcourse.name;
                                $scope.project.level = level;

                            }
                        }
                    }
                    $scope.courseProject = $scope.project;
                }

            });

    };

    $scope.topicss = {};
    $scope.topicss.sMin = 0;
    $scope.topicss.lMin = 0;
    $scope.topicss.aMin = 0;
    $scope.topicss.lHr = 0;
    $scope.topicss.aHr = 0;

    $scope.create = function (curriculumArray, urlPath, form) {
        if ($scope.writePermission) {
            var collection = $scope.collection;
            var found = false;
            $scope.curriculum.topics = collection;
            for (i = 0; i < curriculumArray.length - 1; i++) {
                if (angular.equals({}, curriculumArray[i])) {
                    found = true;
                }
            }
            if (!found) {
                for (i = 0; i < curriculumArray.length - 1; i++) {
                    var length = $scope.curriculum.topics.length;
                    if (length == 0) {
                        $scope.curriculum.topics.push(curriculumArray[i]);
                    } else {
                        if (curriculumArray[i].name || curriculumArray[i].project) {
                            var lastCurriculumInList = $scope.curriculum.topics[length - 1];
                            if (lastCurriculumInList.test) {
                                if (lastCurriculumInList.testType == 'Post-Assesement') {
                                    $scope.curriculum.topics.splice(length - 1, 0, curriculumArray[i]);
                                } else {
                                    $scope.curriculum.topics.push(curriculumArray[i]);
                                }
                            } else {
                                $scope.curriculum.topics.push(curriculumArray[i]);
                            }
                        } else {
                            if (curriculumArray[i].testType == 'Pre-Assesement') {
                                $scope.curriculum.topics.splice(0, 0, curriculumArray[i]);
                            } else {
                                var lastCurriculumInList = $scope.curriculum.topics[length - 1];
                                if (lastCurriculumInList.test) {
                                    if (lastCurriculumInList.testType == 'Post-Assesement') {
                                        $scope.curriculum.topics.splice(length - 1, 0, curriculumArray[i]);
                                    } else {
                                        $scope.curriculum.topics.push(curriculumArray[i]);
                                    }
                                }

                            }
                        }
                    }
                }
                var curriculum = $scope.curriculum.topics;
                var courseId = $stateParams.courseId;
                $scope.curriculum.course = courseId;
                var curriculums = new CourseTopicService.courseTopic(
                    $scope.curriculum);
                curriculums
                    .$save(
                    function (response) {
                        urlPath = urlPath.replace(
                            ":courseId",
                            courseId);
                        flash.setMessage(
                            MESSAGES.TOPIC_ADD_SUCCESS,
                            MESSAGES.SUCCESS);
                        $location.path(urlPath);
                        $scope.findCurriculum();
                        form = {};
                        curriculumArray = {};
                        $scope.curriculum = {};
                        $scope.topicarray = {};
                    }, function (error) {
                        $scope.error = error;
                    });
            } else {
                $scope.submitted = true;
            }
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED,
                MESSAGES.ERROR);
            $location.path(MESSGAES.DASHBOARD_URL);
        }
    };

    $scope.topicSequence = [ false, false, false ];

    $scope.TopicArray = {};
    $scope.TopicArray.subtopics = [
        {}
    ];
    $scope.isSubtopic = [false, false, false];
    $scope.subtopicAdd = function (index) {
        $scope.lastCurriculum = true;
        var collection = $scope.collection;
        for (var i = 0; i < collection.length; i++) {
            if (collection[i].topic) {
                if (i == collection.length - 1) {
                    $scope.isSubtopic[index] = true;
                    $scope.isVisible[index] = true;
                    $scope.isMore[index] = false;
                    $scope.isEditSub[index] = false;
                    $scope.lastCurriculum = false;
                    $scope.SubtopicParent = collection[i].topic;
                    var topics = collection[i];
                    $scope.findSubTopics(collection[i], index);
                    $scope.ParentCurriculum = collection[i];
                    $scope.ParentCurriculum.topic.subtopic = $rootScope.subtopics;
                }
            }
        }
        if ($scope.lastCurriculum) {
            $scope.isVisible[index] = false;
            $scope.isMore[index] = true;
            var courseId = $stateParams.courseId;
            urlPath = CURRICULUM.URL_PATH.CURRICULUMLIST;
            urlPath = urlPath.replace(
                ":courseId", courseId);
            flash
                .setMessage(
                MESSAGES.CURRICULUM_NO_SUBTOPICS,
                MESSAGES.SUCCESS);
            $location.path(urlPath);
        }
    }
    $scope.addSubTopic = function (sequence, topicId, index) {
        var topicId = topicId;
        $rootScope.topicId = topicId;
        $scope.isVisible[index] = true;
        $scope.isEditSub[index] = false;
        $scope.topicSequence[sequence] = true;
    };
    $scope.topicSubtopics = function (sequence, topicId, index, form) {
        if (form.$valid) {
            $scope.TopicArray.subtopics.push({});
            $scope.isVisible[index] = true;
            $scope.isEditSub[index] = false;
            $scope.topicSequence[sequence] = true;
        } else {
            $scope.submitted = true;
        }
    }
    $scope.curriculumSubtopics = function (topics, topicId, index, form) {
        if (form.$valid) {
            $scope.TopicArray.subtopics.push({});
            $rootScope.topicId = topicId;
            var urlPath = CURRICULUM.URL_PATH.CURRICULUMLIST;
            $scope.createSubtopic(topics, $scope.TopicArray.subtopics, index,
                urlPath, form);
            $scope.topicSequence[topics.sequence] = false;
            $scope.isVisible[index] = false;
            $scope.isMore[index] = true;
            form = {};
        } else {
            $scope.submitted = true;
        }
    }

    $scope.isEditSub = [ false, false, false ];
    $scope.EditSubTopic = function (sequence, subtopicId, index) {
        $scope.isEditSub[index] = true;
        $scope.isVisible[index] = false;
        $scope.subTopicFindOne(subtopicId);
        $scope.topicSequence[sequence] = true;
        $scope.topic = $rootScope.editTopic;
    };
    $scope.isShow = [ false, false, false ];

    $rootScope.subtopics = [];
    $scope.findSubTopics = function (topics, index) {
        if (topics.topic) {
            $scope.topicId = topics.topic;
            $rootScope.parentId = topics.topic;
            $rootScope.courseId = $scope.courseId;
            CourseTopicService.subtopics.query({
                coursetopicId: $scope.topicId._id
            }, function (subtopics) {
                topics.topic.subtopic = subtopics;
                $scope.isShow[index] = true;
                $scope.curriculum.subtopic = subtopics;
                $rootScope.subtopics = subtopics;
                $rootScope.topicId = topics.topic;
                $rootScope.topicindex = index;
            });
        }
    };

    $scope.createSubtopic = function (topics, TopicArray, index, urlPath, form) {
        if ($scope.writePermission) {
            if (form.$valid) {
                $scope.curriculum.subtopic = topics.topic.subtopic;
                var subtopicList = topics.topic.subtopic;
                for (var i = 0; i < TopicArray.length; i++) {
                    if (angular.equals({}, TopicArray[i])) {
                        found = true;
                    } else {
                        $scope.curriculum.subtopic.push(TopicArray[i]);
                    }
                }
                var topic = $scope.curriculum.subtopic;
                var courseId = $stateParams.courseId;
                var topicid = $rootScope.topicId;

                for (var i = 0; i < topic.length; i++) {

                    var topicss = topic[i];
                    if (!topicss._id) {
                        if (!topicss.sMin) {
                            topicss.sMin = 0;
                        }
                        if (!topicss.lMin) {
                            topicss.lMin = 0;
                        }
                        if (!topicss.aMin) {
                            topicss.aMin = 0;
                        }
                        if (!topicss.aHr) {
                            topicss.aHr = 0;
                        }
                        if (!topicss.lHr) {
                            topicss.lHr = 0;
                        }
                        topicss.name = topic[i].name;
                        topicss.course = $rootScope.courseId;
                        topicss.parent = topics.topic._id;
                        topicss.description = topic[i].description;
                        topicss.sessionHrs = parseInt(topic[i].sHr)
                            + parseFloat((topic[i].sMin / 100));
                        topicss.labHrs = parseInt(topicss.lHr)
                            + parseFloat((topicss.lMin / 100));
                        topicss.AssignmentHrs = parseInt(topicss.aHr)
                            + parseFloat((topicss.aMin / 100));
                        delete topicss.sHr;
                        delete topicss.aHr;
                        delete topicss.lHr;
                        delete topicss.sMin;
                        delete topicss.lMin;
                        delete topicss.aMin;
                    }
                    topic[i] = topicss;
                }

                var subtopic = topic;
                subtopic.parent = $rootScope.topicId;
                $scope.curriculum.subtopic = subtopic;
                $scope.curriculum.course = courseId;
                $scope.curriculum.parent = topics.topic._id;
                $scope.topicindex = $rootScope.topicindex;
                var curriculum = new CourseTopicService.subtopiccreate(
                    $scope.curriculum);

                curriculum
                    .$save(
                    function (response) {
                        $scope.isVisible[index] = false;
                        $scope.topicSequence[topics.sequence] = false;
                        urlPath = urlPath.replace(
                            ":courseId",
                            courseId);
                        $scope.isSubtopic[index] = false;
                        flash
                            .setMessage(
                            MESSAGES.SUBTOPIC_ADD_SUCCESS,
                            MESSAGES.SUCCESS);
                        $scope.findCurriculum();
                        $location.path(urlPath);
                        form = {};
                        $scope.curriculum = {};
                    }, function (error) {
                        $scope.error = error;
                    });
            } else {
                $scope.submitted = true;
            }
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED,
                MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };

    $scope.update = function (topics, index, urlPath, form) {
        if ($scope.updatePermission) {
            if (form.$valid) {
                var curriculum = new CourseTestService.test(
                    topics);
                if (!curriculum.updated) {
                    curriculum.updated = [];
                }
                curriculum.updated.push(new Date().getTime());
                curriculum.$update({
                    coursetestId: topics._id
                }, function () {
                    $scope.isEdit[index] = false;
                    $scope.testEdit[index] = false;
                    $scope.isMore[index] = true;
                    $scope.projectEdit[index] = false;
                    $scope.findCurriculum();

                    urlPath = urlPath
                        .replace(":courseId", courseId);
                    flash.setMessage(MESSAGES.CURRICULUM_UPDATE_SUCCESS,
                        MESSAGES.SUCCESS);
                    $location.path(urlPath);
                }, function (error) {
                    $scope.error = error;
                });
            } else {
                $scope.submitted = true;
            }
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED,
                MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }

    };

    $scope.updateSubtopic = function (sequence, index, urlPath, isValid) {
        if ($scope.updatePermission) {
            if (isValid) {
                var topic = $scope.topic;
                $scope.parentTopic = $rootScope.parentId;
                var courseId = topic.course;
                $scope.topic.sessionHrs = parseInt(topic.sHr)
                    + parseFloat((topic.sMin / 100));
                var courseId = $rootScope.courseId;
                var topic = $scope.topic;
                $scope.topic.sessionHrs = parseInt(topic.sHr)
                    + parseFloat((topic.sMin / 100));
                $scope.topic.labHrs = parseInt(topic.lHr)
                    + parseFloat((topic.lMin / 100));
                $scope.topic.AssignmentHrs = parseInt(topic.aHr)
                    + parseFloat((topic.aMin / 100));

                var topic = new CourseTopicService.topic(
                    $scope.topic);
                if (!topic.updated) {
                    topic.updated = [];
                }
                topic.updated.push(new Date().getTime());
                topic.$update({
                    topicId: $stateParams.topicId
                }, function () {
                    $scope.isEditSub[index] = false;
                    $scope.isMore[index] = true;
                    $scope.topicSequence[sequence] = false;
                    urlPath = urlPath.replace(":courseId",
                        courseId);
                    $scope.findCurriculum();
                    $scope.topicindex = $rootScope.topicindex;
                    $scope.findSubTopics($scope.parentTopic, $scope.topicindex);
                    flash.setMessage(MESSAGES.SUBTOPIC_UPDATE_SUCCESS, MESSAGES.SUCCESS);
                    $location.path(urlPath);
                }, function (error) {
                    $scope.error = error;
                });
            } else {
                $scope.submitted = true;
            }
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED,
                MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };

    $scope.remove = function (topic) {
        if ($scope.deletePermission) {
            if (!topic.parent) {
                var coursetest = new CourseTestService.test(
                    topic);
                coursetest
                    .$remove(function (response) {
                        $('#deletePopup').modal("hide");
                        $scope.findCurriculum();
                        urlPath = CURRICULUM.URL_PATH.CURRICULUMLIST;
                        flash
                            .setMessage(
                            MESSAGES.CURRICULUM_DELETE_SUCCESS,
                            MESSAGES.SUCCESS);
                        urlPath = urlPath.replace(
                            ":courseId", courseId);
                        $location.path(urlPath);

                    });
            } else {
                var topic = new CourseTopicService.topic(topic);
                topic
                    .$remove(function (response) {
                        $('#deletePopup').modal("hide");
                        $scope.findCurriculum();
                        $scope.parentTopic = $rootScope.parentId;
                        $scope.topicindex = $rootScope.topicindex;
                        $scope.findSubTopics(
                            $scope.parentTopic,
                            $scope.topicindex);
                        urlPath = CURRICULUM.URL_PATH.CURRICULUMLIST;
                        flash
                            .setMessage(
                            MESSAGES.CURRICULUM_DELETE_SUCCESS,
                            MESSAGES.SUCCESS);
                        urlPath = urlPath.replace(
                            ":courseId", courseId);
                        $location.path(urlPath);

                    });
            }
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED,
                MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };
    $scope.findCourse = function () {
        CourseService.course.get({
            courseId: $stateParams.courseId
        }, function (course) {
            $scope.course = course;
            $scope.courseSkill = [];
            for (i = 0; i < course.courseSkill.length; i++) {
                var Skill = course.courseSkill[i];
                $scope.courseSkill[i] = Skill.skillName;
            }
            $scope.findTest();
        });
    };

    $scope.testlist = [];
    //getting all tests for course
    $scope.findTest = function () {
        OnlinetestService.onlinetest
            .query(function (collection) {
                $scope.test = collection;
                var course = $scope.course.courseSkill;
                for (var i = 0; i < course.length; i++) {
                    for (var j = 0; j < $scope.test.length; j++) {
                        var tests = $scope.test[j].testSkills;
                        for (var k = 0; k < tests.length; k++) {
                            var skillcourse = course[i].skillName;
                            var pre_requistite = course[i].pre_requisite;
                            var target_value = course[i].target_value;
                            var start = tests[k].complexityend;
                            var end = tests[k].complexitystart;

                            if ((tests[k].skill == skillcourse.name) && (pre_requistite >= start && end <= target_value)) {
                                var courseTest = {};
                                courseTest.test = $scope.test[j];
                                courseTest.skill = skillcourse.name;
                                courseTest.start = start;
                                courseTest.end = end;

                                $scope.testlist
                                    .push(courseTest);
                            }

                        }
                    }
                }
                $scope.onlinetests = $scope.testlist;
            });
    };

    $scope.isTest = [ false, false, false ];
    $scope.addTest = function (index) {
        $scope.isTest[index] = true;
        $scope.isMore[index] = false;
    };


    $scope.createTest = function (testarray, index, urlPath, form) {
        if ($scope.writePermission) {
            if (form.$valid) {
                var collection = $scope.collection;
                $scope.curriculum.topics = collection;
                $scope.curriculum.topics.splice(index, 0,
                    testarray);
                var courseId = $stateParams.courseId;
                $scope.curriculum.course = courseId;
                var curriculum = new CourseTestService.coursetest(
                    $scope.curriculum);
                curriculum
                    .$save(
                    function (response) {
                        $scope.selectType[index] = false;
                        for (var i = 0; i < $scope.isAssignment.length; i++) {
                            $scope.isAssignment[i] = false;
                        }
                        for (var i = 0; i < $scope.isTest.length; i++) {
                            $scope.isTest[i] = false;
                        }
                        urlPath = urlPath.replace(
                            ":courseId",
                            $scope.courseId);
                        flash
                            .setMessage(
                            MESSAGES.TOPIC_ADD_SUCCESS,
                            MESSAGES.SUCCESS);
                        $scope.findCurriculum();
                        $scope.curriculum = {};
                        $scope.test.test = {};
                        $scope.test.project = {};
                    }, function (error) {
                        $scope.error = error;
                    });
            } else {
                $scope.submitted = true;
            }
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED,
                MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };

    $scope.findProject = function () {
        CourseprojectService.courseproject.query(function (collection) {
            $scope.projects = collection;
        });
    };
    $scope.isAssignment = [ false, false, false ];
    $scope.assignments = [];
    $scope.addAssignment = function (index) {
        $scope.isAssignment[index] = true;
        $scope.isMore[index] = false;
        $scope.findProject();
        var assignment = $scope.projects;
        var course = $scope.course.courseSkill;
        for (var i = 0; i < course.length; i++) {
            for (var j = 0; j < assignment.length; j++) {
                var project = assignment[j].requiredSkill;
                for (var k = 0; k < project.length; k++) {
                    var assign = project[k].skill;
                    var level = project[k].level;

                    var skill = course[i].skillName;
                    var pre_requistite = course[i].pre_requisite;
                    var target_value = course[i].target_value;
                    if (assign.name == skill.name && level >= pre_requistite && level <= target_value) {
                        var found = false;
                        var courseProject = {};
                        courseProject.skill = skill.name;
                        courseProject.level = level;

                        if ($scope.assignments.length == 0) {
                            courseProject.project = assignment[j];
                            $scope.assignments
                                .push(courseProject);
                        } else {
                            for (var l = 0; l < $scope.assignments.length; l++) {
                                if ($scope.assignments[l]._id == assignment[j]._id) {
                                    found = true;
                                }
                            }
                            if (!found) {
                                courseProject.project = assignment[j];
                                $scope.assignments
                                    .push(courseProject);
                            }
                        }
                    }
                }

            }
        }
        $scope.courseProjects = $scope.assignments;
    };

    $scope.subTopicFindOne = function (topicId) {
        CourseTopicService.topic
            .get(
            {
                coursetopicId: topicId
            },
            function (topic) {
                $scope.topic = topic;
                $scope.topic.sHr = parseInt($scope.topic.sessionHrs);
                $scope.topic.sMin = ((parseFloat($scope.topic.sessionHrs) - $scope.topic.sHr)
                    .toFixed(2)) * 100;
                $scope.topic.lHr = parseInt($scope.topic.labHrs);
                $scope.topic.lMin = ((parseFloat($scope.topic.labHrs) - $scope.topic.lHr)
                    .toFixed(2)) * 100;
                $scope.topic.aHr = parseInt($scope.topic.AssignmentHrs);
                $scope.topic.aMin = ((parseFloat($scope.topic.AssignmentHrs) - $scope.topic.aHr)
                    .toFixed(2)) * 100;
                $rootScope.editTopic = $scope.topic;
            });

    };

    $scope.removeSubtopic = function (subtopic) {
        var index = $scope.TopicArray.subtopics
            .indexOf(subtopic);
        $scope.TopicArray.subtopics.splice(index, 1);
    };
    $scope.cancel = function (urlPath) {
        var courseId = $stateParams.courseId;
        urlPath = urlPath.replace(":courseId", courseId);
        $scope.findCurriculum();
        $location.path(urlPath);
    };


});
