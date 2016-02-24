angular.module('accountController', [])

  .controller('accountCtrl', acctCtrl);

  acctCtrl.$inject = ['$http', 'signup'];

  function acctCtrl($http, signup){
    var self = this;
    console.log('yoooooo');
    console.log(signup);
    signup('test@test.com', 'testing')
    .then(function(newUser){
      console.log(newUser);
    })

  }
