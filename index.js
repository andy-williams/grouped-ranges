// constraints
// 1. all: next > previous
// 2. last: = 100
// 3. start: > 0
// 4. two items must always have a value 

// behaviour: 
// - cannot change from null to a value - use `enableIndexValue`
// - 

function disableIndex(rangeEnds, indexToDisable) {
    if (indexToDisable > rangeEnds.length - 1 || indexToDisable < 0) throw 'What are you doing man?'

    const activeRangeEnds =  rangeEnds
        .filter(x => x != null)
        .map((x, i) => ({ val: x, idx: i }))
    const result = [...rangeEnds]
    const lastActiveEndRange = activeRangeEnds[activeRangeEnds.length - 1]
    const lastActiveIndex = lastActiveEndRange.idx

    // breaks constraint 4
    if (activeRangeEnds.length <= 2) return false

    // -- end is an edgecase
    if (lastActiveIndex == indexToDisable) {
        result[indexToDisable] = null
        result[activeRangeEnds[activeRangeEnds.length - 2].idx] = 100 // enforce constraint 2
        return result
    }

    result[indexToDisable] = null
    return result
}

function changeIndexValue(rangeEnds, indexToChange, newValue) {
    if (indexToChange > rangeEnds.length - 1 || indexToChange < 0) throw 'What are you doing man?'

    const activeRangeEnds =  rangeEnds
        .filter(x => x != null)
        .map((x, i) => ({ val: x, idx: i }))
    const indexToChangeInActiveRange = activeRangeEnds.findIndex(x => x.idx == indexToChange)

    const result = [...rangeEnds]
    const currentValue = rangeEnds[indexToChange]
    const isLastIndex = indexToChange == rangeEnds.length - 1

    // optimistic heuristic
    if (currentValue === newValue) return result 

    // absolutely not allowed
    if (newValue === null) throw new 'cannot be null'
    if (currentValue === null) throw 'This isn\'t the place to enable indices'

    if (newValue == 0) return false // breaks constraints 1 and 3 regardless
    if (newValue > 100) return false // breaks constraint 3

    // incrementing value
    if(newValue > currentValue) {
        if (isLastIndex) return false // breaks constraint 3
        if (newValue >= activeRangeEnds[indexToChangeInActiveRange + 1].val) return false  // -- breaks constraint 1
    }

    // decrementing value
    if(newValue < currentValue) {
        if (isLastIndex) return false // breaks constraint 3
        if (indexToChangeInActiveRange == 0 && activeRangeEnds[indexToChangeInActiveRange + 1].val)
        if (newValue >= activeRangeEnds[indexToChangeInActiveRange + 1].val) return false  // -- breaks constraint 1
        if (indexToChange == 0) {
            result[indexToChange] = newValue;
            return result
        }
    }

    result[indexToChange] = newValue;
    return result
}

// constraint:

// behaviour:
// 1. enabling a new item on the right most always sets the previous active most right value to 100

function enableIndex(rangeEnds, indexToEnable) {
    if (indexToEnable > rangeEnds.length - 1 || indexToEnable < 0) throw 'What are you doing man?'
    if (!isValid(rangeEnds)) throw 'Hey, this is\'t valid yo' // can probably ommit this if we can guarantee validity

    let result = [...rangeEnds]
    const activeRangeEnds =  rangeEnds
        .map((x, i) => ({ val: x, idx: i }))
        .filter(x => x.val != null || x.idx == indexToEnable)
    const lastActiveIndex = activeRangeEnds[activeRangeEnds.length - 1].idx
    const firstActiveIndex = activeRangeEnds[0].idx
    const indexToChangeInActiveRange = activeRangeEnds.findIndex(x => x.idx == indexToEnable)

    // why are you enabling an already enabled value?
    if (rangeEnds[indexToEnable] !== null)  return false

    if (indexToEnable >= lastActiveIndex) {
        result[indexToEnable] = 100
        maybeDecrementFromExclusive(result, indexToEnable, 5)
        return result
    }

    if (indexToEnable <= firstActiveIndex) {
        const firstActiveValue = rangeEnds[firstActiveIndex]
        let newVal = firstActiveValue - 5
        newVal = newVal < 1 ? 1 : newVal
        result[indexToEnable] = newVal
        maybeIncrementFromExclusive(result, indexToEnable)
        return result
    }

    const firstActiveValue = rangeEnds[firstActiveIndex]
    const prevActiveValue = activeRangeEnds[firstActiveIndex - 1]
    result[indexToEnable] = activeRangeEnds[indexToChangeInActiveRange + 1].val - 5
    return result
}

function maybeDecrementFromExclusive(rangeEnds, originatingIndex, firstMinDiff) {
    const activeRangeEnds =  rangeEnds
        .map((x, i) => ({ val: x, idx: i }))
        .filter(x => x.val != null)
    const activeRangeOriginatingIndex = activeRangeEnds.findIndex(x => x.idx == originatingIndex)
    const startingIndex = activeRangeOriginatingIndex - 1

    for (let i = startingIndex; i > 0; i--) {
        const currentValue = activeRangeEnds[i].val
        const rightAdjacentValue = activeRangeEnds[i+1].val
        const absDiff = Math.abs(currentValue - rightAdjacentValue)

        // edgecase for our special behaviour
        if(i == startingIndex && absDiff < firstMinDiff) {
            const newVal = rightAdjacentValue - firstMinDiff
            activeRangeEnds[i].val = newVal
            rangeEnds[activeRangeEnds[i].idx] = newVal
            continue;
        }

        if (currentValue < rightAdjacentValue) return
        if (currentValue >= rightAdjacentValue) {
            activeRangeEnds[i].val = rightAdjacentValue - 1
            rangeEnds[activeRangeEnds[i].idx] = rightAdjacentValue - 1
        }
    }
}

function maybeIncrementFromExclusive(rangeEnds, fromIndex) {
    const activeRangeEnds =  rangeEnds
        .map((x, i) => ({ val: x, idx: i }))
        .filter(x => x.val != null)

    for (let i =  0; i < activeRangeEnds.length - 2; i++) {
        if (activeRangeEnds[i+1].val > activeRangeEnds[i].val) return
        if (activeRangeEnds[i+1].val <= activeRangeEnds[i].val) {
            const newVal = activeRangeEnds[i].val + 1
            activeRangeEnds[i+1].val = newVal
            rangeEnds[activeRangeEnds[i+1].idx] = newVal
        }
    }
}

function isValid(rangeEnds) {
    const nonNullRange = rangeEnds.filter(x => x != null)
    let invalidValues = []

    if(nonNullRange.length < 2)
        return false

    if(nonNullRange[0] <= 0)
        return false

    if(nonNullRange[nonNullRange.length - 1] != 100)
        return false

    nonNullRange.reduce((prev, curr, i) => {
        if(curr <= prev)
            invalidValues.push(i)
        return curr
    })

    return invalidValues.length === 0
}

module.exports = {}
module.exports.disableIndex = disableIndex
module.exports.changeIndexValue = changeIndexValue
module.exports.enableIndex = enableIndex