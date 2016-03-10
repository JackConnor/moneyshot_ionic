angular.module('signupController', [])

  .controller('signupCtrl', signupCtrl);

  signupCtrl.$inject = ['$scope', '$state', 'signup', 'signin', 'newToken']

  function signupCtrl($scope, $state, signup, signin, newToken){
    ///////////////global variables//////
    $scope.signupModalVar  = false;
    $scope.signinModalVar  = true;
    $scope.signupModalTabs = true;
    $scope.introModal      = false;
    $scope.introCounter    = 0;

    console.log('yoyoyo');
    console.log(window.localStorage.webToken);


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
        // $scope.introModal = false;
        // $scope.introCounter = 0;
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
  }
