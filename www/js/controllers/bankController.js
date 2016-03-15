angular.module('bankController', [])

  .controller('bankCtrl', bankCtrl);

  bankCtrl.$inject = ["$scope", "decodeToken", "$http", "signin"];

  function bankCtrl($scope, decodeToken, $http, signin){
    console.log(window.location.href);

    ////global variables
    $scope.bankStart = true;
    $scope.bankPassword = false;
    $scope.bankAccountVar = false;

    var userToken = window.localStorage.webToken;
    decodeToken(userToken)
    .then(function(userInfo){
      $http({
        method: "POST"
        ,url: "http://192.168.0.3:5555/api/userinfo"
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
      console.log($scope.userInfo);
      var pass1 = $('.bankPass1').val();
      var pass2 = $('.bankPass2').val();
      console.log(pass1);
      console.log(pass2);
      // window.open('https://moneyshotapi.herokuapp.com/');
      if(pass1 === pass2){
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
            window.open("https://connect.stripe.com/oauth/authorize?response_type=code&client_id=ca_85XIIrajUKuhChdWZQFJ9zu1lmuzul3F&scope=read_write", "_blank")
            console.log('linking');
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
  ////////////end bank controller//////
  }
