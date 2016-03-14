'use strict';

/* JSHint -W098 */
// The Package is past automatically as first parameter
module.exports = function( CourseStudent,app, auth, database) {

  var courseStudentCtrl = require('../controllers/course_student.js')(CourseStudent);
	
  app.route('/api/course/student-batch/pagination')
    .get(courseStudentCtrl.studentByBatchesBasedOnCourse);
  
  app.route('/api/course/:courseId/batch/:batchId/student/:studentId')
    .get(courseStudentCtrl.loadStudentCourse);
  
  app.route('/api/course/:courseId/branch/:branchId')
  .get(courseStudentCtrl.branchStudentCourse);
  
  app.route('/api/studentCourse/:studentCourseId')
  .put(courseStudentCtrl.updateStudentCourse);
  
  
  app.param('courseId', courseStudentCtrl.course);
  app.param('branchId', courseStudentCtrl.branch);
  app.param('batchId', courseStudentCtrl.batch);
  app.param('studentId', courseStudentCtrl.student);
  app.param('studentCourseId', courseStudentCtrl.studentCourse);
};
