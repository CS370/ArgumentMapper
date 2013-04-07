/**
 * Set up the UI elements that need to be driven by Javascript
 *
 * Uses the jQuery UI framework to make this effortless.
 *
 * Created by Tyler Young on 4 April 2013.
 */


/**
 * Handles the draggable property of the elements in the canvas.
 */
function makeElementsDraggable() {
// Uses the jQuery UI's Draggable interface
    // http://jqueryui.com/draggable/
    console.log("Setting up the premises to be draggable.");
    $(".premise").draggable({      // Mark everything with class "premise" as draggable
        start: function () {          // A dummy method called when a drag starts
            console.log("Drag started");
        },
        drag: function () {           // A dummy method called when a drag is in progress
            console.log("Drag in progress");
        },
        stop: function () {           // A dummy method called when a drag ends
            console.log("Drag ended");
        },
        containment: "#theCanvas",  // Contain this element in the canvas element
        scroll: false,               // Don't scroll the element we're contained in
        grid: [ 5, 5 ],               // Snap to a 5px square grid
        stack: "#theCanvas div",    // Allow divs to be stacked within the canvas
        distance: 20                 // Only move the div if it is dragged more than 20px (prevent accidents)
    });
}


function makeTextareaAutoResize() {
    $('textarea.premise-title').autoResize({ 'extraSpace': 0 });
    $("textarea.premise-title").trigger('change.dynSiz');
}

function main() {
    makeElementsDraggable();
    makeTextareaAutoResize();
}

$(document).ready(main); // When the document is loaded, run the "main" function
