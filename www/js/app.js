// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'ngCordova', 'ngFileUpload', 'starter.services', 'accountController', 'cameraController', 'uploadController', 'signupController', 'allPhotosFactory', 'singlePhotoFactory', 'navbarHolderFactory', 'signupFactory', 'signinFactory', 'newTokenFactory', 'userPhotosFactory', 'decodeTokenFactory'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
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
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
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

    /////upload from camera roll///////
    .state('tab.upload', {
      url: '/upload'
      ,cache: false
      ,views: {
        'tab-upload': {
          templateUrl: 'templates/signin.html',
          controller: 'signupCtrl'
        }
      }
    })
    /////upload from camera roll///////
    // .state('signin', {
    //   url: '/signin'
    //   ,cache: false
    //   ,templateUrl: 'templates/signin.html'
    //   ,controller: 'signupCtrl'
    // });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/camera');

  });
