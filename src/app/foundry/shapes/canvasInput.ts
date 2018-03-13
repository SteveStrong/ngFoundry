/*!
 *  CanvasInput v1.2.7
 *  http://goldfirestudios.com/blog/108/CanvasInput-HTML5-Canvas-Text-Input
 *
 *  (c) 2013-2017, James Simpson of GoldFire Studios
 *  goldfirestudios.com
 *
 *  MIT License
 */

export class CanvasInput {
  // create a buffer that stores all inputs so that tabbing
  // between them is made possible.
  inputs = [];
  _canvas = null;
  _ctx = null;
  _x = 0;
  _y = 0;
  _extraX = 0;
  _extraY = 0;
  _fontSize = 14;
  _fontFamily = 'Arial';
  _fontColor = '#000';
  _placeHolderColor = '#bfbebd';
  _fontWeight = 'normal';
  _fontStyle = 'normal';

  _readonly = false;
  _maxlength = null;
  _width = 150;
  _height = 150;
  _padding = 5;
  _borderWidth = 1;
  _borderColor = '#959595';
  _borderRadius = 3;
  _backgroundImage = '';

  _selectionColor = 'rgba(179, 212, 253, 0.8)';
  _placeHolder = '';
  _value = '';
  _onsubmit = function (e?, s?) { };
  _onkeydown = function (e?, s?) { };
  _onkeyup = function (e?, s?) { };
  _onfocus = function (e?, s?) { };
  _onblur = function (e?, s?) { };
  _cursor = false;
  _cursorPos = 0;
  _hasFocus = false;
  _selection = [0, 0];
  _wasOver = false;

  _renderCanvas;
  _renderCtx;

  _backgroundColor;
  _mouseDown;
  _hiddenInput;
  _inputsIndex;
  _selectionUpdated;
  _cursorInterval;

  outerH: number;
  outerW: number;


