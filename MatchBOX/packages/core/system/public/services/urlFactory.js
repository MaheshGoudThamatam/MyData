'use strict';

angular.module('mean.system').service('URLFactory', function (MESSAGES, USERS, ROOMS, SPACE, SPACE_TYPE, SUPERADMIN, AMENITY, ROLE, PARTNER, SEARCH, $uibModal,BOOKING) {

    return {
       // MESSAGES: MESSAGES,
        USERS: USERS,
        ROOMS: ROOMS,
        SPACE: SPACE,
        SPACE_TYPE: SPACE_TYPE,
        SUPERADMIN: SUPERADMIN,
        AMENITY: AMENITY,
        ROLE: ROLE,
        PARTNER: PARTNER,
        SEARCH: SEARCH,
        uibModal: $uibModal,
        BOOKING: BOOKING
    };
});