// @codekit-prepend "modules/smartquotes.js"
// @codekit-prepend "modules/headroom.js"
// @codekit-append "modules/requestAnimationFrame-shim.js"

// Main Functions

var scratchApp = (function($) {

	var resizeVideosLoop;

    function addEndMark() {
        // appends a tombstone to the article
        var postContent = $('.post-content', true);

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

	//  Smooth Scrolling
	function smoothScroll(targetEl, duration, callback) {

	    function findPosition(el) {
	        var offsetTop = 0;
	        do {
	            if (!isNaN(el.offsetTop)) {
	                offsetTop += el.offsetTop;
	            }
	            el = el.offsetParent;
	        } while(el);
	        return offsetTop;
	    }

		// duration is total animation time
		var endPosition = findPosition(targetEl),
			startPosition = window.pageYOffset,
			elapsedTime = 0,
			distance = endPosition - startPosition,
			interval = 16,   // approximately 60fps
			currentPosition,
			percent,         // percent of the way through animation
			scrollInterval;

		duration = duration || 500;

		function applyEasing(time) {
			// this is just a default quadratic ('easeinoutquad') bezier
			return time < 0.5 ? 2 * time * time : -1 + (4 - 2 * time) * time;
		}

		// where the magic happens
		function loopPageScroll() {
			elapsedTime += interval;
			percent = elapsedTime / duration;
			percent = percent > 1 ? 1 : percent;
			currentPosition = startPosition + (distance * applyEasing(percent));

			window.scrollTo(0, Math.floor(currentPosition));
			// check if it should stop
			stopPageScroll(currentPosition, endPosition, scrollInterval);
		}

		// remove the interval timer if endPosition/bottom of document is reached
		function stopPageScroll(position, endPosition, scrollInterval) {
			if (percent === 1 || ((window.innerHeight + currentPosition) >= document.height)) {
				clearInterval(scrollInterval);
				if (callback) {
					callback();
				}
			}
		}

		// set an interval timer for scrolling
		function startPageScroll() {
			scrollInterval = setInterval(loopPageScroll, interval);
		}

		startPageScroll();
	}

	function setSmoothScroll(e) {
        e.preventDefault();
        var targetId = e.target.href.split('#')[1], // gets hash value w/o the leading "#"
            targetEl = document.getElementById(targetId);
        // if target exists, animate it
        if (targetEl) {
            smoothScroll(targetEl, 800);
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

	return {
		init: init
	};

}((function() {
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
}())));


scratchApp.init();