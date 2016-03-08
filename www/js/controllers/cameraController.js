angular.module('cameraController', ['singlePhotoFactory', 'ngFileUpload', 'ngCordova', 'ngFileUpload'])

  .controller('cameraCtrl', cameraCtrl);

  cameraCtrl.$inject = ['$http', '$state', '$scope', 'singlePhoto', 'Upload', '$q', '$cordovaCamera', '$cordovaFile', '$cordovaFileTransfer', 'signup', 'signin', 'newToken', '$cordovaCapture', 'Upload'];
  function cameraCtrl($http, $state, $scope, singlePhoto, Upload, $q, $cordovaCamera, $cordovaFile, $cordovaFileTransfer, signup, signin, newToken, $cordovaCapture, Upload){

    ////////////////////////////
    /////////global variables///
    // $scope.mediaCache = [{"link":"/img/adam.jpg", "type":"photo"}, {"link":"/img/max.png", "type":"photo"}, {"link":"/img/ben.png", "type":"photo"}];
    $scope.mediaCache = [];
    $scope.croppedPhoto = '';
    $scope.submitModalVar = false;
    $scope.cameraModal = false;
    var eraseSubmitArr = [];
    /////end global variables///
    ////////////////////////////

    /////////////////////////////
    /////functions to upload photos////
    document.addEventListener("deviceready", function() {
        canvasMain = document.getElementById("camera");
        CanvasCamera.initialize(canvasMain);
        // define options
        var opt = {
            quality: 75,
            destinationType: CanvasCamera.DestinationType.DATA_URL,
            encodingType: CanvasCamera.EncodingType.JPEG,
            saveToPhotoAlbum:false,
            correctOrientation:true,
            width:300,
            height:300
        };
        CanvasCamera.start(opt);
        console.log(document.getElementById('camera').style.width);
        console.log(document.getElementById('camera').style.height);
        document.getElementById('camera').style.height = 80+"%"
        function takeCordovaPicture(){
          var canvas = document.getElementById("camera");
          // console.log(canvas);
          var dataURL = canvas.toDataURL("img/png");
          dataRefined = "data:image/jpeg;base64," + dataURL;
          // console.log(dataURL);
          $scope.newPhotoData = dataURL;
          $scope.mediaCache.push({
            type: "photo"
            ,link: $scope.newPhotoData
            ,date: new Date()
          })
          console.log($scope.mediaCache);
          // $cordovaFileTransfer.upload('https://moneyshotapi.herokuapp.com/api/newimage', dataURL, {})
          // .then(function(callbackImage){
          //   console.log(callbackImage);
          //   var parsedPhoto = JSON.parse(callbackImage.response);
          //   console.log(parsedPhoto);
          // })
        }
        $scope.takeCordovaPicture = takeCordovaPicture;
    });

    function openPhotoModal(){
      $scope.cameraModal = true;
    }
    $scope.openPhotoModal = openPhotoModal;

    function takePicture(){
      console.log('opening camera');
      var options = {
          quality : 80,
          destinationType : Camera.DestinationType.FILE_URI,
          sourceType : Camera.PictureSourceType.Camera ,
          allowEdit : true,
          encodingType: Camera.EncodingType.PNG,
          targetWidth: 100,
          targetHeight: 100,
          correctOrientation: true,
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
      $scope.submitModalVar = true;
    }
    $scope.openSubmitModal = openSubmitModal;

    function selectSubmitted(evt, index){
      if(!$(evt.currentTarget).hasClass('selected')){
        console.log(evt);
        console.log(index);
        $(evt.currentTarget).css({
          color: "blue"
        })
        $(evt.currentTarget).addClass('selected');
        eraseSubmitArr.push(index);
        // $scope.mediaCache.splice(index, 1);
      }
      else {
        $(evt.currentTarget).css({
          color: "white"
        });
        $(evt.currentTarget).removeClass('selected');
        eraseSubmitArr = eraseSubmitArr.sort();
        console.log(eraseSubmitArr);
        for (var i = 0; i < eraseSubmitArr.length; i++) {
          if(eraseSubmitArr[i] == index){
            eraseSubmitArr[i] = null;
            console.log(eraseSubmitArr);
          }
        };
        for (var i = 0; i < eraseSubmitArr.length; i++) {
          if(eraseSubmitArr[i] == null){
            console.log(eraseSubmitArr);
            eraseSubmitArr.splice(i, 1)
          }
        }
        console.log(eraseSubmitArr);
      }

    }
    $scope.selectSubmitted = selectSubmitted;


    function deletePhotos(){
      console.log(eraseSubmitArr);
      for (var i = 0; i < eraseSubmitArr.length; i++) {
        console.log($scope.mediaCache);
        $scope.mediaCache.splice(eraseSubmitArr[i], 1);
        console.log(eraseSubmitArr[i]);
      }
      eraseSubmitArr = [];
    }
    $scope.deletePhotos = deletePhotos;

    //////function to submit all cached photos from your session to the db
    function submitAllPhotos(set){
      console.log(set);
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
      $scope.croppedPhoto = photoData;
      $('.submitCropContainer').animate({
        marginLeft: 0
      }, 700);
      $('.submitCropContainer').append(
        "<img id='image' src='"+photoData.link+"' class='cropImage'>"
      )
      $('.cropImage').css({
        width: 100+"%"
        ,height: 100+"%"
      })
      $(".cropImage").cropper({
        zoomOnWheel: false,
        background: false,
        modal: false,
        autoCrop: true,
        rotate: 90,
        crop: function(e){
          console.log(e);
          $scope.cropData = e;
        },
        built: function (e) {
          $(this).cropper('crop');
        }
      });
    }
    $scope.cropPhoto = cropPhoto;

    function backToSubmit(){
      $('.submitCropContainer').animate({
        marginLeft: 100+"%"
      }, 500);
    }
    $scope.backToSubmit = backToSubmit;

    function backToPhotos(){
      $scope.submitModalVar = false;
    }
    $scope.backToPhotos = backToPhotos;
  }