  // initialize the Canvas Input
  constructor(o) {
    // var self = this;

    o = o ? o : {};

    // setup the defaults
    this._canvas = o.canvas || null;
    this._ctx = this._canvas ? this._canvas.getContext('2d') : null;
    this._x = o.x || 0;
    this._y = o.y || 0;
    this._extraX = o.extraX || 0;
    this._extraY = o.extraY || 0;
    this._fontSize = o.fontSize || 14;
    this._fontFamily = o.fontFamily || 'Arial';
    this._fontColor = o.fontColor || '#000';
    this._placeHolderColor = o.placeHolderColor || '#bfbebd';
    this._fontWeight = o.fontWeight || 'normal';
    this._fontStyle = o.fontStyle || 'normal';

    this._readonly = o.readonly || false;
    this._maxlength = o.maxlength || null;
    this._width = o.width || 150;
    this._height = o.height || this._fontSize;
    this._padding = o.padding >= 0 ? o.padding : 5;
    this._borderWidth = o.borderWidth >= 0 ? o.borderWidth : 1;
    this._borderColor = o.borderColor || '#959595';
    this._borderRadius = o.borderRadius >= 0 ? o.borderRadius : 3;
    this._backgroundImage = o.backgroundImage || '';

    this._selectionColor = o.selectionColor || 'rgba(179, 212, 253, 0.8)';
    this._placeHolder = o.placeHolder || '';
    this._value = (o.value || this._placeHolder) + '';
    this._onsubmit = o.onsubmit || function (e, s) { };
    this._onkeydown = o.onkeydown || function (e, s) { };
    this._onkeyup = o.onkeyup || function (e, s) { };
    this._onfocus = o.onfocus || function (e, s) { };
    this._onblur = o.onblur || function (e, s) { };
    this._cursor = false;
    this._cursorPos = 0;
    this._hasFocus = false;
    this._selection = [0, 0];
    this._wasOver = false;



    // calculate the full width and height with padding, borders and shadows
    this._calcWH();

    // setup the off-DOM canvas
    this._renderCanvas = document.createElement('canvas');
    this._renderCanvas.setAttribute('width', this.outerW);
    this._renderCanvas.setAttribute('height', this.outerH);
    this._renderCtx = this._renderCanvas.getContext('2d');


    // setup the background color
    if (typeof o.backgroundGradient !== 'undefined') {
      this._backgroundColor = this._renderCtx.createLinearGradient(
        0,
        0,
        0,
        this.outerH
      );
      this._backgroundColor.addColorStop(0, o.backgroundGradient[0]);
      this._backgroundColor.addColorStop(1, o.backgroundGradient[1]);
    } else {
      this._backgroundColor = o.backgroundColor || '#fff';
    }

    // setup main canvas events

    this._canvas.addEventListener('mousemove',  (e) => {
      e = e || window.event;
      this.mousemove(e, this);
    }, false);

    this._canvas.addEventListener('mousedown',  (e) => {
      e = e || window.event;
      this.mousedown(e, this);
    }, false);

    this._canvas.addEventListener('mouseup',  (e) => {
      e = e || window.event;
      this.mouseup(e, this);
    }, false);



    // create the hidden input element
    this._hiddenInput = document.createElement('input');
    this._hiddenInput.type = 'text';
    this._hiddenInput.style.position = 'absolute';
    this._hiddenInput.style.opacity = 0;
    this._hiddenInput.style.pointerEvents = 'none';
    this._hiddenInput.style.zIndex = 0;
    // hide native blue text cursor on iOS
    this._hiddenInput.style.transform = 'scale(0)';

    this._updateHiddenInput();
    if (this._maxlength) {
      this._hiddenInput.maxLength = this._maxlength;
    }
    document.body.appendChild(this._hiddenInput);
    this._hiddenInput.value = this._value;

    // setup the keydown listener
    this._hiddenInput.addEventListener('keydown',  (e) => {
      e = e || window.event;

      if (this._hasFocus) {
        // hack to fix touch event bug in iOS Safari
        window.focus();
        this._hiddenInput.focus();

        // continue with the keydown event
        this.keydown(e, this);
      }
    });

    // setup the keyup listener
    this._hiddenInput.addEventListener('keyup',  (e) => {
      e = e || window.event;

      // update the canvas input state information from the hidden input
      this._value = this._hiddenInput.value;
      this._cursorPos = this._hiddenInput.selectionStart;
      // update selection to hidden input's selection in case user did keyboard-based selection
      this._selection = [this._hiddenInput.selectionStart, this._hiddenInput.selectionEnd];
      this.render();

      if (this._hasFocus) {
        this._onkeyup(e, this);
      }
    });


    // draw the text box
    this.render();
  };


  canvas(data) {
    var self = this;

    if (typeof data !== 'undefined') {
      self._canvas = data;
      self._ctx = self._canvas.getContext('2d');

      return self.render();
    } else {
      return self._canvas;
    }
  }

  /**
   * Get/set the x-position.
   * @param  {Number} data The pixel position along the x-coordinate.
   * @return {Mixed}      CanvasInput or current x-value.
   */
  x(data) {
    var self = this;

    if (typeof data !== 'undefined') {
      self._x = data;
      self._updateHiddenInput();

      return self.render();
    } else {
      return self._x;
    }
  }

  /**
   * Get/set the y-position.
   * @param  {Number} data The pixel position along the y-coordinate.
   * @return {Mixed}      CanvasInput or current y-value.
   */
  y(data) {
    var self = this;

    if (typeof data !== 'undefined') {
      self._y = data;
      self._updateHiddenInput();

      return self.render();
    } else {
      return self._y;
    }
  }

  /**
   * Get/set the extra x-position (generally used when no canvas is specified).
   * @param  {Number} data The pixel position along the x-coordinate.
   * @return {Mixed}      CanvasInput or current x-value.
   */
  extraX(data) {
    var self = this;

    if (typeof data !== 'undefined') {
      self._extraX = data;
      self._updateHiddenInput();

      return self.render();
    } else {
      return self._extraX;
    }
  }

