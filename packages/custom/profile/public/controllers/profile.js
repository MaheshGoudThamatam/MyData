'use strict';

angular.module('mean.profile').controller('ProfileController', function ($scope, $stateParams, $location, Global, $rootScope, MeanUser, EducationalDetailService, Upload, $timeout, ProfileService, PROFILE, $window, MESSAGES,$translate) {

    $scope.global = Global;
    $scope.package = {
        name: 'profile',
        modelName: 'Profile'
    };
    $scope.PROFILE = PROFILE;
    $scope.MESSAGES = MESSAGES;
    initializeBreadCrum($scope, $scope.package.modelName, PROFILE.URL_PATH.PROFILEABOUTME);
    $scope.editProfileBreadcrumb = function () {
        $scope.breadCrumAdd("Edit");
    };
    $scope.uploadResumeBreadcrumb = function () {
        $scope.breadCrumAdd("Upload Resume");
    };
    $scope.hasAuthorization = function (EducationalDetail) {
        if (!EducationalDetail || !EducationalDetail.user) {
            return false;
        }
        return MeanUser.isAdmin || EducationalDetail.user._id === MeanUser.user._id;
    };
    $rootScope.$on('loggedin', function () {
        $scope.user = angular.copy(MeanUser.user);
    });
    $scope.fileValidation = {};
    $scope.onFileSelect = function (image) {
        if (angular.isArray(image)) {
            image = image[0];
        }
        // This is how I handle file types in client side
        if (image.type !== 'image/png' && image.type !== 'image/jpeg') {
            alert('Only PNG and JPEG are accepted.');
            return;
        }
        if (image.size > (1024 * 1024)) {
            alert('file size exceeded.');
            return;
        }
        $rootScope.$emit('processingContinue');
        $scope.upload = Upload.upload({
            url: '/api/user/profilePicture',
            method: 'POST',
            file: image
        }).progress(function (event) {

            $scope.uploadProgress = Math.floor(event.loaded /
                event.total);

            $scope.$apply();
        }).success(function (data, status, headers, config) {
            if (config) {
            }
            $scope.uploadInProgress = false;
            // If you need uploaded file immediately
            alert('uploaded successfully');
            $window.location.reload();
            $location.path("/profile/aboutme");

            $timeout(function () {
                $scope.user.profilePicture = data.profilePicture;
                $scope.user.thumbprofilePicture = data.thumbprofilePicture;
                $scope.user.thumb150profilePicture = data.thumb150profilePicture;
                $rootScope.user = $scope.user;
                $rootScope.$emit('user');
            }, 3000);
        }).error(function (err) {
            $scope.uploadInProgress = false;
        });
    };

    $scope.onFileSelectResume = function (file) {

        if (angular.isArray(file)) {
            file = file[0];
        }
        // This is how I handle file types in client side

         /*if (file.type !== 'file/pdf' && file.type !== 'file/docx') {
         alert('Only pdf and docx are accepted.'); return;

         }*/
        $rootScope.$emit('processingContinue');
        $scope.upload = Upload.upload({
            url: '/api/user/Resume',
            method: 'POST',
            file: file
        }).progress(function (event) {
            //$scope.uploadProgress = Math.floor(event.loaded / event.total);
            // $scope.$apply();
        }).success(function (data, status, headers, config) {
            if (config) {
            }
            $scope.uploadInProgress = false;
            // If you need uploaded file immediately
            alert('resume uploaded successfully');
            $timeout(function () {
                $scope.user.Resume = data.user.Resume;
                $rootScope.user = $scope.user;
                $rootScope.$emit('user');
            }, 3000);
            
        }).error(function (err) {
            $scope.uploadInProgress = false;
        });

    };
    $scope.success = function () {
        $scope.user = angular.copy(MeanUser.user);
        $rootScope.profileuser = $scope.user;
    };
    $scope.bol = false;
    $scope.saveUsername = function (isValid, user) {
        $scope.bol = false;
        if (isValid) {
            MeanUser.updateProfile(user).then(function (user) {
                $scope.bol = true;
                $scope.profileUpateMessage = "Changes has been updated successfully.";
                $scope.user = user;
                $timeout(function () {
                    $scope.profileUpateMessage = "";
                }, 3000);
            });
        } else {
            $scope.submitted = true;
        }
    };
    $scope.editProfile = function () {
        $scope.success();
    };
    $scope.redirectEdit = function (user) {
        $scope.success();
        $location.path(PROFILE.URL_PATH.EDITPROFILE);
    };

    //EducationalDetail CRUD
    $scope.findEducationalDetail = function () {
        EducationalDetailService.query(function (educationalDetails) {
            $scope.educationalDetails = educationalDetails;
        });
    };
    $scope.createEducationalDetail = function (isValid, user) {
        if (isValid) {
            $scope.educationalDetail.user = user;
            var educationalDetail = new EducationalDetailService($scope.educationalDetail);
            educationalDetail.$save(function (response) {
                $location.path(PROFILE.URL_PATH.EDITPROFILE);
                $scope.educationalDetail = {};
            });
        } else {
            $scope.submitted = true;
        }

    };

    $scope.removeEducationalDetail = function (EducationalDetail) {
        if (EducationalDetail) {
            EducationalDetail.$remove(function (response) {
                for (var i in $scope.educationalDetails) {
                    if ($scope.educationalDetails[i] === EducationalDetail) {
                        $scope.educationalDetails.splice(i, 1);
                    }
                }
                $('#deleteDegree').modal("hide");
            });
        } else {
            $scope.educationalDetail.$remove(function (response) {
                $('#deleteDegree').modal("hide");
            });
        }
    };

    $scope.updateEducationalDetail = function (isValid) {
        if (isValid) {
            var educationalDetail = $scope.educationalDetail;
            if (!educationalDetail.updated) {
                educationalDetail.updated = [];
            }
            educationalDetail.updated.push(new Date().getTime());

            educationalDetail.$update(function () {
                $location.path(PROFILE.URL_PATH.EDITPROFILE);
            });
        } else {
            $scope.submitted = true;
        }
    };
    $scope.findOneEducationalDetail = function () {
        EducationalDetailService.get({
            educationaldetailId: $stateParams.educationaldetailId
        }, function (educationalDetail) {
            $scope.educationalDetail = educationalDetail;
        });
    };
    $scope.canceleducationalDetail = function () {
        $location.path(PROFILE.URL_PATH.EDITPROFILE);
    };
    $scope.neweducationalDetail = function () {
        $location.path(PROFILE.URL_PATH.EDUCATIONALDETAILSCREATE);
    };
    $scope.editEducation = function (urlPath, id) {
        urlPath = urlPath.replace(":educationaldetailId", id);
        $location.path(urlPath);
    };
    $scope.badge = function () {
        $location.path(PROFILE.URL_PATH.PROFILEBADGES);
    };
    $scope.Portfolio = function () {
        $location.path(PROFILE.URL_PATH.PROFILEPORTFOLIOCONTENT);
    };
    $scope.review = function () {
        $location.path(PROFILE.URL_PATH.PROFILEREVIEWS);
    };
    $scope.resume = function () {
        $location.path(PROFILE.URL_PATH.PROFILERESUME);
    };
    $scope.performance = function () {
        $location.path(PROFILE.URL_PATH.PROFILEPERFORMANCE);
    };
    $scope.aboutme = function () {
        $location.path(PROFILE.URL_PATH.PROFILEABOUTME);
    };
    $scope.redirectdashboard = function () {
        $location.path(PROFILE.URL_PATH.DASHBOARD);
    };
    $scope.portfolioEdit = function () {
        $location.path(PROFILE.URL_PATH.PROFILEPORTFOLIOEDIT);
    };
    $scope.redirectResume = function () {
        $location.path(PROFILE.URL_PATH.UPLOADRESUME);
    };
    $scope.modalDeleteEducationalDetail = function (educationalDetail) {
        $scope.educationalDetail = educationalDetail;
        $('#deleteDegree').modal("show");
    };
    $scope.cancelDegree = function () {
        $('#deleteDegree').modal("hide");
    };

});
