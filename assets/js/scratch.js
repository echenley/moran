// @codekit-prepend "modules/smartquotes.js"
// @codekit-prepend "modules/smoothscroll.js"
// @codekit-prepend "modules/requestAnimationFrame-shim.js"
// @codekit-prepend "../node_modules/underscore/underscore.min.js"
/* jshint ignore:end */

(function() {
    'use strict';

    var $ = (function() {
        // simple dom retrieval function
        // maps to $, limited to querySelector
        var cache = {};
        return function(s) {
            var cachedEl = cache[s];
            if (!cachedEl) {
                cachedEl = document.querySelector(s);
                cache[s] = cachedEl;
            }
            return cachedEl;
        };
    })();

    function setResponsiveVideo() {
        // get all the videos
        var videos = document.querySelectorAll('iframe[src*="//www.youtube.com"], iframe[src*="//player.vimeo.com"]');

        var resizeVideos =  _.debounce(function() {
            var newWidth = videos[0].parentNode.offsetWidth;
            for (var i = 0; i < videos.length; i++) {
                var video = videos[i],
                    aspectRatio = video.dataset ? video.dataset.aspectRatio : video.getAttribute('data-aspect-ratio');
                video.style.width = newWidth + 'px';
                video.style.height = newWidth * aspectRatio + 'px';
            }
        }, 300);

        // strip iframes of their height/width attributes
        if (videos.length) {
            for (var i = 0; i < videos.length; i++) {
                var video = videos[i],
                    aspectRatio = video.height / video.width;

                // store aspect ratio using dataset with fallback
                // there are shims for this, but this is all I really need it for
                if (video.dataset) {
                    video.dataset.aspectRatio = aspectRatio;
                } else {
                    video.setAttribute('data-aspect-ratio', aspectRatio);
                }

                video.removeAttribute('height');
                video.removeAttribute('width');
                video.style.height = video.offsetWidth * aspectRatio + 'px';
            }

            window.addEventListener("resize", resizeVideos);
        }
    }



    function findPosition(el) {
        var offsetTop = 0;
        do {
            if (!isNaN(el.offsetTop)) {
                offsetTop += el.offsetTop;
            }
            el = el.offsetParent;
        } while (el);
        return offsetTop;
    }

	function setSmoothScroll(e) {
        e.preventDefault();
        // get hash value w/o the leading "#"
        var targetId = e.target.href.split('#')[1], 
            targetEl = document.getElementById(targetId);
        // if target exists, animate it
        if (targetEl) {
            smoothScroll(findPosition(targetEl), 800);
        }
	}

    function setCaptionWidth() {
        var captions = document.getElementsByClassName('caption');

        function update(j) {
            var caption = captions[j];
            // set onload handler for image within caption div
            caption.getElementsByTagName('img')[0].onload = function() {
                caption.style.width = caption.getElementsByTagName('img')[0].offsetWidth + 'px';
            };
        }

        if (captions.length) {
            for (var i = 0; i < captions.length; i++) {
                update(i);
            }
        }
    }

	function init() {

		setCaptionWidth();
		setResponsiveVideo();

		// smooth scrolling hashlinks
		var scrollDown = $('.scroll-down');
		if (scrollDown) {
			scrollDown.addEventListener('click', setSmoothScroll);
		}
	}

	init();

}());