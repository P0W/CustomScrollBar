var ScrollBar = function (config, callback, targetNode) {
    targetNode = targetNode || window;

    var thumbHeight = config.thumbHeight || 100;
    var width = config.width || 20;
    var offset = config.offset || 5;

    // Create HTML tags
    var trackDiv = document.createElement('div');
    var trackCanvas = document.createElement('div');

    trackDiv.classList.add('custom-scrollbar');
    trackCanvas.classList.add('custom-scrollbar-track');
    trackDiv.style.position = 'relative';
    trackCanvas.style.position = 'absolute';
    trackDiv.style.left = (targetNode.offsetWidth - width) + 'px';
    trackDiv.appendChild(trackCanvas);

    var thumbCanvas = document.createElement('div');
    thumbCanvas.classList.add('custom-scrollbar-thumb');
    thumbCanvas.style.position = 'absolute';
    thumbCanvas.style.left = '0px';
    thumbCanvas.style.top = '0px';
    trackDiv.appendChild(thumbCanvas);
    targetNode.appendChild(trackDiv);


    this.offset = offset; // 5px margin up and below
    this.height = targetNode.offsetHeight;

    // Considering it takes 20 wheels to move down
    this.deltaMove = (this.height - thumbHeight - 2 * this.offset) / 20;
    this.trackCanvas = trackCanvas;
    this.thumbCanvas = thumbCanvas;


    // Congigure Track
    this.trackCanvas.style.height = this.height + 'px';
    this.trackCanvas.style.width = width + 'px';

    // Configure Thumb
    this.setThumbHeight(thumbHeight);
    var sideMargins = 2; // 3 px from left and right
    this.thumbCanvas.style.width = width - (2 * sideMargins) + 'px';
    this.thumbCanvas.style.marginTop = this.offset + 'px';
    this.thumbCanvas.style.marginLeft = sideMargins + 'px';

    // Configure events
    this.thumbCanvas.addEventListener('mousedown',
        this.handleMouseDownEvt.bind(this));
    this.thumbCanvas.addEventListener('mouseup',
        this.handleMouseMoveUpEvt.bind(this));

    targetNode.addEventListener('mousewheel',
        this.handleMouseWheelEvt.bind(this));
    targetNode.addEventListener('mousemove',
        this.handleMouseMoveEvt.bind(this));
    targetNode.addEventListener('mouseup',
        this.handleMouseMoveUpEvt.bind(this));

    // Canvas Contexts
    // this.trackCanvasCtx = this.trackCanvas.getContext('2d');
    // this.thumbCanvasCtx = this.thumbCanvas.getContext('2d');

    // Scrollbar internal setup
    this.mouseDownStaus = {
        'pressed': false,
        'clientY': 0,
        'lastDragPos': this.offset,
    };

    // The callback on scroll event
    this.callback = callback;
};

ScrollBar.prototype = {

    onScroll: function () {
        this.callback(this.getThumbPosition() - this.offset);
    },

    onResize: function () {

    },

    setThumbHeight: function (size) {
        size = Math.max(this.offset, Math.min(this.height - this.offset, size));
        this.thumbCanvas.style.height = size + 'px';
    },

    getThumbHeight: function () {
        return parseFloat(this.thumbCanvas.style.height, 10);
    },

    setThumbPosition: function (pos) {
        pos = Math.max(this.offset,
            Math.min(this.height - this.getThumbHeight(), pos));

        this.thumbCanvas.style.marginTop = pos + 'px';

        
    },

    getThumbPosition: function () {
        return parseFloat(this.thumbCanvas.style.marginTop, 10);
    },

    handleMouseDownEvt: function (evt) {
        this.mouseDownStaus.pressed = true;
        this.mouseDownStaus.clientY = evt.clientY;
        this.mouseDownStaus.lastDragPos = this.getThumbPosition();
    },

    handleMouseMoveUpEvt: function () {
        if (this.mouseDownStaus.pressed) {
            this.mouseDownStaus.pressed = false;
            this.mouseDownStaus.lastDragPos = this.getThumbPosition();
            this.onScroll();
        }
    },

    handleMouseMoveEvt: function (evt) {
        if (this.mouseDownStaus.pressed) {
            var pos = evt.clientY - this.mouseDownStaus.clientY +
                this.mouseDownStaus.lastDragPos;
            this.setThumbPosition(pos);
        }
    },

    handleMouseWheelEvt: function (evt) {
        var direction = evt.wheelDeltaY < 0 ? +1 : -1;
        this.mouseDownStaus.lastDragPos = this.getThumbPosition();
        var pos = this.deltaMove * direction +
            this.mouseDownStaus.lastDragPos;
        this.setThumbPosition(pos);
        this.onScroll();
        this.mouseDownStaus.lastDragPos = this.getThumbPosition();
    }
};
