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

    describe('CanvasPresenter', function(){

        it('should have 1 or more premises', function() {
            var scope = {},
                ctrl = new CanvasPresenter(scope);

            expect(scope.premises.length).toBeGreaterThan(0);
        });

        it('should have a title', function() {
            var scope = {},
                ctrl = new CanvasPresenter(scope);

            expect(scope.title.length).toBeGreaterThan(0);
        });

        it('should have legal positions', function() {
            var scope = {},
                ctrl = new CanvasPresenter(scope);

            scope.premises.forEach( function(premise){
                expect(premise.top).toBeGreaterThan(0);
                expect(premise.left).toBeGreaterThan(0);
            });
        });
    });
});