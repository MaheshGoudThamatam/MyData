'use strict';
/* jshint -W098 */
angular.module('mean.course').controller(
    'ChapterController', function ($scope, Global, ChapterService, $stateParams, PROFILE, flash, MESSAGES, $location, $rootScope, COURSE, $uibModal,SkillService, $attrs,$translate) {
        $scope.global = Global;
        $scope.SERVICE = ChapterService;
        $scope.PROFILE = PROFILE;
        $scope.COURSE = COURSE;
        $scope.package = {
            name: 'Course Material',
            modelName: 'Course Material',
            featureName : 'Course Material'
        };

        initializeDeletePopup($scope, $scope.package.modelName, MESSAGES,$uibModal);
        initializeBreadCrum($scope, $scope.package.modelName,COURSE.URL_PATH.COURSEMATERIALTITLELIST,'Course Chapter','Course Management');
        initializePermission($scope, $rootScope, $location, flash, $scope.package.featureName, MESSAGES);

        $scope.testwidth = function() {
            $('.tooltip-inner').css("max-width", 600);
            $('.tooltip-inner').width(600);
        }

        // BreadCrumbs for Course chapter
        $scope.listMaterial = function() {
            $scope.breadCrumAdd("List");
        };

        $scope.createMaterialBreadcrum = function() {
            $scope.breadCrumAdd("Create");
        };

        $scope.editMaterial = function() {
            $scope.breadCrumAdd("Edit");
        };

        $scope.viewMaterial = function() {
            $scope.breadCrumAdd("View");
        };

        $scope.loadSkill = function () {
            SkillService.skill.query(function (skills) {
                $scope.skills = skills;
            });
        };

        $scope.materialList =function(){
            ChapterService.materialList.query(function(materials){
                $scope.materials = materials;
            })
        };

        $scope.skillLevel = [ {
                        option : "1",
                        value : "1"
                    }, {
                        option : "2",
                        value : "2"
                    }, {
                        option : "3",
                        value : "3"
                    }, {
                        option : "4",
                        value : "4"
                    }, {
                        option : "5",
                        value : "5"
                    } ];

        $scope.findMaterialList = function() {
            $scope.chaptersList = [];
            ChapterService.materialTitle.query({materialTitleId: $stateParams.materialTitleId},function(material){
                $scope.material = material;
                $scope.chaptersList.push($scope.material.childId);
                $scope.chaptersList = $scope.chaptersList[0];
            });
        };

        $scope.findOne = function() {
            if ($scope.updatePermission) {
                if ($stateParams.chapterId){
                    var Id = $stateParams.chapterId;
                } else
                if ($stateParams.lessonId){
                    var Id = $stateParams.lessonId;
                } else
                if ($stateParams.topicId){
                    var Id = $stateParams.topicId;
                } else
                if ($stateParams.subTopicId){
                    var Id = $stateParams.subTopicId;
                }
                ChapterService.materialTitle.query({materialTitleId: $stateParams.materialTitleId},function(material){
                    $scope.material = material;
                    if (Id == undefined){
                        $scope.materialOne = $scope.material;
                    } else
                    if (Id != undefined){
                        if ($stateParams.subTopicId == undefined) {
                            ChapterService.materialEdit.query({
                                materialId: Id
                            }, function(materialOne) {
                                $scope.materialOne = materialOne;
                            });
                        } else if ($stateParams.subTopicId){
                            ChapterService.subTopicDetails.query({subTopicId:Id},function(subTopic){
                                $scope.materialOne = subTopic;
                            });
                        }
                    }
                });
            } else {
                flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
                $location.path(MESSAGES.DASHBOARD_URL);
            }
        };

        $scope.cancelTitle = function(materialOne){
            if ($stateParams.chapterId){
                var Id = $stateParams.chapterId;
            } else
            if ($stateParams.lessonId){
                var Id = $stateParams.lessonId;
            } else
            if ($stateParams.topicId){
                var Id = $stateParams.topicId;
            } else
            if ($stateParams.subTopicId){
                var Id = $stateParams.subTopicId;
            }
            if (materialOne._id == Id){
                $scope.editUrl(COURSE.URL_PATH.COURSEMATERIALTITLELIST, $stateParams.materialTitleId, null, null, null, null);
            } else
            if (materialOne._id != Id){
                $scope.editUrl(COURSE.URL_PATH.COURSEMATERIALVIEW, $stateParams.materialTitleId,null,null,null,null);
            }
        };

        $scope.materialIndex = function(materialTitleId){
            $scope.editUrl(COURSE.URL_PATH.COURSEMATERIALVIEW, materialTitleId, null,null,null,null);
        };

        $scope.addMaterial = function(){
            $scope.editUrl(COURSE.URL_PATH.COURSEMATERIAL, null);
        };

        $scope.cancelMaterial = function(){
            $scope.editUrl(COURSE.URL_PATH.COURSEMATERIALTITLELIST, $stateParams.materialTitleId, null, null, null, null);  
        }

        $scope.cancelMaterialView = function(){
            $scope.newMaterial.chapters = [];
                $scope.submitButton = false;
        }

        $scope.createMaterial = function(materials,isValid,materialId) {
            if ($scope.writePermission) {
                if (isValid) {
                    var material = new ChapterService.material(materials);
                    if (materialId){material.parent = materialId;}
                    material.$save({
                    }, function(response) {
                        $scope.material = {};
                        flash.setMessage(MESSAGES.MATERIAL_ADD_SUCCESS,MESSAGES.SUCCESS);
                        $scope.editUrl(COURSE.URL_PATH.COURSEMATERIALTITLELIST,null);
                    }, function(error) {
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

        $scope.remove = function(Material) {
            if($scope.deletePermission){
                if (Material.title) {
                    var material = new ChapterService.materialTitle(Material);
                    material.$remove({materialTitleId: material._id},function(response) {
                        for (var i in $scope.materials) {
                            if ($scope.materials[i] === Material) {
                                $scope.materials.splice(i, 1);
                            }
                        }
                        $('#deletePopup').modal("hide");
                        flash.setMessage(MESSAGES.CHAPTER_DELETE_SUCCESS,MESSAGES.SUCCESS);
                    });
                }
                if (Material.level) {
                    var material = new ChapterService.materialEdit(Material);
                    material.$remove({materialId: material._id},function(response) {
                        if (Material.level == 'chapter') {
                            for (var i in $scope.chaptersList) {
                                if ($scope.chaptersList[i] === Material) {
                                    $scope.chaptersList.splice(i, 1);
                                }
                            }
                            $('#deletePopup').modal("hide");
                            flash.setMessage(MESSAGES.CHAPTER_DELETE_SUCCESS,MESSAGES.SUCCESS);
                        } else 
                        if (Material.level == 'lesson') {
                            $scope.findMaterialList();
                            $('#deletePopup').modal("hide");
                            flash.setMessage(MESSAGES.LESSON_DELETE_SUCCESS,MESSAGES.SUCCESS);
                        } else 
                        if (Material.level == 'topic') {
                            $scope.findMaterialList();
                            $('#deletePopup').modal("hide");
                            flash.setMessage(MESSAGES.TOPIC_DELETE_SUCCESS,MESSAGES.SUCCESS);
                        }
                    });
                } else
                if (Material.topic){
                    var material = new ChapterService.subTopicDetails(Material);
                    material.$remove({subTopicId: material._id},function(response) {
                        $scope.findMaterialList();
                        $('#deletePopup').modal("hide");
                        flash.setMessage(MESSAGES.SUBTOPIC_DELETE_SUCCESS,MESSAGES.SUCCESS);
                    });
                };
            }else {
                flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
                $location.path(MESSAGES.DASHBOARD_URL);
            }
        };

        $scope.updateCourseMaterial = function(isValid) {
            if ($scope.updatePermission) {
                if (isValid) {
                    if ($scope.materialOne.level){
                        var material = new ChapterService.materialEdit($scope.materialOne);
                            if ($stateParams.chapterId){
                                var Id = $stateParams.chapterId;
                            } else
                            if ($stateParams.lessonId){
                                var Id = $stateParams.lessonId;
                            } else
                            if ($stateParams.topicId){
                                var Id = $stateParams.topicId;
                            }
                    } else
                    if($scope.materialOne.topic){
                        var material = new ChapterService.subTopicDetails($scope.materialOne);
                        var Id = $stateParams.subTopicId;
                    } else
                    if($scope.materialOne.title){
                        var material = new ChapterService.materialTitle($scope.materialOne);
                        var Id = $stateParams.materialTitleId;
                    }
                    if (!material.updated) {
                        material.updated = [];
                    }
                    material.updated.push(new Date().getTime());
                    if ($scope.materialOne.level){
                        material.$update({materialId:Id}, function() {
                            if (material.level == "chapter"){
                                flash.setMessage(MESSAGES.CHAPTER_UPDATE_SUCCESS,MESSAGES.SUCCESS);
                            } else
                            if (material.level == "lesson"){
                                flash.setMessage(MESSAGES.LESSON_UPDATE_SUCCESS,MESSAGES.SUCCESS);
                            } else
                            if (material.level == "topic"){
                                flash.setMessage(MESSAGES.TOPIC_UPDATE_SUCCESS,MESSAGES.SUCCESS);
                            }
                        	$scope.editUrl(COURSE.URL_PATH.COURSEMATERIALVIEW,$stateParams.materialTitleId,null,null,null,null);
                        }, function(error) {
                            $scope.error = error;
                        });
                    } else
                    if ($scope.materialOne.notes){
                        material.$update({subTopicId:Id}, function() {
                            flash.setMessage(MESSAGES.SUBTOPIC_UPDATE_SUCCESS,MESSAGES.SUCCESS);
                            $scope.editUrl(COURSE.URL_PATH.COURSEMATERIALVIEW,$stateParams.materialTitleId,null,null,null,null);
                        }, function(error) {
                            $scope.error = error;
                        });
                    } else
                    if ($scope.materialOne.title){
                        material.$update({materialTitleId:Id}, function() {
                            flash.setMessage(MESSAGES.MATERIAL_UPDATE_SUCCESS,MESSAGES.SUCCESS);
                            $scope.editUrl(COURSE.URL_PATH.COURSEMATERIALTITLELIST,null,null,null,null,null);
                        }, function(error) {
                            $scope.error = error;
                        });
                    }
                } else {
                    $scope.submitted = true;
                }
            } else {
                flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
                $location.path(MESSAGES.DASHBOARD_URL);
            }
        };

        $scope.redirectdashboard = function() {
            $location.path(PROFILE.URL_PATH.DASHBOARD);
        };

        $scope.editUrl = function(urlPath, materialTitleId, chapterId, lessonId, topicId, subTopicId) {
            if (materialTitleId) {
                urlPath = urlPath.replace(":materialTitleId", materialTitleId);
            }
            if (chapterId) {
                urlPath = urlPath.replace(":chapterId", chapterId);
            }
            if (lessonId) {
                urlPath = urlPath.replace(":lessonId", lessonId);
            }
            if (topicId) {
                urlPath = urlPath.replace(":topicId", topicId);
            }
            if (subTopicId) {
                urlPath = urlPath.replace(":subTopicId", subTopicId);
            }
            $location.path(urlPath);
        };

        $scope.updateMaterial = function(materialTitleId){
            $scope.editUrl(COURSE.URL_PATH.COURSEMATERIALEDIT, materialTitleId, null, null, null, null);
        };

        $scope.updateChapter = function(chapterId){
            $scope.editUrl(COURSE.URL_PATH.COURSEMATERIALCHAPTER_EDIT, $stateParams.materialTitleId, chapterId, null, null, null);
        };

        $scope.updateLesson = function(lessonId){
            $scope.editUrl(COURSE.URL_PATH.COURSEMATERIALLESSON_EDIT, $stateParams.materialTitleId, null, lessonId, null, null);
        };

        $scope.updateTopic = function(topicId){
            $scope.editUrl(COURSE.URL_PATH.COURSEMATERIALTOPIC_EDIT, $stateParams.materialTitleId, null, null, topicId, null);
        };

        $scope.updateSubTopic = function(subtopicId){
            $scope.editUrl(COURSE.URL_PATH.COURSEMATERIALSUBTOPIC_EDIT, $stateParams.materialTitleId, null, null, null, subtopicId);
        };

        // ********************Add Chapter**********************
        $scope.newMaterials = {};
        $scope.newMaterial = {};
        $scope.newMaterial.chapters = [];
        $scope.lessons = [];
        $scope.topics = [];
        $scope.subTopics = [];

        $scope.addChapter = function(){;
            $scope.newMaterial.chapters.push({});
            $scope.submitButton = true;
        };

        $scope.removeChapter = function(chapter,chapterIndex){
            $scope.newMaterial.chapters.splice(chapterIndex,1);
            if ($scope.newMaterial.chapters.length == 0){
                $scope.submitButton = false;
            }
        };

        // **************************Add lesson*****************************
        $scope.addLesson = function(chapter){
            if(angular.isUndefined(chapter.lessons)){
                chapter.lessons=[];
            }
            chapter.lessons.push({});
        };

        $scope.removeLesson = function(chapter,lesson,lessonIndex){
            chapter.lessons.splice(lessonIndex,1);
        };

        // *********************Add Topic Form******************
        $scope.addTopic = function(lesson){
            if(angular.isUndefined(lesson.topics)){
                lesson.topics=[];
            }
            lesson.topics.push({});
        };

         $scope.removeTopic = function(lesson,topic,topicIndex){
            lesson.topics.splice(topicIndex,1);
        };

        // *********************Add Content Form******************
        $scope.addSubTopic = function(topic){
            if(angular.isUndefined(topic.subTopics)){
                topic.subTopics=[];
            }
            topic.subTopics.push({});
        };

         $scope.removeSubTopic = function(topic,subTopic,subTopicIndex){
            topic.subTopics.splice(subTopicIndex,1);
        };

        // *********************Summernote options******************
        $scope.summernoteOptions = function(){
            $scope.options = {
                height: 300,
                focus: true,
                // airMode: true,
                toolbar: [
                        ['edit',['undo','redo']],
                        ['headline', ['style']],
                        ['style', ['bold', 'italic', 'underline', 'strikethrough']],
                        ['fontface', ['fontname']],
                        ['textsize', ['fontsize']],
                        ['fontclr', ['color']],
                        ['alignment', ['ul', 'ol', 'paragraph', 'lineheight']],
                        ['height', ['height']],
                        ['table', ['table']],
                        ['insert', ['link','picture','video','hr']],
                        // ['highlight', ['highlight']],
                        ['view', ['fullscreen', 'codeview']],
                        ['help', ['help']]
                    ]
              };
        };


        $scope.removeSkill=function(skill){
            var index = $scope.newMaterial.skills.indexOf(skill);
            $scope.newMaterial.skills.splice(index, 1);
        };

        $scope.removeSkill=function(skill){
            var index = $scope.materialOne.skills.indexOf(skill);
            $scope.materialOne.skills.splice(index, 1);
        };

        $scope.addSkill = function () {
            $scope.newMaterial.skills.push({});
        };

        $scope.addSkills = function () {
            $scope.materialOne.skills.push({});
        };

        $scope.setSkill = function(){
            $scope.newMaterial.skills = [{}];
        };
    });
