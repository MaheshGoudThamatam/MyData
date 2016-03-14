'use strict';

angular.module('mean.system').service('URLFactory', function (MESSAGES, PROFILE, USERS, BRANCH, COURSE, INVESTOR, JOBS, SKILLSET, JOBSSITES, MENTOR, ONLINETEST, ROLE, SKILL) {
    return {
        MESSAGES: MESSAGES,
        PROFILE: PROFILE,
        USERS: USERS,
        BRANCH: BRANCH,
        COURSE: COURSE,
        INVESTOR: INVESTOR,
        JOBS: JOBS,
        SKILLSET: SKILLSET,
        JOBSSITES: JOBSSITES,
        MENTOR: MENTOR,
        ONLINETEST: ONLINETEST,
        ROLE: ROLE,
        SKILL: SKILL
    };
});