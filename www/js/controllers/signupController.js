angular.module('signupController', [])

  .config(function(FacebookProvider) {
     // Set your appId through the setAppId method or
     // use the shortcut in the initialize method directly.
     FacebookProvider.init('219996151696499');
  })

  .controller('signupCtrl', signupCtrl);

  signupCtrl.$inject = ['$scope', '$state', 'signup', 'signin', 'newToken', '$cordovaStatusbar', '$window', 'Facebook']

  function signupCtrl($scope, $state, signup, signin, newToken, $cordovaStatusbar, $window, Facebook){
    ionic.Platform.fullScreen();////hides status bar
    ///////////////global variables//////
    // console.log($facebookProvider);
    $scope.signupModalVar  = false;
    $scope.signinModalVar  = true;
    $scope.signupModalTabs = true;
    $scope.introModal      = true;
    $scope.introCounter    = 0;

    console.log('yoyoyo');
    console.log(window.localStorage.webToken);


    //////function to control our photo carousel
    ////////////////////////////////////////////
    function moveCarousel(arr, speed){
      console.log('outter');
      var arr = arr;
      // $scope.carouselPhoto1 = arr[0];
      // $scope.carouselPhoto2 = arr[1];
      $('.photoImage1').attr('src', arr[0]);
      $('.photoImage2').attr('src', arr[1]);
      var carouselIntervalCounter = 0;
      setInterval(function(){
        if(carouselIntervalCounter === 0){
          $('.carouselHolders').animate({
            marginLeft: "-100%"
          }, 900);
          carouselIntervalCounter++;
        }
        else if(carouselIntervalCounter !== 0){
          var endOfLine = arr.slice(0, 1);
          arr.shift();
          arr[arr.length] = endOfLine[0];
          $('.carouselHolders').css({
            marginLeft: "0"
          });
          $('.photoImage1').attr('src', arr[0]);
          $('.photoImage2').attr('src', arr[1]);
          $('.carouselHolders').animate({
            marginLeft: "-100%"
          }, 900);
          carouselIntervalCounter = 0;
        }
      }, speed);
    }
    var photoArray = ['http://www.eonline.com/eol_images/Entire_Site/2013925/rs_634x1024-131025103438-634.kanye-west-kim-kardashian-dream-africa.ls.102513_copy.jpg', 'http://a1.files.biography.com/image/upload/c_fit,cs_srgb,dpr_1.0,q_80,w_620/MTE5NTU2MzE2MTA0MTk3NjQz.jpg', 'http://popcrush.com/files/2015/11/Siafacegallery1.jpg?w=600&h=0&zc=1&s=0&a=t&q=89', 'https://i.ytimg.com/vi/eiKxjLkV8sA/maxresdefault.jpg']
    moveCarousel(photoArray, 3000);

    //////////end carousel//////////////////////
    ////////////////////////////////////////////

    ///////////////////////////////
    ////////intro swipe modal stuff
    function checkIntro(){
      if(!window.localStorage.webToken || window.localStorage.webToken == "" || window.localStorage.webToken == null){
        console.log('no token');
        $scope.introModal = true;
        $('.tab-nav').css({
          height: 0+"px"
        })
      }
      else {
        window.location.hash = "#/tab/camera";
      }
    }
    checkIntro();
    function introSwipeLeft(){
      console.log('swiping');
      if($scope.introCounter < 3 && $scope.introCounter >=0){
        $scope.introCounter++;
        console.log($scope.introCounter);
        $('.swipeIntroRow').animate({
          marginLeft: -($scope.introCounter*100)+"%"
        }, 200);
      }
      else if($scope.introCounter >= 3){
        exitIntro();
        $scope.introCounter = 0;
      }
    }
    $scope.introSwipeLeft = introSwipeLeft;

    function introSwipeRight(){
      if($scope.introCounter > 0){
        $scope.introCounter--;
        console.log($scope.introCounter);
        $('.swipeIntroRow').animate({
          marginLeft: -($scope.introCounter*100)+"%"
        }, 200);
      }
    }
    $scope.introSwipeRight = introSwipeRight;

    /////function to exit the intro modal
    function exitIntro(){
      $('.tab-nav').css({
        height: 49+"px"
      })
      $scope.introModal = false;
    }
    $scope.exitIntro = exitIntro;
    exitIntro();/////need to take this out to reactivate the intro modal
    ////////end intro swipe modal stuff
    ///////////////////////////////////
    // function to signup users who are new to the site
    function signupUser(){
      var email = $('.signupEmail').val();
      var password = $('.signupPassword').val();
      var repassword = $('.signupConfirmPassword').val();
      if(password == repassword){
        signup(email, password)
        .then(function(newUser){
          console.log(newUser);
          if(newUser.data == 'email already in use'){
            alert('that email is already in the system, please try another one or login using your password');
            window.location.reload();
          }
          else if(newUser.data == 'please send a password'){
            alert('you forgot your password');
            window.location.reload();
          }
          else {
            newToken(newUser.data._id)
            .then(function(ourToken){
              var token = ourToken.data;
              console.log(token);
              $scope.signupModalVar = false;
              $scope.signinModalVar = false;
              $scope.signupModalTabs = false;
              ///////final callback, which opens up the camera
              // removeSignupModal();
              window.localStorage.webToken = token;
              window.location.hash = "#/tab/camera"
            })
          }
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
      console.log(email);
      console.log(password);
      signin(email, password)
      .then(function(signedInUser){
        console.log(signedInUser);
        if(signedInUser.data == 'no user found with that email address'){
          alert('we could not find your email address')
          window.location.reload();
        }
        else if(signedInUser.data == 'incorrect password'){
          alert('wrong password, please try again');
          window.location.reload();
        }
        else {
          $scope.signupModalTabs = false;
          newToken(signedInUser.data._id)
          .then(function(ourToken){
            var token = ourToken.data;
            $scope.signupModalVar = false;
            $scope.signinModalVar = false;
            $scope.signupModalTabs = false;
            window.localStorage.webToken = token;
            $state.go('tab.camera');
          })
        }
      })
    }
    $scope.signinUser = signinUser;

    function signoutUser(){
      console.log('yoyoy');
      window.localStorage.webToken = "";
      window.location.hash = "#/";
      window.location.reload();
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
      console.log(evt);
      if($(evt.currentTarget).hasClass('goToSignin')){
        $scope.signupModalVar = false;
        $scope.signinModalVar = true;
        $scope.signupModalTabs = true;
      }
      else if($(evt.currentTarget).hasClass('goToSignup')){
        $scope.signinModalVar = false;
        $scope.signupModalVar = true;
        $scope.signupModalTabs = true;
      }
    }
    $scope.toggleSigns = toggleSigns;

    // function to check for a signed in user via their token
    function checkToken(){
      var maybeToken = window.localStorage.webToken;
      if(maybeToken.length > 4){
        $scope.signupModalVar = false;
        $scope.signinModalVar = false;
        $scope.signupModalTabs = false;
        console.log('signed in already');
      }
      else {
        console.log('no token');
        $scope.signinModalVar = true;
        $scope.signupModalTabs = true;
        window.location.hash = "#/";
      }
    }

    /////toggling signin/signup
    function hoverSignin(evt){
      $(evt.currentTarget).css({
        color: 'blue'
      })
    }
    $scope.hoverSignin = hoverSignin;

    function outHoverSignin(evt){
      $(evt.currentTarget).css({
        color: 'white'
      })
    }
    $scope.outHoverSignin = outHoverSignin;
    console.log(Facebook);

    // console.log(window.location.href);
    FB.init({
        appId: '219996151696499',
        status: true,
        cookie: true,
        xfbml: true,
        version: 'v2.4'
    });
    function launchFB(){
      console.log('yo');
      console.log(window.location.href);
      console.log(FB);
      console.log(FB.XFBML);
      // Facebook.getLoginStatus(function(response){
      //   console.log(response);
      // })
      // FB.getLoginStatus(function(response){
      //   console.log(response);
      //   if(response.status == 'unknown' || response.status == 'not_authorized'){
      //     FB.login(function(loginResponse){
      //       console.log(loginResponse);
      //     })
      //   }
      //   else {
      //     console.log('already logged in, it would seem');
      //   }
      // })
    }
    $scope.launchFB = launchFB;

    ///////end facebook shit//
    //////////////////////////
  }
