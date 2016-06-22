// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
function init($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // alert('yo')
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
    // setTimeout(function(){
    //   navigator.splashscreen.hide();
    // }, 5000);
  });

}


angular.module('starter', ['ionic', 'ngCordova', 'ngRoute', 'ngFileUpload', 'starter.services', 'accountController', 'cameraController', 'uploadController', 'signupController', 'allPhotosFactory', 'singlePhotoFactory', 'navbarHolderFactory', 'signupFactory', 'signinFactory', 'newTokenFactory', 'userPhotosFactory', 'decodeTokenFactory', 'userInfoFactory', 'ngTouch', 'bankController', 'initLoad', 'persistentPhotosFactory', 'ngStorage'])

.run(init)



.config(function($stateProvider, $urlRouterProvider, $sceDelegateProvider, $compileProvider) {
  $sceDelegateProvider.resourceUrlWhitelist([
    'assets-library://',
  ])
  $sceDelegateProvider.resourceUrlBlacklist([
    'http://',
  ])
  $sceDelegateProvider.resourceUrlWhitelist([
    'cdvfile://',
  ])
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|file|cdvfile|tel):/);

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  // $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|content|file|assets-library):|data:image\//);
  $stateProvider

  // setup an abstract state for the tabs directive

    .state('tab', {
      url: '/tab',
      abstract: true,
      cache: false,
      templateUrl: 'templates/tabs.html'
    })

    // Each tab has its own nav history stack:

    .state('tab.camera', {
      url: '/camera'
      ,cache: false
      ,views: {
        'tab-camera': {
          templateUrl: 'templates/tab-camera.html'
          ,controller: 'cameraCtrl'
        }
      }
    })

    .state('tab.account', {
        url: '/account'
        ,cache: false
        ,views: {
          'tab-account': {
            templateUrl: 'templates/tab-account.html'
            ,controller: 'accountCtrl'
          }
        }
      })
      .state('tab.chat-detail', {
        url: '/chats/:chatId'
        ,cache: false
        ,views: {
          'tab-chats': {
            templateUrl: 'templates/chat-detail.html'
            // ,controller: 'ChatDetailCtrl'
          }
        }
      })

      .state('signin', {
        url: '/signin'
        ,cache: false
        ,templateUrl: 'templates/signin.html'
        ,controller: 'signupCtrl'
      })

      .state('banks', {
        url: '/bankinfo'
        ,cache: false
        ,templateUrl: 'templates/bankinfo.html'
        ,controller: 'bankCtrl'
        ,controllerAs: 'bankCtrl'
      })

      .state('banking', {
        url: "/banking/:stripe_data"
        ,cache: false
        ,templateUrl: "templates/bankinfo.html"
        ,controller: "bankCtrl"
      })

      .state('init', {
        url: '',
        cache: false,
        templateUrl: 'templates/init.html',
        controller: 'initCtrl',
        controllerAs: 'vm'
      })


    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('');

  });
