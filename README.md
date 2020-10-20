# webpack5-final-loader-null

### Tested on:
* `node: v14.3.0`
* `npm: 6.14.5`

### Steps to reproduce:

* `npm install`
* change the `fullPath` variable in the `webpack.config.js`
* `npm run build`

It should throw something like:

```
ERROR in #web/bundles/sonatacore/vendor/select2/select2.css
Module build failed: Error: Final loader (unknown) didn't return a Buffer or String
    at processResult (/home/app/src/webpack5-final-loader-null/node_modules/webpack/lib/NormalModule.js:592:17)
    at /home/app/src/webpack5-final-loader-null/node_modules/webpack/lib/NormalModule.js:669:5
    at /home/app/src/webpack5-final-loader-null/node_modules/loader-runner/lib/LoaderRunner.js:404:3
    at iterateNormalLoaders (/home/app/src/webpack5-final-loader-null/node_modules/loader-runner/lib/LoaderRunner.js:233:10)
    at processResource (/home/app/src/webpack5-final-loader-null/node_modules/loader-runner/lib/LoaderRunner.js:227:3)
    at iteratePitchingLoaders (/home/app/src/webpack5-final-loader-null/node_modules/loader-runner/lib/LoaderRunner.js:171:10)
    at runLoaders (/home/app/src/webpack5-final-loader-null/node_modules/loader-runner/lib/LoaderRunner.js:395:2)
    at NormalModule.doBuild (/home/app/src/webpack5-final-loader-null/node_modules/webpack/lib/NormalModule.js:624:3)
    at NormalModule.build (/home/app/src/webpack5-final-loader-null/node_modules/webpack/lib/NormalModule.js:768:15)
    at /home/app/src/webpack5-final-loader-null/node_modules/webpack/lib/Compilation.js:1083:12
    at NormalModule.needBuild (/home/app/src/webpack5-final-loader-null/node_modules/webpack/lib/NormalModule.js:969:32)
    at Compilation._buildModule (/home/app/src/webpack5-final-loader-null/node_modules/webpack/lib/Compilation.js:1066:10)
    at /home/app/src/webpack5-final-loader-null/node_modules/webpack/lib/util/AsyncQueue.js:235:10
    at Hook.eval [as callAsync] (eval at create (/home/app/src/webpack5-final-loader-null/node_modules/tapable/lib/HookCodeFactory.js:33:10), <anonymous>:6:1)
    at AsyncQueue._startProcessing (/home/app/src/webpack5-final-loader-null/node_modules/webpack/lib/util/AsyncQueue.js:228:26)
    at AsyncQueue._ensureProcessing (/home/app/src/webpack5-final-loader-null/node_modules/webpack/lib/util/AsyncQueue.js:218:9)
    at processImmediate (internal/timers.js:456:21)
 @ ./src/style.js 1:219-278
 @ ./src/index.js 1:0-16
```
