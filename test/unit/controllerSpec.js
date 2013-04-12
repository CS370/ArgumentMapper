/**
 * The controller specification file, used for specifying unit tests.
 *
 * Uses the Jasmine framework for Javascript unit testing.
 *
 * To run the unit tests, open SpecRunner.html in your browser.
 *
 * Created by Tyler Young on 4 April 2013.
 */

describe('Canvas presenter', function() {

    beforeEach(inject(function ($injector) {
        $scope = $injector.get('$rootScope');
        $controller = $injector.get('$controller');
    }));

    it('should have 1 or more premises', function() {
        var params = {
            $scope: $scope
        };
        var ctrl = $controller('CanvasPresenter', params);

        expect($scope.premises.length).toBeGreaterThan(0);
    });

    it('should have a title', function() {
        var params = {
            $scope: $scope
        };
        var ctrl = $controller('CanvasPresenter', params);

        expect($scope.title.length).toBeGreaterThan(0);
    });

    it('should have legal positions', function() {
        var params = {
            $scope: $scope
        };
        var ctrl = $controller('CanvasPresenter', params);

        $scope.premises.add();

        $scope.premises.forEach( function(premise){
            expect(premise.top).toBeGreaterThan(0);
            expect(premise.left).toBeGreaterThan(0);
        });
    });

	it('should delete premises', function(){
        var params = {
            $scope: $scope
        };
        var ctrl = $controller('CanvasPresenter', params);

		var length = $scope.premises.length;
		$scope.premises.remove(1234);
		expect($scope.premises.length).toBeLessThan(length);
	});

    it('should allow adding premises', function() {
        var params = {
            $scope: $scope
        };
        var ctrl = $controller('CanvasPresenter', params);

        var oldSize = $scope.premises.length;
        $scope.premises.add();
        expect($scope.premises.length).toBeGreaterThan(oldSize);
    });
});