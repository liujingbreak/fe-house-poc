var readme = require('@dr/readme');
module.exports = function(controllerProvider) {
	controllerProvider.controller('AsideController', ['$scope',
	'$location',
	function($scope, $location) {
		var asideVm = this;

		asideVm.menuItems = [
			{
				label: $translate('Home'),
				subMenu: [],
				action: function() {
					$location.path('/');
				}
			},
			{
				label: $translate('Documentation'),
				subMenu: readme.buildMenu(docName2Route)
			}
		];

		function docName2Route(name) {
			$location.path('doc/' + name);
		}
	}]);
};