  /**
   * Get/set the extra y-position (generally used when no canvas is specified).
   * @param  {Number} data The pixel position along the y-coordinate.
   * @return {Mixed}      CanvasInput or current y-value.
   */
  extraY(data) {
    var self = this;

    if (typeof data !== 'undefined') {
      self._extraY = data;
      self._updateHiddenInput();

      return self.render();
    } else {
      return self._extraY;
    }
  }

  /**
   * Get/set the font size.
   * @param  {Number} data Font size.
   * @return {Mixed}      CanvasInput or current font size.
   */
  fontSize(data) {
    var self = this;

    if (typeof data !== 'undefined') {
      self._fontSize = data;

      return self.render();
    } else {
      return self._fontSize;
    }
  }

  /**
   * Get/set the font family.
   * @param  {String} data Font family.
   * @return {Mixed}      CanvasInput or current font family.
   */
  fontFamily(data) {
    var self = this;

    if (typeof data !== 'undefined') {
      self._fontFamily = data;

      return self.render();
    } else {
      return self._fontFamily;
    }
  }

  /**
   * Get/set the font color.
   * @param  {String} data Font color.
   * @return {Mixed}      CanvasInput or current font color.
   */
  fontColor(data) {
    var self = this;

    if (typeof data !== 'undefined') {
      self._fontColor = data;

      return self.render();
    } else {
      return self._fontColor;
    }
  }

  /**
   * Get/set the place holder font color.
   * @param  {String} data Font color.
   * @return {Mixed}      CanvasInput or current place holder font color.
   */
  placeHolderColor(data) {
    var self = this;

    if (typeof data !== 'undefined') {
      self._placeHolderColor = data;

      return self.render();
    } else {
      return self._placeHolderColor;
    }
  }

  /**
   * Get/set the font weight.
   * @param  {String} data Font weight.
   * @return {Mixed}      CanvasInput or current font weight.
   */
  fontWeight(data) {
    var self = this;

    if (typeof data !== 'undefined') {
      self._fontWeight = data;

      return self.render();
    } else {
      return self._fontWeight;
    }
  }

  /**
   * Get/set the font style.
   * @param  {String} data Font style.
   * @return {Mixed}      CanvasInput or current font style.
   */
  fontStyle(data) {
    var self = this;

    if (typeof data !== 'undefined') {
      self._fontStyle = data;

      return self.render();
    } else {
      return self._fontStyle;
    }
  }




  /**
   * Get/set the width of the text box.
   * @param  {Number} data Width in pixels.
   * @return {Mixed}      CanvasInput or current width.
   */
  width(data) {
    var self = this;

    if (typeof data !== 'undefined') {
      self._width = data;
      self._calcWH();
      self._updateCanvasWH();
      self._updateHiddenInput();

      return self.render();
    } else {
      return self._width;
    }
  }

  /**
   * Get/set the height of the text box.
   * @param  {Number} data Height in pixels.
   * @return {Mixed}      CanvasInput or current height.
   */
  height(data) {
    var self = this;

    if (typeof data !== 'undefined') {
      self._height = data;
      self._calcWH();
      self._updateCanvasWH();
      self._updateHiddenInput();

      return self.render();
    } else {
      return self._height;
    }
  }

  /**
   * Get/set the padding of the text box.
   * @param  {Number} data Padding in pixels.
   * @return {Mixed}      CanvasInput or current padding.
   */
  padding(data) {
    var self = this;

    if (typeof data !== 'undefined') {
      self._padding = data;
      self._calcWH();
      self._updateCanvasWH();

      return self.render();
    } else {
      return self._padding;
    }
  }

  /**
   * Get/set the border width.
   * @param  {Number} data Border width.
   * @return {Mixed}      CanvasInput or current border width.
   */
  borderWidth(data) {
    var self = this;

    if (typeof data !== 'undefined') {
      self._borderWidth = data;
      self._calcWH();
      self._updateCanvasWH();

      return self.render();
    } else {
      return self._borderWidth;
    }
  }

