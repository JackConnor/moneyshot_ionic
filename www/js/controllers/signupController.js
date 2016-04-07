angular.module('signupController', [])

  .config(function(FacebookProvider) {
     // Set your appId through the setAppId method or
     // use the shortcut in the initialize method directly.
     FacebookProvider.init('219996151696499');
  })

  .controller('signupCtrl', signupCtrl);

  signupCtrl.$inject = ['$scope', '$state', 'signup', 'signin', 'newToken', '$cordovaStatusbar', '$window', 'Facebook', '$timeout', '$interval', '$animateCss']

  function signupCtrl($scope, $state, signup, signin, newToken, $cordovaStatusbar, $window, Facebook, $timeout, $interval, $animateCss){
    ionic.Platform.fullScreen();////hides status bar
    ///////////////global variables//////
    // console.log($facebookProvider);
    $scope.signupModalVar  = true;
    $scope.signinModalVar  = false;
    $scope.signupModalTabs = true;
    $scope.introModal      = true;
    $scope.introCounter    = 0;

    //////function to control our photo carousel
    ////////////////////////////////////////////
    $scope.photo1;
    $scope.photo2;
    function moveCarousel(arr, speed){
      $scope.photo1 = arr[0];
      $scope.photo2 = arr[1];
      $interval(function(){
        if(carCounter === 'heads'){
          $('.carouselImageHolder2').removeClass('slideLeftStep2');
          $('.carouselImageHolder1').removeClass('slideLeftStep');
          $('.carouselImageHolder1').addClass('slideLeft0');
          $('.carouselImageHolder2').addClass('slideLeft0');
          $timeout(function(){
            $scope.photo1 = $scope.photoArray[2];
            var endOfLine = $scope.photoArray.slice(0,1);
            $scope.photoArray.shift();
            $scope.photoArray[$scope.photoArray.length] = endOfLine[0];
            // console.log($scope.photoArray);
          }, 1100);
          carCounter = 'tails';
        }
        else if(carCounter === 'tails'){
          $('.carouselImageHolder1').removeClass('slideLeft0');
          $('.carouselImageHolder2').removeClass('slideLeft0');
          $('.carouselImageHolder2').addClass('slideLeftStep2');
          $('.carouselImageHolder1').addClass('slideLeftStep');
          $timeout(function(){
            $scope.photo2 = $scope.photoArray[2];
            var endOfLine = $scope.photoArray.slice(0,1);
            $scope.photoArray.shift();
            $scope.photoArray[$scope.photoArray.length] = endOfLine[0];
            // console.log($scope.photoArray);
          }, 1100);
          carCounter = 'heads';
        }
      }, 2000);
    }
    //////our initial seed photos for the carousel
    var photoArray = ['http://www.eonline.com/eol_images/Entire_Site/2013925/rs_634x1024-131025103438-634.kanye-west-kim-kardashian-dream-africa.ls.102513_copy.jpg', 'http://a1.files.biography.com/image/upload/c_fit,cs_srgb,dpr_1.0,q_80,w_620/MTE5NTU2MzE2MTA0MTk3NjQz.jpg', 'http://popcrush.com/files/2015/11/Siafacegallery1.jpg?w=600&h=0&zc=1&s=0&a=t&q=89', 'https://i.ytimg.com/vi/eiKxjLkV8sA/maxresdefault.jpg'];
    $scope.photoArray = photoArray;
    var carCounter = 'heads';
    moveCarousel(photoArray, 3000);
    //////////end carousel//////////////////////
    ////////////////////////////////////////////

    ////

    ///////////////////////////////
    ////////intro swipe modal stuff
    function checkIntro(){
      if(!window.localStorage.webToken || window.localStorage.webToken == "" || window.localStorage.webToken == null){
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
      var validPW = checkPassword();
      console.log(validPW);
      if(validPW){
        console.log('ye');
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
              return;
            }
            else if(newUser.data == 'please send a password'){
              alert('you forgot your password');
              window.location.reload();
              return;
            }
            else {
              newToken(newUser.data._id)
              .then(function(ourToken){
                var token = ourToken.data;
                console.log(token);
                $scope.signupModalVar = false;
                $scope.signinModalVar = false;
                $scope.signupModalTabs = false;
                window.localStorage.webToken = token;
                window.location.hash = "#/tab/camera";
              })
            }
          })
        }
        else {
          alert('passwords dont match');
        }
      }
      else {
        console.log('password issues');
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

    // console.log(window.location.href);

    ////////password character checking
    function checkPassword(){
      var passwordAttempt = $('.signupPassword').val();
      console.log(passwordAttempt);
      var pwArr = passwordAttempt.split('');
      //////check for length////
      if(pwArr.length < 6){
        alert('sorry, your password must be at least 6 characters');
        $('.signupPassword').val('');
        $('.signupConfirmPassword').val('');
        return false;
      }
      else{
        console.log('passwrod accepted');
        return true;
      }
    }
    $scope.checkPassword = checkPassword;

    ///////email checking///////
    function checkValidEmail(){
      console.log('email');
      var emailVal = $('.signupEmail').val().split('');
      var emLength = emailVal.length;
      console.log(emailVal);
      console.log(emLength);
      var atIndex = null;
      var dotIndex = null;
      for (var i = 0; i < emLength; i++) {
        console.log(emailVal[i]);
        if(emailVal[i] === '@' && i !== emLength-1){
          console.log('yeaaaaa');
          console.log(emailVal[i]);
          atIndex = i;
        }
        else if(emailVal[i] === '.' && i !== emLength-1){
          dotIndex = i;
        }
        else if(i === emLength-1){
          console.log('last letter');
          console.log(atIndex);
          console.log(dotIndex);
          if(atIndex === null){
            alert('you need n @ sign');
            $('.signupEmail').val('');
            $('.signupEmail').unblur();
            return false;
          }
          else if(dotIndex === null){
            alert('you need a . i there');
            $('.signupEmail').val('');
            $('.signupEmail').unblur();
            return false
          }
          else if((atIndex >= dotIndex-2) || (atIndex === 0)){
            alert('I think you have an issue with your email address');
            $('.signupEmail').val('');
            $('.signupEmail').unblur();
            return false;
          }
          else {
            console.log('boom, email accepted');
            return true;
          }
        }
      }
    }
    $scope.checkValidEmail = checkValidEmail;


    ////////////////////////////////////
    /////////////begin fb stuff////////
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
