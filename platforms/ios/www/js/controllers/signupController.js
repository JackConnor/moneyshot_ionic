angular.module('signupController', [])

  .config(function(FacebookProvider) {
     // Set your appId through the setAppId method or
     // use the shortcut in the initialize method directly.
     FacebookProvider.init('219996151696499');
  })

  .controller('signupCtrl', signupCtrl);

  signupCtrl.$inject = ['$scope', '$http', '$state', 'signup', 'signin', 'newToken', '$cordovaStatusbar', '$window', 'Facebook', '$timeout', '$interval', '$animateCss']

  function signupCtrl($scope, $http, $state, signup, signin, newToken, $cordovaStatusbar, $window, Facebook, $timeout, $interval, $animateCss){
    console.log('Sign Loaded')
    ionic.Platform.fullScreen();////hides status bar
    ///////////////global variables//////
    $scope.signupModalVar   = false;
    $scope.signinModalVar   = false;
    $scope.signupModalTabs  = false;
    $scope.introModal       = true;
    $scope.getPasswordModal = false;
    $scope.newPwModal       = false;
    $scope.pwHide           = false;
    $scope.introCounter     = 0;
    $scope.introTag = "Shoot Awesome Photos";

    //////function to control our photo carousel
    ////////////////////////////////////////////
    $scope.photo1;
    $scope.photo2;

    ///////////////////////////////
    ////////intro swipe modal stuff
    // function checkIntro(){
    //   if(!window.localStorage.webToken || window.localStorage.webToken == "" || window.localStorage.webToken == null){
    //     $scope.introModal = true;
    //     $timeout(function(){
    //       document.getElementsByTagName('html')[0].style.opacity = '1'
    //     }, 1000);
    //     $timeout(function(){
    //       document.getElementsByTagName('html')[0].style.opacity = '1'
    //     }, 1300);
    //     $timeout(function(){
    //       document.getElementsByTagName('html')[0].style.opacity = '1'
    //     }, 1600);
    //     $('html').animate({
    //       opacity: 1
    //     }, 700);
    //
    //     $('.tab-nav').css({
    //       height: 0+"px"
    //     })
    //   }
    //   else {
    //     window.location.hash = "#/tab/camera";
    //     window.location.reload();
    //   }
    // }
    // document.addEventListener("deviceready", function(){
    //   checkIntro();
    // });

    function backToIntro(){
      console.log('yooyo');
      $scope.signinModalVar = false;
      $scope.signinModalVar = false;
    }
    $scope.backToIntro = backToIntro();
    // $timeout(function(){
    //   checkIntro();
    // }, 1000);
    // $timeout(function(){
    //   checkIntro();
    // }, 2000);
    // $timeout(function(){
    //   checkIntro();
    // }, 3000);

    function introSwipeLeft(){
      addTagline();
      if($scope.introCounter < 3 && $scope.introCounter >=0){
        $scope.introCounter++;
        $('.swipeIntroRow').animate({
          marginLeft: -($scope.introCounter*100)+"%"
        }, 200);
      }
      else if($scope.introCounter >= 3){
        $scope.introCounter = 0;
        addTagline();
        $('.swipeIntroRow').css({
          marginLeft: '-3px'
        });
        $scope.introCounter = 1;
        $('.swipeIntroRow').animate({
          marginLeft: -($scope.introCounter*100)+"%"
        }, 200);

      }
    }
    $scope.introSwipeLeft = introSwipeLeft;

    var swipeInterval = setInterval(function(){
      introSwipeLeft();
    }, 2500);

    function addTagline(){
      console.log($scope.introCounter);

      if($scope.introCounter == 0){
        console.log('yaaa');
        $('.signinTaglineText').animate({
          opacity: 0
        }, 100);
        $timeout(function(){
          $('.signinTaglineText').text('Earn Lots of Money');
          $('.signinTaglineText').animate({
            opacity: 1
          }, 100);
        }, 100)
      }
      else if($scope.introCounter == 1){
        console.log('yaaa');
        $('.signinTaglineText').animate({
          opacity: 0
        }, 100);
        $timeout(function(){
          $('.signinTaglineText').text('Publish Your Photos');
          $('.signinTaglineText').animate({
            opacity: 1
          }, 100);
        }, 100)
      }
      else if($scope.introCounter == 2){
        console.log('yaaa');
        $('.signinTaglineText').animate({
          opacity: 0
        }, 100);
        $timeout(function(){
          $('.signinTaglineText').text('Take Awesome Photos');
          $('.signinTaglineText').animate({
            opacity: 1
          }, 100);
        }, 100)
      }
    }

    function introSwipeRight(){
      if($scope.introCounter > 0){
        $scope.introCounter--;
        $('.swipeIntroRow').animate({
          marginLeft: -($scope.introCounter*100)+"%"
        }, 200);
      }
    }
    $scope.introSwipeRight = introSwipeRight;

    /////function to exit the intro modal
    function exitIntro(){
      console.log('exiting intro');
      $('.tab-nav').css({
        height: 49+"px"
      })
      $scope.introModal = false;
    }
    $scope.exitIntro = exitIntro;

    // Intro dots
    function dotActive(number){
      return $scope.introCounter === number ? true : false;
    }
    $scope.dotActive = dotActive;

    // exitIntro();/////need to take this out to reactivate the intro modal
    ////////end intro swipe modal stuff
    ///////////////////////////////////
    // function to signup users who are new to the site
    function signupUser(){
      var validPW = checkPassword();
      if(validPW){
        var email = $('.signupEmail').val();
        var password = $('.signupPassword').val();
        var repassword = $('.signupConfirmPassword').val();
        if(password == repassword){
          signup(email, password)
          .then(function(newUser){
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
                $scope.signupModalVar = false;
                $scope.signinModalVar = false;
                $scope.signupModalTabs = false;
                window.localStorage.webToken = token;
                $http({
                  method: "POST"
                  ,url: "https://moneyshotapi.herokuapp.com/api/signup/email"
                  ,data: {userEmail: email}
                })
                .then(function(mailCallback){
                  window.location.hash = "#/tab/camera";
                })
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
      console.log('signing in');
      var email = $('.signupEmail').val();
      var password = $('.signupPassword').val();
      signin(email, password)
      .then(function(signedInUser){
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

    //////function if a user forgets their password
    function getPassword(){
      console.log('heyyy');
      // $scope.getPasswordModal = true;
      //////new version of what this does
      if($scope.pwHide === false){
        $('.signupPassword').hide();
        $('.submitSignup').css({
          marginTop: 65+'px'
        });
        $timeout(function(){
          console.log('yoooooo');
          $('.submitSignup').text('Get Password');
          $(".forgotPassword").text('Back to Sign in');
        }, 20);
        $('.submitSignup').animate({
          marginTop: 10+'px'
        }, 350);
      }
      else if($scope.pwHide){
        $('.submitSignup').animate({
          marginTop: 65+'px'
        }, 350);
        $('.submitSignup').text('Sign In');
        $(".forgotPassword").text('Forgot Password?');
        setTimeout(function(){
          $('.signupPassword').show();
          $('.submitSignup').css({
            marginTop: 10+'px'
          });
        }, 360);
      }
      $scope.pwHide = !$scope.pwHide;
    }
    $scope.getPassword = getPassword;
    // $('.forgotPassword').on('click', getPassword);

    /////////functions to go to the signup and signin modals
    function toSignin(){
      $scope.signinModalVar   = true;
      clearInterval(swipeInterval);
      $scope.introModal       = false;
    }
    $scope.toSignin = toSignin;

    ////function to go to signup page
    function toSignup(){
      $scope.signupModalVar   = true;
      $('.swipeIntro').animate({
        opacity: 0
      }, 600);
      clearInterval(swipeInterval);
      $scope.signinModalVar   = false;
      setTimeout(function(){
        $scope.introModal       = false;
        $scope.signupModalVar   = true;
      }, 700);
    }
    $scope.toSignup = toSignup;


    function retrievePW(email){
      console.log('getting pw');
      var email = $('.signupEmail').val().toLowerCase();
      $http({
        method: "POST"
        ,url: "http://192.168.0.12:5555/api/newpw/request"
        ,data: {userEmail: email}
      })
      .then(function(pwCall){
        if(pwCall.data !== 'no user'){
          alert('check your email for password information');
          $scope.newPwModal = false;
          $scope.getPasswordModal = false;
          window.location.reload();
        }
        else {
          alert('whoops cant find that user, please enter a new email or check for typos');
        }
      })
    }

    ////function so signin button can toggle between multiple functions
    function signinToggleButton(){
      if($scope.pwHide){
        retrievePW();
      }
      else if(!$scope.pwHide){
        signinUser();
      }
    }
    $scope.signinToggleButton = signinToggleButton;
    // $scope.retrievePW = retrievePW;


    //////function to create a new password
    function newPw(){
      var newPass = $('.newPassword').val();
      var confirmNewPw = $('.confirmNewPassword').val();
      if(newPass === confirmNewPw){
        var email = $('.getPwEmail').val();
        alert(email+" "+newPass);
        $http({
          method: "POST"
          ,url: 'https://moneyshotapi.herokuapp.com/api/update/pw'
          ,data: {email: email, password: newPass}
        })
        .then(function(updatedUser){
          console.log(updatedUser);
        })

      }
      else {
        alert('your passwords dont match');
      }
    }
    $scope.newPw = newPw;


    function closePwModal(){
      $scope.getPasswordModal = false;
    }
    $scope.closePwModal = closePwModal;

    function signoutUser(){
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
      if($(evt.currentTarget).hasClass('goToSignin')){
        $scope.signupModalVar  = false;
        $scope.signinModalVar  = true;
        $scope.signupModalTabs = true;
        $scope.pwHide          = false;
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
      }
      else {
        $scope.signinModalVar = true;
        $scope.signupModalTabs = true;
        window.location.hash = "#/";
      }
    }

    // console.log(window.location.href);

    ////////password character checking
    function checkPassword(){
      var passwordAttempt = $('.signupPassword').val();
      var pwArr = passwordAttempt.split('');
      //////check for length////
      if(pwArr.length < 6){
        alert('sorry, your password must be at least 6 characters');
        $('.signupPassword').val('');
        $('.signupConfirmPassword').val('');
        return false;
      }
      else{
        return true;
      }
    }
    $scope.checkPassword = checkPassword;

    ///////email checking///////
    function checkValidEmail(){
      var emailVal = $('.signupEmail').val().split('');
      var emLength = emailVal.length;
      var atIndex = null;
      var dotIndex = null;
      for (var i = 0; i < emLength; i++) {
        if(emailVal[i] === '@' && i !== emLength-1){
          atIndex = i;
        }
        else if(emailVal[i] === '.' && i !== emLength-1){
          dotIndex = i;
        }
        else if(i === emLength-1){
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
            return true;
          }
        }
      }
    }
    $scope.checkValidEmail = checkValidEmail;

    function backToSliderFunc(){
      $scope.signinModalVar   = true;
      // $scope.pwHide = false;
      // setTimeout(function(){
        $scope.introModal = true;
        var swipeInterval = setInterval(function(){
          introSwipeLeft();
        }, 2500);
      // }, 600);
    }
    $scope.backToSliderFunc = backToSliderFunc;

  }