  /**
   * Get/set the border color.
   * @param  {String} data Border color.
   * @return {Mixed}      CanvasInput or current border color.
   */
  borderColor(data) {
    var self = this;

    if (typeof data !== 'undefined') {
      self._borderColor = data;

      return self.render();
    } else {
      return self._borderColor;
    }
  }

  /**
   * Get/set the border radius.
   * @param  {Number} data Border radius.
   * @return {Mixed}      CanvasInput or current border radius.
   */
  borderRadius(data) {
    var self = this;

    if (typeof data !== 'undefined') {
      self._borderRadius = data;

      return self.render();
    } else {
      return self._borderRadius;
    }
  }

  /**
   * Get/set the background color.
   * @param  {Number} data Background color.
   * @return {Mixed}      CanvasInput or current background color.
   */
  backgroundColor(data) {
    var self = this;

    if (typeof data !== 'undefined') {
      self._backgroundColor = data;

      return self.render();
    } else {
      return self._backgroundColor;
    }
  }

  /**
   * Get/set the background gradient.
   * @param  {Number} data Background gradient.
   * @return {Mixed}      CanvasInput or current background gradient.
   */
  backgroundGradient(data) {
    var self = this;

    if (typeof data !== 'undefined') {
      self._backgroundColor = self._renderCtx.createLinearGradient(
        0,
        0,
        0,
        self.outerH
      );
      self._backgroundColor.addColorStop(0, data[0]);
      self._backgroundColor.addColorStop(1, data[1]);

      return self.render();
    } else {
      return self._backgroundColor;
    }
  }



  /**
   * Get/set the text selection color.
   * @param  {String} data Color.
   * @return {Mixed}      CanvasInput or current selection color.
   */
  selectionColor(data) {
    var self = this;

    if (typeof data !== 'undefined') {
      self._selectionColor = data;

      return self.render();
    } else {
      return self._selectionColor;
    }
  }

  /**
   * Get/set the place holder text.
   * @param  {String} data Place holder text.
   * @return {Mixed}      CanvasInput or current place holder text.
   */
  placeHolder(data) {
    var self = this;

    if (typeof data !== 'undefined') {
      self._placeHolder = data;

      return self.render();
    } else {
      return self._placeHolder;
    }
  }

  /**
   * Get/set the current text box value.
   * @param  {String} data Text value.
   * @return {Mixed}      CanvasInput or current text value.
   */
  value(data) {
    var self = this;

    if (typeof data !== 'undefined') {
      self._value = data + '';
      self._hiddenInput.value = data + '';

      // update the cursor position
      self._cursorPos = self._clipText().length;

      self.render();

      return self;
    } else {
      return (self._value === self._placeHolder) ? '' : self._value;
    }
  }

  /**
   * Set or fire the onsubmit event.
   * @param  {Function} fn Custom callback.
   */
  onsubmit(fn) {
    var self = this;

    if (typeof fn !== 'undefined') {
      self._onsubmit = fn;

      return self;
    } else {
      self._onsubmit();
    }
  }

  /**
   * Set or fire the onkeydown event.
   * @param  {Function} fn Custom callback.
   */
  onkeydown(fn) {
    var self = this;

    if (typeof fn !== 'undefined') {
      self._onkeydown = fn;

      return self;
    } else {
      self._onkeydown();
    }
  }

  /**
   * Set or fire the onkeyup event.
   * @param  {Function} fn Custom callback.
   */
  onkeyup(fn) {
    var self = this;

    if (typeof fn !== 'undefined') {
      self._onkeyup = fn;

      return self;
    } else {
      self._onkeyup();
    }
  }

