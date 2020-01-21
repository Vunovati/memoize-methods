# memoize-methods

Memoize methods of a given JavaScript object

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

## usage

Initialize the memoization store. The store will keep the memoized objects
for as long as the originals are not garbage collected (it uses a WeakMap).

```
const memoizeMethods = createMemoizeMethods()
```

```
const memoizedUserRepository = memoizeMethods(slowUserDbRepository)
```

the first call will be as slow as if we'd called the original user repo

```
const user = await memoizedUserRepository.getUser(userId) // slow
```

the second call will return the promise from the previous call which prevents
the unnecessary repeated async call (e.g. towards a slow db)

```
const userFast = await memoizedUserRepository.getUser(userId) // fast
```
