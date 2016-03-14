'use strict';

angular.module('mean.course').config(['$stateProvider', 'COURSE',
  function ($stateProvider, COURSE) {
    $stateProvider
    .state('course example page', {
      url: '/course/example',
      templateUrl: 'course/views/index.html',
    })
    .state(COURSE.STATE.ADMIN_COURSE_LIST, {
      url: COURSE.URL_PATH.ADMIN_COURSE_LIST,
      templateUrl: COURSE.FILE_PATH.ADMIN_COURSE_LIST,
      resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
    })
    .state(COURSE.STATE.ADMIN_COURSE_CREATE, {
      url: COURSE.URL_PATH.ADMIN_COURSE_CREATE,
      templateUrl: COURSE.FILE_PATH.ADMIN_COURSE_CREATE,
      resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
    })
    .state(COURSE.STATE.ADMIN_COURSE_EDIT, {
      url: COURSE.URL_PATH.ADMIN_COURSE_EDIT,
      templateUrl: COURSE.FILE_PATH.ADMIN_COURSE_EDIT,
      resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
    })
    .state(COURSE.STATE.COURSE_LIST, {
      url: COURSE.URL_PATH.COURSE_LIST,
      templateUrl: COURSE.FILE_PATH.COURSE_LIST,
      /*resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }*/
    })
    .state(COURSE.STATE.COURSE_LIST_DETAILS, {
      url: COURSE.URL_PATH.COURSE_LIST_DETAILS,
      templateUrl: COURSE.FILE_PATH.COURSE_LIST_DETAILS,
      /*resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }*/
    })
    .state(COURSE.STATE.COURSE_TABS, {
      url: COURSE.URL_PATH.COURSE_TABS,
      templateUrl: COURSE.FILE_PATH.COURSE_TABS,
      resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
    })
    .state(COURSE.STATE.COURSE_MYCOURSES, {
      url: COURSE.URL_PATH.COURSE_MYCOURSES,
      templateUrl: COURSE.FILE_PATH.COURSE_MYCOURSES,
      resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
    })
    .state(COURSE.STATE.COURSE_SELECTED, {
      url: COURSE.URL_PATH.COURSE_SELECTED,
      templateUrl: COURSE.FILE_PATH.COURSE_SELECTED,
      resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
    })
    .state(COURSE.STATE.COURSE_PAYEMENT, {
      url: COURSE.URL_PATH.COURSE_PAYEMENT,
      templateUrl: COURSE.FILE_PATH.COURSE_PAYEMENT,
      resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
    })
    .state(COURSE.STATE.COURSE_FORM_CREATE, {
      url: COURSE.URL_PATH.COURSE_FORM_CREATE,
      templateUrl: COURSE.FILE_PATH.COURSE_FORM_CREATE,
      resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
    })
    .state(COURSE.STATE.ADMIN_BATCH_CREATE, {
      url: COURSE.URL_PATH.ADMIN_BATCH_CREATE,
      templateUrl: COURSE.FILE_PATH.ADMIN_BATCH_CREATE,
      resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
    })
    .state(COURSE.STATE.ADMIN_BATCH_LIST, {
      url: COURSE.URL_PATH.ADMIN_BATCH_LIST,
      templateUrl: COURSE.FILE_PATH.ADMIN_BATCH_LIST,
      resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
    })
    .state(COURSE.STATE.ADMIN_BATCH_EDIT, {
      url: COURSE.URL_PATH.ADMIN_BATCH_EDIT,
      templateUrl: COURSE.FILE_PATH.ADMIN_BATCH_EDIT,
      resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
    })
    .state(COURSE.STATE.ADMIN_USERCOUNSELLING_LIST, {
      url: COURSE.URL_PATH.ADMIN_USERCOUNSELLING_LIST,
      templateUrl: COURSE.FILE_PATH.ADMIN_USERCOUNSELLING_LIST,
      resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
    })
    .state(COURSE.STATE.ADMIN_USERCOUNSELLING_EDIT, {
      url: COURSE.URL_PATH.ADMIN_USERCOUNSELLING_EDIT,
      templateUrl: COURSE.FILE_PATH.ADMIN_USERCOUNSELLING_EDIT,
      resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
    })
    .state(COURSE.STATE.COURSE_TEST_REDIRECT, {
      url: COURSE.URL_PATH.COURSE_TEST_REDIRECT,
      templateUrl: COURSE.FILE_PATH.COURSE_TEST_REDIRECT,
      resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
    })
    .state(COURSE.STATE.COURSE_CURRICULUM, {
      url: COURSE.URL_PATH.COURSE_CURRICULUM,
      templateUrl: COURSE.FILE_PATH.COURSE_CURRICULUM,
      resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
    })

    .state(COURSE.STATE.ADMIN_COURSE_REQUEST, {
      url: COURSE.URL_PATH.ADMIN_COURSE_REQUEST,
      templateUrl: COURSE.FILE_PATH.ADMIN_COURSE_REQUEST,
      resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
    })
    .state(COURSE.STATE.ADMIN_STUDENT_LIST, {
      url: COURSE.URL_PATH.ADMIN_STUDENT_LIST,
      templateUrl: COURSE.FILE_PATH.ADMIN_STUDENT_LIST,
      resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
    })
    .state(COURSE.STATE.STUDENT_METRICS, {
      url: COURSE.URL_PATH.STUDENT_METRICS,
      templateUrl: COURSE.FILE_PATH.STUDENT_METRICS,
      resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
    })
    .state(COURSE.STATE.ADMIN_STUDENT_MANAGE, {
      url: COURSE.URL_PATH.ADMIN_STUDENT_MANAGE,
      templateUrl: COURSE.FILE_PATH.ADMIN_STUDENT_MANAGE,
      resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
    })
    .state(COURSE.STATE.ADMIN_COURSELOAN, {
      url: COURSE.URL_PATH.ADMIN_COURSELOAN,
      templateUrl: COURSE.FILE_PATH.ADMIN_COURSELOAN,
      resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
    })
    .state(COURSE.STATE.ADMIN_COURSELOAN_CREATE, {
      url: COURSE.URL_PATH.ADMIN_COURSELOAN_CREATE,
      templateUrl: COURSE.FILE_PATH.ADMIN_COURSELOAN_CREATE,
      resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
    })
    .state(COURSE.STATE.COURSE_ONLINETEST, {
      url: COURSE.URL_PATH.COURSE_ONLINETEST,
      templateUrl: COURSE.FILE_PATH.COURSE_ONLINETEST,
      resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
    })
    .state(COURSE.STATE.STUDENT_EDITPROFILE, {
      url: COURSE.URL_PATH.STUDENT_EDITPROFILE,
      templateUrl: COURSE.FILE_PATH.STUDENT_EDITPROFILE,
      resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
    })
    .state(COURSE.STATE.COURSE_DISCOUNT, {
      url: COURSE.URL_PATH.COURSE_DISCOUNT,
      templateUrl: COURSE.FILE_PATH.COURSE_DISCOUNT,
      resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
    })
    .state(COURSE.STATE.MYCOURSE, {
      url: COURSE.URL_PATH.MYCOURSE,
      templateUrl: COURSE.FILE_PATH.MYCOURSE,
      resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
    })
    .state(COURSE.STATE.COURSE_COURSEMATERIALS, {
      url: COURSE.URL_PATH.COURSE_COURSEMATERIALS,
      templateUrl: COURSE.FILE_PATH.COURSE_COURSEMATERIALS,
      resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
    })
    .state(COURSE.STATE.COURSE_SCHEDULE, {
      url: COURSE.URL_PATH.COURSE_SCHEDULE,
      templateUrl: COURSE.FILE_PATH.COURSE_SCHEDULE,
      resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
    })
    .state(COURSE.STATE.COURSE_MENTOR, {
      url: COURSE.URL_PATH.COURSE_MENTOR,
      templateUrl: COURSE.FILE_PATH.COURSE_MENTOR,
      resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
    })
    .state(COURSE.STATE.COURSE_BATCHMATES, {
      url: COURSE.URL_PATH.COURSE_BATCHMATES,
      templateUrl: COURSE.FILE_PATH.COURSE_BATCHMATES,
      resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
    })
    .state(COURSE.STATE.COURSE_TEST, {
      url: COURSE.URL_PATH.COURSE_TEST,
      templateUrl: COURSE.FILE_PATH.COURSE_TEST,
      resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
    })
    .state(COURSE.STATE.MYCOURSE_CURRICULUM, {
      url: COURSE.URL_PATH.MYCOURSE_CURRICULUM,
      templateUrl: COURSE.FILE_PATH.MYCOURSE_CURRICULUM,
      resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
    })
    .state(COURSE.STATE.COUNSELLING_REQUEST, {
      url: COURSE.URL_PATH.COUNSELLING_REQUEST,
      templateUrl: COURSE.FILE_PATH.COUNSELLING_REQUEST,
      resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
    })
    .state(COURSE.STATE.MYCOURSE_INVEST, {
      url: COURSE.URL_PATH.MYCOURSE_INVEST,
      templateUrl: COURSE.FILE_PATH.MYCOURSE_INVEST,
      resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
    })
    .state(COURSE.STATE.COURSE_INSTALLMENT_FORM, {
      url: COURSE.URL_PATH.COURSE_INSTALLMENT_FORM,
      templateUrl: COURSE.FILE_PATH.COURSE_INSTALLMENT_FORM,
      resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
    })
    .state(COURSE.STATE.ADMIN_COURSE_CURRICULUM, {
      url: COURSE.URL_PATH.ADMIN_COURSE_CURRICULUM,
      templateUrl: COURSE.FILE_PATH.ADMIN_COURSE_CURRICULUM,
      resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
    })
    .state(COURSE.STATE.ADMIN_COURSE_CURRICULUM_CREATE, {
      url: COURSE.URL_PATH.ADMIN_COURSE_CURRICULUM_CREATE,
      templateUrl: COURSE.FILE_PATH.ADMIN_COURSE_CURRICULUM_CREATE,
      resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
    })
    .state(COURSE.STATE.ADMIN_COURSE_CURRICULUM_EDIT, {
      url: COURSE.URL_PATH.ADMIN_COURSE_CURRICULUM_EDIT,
      templateUrl: COURSE.FILE_PATH.ADMIN_COURSE_CURRICULUM_EDIT,
      resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
    })
    .state(COURSE.STATE.ADMIN_COURSE_CURRICULUM_SESSION, {
      url: COURSE.URL_PATH.ADMIN_COURSE_CURRICULUM_SESSION,
      templateUrl: COURSE.FILE_PATH.ADMIN_COURSE_CURRICULUM_SESSION,
      resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
    })
    .state(COURSE.STATE.ADMIN_COURSE_CURRICULUM_SESSION_CREATE, {
      url: COURSE.URL_PATH.ADMIN_COURSE_CURRICULUM_SESSION_CREATE,
      templateUrl: COURSE.FILE_PATH.ADMIN_COURSE_CURRICULUM_SESSION_CREATE,
      resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
    })
    .state(COURSE.STATE.ADMIN_COURSE_CURRICULUM_SESSION_EDIT, {
      url: COURSE.URL_PATH.ADMIN_COURSE_CURRICULUM_SESSION_EDIT,
      templateUrl: COURSE.FILE_PATH.ADMIN_COURSE_CURRICULUM_SESSION_EDIT,
      resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
    })
    .state(COURSE.STATE.ADMIN_COURSE_CURRICULUM_SESSION_TOPIC, {
      url: COURSE.URL_PATH.ADMIN_COURSE_CURRICULUM_SESSION_TOPIC,
      templateUrl: COURSE.FILE_PATH.ADMIN_COURSE_CURRICULUM_SESSION_TOPIC,
      resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
    })
    .state(COURSE.STATE.ADMIN_COURSE_CURRICULUM_SESSION_TOPIC_CREATE, {
      url: COURSE.URL_PATH.ADMIN_COURSE_CURRICULUM_SESSION_TOPIC_CREATE,
      templateUrl: COURSE.FILE_PATH.ADMIN_COURSE_CURRICULUM_SESSION_TOPIC_CREATE,
      resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
    })
    .state(COURSE.STATE.ADMIN_COURSE_CURRICULUM_SESSION_TOPIC_EDIT, {
      url: COURSE.URL_PATH.ADMIN_COURSE_CURRICULUM_SESSION_TOPIC_EDIT,
      templateUrl: COURSE.FILE_PATH.ADMIN_COURSE_CURRICULUM_SESSION_TOPIC_EDIT,
      resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
    })
    .state(COURSE.STATE.ADMIN_COURSE_MATERIAL, {
      url: COURSE.URL_PATH.ADMIN_COURSE_MATERIAL,
      templateUrl: COURSE.FILE_PATH.ADMIN_COURSE_MATERIAL,
      resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
    })
    .state(COURSE.STATE.ADMIN_COURSE_MATERIAL_CREATE, {
      url: COURSE.URL_PATH.ADMIN_COURSE_MATERIAL_CREATE,
      templateUrl: COURSE.FILE_PATH.ADMIN_COURSE_MATERIAL_CREATE,
      resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
    })
    .state(COURSE.STATE.ADMIN_COURSE_MATERIAL_EDIT, {
      url: COURSE.URL_PATH.ADMIN_COURSE_MATERIAL_EDIT,
      templateUrl: COURSE.FILE_PATH.ADMIN_COURSE_MATERIAL_EDIT,
      resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
    })
    .state(COURSE.STATE.ADMIN_COURSE_BRANCH_ASSIGNMENT, {
		url : COURSE.URL_PATH.ADMIN_COURSE_BRANCH_ASSIGNMENT,
		templateUrl : COURSE.FILE_PATH.ADMIN_COURSE_BRANCH_ASSIGNMENT,
		resolve: {
            loggedin: function(MeanUser) {
                return MeanUser.checkLoggedin();
            }
        }
	})

	.state(COURSE.STATE.ADMIN_COURSE_PAYMENT_SCHEME, {
		url : COURSE.URL_PATH.ADMIN_COURSE_PAYMENT_SCHEME,
		templateUrl : COURSE.FILE_PATH.ADMIN_COURSE_PAYMENT_SCHEME,
		resolve: {
            loggedin: function(MeanUser) {
                return MeanUser.checkLoggedin();
            }

        }
	})
    .state(COURSE.STATE.ADMIN_HOLIDAY_CREATE, {
      url: COURSE.URL_PATH.ADMIN_HOLIDAY_CREATE,
      templateUrl: COURSE.FILE_PATH.ADMIN_HOLIDAY_CREATE,
      resolve: {
          loggedin: function (MeanUser) {
              return MeanUser.checkLoggedin();
          }
      }
    })
     .state(COURSE.STATE.ADMIN_CURRICULUM_TOPICS, {
      url: COURSE.URL_PATH.ADMIN_CURRICULUM_TOPICS,
      templateUrl: COURSE.FILE_PATH.ADMIN_CURRICULUM_TOPICS,
      resolve: {
          loggedin: function (MeanUser) {
              return MeanUser.checkLoggedin();
          }
      }
     })
   .state(COURSE.STATE.ADMIN_HOLIDAY_LIST, {
        url: COURSE.URL_PATH.ADMIN_HOLIDAY_LIST,
        templateUrl: COURSE.FILE_PATH.ADMIN_HOLIDAY_LIST,
        resolve: {
            loggedin: function(MeanUser) {
                return MeanUser.checkLoggedin();
            }
        }
    }).state(COURSE.STATE.ADMIN_HOLIDAY_EDIT, {
        url: COURSE.URL_PATH.ADMIN_HOLIDAY_EDIT,
        templateUrl: COURSE.FILE_PATH.ADMIN_HOLIDAY_EDIT,
        resolve: {
            loggedin: function(MeanUser) {
                return MeanUser.checkLoggedin();
            }
        }
    }).state(COURSE.STATE.ADMIN_FRANCHISE_CREATE, {
        url: COURSE.URL_PATH.ADMIN_FRANCHISE_CREATE,
        templateUrl: COURSE.FILE_PATH.ADMIN_FRANCHISE_CREATE,
        resolve: {
            loggedin: function(MeanUser) {
                return MeanUser.checkLoggedin();
            }
        }
    }).state(COURSE.STATE. ADMIN_FRANCHISE_LIST, {
      url: COURSE.URL_PATH. ADMIN_FRANCHISE_LIST,
      templateUrl: COURSE.FILE_PATH.ADMIN_FRANCHISE_LIST,
      resolve: {
          loggedin: function(MeanUser) {
              return MeanUser.checkLoggedin();
          }
      }
    })
    .state(COURSE.STATE.ADMIN_FRANCHISE_EDIT, {
      url: COURSE.URL_PATH.ADMIN_FRANCHISE_EDIT,
      templateUrl: COURSE.FILE_PATH.ADMIN_FRANCHISE_EDIT,
      resolve: {
          loggedin: function(MeanUser) {
              return MeanUser.checkLoggedin();
          }
      }
    }).state(COURSE.STATE.ADMIN_FRANCHISE_VIEW, {
        url: COURSE.URL_PATH.ADMIN_FRANCHISE_VIEW,
        templateUrl: COURSE.FILE_PATH.ADMIN_FRANCHISE_VIEW,
        resolve: {
            loggedin: function(MeanUser) {
                return MeanUser.checkLoggedin();
            }
        }
      }).state(COURSE.STATE.COURSEPROJECTLIST, {
        url: COURSE.URL_PATH.COURSEPROJECTLIST,
        templateUrl: COURSE.FILE_PATH.COURSEPROJECTLIST,
        resolve: {
            loggedin: function(MeanUser) {
                return MeanUser.checkLoggedin();
            }
        }
    }).state(COURSE.STATE.COURSEPROJECTCREATE, {
        url: COURSE.URL_PATH.COURSEPROJECTCREATE,
        templateUrl: COURSE.FILE_PATH.COURSEPROJECTCREATE,
        resolve: {
            loggedin: function(MeanUser) {
                return MeanUser.checkLoggedin();
            }
        }
    }).state(COURSE.STATE.COURSEPROJECTEDIT, {
        url: COURSE.URL_PATH.COURSEPROJECTEDIT,
        templateUrl: COURSE.FILE_PATH.COURSEPROJECTEDIT,
        resolve: {
            loggedin: function(MeanUser) {
                return MeanUser.checkLoggedin();
            }
        }
    }).state(COURSE.STATE.COURSEPROJECTDETAILS, {
        url: COURSE.URL_PATH.COURSEPROJECTDETAILS,
        templateUrl: COURSE.FILE_PATH.COURSEPROJECTDETAILS,
        resolve: {
            loggedin: function(MeanUser) {
                return MeanUser.checkLoggedin();
            }
        }
    }).state(COURSE.STATE.ADMIN_BATCH_ATTENDANCE, {
        url: COURSE.URL_PATH.ADMIN_BATCH_ATTENDANCE,
        templateUrl: COURSE.FILE_PATH.ADMIN_BATCH_ATTENDANCE,
        resolve: {
            loggedin: function(MeanUser) {
                return MeanUser.checkLoggedin();
            }
        }
    }).state(COURSE.STATE.STUDENTDETAILS, {
        url: COURSE.URL_PATH.STUDENTDETAILS,
        templateUrl: COURSE.FILE_PATH.STUDENTDETAILS,
        resolve: {
            loggedin: function(MeanUser) {
                return MeanUser.checkLoggedin();
            }
        }
    }).state(COURSE.STATE.STUDENT_COUNSELLING_REQUEST_STATUS, {
        url: COURSE.URL_PATH.STUDENT_COUNSELLING_REQUEST_STATUS,
        templateUrl: COURSE.FILE_PATH.STUDENT_COUNSELLING_REQUEST_STATUS,
        resolve: {
            loggedin: function(MeanUser) {
                return MeanUser.checkLoggedin();
            }
        }
    }).state(COURSE.STATE.STUDENT_COUNSELLING_REQUEST, {
        url: COURSE.URL_PATH.STUDENT_COUNSELLING_REQUEST,
        templateUrl: COURSE.FILE_PATH.STUDENT_COUNSELLING_REQUEST,
        resolve: {
            loggedin: function(MeanUser) {
                return MeanUser.checkLoggedin();
            }
        }
    }).state(COURSE.STATE.CALENDAR, {
        url: COURSE.URL_PATH.CALENDAR,
        templateUrl: COURSE.FILE_PATH.CALENDAR,
        resolve: {
            loggedin: function(MeanUser) {
                return MeanUser.checkLoggedin();
            }
        }
    }).state(COURSE.STATE.ADMIN_BATCH_VIEW, {
        url: COURSE.URL_PATH.ADMIN_BATCH_VIEW,
        templateUrl: COURSE.FILE_PATH.ADMIN_BATCH_VIEW,
        resolve: {
            loggedin: function(MeanUser) {
                return MeanUser.checkLoggedin();
            }
        }
    }).state(COURSE.STATE.MENTORASSIGNMENT, {
        url: COURSE.URL_PATH.MENTORASSIGNMENT,
        templateUrl: COURSE.FILE_PATH.MENTORASSIGNMENT,
             resolve: {
            loggedin: function(MeanUser) {
                return MeanUser.checkLoggedin();
            }
        }
    })
    .state(COURSE.STATE.COURSE_REQUEST_VIEW, {
        url: COURSE.URL_PATH.COURSE_REQUEST_VIEW,
        templateUrl: COURSE.FILE_PATH.COURSE_REQUEST_VIEW,
        resolve: {
            loggedin: function(MeanUser) {
                return MeanUser.checkLoggedin();
            }
        }
    }).state(COURSE.STATE.COURSEDETAILS, {
        url: COURSE.URL_PATH.COURSEDETAILS,
        templateUrl: COURSE.FILE_PATH.COURSEDETAILS,
        resolve: {
            loggedin: function(MeanUser) {
                return MeanUser.checkLoggedin();
            }
        }
    }).state(COURSE.STATE.COURSEMATERIALLESSON, {
    url: COURSE.URL_PATH.COURSEMATERIALLESSON,
    templateUrl: COURSE.FILE_PATH.COURSEMATERIALLESSON,
      resolve: {
            loggedin: function(MeanUser) {
                return MeanUser.checkLoggedin();
            }
        }
    }).state(COURSE.STATE.COURSEMATERIAL, {
    url: COURSE.URL_PATH.COURSEMATERIAL,
    templateUrl: COURSE.FILE_PATH.COURSEMATERIAL,
    resolve: {
            loggedin: function(MeanUser) {
                return MeanUser.checkLoggedin();
            }
        }
    }).state(COURSE.STATE.COURSEMATERIALCHAPTER, {
    url: COURSE.URL_PATH.COURSEMATERIALCHAPTER,
    templateUrl: COURSE.FILE_PATH.COURSEMATERIALCHAPTER,
    resolve: {
            loggedin: function(MeanUser) {
                return MeanUser.checkLoggedin();
            }
        }
    }).state(COURSE.STATE.COURSEMATERIALVIEW, {
    url: COURSE.URL_PATH.COURSEMATERIALVIEW,
    templateUrl: COURSE.FILE_PATH.COURSEMATERIALVIEW,
    resolve: {
            loggedin: function(MeanUser) {
                return MeanUser.checkLoggedin();
            }
        }
    }).state(COURSE.STATE.COURSEMATERIALEDIT, {
        url: COURSE.URL_PATH.COURSEMATERIALEDIT,
        templateUrl: COURSE.FILE_PATH.COURSEMATERIALEDIT,
        resolve: {
            loggedin: function(MeanUser) {
                return MeanUser.checkLoggedin();
            }
        }
    }).state(COURSE.STATE.COURSEMATERIALTITLELIST, {
        url: COURSE.URL_PATH.COURSEMATERIALTITLELIST,
        templateUrl: COURSE.FILE_PATH.COURSEMATERIALTITLELIST,
        resolve: {
            loggedin: function(MeanUser) {
                return MeanUser.checkLoggedin();
            }
        }
    })
    .state(COURSE.STATE.ADMIN_COUNSELLING_CREATE_SCHEDULE, {
        url: COURSE.URL_PATH.ADMIN_COUNSELLING_CREATE_SCHEDULE,
        templateUrl: COURSE.FILE_PATH.ADMIN_COUNSELLING_CREATE_SCHEDULE
        
    })/*.state(COURSE.STATE.COURSEMATERIALTOPICLIST, {
        url: COURSE.URL_PATH.COURSEMATERIALTOPICLIST,
        templateUrl: COURSE.FILE_PATH.COURSEMATERIALTOPICLIST,
        resolve: {
            loggedin: function(MeanUser) {
                return MeanUser.checkLoggedin();
            }
        }
    }).state(COURSE.STATE.COURSEMATERIALTOPICCREATE, {
        url: COURSE.URL_PATH.COURSEMATERIALTOPICCREATE,
        templateUrl: COURSE.FILE_PATH.COURSEMATERIALTOPICCREATE,
        resolve: {
            loggedin: function(MeanUser) {
                return MeanUser.checkLoggedin();
            }
        }
    }).state(COURSE.STATE.COURSEMATERIALTOPICEDIT, {
            url: COURSE.URL_PATH.COURSEMATERIALTOPICEDIT,
            templateUrl: COURSE.FILE_PATH.COURSEMATERIALTOPICEDIT,
            resolve: {
            loggedin: function(MeanUser) {
                return MeanUser.checkLoggedin();
            }
        }   
    }).state(COURSE.STATE.COURSEMATERIALSUBTOPICLIST, {
        url: COURSE.URL_PATH.COURSEMATERIALSUBTOPICLIST,
        templateUrl: COURSE.FILE_PATH.COURSEMATERIALSUBTOPICLIST
                
    }).state(COURSE.STATE.COURSEMATERIALSUBTOPICREATE, {
        url: COURSE.URL_PATH.COURSEMATERIALSUBTOPICREATE,
        templateUrl: COURSE.FILE_PATH.COURSEMATERIALSUBTOPICREATE  
        
    }).state(COURSE.STATE.COURSEMATERIALSUBTOPICEDIT, {
        url: COURSE.URL_PATH.COURSEMATERIALSUBTOPICEDIT,
        templateUrl: COURSE.FILE_PATH.COURSEMATERIALSUBTOPICEDIT
    })
*/
    .state(COURSE.STATE.COURSEPAYMENT, {
        url: COURSE.URL_PATH.COURSEPAYMENT,
        templateUrl: COURSE.FILE_PATH.COURSEPAYMENT,
        resolve: {
            loggedin: function(MeanUser) {
                return MeanUser.checkLoggedin();
            }
        }
    }).state(COURSE.STATE.MYCOURSEDETAILS, {
        url: COURSE.URL_PATH.MYCOURSEDETAILS,
        templateUrl: COURSE.FILE_PATH.MYCOURSEDETAILS,
    })
    .state(COURSE.STATE.COURSEREQUEST, {
        url: COURSE.URL_PATH.COURSEREQUEST,
        templateUrl: COURSE.FILE_PATH.COURSEREQUEST,

    }).state(COURSE.STATE.ADMIN_USERCOUNSELLING_REQUEST_LIST, {
        url: COURSE.URL_PATH.ADMIN_USERCOUNSELLING_REQUEST_LIST,
        templateUrl: COURSE.FILE_PATH.ADMIN_USERCOUNSELLING_REQUEST_LIST,
        resolve: {
            loggedin: function(MeanUser) {
                return MeanUser.checkLoggedin();
            }
        }
    })
    .state(COURSE.STATE.STUDENT_COURSE_REQUEST_VIEW, {
        url: COURSE.URL_PATH.STUDENT_COURSE_REQUEST_VIEW,
        templateUrl: COURSE.FILE_PATH.STUDENT_COURSE_REQUEST_VIEW,
        resolve: {
            loggedin: function(MeanUser) {
                return MeanUser.checkLoggedin();
            }
        }
    })  
.state(COURSE.STATE.COURSEMATERIALCHAPTER_EDIT, {
            url: COURSE.URL_PATH.COURSEMATERIALCHAPTER_EDIT,
            templateUrl: COURSE.FILE_PATH.COURSEMATERIALCHAPTER_EDIT,
            resolve: {
            loggedin: function(MeanUser) {
                return MeanUser.checkLoggedin();
            }
        }   
    }).state(COURSE.STATE.COURSEMATERIALLESSON_EDIT, {
            url: COURSE.URL_PATH.COURSEMATERIALLESSON_EDIT,
            templateUrl: COURSE.FILE_PATH.COURSEMATERIALLESSON_EDIT,
            resolve: {
            loggedin: function(MeanUser) {
                return MeanUser.checkLoggedin();
            }
        }   
    }).state(COURSE.STATE.COURSEMATERIALTOPIC_EDIT, {
            url: COURSE.URL_PATH.COURSEMATERIALTOPIC_EDIT,
            templateUrl: COURSE.FILE_PATH.COURSEMATERIALTOPIC_EDIT,
            resolve: {
            loggedin: function(MeanUser) {
                return MeanUser.checkLoggedin();
            }
        }   
    }).state(COURSE.STATE.COURSEMATERIALSUBTOPIC_EDIT, {
            url: COURSE.URL_PATH.COURSEMATERIALSUBTOPIC_EDIT,
            templateUrl: COURSE.FILE_PATH.COURSEMATERIALSUBTOPIC_EDIT,
            resolve: {
            loggedin: function(MeanUser) {
                return MeanUser.checkLoggedin();
            }
        }   
    })
      .state(COURSE.STATE.MYCOURSEPAYMENTSCHEDULE, {
        url: COURSE.URL_PATH.MYCOURSEPAYMENTSCHEDULE,
        templateUrl: COURSE.FILE_PATH.MYCOURSEPAYMENTSCHEDULE,

    }).state(COURSE.STATE.ADMIN_USERCOUNSELLING_REQUEST_SCHEDULE_EDIT_DETAIL, {
        url: COURSE.URL_PATH.ADMIN_USERCOUNSELLING_REQUEST_SCHEDULE_EDIT_DETAIL,
        templateUrl: COURSE.FILE_PATH.ADMIN_USERCOUNSELLING_REQUEST_SCHEDULE_EDIT_DETAIL,
        resolve: {
            loggedin: function(MeanUser) {
                return MeanUser.checkLoggedin();
            }
        }
    })
      .state(COURSE.STATE.COUNSELLINGCHECKLISTCREATE, {
        url: COURSE.URL_PATH.COUNSELLINGCHECKLISTCREATE,
        templateUrl: COURSE.FILE_PATH.COUNSELLINGCHECKLISTCREATE,
        resolve: {
            loggedin: function(MeanUser) {
                return MeanUser.checkLoggedin();
            }
        }
    }).state(COURSE.STATE.ADMIN_USERCOUNSELLING_REQUEST_SCHEDULE_VIEW_DETAIL, {
        url: COURSE.URL_PATH.ADMIN_USERCOUNSELLING_REQUEST_SCHEDULE_VIEW_DETAIL,
        templateUrl: COURSE.FILE_PATH.ADMIN_USERCOUNSELLING_REQUEST_SCHEDULE_VIEW_DETAIL,
        resolve: {
            loggedin: function(MeanUser) {
                return MeanUser.checkLoggedin();
            }
        }
    })
     .state(COURSE.STATE.COUNSELLINGCHECKLISTCEDIT, {
        url: COURSE.URL_PATH.COUNSELLINGCHECKLISTCEDIT,
        templateUrl: COURSE.FILE_PATH.COUNSELLINGCHECKLISTCEDIT,
        resolve: {
            loggedin: function(MeanUser) {
                return MeanUser.checkLoggedin();
            }
        }
    }).state(COURSE.STATE.ADMIN_USERCOUNSELLING_SCHEDULE_CREATE_COMPLETE_LIST, {
        url: COURSE.URL_PATH.ADMIN_USERCOUNSELLING_SCHEDULE_CREATE_COMPLETE_LIST,
        templateUrl: COURSE.FILE_PATH.ADMIN_USERCOUNSELLING_SCHEDULE_CREATE_COMPLETE_LIST,
        resolve: {
            loggedin: function(MeanUser) {
                return MeanUser.checkLoggedin();
            }
        }
    }).state(COURSE.STATE.ADMIN_USERCOUNSELLING_SCHEDULE_CREATE_COMPLETE_LIST_EDIT, {
        url: COURSE.URL_PATH.ADMIN_USERCOUNSELLING_SCHEDULE_CREATE_COMPLETE_LIST_EDIT,
        templateUrl: COURSE.FILE_PATH.ADMIN_USERCOUNSELLING_SCHEDULE_CREATE_COMPLETE_LIST_EDIT,
        resolve: {
            loggedin: function(MeanUser) {
                return MeanUser.checkLoggedin();
            }
        }
    }).state(COURSE.STATE.ADMIN_USERCOUNSELLING_MENTOR_LIST_VIEW, {
        url: COURSE.URL_PATH.ADMIN_USERCOUNSELLING_MENTOR_LIST_VIEW,
        templateUrl: COURSE.FILE_PATH.ADMIN_USERCOUNSELLING_MENTOR_LIST_VIEW,
        resolve: {
            loggedin: function(MeanUser) {
                return MeanUser.checkLoggedin();
            }
        }
    }).state(COURSE.STATE.ADMIN_USERCOUNSELLING_MENTOR_DETAIL_VIEW, {
        url: COURSE.URL_PATH.ADMIN_USERCOUNSELLING_MENTOR_DETAIL_VIEW,
        templateUrl: COURSE.FILE_PATH.ADMIN_USERCOUNSELLING_MENTOR_DETAIL_VIEW,
        resolve: {
            loggedin: function(MeanUser) {
                return MeanUser.checkLoggedin();
            }
        }
    })
       .state(COURSE.STATE.COUNSELLINGCHECKLIST, {
        url: COURSE.URL_PATH.COUNSELLINGCHECKLIST,
        templateUrl: COURSE.FILE_PATH.COUNSELLINGCHECKLIST,
        resolve: {
            loggedin: function(MeanUser) {
                return MeanUser.checkLoggedin();
            }
        }
    })
    .state(COURSE.STATE.COURSE_LIST_STUDENT, {
        url: COURSE.URL_PATH.COURSE_LIST_STUDENT,
        templateUrl: COURSE.FILE_PATH.COURSE_LIST_STUDENT
    })
    .state(COURSE.STATE.ADMIN_COURSE_BRANCH_VIEW, {
        url: COURSE.URL_PATH.ADMIN_COURSE_BRANCH_VIEW,
        templateUrl: COURSE.FILE_PATH.ADMIN_COURSE_BRANCH_VIEW,
        resolve: {
            loggedin: function(MeanUser) {
                return MeanUser.checkLoggedin();
            }
        }
    }).state(COURSE.STATE.BATCH_LIST_STUDENT, {
        url: COURSE.URL_PATH.BATCH_LIST_STUDENT,
        templateUrl: COURSE.FILE_PATH.BATCH_LIST_STUDENT
    })
    
    .state(COURSE.STATE.BATCH_EDIT_STUDENT, {
        url: COURSE.URL_PATH.BATCH_EDIT_STUDENT,
        templateUrl: COURSE.FILE_PATH.BATCH_EDIT_STUDENT
    })
    .state(COURSE.STATE.COUNSELLINGCHECKLISTVIEW, {
        url: COURSE.URL_PATH.COUNSELLINGCHECKLISTVIEW,
        templateUrl: COURSE.FILE_PATH.COUNSELLINGCHECKLISTVIEW,
        resolve: {
            loggedin: function(MeanUser) {
                return MeanUser.checkLoggedin();
            }
        }
    })
    .state(COURSE.STATE. STUDENT_COUNSELLING_CHECKLIST, {
        url: COURSE.URL_PATH. STUDENT_COUNSELLING_CHECKLIST,
        templateUrl: COURSE.FILE_PATH. STUDENT_COUNSELLING_CHECKLIST,
        resolve: {
            loggedin: function(MeanUser) {
                return MeanUser.checkLoggedin();
            }
        }
    });
   }
]);