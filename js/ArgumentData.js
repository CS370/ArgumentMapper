/**
 * The interface between the Canvas Presenter and the database.
 *
 * Created by Tyler Young on 12 April 2013.
 */

function ArgumentData() {
    this._premises = new Premises();

    /**
     * Loads argument data. Currently a mock for database interactions.
     * @returns {int: {id: number, title: string, top: int, left: int, . . .}, . . .}
     *          An object with keys representing premise IDs,
     *          and values representing the data associated with the premises.
     */
    this.getPremiseList = function() {
        return this._premises;
    };

    /**
     * @returns string The title of the argument
     */
    this.getTitle = function() {
        return "Was the moon landing stage?";
    };
}


/**
 * Creates a new premise in the scope's list of premises.
 * @param isRebuttal boolean (Optional) If true, we'll mark this as a rebuttal
 * @usage $scope.premises.addPremise();
 */
ArgumentData.prototype.addPremise = function(isRebuttal){
    if(typeof(isRebuttal)==='undefined') isRebuttal = false;

    console.log("Creating premise with id " + this.getNewID());
    this._premises[this.getNewID()] = {
        "id": this.getNewID(),
        "title": "",
        "content": "You just added this premise!",
        "top": 300,
        "left": 500,
        "connectedFrom": {},
        "connectsTo": {},
        'additionalClasses': ( isRebuttal ? ' rebuttal' : '' )
    };
};

/**
 * Removes a premise from the list of premises.
 * @param premiseID The ID of the premise to be removed.
 */
ArgumentData.prototype.removePremise = function(premiseID){
    // Note: "this" is the list of premises
    delete this._premises[premiseID];
};

/**
 * Array-like functionality.
 * @param functionToRun The function to be run on all premise elements
 */
ArgumentData.prototype.forEachPremise = function(functionToRun) {
    console.log("In foreach");
    for( var key in this._premises ) {
        functionToRun(this._premises[key]);
    }
};

ArgumentData.prototype.getNewID = function () {
    var maxKnown = 0;
    for( var key in this._premises ) {
        if( key > maxKnown ) {
            maxKnown = key;
        }
    }

    return ++maxKnown;
};


/**
 * A class representing the set of premises in an argument
 */
function Premises() {
    // Data elements
    this[1234] = {
        "id": 1234,
        "title": "Everyone knows Roswell was a coverup",
        "content": "Lorem ipsum.",
        "top": 100,
        "left": 15,
        "connectsTo": { 8675309: 'bottom', },
        "connectedFrom": {},
        'additionalClasses': ''
    };
    this[8675309] = {
        "id": 8675309,
        "title": "The shadows are borked.",
        "content": "This description may be useless.",
        "top": 330,
        "left": 200,
        "connectsTo": {},
        "connectedFrom": {1234: 'left', },
        'additionalClasses': ''
    };
}
