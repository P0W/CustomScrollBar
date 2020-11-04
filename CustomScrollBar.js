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

        // Considering it takes 20 wheels to move down
        this.deltaMove = (this.height - thumbHeight - 2 * this.offset) / 20;
        this.scrollDiv = scrollDiv;
        this.trackDiv = trackDiv;
        this.thumbDiv = thumbDiv;

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

        // Configure events - On target node
        targetNode.addEventListener('mousewheel',
            this.handleMouseWheelEvt.bind(this));
        targetNode.addEventListener('mouseup',
            this.handleMouseUpEvt.bind(this));

        // Configure events - On document body
        document.body.addEventListener('mousemove',
            this.handleMouseMoveEvt.bind(this));
        document.body.addEventListener('mouseup',
            this.handleMouseUpEvt.bind(this));

        // Canvas Contexts
        // this.trackCanvasCtx = this.trackDiv.getContext('2d');
        // this.thumbCanvasCtx = this.thumbDiv.getContext('2d');

        // Scrollbar internal setup
        this.mouseDownStaus = {
            'pressed': false,
            'clientY': 0,
            'lastDragPos': offset
        };

        // The callback on scroll event
        this.callback = callback;
    };

    scope.ScrollBar.prototype = {

        onScroll: function () {
            this.callback(this.getThumbPosition() - this.offset);
        },

        onResize: function () {

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
        }
    };
})(this);
