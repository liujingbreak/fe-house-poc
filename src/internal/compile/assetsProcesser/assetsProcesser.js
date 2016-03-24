var gulp = require('gulp');
var through = require('through2');
var Path = require('path');
var fs = require('fs');
var es = require('event-stream');
var log;
var buildUtils = require('@dr/environment').buildUtils;

var packageUtils, config;

module.exports = {
	compile: compile
};

function compile(api) {
	log = require('log4js').getLogger(api.packageName);
	var argv = api.argv;
	packageUtils = api.packageUtils;
	config = api.config;
	if (config().devMode && (!argv.p || argv.p && argv.p !== 'assets')) {
		log.info('DevMode enabled, skip copying assets to static folder');
		return;
	}
	return copyAssets();
}

function copyAssets() {
	var src = [];
	var streams = [];
	packageUtils.findBrowserPackageByType(['*'], function(name, entryPath, parsedName, json, packagePath) {
		var baseDir;
		if (json.dr.assetsDir) {
			baseDir = Path.join(packagePath, json.dr.assetsDir);
		} else {
			baseDir = Path.join(packagePath, 'assets');
		}
		if (fs.existsSync(baseDir)) {
			src.push(Path.join(packagePath, 'assets', '**', '*'));
			var stream = gulp.src(src, {base: baseDir})
			.pipe(through.obj(function(file, enc, next) {
				var pathInPk = Path.relative(baseDir, file.path);
				file.path = Path.join(baseDir, parsedName.name, pathInPk);
				log.debug(file.path);
				//file.path = file.path
				next(null, file);
			}));
			streams.push(stream);
		}
	});
	if (streams.length === 0) {
		return null;
	}
	return es.merge(streams)
	.pipe(gulp.dest(Path.join(config().staticDir, 'assets')))
	.on('end', function() {
		log.debug('flush');
		buildUtils.writeTimestamp('assets');
	});
}
