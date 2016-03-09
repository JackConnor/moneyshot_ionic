angular.module('cameraController', ['singlePhotoFactory', 'ngFileUpload', 'ngCordova', 'ngFileUpload'])

  .controller('cameraCtrl', cameraCtrl);

  cameraCtrl.$inject = ['$http', '$state', '$scope', 'singlePhoto', 'Upload', '$q', '$cordovaCamera', '$cordovaFile', '$cordovaFileTransfer', 'signup', 'signin', 'newToken', '$cordovaCapture', 'Upload'];
  function cameraCtrl($http, $state, $scope, singlePhoto, Upload, $q, $cordovaCamera, $cordovaFile, $cordovaFileTransfer, signup, signin, newToken, $cordovaCapture, Upload){

    ////////////////////////////
    /////////global variables///
    $scope.mediaCache = [{"link":"/img/adam.jpg", "type":"photo"}, {"link":"/img/max.png", "type":"photo"}, {"link":"/img/ben.png", "type":"photo"}];
    // $scope.mediaCache = [];
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
            quality: 95,
            destinationType: CanvasCamera.DestinationType.DATA_URL,
            encodingType: CanvasCamera.EncodingType.JPEG,
            saveToPhotoAlbum:false,
            correctOrientation:true,
            width:300,
            height:300
        };
        CanvasCamera.start(opt);
        document.getElementById('camera').style.height = 100+"%"
        function takeCordovaPicture(){
          var canvas = document.getElementById("camera");
          var dataURL = canvas.toDataURL("img/png");
          dataRefined = "data:image/jpeg;base64," + dataURL;
          $scope.newPhotoData = dataURL;
          $scope.mediaCache.push({
            type: "photo"
            ,link: $scope.newPhotoData
            ,date: new Date()
          })
          $('.takePhotoButton').css({
            backgroundColor: "red"
          })
          setTimeout(function(){
            $('.takePhotoButton').css({
              backgroundColor: "blue"
            })
          }, 300)
          $('#camera').css({
            border: "5px solid white"
          })
          setTimeout(function(){
            $('#camera').css({
              border: ""
            })
          }, 300);
        }
        $scope.takeCordovaPicture = takeCordovaPicture;
    });

    function outPhotoModal(){
      $scope.cameraModal = false;
    }
    $scope.outPhotoModal = outPhotoModal;

    function openPhotoModal(){
      $scope.cameraModal = true;
    }
    $scope.openPhotoModal = openPhotoModal;
    openPhotoModal();/////calling this function to open the modal right away

    function takePicture(){
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
      })
    }
    $scope.takePicture = takePicture;
    // takePicture();
    function getPic(){
      $cordovaCapture.captureVideo({})
      .then(function(result){
        var pathFull = result[0].fullPath;///////this is what we need to add to our cache
        /////next, we push the video plus some extra data to the media cache, where it waits to be submitted
        $scope.mediaCache.push({
          type: "video"
          ,link: pathFull
          ,date: new Date()
        })
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
      var circleEl = $(evt.currentTarget).children()[0];
      console.log();
      console.log(evt.currentTarget.firstChild);
      if(!$(circleEl).hasClass('selected')){
        $(circleEl).css({
          color: '#7FFF00'
        })
        $(circleEl).addClass('selected');
        $(circleEl).removeClass('fa-circle-thin');
        $(circleEl).addClass('fa-circle');
        console.log();
        $($(evt.currentTarget)[0].parentElement).css({
          border: "5px solid #7FFF00"
        })
        eraseSubmitArr.push(index);
        // $scope.mediaCache.splice(index, 1);
      }
      else {
        $(circleEl).css({
          color: "white"
          ,backgroundColor: ''
        });
        $($(evt.currentTarget)[0].parentElement).css({
          border: ""
        })
        $(circleEl).removeClass('selected');
        $(circleEl).removeClass('fa-circle');
        $(circleEl).addClass('fa-circle-thin');
        eraseSubmitArr = eraseSubmitArr.sort();
        for (var i = 0; i < eraseSubmitArr.length; i++) {
          if(eraseSubmitArr[i] == index){
            eraseSubmitArr[i] = null;
          }
        };
        for (var i = 0; i < eraseSubmitArr.length; i++) {
          if(eraseSubmitArr[i] == null){
            eraseSubmitArr.splice(i, 1)
          }
        }
      }

    }
    $scope.selectSubmitted = selectSubmitted;


    function deletePhotos(){
      for (var i = 0; i < eraseSubmitArr.length; i++) {
        $scope.mediaCache.splice(eraseSubmitArr[i], 1);
      }
      eraseSubmitArr = [];
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
                    console.log(newSubmission);
                    $scope.submitModalVar = false;
                    $scope.cameraModal = false;
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
                    console.log(newSubmission);
                    $scope.submitModalVar = false;
                    $scope.cameraModal = false;
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
      console.log($scope.croppedPhoto.link.split('').splice($scope.croppedPhoto.link.split('').length-10, $scope.croppedPhoto.link.split('').length-1));
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
        viewMode: 1,
        aspectRatio: 4/5,
        crop: function(e){
          $scope.cropData = e;
          console.log(e);
          // console.log(JSON.parse(e));
          console.log($(".cropImage").cropper('getImageData'));
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

    function submitModalOpen(){
      $scope.submitModalVar = true;
    }

    $scope.submitModalOpen = submitModalOpen;

    function backToPhotos(){
      $scope.submitModalVar = false;
    }
    $scope.backToPhotos = backToPhotos;
  }
