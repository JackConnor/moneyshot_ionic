(function(ang) {
	ang.module('initLoad', [])
	.controller( 'initCtrl', initCtrl )

	initCtrl.$inject = ['$state', '$http'];

	function initCtrl($state, $http) {
		// alert('here');
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
				url: 'http://192.168.0.13:5555/api/bank/addStripe',
				data: {
					check : true,
					token : token
				}
			})
			.then(function(response){
				console.log(response)
				if (response.data.token) {
					vm.camera()
				} else {
					vm.signin()
				}
			})
			// vm.signin();
		}

		function checkLocal() {
			var token = localStorage.webToken
			console.log(token);
				token ? checkToken(token) : vm.signin()
		}

		checkLocal()

	}
})(angular);
