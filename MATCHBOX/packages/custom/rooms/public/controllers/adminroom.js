  'use strict';
  var roomModule = angular.module('mean.rooms');
  roomModule.controller('AdminRoomsController', ['$scope', '$rootScope', '$location', '$stateParams', 'Global', 'URLFactory', 'SpaceService', 'RoomService', 'Upload', 'MeanUser', 'flash', 'ShareHolidaysService', '$parse', 'SpaceTypeService', '$timeout', 'MESSAGES', 'ROOMS','DTOptionsBuilder','DTColumnDefBuilder',
      function($scope, $rootScope, $location, $stateParams, Global, URLFactory, SpaceService, RoomService, Upload, MeanUser, flash, ShareHolidaysService, $parse, SpaceTypeService, $timeout, MESSAGES, ROOMS,DTOptionsBuilder,DTColumnDefBuilder) {
          $scope.global = Global;
          hideBgImageAndFooter($rootScope);
          $scope.package = {
              name: 'rooms',
              modelName: 'Rooms',
              featureName: 'Admin Rooms'
          };
          $scope.roomPhotos = [];
          $scope.spacePhotos = [];
          $scope.photos = [];
          initializePermission($scope, $rootScope, $location, $scope.package.featureName, flash, URLFactory.MESSAGES);
          $scope.statusOptions = [{'name':'Approved'},{'name':'Pending'},{'name':'All'}];
          flashmessageOn($rootScope, $scope,flash);
          $scope.loadAdminRooms = function() {

            $scope.dtOptions = DTOptionsBuilder.newOptions().withPaginationType('full_numbers').withDisplayLength(10);
            $scope.dtColumnDefs = [
                               DTColumnDefBuilder.newColumnDef(0).notVisible(),
                               DTColumnDefBuilder.newColumnDef(1),
                               DTColumnDefBuilder.newColumnDef(2),
                               DTColumnDefBuilder.newColumnDef(3),
                               DTColumnDefBuilder.newColumnDef(4),
                               DTColumnDefBuilder.newColumnDef(5).notSortable()
                              
                               ];
            window.alert = (function() {
                var nativeAlert = window.alert;
                return function(message) {
                    //window.alert = nativeAlert;
                    message.indexOf("DataTables warning") >= 0 ?
                          console.warn(message) :
                                  nativeAlert(message);
                }
            })(); 

            $scope.status={};
           
              RoomService.adminrooms.query(function(response) {
                 $scope.spacedetails = response;
              }, function(error) {
                  $scope.error = error;
              });
          };

            $scope.approveOrRejectRoomPage=function(room)
          {
              $location.url(URLFactory.ROOMS.URL_PATH.ADMIN_ROOM_LIST_VIEW+'?selectedId=' + room._id);   
          };

          $scope.viewRoomDetail=function()
          {
            var queryParams = $location.search();
             RoomService.roomdetails.get({"roomId" : queryParams.selectedId }, function(response) {
              $scope.room = response;
              $scope.roomPhotos = $scope.room.images.map(function(room) {
            return {src: room.url};
          });
              $scope.photos = $scope.roomPhotos;
            }, function(error) {
              console.log(error);
            });
            // $scope.room=$rootScope.roomdetails;
          };
           // initial image index
        $scope._Index = 0;

        // if a current image is the same as requested image
        $scope.isActive = function (index) {
            return $scope._Index === index;
        };

        // show prev image
        $scope.showPrev = function () {
            $scope._Index = ($scope._Index > 0) ? --$scope._Index : $scope.photos.length - 1;
        };

        // show next image
        $scope.showNext = function () {
            $scope._Index = ($scope._Index < $scope.photos.length - 1) ? ++$scope._Index : 0;
        };

        // show a certain image
        $scope.showPhoto = function (index) {
            $scope._Index = index;
        };
        
      $scope.generateTempUrl = function(response) {
        var image = response;
        var res = image.split("upload");
        var resp = res[0] + "upload/w_100,h_100,c_thumb" + res[1];
        return resp;
      };
      $scope.generateTempUrl1 = function(response) {
        var image = response;
        var res = image.split("upload");
        var resp = res[0] + "upload/w_800,h_500,c_thumb" + res[1];
        return resp;
      };


        $scope.approveRoom=function(room,message){
            if(room.images.length == 0)
            {
                 $location.$$search = {};  
                var urlPath = URLFactory.ROOMS.URL_PATH.ADMIN_SPACE_LIST_VIEW.replace(":spaceId", room.spaceId._id);
                  $location.path(urlPath);
                flash.setMessage(URLFactory.MESSAGES.ROOM_IMAGES_APPROVAL_ERROR,URLFactory.MESSAGES.ERROR);   
            } 
            else if(room.spaceId.approveStatus == "Pending")
            { 
                 $location.$$search = {};          
                var urlPath = URLFactory.ROOMS.URL_PATH.ADMIN_SPACE_LIST_VIEW.replace(":spaceId", room.spaceId._id);
                  $location.path(urlPath);
                flash.setMessage(URLFactory.MESSAGES.ADMIN_SPACE_APPROVAL_PENDING,URLFactory.MESSAGES.ERROR);   
            }
            else
            {      
                 RoomService.approveRoom.update({"roomId":room._id,"status":message},function(response){ 
                       $location.$$search = {};
                       var urlPath = URLFactory.ROOMS.URL_PATH.ADMIN_SPACE_LIST_VIEW.replace(":spaceId", room.spaceId._id);
                       $location.path(urlPath);               
                      flash.setMessage(URLFactory.MESSAGES.ROOM_APPROVED_SUCCESS,URLFactory.MESSAGES.SUCCESS);
                 },function(error){
                       console.log(error);
                 });
             }
          };

          $scope.rejectRoom=function(room,message){   

                  var rejectReason=$scope.roomRejectReason;

                    if(rejectReason == undefined)
                    {
                       rejectReason="";
                       flash.setMessage(URLFactory.MESSAGES.ROOM_REJECT_MESSAGE,URLFactory.MESSAGES.ERROR);
                    }
                  else
                   {
                     RoomService.rejectRoom.update({"roomId":room._id,"status":message,"reasonForReject":rejectReason},function(response){ 
                           $location.$$search = {};                
                           var urlPath = URLFactory.ROOMS.URL_PATH.ADMIN_SPACE_LIST_VIEW.replace(":spaceId", room.spaceId._id);
                           $location.path(urlPath);
                          flash.setMessage(URLFactory.MESSAGES.ROOM_SENT_MODIFICATION_SUCCESS,URLFactory.MESSAGES.SUCCESS);
                     },function(error){
                           console.log(error);
                     });
                  }   
             
          };

           $scope.publishRoom = function(room) {
            
             if(room.images.length == 0)
            {
              flash.setMessage(URLFactory.MESSAGES.ROOM_IMAGES_ERROR,URLFactory.MESSAGES.ERROR);        
            }
            else
            {
                var schedulecreate = new RoomService.publishRoom(room);              
                    schedulecreate.$save(function (response) {            
                          room.isPublished=true;
                          room.status="Published";  
                          flash.setMessage(URLFactory.MESSAGES.ROOM_PUBLISHED_SUCCESS,URLFactory.MESSAGES.SUCCESS);
                    }, function (error) {
                         console.log(error);
                    });
              }       

        };

        $scope.editroom = function(roomobject) {
              var urlPath = URLFactory.ROOMS.URL_PATH.ROOM_EDIT.replace(":roomId", roomobject._id);
              $location.path(urlPath);
          };

        $scope.deactivateRoom = function(room) {
          var retVal = confirm("Are you sure you want to deactivate this room?");
            if(retVal){
              var deleteroom = new RoomService.roomdetails(room);
                 
              deleteroom.$remove(function(response) {
                     if(response.isbooking)
                    {
                      $("#myModalDeactivatePopup").modal('show');
                    }
                    else
                     { 
                        flash.setMessage(URLFactory.MESSAGES.ROOM_DEACTIVATE_SUCCESS,URLFactory.MESSAGES.SUCCESS);
                        room.isActive=false;
                     }         
              }, function(error) {
                  $scope.error = error;
              });
            }
          };

           $scope.activateRoom = function(room) {

              var activateRoom = new RoomService.activateRoom(room);              
                    activateRoom.$save(function (response) {            
                          room.isActive=true; 
                          flash.setMessage(URLFactory.MESSAGES.ROOM_ACTIVATE_SUCCESS,URLFactory.MESSAGES.SUCCESS);
                    }, function (error) {
                         console.log(error);
                    });
             
          };


        $scope.backtoList = function(room){
            $location.$$search = {}; 
           var urlPath = URLFactory.ROOMS.URL_PATH.ADMIN_SPACE_LIST_VIEW.replace(":spaceId", room.spaceId._id);
              $location.path(urlPath);
        };

      $scope.loadroomtypesonStatus = function(statusname) {
              RoomService.getRoomsbyStatus.query({'status' : $scope.status.name},function(response) {
                  $scope.roomdetails = response;
              }, function(error) {
                  console.log(error);
              });
          };

        $scope.viewCompleteSpaceDetail=function(spaceobject)
        {

          var urlPath = URLFactory.ROOMS.URL_PATH.ADMIN_SPACE_LIST_VIEW.replace(":spaceId", spaceobject._id);
              $location.path(urlPath);

        };

        $scope.loadCompleteSpaceDetail=function()
        {

          SpaceService.crud.get({
                spaceId : $stateParams.spaceId
              }, function(space) {
                   $scope.space = space;
                   $scope.spacePhotos = $scope.space.images.map(function(space) {
                   return {src: space.url};
                 });
                 $scope.photos = $scope.spacePhotos;  
              },function(error){
                 console.log(error);
              });

        };

      $scope.loadRoomsAllotedToParticulerSpace = function () {

             $scope.dtOptions1 = DTOptionsBuilder.newOptions().withPaginationType('full_numbers').withDisplayLength(10);
             $scope.dtColumnDefs1 = [
                           DTColumnDefBuilder.newColumnDef(0).notVisible(),
                           DTColumnDefBuilder.newColumnDef(1),
                           DTColumnDefBuilder.newColumnDef(2),
                           DTColumnDefBuilder.newColumnDef(3),
                           DTColumnDefBuilder.newColumnDef(4),
                           DTColumnDefBuilder.newColumnDef(5),
                           DTColumnDefBuilder.newColumnDef(6),
                           DTColumnDefBuilder.newColumnDef(7),
                           DTColumnDefBuilder.newColumnDef(8),
                           DTColumnDefBuilder.newColumnDef(9).notSortable(),
                           DTColumnDefBuilder.newColumnDef(10).notSortable()
                           ];
              window.alert = (function() {
                  var nativeAlert = window.alert;
                  return function(message) {
                      //window.alert = nativeAlert;
                      message.indexOf("DataTables warning") >= 0 ?
                            console.warn(message) :
                                    nativeAlert(message);
                  }
              })(); 

           RoomService.loadroomparticulertospace.query({'particulerroomsspaceId':$stateParams.spaceId},function(response){
                $scope.roomsparticulertospace=response;
                console.log($scope.roomsparticulertospace);
              },function(error){
                        console.log(error);
              });

         };

         $scope.approveSpaceAdmin=function(space){

            RoomService.approveSpaceByAdmin.update({"spaceId":space._id},function(response){ 
                      space.approveStatus="Approved";              
                      flash.setMessage(URLFactory.MESSAGES.ADMIN_SPACE_APPROVAL_APPROVED,URLFactory.MESSAGES.SUCCESS);
                 },function(error){
                       console.log(error);
                 });

         };

         $scope.backtoadminspaceList=function(space){
             $location.path(URLFactory.ROOMS.URL_PATH.ADMIN_ROOM_LIST);
         };


          $scope.openRoomRejectPopup=function(){  
               $("#myModalRejectRoomPopup").modal('show');
         };



      }
  ]);