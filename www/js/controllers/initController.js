(function(ang) {
	ang.module('initLoad', [])
	.controller( 'initCtrl', initCtrl )

	initCtrl.$inject = ['$state', '$http'];

	function initCtrl($state, $http) {
		var vm = this;
		vm.poop = 'this works'

		vm.signin = function() {
			console.log('CLick')
			$state.go( 'signin' )
		}

		vm.camera = function() {
			console.log('Clicky')
			$state.go( 'tab.camera' )
		}

		function checkToken(token) {
			$http({
				method: 'POST',
				url: 'https://moneyshotapi.herokuapp.com/api/bank/addStripe',
				data: {
					check : true,
					token : token
				}
			})
			.then(function(response){
				if (response.data.token) {
					vm.camera()
				} else {
					vm.signin()
				}
			})
		}

		function checkLocal() {
			var token = localStorage.webToken
				token ? checkToken(token) : vm.signin()
		}

		checkLocal()

	}
})(angular);
