'use strict';

module.exports = {
    ERRORS: {
        //User Management Error Codes
        ERROR_1001: {
            errorCode: 'user_1001',
            param: 'username',
            msg: 'Entered username Id is already in use'
        },
        ERROR_1002: {
            errorCode: 'user_1002',
            param: 'name',
            msg: 'You must enter a name'
        },
        ERROR_1003: {
            errorCode: 'user_1003',
            param: 'email',
            msg: 'You must enter a valid email address'
        },
        ERROR_1004: {
            errorCode: 'user_1004',
            param: 'password',
            msg: 'Password must be between 8-20 characters long'
        },
        ERROR_1005: {
            errorCode: 'user_1005',
            param: 'username',
            msg: 'Username must be alphanumeric only, no space( less than 50 characters)'
        },
        ERROR_1006: {
            errorCode: 'user_1006',
            param: 'confirmPassword',
            msg: 'Passwords does not match'
        },
        ERROR_1007: {
            errorCode: 'user_1007',
            param: 'Invalid User',
            msg: 'Invalid User : User already registered with different provider.'
        },
        ERROR_1008: {
            errorCode: 'user_1008',
            param: 'email',
            msg: 'Username not available'
        },
        ERROR_1009: {
            errorCode: 'user_1009',
            param: 'Token',
            msg: 'Token invalid or expired'
        },
        ERROR_1010: {
            errorCode: 'user_1010',
            param: 'currentPassword',
            msg: 'Invalid password.'
        },
        ERROR_1011: {
            errorCode: 'user_1011',
            param: 'UsersList',
            msg: 'Cannot list the users.'
        },
        ERROR_1012: {
            errorCode: 'user_1012',
            param: 'Authorization',
            msg: 'User is unauthorized to access this page.'
        },

        ERROR_1101: {
            errorCode: 'Location_1101',
            param: 'branchName',
            msg: 'BranchName already taken'
        },
        ERROR_1102: {
            errorCode: 'Location_1102',
            param: 'Cityname',
            msg: 'CityName already taken'
        },
        ERROR_1103: {
            errorCode: 'Location_1103',
            param: 'ZoneName',
            msg: 'ZoneName already taken'
        },
        ERROR_1104: {
            errorCode: 'Location_1104',
            param: 'CountryName',
            msg: 'CountryName already taken'
        },
        ERROR_1201: {
            errorCode: 'Badge_1201',
            param: 'badgeName',
            msg: 'BadgeName already taken'
        },
        ERROR_1301: {
            errorCode: 'Skill_1301',
            param: 'SkillName',
            msg: 'SkillName already taken'
        },
        ERROR_1401: {
            errorCode: 'Skill_1401',
            param: 'name',
            msg: 'Name already taken'
        }
    },
    SUCCESS: {
        SUCCESS_001: {
            successCode: 'user_001',
            param: 'logout',
            msg: 'Logout Successfully.'
        },
        SUCCESS_002: {
            successCode: 'user_002',
            param: 'email',
            msg: 'Username available'
        },
        SUCCESS_003: {
            successCode: 'user_003',
            param: 'password',
            msg: 'Password changed Successfully'
        }
    }
};