angular.module('cameraController', ['singlePhotoFactory', 'ngFileUpload'])

  .controller('cameraCtrl', cameraCtrl);

  cameraCtrl.$inject = ['$http', '$scope', 'singlePhoto', 'Upload', '$q', '$cordovaCamera', '$cordovaFile', '$cordovaFileTransfer', 'signup', 'signin', 'newToken'];
  function cameraCtrl($http, $scope, singlePhoto, Upload, $q, $cordovaCamera, $cordovaFile, $cordovaFileTransfer, signup, signin, newToken){
    ////////////////////////////
    /////////global variables///
    var self = this;
    $scope.signupModalVar = false;
    $scope.signinModalVar = true;
    $scope.signupModalTabs = true;


    /////////global variables///
    ////////////////////////////

    /////////////////////////////
    /////functions to upload photos////
    function takePicture(){
      var options = {
          quality : 80,
          destinationType : Camera.DestinationType.FILE_URI,
          sourceType : Camera.PictureSourceType.Camera ,
          allowEdit : true,
          encodingType: Camera.EncodingType.JPEG,
          targetWidth: 100,
          targetHeight: 100,
          popoverOptions: CameraPopoverOptions,
          saveToPhotoAlbum: false,
          headers: {
            userId: '12345'
          }
      };
      // $cordovaCamera.getPicture({})
      // .then(function(result){
      //   $cordovaFileTransfer.upload('https://moneyshotapi.herokuapp.com/api/newimage', result, options)
      //   .then(function(callbackImage){
      //     takePicture();
      //   })
      // })
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
      if(password == repassword){
        signup(email, password)
        .then(function(newUser){
          console.log(newUser);
          newToken(signedInUser.data._id)
          .then(function(ourToken){
            var token = ourToken.data;
            console.log(token);
            window.sessionStorage.webToken = token;
            $scope.signupModalTabs = false;
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
      var email = $('.signupEmail').val();
      var password = $('.signupPassword').val();
      signin(email, password)
      .then(function(signedInUser){
        $scope.signupModalTabs = false;
        newToken(signedInUser.data._id)
        .then(function(ourToken){
          var token = ourToken.data;
          window.sessionStorage.webToken = token;
          ///////final callback, which opens up the camera
          removeSignupModal();
          takePicture();
        })
      })
    }
    $scope.signinUser = signinUser;

    function signoutUser(){
      window.sessionStorage.webToken = "";
      window.location.hash = "#/";
    }
    $scope.signoutUser = signoutUser;

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
      var maybeToken = window.sessionStorage.webToken;
      if(maybeToken && maybeToken.length > 2){
        $scope.signupModalVar = false;
        $scope.signinModalVar = false;
        $scope.signupModalTabs = false;
        console.log('signed in already');
        // takePicture();
      }
      else {
        console.log('no token');
        $scope.signinModalVar = true;
        $scope.signupModalTabs = true;
      }
    }
    checkToken();
    ///////////sign in and sign up////////
    //////////////////////////////////////

  }
