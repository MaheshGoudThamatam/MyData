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
          $scope.amenityBeforeEdit = [];
          $scope.amenityAfterEdit = [];

          $scope.virtualoffice = false;
          $scope.normaloffice = false;
          $scope.amenityAfterEdit = [];

          $scope.counter = 0;
          $scope.loadrooms = function() {
              RoomService.roomdetails.query(function(response) {
                  $scope.roomdetails = response;
              }, function(error) {
                  console.log(error);
              });
          };
          
          
          
          $scope.loadvirtualOffices = function() {
        	  $scope.dtVirOffOptions = DTOptionsBuilder.newOptions().withPaginationType('full_numbers').withDisplayLength(10);
				$scope.dtVirOffColumnDefs = [
				                   DTColumnDefBuilder.newColumnDef(0).notVisible(),
				                   DTColumnDefBuilder.newColumnDef(1),
				                   DTColumnDefBuilder.newColumnDef(2),
				                   DTColumnDefBuilder.newColumnDef(3),
				                   DTColumnDefBuilder.newColumnDef(4).notSortable()
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


                 RoomService.checkingadmin.get({}, function(response) {
                     $scope.adminId=response._id;
                     $scope.loggedinuserrole=[];
                     for(var i=0;i<MeanUser.user.role.length;i++)
                     {
                            $scope.loggedinuserrole.push(MeanUser.user.role[i]._id);
                     }
                     
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
        	  
        	  
               if($scope.loggedinuserisadmin)
                 {

                      RoomService.virtualOffice.query(function(response) {
                          $scope.virtualOffices = response;
                          $scope.virtualOfficePackages = [];
                          for(var i=0; i<  $scope.virtualOffices.length; i++){
                            for (var j=0; j<$scope.virtualOffices[i].packages.length; j++){
                              var packageObj = {};
                              packageObj.virtualOfficeId = $scope.virtualOffices[i]._id;
                              packageObj.spaceName = $scope.virtualOffices[i].spaceId.name;
                              packageObj.partnerName = $scope.virtualOffices[i].spaceId.partner.first_name;
                              packageObj.spaceId = $scope.virtualOffices[i].spaceId._id;
                              packageObj.pckgObj = $scope.virtualOffices[i].packages[j];
                              $scope.virtualOfficePackages.push(packageObj);
                            }
                          }
                      }, function(error) {
                          console.log(error);
                      });

                   }   
                 else{
                       RoomService.virtualOfficePartner.query(function(response) {
                          $scope.virtualOffices = response;
                          console.log(response);
                          $scope.virtualOfficePackages = [];
                          for(var i=0; i<  $scope.virtualOffices.length; i++){
                            for (var j=0; j<$scope.virtualOffices[i].packages.length; j++){
                              var packageObj = {};
                              packageObj.virtualOfficeId = $scope.virtualOffices[i]._id;
                              packageObj.spaceName = $scope.virtualOffices[i].spaceId.name;
                              packageObj.partnerName = $scope.virtualOffices[i].spaceId.partner.first_name;
                              packageObj.spaceId = $scope.virtualOffices[i].spaceId._id;
                              packageObj.pckgObj = $scope.virtualOffices[i].packages[j];
                              $scope.virtualOfficePackages.push(packageObj);
                            }
                          }
                      }, function(error) {
                          console.log(error);
                      });

                 }
        	  
			
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
                  else{
                        room.isActive=false;
                        flash.setMessage(URLFactory.MESSAGES.ROOM_DEACTIVATE_SUCCESS,URLFactory.MESSAGES.SUCCESS);                
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

          $scope.editroom = function(roomobject) {
              var urlPath = URLFactory.ROOMS.URL_PATH.ROOM_EDIT.replace(":roomId", roomobject._id);
              $location.path(urlPath);
          };
          $scope.singleRoomDetail = function() {
              RoomService.roomdetails.get({
                  'roomId': $stateParams.roomId
              }, function(response) {
            	  $scope.response = response;
                   var seats = 0;
                   var startCapacity = 0;
                    $scope.roomseats =[];

                    if(response.roomtype.name == "Hot Desk")
                      {   
                         
                      }
                    if(response.roomtype.name == "Meeting Room")
                      {    
                           seats = 8;
                           startCapacity = 2;
                      } 
                    if(response.roomtype.name == "Training Room")
                      {   
                          seats = 50;
                          startCapacity = 11;
                      } 
                     if(response.roomtype.name == "Board Room")
                      {   
                          seats = 30;
                          startCapacity = 9;
                      } 
                     if(response.roomtype.name == "Virtual Office")
                      {   
                         $scope.roomseats=[];
                      } 
                     if(response.roomtype.name == "Plug-N-Play")
                      {   
                          $scope.roomseats=[];
                      }   
                         
                         for(var i= startCapacity; i<=seats ; i++){
                           var obj = {"capacityvalue" : i}
                           $scope.roomseats.push(obj);
                         }

                    $scope.room = response;
                    for(var i=0; i < $scope.room.amenities.length;i++){
                    	if($scope.room.amenities[i].facilityavailable)
                    		{
                    		$scope.amenityBeforeEdit.push({});
                    		}
                    }
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
          

          $scope.getPackage = function() {
        	  RoomService.virtualOffice.get({
        		  'virtualOfficeId': $stateParams.virtualOfficeId
        	  }, function(response) {
        		  $scope.virtualOffice = response;
        		  for(var i=0; i<response.packages.length; i++){
        			  if(response.packages[i]._id == $stateParams.packageId){
        				  $scope.packageObj = response.packages[i];
        			  }
        		  }
        	  }, function(error) {
        		  $scope.error = error;
        	  });

          };
          
          
          $scope.saveEditedPackage = function(isValid) {
        	  if (isValid) {

              var str = $scope.packageObj.packageUrl;
              var checkhttp = str.indexOf("http://");
                  if(checkhttp == -1)
                  {
                    $scope.packageObj.packageUrl="http://"+$scope.packageObj.packageUrl;
                  }
              

        		  for(var i=0; i<$scope.virtualOffice.packages.length; i++){
        			  if($scope.virtualOffice.packages[i]._id == $scope.packageObj._id){
        				  $scope.virtualOffice.packages[i] = $scope.packageObj;
        			  }
        		  }
        		  var virtualOffice  = new RoomService.virtualOffice($scope.virtualOffice);
        		  virtualOffice.$update({
        			  'virtualOfficeId': $scope.virtualOffice._id
        		  },function(response) {
                      flash.setMessage(URLFactory.MESSAGES.PACKAGE_EDIT_SUCCESS,URLFactory.MESSAGES.SUCCESS);
                      $location.path(URLFactory.ROOMS.URL_PATH.ROOM_LIST);
                    
                  }, function(error) {
                      $scope.error = error;
                  });
        		  
        		  
        	  }else {
                  $scope.submitted = true;
              }
		}
          
          
          
          
          $scope.saveEditedRoomDetail = function(isValid) {
              if (isValid) {

                    if($scope.room.images.length == 0)
                    {
                      flash.setMessage(URLFactory.MESSAGES.ROOM_CREATE_IMAGE_VALIDATION_MESSAGE,URLFactory.MESSAGES.ERROR);
                    }
                   else
                   {
                	  for(var i=0; i < $scope.room.amenities.length;i++){
                      	if($scope.room.amenities[i].facilityavailable)
                      		{
                      		$scope.amenityAfterEdit.push({});
                      		}
                      }
                	  if($scope.amenityBeforeEdit.length == $scope.amenityAfterEdit.length)
                		  {
                		  $scope.room.amenityEdited = false;
                		  }
                	  else{
                		  $scope.room.amenityEdited = true;
                	      }
                      $scope.room.roomsslotschedule=$scope.officeHoursRoomsSlot;
                      $scope.room.isAdminEdit=$scope.loggedinuserisadmin;

                      for(var j=0;j<$scope.room.roomsslotschedule.length;j++){
                        var startTimeDateTimeObject=new Date($scope.room.roomsslotschedule[j].startTime);
                            var starttimehourscreateroom=startTimeDateTimeObject.getHours();
                            var starttimeminutescreateroom=startTimeDateTimeObject.getMinutes();
                            var startTimeMinutes = starttimehourscreateroom*60+starttimeminutescreateroom; 
                            $scope.room.roomsslotschedule[j].startTimeMinutes=startTimeMinutes;   

                        var endTimeDateTimeObject=new Date($scope.room.roomsslotschedule[j].endTime);
                            var endtimehourscreateroom=endTimeDateTimeObject.getHours();
                            var endtimeminutescreateroom=endTimeDateTimeObject.getMinutes();

                            if($scope.room.roomsslotschedule[j].isAllday)
                            {
                              var endTimeMinutes = endtimehourscreateroom*60+endtimeminutescreateroom+1440;
                            } 
                            else
                            {
                               var endTimeMinutes = endtimehourscreateroom*60+endtimeminutescreateroom;
                            } 

                            $scope.room.roomsslotschedule[j].endTimeMinutes=endTimeMinutes; 
                      }

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
                }// Inside else closing

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
      date.setSeconds(0);
      date.setMilliseconds(0);
      hoursObj.startTime = date;
      var enddate = new Date();
      enddate.setHours(0);
      enddate.setMinutes(0);
      enddate.setSeconds(0);
      enddate.setMilliseconds(0);
      hoursObj.endTime = enddate;

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
              /*alert('Only PNG and JPEG are accepted.');*/
              flash.setMessage(MESSAGES.FILETYPE,MESSAGES.ERROR);
              return;
          }
          if (image.size > (10*(1024 * 1024))) {
              /*alert('file size exceeded.');*/
	        	flash.setMessage(MESSAGES.FILESIZEEXCEEDED,MESSAGES.ERROR);
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
        	flash.setMessage(MESSAGES.IMAGESUCCESS,MESSAGES.SUCCESS);
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
          var spaceofficehours=$scope.room.spaceId.officeHours;

          if($scope.room.roomsslotschedule)
            { 
              for (var i=0; i< $scope.room.roomsslotschedule.length; i++){

                if($scope.room.roomsslotschedule[i].isAllday || spaceofficehours[i].isAllday)
                  {
                          var obj = {};
                              obj.day = days[i];


                        $scope.myStartTimeFromRoomObject = new Date($scope.room.roomsslotschedule[i].startTime);
                        $scope.mystartTime=new Date();
                        $scope.mystartTime.setHours($scope.myStartTimeFromRoomObject.getHours());
                        $scope.mystartTime.setMinutes($scope.myStartTimeFromRoomObject.getMinutes());
                        $scope.mystartTime.setSeconds($scope.myStartTimeFromRoomObject.getSeconds());
                        $scope.mystartTime.setMilliseconds($scope.myStartTimeFromRoomObject.getMilliseconds());
                        
                        obj.startTime = $scope.mystartTime;      

                        $scope.mytime = new Date();
                        $scope.mytime.setHours(0);
                        $scope.mytime.setMinutes(0);
                        $scope.mytime.setSeconds(0);
                        $scope.mytime.setMilliseconds(0);

                        obj.min=$scope.mytime;

                        $scope.myEndTimeFromRoomObject = new Date($scope.room.roomsslotschedule[i].endTime);
                        $scope.myEndTime=new Date();
                        $scope.myEndTime.setHours($scope.myEndTimeFromRoomObject.getHours());
                        $scope.myEndTime.setMinutes($scope.myEndTimeFromRoomObject.getMinutes());
                        $scope.myEndTime.setSeconds($scope.myEndTimeFromRoomObject.getSeconds());
                        $scope.myEndTime.setMilliseconds($scope.myEndTimeFromRoomObject.getMilliseconds());
                        obj.endTime = $scope.myEndTime;


                        $scope.myEndTimeMaximum = new Date();
                        $scope.myEndTimeMaximum.setHours(23);
                        $scope.myEndTimeMaximum.setMinutes(59);
                        $scope.myEndTimeMaximum.setSeconds(0);
                        $scope.myEndTimeMaximum.setMilliseconds(0);

                        obj.max=$scope.myEndTimeMaximum;

                        obj.isAllday=$scope.room.roomsslotschedule[i].isAllday;

                        obj.isClosed=$scope.room.roomsslotschedule[i].isClosed;

                        obj.isAlldaylogic=spaceofficehours[i].isAllday;

                        obj.isClosedaylogic=spaceofficehours[i].isClosed;

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

                            var mynewstarttimeminimum=new Date(spaceofficehours[i].startTime);
                            var mynewsethourstarttimeminimum=mynewstarttimeminimum.getHours();
                            var mynewsetminutestarttimeminimum=mynewstarttimeminimum.getMinutes();
                            var mynewsetsecondstarttimeminimum=mynewstarttimeminimum.getSeconds();
                            var mynewsetmillisecondstarttimeminimum=mynewstarttimeminimum.getMilliseconds();

                            var mynewendtimemaximum=new Date(spaceofficehours[i].endTime);
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

                           obj.isAlldaylogic=spaceofficehours[i].isAllday;

                           obj.isClosedaylogic=spaceofficehours[i].isClosed;

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

             if($scope.loggedinuserisadmin)
              {
                  $location.path(URLFactory.ROOMS.URL_PATH.ADMIN_ROOM_LIST);
              }  
              else
              {
                  $location.path(URLFactory.ROOMS.URL_PATH.ROOM_LIST);
              }
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
      $scope.mytime.setSeconds(0);
      $scope.mytime.setMilliseconds(0);
      
      $scope.myEndTime = new Date();
      $scope.myEndTime.setHours(0);
      $scope.myEndTime.setMinutes(0);
      $scope.myEndTime.setSeconds(0);
      $scope.myEndTime.setMilliseconds(0);
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


     $scope.setFulldayClosedRoom = function(hoursObj){

      var mynewstarttime=new Date(hoursObj.min);
      var mynewsethourstarttime=mynewstarttime.getHours();
      var mynewsetminutestarttime=mynewstarttime.getMinutes();
      var mynewsetsecondstarttime=mynewstarttime.getSeconds();
      var mynewsetmillisecondstarttime=mynewstarttime.getMilliseconds();

            $scope.mytime = new Date();
            $scope.mytime.setHours(mynewsethourstarttime);
            $scope.mytime.setMinutes(mynewsetminutestarttime);
            $scope.mytime.setSeconds(mynewsetsecondstarttime);
            $scope.mytime.setMilliseconds(mynewsetmillisecondstarttime+1);


        var mynewendtime=new Date(hoursObj.max);
        var mynewsethourendtime=mynewendtime.getHours();
        var mynewsetminutendtime=mynewendtime.getMinutes();
        var mynewsetsecondendtime=mynewendtime.getSeconds();
        var mynewsetmillisecondendtime=mynewendtime.getMilliseconds();
        
            $scope.myEndTime = new Date();
            $scope.myEndTime.setHours(mynewsethourendtime);
            $scope.myEndTime.setMinutes(mynewsetminutendtime);
            $scope.myEndTime.setSeconds(mynewsetsecondendtime);
            $scope.myEndTime.setMilliseconds(mynewsetmillisecondendtime);

       };  

       $scope.setFulldayClosedRoomChecked = function(hoursObj){

      var mynewstarttime=new Date(hoursObj.startTime);
      var mynewsethourstarttime=mynewstarttime.getHours();
      var mynewsetminutestarttime=mynewstarttime.getMinutes();
      var mynewsetsecondstarttime=mynewstarttime.getSeconds();
      var mynewsetmillisecondstarttime=mynewstarttime.getMilliseconds();

            $scope.mytime = new Date();
            $scope.mytime.setHours(mynewsethourstarttime);
            $scope.mytime.setMinutes(mynewsetminutestarttime);
            $scope.mytime.setSeconds(mynewsetsecondstarttime);
            $scope.mytime.setMilliseconds(mynewsetmillisecondstarttime+1);


        var mynewendtime=new Date(hoursObj.endTime);
        var mynewsethourendtime=mynewendtime.getHours();
        var mynewsetminutendtime=mynewendtime.getMinutes();
        var mynewsetsecondendtime=mynewendtime.getSeconds();
        var mynewsetmillisecondendtime=mynewendtime.getMilliseconds();
        
            $scope.myEndTime = new Date();
            $scope.myEndTime.setHours(mynewsethourendtime);
            $scope.myEndTime.setMinutes(mynewsetminutendtime);
            $scope.myEndTime.setSeconds(mynewsetsecondendtime);
            $scope.myEndTime.setMilliseconds(mynewsetmillisecondendtime);

       };  


    $scope.toggleClosedAddRoom = function(hoursObj) {
      if(hoursObj.isClosed && hoursObj.isAllday){
        hoursObj.isAllday = false;
      }
       if(hoursObj.isClosed)
          {
            $scope.setFulldayClosedRoomChecked(hoursObj);
            hoursObj.startTime = $scope.mytime;
            hoursObj.endTime = $scope.myEndTime;
          }
      if(!hoursObj.isAllday && !hoursObj.isClosed){

            $scope.setFulldayClosedRoom(hoursObj);
        hoursObj.startTime = $scope.mytime;
        hoursObj.endTime = $scope.myEndTime;
        
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
                      room.status = "Pending";
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
        
        
        $scope.editPackage = function(virtualOffPckg) {
                 var urlPath = URLFactory.ROOMS.URL_PATH.PACKAGE_EDIT.replace(":virtualOfficeId", virtualOffPckg.virtualOfficeId);
                 urlPath = urlPath.replace(":packageId",virtualOffPckg.pckgObj._id);
                 $location.path(urlPath);
		};
        
        $scope.deletevirtualoffice = function(virtualOffPckg) {
          var retVal = confirm("Are you sure you want to delete this package?");
            if(retVal){
              	var virtualOfficeObj = {};
              	for(var i=0; i<  $scope.virtualOffices.length; i++){
                	  for (var j=0; j<$scope.virtualOffices[i].packages.length; j++){
                		  if($scope.virtualOffices[i].packages[j]._id ==  virtualOffPckg.pckgObj._id){
                			$scope.virtualOffices[i].packages.splice(j, 1);
                    		virtualOfficeObj = $scope.virtualOffices[i];
                		  }
                		
                	  }
                  }
              	var virtualOffice  = new RoomService.virtualOffice(virtualOfficeObj);
              	virtualOffice.$update({
              		'virtualOfficeId': virtualOfficeObj._id
              	},function(response) {
              		flash.setMessage(URLFactory.MESSAGES.PACKAGE_DELETE_SUCCESS,URLFactory.MESSAGES.SUCCESS);
              		$scope.loadvirtualOffices();
              	}, function(error) {
              		$scope.error = error;
              	});
          }
        };

         $scope.loadroomsAdmin = function() {
           
              RoomService.roomsForAdminLogin.query(function(response) {
                  $scope.roomdetails = response;
              }, function(error) {
                  console.log(error);
              });
          };
  

        $scope.checkingLoggedinUserIsAdmin=function(){

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


           RoomService.checkingadmin.get({}, function(response) {
                     $scope.adminId=response._id;
                     $scope.loggedinuserrole=[];
                     for(var i=0;i<MeanUser.user.role.length;i++)
                     {
                            $scope.loggedinuserrole.push(MeanUser.user.role[i]._id);
                     }
                     
                     var checkingadmin=$scope.loggedinuserrole.indexOf($scope.adminId);
                     if(checkingadmin < 0)
                     {
                      $scope.loggedinuserisadmin=false;
                       $scope.loadrooms();
                     }
                     else
                     {
                      $scope.loggedinuserisadmin=true;
                       $scope.loadroomsAdmin();
                     }  
                  }, function(error) {
                      $scope.error = error;
                    });
       };

        $scope.changingroomtypeRoomList =function(roomtype)
        {

             if(roomtype == undefined)
           {
                $scope.normaloffice=false;
                $scope.virtualoffice=false;

               RoomService.roomsForAdminLogin.query(function(response) {
                  $scope.roomdetails = response;
              }, function(error) {
                  console.log(error);
              });
           }
           else
           {

              RoomService.getroomtypename.get({
                    'roomTypeId': roomtype
                }, function(response) {
                      $scope.normaloffice=false;
                      $scope.virtualoffice=true;
                      if(response.name == "Hot Desk"  || response.name == "Meeting Room" || response.name == "Training Room" 
                         || response.name == "Board Room" || response.name == "Plug-N-Play")
                        {   
                           RoomService.roomsByRoomTypeFilter.query({"roomtype":roomtype},function(response) {
                                $scope.roomdetails = response;
                            }, function(error) {
                                console.log(error);
                            });
                        }

                       if(response.name == "Virtual Office")
                        {              
                           $scope.normaloffice=true;
                           $scope.virtualoffice=false;
                        } 
     
                }, function(error) {
                    $scope.error = error;
                });



          }
         
        };


      }
  ]);