/**
 * The canvas presenter.
 *
 * Uses the Jasmine framework for Javascript unit testing.
 *
 * To run the unit tests, open SpecRunner.html in your browser.
 *
 * Created by Tyler Young on 4 April 2013.
 */

function CanvasPresenter($scope) {
    $scope.premises = [
        {"title": "Everyone knows Roswell was a coverup",
            "content": "Lorem ipsum.",
            "top": 100,
            "left": 15 },
        {"title": "The shadows are borked.",
            "content": "This description may be useless.",
            "top": 230,
            "left": 100 }
    ];
    $scope.title = "Was the moon landing faked?";
}


