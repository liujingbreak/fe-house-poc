module.exports = {
	/**
	 * This method is called by @dr/template-builder
	 * @param  {[type]} api              [description]
	 * @param  {[type]} relativeFilePath [description]
	 * @return swigOptions the returned value 'swigOptions' is passed to swig.render(templateContent, swigOptions)
	 */
	onCompileTemplate: function(relativeFilePath) {
		console.log(relativeFilePath);
		return {
			locals: locals[relativeFilePath]
		};
	}
};

var locals = {
	'index.html': {
		message: 'This page file is compiled by @dr/template-builder during compilation time'
	},

	'browser-render.html': {
		message: 'This page file is compiled by @dr/template-builder during compilation time'
	}
};
