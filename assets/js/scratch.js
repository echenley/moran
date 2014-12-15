// @codekit-prepend "modules/smartquotes.js"
// @codekit-prepend "modules/headroom.js"
// @codekit-prepend "modules/smoothscroll.js"
// @codekit-append "modules/requestAnimationFrame-shim.js"

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

	var resizeVideosLoop;

    function addEndMark() {
        // appends a tombstone to the article
        var postContent = $('.post-content');
        if (postContent) {
            var lastElement = postContent.lastElementChild;
            if (lastElement.nodeName === 'P') {
                var text = document.createTextNode(' \u220E');
                lastElement.appendChild(text);
            }
        }
    }

    function resizeVideos(videos) {
        var oldWidth = videos[0].offsetWidth,
            newWidth = videos[0].parentNode.offsetWidth;

        if (oldWidth !== newWidth) {
            for (var i = 0; i < videos.length; i++) {
                var video = videos[i],
                    aspectRatio = video.dataset ? video.dataset.aspectRatio : video.getAttribute('data-aspect-ratio');
                video.style.width = newWidth + 'px';
                video.style.height = newWidth * aspectRatio + 'px';
            }
        }
    }

    function setResponsiveVideo() {
        // get all the videos
        var videos = document.querySelectorAll('iframe[src*="//www.youtube.com"], iframe[src*="//player.vimeo.com"]');

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
            // check if videos need resize
            resizeVideosLoop = window.setInterval(function() {
                resizeVideos(videos);
            }, 500);
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

		addEndMark();
		setCaptionWidth();
		setResponsiveVideo();

		// .main-nav behavior
		Headroom.options.tolerance = { up: 15, down: 0 };
		var headroom  = new Headroom($('.main-nav'));
		headroom.init();

		// smooth scrolling hashlinks
		var scrollDown = $('.scroll-down');
		if (scrollDown) {
			scrollDown.addEventListener('click', setSmoothScroll);
		}
	}

	init();

}());