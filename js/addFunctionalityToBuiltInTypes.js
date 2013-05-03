/**
 * A  much nicer way to remove from the built-in array
 * @param from {number} The first element to remove.
 *                      If the "to" parameter is blank, this is the only
 *                      element that will be removed.
 * @param to {number} The last element to remove.
 */
Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};