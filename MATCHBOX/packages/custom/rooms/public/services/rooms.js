'use strict';

angular.module('mean.rooms').factory('RoomService', 

  function($resource) {
    return {
         loadroomtypes : $resource('/api/addroom/loadroomtypes', {}, {
          update: { method: 'PUT' },
          query: { method: 'GET', isArray: true }
        }),
       roomdetails: $resource('/api/roomdetails/:roomId', {roomId: '@_id'}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
        roomdatefilter: $resource('/api/getRoomsFilterDate', {}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
       amenityroomlist: $resource('/api/space/room/amenity', {}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
       loadroomparticulertospace: $resource('/api/space/room/getroomsparticulertospace', {}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
        updatescheduleeditdata: $resource('/api/scheduleeditroomdetails/:scheduleeditroomId', {scheduleeditroomId: '@_id'}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
        getRoomByRoomType: $resource('/api/room/roomType', {}, {
        	update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
        getroomtypename: $resource('/api/room/gettingroomtypename', {}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
        roomspricesort: $resource('/api/getRoomsPriceSort', {}, {
        	 update: {
                 method: 'PUT' // this method issues a PUT request
             },
             query: {
                 method: 'GET',
                 isArray: true
             }
         }),
         checkingadmin: $resource('/api/room/checkingadmin', {}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
        roomsratingsort: $resource('/api/getRoomsRatingSort', {}, {
        	update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
         adminrooms: $resource('/api/room/admin/getAllRooms', {}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
         approveRoom: $resource('/api/room/admin/approveRoom', {}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
         rejectRoom: $resource('/api/room/admin/rejectRoom', {}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
         sendToApprove: $resource('/api/room/admin/sendToAdminApproval', {}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
          publishRoom: $resource('/api/room/admin/publishRoom', {}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
       getRoomsbyStatus: $resource('/api/room/roomType/status', {}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
       activateRoom: $resource('/api/room/activateRoom', {}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),

        approveSpaceByAdmin: $resource('/api/admin/space/approval', {}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
		virtualOffice : $resource('/api/virtualOffices/:virtualOfficeId', {virtualOfficeId : '@virtualOfficeId' }, {
			update: {
				method: 'PUT' // this method issues a PUT request
			},
			query: {
				method: 'GET',
				isArray: true
			}
		}),
        roomsForAdminLogin : $resource('/api/adminLogin/getAllRooms', {}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
         roomsByRoomTypeFilter : $resource('/api/adminLogin/roomTypeFilter/getRooms', {}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }), 	
        
        fetchPartnerForRoom : $resource('/api/fetch/user/:userId', { userId: '@userId'}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
         virtualOfficeDetailsBySpace : $resource('/api/space/virtualoffice/rooms', {}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
        virtualOfficePartner : $resource('/api/virtualoffice/rooms/partner', {}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        })

    };
  });
