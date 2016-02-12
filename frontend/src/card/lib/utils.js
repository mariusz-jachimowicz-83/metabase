
import _ from "underscore";

/// return pair of [min, max] values from items in array DATA, using VALUEACCESSOR to retrieve values for each item
/// VALUEACCESSOR may be an accessor function like fn(ITEM) or can be a string/integer key/index into ITEM which will
/// use a function like fn(item) { return item(KEY); }
export function getMinMax(data, valueAccessor) {
    if (typeof valueAccessor === 'string' || typeof valueAccessor === 'number') {
        var key = valueAccessor;
        valueAccessor = function(d) {
            return d[key];
        };
    }

    var values = _.map(data, valueAccessor);
    return _.reduce(values, function(acc, val) {
        var min = acc[0],
            max = acc[1];
        return [
            min < val ? min : val,
            max > val ? max : val
        ];
    }, [values[0], values[0]]);
}

// computed size properties (drop 'px' and convert string -> Number)
function getComputedSizeProperty(prop, element) {
    var val = document.defaultView.getComputedStyle(element, null).getPropertyValue(prop);
    return val ? parseFloat(val.replace("px", "")) : null;
}

/// height available for rendering the card
export function getAvailableCanvasHeight(element) {
    var parent = element.parentElement,
        parentHeight = getComputedSizeProperty("height", parent),
        parentPaddingTop = getComputedSizeProperty("padding-top", parent),
        parentPaddingBottom = getComputedSizeProperty("padding-bottom", parent);

    // NOTE: if this magic number is not 3 we can get into infinite re-render loops
    return parentHeight - parentPaddingTop - parentPaddingBottom - 3; // why the magic number :/
}

/// width available for rendering the card
export function getAvailableCanvasWidth(element) {
    var parent = element.parentElement,
        parentWidth = getComputedSizeProperty("width", parent),
        parentPaddingLeft = getComputedSizeProperty("padding-left", parent),
        parentPaddingRight = getComputedSizeProperty("padding-right", parent);

    return parentWidth - parentPaddingLeft - parentPaddingRight;
}

export function computeSplit(extents) {
    // copy and sort the intervals by the lower bound
    let intervals = extents.map(e => e.slice()).sort((a,b) => a[0] - b[0]);

    // start with a zero width gap
    let gap = [0,0];

    // iterate over each interval
    let current = intervals[0];
    for (let i = 1; i < intervals.length; i++) {
        let next = intervals[i];
        // merge next interval with the current one if appropriate
        if (next[0] <= current[1]) {
            if (next[1] > current[1]) {
                current[1] = next[1];
            }
        // otheriwse update the gap if it's larger than the previously recorded gap
        } else {
            if (next[0] - current[1] > gap[1] - gap[0]) {
                gap = [current[1], next[0]];
            }
            current = next;
        }
    }

    let partitionIndexes;
    // if there is a gap, and it's larger than an order of magnitude, then split
    if (gap[1] - gap[0] !== 0 && (gap[1] / gap[0]) >= 10) {
        partitionIndexes = [[],[]];
        extents.forEach(([min, max], index) => {
            // if the end of an extent is less or equal to than the beginning of the gap
            // put it in the lower partition
            if (max <= gap[0]) {
                partitionIndexes[0].push(index);
            } else {
                partitionIndexes[1].push(index);
            }
        })
    // otherwise don't partition
    } else {
        partitionIndexes = [extents.map((e,i) => i)];
    }

    return partitionIndexes;
}
