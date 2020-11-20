
(function (scope) {
    scope.ScrollBar = function (config, callback, targetNode) {
        targetNode = targetNode || window;

        var thumbHeight = config.thumbHeight || 100;
        var width = config.width || 20;
        var offset = config.offset || 5;
        var visible = config.hasOwnProperty('visible') ? config.visible : true;

        // Create HTML div tags
        var scrollDiv = document.createElement('div');
        var trackDiv = document.createElement('div');

        scrollDiv.classList.add('custom-scrollbar');
        trackDiv.classList.add('custom-scrollbar-track');
        scrollDiv.style.position = 'relative';
        trackDiv.style.position = 'absolute';
        scrollDiv.style.left = (targetNode.offsetWidth - width) + 'px';
        scrollDiv.appendChild(trackDiv);

        var thumbDiv = document.createElement('div');
        thumbDiv.classList.add('custom-scrollbar-thumb');
        thumbDiv.style.position = 'absolute';
        thumbDiv.style.left = '0px';
        thumbDiv.style.top = '0px';
        scrollDiv.appendChild(thumbDiv);
        targetNode.appendChild(scrollDiv);

        this.offset = offset; // 5px margin up and below
        this.height = targetNode.offsetHeight;
        this.width = width;

        // Considering it takes 50 wheels to move down
        this.deltaMove = (this.height - thumbHeight - this.offset) / 50;
        this.scrollDiv = scrollDiv;
        this.trackDiv = trackDiv;
        this.thumbDiv = thumbDiv;
        this.targetNode = targetNode;

        // Congigure Track
        this.trackDiv.style.height = this.height + 'px';
        this.trackDiv.style.width = width + 'px';

        // Configure Thumb
        this.setThumbHeight(thumbHeight);
        var sideMargins = 2; // 2 px from left and right
        this.thumbDiv.style.width = width - (2 * sideMargins) + 'px';
        this.thumbDiv.style.marginTop = this.offset + 'px';
        this.thumbDiv.style.marginLeft = sideMargins + 'px';

        // Set visibility
        this.setVisiblility(visible);

        // Configure events - On scrollbar thumb
        this.thumbDiv.addEventListener('mousedown',
            this.handleMouseDownEvt.bind(this));
        this.thumbDiv.addEventListener('mouseup',
            this.handleMouseUpEvt.bind(this));

        // Configure events - On scrollbar main node
        this.scrollDiv.addEventListener('mousewheel',
            this.handleMouseWheelEvt.bind(this));

        // Configure events - On track node
        this.trackDiv.addEventListener('click',
            this.handleMouseClickEvt.bind(this));

        // Configure events - On target node
        this.scrollDiv.addEventListener('mousewheel',
            this.handleMouseWheelEvt.bind(this));
        this.targetNode.addEventListener('mouseup',
            this.handleMouseUpEvt.bind(this));

        // Configure events - On document body
        document.body.addEventListener('mousemove',
            this.handleMouseMoveEvt.bind(this));
        document.body.addEventListener('mouseup',
            this.handleMouseUpEvt.bind(this));

        // Scrollbar internal setup
        this.mouseDownStaus = {
            'pressed': false,
            'clientY': 0,
            'lastDragPos': offset
        };

        // The callback on scroll event
        this.callback = callback;
        this.debouncedScroll = this.throttle(this.onScroll, 200);
    };

    scope.ScrollBar.prototype = {

        onScroll: function () {
            if (this.isVisible()) {
                this.callback(this.getThumbPosition() - this.offset);
            }
        },

        onResize: function () {
            this.height = this.targetNode.offsetHeight;
            this.trackDiv.style.height = this.height + 'px';
            this.scrollDiv.style.left = (this.targetNode.offsetWidth - this.width) + 'px';
        },

        setVisiblility: function (state) {
            if (state) {
                this.scrollDiv.style.visibility = 'visible';
                this.scrollDiv.style.display = 'block';
            } else {
                this.scrollDiv.style.visibility = 'hidden';
                this.scrollDiv.style.display = 'none';
            }
        },

        isVisible: function (state) {
            return this.scrollDiv.style.visibility === 'visible' &&
                this.scrollDiv.style.display === 'block';
        },

        getTopMargin: function () {
            return this.offset;
        },

        getSweepArea: function () {
            return this.height - this.getTopMargin() - this.getThumbHeight();
        },

        setThumbHeight: function (size) {
            size = Math.max(this.offset, Math.min(this.height - this.offset, size));
            this.thumbDiv.style.height = size + 'px';
        },

        getThumbHeight: function () {
            return parseFloat(this.thumbDiv.style.height, 10);
        },

        setThumbPosition: function (pos) {
            pos = Math.max(this.offset,
                Math.min(this.height - this.getThumbHeight(), pos));
            this.thumbDiv.style.marginTop = pos + 'px';
        },

        getThumbPosition: function () {
            return parseFloat(this.thumbDiv.style.marginTop, 10);
        },

        handleMouseDownEvt: function (evt) {
            this.mouseDownStaus.pressed = true;
            this.mouseDownStaus.clientY = evt.clientY;
            this.mouseDownStaus.lastDragPos = this.getThumbPosition();
        },

        handleMouseUpEvt: function (evt) {
            if (this.mouseDownStaus.pressed && this.isVisible()) {
                this.handleMouseMoveEvt(evt);
                this.mouseDownStaus.pressed = false;
                this.mouseDownStaus.lastDragPos = this.getThumbPosition();
                this.onScroll();
            }
        },

        handleMouseMoveEvt: function (evt) {
            if (this.mouseDownStaus.pressed && this.isVisible()) {
                var pos = evt.clientY - this.mouseDownStaus.clientY +
                    this.mouseDownStaus.lastDragPos;
                this.setThumbPosition(pos);
                this.onScroll();
            }
        },

        handleMouseWheelEvt: function (evt) {
            if (this.isVisible()) {
                var direction = evt.wheelDeltaY < 0 ? +1 : -1;
                this.mouseDownStaus.lastDragPos = this.getThumbPosition();
                var pos = this.deltaMove * direction +
                    this.mouseDownStaus.lastDragPos;
                this.setThumbPosition(pos);
                this.onScroll();
                this.mouseDownStaus.lastDragPos = this.getThumbPosition();
            }
        },

        handleMouseClickEvt: function (evt) {
            if (this.isVisible()) {
                var targetPos = evt.offsetY - this.offset - this.getThumbHeight();
                var currentPos = this.getThumbPosition();
                var duration = 500;
                var promise = this.soothScrollTo(currentPos, targetPos, duration);
                // Invoke a final scroll
                promise.then(() => this.onScroll());
            }
        },

        soothScrollTo: function (startTop, target, duration) {
            var startTime = Date.now();
            var endTime = startTime + duration;
            var distance = target - startTop;

            var smoothStep = function (start, end, point) {
                if (point <= start) {
                    return 0;
                }
                if (point >= end) {
                    return 1;
                }
                // interpolation
                var x = (point - start) / (end - start);
                return x * x * (3 - 2 * x);
            };

            return new Promise((resolve, reject) => {
                var previousTop = startTop;
                // This is like a think function from a game loop
                var scrollFrame = function () {
                    if (this.getThumbPosition() !== previousTop) {
                        // eslint-disable-next-line prefer-promise-reject-errors
                        reject('interrupted');
                        return;
                    }
                    // set the scrollTop for this frame
                    var now = Date.now();
                    var point = smoothStep(startTime, endTime, now);
                    var frameTop = Math.round(startTop + (distance * point));
                    this.setThumbPosition(frameTop);
                    this.onScroll();
                    this.mouseDownStaus.lastDragPos = this.getThumbPosition();
                    // check if we're done!
                    if (now >= endTime) {
                        resolve();
                        return;
                    }
                    // If we were supposed to scroll but didn't, then we
                    // probably hit the limit, so consider it done; not
                    // interrupted.
                    if (this.getThumbPosition() === previousTop &&
                        this.getThumbPosition() !== frameTop) {
                        resolve();
                        return;
                    }
                    previousTop = this.getThumbPosition();
                    window.requestAnimationFrame(scrollFrame);
                }.bind(this);

                window.requestAnimationFrame(scrollFrame);
            });
        },

        debounce: function (func, wait) {
            // Each call to the returned function will share this common timer.
            var timeout;
            // Calling debounce returns a new anonymous function
            return function () {
                // reference the context and args for the setTimeout function
                var context = this;
                var args = arguments;
                //   Each time the returned function is called, the timer starts over.
                clearTimeout(timeout);
                // Set the new timeout
                timeout = setTimeout(() => {
                    // Inside the timeout function, clear the timeout variable
                    timeout = null;
                    // Call the original function with apply
                    func.apply(context, args);
                }, wait);
            };
        },

        throttle: function (callback, limit) {
            var waiting = false; // Initially, we're not waiting
            return function () { // We return a throttled function
                if (!waiting) { // If we're not waiting
                    callback.apply(this, arguments); // Execute users function
                    waiting = true; // Prevent future invocations
                    setTimeout(function () { // After a period of time
                        waiting = false; // And allow future invocations
                    }, limit);
                }
            };
        }
    };
})(this);
