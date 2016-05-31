angular.module('signupController', [])

  // .config(function(FacebookProvider) {
  //    // Set your appId through the setAppId method or
  //    // use the shortcut in the initialize method directly.
  //    FacebookProvider.init('219996151696499');
  // })

  .controller('signupCtrl', signupCtrl);

  signupCtrl.$inject = ['$scope', '$http', '$state', 'signup', 'signin', 'newToken', '$cordovaStatusbar', '$window', '$timeout', '$interval', '$animateCss']

  function signupCtrl($scope, $http, $state, signup, signin, newToken, $cordovaStatusbar, $window, $timeout, $interval, $animateCss){
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

    function backToIntro(){
      $scope.signinModalVar = false;
      $scope.signinModalVar = false;
    }
    $scope.backToIntro = backToIntro();


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

    ///adds text bubble to intro
    function addTagline(){
      console.log($scope.introCounter);
      if($scope.introCounter == 0 || $scope.introCounter == 3){
        $($('.intro-dot-item')[0]).addClass('fa-circle-o');
        $($('.intro-dot-item')[0]).removeClass('fa-circle');
        $($('.intro-dot-item')[2]).addClass('fa-circle-o');
        $($('.intro-dot-item')[2]).removeClass('fa-circle');

        $($('.intro-dot-item')[1]).removeClass('fa-circle-o');
        $($('.intro-dot-item')[1]).addClass('fa-circle');
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
        $($('.intro-dot-item')[0]).addClass('fa-circle-o');
        $($('.intro-dot-item')[0]).removeClass('fa-circle');
        $($('.intro-dot-item')[1]).addClass('fa-circle-o');
        $($('.intro-dot-item')[1]).removeClass('fa-circle');

        $($('.intro-dot-item')[2]).removeClass('fa-circle-o');
        $($('.intro-dot-item')[2]).addClass('fa-circle');
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
        $($('.intro-dot-item')[2]).addClass('fa-circle-o');
        $($('.intro-dot-item')[2]).removeClass('fa-circle');
        $($('.intro-dot-item')[0]).addClass('fa-circle-o');
        $($('.intro-dot-item')[0]).removeClass('fa-circle');

        $($('.intro-dot-item')[0]).removeClass('fa-circle-o');
        $($('.intro-dot-item')[0]).addClass('fa-circle');
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
            console.log(newUser);
            if(newUser.data == 'email already in use'){
              alert('that email is already in the system, please try another one or login using your password');
              $('.signupEmail').val('');
              $('.signupPassword').val('');
              $('.signupConfirmPassword').val('');
              return;
            }
            else if(newUser.data == 'please send a password'){
              alert('you forgot your password');
              return;
            }
            else if(email.split('@').length < 2){
              alert('You need an @');
              $('.signupPassword').val('');
              $('.signupConfirmPassword').val('');
            }
            else if(email.split('.').length < 2){
              alert('Your email needs a proper ending');
              $('.signupPassword').val('');
              $('.signupConfirmPassword').val('');
            }
            else {
              newToken(newUser.data._id)
              .then(function(ourToken){
                var token = ourToken.data;
                $scope.signupModalVar = false;
                $scope.signinModalVar = false;
                $scope.signupModalTabs = false;
                window.localStorage.webToken = token;
                $state.go('tab.camera');
                // $http({
                //   method: "POST"
                //   ,url: "http://192.168.0.7:5555/api/signup/email"
                //   ,data: {userEmail: email}
                // })
                // .then(function(mailCallback){
                //   console.log(mailCallback);
                //   window.location.hash = "#/tab/camera";
                //   window.reload();
                // })
              })
            }
          })
        }
        else {
          alert('passwords dont match');
          $('.signupEmail').val('');
          $('.signupPassword').val('');
          $('.signupConfirmPassword').val('');
        }
      }
      else {
        alert('sorry, your password must be at least 6 characters');
        $('.signupEmail').val('');
        $('.signupPassword').val('');
        $('.signupConfirmPassword').val('');
      }
    }
    $scope.submitSignup = signupUser;


    /////function to sign in a user
    function signinUser(){
      var email = $('.signinEmail').val();
      var password = $('.signinPassword').val();
      if(email.length < 1){
        alert('Please include your email');
      }
      else {
        signin(email, password)
        .then(function(signedInUser){
          if(signedInUser.data == 'no user found with that email address'){
            alert('We could not find your email address')
            $('.signupPassword').val('');
            $('.signupEmail').val('');
          }
          else if(signedInUser.data == 'incorrect password'){
            alert('wrong password, please try again');
            $('.signupPassword').val('');
            $('.signupEmail').val('');
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
    }
    $scope.signinUser = signinUser;

    //////function if a user forgets their password
    function getPassword(){
      console.log('heyyy');
      // $scope.getPasswordModal = true;
      //////new version of what this does
      if($scope.pwHide === false){
        $('.signinPassword').hide();
        $('.forgotPassword').css({
          marginTop: 65+'px'
        });
        $timeout(function(){
          console.log('yoooooo');
          $('.forgotPassword').text('Recalled your password?')
        }, 20);
        $('.forgotPassword').animate({
          marginTop: 10+'px'
        }, 200);
      }
      else if($scope.pwHide){
        $('.forgotPassword').animate({
          marginTop: 65+'px'
        }, 200);
        $(".forgotPassword").text('Forgot Password?');
        setTimeout(function(){
          $('.signinPassword').show();
          $('.forgotPassword').css({
            marginTop: 10+'px'
          });
        }, 210);
      }
      $scope.pwHide = !$scope.pwHide;
    }
    $scope.getPassword = getPassword;
    // $('.forgotPassword').on('click', getPassword);

    /////////functions to go to the signup and signin modals
    function toSignin(){
      $timeout(function(){
        $scope.introModal       = false;
        $scope.signinModalVar   = true;
      }, 200);
    }
    $scope.toSignin = toSignin;

    ////function to go to signup page
    function toSignup(){
      $interval.cancel(swipeInterval);
      $timeout(function(){
        $scope.signinModalVar   = false;
        $scope.introModal       = false;
        $scope.signupModalVar   = true;
      }, 200);
    }
    $scope.toSignup = toSignup;


    function retrievePW(email){
      console.log('getting pw');
      var email = $('.signupEmail').val().toLowerCase();
      $http({
        method: "POST"
        ,url: "https://moneyshotapi.herokuapp.com/api/newpw/request"
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
      $timeout(function(){
        $scope.getPasswordModal = false;
      })
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
      $timeout(function(){
        $scope.signinModalVar   = true;
        $scope.introModal = true;
      }, 160);
    }
    $scope.backToSliderFunc = backToSliderFunc;

    function highlightSignup(e){
      console.log(e);
      var pw = $('.signupPassword').val();
      var repw = $('.signupConfirmPassword').val();
      var pwLength = $('.signupPassword').val().length;
      var rePwLength = $('.signupConfirmPassword').val().length;
      if($scope.signupModalVar){
        console.log('signup');
        console.log(pw);
        console.log(repw);
        if(pwLength > 5 &&  pw == repw){
          console.log('larger');
          $('.mophoSignin').css({
            color: '#3375dd'
          });
        }
        else if(pwLength <= 5 || pw !== repw){
          $('.mophoSignin').css({
            color: 'gray'
          });
        }
      }
    }
    $scope.highlightSignup = highlightSignup;

    function highlightSignin(e){
      console.log(e);
      var pw = $('.signinPassword').val();
      var pwLength = pw.length;
      console.log(pwLength);
      if(pwLength > 5){
        $('.mophoSignin').css({
          color: '#3375dd'
        });
      }
      else if(pwLength <= 5){
        $('.mophoSignin').css({
          color: 'gray'
        });
      }
    }
    $scope.highlightSignin = highlightSignin;

    //////////animations
    ////animate click
    function signinClick(){
      $('.introSigninButton').css({
        opacity: 1
        ,color: 'white'
      });
      $('.introSigninButton').animate({
        opacity: 0.7
        ,color: 'black'
      }, 200);
    }
    $scope.signinClick = signinClick;

    ////clicking signup button
    function signupClick(){
      $('.introSignupButton').css({
        opacity: 1
        ,color: 'red'
      });
      $('.introSignupButton').animate({
        opacity: 0.7
        ,color: 'white'
      }, 200);
    }
    $scope.signupClick = signupClick;

    ////clicking back button
    function pwXClick(){
      $('.backToSlider').css({
        color: 'black'
      });
      $('.backToSlider').animate({
        color: 'white'
      }, 200);
    }
    $scope.pwXClick = pwXClick;



  }
