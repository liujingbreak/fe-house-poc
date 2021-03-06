Updates
=======
### 2016-4-14
1. `gulp test` 命令
	```
	gulp test [-p <package name>] [-f <spec file>] [--spec <spec name filter>]
	```

	[如何测试](/doc-home/index.html#/doc/test.md)
2. **translate-generator** 工具
	```
	gulp compile --translate [-p <package-name>]
	```
	扫描`.js`, `.html` 文件，自动生成可翻译的文件
	```
		<package-dir>/i18n/
			├─ index.js
			├─ messages-en.yaml
			├─ messages-zh.yaml
			└─ ... other locale files in form of messages-{locale}.yaml
	```
	详细扫描的规则 [i18n文档](/doc-home/index.html#/doc/i18n.md)

### 2016-4-6
- 更新了 [i18n文档](/doc-home/index.html#/doc/i18n.md)
- i18n support
	新的browser side API
	| Name | description
	| -- | --
	| .loadLocaleBundles(language, callback) | LABjs loads locale bundles to current page
	| .loadPrefLocaleBundles(callback) | LABjs loads locale bundles based on browser prefered language, language choosing logic is in the order of: `navigator.languages[0], navigator.language, navigator.browserLanguage, navigator.systemLanguage, navigator.userLanguage, navigator.languages[1] ...`
	| .getPrefLanguage() | __api.loadPrefLocaleBundles() 调用此方法
	| `.isLocaleBundleLoaded()` | return true 如果locale bundle已经加载，可以安全调用的require('xxx/i18n')了
	| `.extend(obj)` | 扩展 API prototype `__api.__proto__`,  `__api.constructor.prototype`
- 很简单的i18n example！查看\
	[github.com/dr-web-house/web-fun-house/tree/master/src/examples/example-i18n](https://github.com/dr-web-house/web-fun-house/tree/master/src/examples/example-i18n)

- 支持AngularJS i18n

- 增加了Browserify **yamlify** transform

	```javascript
	var constants = require('./constants.yaml');
	```
- Express server 增加了gzip middleware
- 支持了browser JS require() 文件名特殊标记`{locale}`
	```
	require('./xxx-{locale}xxx');
	```
	```
	gulp compile --locale en
	```

### 2016-3-31
- Static Assets URL

	所有被browser javascript `require()`的 `.html`文件， 包括entryPage, entryView文件 会在gulp compile时自动替换 `assets:///<file-path>` 或者 `assets://<package-name>/<file-path>` 的引用。
	这样就可以直接在html中添加 `<img src="assets:///photo.jpg">` 而不需要通过angularJS之类的web framework来处理正确的URL了。

### 2016-3-30
- Static Assets URL

	引用当前package内的assets文件路径，可以省略package name,
	比如， 原来是 `assets://@dr/doc-home/images/bg.jpg`, 可以省略为
	`assets:///images/bg.jpg`
	> 注意: 省略package name时，`assets:///` 的路径是有三个slash`/`开始

	修改了文档[Introduction](http://dr-web-house.github.io/#/doc/readme-cn.md)


### 2016-3-29
- 更新文档 [Daily Work: 安装平台 & 开发组建](/#/doc/run-platform-as-tool-cn.md)
- 新命令
```
./node_modules/.bin/web-fun-house update
```
用于`npm install web-fun-house`升级完平台版本后，`update`不会复制example代码, 检查gulp版本和其他依赖.

### 2016-3-28

-	Package.json 支持 `dr.entryPage` 和 `dr.entryView` 值可以是引用其他package内的文件，以更好支持对其他package资源的reuse.`npm://<package-name>/<path>`

-	`gulp compile` 出错会beep

-	publish package时， 当package.json version 符合beta, alpha 或者 x.x.x-xx prerelease的格式， Sinopia NPM server 不会发邮件

-	`gulp bump` 支持 -v <major|minor|patch|prerelease>可选参数

### 2016-3-25

-	每个package支持多个Entry页面，\\ package.json内的 "`dr`"."`entryView`" 或"`dr`"."`entryPage`"可以是array类型

-	更新Introduction文档\\ 增加静态资源的描述

	#### Static Assets URL

	静态资源文件放入`packageRootDir/assets` 目录, 用`assets://<package-name>` 引用

	```less
	.some-selector {
	    background-image: url(assests://@dr/my-package/background.jpg);
	}
	.some-equivalent {
	    background-image: url("assests://@dr/my-package/background.jpg");
	    background-image: url('assests://@dr/my-package/background.jpg');
	}
	```
