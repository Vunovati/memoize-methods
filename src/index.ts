function isFunction(prop: unknown): prop is Function {
    return typeof prop === 'function'
}

/**
 * Initializes the Map of objects with memoized methods and returns the
 * memoizeMethods function.
 * @param onMemoGet - called when an already memoized value gets retrieved
 * @param onMemoSet - called when a value is memoized for the first time
 *
 * @returns memoizeMethods - Decorates the provided object by memoizing
 * its methods' return values
 */
export function createMemoizeMethods({
    onMemoGet,
    onMemoSet,
}: {
    onMemoGet?: MemoHook
    onMemoSet?: MemoHook
} = {}) {
    const memoResultsMap = new WeakMap<object, MemoizedMethodResults>()

    return function memoizeMethods<T extends object>(target: T): T {
        return new Proxy(target, {
            get(target: T, property: string) {
                const interceptedProperty = (target as {
                    [key: string]: unknown
                })[property]

                if (!isFunction(interceptedProperty)) {
                    return interceptedProperty
                }

                return function(...args: unknown[]) {
                    const memoizedResultsForTarget = memoResultsMap.get(target)

                    if (
                        memoizedResultsForTarget &&
                        memoizedResultsForTarget[property] &&
                        memoizedResultsForTarget[property][JSON.stringify(args)]
                    ) {
                        onMemoGet?.(target, property, args)

                        return memoizedResultsForTarget[property][
                            JSON.stringify(args)
                        ]
                    }

                    const result = interceptedProperty.apply(target, args)

                    onMemoSet?.(target, property, args)

                    memoResultsMap.set(target, {
                        ...(memoizedResultsForTarget || {}),
                        [property]: {
                            ...(memoizedResultsForTarget?.[property] || {}),
                            [JSON.stringify(args)]: result,
                        },
                    })

                    return result
                }
            },
        })
    }
}

export type MemoHook = (
    target: object,
    methodName: string,
    methodArgs: unknown[]
) => void

interface MemoizedMethodResults {
    [property: string]: {
        [args: string]: unknown
    }
}