  /**
   * Place focus on the CanvasInput box, placing the cursor
   * either at the end of the text or where the user clicked.
   * @param  {Number} pos (optional) The position to place the cursor.
   * @return {CanvasInput}
   */
  focus(pos) {
    var self = this;

    // only fire the focus event when going from unfocussed
    if (!self._hasFocus) {
      self._onfocus(self);
    }

    // remove selection
    if (!self._selectionUpdated) {
      self._selection = [0, 0];
    } else {
      delete self._selectionUpdated;
    }

    // if this is readonly, don't allow it to get focus
    self._hasFocus = true;
    if (self._readonly) {
      self._hiddenInput.readOnly = true;
    } else {
      self._hiddenInput.readOnly = false;

      // update the cursor position
      self._cursorPos = (typeof pos === 'number') ? pos : self._clipText().length;

      // clear the place holder
      if (self._placeHolder === self._value) {
        self._value = '';
        self._hiddenInput.value = '';
      }

      self._cursor = true;

      // setup cursor interval
      if (self._cursorInterval) {
        clearInterval(self._cursorInterval);
      }
      self._cursorInterval = setInterval(function () {
        self._cursor = !self._cursor;
        self.render();
      }, 500);
    }

    // move the real focus to the hidden input
    var hasSelection = (self._selection[0] > 0 || self._selection[1] > 0);
    self._hiddenInput.focus();
    self._hiddenInput.selectionStart = hasSelection ? self._selection[0] : self._cursorPos;
    self._hiddenInput.selectionEnd = hasSelection ? self._selection[1] : self._cursorPos;

    return self.render();
  }

  /**
   * Removes focus from the CanvasInput box.
   * @param  {Object} _this Reference to this.
   * @return {CanvasInput}
   */
  blur(obj?) {
    var self = this;

    self._onblur(self);

    if (self._cursorInterval) {
      clearInterval(self._cursorInterval);
    }
    self._hasFocus = false;
    self._cursor = false;
    self._selection = [0, 0];
    self._hiddenInput.blur();

    // fill the place holder
    if (self._value === '') {
      self._value = self._placeHolder;
    }

    return self.render();
  }

  /**
   * Fired with the keydown event to draw the typed characters.
   * @param  {Event}       e    The keydown event.
   * @param  {CanvasInput} self
   * @return {CanvasInput}
   */
  keydown(e, self) {
    var keyCode = e.which,
      isShift = e.shiftKey,
      key = null,
      startText, endText;

    // make sure the correct text field is being updated
    if (self._readonly || !self._hasFocus) {
      return;
    }

    // fire custom user event
    self._onkeydown(e, self);

    // add support for Ctrl/Cmd+A selection
    if (keyCode === 65 && (e.ctrlKey || e.metaKey)) {
      self.selectText();
      e.preventDefault();
      return self.render();
    }

    // block keys that shouldn't be processed
    if (keyCode === 17 || e.metaKey || e.ctrlKey) {
      return self;
    }


    // update the canvas input state information from the hidden input
    self._value = self._hiddenInput.value;
    self._cursorPos = self._hiddenInput.selectionStart;
    self._selection = [0, 0];

    return self.render();
  }

  /**
   * Fired with the click event on the canvas, and puts focus on/off
   * based on where the user clicks.
   * @param  {Event}       e    The click event.
   * @param  {CanvasInput} self
   * @return {CanvasInput}
   */
  click(e, self) {
    var mouse = self._mousePos(e),
      x = mouse.x,
      y = mouse.y;

    if (self._endSelection) {
      delete self._endSelection;
      delete self._selectionUpdated;
      return;
    }

    if (self._canvas && self._overInput(x, y) || !self._canvas) {
      if (self._mouseDown) {
        self._mouseDown = false;
        self.click(e, self);
        return self.focus(self._clickPos(x, y));
      }
    } else {
      return self.blur();
    }
  }

  /**
   * Fired with the mousemove event to update the default cursor.
   * @param  {Event}       e    The mousemove event.
   * @param  {CanvasInput} self
   * @return {CanvasInput}
   */
  mousemove(e, self) {
    var mouse = self._mousePos(e),
      x = mouse.x,
      y = mouse.y,
      isOver = self._overInput(x, y);

    if (isOver && self._canvas) {
      self._canvas.style.cursor = 'text';
      self._wasOver = true;
    } else if (self._wasOver && self._canvas) {
      self._canvas.style.cursor = 'default';
      self._wasOver = false;
    }

    if (self._hasFocus && self._selectionStart >= 0) {
      var curPos = self._clickPos(x, y),
        start = Math.min(self._selectionStart, curPos),
        end = Math.max(self._selectionStart, curPos);

      if (!isOver) {
        self._selectionUpdated = true;
        self._endSelection = true;
        delete self._selectionStart;
        self.render();
        return;
      }

      if (self._selection[0] !== start || self._selection[1] !== end) {
        self._selection = [start, end];
        self.render();
      }
    }
  }

