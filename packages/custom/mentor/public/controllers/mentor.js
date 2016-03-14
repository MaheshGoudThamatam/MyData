'use strict';

/* jshint -W098 */

var mentorApp=angular.module('mean.mentor')
mentorApp.controller('MentorController', ['$scope', '$rootScope', 'Global', 'SkillService', 'MentorService', 'BRANCH', 'Upload', '$timeout', '$stateParams', '$location', 'MESSAGES', 'flash', 'MENTOR',
    function ($scope, $rootScope, Global, SkillService, MentorService, BRANCH, Upload, $timeout, $stateParams, $location, MESSAGES, flash, MENTOR) {
        $scope.global = Global;
        $scope.package = {
            name: 'mentor',
            modelName: 'MENTOR'
        };
        $scope.addressTypes = ['Permanent Address', 'Temporary Address', 'Office Address'];
        initializeBreadCrum($scope,$scope.package.modelName,'Mentor','Mentor Management');
        $scope.MESSAGES = MESSAGES;
        $scope.MENTOR = MENTOR;
        $scope.setMentor = function () {
            $scope.mentor = $rootScope.currentUser;
            if ($scope.mentor.address.length == 0
                && $scope.mentor.qualification_details.length == 0
                && $scope.mentor.experience_details.length == 0
                && $scope.mentor.additional_documents.length == 0
                && $scope.mentor.references.length == 0
                && $scope.mentor.references.length == 0) {
                if ($scope.mentor.address.length == 0) {
                    $scope.mentor.address = [
                        {}
                    ];
                }
                if ($scope.mentor.qualification_details.length == 0) {
                    $scope.mentor.qualification_details = [
                        {}
                    ];
                }
                if ($scope.mentor.experience_details.length == 0) {
                    $scope.mentor.experience_details = [
                        {}
                    ];
                }
                if ($scope.mentor.additional_documents.length == 0) {
                    $scope.mentor.additional_documents = [
                        {}
                    ];
                }
                if ($scope.mentor.references.length == 0) {
                    $scope.mentor.references = [
                        {}
                    ];
                }
            } else {
                $scope.loadMentor();
            }
        }

        //***************Load registered Mentor***************//
        $scope.loadMentor = function () {
            var query = {};
            query.userId = $scope.mentor._id;
            MentorService.user.get(query, function (mentor) {
                $scope.mentor = mentor;
                /*for(var i = 0; i < $scope.mentor.address.length; i++){
                 Object.defineProperty($scope.mentor.address[i], 'addressType', {
                 writeable: true
                 });
                 }
                 for(var i = 0; i < $scope.mentor.qualification_details.length; i++){
                 Object.defineProperty($scope.mentor.qualification_details[i], 'grade_obtained', {
                 writeable: true
                 });
                 }*/
            });

        }

        $scope.documentDropdown = 'NA';
        $scope.loadTags = function ($query) {
            return $scope.skillList.filter(function (skill) {
                return skill.name.toLowerCase().indexOf($query.toLowerCase()) != -1;
            });
        };
        $scope.loadSkills = function () {
            $scope.setMentor();
            $scope.skillNames = [];
            SkillService.skill.query(function (skillList) {
                $scope.skillList = skillList;
                for (var i = 0; i < $scope.skillList.length; i++) {
                    $scope.skillNames.push($scope.skillList[i].name);
                }
				$scope.breadCrumAdd("Detail");
            });
        };
        $scope.date = new Date();
        $scope.myDate = new Date();
        $scope.dates = [];
        var initDates = function () {
            var i;
            var d = new Date();
            var n = d.getFullYear();
            for (i = 1900; i <= n; i++) {
                $scope.dates.push(i);
            }
        };
        initDates();

        //***************Mentor Address***************//
        $scope.addAddress = function () {
            $scope.mentor.address.push({});
        };
        $scope.removeAddress = function (address) {
            var index = $scope.mentor.address.indexOf(address);
            $scope.mentor.address.splice(index, 1);
        };

        //***************Mentor Qualification***************//
        $scope.addQualification = function () {
            $scope.mentor.qualification_details.push({});
        };
        $scope.removeQualification = function (qualification) {
            var index = $scope.mentor.qualification_details.indexOf(qualification);
            $scope.mentor.qualification_details.splice(index, 1);
        };

        //***************Mentor Experience***************//
        $scope.addExperience = function () {
            $scope.mentor.experience_details.push({});
        };
        $scope.removeExperience = function (experience) {
            var index = $scope.mentor.experience_details.indexOf(experience);
            $scope.mentor.experience_details.splice(index, 1);
        };

        //***************Mentor Additional Doc***************//
        $scope.addDocument = function () {
            $scope.mentor.additional_documents.push({});
        };
        $scope.removeDocument = function (document) {
            var index = $scope.mentor.additional_documents.indexOf(document);
            $scope.mentor.additional_documents.splice(index, 1);
        };

        //***************Mentor Reference***************//
        $scope.addReference = function () {
            $scope.mentor.references.push({});
        };
        $scope.removeReference = function (reference) {
            var index = $scope.mentor.references.indexOf(reference);
            $scope.mentor.references.splice(index, 1);
        };

        //***************Document Dropdown***************//
        $scope.documentOtherSelected = [];
        $scope.selectPredefineDocument = function (index, value) {
            if (value == 'Others') {
                $scope.documentOtherSelected[index] = true;
            } else {
                $scope.documentOtherSelected[index] = false;
            }
        };
        $scope.documentOthers = [];
        $scope.selectOtherDocument = function (index, value) {
            //$scope.documentOthers[0] = value;
        };

        //***************Assign address type***************//
        $scope.assignAddressType = function (address, selectedAddressType) {
            mentor.addressType = selectedAddressType;
        }

        //***************Assign grade type***************//
        $scope.assignGradeType = function (qualification, selectedGradeType) {
            qualification.grade_obtained = selectedGradeType;
        }

        //***************Mentor Creation***************//
        $scope.create = function (isValid) {
            $scope.addressError = false;
            var jj = 0;
            for (var j = 0; j < $scope.mentor.address.length; j++) {
                if ($scope.mentor.address[j].addressType === 'Permanent Address') {
                    jj = jj + 1;
                }
            }
            if (jj > 1) {
                $scope.addressError = true;
                flash.setMessage(MESSAGES.MENTOR_ADDRESS_ERROR, MESSAGES.ERROR);
            }
            else {
                $scope.addressError = false;
            }
            if (isValid && $scope.filePath != null && !$scope.addressError) {
                /*for(var i = 0; i < $scope.mentor.additional_documents.length; i++){
                 if($scope.mentor.additional_documents[i].doc_name === 'Others'){
                 $scope.mentor.additional_documents[i].doc_name = $scope.mentor.additional_documents[i].doc_nameother;
                 delete $scope.mentor.additional_documents[i].doc_nameother;
                 }
                 }*/
                $scope.mentor.form_submitted = "true";
                var mentor = new MentorService.mentor($scope.mentor);
                mentor.$update(function (response) {
                    flash.setMessage(MESSAGES.MENTOR_REQUEST_SUCCESS, MESSAGES.SUCCESS);
                    $location.path('/profile/dashboard');
                    $scope.mentor = {};
                }, function (error) {
                    $scope.error = error;
                });
            } else {
                $scope.submitted = true;
            }
        };

        //***************Document Upload***************//
        $scope.onFileSelectResume = function (file, index) {
            if (angular.isArray(file)) {
                file = file[0];
            }
            if (file.type !== 'application/pdf' && file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                flash.setMessage(MESSAGES.MENTOR_FILE_UPLOAD_ERROR, MESSAGES.ERROR);
                console.log("in funciton");
                return;
            }
            $rootScope.$emit('processingContinue');
            $scope.upload = Upload.upload({
                url: '/api/mentorApply/Resume',
                method: 'POST',
                file: file
            }).progress(function (event) {
                //$scope.uploadProgress = Math.floor(event.loaded / event.total);
                // $scope.$apply();
            }).success(function (data, status, headers, config) {
                if (config) {
                }
                $scope.filePath = data;
                $scope.uploadInProgress = false;
                flash.setMessage(MESSAGES.MENTOR_FILE_UPLOAD_SUCCESS, MESSAGES.SUCCESS);
                $scope.mentor.additional_documents[index].doc_file = $scope.filePath;
            }).error(function (err) {
                console.log(err);
                $scope.uploadInProgress = false;
            });

        };
        //***************Initialize Mentor***************//
        $scope.mentorProject = function () {
            $scope.mentor = $rootScope.currentUser;
			$scope.breadCrumAdd("Request Status");
            // var mentorRequest = new MentorService.mentorRequestStatus();
            MentorService.mentorRequestStatus.get({}, function (mentorRequestStatus) {
                $scope.mentorRequest = mentorRequestStatus;
            });
        };
        $scope.check = function () {
            flash.setMessage(MESSAGES.MENTOR_REQUEST_NO_DATA, MESSAGES.ERROR);
        };
    }

]);

//***************Phone Number Validation***************//
mentorApp.directive('input', function () {
    return {
        restrict: 'E',
        require: '?ngModel',
        link: function (scope, elm, attr, ctrl) {
            if (!ctrl) {
                return;
            }
            if (attr.type == 'text' && attr.ngPattern === '/[0-9]/') {
                elm.bind('keyup', function () {
                    var text = this.value;
                    this.value = text.replace(/[a-zA-Z]/g, '');
                });
            }
        }
    }
});
mentorApp.directive('input', function () {
    return {
        restrict: 'E',
        require: '?ngModel',
        link: function (scope, elm, attr, ctrl) {
            if (!ctrl) {
                return;
            }
            if (attr.type == 'text' && attr.ngPattern === '/[a-zA-Z]+/g') {
                elm.bind('keyup', function () {
                    var text = this.value;
                    this.value = text.replace(/[^a-zA-Z\s]/g, '');
                });
            }
        }
    }
});
mentorApp.directive("formatDate", function(){
  return {
   require: 'ngModel',
    link: function(scope, elem, attr, dateCtrl) {
      dateCtrl.$formatters.push(function(dateValue){
        return new Date(dateValue);
      })
    }
  }
});