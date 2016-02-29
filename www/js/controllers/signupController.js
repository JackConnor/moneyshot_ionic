angular.module('signupController', [])

  .controller('signupCtrl', signupCtrl);

  signupCtrl.$inject = ['$scope', 'signup', 'signin', 'newToken']

  function signupCtrl($scope, signup, signin, newToken){
    console.log('in the signin controller');
    ///////////////global variables//////
    $scope.signupModalVar = false;
    $scope.signinModalVar = true;
    $scope.signupModalTabs = true;

    checkToken();///this is a hoisted function to check the token and show the signin modal if a token is not found

    function signoutUser(){
      window.sessionStorage.webToken = "";
      window.location.hash = "#/";
    }
    $scope.signoutUser = signoutUser;

    // function to signup users who are new to the site
    function signupUser(){
      var email = $('.signupEmail').val();
      var password = $('.signupPassword').val();
      var repassword = $('.signupConfirmPassword').val();
      if(password == repassword){
        signup(email, password)
        .then(function(newUser){
          console.log(newUser);
          newToken(signedInUser.data._id)
          .then(function(ourToken){
            var token = ourToken.data;
            console.log(token);
            window.sessionStorage.webToken = token;
            $scope.signupModalTabs = false;
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
      var email = $('.signupEmail').val();
      var password = $('.signupPassword').val();
      signin(email, password)
      .then(function(signedInUser){
        $scope.signupModalTabs = false;
        newToken(signedInUser.data._id)
        .then(function(ourToken){
          var token = ourToken.data;
          window.sessionStorage.webToken = token;
          ///////final callback, which opens up the camera
          removeSignupModal();
        })
      })
    }
    $scope.signinUser = signinUser;

    function signoutUser(){
      console.log('yoyoy');
      window.sessionStorage.webToken = "";
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
      var maybeToken = window.sessionStorage.webToken;
      if(maybeToken && maybeToken.length > 2){
        $scope.signupModalVar = false;
        $scope.signinModalVar = false;
        $scope.signupModalTabs = false;
        console.log('signed in already');
        // takePicture();
      }
      else {
        console.log('no token');
        $scope.signinModalVar = true;
        $scope.signupModalTabs = true;
        window.location.hash = "#/";
      }
    }
  }
