angular.module('cameraController', ['singlePhotoFactory', 'ngFileUpload', 'ngCordova', 'ngFileUpload'])

  .controller('cameraCtrl', cameraCtrl);

  cameraCtrl.$inject = ['$http', '$state', '$scope', 'singlePhoto', 'Upload', '$q', '$cordovaCamera', '$cordovaFile', '$cordovaFileTransfer', 'signup', 'signin', 'newToken', '$cordovaCapture', 'Upload', '$jrCrop'];
  function cameraCtrl($http, $state, $scope, singlePhoto, Upload, $q, $cordovaCamera, $cordovaFile, $cordovaFileTransfer, signup, signin, newToken, $cordovaCapture, Upload, $jrCrop){

    ////////////////////////////
    /////////global variables///
    $scope.mediaCache = [{"link":"/img/adam.jpg", type:"photo"}];
    // $scope.mediaCache = [];
    $scope.croppedPhoto = '';
    $scope.submitModalVar = false;
    var eraseSubmitArr = [];
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

    //////function to open the submit modal
    function openSubmitModal(){
      console.log('opening');
      $scope.submitModalVar = true;
    }
    $scope.openSubmitModal = openSubmitModal;

    function selectSubmitted(evt, index){
      console.log(evt);
      console.log(index);
      $(evt.currentTarget).css({
        color: "blue"
      })
      eraseSubmitArr.push(index);
      // $scope.mediaCache.splice(index, 1);
    }
    $scope.selectSubmitted = selectSubmitted;


    function deletePhotos(){
      for (var i = 0; i < eraseSubmitArr.length; i++) {
        $scope.mediaCache.splice(eraseSubmitArr[i], 1);
        console.log($scope.mediaCache);
        console.log(eraseSubmitArr[i]);
      }
    }
    $scope.deletePhotos = deletePhotos;

    //////function to submit all cached photos from your session to the db
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
        ,url: "http://192.168.0.5:5555/api/decodetoken/"+window.localStorage.webToken
      })
      .then(function(decodedToken){
        var userFullId = decodedToken.data.userId;
        submissionData.userId = userFullId;

        ////now iterate through to submit to backend
        for (var i = 0; i <= set.length; i++) {
          if(set[i].type == "video"){
            $cordovaFileTransfer.upload('http://192.168.0.5:5555/api/upload/video', set[i].link, {})
            .then(function(callbackImage){
              var splitUrl = callbackImage.response.split('');
              var sliced = splitUrl.slice(1, callbackImage.response.split('').length - 1);
              ////////this is where we're having data problems, you need to figure out why our string result doesnt work to call the video
              $http({
                method: "POST"
                ,url: "http://192.168.0.5:5555/api/createphotos"
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
                    ,url: "http://192.168.0.5:5555/api/new/submission"
                    ,data: submissionData
                  })
                  .then(function(newSubmission){

                  })
                }
              })
            })
          }
          else if(set[i].type == "photo"){
            $cordovaFileTransfer.upload('http://192.168.0.5:5555/api/newimage', set[i].link, photoOptions)
            .then(function(callbackImage){
              var parsedPhoto = JSON.parse(callbackImage.response);
              $http({
                method: "POST"
                ,url: "http://192.168.0.5:5555/api/createphotos"
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
                    ,url: "http://192.168.0.5:5555/api/new/submission"
                    ,data: submissionData
                  })
                  .then(function(newSubmission){
                    $scope.submitModalVar = false;
                  })
                }
              })
            })
          }
        }
      })
    }
    $scope.submitAllPhotos = submitAllPhotos;

    function cropPhoto(photoData, evt){
      console.log(evt.currentTarget);
      console.log(photoData);
      $scope.croppedPhoto = photoData;
      $('.submitCropContainer').animate({
        marginLeft: 0
      }, 500);
      // $jrCrop.crop({
      //   url: photoData.link
      //   ,width: 200+"px"
      //   ,height: 200+"px"
      // })
      // .then(function(data){
      //   console.log(data.toDataURL());
      // })
      // $('#image').cropit();
      $('.submitCropContainer').append(
        "<img id='image' src='"+photoData.link+"' class='cropImage col-sm-8 col-sm-offset-2 col-xs-8 col-xs-offset-2'>"
      )
      $(".cropImage").cropper({
        autoCrop: false,
        built: function () {
          // Do something here
          // ...

          // And then
          $(this).cropper('crop');
        }
      });
    }
    $scope.cropPhoto = cropPhoto;
  }
