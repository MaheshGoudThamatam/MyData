'use strict';
angular.module('mean.system').constant('MESSAGES', {
    SUCCESS: 'success',
    ERROR: 'error',
    INFO: 'info',
    ADMIN: 'admin',
    DASHBOARD_URL: '/profile/dashboard',
    PERMISSION_DENIED: 'Permission Denied, You do not have right permission to perform operation',
    DELETE_MODEL: '#MODEL#',
    DELETE_TITLE: 'Delete #MODEL#',
    DELETE_MESSAGE: 'Are you sure you want to delete the #MODEL#?',
    FEATURE_ADD_SUCCESS: 'Feature added successfully.',
    FEATURE_DELETE_SUCCESS: 'Feature deleted successfully.',
    FEATURE_UPDATE_SUCCESS: 'Feature updated successfully.',
    ROLE_ADD_SUCCESS: 'Role added successfully.',
    ROLE_DELETE_SUCCESS: 'Role deleted successfully.',
    ROLE_UPDATE_SUCCESS: 'Role updated successfully.',
    SKILL_ADD_SUCCESS: 'Skill added successfully.',
    SKILL_DELETE_SUCCESS: 'Skill deleted successfully.',
    SKILL_UPDATE_SUCCESS: 'Skill updated successfully.',
    BADGE_ADD_SUCCESS: 'Badge added successfully.',
    BADGE_DELETE_SUCCESS: 'Badge deleted successfully.',
    BADGE_UPDATE_SUCCESS: 'Badge updated successfully.',
    COUNTRY_ADD_SUCCESS: 'Country added successfully.',
    COUNTRY_DELETE_SUCCESS: 'Country deleted successfully.',
    COUNTRY_UPDATE_SUCCESS: 'Country updated successfully.',
    SITE_ADD_SUCCESS: 'Site added successfully.',
    SITE_DELETE_SUCCESS: 'Site deleted successfully.',
    SITE_UPDATE_SUCCESS: 'Site updated successfully.',
    FEATURECATEGORY_ADD_SUCCESS: 'Site added successfully.',
    FEATURECATEGORY_DELETE_SUCCESS: 'Site deleted successfully.',
    FEATURECATEGORY_UPDATE_SUCCESS: 'Site updated successfully.',
    ZONE_ADD_SUCCESS: 'Zone added successfully.',
    ZONE_DELETE_SUCCESS: 'Zone deleted successfully.',
    ZONE_UPDATE_SUCCESS: 'Zone updated successfully.',
    MENTOR_REQUEST_SUCCESS: 'Request raised successfully',
    CITY_ADD_SUCCESS: 'City added successfully.',
    CITY_DELETE_SUCCESS: 'City deleted successfully.',
    CITY_UPDATE_SUCCESS: 'City updated successfully.',
    BRANCH_ADD_SUCCESS: 'Branch added successfully.',
    BRANCH_DELETE_SUCCESS: 'Branch deleted successfully.',
    BRANCH_UPDATE_SUCCESS: 'Branch updated successfully.',
    MENTOR_PROJECT_ADD_SUCCESS: 'Project added successfully',
    MENTOR_PROJECT_DELETE_SUCCESS: 'Project deleted successfully',
    MENTOR_PROJECT_UPDATE_SUCCESS: 'Project updated successfully',
    USER_ADD_SUCCESS: 'User added successfully.',
    USER_DELETE_SUCCESS: 'User deleted successfully.',
    USER_UPDATE_SUCCESS: 'User updated successfully.',
    PROJECT_IMAGE_ADD: 'Image uploaded successfully',
    MENTOR_PROJECT_SUCCESS: 'Approved successfully',
    MENTOR_FILE_UPLOAD_ERROR: 'Only PDF/DOCX file is allowed',
    MENTOR_FILE_UPLOAD_SUCCESS: 'File uploaded successfully',
    MENTOR_ADDRESS_ERROR: 'Oops! Some fields are missing!',
    MENTOR_REQUEST_NO_DATA: 'Oops! No data available!',
    COURSE_ADD_SUCCESS: 'Course added successfully.',
    COURSE_DELETE_SUCCESS: 'Course deleted successfully.',
    COURSE_UPDATE_SUCCESS: 'Course updated successfully.',
    ONLINETEST_ADD_SUCCESS: 'Onlinetest added successfully',
    ONLINETEST_UPDATE_SUCCESS: 'Onlinetest updated successfully',
    ONLINETEST_DELETE_SUCCESS: 'Onlinetest deleted successfully',
    COURSEPROJECT_ADD_SUCCESS: 'courseproject added successfully',
    COURSEPROJECT_UPDATE_SUCCESS: 'courseproject updated successfully',
    COURSEPROJECT_DELETE_SUCCESS: 'courseproject deleted successfully',
    BATCH_ADD_SUCCESS: 'Batch added successfully.',
    BATCH_DELETE_SUCCESS: 'Batch deleted successfully.',
    BATCH_UPDATE_SUCCESS: 'Batch updated successfully.',
    HOLIDAY_ADD_SUCCESS: 'Holiday added successfully',
    HOLIDAY_UPDATE_SUCCESS: 'Holiday updated successfully',
    HOLIDAY_DELETE_SUCCESS: 'Holiday deleted successfully',
    FRANCHISE_ADD_SUCCESS: 'Franchise added successfully',
    FRANCHISE_UPDATE_SUCCESS: 'Franchise updated successfully',
    FRANCHISE_DELETE_SUCCESS: 'Franchise deleted successfully',
    LESSON_UPDATE_SUCCESS : 'Lesson updated successfuly',
    LESSON_DELETE_SUCCESS : 'Lesson deleted successfuly',
    CONTENT_ADD_SUCCESS : 'Content added successfuly',
    CONTENT_UPDATE_SUCCESS : 'Content updated successfuly',
    CONTENT_DELETE_SUCCESS : 'Content deleted successfuly',
    COUNSELLING_NOT_CLOSED: {
        errorStatus: "1000",
        errObj : 'Oops! Previous request still not closed.'
    },
    COUNSELLING_REQUEST_RAISED: 'Request raised successfully',
    COUNSELLING_REQUEST_DELETE: 'Request deleted successfully',
    TOPIC_UPDATE_SUCCESS : 'Topic updated Successfully',
    TOPIC_DELETE_SUCCESS : 'Topic deleted Successfully',
    SUBTOPIC_UPDATE_SUCCESS : 'Subtopic updated Successfully',
    SUBTOPIC_DELETE_SUCCESS : 'Subtopic deleted Successfully',
    COUNSELLING_SCHEDULE_CREATE: 'Counselling schedule created successfully',
    COURSE_REQ_SUCCESS : 'Course request raised successfully',
    COURSE_PUBLISH_SUCCESS : 'Course Publish Successfully',
    CHAPTER_UPDATE_SUCCESS : 'Chapter updated successfuly',
    CHAPTER_DELETE_SUCCESS : 'Chapter deleted successfuly',
    COURSE_REQ_SUCCESS : 'Course request raised successfully',
    COURSE_PUBLISH_SUCCESS : 'Course Publish Successfully',
    CURRICULUM_ADD_SUCCESS : 'Curriculum Added Successfully',
    CURRICULUM_UPDATE_SUCCESS : 'Curriculum update Successfully',
    CURRICULUM_DELETE_SUCCESS : 'Curriculum update Successfully',
    COUNSELLINGCHECKLIST_ADD_SUCESS:'Counselling checklist added successfully',
    COUNSELLINGCHECKLIST_UPDATE_SUCESS:'Counselling checklist updated successfully',
    COUNSELLINGCHECKLIST_DELETED_SUCESS:'Counselling checklist updated successfully',
    COUNSELLING_MENTOR_ASSIGNED : 'Mentor assigned successfully',
    COUNSELLING_REQUEST_REJECTED : 'Request rejected successfully',
    COUNSELLING_SCHEDULE_DELETE: 'Counselling schedule deleted successfully',
    ATTENDANCE_ADD_SUCCESS: 'Attendance added successfully',
    ATTENDANCE_UPDATE_SUCCESS: 'Attendance updated successfully',
    ATTENDANCE_EVENT_ERROR: 'Cannot take attendance for future date',
    SKILLSET_ADD_SUCCESS: 'Skillset add successfully',
    SKILLSET_DELETE_SUCCESS: 'Skillset removed successfully',
    SKILLSET_UPDATE_SUCCESS: 'Skillset updated successfully',
    CURRICULUM_ADD_SUCCESS: 'Curriculum Added Successfully',
    CURRICULUM_UPDATE_SUCCESS: 'Curriculum update Successfully',
    CURRICULUM_DELETE_SUCCESS: 'Curriculum update Successfully',
    CURRICULUM_NO_SUBTOPICS : 'Cannot create a subtopic for a Project or Test',
    STUDENT_BATCH_UPDATE_SUCCESS:'Student Batch change successfuly ',
    RISKFACTOR_ADD_SUCCESS: 'RiskFactor added Successfully',
    RISKFACTOR_UPDATE_SUCCESS: 'RiskFactor updated Successfully',
    RISKFACTOR_DELETE_SUCCESS: 'RiskFactor deleted Successfully',
    MATERIAL_ADD_SUCCESS: 'Material Index Added Succesfully',
    MATERIAL_UPDATE_SUCCESS: 'Material Updated Succesfully',
    POLICY_ASSIGN_SUCCESS: 'Policy assigned successfully'
});