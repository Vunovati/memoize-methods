function isFunction(prop: unknown): prop is Function {
    return typeof prop === 'function'
}

function isString(prop: unknown): prop is string {
    return typeof prop === 'string'
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
        return new Proxy<T>(target, {
            get(target: T, property: PropertyKey & keyof T) {
                const interceptedProperty = target[property]

                if (!isFunction(interceptedProperty) || !isString(property)) {
                    return interceptedProperty
                }

                return function(...args: unknown[]) {
                    const resultsForTarget = memoResultsMap.get(target)

                    if (
                        resultsForTarget?.[property]?.[JSON.stringify(args)] !==
                        undefined
                    ) {
                        onMemoGet?.(target, property, args)

                        return resultsForTarget[property][JSON.stringify(args)]
                    }

                    const result = interceptedProperty.apply(target, args)

                    onMemoSet?.(target, property, args)

                    memoResultsMap.set(target, {
                        ...(resultsForTarget || {}),
                        [property]: {
                            ...(resultsForTarget?.[property] || {}),
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
