angular.module('mean.training').constant('TRAINING', {
    URL_PATH: {
        TRAININGCREATE: '/trainings',
        TRAININGMANAGE:'/trainings/manage'
    },

    FILE_PATH: {
        TRAININGCREATE: 'training/views/training_view.html',
        TRAININGMANAGE : 'training/views/training_create.html'
    },

    STATE: {
        TRAININGCREATE: 'Training_view trainings',
        TRAININGMANAGE:'Training_manage trainings'
    }
});