import { expect } from 'chai'
import { createMemoizeMethods } from '../src'

describe('createMemoizeMethods', () => {
    describe('memoizeMethods', () => {
        describe('original method increases the returned value', () => {
            const initialValue = 1
            const testCachable = {
                getNextValue() {
                    return this.testValue++
                },
                testValue: initialValue,
            }

            const memoizeMethods = createMemoizeMethods({
                onMemoSet: (
                    target: object,
                    methodName: string | number,
                    methodArgs: unknown[]
                ) => {
                    console.log(
                        `Setting value ${
                            target.constructor.name
                        }.${methodName}, args ${JSON.stringify(methodArgs)}`
                    )
                },
                onMemoGet: (
                    target: object,
                    methodName: string | number,
                    methodArgs: unknown[]
                ) => {
                    console.log(
                        `Reading value ${
                            target.constructor.name
                        }.${methodName}, args ${JSON.stringify(methodArgs)}`
                    )
                },
            })

            const memoizedTestObject = memoizeMethods(testCachable)

            it('returns the same value each time', () => {
                expect(memoizedTestObject.getNextValue()).to.eq(initialValue)
                expect(memoizedTestObject.getNextValue()).to.eq(initialValue)
                expect(memoizedTestObject.getNextValue()).to.eq(initialValue)
            })

            it('original object returns increased values', () => {
                expect(testCachable.getNextValue()).to.eq(2)
                expect(testCachable.getNextValue()).to.eq(3)
                expect(testCachable.getNextValue()).to.eq(4)
            })
        })

        describe('multiple methods are memoized', () => {
            const initialValue = 1
            const testCachable = {
                getNextValue() {
                    return this.testValue++
                },
                repeatStringValueTimes(str: string) {
                    return str.repeat(this.testValue)
                },
                testValue: initialValue,
            }

            const memoizeMethods = createMemoizeMethods()
            const memoizedTestObject = memoizeMethods(testCachable)

            it('returns the same value each time', () => {
                expect(memoizedTestObject.getNextValue()).to.eq(initialValue)
                expect(memoizedTestObject.repeatStringValueTimes('a')).to.eq(
                    'aa'
                )
                expect(memoizedTestObject.getNextValue()).to.eq(initialValue)
                expect(memoizedTestObject.repeatStringValueTimes('a')).to.eq(
                    'aa'
                )
                expect(memoizedTestObject.getNextValue()).to.eq(initialValue)
                expect(memoizedTestObject.repeatStringValueTimes('a')).to.eq(
                    'aa'
                )
            })
        })

        describe('the same method is called with different params', () => {
            const initialValue = 1
            const testCachable = {
                getNextValueWithSuffix(suffix: string): string {
                    return this.testValue++ + suffix
                },
                testValue: initialValue,
            }

            const memoizeMethods = createMemoizeMethods()
            const memoizedTestObject = memoizeMethods(testCachable)

            it('returns the same value when called with same arguments', () => {
                expect(memoizedTestObject.getNextValueWithSuffix('ms')).to.eq(
                    initialValue + 'ms'
                )
                expect(memoizedTestObject.getNextValueWithSuffix('s')).to.eq(
                    initialValue + 1 + 's'
                )
                expect(memoizedTestObject.getNextValueWithSuffix('ms')).to.eq(
                    initialValue + 'ms'
                )
                expect(memoizedTestObject.getNextValueWithSuffix('s')).to.eq(
                    initialValue + 1 + 's'
                )
                expect(memoizedTestObject.getNextValueWithSuffix('ms')).to.eq(
                    initialValue + 'ms'
                )
                expect(memoizedTestObject.getNextValueWithSuffix('s')).to.eq(
                    initialValue + 1 + 's'
                )
            })
        })

        describe('original method returns a falsy value', () => {
            let retrievedFromCache = false
            let numberOfSaves = 0

            const memoizeMethods = createMemoizeMethods({
                onMemoGet: () => {
                    retrievedFromCache = true
                },
                onMemoSet: () => {
                    numberOfSaves++
                },
            })

            const testCachable = {
                getFalsyValue() {
                    return 0
                },
            }

            const memoizedTestObject = memoizeMethods(testCachable)

            it('saves the result only one and returns it on subsequent calls', async () => {
                await memoizedTestObject.getFalsyValue()
                expect(retrievedFromCache).to.eq(false)
                await memoizedTestObject.getFalsyValue()
                expect(numberOfSaves).to.eq(1)
                expect(retrievedFromCache).to.eq(true)
            })
        })

        describe('memoized method returns a promise', () => {
            const testAsyncValue = {
                foo: 'async',
            }

            const testPromise = new Promise(resolve => {
                setTimeout(() => resolve(testAsyncValue), 0)
            })

            const testCachable = {
                getAsyncValue() {
                    return testPromise
                },
            }

            const memoizeMethods = createMemoizeMethods()
            const memoizedTestObject = memoizeMethods(testCachable)

            it('returns the same async value as the original object each time', async () => {
                const asyncValueFromOriginalObject = await testCachable.getAsyncValue()
                expect(await memoizedTestObject.getAsyncValue()).to.eq(
                    asyncValueFromOriginalObject
                )
                expect(await memoizedTestObject.getAsyncValue()).to.eq(
                    asyncValueFromOriginalObject
                )
                expect(await memoizedTestObject.getAsyncValue()).to.eq(
                    asyncValueFromOriginalObject
                )
            })
        })
    })
})
