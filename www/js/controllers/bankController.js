angular.module('bankController', [])

  .controller('bankCtrl', bankCtrl);

  bankCtrl.$inject = ["$scope", "decodeToken", "$http", "signin", '$stateParams'];

  function bankCtrl($scope, decodeToken, $http, signin, $stateParams){
    // setTimeout(function(){
    //   history.back();
    // }, 3000);
    console.log($stateParams);
    console.log('location coming soooooon');
    console.log(window.localStorage);
    ////global variables
    $scope.bankStart = true;
    $scope.bankPassword = false;
    $scope.bankAccountVar = false;
    $scope.editVar = false;


    ///functino to get Stripe ID
    function getStripe(){
      $http({
        method: "GET"
        ,url: 'https://moneyshotapi.herokuapp.com/api/bankroute'
      })
      .then(function(stripeStuff){
        console.log(stripeStuff.data);
        $scope.stripeStuff = stripeStuff.data;
      })
    }
    getStripe();

    var userToken = window.localStorage.webToken;
    decodeToken(userToken)
    .then(function(userInfo){
      $http({
        method: "POST"
        ,url: "https://moneyshotapi.herokuapp.com/api/userinfo"
        ,data: {userId: userInfo.data.userId}
      })
      .then(function(userData){
        $scope.userInfo = userData.data;
        console.log($scope.userInfo);
      })
    })

    function provePassword(){
      $scope.bankStart = false;
      $scope.bankPassword = true;
    }
    $scope.provePassword = provePassword;


    /////function to check passwords
    function verifyPassword(){
      var stripeId = '';
      console.log($scope.userInfo);
      var pass1 = $('.bankPass1').val();
      var pass2 = $('.bankPass2').val();
      console.log(pass1);
      console.log(pass2);
      // window.open('https://moneyshotapi.herokuapp.com/');
      if(pass1 === pass2){
        console.log('first challenge');
        console.log($scope.userInfo.email + " email");
        signin($scope.userInfo.email, pass2)
        .then(function(userData){
          console.log(userData);
          if(userData.data == "incorrect password"){
            alert('Sorry, password incorrect, please try again');
            $('.bankPass1').val("");
            $('.bankPass2').val("");
          }
          else {
            console.log('password valid');
            $scope.bankPassword = false;
            $scope.bankAccountVar = true;
            console.log('linking');
            window.location.hash = "#/tab/account"
            cordova.InAppBrowser.open("https://connect.stripe.com/oauth/authorize?response_type=code&client_id="+$scope.stripeStuff+"&scope=read_write&state="+$scope.userInfo._id, "_system");
            console.log('linking');
            // window.location.reload();
          }
        })
      }
      else {
        alert('Sorry, but your passwords do not match. Please try gain');
        $('.bankPass1').val("");
        $('.bankPass2').val("");
      }
    }
    $scope.verifyPassword = verifyPassword;

    //////back button out of banking
    function bankBack(){
      console.log('something is working');
      window.location.hash = "#/tab/account"
    }
    $scope.bankBack = bankBack;

    /////function to open the edit modal
    function openEdit(){
      $scope.editVar = true;
    }
    $scope.openEdit = openEdit;

    function closeEdit(){
      $scope.editVar = false;
    }
    $scope.closeEdit = closeEdit;

    function openPassword(){
      console.log('working');
      $scope.editVar = false;
      $scope.bankStart = false;
      $scope.bankPassword = true;
    }
    $scope.openPassword = openPassword;

    function deleteBank(){
      $http({
        method: "POST"
        ,url: "https://moneyshotapi.herokuapp.com/api/delete/bank"
        ,data: {userId: $scope.userInfo._id}
      })
      .then(function(updatedUser){
        console.log(updatedUser);
        $scope.editVar = false;
        $scope.userInfo = updatedUser.data;
      })
    }
    $scope.deleteBank = deleteBank;
  ////////////end bank controller//////
  }