  /**
   * Fired with the mousedown event to start a selection drag.
   * @param  {Event} e    The mousedown event.
   * @param  {CanvasInput} self
   */
  mousedown(e, self) {
    var mouse = self._mousePos(e),
      x = mouse.x,
      y = mouse.y,
      isOver = self._overInput(x, y);

    // setup the 'click' event
    self._mouseDown = isOver;

    // start the selection drag if inside the input
    if (self._hasFocus && isOver) {
      self._selectionStart = self._clickPos(x, y);
    }
  }

  /**
   * Fired with the mouseup event to end a selection drag.
   * @param  {Event} e    The mouseup event.
   * @param  {CanvasInput} self
   */
  mouseup(e, self) {
    var mouse = self._mousePos(e),
      x = mouse.x,
      y = mouse.y;

    // update selection if a drag has happened
    var isSelection = self._clickPos(x, y) !== self._selectionStart;
    if (self._hasFocus && self._selectionStart >= 0 && self._overInput(x, y) && isSelection) {
      self._selectionUpdated = true;
      delete self._selectionStart;
      self.render();
    } else {
      delete self._selectionStart;
    }

    self.click(e, self);
  }

  /**
   * Select a range of text in the input.
   * @param  {Array} range (optional) Leave blank to select all. Format: [start, end]
   * @return {CanvasInput}
   */
  selectText(range) {
    var self = this,
      range = range || [0, self._value.length];

    // select the range of text specified (or all if none specified)
    setTimeout(function () {
      self._selection = [range[0], range[1]];
      self._hiddenInput.selectionStart = range[0];
      self._hiddenInput.selectionEnd = range[1];
      self.render();
    }, 1);

    return self;
  }

  /**
   * Helper method to get the off-DOM canvas.
   * @return {Object} Reference to the canvas.
   */
  renderCanvas() {
    return this._renderCanvas;
  }

