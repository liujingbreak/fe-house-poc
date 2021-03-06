var _ = require('lodash');
var angular = window.angular;

module.exports = {
	register: function(compileProvider) {
		this.splitText(compileProvider);
		this.splitTextShow(compileProvider);
	},

	splitText: function(compileProvider) {
		compileProvider.directive('drSplitText', function() {
			return {
				scope: {
					onSplitDone: '&'
				},
				compile: function(tElement, tAttrs, transclude) {
					return splitTextLink;
				}
			};
		});
	},

	splitTextShow: function(compileProvider) {
		compileProvider.directive('drSplitTextShow', function() {
			return {
				scope: {
					onSplitDone: '&',
					onShow: '&',
					drSplitTextShow: '=', // if `true` anim starts
					timeline: '=',
					onComplete: '&',
					timelinePos: '@',
					duration: '@'
				},
				link: function(scope, iElement, iAttrs, controller) {
					var timeline;
					//iElement.addClass('dr-text-anim-hide');
					splitTextLink(scope, iElement, iAttrs, controller);
					if (scope.timeline) {
						timeline = scope.timeline;
					} else {
						timeline = new TimelineLite({paused: true});
					}
					timeline.staggerFromTo(iElement[0].children, parseFloat(scope.duration),
						{rotation: 30, yPercent: 90, visibility: 'visible', autoAlpha: 0},
						{rotation: 0, autoAlpha: 1, yPercent: 0, ease: 'Back.easeOut',
							onComplete: function() {
								iElement.children().css('opacity', '');
								scope.drSplitTextShow = false;
								scope.$apply();
								if (scope.onComplete) {
									scope.onComplete();
								}
							}
						},
						0.06,
						scope.timelinePos ? scope.timelinePos : '+=0'
					);

					if (iAttrs.drSplitTextShow) {
						scope.$watch('drSplitTextShow', function(newVal) {
							if (newVal) {
								timeline.restart();
							}
						});
					}
				}
			};
		});
	}
};

function splitTextLink(scope, iElement, iAttrs, controller) {
	iElement.addClass('dr-text-anim');
	var children = [];
	_.each([].slice.call(iElement[0].childNodes), function(node) {
		if (node.nodeName === '#text') {
			_.each(_.trim(node.textContent).split(''), function(chr) {
				var span = angular.element('<span>');
				span.html(chr === ' ' ? '&nbsp;' : chr).addClass('t');
				children.push(span);
			});
		} else {
			children.push(angular.element(node).addClass('t'));
		}
	});
	iElement.html('');
	_.each(children, function(span) {
		iElement.append(span);
	});
	if (scope.onSplitDone) {
		scope.onSplitDone();
	}
}
