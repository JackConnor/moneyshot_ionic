angular.module('cameraController', ['singlePhotoFactory', 'ngFileUpload', 'ngCordova', 'ngFileUpload'])

  .controller('cameraCtrl', cameraCtrl);

  cameraCtrl.$inject = ['$http', '$state', '$scope', 'singlePhoto', 'Upload', '$q', '$cordovaCamera', '$cordovaFile', '$cordovaFileTransfer', 'signup', 'signin', 'newToken', '$cordovaCapture', 'Upload'];
  function cameraCtrl($http, $state, $scope, singlePhoto, Upload, $q, $cordovaCamera, $cordovaFile, $cordovaFileTransfer, signup, signin, newToken, $cordovaCapture){

    ////////////////////////////
    /////////global variables///
    $scope.mediaCache = []
    /////end global variables///
    ////////////////////////////

    /////////////////////////////
    /////functions to upload photos////
    function takePicture(){
      console.log('opening camera');
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
      };
      $cordovaCamera.getPicture({})
      .then(function(result){
        $scope.mediaCache.push({
          type: "photo"
          ,link: result
          ,date: new Date()
        })
        console.log($scope.mediaCache);
      })
    }
    $scope.takePicture = takePicture;
    // takePicture();
    function getPic(){
      console.log('video baby');
      $cordovaCapture.captureVideo({})
      .then(function(result){
        var pathFull = result[0].fullPath;///////this is what we need to add to our cache
        console.log(pathFull);
        /////next, we push the video plus some extra data to the media cache, where it waits to be submitted
        $scope.mediaCache.push({
          type: "video"
          ,link: pathFull
          ,date: new Date()
        })
        console.log($scope.mediaCache);
      })
    }
    $scope.getPic = getPic;
    // getPic();

    function submitAllPhotos(set){
      //////through our if-statement below, we'll need to add different options so that photos and videos get processed correctly
      var photoOptions = {
          quality : 80,
          destinationType : Camera.DestinationType.FILE_URI,
          sourceType : Camera.PictureSourceType.Camera ,
          allowEdit : true,
          encodingType: Camera.EncodingType.JPEG,
          targetWidth: 100,
          targetHeight: 100,
          popoverOptions: CameraPopoverOptions,
          saveToPhotoAlbum: false,
      };
      var videoOptions = {

      }
      var submissionData = {photos: [], videos: [], userId: ''};
      //////first we need to find the users ID, so we can use it to make the post requests
      $http({
        method: "GET"
        ,url: "https://moneyshotapi.herokuapp.com/api/decodetoken/"+window.localStorage.webToken
      })
      .then(function(decodedToken){
        var userFullId = decodedToken.data.userId;
        submissionData.userId = userFullId;

        ////now iterate through to submit to backend
        for (var i = 0; i <= set.length; i++) {
          if(set[i].type == "video"){
            $cordovaFileTransfer.upload('https://moneyshotapi.herokuapp.com/api/upload/video', set[i].link, {})
            .then(function(callbackImage){
              var splitUrl = callbackImage.response.split('');
              var sliced = splitUrl.slice(1, callbackImage.response.split('').length - 1);
              ////////this is where we're having data problems, you need to figure out why our string result doesnt work to call the video
              $http({
                method: "POST"
                ,url: "https://moneyshotapi.herokuapp.com/api/createphotos"
                ,data: {url: sliced.join(''), userId: userFullId, isVid: true}
              })
              .then(function(newVid){
                submissionData.videos.push(newVid.data._id);
                var vids = submissionData.videos.length;
                var phots = submissionData.photos.length;
                var amalgam = vids + phots;
                if(amalgam == parseInt(set.length)){
                  $http({
                    method: "POST"
                    ,url: "https://moneyshotapi.herokuapp.com/api/new/submission"
                    ,data: submissionData
                  })
                  .then(function(newSubmission){
                  })
                }
              })
            })
          }
          else if(set[i].type == "photo"){
            $cordovaFileTransfer.upload('https://moneyshotapi.herokuapp.com/api/newimage', set[i].link, photoOptions)
            .then(function(callbackImage){
              var parsedPhoto = JSON.parse(callbackImage.response);
              $http({
                method: "POST"
                ,url: "https://moneyshotapi.herokuapp.com/api/createphotos"
                ,data: {url: parsedPhoto.secure_url, userId: userFullId, isVid: false}
              })
              .then(function(newPhoto){
                submissionData.photos.push(newPhoto.data._id);
                var vids = submissionData.videos.length;
                var phots = submissionData.photos.length;
                var amalgam = vids + phots;
                if(amalgam == parseInt(set.length)){
                  $http({
                    method: "POST"
                    ,url: "https://moneyshotapi.herokuapp.com/api/new/submission"
                    ,data: submissionData
                  })
                  .then(function(newSubmission){
                  })
                }
              })
            })
          }
        }
      })
    }
    $scope.submitAllPhotos = submitAllPhotos;

  }