  /**
   * Clears and redraws the CanvasInput on an off-DOM canvas,
   * and if a main canvas is provided, draws it all onto that.
   * @return {CanvasInput}
   */
  render() {
    var self = this,
      ctx = self._renderCtx,
      w = self.outerW,
      h = self.outerH,
      br = self._borderRadius,
      bw = self._borderWidth;


    if (!ctx) {
      return;
    }

    // clear the canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);


    // draw the border
    if (self._borderWidth > 0) {
      ctx.fillStyle = self._borderColor;
      //self._roundedRect(ctx, self.shadowL, self.shadowT, w - sw, h - sh, br);
      ctx.fill();

    }

    // draw the text box background
    self._drawTextBox(function () {


      // clip the text so that it fits within the box
      var text = self._clipText();

      // draw the selection
      var paddingBorder = self._padding + self._borderWidth;
      if (self._selection[1] > 0) {
        var selectOffset = self._textWidth(text.substring(0, self._selection[0])),
          selectWidth = self._textWidth(text.substring(self._selection[0], self._selection[1]));

        ctx.fillStyle = self._selectionColor;
        ctx.fillRect(paddingBorder + selectOffset, paddingBorder, selectWidth, self._height);
      }

      // draw the cursor
      if (self._cursor) {
        var cursorOffset = self._textWidth(text.substring(0, self._cursorPos));
        ctx.fillStyle = self._fontColor;
        ctx.fillRect(paddingBorder + cursorOffset, paddingBorder, 1, self._height);
      }

      // draw the text
      var textX = self._padding + self._borderWidth,
        textY = Math.round(paddingBorder + self._height / 2);

      // only remove the placeholder text if they have typed something
      text = (text === '' && self._placeHolder) ? self._placeHolder : text;

      ctx.fillStyle = (self._value !== '' && self._value !== self._placeHolder) ? self._fontColor : self._placeHolderColor;
      ctx.font = self._fontStyle + ' ' + self._fontWeight + ' ' + self._fontSize + 'px ' + self._fontFamily;

      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, textX, textY);


      // draw to the visible canvas
      if (self._ctx) {
        self._ctx.clearRect(self._x, self._y, ctx.canvas.width, ctx.canvas.height);
        self._ctx.drawImage(self._renderCanvas, self._x, self._y);
      }

      return self;

    });
  }

  /**
   * Destroy this input and stop rendering it.
   */
  destroy() {
    var self = this;


    // remove the hidden input box
    document.body.removeChild(self._hiddenInput);

    // remove off-DOM canvas
    self._renderCtx = null;
  }

  /**
   * Draw the text box area with either an image or background color.
   * @param  {Function} fn Callback.
   */
  _drawTextBox(fn) {
    var self = this,
      ctx = self._renderCtx,
      w = self.outerW,
      h = self.outerH,
      br = self._borderRadius,
      bw = self._borderWidth;


    // only draw the background shape if no image is being used

    ctx.fillStyle = self._backgroundColor;
    self._roundedRect(ctx, bw + 0, bw + 0, w - bw * 2 - 0, h - bw * 2 - 0, br);
    ctx.fill();

    fn();
  }

  /**
   * Deletes selected text in selection range and repositions cursor.
   * @return {Boolean} true if text removed.
   */
  _clearSelection() {
    var self = this;

    if (self._selection[1] > 0) {
      // clear the selected contents
      var start = self._selection[0],
        end = self._selection[1];

      self._value = self._value.substr(0, start) + self._value.substr(end);
      self._cursorPos = start;
      self._cursorPos = (self._cursorPos < 0) ? 0 : self._cursorPos;
      self._selection = [0, 0];

      return true;
    }

    return false;
  }

  /**
   * Clip the text string to only return what fits in the visible text box.
   * @param  {String} value The text to clip.
   * @return {String} The clipped text.
   */
  _clipText(value?) {
    var self = this;
    value = (typeof value === 'undefined') ? self._value : value;

    var textWidth = self._textWidth(value),
      fillPer = textWidth / (self._width - self._padding),
      text = fillPer > 1 ? value.substr(-1 * Math.floor(value.length / fillPer)) : value;

    return text + '';
  }

  /**
   * Gets the pixel with of passed text.
   * @param  {String} text The text to measure.
   * @return {Number}      The measured width.
   */
  _textWidth(text) {
    var self = this,
      ctx = self._renderCtx;

    ctx.font = self._fontStyle + ' ' + self._fontWeight + ' ' + self._fontSize + 'px ' + self._fontFamily;
    ctx.textAlign = 'left';

    return ctx.measureText(text).width;
  }

  /**
   * Recalculate the outer with and height of the text box.
   */
  _calcWH() {
    var self = this;

    // calculate the full width and height with padding, borders and shadows
    self.outerW = self._width + self._padding * 2 + self._borderWidth;
    self.outerH = self._height + self._padding * 2 + self._borderWidth;
  }

  /**
   * Update the width and height of the off-DOM canvas when attributes are changed.
   */
  _updateCanvasWH() {
    var self = this,
      oldW = self._renderCanvas.width,
      oldH = self._renderCanvas.height;

    // update off-DOM canvas
    self._renderCanvas.setAttribute('width', self.outerW);
    self._renderCanvas.setAttribute('height', self.outerH);


    // clear the main canvas
    if (self._ctx) {
      self._ctx.clearRect(self._x, self._y, oldW, oldH);
    }
  }

  /**
   * Update the size and position of the hidden input (better UX on mobile).
   */
  _updateHiddenInput() {
    var self = this;

    self._hiddenInput.style.left = (self._x + self._extraX + (self._canvas ? self._canvas.offsetLeft : 0)) + 'px';
    self._hiddenInput.style.top = (self._y + self._extraY + (self._canvas ? self._canvas.offsetTop : 0)) + 'px';
    self._hiddenInput.style.width = (self._width + self._padding * 2) + 'px';
    self._hiddenInput.style.height = (self._height + self._padding * 2) + 'px';
  }

  /**
   * Creates the path for a rectangle with rounded corners.
   * Must call ctx.fill() after calling this to draw the rectangle.
   * @param  {Object} ctx Canvas context.
   * @param  {Number} x   x-coordinate to draw from.
   * @param  {Number} y   y-coordinate to draw from.
   * @param  {Number} w   Width of rectangle.
   * @param  {Number} h   Height of rectangle.
   * @param  {Number} r   Border radius.
   */
  _roundedRect(ctx, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;

    ctx.beginPath();

    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);

    ctx.closePath();
  }

  /**
   * Checks if a coordinate point is over the input box.
   * @param  {Number} x x-coordinate position.
   * @param  {Number} y y-coordinate position.
   * @return {Boolean}   True if it is over the input box.
   */
  _overInput(x, y) {
    var self = this,
      xLeft = x >= self._x + self._extraX,
      xRight = x <= self._x + self._extraX + self._width + self._padding * 2,
      yTop = y >= self._y + self._extraY,
      yBottom = y <= self._y + self._extraY + self._height + self._padding * 2;

    return xLeft && xRight && yTop && yBottom;
  }

  /**
   * Use the mouse's x & y coordinates to determine
   * the position clicked in the text.
   * @param  {Number} x X-coordinate.
   * @param  {Number} y Y-coordinate.
   * @return {Number}   Cursor position.
   */
  _clickPos(x, y) {
    var self = this,
      value = self._value;

    // don't count placeholder text in this
    if (self._value === self._placeHolder) {
      value = '';
    }

    // determine where the click was made along the string
    var text = self._clipText(value),
      totalW = 0,
      pos = text.length;

    if (x - (self._x + self._extraX) < self._textWidth(text)) {
      // loop through each character to identify the position
      for (var i = 0; i < text.length; i++) {
        totalW += self._textWidth(text[i]);
        if (totalW >= x - (self._x + self._extraX)) {
          pos = i;
          break;
        }
      }
    }

    return pos;
  }

  /**
   * Calculate the mouse position based on the event callback and the elements on the page.
   * @param  {Event} e
   * @return {Object}   x & y values
   */
  _mousePos(e) {
    var elm = e.target,
      x = e.pageX,
      y = e.pageY;

    // support touch events in page location calculation
    if (e.touches && e.touches.length) {
      elm = e.touches[0].target;
      x = e.touches[0].pageX;
      y = e.touches[0].pageY;
    } else if (e.changedTouches && e.changedTouches.length) {
      elm = e.changedTouches[0].target;
      x = e.changedTouches[0].pageX;
      y = e.changedTouches[0].pageY;
    }

    var style = document.defaultView.getComputedStyle(elm, undefined),
      paddingLeft = parseInt(style['paddingLeft'], 10) || 0,
      paddingTop = parseInt(style['paddingLeft'], 10) || 0,
      borderLeft = parseInt(style['borderLeftWidth'], 10) || 0,
      borderTop = parseInt(style['borderLeftWidth'], 10) || 0,
      htmlTop = 0, //document.body.parentNode.offsetTop || 0,
      htmlLeft = 0, //document.body.parentNode.offsetLeft || 0,
      offsetX = 0,
      offsetY = 0;

    // calculate the total offset
    if (typeof elm.offsetParent !== 'undefined') {
      do {
        offsetX += elm.offsetLeft;
        offsetY += elm.offsetTop;
      } while ((elm = elm.offsetParent));
    }

    // take into account borders and padding
    offsetX += paddingLeft + borderLeft + htmlLeft;
    offsetY += paddingTop + borderTop + htmlTop;

    return {
      x: x - offsetX,
      y: y - offsetY
    };
  }

};

