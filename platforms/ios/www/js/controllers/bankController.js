(function() {
  angular.module('bankController', [])

  .controller('bankCtrl', bankCtrl);

  bankCtrl.$inject = ["$scope", "decodeToken", "$http", "signin", "$state", '$stateParams', '$cordovaInAppBrowser'];

  function bankCtrl($scope, decodeToken, $http, signin, $state, $stateParams, $cordovaInAppBrowser){
    console.log( 'PAGE', $stateParams )
    var token =  localStorage.webToken

    // If no token make them signin
    if (!token) {
      $state.go('signin')
    }
    // 4
    // Check state params for response from stripe
    if ( $stateParams.stripe_data ) {
      $http({
        method: 'POST',
        url: 'https://moneyshotapi.herokuapp.com/api/bank/addStripe',
        data: {
          token: token,
          stripe: $stateParams.stripe_data
        }
      }).then(function(response){
        console.log("BACK from addStripe", response )
        alert( 'Success!' )
        // window.open( response.data )
        $state.go('tab.account')
      })
    }
    console.log('BANKING')
    ////global variables
    $scope.bankStart = true;
    $scope.bankPassword = false;
    $scope.bankAccountVar = false;
    $scope.editVar = false;
    $scope.confirmed = false;

    function provePassword(){
      $scope.bankStart = false;
      $scope.bankPassword = true;
    }
    $scope.provePassword = provePassword;

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


    /////BANK STUFF/////////
    // 3
    function goStripe() {
      console.log('CLick')
      // window.open('https://connect.stripe.com/oauth/authorize?response_type=code&client_id=ca_85XIIrajUKuhChdWZQFJ9zu1lmuzul3F&scope=read_write');
      $cordovaInAppBrowser.open('https://connect.stripe.com/oauth/authorize?response_type=code&client_id=ca_85XIIrajUKuhChdWZQFJ9zu1lmuzul3F&scope=read_write', '_blank', {clearcache: 'yes', toolbar: 'yes', closebuttoncaption: 'Done?'})
    }
    $scope.goStripe = goStripe

    // 1
    function verifyPassword(password, rePass) {
      if ( password === rePass ) {
        genToken(password)
      } else {
        alert('Password dont match')
      }
    }
    $scope.verifyPassword = verifyPassword

    // 2
    function genToken(password){
      decodeToken(token).then( function(token) {
        console.log('STUFF', token)
        // Get one of our jwts
        return $http({
            method: 'POST',
            url: 'https://moneyshotapi.herokuapp.com/api/bank/genToken',
            data: {
              // TODO resolve issue with token from different server! so no need for email either store email on client side
              userId   : token.data.userId,
              password: password
            }
          })
        })
        .then( function(response) {
          console.log('RES', response)
          localStorage.webToken = response.data.token
          if ( response.data.token ) {
              $scope.bankPassword = false;
              $scope.confirmed = true;
          } else {
            alert('Uh oh wrong password')
          }
        })
      .catch( function(err) {
        console.log( 'Error', err)
      })
    }

  }
})()
