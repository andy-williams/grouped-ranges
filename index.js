// constraints
// 1. all: next > previous
// 2. last: = 100
// 3. start: > 0
// 4. two items must always have a value 
function GroupedRanges(rangeEnds) {
    let _rangeEnds = [...rangeEnds]

    function getActiveRangeEnds() {
        return _rangeEnds
            .map((x, i) => ({ val: x, idx: i }))
            .filter(x => x.val != null)
    }

    function assertIndexInRange(indexToChange) {
        if (indexToChange > _rangeEnds.length - 1 || indexToChange < 0) throw 'What are you doing man?'
    }

    this.disableIndex = function disableIndex(indexToDisable) {
        assertIndexInRange(indexToDisable)

        const activeRangeEnds = getActiveRangeEnds()
        const lastActiveEndRange = activeRangeEnds[activeRangeEnds.length - 1]
        const lastActiveIndex = lastActiveEndRange.idx

        // breaks constraint 4
        if (activeRangeEnds.length <= 2) return false

        // -- end is an edgecase
        if (lastActiveIndex === indexToDisable) {
            const secondToLastActiveIndex = activeRangeEnds[activeRangeEnds.length - 2].idx
            _rangeEnds[indexToDisable] = null
            _rangeEnds[secondToLastActiveIndex] = 100 // enforce constraint 2
            return [..._rangeEnds]
        }

        _rangeEnds[indexToDisable] = null
        return [..._rangeEnds]
    }

    this.changeValue = function changeValue(indexToChange, newValue) {
        assertIndexInRange(indexToChange)

        const activeRangeEnds = getActiveRangeEnds()
        const indexToChangeInActiveRange = activeRangeEnds.findIndex(x => x.idx == indexToChange)

        const currentValue = rangeEnds[indexToChange]
        const isLastIndex = indexToChange == rangeEnds.length - 1

        // optimistic heuristic
        if (currentValue === newValue) return [...rangeEnds] 

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
            if (newValue >= activeRangeEnds[indexToChangeInActiveRange + 1].val) return false  // -- breaks constraint 1
            if (indexToChange == 0) {
                rangeEnds[indexToChange] = newValue;
                return [...rangeEnds]
            }
        }

        rangeEnds[indexToChange] = newValue;
        return [...rangeEnds]
    }

    this.enableIndex = function enableIndex(indexToEnable) {
        assertIndexInRange()

        const activeRangeEnds = getActiveRangeEnds()
        const lastActiveIndex = activeRangeEnds[activeRangeEnds.length - 1].idx
        const firstActiveIndex = activeRangeEnds[0].idx
        const indexToChangeInActiveRange = activeRangeEnds.findIndex(x => x.idx == indexToEnable)

        // why are you enabling an already enabled value?
        if (_rangeEnds[indexToEnable] !== null)  return false

        // new last active node
        if (indexToEnable >= lastActiveIndex) {
            _rangeEnds[indexToEnable] = 100
            maybeDecrementFromExclusive(indexToEnable, 5)
            return [..._rangeEnds]
        }

        // new first active node
        if (indexToEnable < firstActiveIndex) {
            const firstActiveValue = _rangeEnds[firstActiveIndex]
            let newVal = firstActiveValue - 5
            newVal = newVal < 1 ? 1 : newVal
            _rangeEnds[indexToEnable] = newVal
            maybeIncrementFromExclusive(indexToEnable, 5)
            return [..._rangeEnds]
        }

        const firstActiveValue = rangeEnds[firstActiveIndex]
        const prevActiveValue = activeRangeEnds[firstActiveIndex - 1]
        result[indexToEnable] = activeRangeEnds[indexToChangeInActiveRange + 1].val - 5
        return [..._rangeEnds]
    }

    this.getValue = function getValue() {
        return [..._rangeEnds]
    }

    function maybeDecrementFromExclusive(originatingIndex, firstMinDiff) {
        const activeRangeEnds =  getActiveRangeEnds()

        const activeRangeOriginatingIndex = activeRangeEnds.findIndex(x => x.idx == originatingIndex)
        const startingIndex = activeRangeOriginatingIndex - 1
    
        for (let i = startingIndex; i > 0; i--) {
            const currentValue = activeRangeEnds[i].val
            const rightAdjacentValue = activeRangeEnds[i+1].val
            const absDiff = Math.abs(currentValue - rightAdjacentValue)
    
            // edgecase for our special behaviour
            if (i == startingIndex && absDiff < firstMinDiff) {
                const newVal = rightAdjacentValue - firstMinDiff
                activeRangeEnds[i].val = newVal
                _rangeEnds[activeRangeEnds[i].idx] = newVal
                continue;
            }
    
            if (currentValue < rightAdjacentValue) return
            else {
                activeRangeEnds[i].val = rightAdjacentValue - 1
                _rangeEnds[activeRangeEnds[i].idx] = rightAdjacentValue - 1
            }
        }
    }
    
    function maybeIncrementFromExclusive(originatingIndex, firstMinDiff) {
        const activeRangeEnds =  getActiveRangeEnds()
    
        const activeRangeOriginatingIndex = activeRangeEnds.findIndex(x => x.idx == originatingIndex)
        const startingIndex = activeRangeOriginatingIndex + 1
    
        for (let i = startingIndex; i < activeRangeEnds.length; i++) {
            const currentValue = activeRangeEnds[i].val
            const leftAdjacentValue = activeRangeEnds[i-1].val
            const absDiff = Math.abs(currentValue - leftAdjacentValue)
    
            // edgecase for our special behaviour
            if (i == startingIndex && absDiff < firstMinDiff) {
                const newVal = leftAdjacentValue + firstMinDiff
                activeRangeEnds[i].val = newVal
                _rangeEnds[activeRangeEnds[i].idx] = newVal
                continue;
            }
            
            if (currentValue > leftAdjacentValue) return
            else {
                const newVal = leftAdjacentValue + 1
                activeRangeEnds[i].val = newVal
                _rangeEnds[activeRangeEnds[i].idx] = newVal
            }
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
module.exports.GroupedRanges = GroupedRanges
module.exports.GroupedRanges.isValid = isValid