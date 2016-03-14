'use strict';

angular.module('mean.curriculum').config(['$stateProvider','CURRICULUM',
  function($stateProvider,CURRICULUM) {
    $stateProvider
    .state(CURRICULUM.STATE.CURRICULUMLIST, {
      url: CURRICULUM.URL_PATH.CURRICULUMLIST,
      templateUrl: CURRICULUM.FILE_PATH.CURRICULUMLIST,
      resolve: {
          loggedin: function (MeanUser) {
              return MeanUser.checkLoggedin();
          }
      }
     });
  }
]);
