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
          saveToPhotoAlbum: false
      };
      $cordovaCamera.getPicture({})
      .then(function(result){
        console.log(result);
        $cordovaFileTransfer.upload('https://moneyshotapi.herokuapp.com/api/newimage', result, {})
        .then(function(callbackImage){
          console.log('in the callback');
          console.log(callbackImage);
          console.log("_--------------------");

          $http({
            method: "GET"
            ,url: "https://moneyshotapi.herokuapp.com/api/all/photos"
          })
          .then(function(photos){
            console.log('in the callback');
            console.log(photos);
            var allPhotos = photos.data.reverse();
            var allUrls = [];
            for (var i = 0; i < allPhotos.length; i++) {
              allUrls.push(allPhotos[i].url);
            }
            console.log(allUrls);
            // $scope.testImage = allUrls[0];
            $('.testing').attr('src', allUrls[0])
          })
        })
      })
    }
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
        console.log(signedInUser);
        $scope.signupModalTabs = false;
        console.log(newToken);
        newToken(signedInUser.data._id)
        .then(function(ourToken){
          var token = ourToken.data;
          console.log(token);
          window.localStorage.webToken = token;
          ///////final callback, which opens up the camera
          removeSignupModal();
          takePicture();
        })
      })
    }
    $scope.signinUser = signinUser;

    function removeSignupModal(){
      console.log('removing');
      console.log('yo');
      $scope.signupModalVar = false;
      $scope.signinModalVar = false;
      $scope.signupModalTabs = false;
    }
    $scope.removeSignupModal = removeSignupModal;

    // function to toggle between signin and signup tabs
    function toggleSigns(evt){
      if($(evt.currentTarget).hasClass('signin')){
        console.log('signin tab');
        $scope.signupModalVar = false;
        $scope.signinModalVar = true;
        $scope.signupModalTabs = true;
      }
      else if($(evt.currentTarget).hasClass('signup')){
        console.log('signup tab');
        $scope.signinModalVar = false;
        $scope.signupModalVar = true;
        $scope.signupModalTabs = true;
      }
    }
    $scope.toggleSigns = toggleSigns;
    ///////////sign in and sign up////////
    //////////////////////////////////////

  }
