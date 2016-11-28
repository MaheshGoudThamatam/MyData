angular.module('mean.plugNplay').constant('PLUGNPLAY', {
	
    URL_PATH: {
    	PLUG_N_PLAY: '/admin/plugNplay',
    	PLUGANDPLAY:'/admin/plugandplay',
    	PLUGANDPLAYDETAILS:'/admin/plugandplay/:plugNplayId',
    	PLUGANDPLAYRESULTS:'/search/plugNplay/results',
    },
    
    FILE_PATH: {
    	PLUG_N_PLAY: 'plugNplay/views/plugNplayList.html',
    	PLUGANDPLAY:'plugNplay/views/plugNplay.html',
    	PLUGANDPLAYDETAILS:'plugNplay/views/plugNplayDetails.html',
    	PLUGANDPLAYRESULTS:'plugNplay/views/plugNplayResults.html',
    	
    },

    STATE: {
    	PLUG_N_PLAY: 'plug n play',
    	PLUGANDPLAY:'plug and play list',
    	PLUGANDPLAYDETAILS:'plugNplay details',
    	PLUGANDPLAYRESULTS:'plugNplay search result',
    },
   
});