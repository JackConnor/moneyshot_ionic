angular.module('cameraController', ['singlePhotoFactory', 'ngFileUpload'])

  .controller('cameraCtrl', cameraCtrl);

  cameraCtrl.$inject = ['$http', '$scope', 'singlePhoto', 'Upload', '$q', '$cordovaCamera', '$cordovaFile', '$cordovaFileTransfer', 'signup', 'signin', 'newToken'];
  function cameraCtrl($http, $scope, singlePhoto, Upload, $q, $cordovaCamera, $cordovaFile, $cordovaFileTransfer, signup, signin, newToken){
    ////////////////////////////
    /////////global variables///
    console.log('cammmmmmmerrerereraaaa');
    console.log(window.location.hash);
    setTimeout(function(){
      console.log(window.location.hash)
    }, 1);
    var self = this;
    $scope.signupModalVar = false;
    $scope.signinModalVar = true;
    $scope.signupModalTabs = true;

    /////////global variables///
    ////////////////////////////

    /////////////////////////////
    /////functions to upload photos////
    function takePicture(){
      console.log('taking a picture');
      var options = {
          quality : 80,
          destinationType : Camera.DestinationType.FILE_URI,
          sourceType : Camera.PictureSourceType.Camera ,
          allowEdit : true,
          encodingType: Camera.EncodingType.JPEG,
          targetWidth: 100,
          targetHeight: 100,
          popoverOptions: CameraPopoverOptions,
          saveToPhotoAlbum: false
      };
      $cordovaCamera.getPicture({})
      .then(function(result){
        $cordovaFileTransfer.upload('https://moneyshotapi.herokuapp.com/api/newimage', result, {userId: '123456789'})
        .then(function(callbackImage){
          takePicture();
        })
      })
    }

    //////function to open the camera on the controller's load if there are no modals open
    // function loadCameraIfSigned(){
    //   console.log('camera coming');
    //   if($scope.signupModalVar == false && $scope.signinModalVar == false && $scope.signupModalTabs == false){
    //     takePicture();
    //   }
    // }
    // loadCameraIfSigned();
    //////////////end upload photos////
    ///////////////////////////////////

    //////////////////////////////////////
    ///////////sign in and sign up////////

    // function to signup users who are new to the site
    function signupUser(){
      var email = $('.signupEmail').val();
      var password = $('.signupPassword').val();
      var repassword = $('.signupConfirmPassword').val();
      console.log(email);
      console.log(password);
      console.log(repassword);
      if(password == repassword){
        signup(email, password)
        .then(function(newUser){
          console.log(newUser);
          newToken(signedInUser.data._id)
          .then(function(ourToken){
            var token = ourToken.data;
            console.log(token);
            window.localStorage.webToken = token;
            $scope.signupModalTabs = false;
            console.log('localStroge');
            console.log(window.localStorage);
            ///////final callback, which opens up the camera
            removeSignupModal();
            takePicture();
          })
        })
      }
      else {
        alert('passwords dont match');
      }
    }
    $scope.submitSignup = signupUser;

    /////function to sign in a user
    function signinUser(){
      console.log('signing in baby');
      var email = $('.signupEmail').val();
      var password = $('.signupPassword').val();
      signin(email, password)
      .then(function(signedInUser){
        $scope.signupModalTabs = false;
        newToken(signedInUser.data._id)
        .then(function(ourToken){
          var token = ourToken.data;
          window.localStorage.webToken = token;
          ///////final callback, which opens up the camera
          removeSignupModal();
          takePicture();
        })
      })
    }
    $scope.signinUser = signinUser;

    function removeSignupModal(){
      $scope.signupModalVar = false;
      $scope.signinModalVar = false;
      $scope.signupModalTabs = false;
    }
    $scope.removeSignupModal = removeSignupModal;

    // function to toggle between signin and signup tabs
    function toggleSigns(evt){
      if($(evt.currentTarget).hasClass('signin')){
        $scope.signupModalVar = false;
        $scope.signinModalVar = true;
        $scope.signupModalTabs = true;
      }
      else if($(evt.currentTarget).hasClass('signup')){
        $scope.signinModalVar = false;
        $scope.signupModalVar = true;
        $scope.signupModalTabs = true;
      }
    }
    $scope.toggleSigns = toggleSigns;

    // function to check for a signed in user via their token
    function checkToken(){
      var maybeToken = window.localStorage.webToken;
      console.log(maybeToken);
      if(maybeToken && maybeToken.length > 2){
        $scope.signupModalVar = false;
        $scope.signinModalVar = false;
        $scope.signupModalTabs = false;
        console.log('signed in already');
        takePicture();
      }
    }
    checkToken();
    ///////////sign in and sign up////////
    //////////////////////////////////////

  }
