angular.module('mean.skill').constant('SKILL', {
    URL_PATH: {
        SKILL: '/admin',
        SKILL_LIST: '/skill',
        SKILL_CREATE: '/skill/create',
        SKILL_EDIT: '/skill/:skillId/edit',

        BADGE: '/admin',
        BADGE_LIST: '/badge',
        BADGE_CREATE: '/badge/create',
        BADGE_EDIT: '/badge/:badgeId/edit'
    },
    PATH: {
        SKILL_LIST: '/admin/skill',
        SKILL_CREATE: '/admin/skill/create',
        SKILL_EDIT: '/admin/skill/:skillId/edit',
        BADGE_LIST: '/admin/badge',
        BADGE_CREATE: '/admin/badge/create',
        BADGE_EDIT: '/admin/badge/:badgeId/edit'
    },
    FILE_PATH: {
        SKILL: 'system/views/admin_layout.html',
        SKILL_LIST: 'skill/views/skill_list.html',
        SKILL_CREATE: 'skill/views/skill_create.html',
        SKILL_EDIT: 'skill/views/skill_edit.html',

        BADGE: 'system/views/admin_layout.html',
        BADGE_LIST: '/skill/views/badge_list.html',
        BADGE_CREATE: '/skill/views/badge_create.html',
        BADGE_EDIT: '/skill/views/badge_edit.html'
    },
    STATE: {
        SKILL: 'skill',
        SKILL_LIST: 'skill.list',
        SKILL_CREATE: 'skill.create',
        SKILL_EDIT: 'skill.edit',

        BADGE: 'badge',
        BADGE_LIST: 'badge.list',
        BADGE_CREATE: 'badge.create',
        BADGE_EDIT: 'badge.edit'
    }
});
