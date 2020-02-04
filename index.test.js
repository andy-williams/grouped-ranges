const {
    GroupedRanges
} = require('./index')

// constraints
// 1. two items must always have a value 
describe('GroupedRanges', () => {
    let groupedRanges

    function setup(initValue) {
        groupedRanges = new GroupedRanges(initValue)
    }

    describe('disableIndex', () => {    
        test('does not allow less than two items to be inactive #1', () => {
            setup([1, null, 100])
            expect(groupedRanges.disableIndex(1)).toBe(false)
        })
    
        test('does not allow less than two items to be inactive #2', () => {
            setup([1, 100])
            expect(groupedRanges.disableIndex(1)).toBe(false)
        })
    
        test('disables last item #1', () => {
            setup([1, 50, 100])
            expect(groupedRanges.disableIndex(2)).toStrictEqual([1, 100, null])
        })
    
        test('disables last item #2', () => {
            setup([1, 99, 100])
            expect(groupedRanges.disableIndex(2)).toStrictEqual([1, 100, null])
        })
    
        test('disables last item #3', () => {
            setup([1, 50, null, 100])
            expect(groupedRanges.disableIndex(3)).toStrictEqual([1, 100, null, null])
        })
    
        test('disables item in middle #1', () => {
            setup([1, 5, 100])
            expect(groupedRanges.disableIndex(1)).toStrictEqual([1, null, 100])
        })
    
        test('disables item in middle #2', () => {
            setup([1, 5, 30, null, 100])
            expect(groupedRanges.disableIndex(2)).toStrictEqual([1, 5, null, null, 100])
        })
    
        test('disables first item #1', () => {
            setup([1, 50, 100])
            expect(groupedRanges.disableIndex(0)).toStrictEqual([null, 50, 100])
        })
    
        test('disables first item #2', () => {
            setup([1, null, 50, 100])
            expect(groupedRanges.disableIndex(0)).toStrictEqual([null, null, 50, 100])
        })
    })

    describe('changeValue', () => {
        test('returns same if value remains the same', () => {
            setup([1, 5, 100])
            expect(groupedRanges.changeValue(1, 5)).toStrictEqual([1, 5, 100])
        })

        test('does not allow a value to go above 100 #1', () => {
            setup([1, 55, 56, 100])
            expect(groupedRanges.changeValue(3, 101)).toBe(false)
        })

        test('does not allow a value to go above 100 #2', () => {
            setup([1, 55, 56, 100])
            expect(groupedRanges.changeValue(2, 105)).toBe(false)
        })

        test('does not allow the change if increment breaks constraint 1', () => {
            setup([1, 55, 56, 100])
            expect(groupedRanges.changeValue(1, 56)).toBe(false)
        })

        test('increments the value #1', () => {
            setup([1, 55, 57, 100])
            expect(groupedRanges.changeValue(1, 56)).toStrictEqual([1, 56, 57, 100])
        })

        test('increments the value #2', () => {
            setup([1, 55, null, 57, 100])
            expect(groupedRanges.changeValue(1, 56)).toStrictEqual([1, 56, null, 57, 100])
        })

        test('does not allow the change if increment breaks constraint 1 #1', () => {
            setup([1, 56, null, 57, 100])
            expect(groupedRanges.changeValue(1, 57)).toBe(false)
        })

        test('does not allow the change if increment breaks constraint 1 #2', () => {
            setup([1, 56, 57, 100])
            expect(groupedRanges.changeValue(1, 57)).toBe(false)
        })

        test('decrements the value #1', () => {
            setup([1, 55, 57, 100])
            expect(groupedRanges.changeValue(2, 56)).toStrictEqual([1, 55, 56, 100])
        })

        test('decrements the value #2', () => {
            setup([1, 55, null, 57, 100])
            expect(groupedRanges.changeValue(3, 56)).toStrictEqual([1, 55, null, 56, 100])
        })
    })

    describe('enableIndex', () => {
        test('enables new active end and decrements adjacent nodes #1', () => {
            setup([1, 100, null])
            expect(groupedRanges.enableIndex(2)).toStrictEqual([1, 95, 100])
        })

        test('enables new active end and decrements adjacent nodes #2', () => {
            setup([1, 98, 99, 100, null])
            expect(groupedRanges.enableIndex(4)).toStrictEqual([1, 93, 94, 95, 100])
        })

        test('enables new active end and decrements adjacent nodes #3', () => {
            setup([1, 98, null, 99, 100, null])
            expect(groupedRanges.enableIndex(5)).toStrictEqual([1, 93, null, 94, 95, 100])
        })

        test('enables new active start #1', () => {
            setup([null, 6, 100])
            expect(groupedRanges.enableIndex(0)).toStrictEqual([1, 6, 100])
        })

        test('enables new active start and increments adjacent nodes #1', () => {
            setup([null, 1, 100])
            expect(groupedRanges.enableIndex(0)).toStrictEqual([1, 6, 100])
        })
    })
})