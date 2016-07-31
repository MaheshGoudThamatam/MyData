'use strict';

angular.module('mean.users')
  .controller('AuthCtrl', ['$scope', '$rootScope', '$http', '$state', 'Global',
    function($scope, $rootScope, $http, $state, Global) {
      // This object will contain list of available social buttons to authorize
      $scope.socialButtonsCounter = 0;
      $scope.global = Global;
      $scope.$state = $state;

      $http.get('/api/get-config')
        .success(function(config) {
          if(config.hasOwnProperty('local')) delete config.local; // Only non-local passport strategies
          $scope.socialButtons = config;
          $scope.socialButtonsCounter = Object.keys(config).length;
        });
    }
  ])
  .controller('LoginCtrl', ['$rootScope', 'MeanUser', '$scope','URLFactory','$location','flash','MESSAGES',
    function($rootScope, MeanUser, $scope,URLFactory,$location,flash,MESSAGES) {
	 $scope.URLFactory = URLFactory;
	 $scope.USERS = URLFactory.USERS;
	  $scope.MESSAGES = MESSAGES;
    flashmessageOn($rootScope, $scope,flash);
      var vm = this;
      // This object will be filled by the form
      vm.user = {};
      var queryParams=$location.search();
      switch(queryParams.confirmation || queryParams.errorcode ){
      case "0":
          flash.setMessage(URLFactory.MESSAGES.USER_VERIFIED, URLFactory.MESSAGES.SUCCESS);
          break;
      case "1":
          flash.setMessage(URLFactory.MESSAGES.NOT_CONFIRMED, URLFactory.MESSAGES.ERROR);
          break;
      case "2":
          flash.setMessage(URLFactory.MESSAGES.CONFIRMATION_TOKEN_EXPIRED, URLFactory.MESSAGES.ERROR);
          break;
      case "3":
          flash.setMessage(URLFactory.MESSAGES.CONFIRMATION_TOKEN_EXPIRED, URLFactory.MESSAGES.ERROR);
          break;
      case "7":
          flash.setMessage(URLFactory.MESSAGES.DIFFERENT_PROVIDER, URLFactory.MESSAGES.ERROR);
          break;
  }
      
     /* if($rootScope.loginError){
    	  $scope.loginError = $rootScope.loginError;
    	  delete $rootScope.loginError;
    	  console.log($rootScope.loginError);
      }*/
      
      vm.input = {
        type: 'password',
        placeholder: 'Password',
        confirmPlaceholder: 'Repeat Password',
        iconClass: '',
        tooltipText: 'Show password'
      };

      vm.togglePasswordVisible = function() {
        vm.input.type = vm.input.type === 'text' ? 'password' : 'text';
        vm.input.placeholder = vm.input.placeholder === 'Password' ? 'Visible Password' : 'Password';
        vm.input.iconClass = vm.input.iconClass === 'icon_hide_password' ? '' : 'icon_hide_password';
        vm.input.tooltipText = vm.input.tooltipText === 'Show password' ? 'Hide password' : 'Show password';
      };
      
      $rootScope.$on('loginfailed', function(){
    	  $scope.loginError = $rootScope.loginError;
    	  delete $rootScope.loginError;
    	  console.log($rootScope.loginError);
        });


      // Register the login() function
      vm.login = function() {
        MeanUser.login(this.user);
      };
    }
  ])
  .controller('RegisterCtrl', ['$rootScope', 'MeanUser', '$scope',
    function($rootScope, MeanUser, $scope) {
      var vm = this;

      vm.user = {};
      flashmessageOn($rootScope, $scope,flash);
      vm.registerForm = MeanUser.registerForm = true;

      vm.input = {
        type: 'password',
        placeholder: 'Password',
        placeholderConfirmPass: 'Repeat Password',
        iconClassConfirmPass: '',
        tooltipText: 'Show password',
        tooltipTextConfirmPass: 'Show password'
      };

      vm.togglePasswordVisible = function() {
        vm.input.type = vm.input.type === 'text' ? 'password' : 'text';
        vm.input.placeholder = vm.input.placeholder === 'Password' ? 'Visible Password' : 'Password';
        vm.input.iconClass = vm.input.iconClass === 'icon_hide_password' ? '' : 'icon_hide_password';
        vm.input.tooltipText = vm.input.tooltipText === 'Show password' ? 'Hide password' : 'Show password';
      };
      vm.togglePasswordConfirmVisible = function() {
        vm.input.type = vm.input.type === 'text' ? 'password' : 'text';
        vm.input.placeholderConfirmPass = vm.input.placeholderConfirmPass === 'Repeat Password' ? 'Visible Password' : 'Repeat Password';
        vm.input.iconClassConfirmPass = vm.input.iconClassConfirmPass === 'icon_hide_password' ? '' : 'icon_hide_password';
        vm.input.tooltipTextConfirmPass = vm.input.tooltipTextConfirmPass === 'Show password' ? 'Hide password' : 'Show password';
      };

      $scope.isPasswordMatch = true;
      
      // Register the register() function
      vm.register = function() {
        //TODO: hack need to add confirmpassword filed in the register form later
        this.user.confirmPassword = this.user.password;
        if($scope.validatePassword(this.user)){
        	$scope.isPasswordMatch = true;
        	MeanUser.register(this.user);
        }else{
        	$scope.isPasswordMatch = false;
        }
      };
      
      
      $scope.validatePassword = function(user) {
		if (((null == user.password || user.password == "") && (null == user.confirmPassword || user.confirmPassword == "")) || user.password === $scope.confirmPassword){
			vm.registerError = [];
			return true;
			
		}else{
			vm.registerError = [{msg : "Password must match"}];
			return false;
		}
	}
      
      
      $scope.isEmpty = function(obj) {
          // null and undefined are "empty"
          if (obj === null) return true;
          // Assume if it has a length property with a non-zero value
          // that that property is correct.
          if (obj && obj.length && obj.length > 0) return false;
          if (obj && obj.length && obj.length === 0) return true;
          // Otherwise, does it have any properties of its own?
          // Note that this doesn't handle
          // toString and toValue enumeration bugs in IE < 9
          for (var key in obj) {
              if (hasOwnProperty.call(obj, key)) return false;
          }
          return true;
      },

      $rootScope.$on('registerfailed', function(){
        vm.registerError = MeanUser.registerError;
      });
    }
  ])
  .controller('ForgotPasswordCtrl', ['MeanUser', '$rootScope',
    function(MeanUser, $rootScope) {
      var vm = this;
      vm.user = {};      
      flashmessageOn($rootScope, $scope,flash);
      vm.registerForm = MeanUser.registerForm = false;
      vm.forgotpassword = function() {
        MeanUser.forgotpassword(this.user);
      };
      $rootScope.$on('forgotmailsent', function(event, args){
        vm.response = args;
      });
    }
  ])
  .controller('ResetPasswordCtrl', ['MeanUser',
    function(MeanUser) {
      var vm = this;
      flashmessageOn($rootScope, $scope,flash);
      vm.user = {};      
      vm.registerForm = MeanUser.registerForm = false;
      vm.resetpassword = function() {
        MeanUser.resetpassword(this.user);
      };
    }
  ]);