  'use strict';
  var roomModule = angular.module('mean.rooms');
  roomModule.controller('RoomsController', ['$scope', '$rootScope', '$location', '$stateParams', 'Global', 'URLFactory', 'SpaceService', 'RoomService', 'Upload', 'MeanUser', 'flash', 'ShareHolidaysService', '$parse', 'SpaceTypeService', '$timeout', 'MESSAGES', 'ROOMS','DTOptionsBuilder','DTColumnDefBuilder',
      function($scope, $rootScope, $location, $stateParams, Global, URLFactory, SpaceService, RoomService, Upload, MeanUser, flash, ShareHolidaysService, $parse, SpaceTypeService, $timeout, MESSAGES, ROOMS,DTOptionsBuilder,DTColumnDefBuilder) {
          $scope.global = Global;
          hideBgImageAndFooter($rootScope);
          $scope.package = {
              name: 'rooms',
              modelName: 'Rooms',
              featureName: 'Inventory'
          };
          
          initializePermission($scope, $rootScope, $location, $scope.package.featureName, flash, URLFactory.MESSAGES);
          flashmessageOn($rootScope, $scope,flash);
          $scope.counter = 0;
          $scope.loadrooms = function() {
        	  $scope.dtOptions = DTOptionsBuilder.newOptions().withPaginationType('full_numbers').withDisplayLength(10);
				$scope.dtColumnDefs = [
				                   DTColumnDefBuilder.newColumnDef(0).notVisible(),
				                   DTColumnDefBuilder.newColumnDef(1),
				                   DTColumnDefBuilder.newColumnDef(2),
				                   DTColumnDefBuilder.newColumnDef(3),
				                   DTColumnDefBuilder.newColumnDef(4),
				                   DTColumnDefBuilder.newColumnDef(5),
				                   DTColumnDefBuilder.newColumnDef(6),
				                   DTColumnDefBuilder.newColumnDef(7),
				                   DTColumnDefBuilder.newColumnDef(8).notSortable(),
                           DTColumnDefBuilder.newColumnDef(9).notSortable()
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
              RoomService.roomdetails.query(function(response) {
                  $scope.roomdetails = response;
              }, function(error) {
                  console.log(error);
              });
          };
          $scope.deactivateRoom = function(room) {
              var deleteroom = new RoomService.roomdetails(room);
              deleteroom.$remove(function(response) {
                   if(response.isbooking)
                    {
                      $("#myModalDeactivatePopup").modal('show');
                    }
                  else{
                        room.isActive=false;
                        flash.setMessage(URLFactory.MESSAGES.ROOM_DEACTIVATE_SUCCESS,URLFactory.MESSAGES.SUCCESS);                
                      }
              }, function(error) {
                  $scope.error = error;
              });
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

          $scope.editroom = function(roomobject) {
              var urlPath = URLFactory.ROOMS.URL_PATH.ROOM_EDIT.replace(":roomId", roomobject._id);
              console.log(roomobject);
              $location.path(urlPath);
          };
          $scope.singleRoomDetail = function() {
              RoomService.roomdetails.get({
                  'roomId': $stateParams.roomId
              }, function(response) {
                  $scope.room = response;
                  $scope.counter=response.images.length;
                  if ($scope.room.images.length > 0) {
                      for (var i = 0; i < $scope.room.images.length; i++) {
                          if ($scope.room.images[i].url) {
                              $scope.room.images[i].tempUrl = $scope.generateTempUrl($scope.room.images[i].url);
                          }
                      }
                  }
                  $scope.room.capacity = $scope.room.capacity.toString();
                  $scope.enableAddMoreRoom();
              }, function(error) {
                  $scope.error = error;
              });
          };
          $scope.loadroomtypes = function() {
              RoomService.loadroomtypes.query(function(response) {
                  $scope.roomtypeoptions = response;
              }, function(error) {
                  console.log(error);
              });
          };
          $scope.saveEditedRoomDetail = function(isValid) {
              if (isValid) {
                  $scope.room.roomsslotschedule=$scope.officeHoursRoomsSlot;
                  $scope.oldscheduleeditdetail = angular.copy($scope.room);
                  var roomdetail = $scope.room;
                  roomdetail.$update(function(response) {
                    $scope.bookedarry=response.bookedarray;
                    $scope.changedschedulearray=response.changedschedulearray;
                    if(response.isbooking)
                    {
                      $("#myModal").modal('show');
                    }
                    else
                    {  
                       if($scope.loggedinuserisadmin)
                          {
                              flash.setMessage(URLFactory.MESSAGES.ROOM_EDIT_SUCCESS,URLFactory.MESSAGES.SUCCESS);
                              $location.path(URLFactory.ROOMS.URL_PATH.ADMIN_ROOM_LIST);
                          }  
                          else
                          {
                              flash.setMessage(URLFactory.MESSAGES.ROOM_EDIT_SUCCESS,URLFactory.MESSAGES.SUCCESS);
                              $location.path(URLFactory.ROOMS.URL_PATH.ROOM_LIST);
                          }
                    }
                  }, function(error) {
                      $scope.error = error;
                  });
              } else {
                  $scope.submitted = true;
              }
          };
          $scope.cancelRoomEdit = function() {
              $location.path(URLFactory.ROOMS.URL_PATH.ROOM_LIST);
          };


   $scope.setDefaultTime = function(){
      $scope.mytime = new Date();
      $scope.mytime.setHours( 9 );
      $scope.mytime.setMinutes( 0 );
      
      $scope.myEndTime = new Date($scope.mytime);
      $scope.myEndTime.setHours(18);
    };
    
    $scope.setDefaultTime();
  
    $scope.hstep = 1;
    $scope.mstep = 15;
  
    $scope.options = {
      hstep: [1, 2, 3],
      mstep: [1, 5, 10, 15, 25, 30]
    };
  
    $scope.ismeridian = false;
    $scope.toggleMode = function() {
      $scope.ismeridian = ! $scope.ismeridian;
    };

    /*
     * $scope.update = function(date) { var d = new Date(); console.log(d);
     * d.setHours( 14 ); d.setMinutes( 0 ); console.log(d); date = d; };
     */

  /**
   * Function for replacing $scope.apply
   */
    $scope.safeApply = function(fn) {
      var phase = this.$root.$$phase;
      if(phase == '$apply' || phase == '$digest') {
        if(fn && (typeof(fn) === 'function')) {
          fn();
        }
      } else {
        this.$apply(fn);
      }
    };
    
    /**
     * Function called on change of time
     */
    $scope.changed = function (startTime, endTime, index) {
      var the_string = 'err' + index;
  
      // Get the model
      var model = $parse(the_string);
      // Assigns a value to it
      var sTime = startTime.getHours();
      var eTime = endTime.getHours();
      if(eTime - sTime < 1){
        model.assign($scope, true);
  
        // Apply it to the scope
        $scope.safeApply();
      }else{
        model.assign($scope, false);
        $scope.safeApply();
      }
    };
    
    $scope.setFullDay = function(hoursObj) {
      var date = new Date();
      date.setHours(0);
      date.setMinutes(0);
      hoursObj.startTime = date;
      hoursObj.endTime = date;

    }
    
    $scope.toggleAllDay = function(hoursObj) {
      if(hoursObj.isAllday && hoursObj.isClosed){
        hoursObj.isClosed = false;
      }
      if(!hoursObj.isAllday && !hoursObj.isClosed){
        $scope.setDefaultTime();
        hoursObj.startTime = $scope.mytime;
        hoursObj.endTime = $scope.myEndTime;
      }
    }
    
    $scope.toggleClosed = function(hoursObj) {
      if(hoursObj.isClosed && hoursObj.isAllday){
        hoursObj.isAllday = false;
      }
      if(!hoursObj.isAllday && !hoursObj.isClosed){
        $scope.setDefaultTime();
        hoursObj.startTime = $scope.mytime;
        hoursObj.endTime = $scope.myEndTime;
      }
    }


         $scope.fileValidation = {};
    $scope.roomImageUpload = function(image){
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
             
          var user = MeanUser.user;
          var userId = user._id;
          $scope.isImageUploaded = false;
          var isImage = false;
          $scope.loaderEnabled = true;
          $scope.upload = Upload.upload({
              url: '/api/config/'+ userId + '/cupload',
              method: 'POST',
              file: image
          }).success(function (response) {
            $scope.loaderEnabled = false;
            var resp = $scope.generateTempUrl(response.url);
              $scope.imageObj = {};
              $scope.imageObj.url = response.url;
              $scope.imageObj.tempUrl = resp;
              $scope.room.images.push($scope.imageObj);
              $scope.counter = $scope.counter+1;
          }).error(function (err) {
                console.log(err);
          });
    };  

          $scope.generateTempUrl = function(response) {
      var image = response;
           var res = image.split("upload");
           var resp = res[0] + "upload/w_200,h_200,c_thumb" + res[1];
           return resp;
        };


        $scope.removeRoomImage = function (index, form, room) {
          if (room.images.length > 0) {
              $timeout(function () {
                room.images.splice(index, 1);
                $scope.counter = $scope.counter-1;
              }, 1000);
          }

      };

          $scope.enableAddMoreRoom=function(){

          $scope.enableAddMoreForm = true;
          $scope.officeHoursRoomsSlot = [];
          var days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

          if($scope.room.roomsslotschedule)
            { 
              for (var i=0; i< $scope.room.roomsslotschedule.length; i++){

                if($scope.room.roomsslotschedule[i].isAllday)
                  {
                          var obj = {};
                              obj.day = days[i];

                        $scope.mytime = new Date();
                        $scope.mytime.setHours(0);
                        $scope.mytime.setMinutes(0);
                        $scope.mytime.setSeconds(0);
                        $scope.mytime.setMilliseconds(0);
                        obj.startTime = $scope.mytime;

                        obj.min=$scope.mytime;

                        $scope.myEndTime = new Date();
                        $scope.myEndTime.setHours(0);
                        $scope.myEndTime.setMinutes(0);
                        $scope.myEndTime.setSeconds(0);
                        $scope.myEndTime.setMilliseconds(0);
                        obj.endTime = $scope.myEndTime;


                        $scope.myEndTimeMaximum = new Date();
                        $scope.myEndTimeMaximum.setHours(23);
                        $scope.myEndTimeMaximum.setMinutes(59);
                        $scope.myEndTimeMaximum.setSeconds(0);
                        $scope.myEndTimeMaximum.setMilliseconds(0);

                        obj.max=$scope.myEndTimeMaximum;

                        obj.isAllday=$scope.room.roomsslotschedule[i].isAllday;

                        obj.isClosed=$scope.room.roomsslotschedule[i].isClosed;

                        obj.isAlldaylogic=$scope.room.roomsslotschedule[i].isAllday;

                        $scope.officeHoursRoomsSlot.push(obj);

                      }

                      else
                      {
                            var obj = {};
                            obj.day = days[i];
                            var mynewstarttime=new Date($scope.room.roomsslotschedule[i].startTime);
                            var mynewsethourstarttime=mynewstarttime.getHours();
                            var mynewsetminutestarttime=mynewstarttime.getMinutes();
                            var mynewsetsecondstarttime=mynewstarttime.getSeconds();
                            var mynewsetmillisecondstarttime=mynewstarttime.getMilliseconds();

                            var mynewendtime=new Date($scope.room.roomsslotschedule[i].endTime);
                            var mynewsethourendtime=mynewendtime.getHours();
                            var mynewsetminutendtime=mynewendtime.getMinutes();
                            var mynewsetsecondendtime=mynewendtime.getSeconds();
                            var mynewsetmillisecondendtime=mynewendtime.getMilliseconds();

                            var mynewstarttimeminimum=new Date($scope.room.roomsslotschedule[i].min);
                            var mynewsethourstarttimeminimum=mynewstarttimeminimum.getHours();
                            var mynewsetminutestarttimeminimum=mynewstarttimeminimum.getMinutes();
                            var mynewsetsecondstarttimeminimum=mynewstarttimeminimum.getSeconds();
                            var mynewsetmillisecondstarttimeminimum=mynewstarttimeminimum.getMilliseconds();

                            var mynewendtimemaximum=new Date($scope.room.roomsslotschedule[i].max);
                            var mynewsethourendtimemaximum=mynewendtimemaximum.getHours();
                            var mynewsetminutendtimemaximum=mynewendtimemaximum.getMinutes();
                            var mynewsetsecondendtimemaximum=mynewendtimemaximum.getSeconds();
                            var mynewsetmillisecondendtimemaximum=mynewendtimemaximum.getMilliseconds();



                              $scope.mytime = new Date();
                              $scope.mytime.setHours(mynewsethourstarttime);
                              $scope.mytime.setMinutes(mynewsetminutestarttime);
                              $scope.mytime.setSeconds(mynewsetsecondstarttime);
                              $scope.mytime.setMilliseconds(mynewsetmillisecondstarttime);
                            obj.startTime = $scope.mytime;

                              $scope.myminstarttime = new Date();
                              $scope.myminstarttime.setHours(mynewsethourstarttimeminimum);
                              $scope.myminstarttime.setMinutes(mynewsetminutestarttimeminimum);
                              $scope.myminstarttime.setSeconds(mynewsetsecondstarttimeminimum);
                              $scope.myminstarttime.setMilliseconds(mynewsetmillisecondstarttimeminimum);
                 
                            obj.min=$scope.myminstarttime;

                              $scope.myEndTime = new Date();
                              $scope.myEndTime.setHours(mynewsethourendtime);
                              $scope.myEndTime.setMinutes(mynewsetminutendtime);
                              $scope.myEndTime.setSeconds(mynewsetsecondendtime);
                              $scope.myEndTime.setMilliseconds(mynewsetmillisecondendtime);
                            obj.endTime = $scope.myEndTime;

                              $scope.mymaxendtime = new Date();
                              $scope.mymaxendtime.setHours(mynewsethourendtimemaximum);
                              $scope.mymaxendtime.setMinutes(mynewsetminutendtimemaximum);
                              $scope.mymaxendtime.setSeconds(mynewsetsecondendtimemaximum);
                              $scope.mymaxendtime.setMilliseconds(mynewsetmillisecondendtimemaximum);


                           obj.max=$scope.mymaxendtime;

                           obj.isAllday=$scope.room.roomsslotschedule[i].isAllday;

                           obj.isClosed=$scope.room.roomsslotschedule[i].isClosed;

                           obj.isAlldaylogic=$scope.room.roomsslotschedule[i].isAllday;

                            $scope.officeHoursRoomsSlot.push(obj);
                    }
              }
            }  

        };
         
        $scope.loadspaceloc=function(){
            SpaceService.crud.get({'spaceId':$stateParams.spaceId},function (response) {
            	  $scope.loadedspaceobject=response;
                $scope.loc=response.loc;
                $scope.spaceAmenity = response.amenities;
              $scope.selectedspaceamenity = angular.copy($scope.spaceAmenity);
              $scope.loadRoomAmenities();
            }, function (error) {
                $scope.error = error;
            });
     };
     $scope.loadRoomAmenities=function(){
         RoomService.amenityroomlist.query(function(response){
            $scope.amenities=[];
            for(var i=0;i<response.length;i++)
            	
            {
            	$scope.amenities.push({
                       "amenityId":response[i]._id,
                       "facilityavailable":false,
                       "name":response[i].name,
                       "icon":response[i].icon  ,
                       "isStatus":response[i].isStatus
            		});
            }
            for(var i=0;i<$scope.selectedspaceamenity.length;i++)
            	{
            	$scope.amenities.push($scope.selectedspaceamenity[i]);
            	}
            $scope.room.amenities=$scope.amenities;
         },function(error){
            console.log(error);
         });
     };  
     $scope.toggleSpaceAmenityApplicable = function(amenity){
			if(amenity.isChargeable && !amenity.isApplicable){
				amenity.isChargeable = false;
				$scope.amenityChargeable = false;
			}
			amenity.facilityavailable=amenity.isApplicable;
		};
		$scope.amenityChargeable = false;
		$scope.toggleSpaceAmenityChargeable = function(amenity){
			if(amenity.isChargeable && !amenity.isApplicable){
				amenity.isApplicable = true;
				$scope.amenityChargeable = true;
			}
			amenity.facilityavailable=amenity.isApplicable;
			
		};

        $scope.confirmscheduleedit=function(){
         $scope.oldscheduleeditdetail.bookedarray=$scope.bookedarry; 
         $scope.oldscheduleeditdetail.changedschedulearray=$scope.changedschedulearray;
         RoomService.updatescheduleeditdata.update($scope.oldscheduleeditdetail,function(response){   
             flash.setMessage(URLFactory.MESSAGES.ROOM_EDIT_SUCCESS,URLFactory.MESSAGES.SUCCESS);
             $location.path(URLFactory.ROOMS.URL_PATH.ROOM_LIST);
           },function(error){
              console.log(error);
           });

        };

         $scope.cancelscheduleedit=function(){
             $location.path(URLFactory.ROOMS.URL_PATH.ROOM_LIST);
        };


         $scope.setDefaultTimeAddRoom = function(hoursObj){
          $scope.mytime = new Date(hoursObj.startTime);
          $scope.mytime.setHours( 9 );
          $scope.mytime.setMinutes( 0 );
          
          $scope.myEndTime = new Date(hoursObj.endTime);
          $scope.myEndTime.setHours(18);
          $scope.myEndTime.setMinutes(0);
        };

    $scope.setFulldayAddRoom = function(hoursObj){
      $scope.mytime = new Date();
      $scope.mytime.setHours(0);
      $scope.mytime.setMinutes(0);
      
      $scope.myEndTime = new Date();
      $scope.myEndTime.setHours(0);
      $scope.myEndTime.setMinutes(0);
    };

    $scope.toggleAllDayAddRoom = function(hoursObj) {
      if(hoursObj.isAllday && hoursObj.isClosed){
        hoursObj.isClosed = false;
      }
      if(hoursObj.isAllday)
      {
        $scope.setFulldayAddRoom(hoursObj);
        hoursObj.startTime = $scope.mytime;
        hoursObj.endTime = $scope.myEndTime;
      }
      if(!hoursObj.isAllday && !hoursObj.isClosed){
        
        $scope.mytimemin = new Date();
          $scope.mytimemin.setHours(0);
          $scope.mytimemin.setMinutes(0);
          $scope.mytimemin.setSeconds(0);
          $scope.mytimemin.setMilliseconds(0);

        hoursObj.min=$scope.mytimemin;

        $scope.myEndTimemax = new Date();
          $scope.myEndTimemax.setHours(23);
          $scope.myEndTimemax.setMinutes(59);
          $scope.myEndTimemax.setSeconds(0);
          $scope.myEndTimemax.setMilliseconds(0);

        hoursObj.max=$scope.myEndTimemax;

        $scope.setDefaultTimeAddRoom(hoursObj);
        hoursObj.startTime = $scope.mytime;
        hoursObj.endTime = $scope.myEndTime;
      }
                 
    };

        $scope.toggleClosedAddRoom = function(hoursObj) {
          if(hoursObj.isClosed && hoursObj.isAllday){
            hoursObj.isAllday = false;
          }
          if(!hoursObj.isAllday && !hoursObj.isClosed){
            $scope.setDefaultTimeAddRoom(hoursObj);
            hoursObj.startTime = $scope.mytime;
            hoursObj.endTime = $scope.myEndTime;


            $scope.mytime = new Date(hoursObj.startTime);
              $scope.mytime.setHours(0);
              $scope.mytime.setMinutes(0);
              $scope.mytime.setSeconds(0);
              $scope.mytime.setMilliseconds(0);

            hoursObj.min=$scope.mytime;

            $scope.myEndTime = new Date(hoursObj.endTime);
              $scope.myEndTime.setHours(23);
              $scope.myEndTime.setMinutes(59);
              $scope.myEndTime.setSeconds(0);
              $scope.myEndTime.setMilliseconds(0);

            hoursObj.max=$scope.myEndTime;
          }
        };

        $scope.sendToApproval = function(room) {
            if(room.images.length == 0)
            {
              flash.setMessage(URLFactory.MESSAGES.ROOM_IMAGES_SENDINGAPPROVAL_ERROR,URLFactory.MESSAGES.ERROR);
            }  
            else
            {
                RoomService.sendToApprove.update({"roomId":room._id},function(response){
                      flash.setMessage(URLFactory.MESSAGES.ROOM_SENT_FOR_APPROVAL_SUCCESS,URLFactory.MESSAGES.SUCCESS);
                      room.sentToAdminApproval=true;
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
                          room.status="published";  
                          flash.setMessage(URLFactory.MESSAGES.ROOM_PUBLISHED_SUCCESS,URLFactory.MESSAGES.SUCCESS);
                    }, function (error) {
                         console.log(error);
                    });
              }       
         

        };

        $scope.checkingLoggedinUserIsAdmin=function(){
           RoomService.checkingadmin.get({}, function(response) {
                     $scope.adminId=response._id;
                     $scope.loggedinuserrole=MeanUser.user.role;
                     var checkingadmin=$scope.loggedinuserrole.indexOf($scope.adminId);
                     if(checkingadmin < 0)
                     {
                      $scope.loggedinuserisadmin=false;
                     }
                     else
                     {
                      $scope.loggedinuserisadmin=true;
                     }  
                  }, function(error) {
                      $scope.error = error;
                    });
       };

      }
  ]);