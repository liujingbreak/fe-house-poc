var gulp = require('gulp');
var Path = require('path');
var gutil = require('gulp-util');
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var bump = require('gulp-bump');
var changed = require('gulp-changed');
// var watchify = require('watchify');
var browserify = require('browserify');
var es = require('event-stream');
var vp = require('vinyl-paths');
var del = require('del');
var jscs = require('gulp-jscs');
var vps = require('vinyl-paths');
var Q = require('q');
Q.longStackSupport = true;
var _ = require('lodash');

var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var size = require('gulp-size');
var cli = require('shelljs-nodecli');
var pBundle = require('partition-bundle');
var shasum = require('shasum');
var rename = require('gulp-rename');
var Jasmine = require('jasmine');

var findPackageJson = require('./lib/gulp/findPackageJson');
var rwPackageJson = require('./lib/gulp/rwPackageJson');
var depScanner = require('./lib/gulp/dependencyScanner');
var packageUtils = require('./lib/packageMgr/packageUtils');
var rev = require('gulp-rev');

var config = require('./lib/config');


gulp.task('default', function() {
	// place code for your default task here
});

gulp.task('clean:dependency', function() {
	var dirs = [];
	_.each(config().packageScopes, function(packageScope) {
		var npmFolder = Path.resolve('node_modules', '@', packageScope);
		var bowerFolder = Path.resolve('node_modules', '@', packageScope);
		gutil.log('delete ' + npmFolder);
		gutil.log('delete ' + bowerFolder);
		dirs.push(npmFolder);
		dirs.push(bowerFolder);
	});
	return del(dirs);
});

gulp.task('clean:dist', function() {
	return del('dist');
});

gulp.task('lint', function() {
	gulp.src(['*.js',
			'lib/**/*.js'
		]).pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'))
		.pipe(jshint.reporter('fail'))
		.pipe(jscs())
		.pipe(jscs.reporter())
		.pipe(jscs.reporter('fail'));
});

/**
 * link src/ ** /package.json from node_modules folder
 */
gulp.task('link', function() {
	gulp.src('src')
		.pipe(findPackageJson())
		.on('error', gutil.log)
		.pipe(rwPackageJson.linkPkJson('node_modules'))
		.on('error', gutil.log)
		.pipe(gulp.dest('node_modules'))
		.on('error', gutil.log)
		.pipe(rwPackageJson.addDependeny('package.json'));
});

/**
 * Need refactor
 * TODO: partition-bundle, deAMDify, Parcelify
 */
gulp.task('browserify', function() {
	var browserifyTask = [];
	var moduleNames = [];
	packageUtils.findBrowserEntryFiles('package.json', function(moduleName) {
		moduleNames.push(moduleName);
	});



	packageUtils.findBrowserEntryFiles('package.json', function(moduleName, entryPath, parsedName) {
		gutil.log('entry: ' + parsedName.name);
		var def = Q.defer();
		browserifyTask.push(def.promise);
		var b = browserify({
			debug: true
		});
		b.add(entryPath);
		externalModules(b, moduleName);
		b.require(entryPath, {expose: moduleName});
		b.bundle()
		.pipe(source(parsedName.name + '.js'))
		.pipe(buffer())
		.pipe(gulp.dest('./dist/js/'))
		.pipe(rename(parsedName.name + '.min.js'))
		.pipe(rev())
		.pipe(sourcemaps.init({
			loadMaps: true
		}))
		// Add transformation tasks to the pipeline here.
		.pipe(uglify())
		.on('error', gutil.log)
		.pipe(sourcemaps.write('./'))
		.pipe(size())
		.pipe(gulp.dest('./dist/js/'))
		.pipe(rev.manifest({merge: true}))
		.pipe(gulp.dest('./dist/js/'))
		.on('end', function() {
			def.resolve();
		});
	});

	function externalModules(b, currentModule) {
		moduleNames.forEach(function(moduleName) {
			if (moduleName !== currentModule) {
				b.exclude(moduleName);
			}
		});
	}

	return Q.allSettled(browserifyTask);
});

/**
 * TODO: bump dependencies version
 */
gulp.task('bump-version', function() {
	return es.merge(
		gulp.src('src')
		.pipe(findPackageJson())
		.pipe(vp(function(path) {
			return new Promise(function(resolve, reject) {
				gulp.src(path).pipe(bumpVersion())
					.on('error', gutil.log)
					.pipe(gulp.dest(Path.dirname(path)))
					.on('end', resolve);
			});
		})),
		gulp.src('./package.json')
		.pipe(bumpVersion())
		.on('error', gutil.log)
		.pipe(gulp.dest('.'))
	);
});

gulp.task('test-house', function() {
	var jasmine = new Jasmine();
	jasmine.loadConfigFile('spec/support/jasmine.json');
	jasmine.execute();
});

gulp.task('publish', function() {
	return gulp.src('src')
		.pipe(findPackageJson())
		.on('error', gutil.log)
		.pipe(vps(function(paths) {
			gutil.log(paths);
			//packages.push(Path.dirname(paths));
			cli.exec('npm', 'publish', Path.dirname(paths));
			return Promise.resolve();
		})).on('end', function() {
			cli.exec('npm', 'publish', '.');
		});
});

function bumpVersion() {
	return bump({
		type: 'patch'
	});
}
