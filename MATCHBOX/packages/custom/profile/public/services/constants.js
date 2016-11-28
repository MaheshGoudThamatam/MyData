angular.module('mean.profile').constant('USERPROFILE', {
    URL_PATH: {
        USER_PROFILE : '/user-profile',
        PRIVACY_POLICY: '/privacy-policy',
        CONTACT_US: '/contact-us',
        TERMS_OF_USE: '/terms',
        ABOUT_US: '/about-us'
      },

    FILE_PATH: {
        USER_PROFILE: 'profile/views/user-profile.html',
        PRIVACY_POLICY: 'profile/views/privacy_policy.html',
        CONTACT_US: 'profile/views/contact_us.html',
        TERMS_OF_USE: 'profile/views/terms_of_use.html',
        ABOUT_US: 'profile/views/about_us.html'
    },
    
    STATE: {
        USER_PROFILE: 'user-profile-update',
        PRIVACY_POLICY: 'privacy-policy',
        CONTACT_US: 'contact-us',
        TERMS_OF_USE: 'terms',
        ABOUT_US: 'about-us',
    }
});