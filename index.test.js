const { 
    enableIndex, 
    disableIndex,  
    changeIndexValue 
} = require('./index')

// constraints
// 1. two items must always have a value 
describe('disableIndex', () => {
    test('does not allow less than two items to be inactive', () => {
        expect(disableIndex([1, null, 100], 2)).toBe(false)
        expect(disableIndex([1, 100], 1)).toBe(false)
    })

    test('disables last active index, and sets new last active index to 100', () => {
        expect(disableIndex([1, 50, 100], 2)).toStrictEqual([1, 100, null])
        expect(disableIndex([1, 99, 100], 2)).toStrictEqual([1, 100, null])
    })

    test('disables item in middle', () => {
        expect(disableIndex([1, 50, 100], 1)).toStrictEqual([1, null, 100])
        expect(disableIndex([1, 99, 100], 1)).toStrictEqual([1, null, 100])
        expect(disableIndex([1, 30, 31, 100], 2)).toStrictEqual([1, 30, null, 100])
    })

    test('disables first item', () => {
        expect(disableIndex([1, 50, 100], 0)).toStrictEqual([null, 50, 100])
        expect(disableIndex([1, 99, 100], 0)).toStrictEqual([null, 99, 100])
        expect(disableIndex([1, 30, 31, 100], 0)).toStrictEqual([null, 30, 31, 100])
    })
})

// constraints
// 1. all: next > previous
// 2. last: = 100
// 3. start: > 0
describe('changeIndexValue', () => {
    test('does not allow item to be set to null', () => {
        expect(() => changeIndexValue([1, 5, 100], 1, null)).toThrow()
        expect(() => changeIndexValue([1, 5, 100], 2, null)).toThrow()
    })

    test('does not allow a disabled item to be changed', () => {
        expect(() => changeIndexValue([1, null, 100], 1, 5)).toThrow()
        expect(() => changeIndexValue([1, 5, null, 100], 2, 7)).toThrow()
    })

    test('returns same if value remains the same', () => {
        expect(changeIndexValue([1, 5, 100], 1, 5)).toStrictEqual([1, 5, 100])
    })

    describe('incrementing', () => {
        test('does not allow value to go above 100', () => {
            expect(changeIndexValue([1, 55, 56, 100], 3, 101)).toBe(false)
            expect(changeIndexValue([1, 55, 56, 100], 2, 105)).toBe(false)
        })

        test('does not allow the change if increment breaks constraint 1', () => {
            expect(changeIndexValue([1, 55, 56, 100], 1, 56)).toBe(false)
            expect(changeIndexValue([1, 55, 56, 100], 1, 57)).toBe(false)
            expect(changeIndexValue([54, 55, 56, 100], 0, 55)).toBe(false)
        })

        test('increments the value', () => {
            expect(changeIndexValue([1, 55, 57, 100], 1, 56)).toStrictEqual([1, 56, 57, 100])
            expect(changeIndexValue([1, 55, 57, 100], 0, 54)).toStrictEqual([54, 55, 57, 100])
        })
    })

    describe('decrementing', () => {
        test('does not allow first active index to break constraint 3', () => {
            expect(changeIndexValue([null, 1, 57, 100], 1, 0)).toBe(false)
            expect(changeIndexValue([1, 2, null, 100], 0, 0)).toBe(false)
        })

        test('does not allow the change if increment breaks constraint 1', () => {
            expect(changeIndexValue([1, 55, 57, 100], 2, 55)).toBe(false)
        })

        test('decrements value', () => {
            expect(changeIndexValue([1, 55, 56, 100], 1, 54)).toStrictEqual([1, 54, 56, 100])
            expect(changeIndexValue([6, 55, 56, 100], 0, 4)).toStrictEqual([4, 55, 56, 100])
        })
    })
})


describe('enableIndex', () => {
    test('does not allow enabling an index that\'s already enabled', () => {
        expect(enableIndex([1, 5, 100], 1)).toBe(false)
        expect(enableIndex([1, 5, 100], 0)).toBe(false)
        expect(enableIndex([1, 5, 100], 2)).toBe(false)
    })

    describe('enabling a new first item', () => {
        test('increments adjacent items to the right by 1', () => {
            expect(enableIndex([null, 1, 100], 0)).toStrictEqual([1, 2, 100])
            expect(enableIndex([null, 1, 2, 3, 100], 0)).toStrictEqual([1, 2, 3, 4, 100])
            expect(enableIndex([null, 1, 2, 4, 100], 0)).toStrictEqual([1, 2, 3, 4, 100])
        })

        test('sets value to (right adjacent value)-5', () => {
            expect(enableIndex([null, 20, 100], 0)).toStrictEqual([15, 20, 100])
            expect(enableIndex([null, 25, 28, 29, 100], 0)).toStrictEqual([20, 25, 28, 29, 100])
        })
    })

    describe('enabling a new last item', () => {
        expect(enableIndex([1, 100, null], 2)).toStrictEqual([1, 95, 100])
        expect(enableIndex([1, 98, 99, 100, null], 4)).toStrictEqual([1, 93, 94, 95, 100])
    })

    describe('enabling middle item', () => {
        test('sets value to (right adjacent value)-5', () => {
            expect(enableIndex([15, 20, null, 100], 2)).toStrictEqual([15, 20, 95, 100])
        })
    })

    
})