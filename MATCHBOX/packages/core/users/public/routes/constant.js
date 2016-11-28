angular.module('mean.users').constant('USERS', {
    URL_PATH: {
        AUTH: '/auth',
        LOGIN: '/login',
        REGISTER: '/register',
        FORGOT_PASSWORD: '/forgot-password',
        RESET_PASSWORD: '/reset/:tokenId',
        CHANGE_PASSWORD : '/change-password',
        USERCONFIRMATION : '/user/confirmation',
      },

    FILE_PATH: {
        AUTH: 'users/views/index.html',
        LOGIN: 'users/views/login.html',
        REGISTER: 'users/views/register.html',
        FORGOT_PASSWORD: 'users/views/forgot-password.html',
        RESET_PASSWORD: 'users/views/reset-password.html',
        CHANGE_PASSWORD : 'users/views/change-password.html',
        USERCONFIRMATION : 'users/views/userConfirmation.html',
    },
    
    STATE: {
        AUTH: 'auth',
        LOGIN: 'auth-login',
        REGISTER: 'auth-register',
        FORGOT_PASSWORD: 'forgot-password',
        RESET_PASSWORD: 'reset-password',
        CHANGE_PASSWORD : 'change-password',
        USERCONFIRMATION : 'user confirmation',
    }
});