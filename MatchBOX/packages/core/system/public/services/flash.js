'use strict';

angular.module('mean.system').service('flash', function (MESSAGES,$window,$rootScope,$interval) {
    var messageType="";
    var currentMessage="";
    var messageTypeList =[];
    var messageList=[];
    var timeoutFunc=null;
    var index =0;
    return {
        setMessage: function(message,type) {
            messageList.push(message);
            messageTypeList.push(type);
            currentMessage=messageList[0];
            messageType=messageTypeList[0];
            console.log(currentMessage);
                    console.log(messageType);
            $rootScope.$emit('messageChanged');
            if(timeoutFunc){
                $interval.cancel(timeoutFunc);
            }
            timeoutFunc=$interval(function() {
                if(messageList.length> 0){
                    messageList.splice(0,1);
                    messageTypeList.splice(0,1);
                    if(messageList.length> 0) {
                        currentMessage = messageList[0];
                        messageType = messageTypeList[0];
                    }else{
                        currentMessage="";
                        messageType="";
                        $interval.cancel(timeoutFunc);
                    }
                }else{
                    currentMessage="";
                    messageType="";
                    $interval.cancel(timeoutFunc);
                }
                $rootScope.$emit('messageChanged');
            }, 5000);
        },
        getMessage: function() {
            return currentMessage;
        },
        getAllMessage: function() {
            var messageshowList=angular.copy(messageList);
            index=0;
            messageList = [];
            return messageshowList;
        },
        getMessageClass: function(){
            return messageType==MESSAGES.ERROR ? "alert-danger" : messageType==MESSAGES.INFO ? "alert-info" : "alert-success";
        },
        getMessageCode: function(){
            return messageType==MESSAGES.ERROR ? "Error !" : messageType==MESSAGES.INFO ? "Info !" : "Success !";
        },
        clearMessage: function(){
            messageList = [];
            messageTypeList=[];
            $interval.cancel(timeoutFunc);
        }
    };
});
