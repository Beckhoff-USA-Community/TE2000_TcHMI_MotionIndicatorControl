/*
 *
Zero-Clause BSD
Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

 */
var TcHmi;
(function (TcHmi) {
    let Controls;
    (function (Controls) {
        let MotionIndicator;
        (function (MotionIndicator) {
            class MotionIndicatorControl extends TcHmi.Controls.System.TcHmiControl {
                /*
                Attribute philosophy
                --------------------
                - Local variables are not set while definition in class, so they have the value 'undefined'.
                - On compile the Framework sets the value from HTML or from theme (possibly 'null') via normal setters
                - The "changed detection" in the setter will result in processing the value only once while compile
                - Attention: If we have a Server Binding on an Attribute the setter can be very late or never (leaving the value = undefined).
                */
                /**
                 * @description Constructor of the control
                 * @param {JQuery} element Element from HTML (internal, do not use)
                 * @param {JQuery} pcElement precompiled Element (internal, do not use)
                 * @param {TcHmi.Controls.ControlAttributeList} attrs Attributes defined in HTML in a special format (internal, do not use)
                 * @returns {void}
                 */
                constructor(element, pcElement, attrs) {
                    /** Call base class constructor */
                    super(element, pcElement, attrs);
                    this.__speedRatio = 0;
                    this.__totalOutput = 0;
                    this.__bars = 0;
                }
                /**
                  * If raised, the control object exists in control cache and constructor of each inheritation level was called.
                  * Call attribute processor functions here to initialize default values!
                  */
                __previnit() {
                    // Fetch template root element
                    this.__elementTemplateRoot = this.__element.find('.TcHmi_Controls_MotionIndicator_MotionIndicatorControl-Template');
                    if (this.__elementTemplateRoot.length === 0) {
                        throw new Error('Invalid Template.html');
                    }
                    this.__$Canvas = this.__elementTemplateRoot.find('canvas');
                    this.__elCanvas = this.__$Canvas[0];
                    // Call __previnit of base class
                    super.__previnit();
                }
                /**
                 * @description Is called during control initialize phase after attribute setter have been called based on it's default or initial html dom values.
                 * @returns {void}
                 */
                __init() {
                    super.__init();
                }
                /**
                * @description Is called by tachcontrol() after the control instance gets part of the current DOM.
                * Is only allowed to be called from the framework itself!
                */
                __attach() {
                    super.__attach();
                    /**
                     * Initialize everything which is only available while the control is part of the active dom.
                     */
                    // Get the canvas context for drawing
                    this.__ctx = this.__elCanvas.getContext("2d");
                    // Retrieve device DPI for proper scaling canvas element
                    this.__deviceDPI = window.devicePixelRatio;
                    // Set the element attr (not style) width/height to the values applied AFTER any transforming that might occur
                    // Do same for resizing, apply any DPI adjustments
                    this.__ctx.canvas.width = this.__elCanvas.getBoundingClientRect().width * this.__deviceDPI;
                    this.__ctx.canvas.height = this.__elCanvas.getBoundingClientRect().height * this.__deviceDPI;
                    this.__canvasWidth = this.__elCanvas.getBoundingClientRect().width * this.__deviceDPI;
                    this.__canvasHeight = this.__elCanvas.getBoundingClientRect().height * this.__deviceDPI;
                    // Set starting point of striped graphics
                    this.__scrollVal = 0;
                    // Set each bar width to be the width of canvas / number of bars
                    this.__barsWidth = this.__canvasWidth / this.__bars;
                    // Setup animation frame ID for later use
                    this.__animRedrawId = undefined;
                    this.__shineOrientation = "Vertical";
                    this.callRender = this.render();
                    // Render one time after setting up variables
                    this.callRender();
                    // Render cyclically called from within itself
                    // See window.requestAnimationFrame(render) in the end of function definition
                    var _this = this;
                    // If the control is resized, re-render
                    this.__resizeEventDestroyEvent = TcHmi.EventProvider.register(this.__id + '.onResized', function (evt, data) {
                        data.__canvasWidth = data.__ctx.canvas.width = data.__elCanvas.getBoundingClientRect().width * data.__deviceDPI;
                        data.__canvasHeight = data.__ctx.canvas.height = data.__elCanvas.getBoundingClientRect().height * data.__deviceDPI;
                        data.__barsWidth = Math.ceil(data.__canvasWidth / data.__bars);
                        window.cancelAnimationFrame(data.__animRedrawId);
                        _this.callRender();
                    });
                }
                ;
                /**
                * @description Is called by tachcontrol() after the control instance is no longer part of the current DOM.
                * Is only allowed to be called from the framework itself!
                */
                __detach() {
                    super.__detach();
                    /**
                     * Disable everything which is not needed while the control is not part of the active dom.
                     * No need to listen to events for example!
                     */
                    null !== this.__resizeEventDestroyEvent && (this.__resizeEventDestroyEvent(),
                        this.__resizeEventDestroyEvent = null);
                }
                /**
                * @description Destroy the current control instance.
                * Will be called automatically if system destroys control!
                */
                destroy() {
                    /**
                    * While __keepAlive is set to true control must not be destroyed.
                    */
                    if (this.__keepAlive) {
                        return;
                    }
                    super.destroy();
                    /**
                    * Free resources like child controls etc.
                    */
                }
                setTotalOutput(value) {
                    let _convertedValue = TcHmi.ValueConverter.toNumber(value);
                    if (_convertedValue == null) {
                        return;
                    }
                    ;
                    if (this.__totalOutput != _convertedValue) {
                        this.__totalOutput = _convertedValue;
                        TcHmi.EventProvider.raise(this.getId() + '.onFunctionResultChanged', ['getTotalOutput']);
                        this.__processSpeed();
                    }
                    ;
                }
                getTotalOutput() {
                    return this.__totalOutput;
                }
                ;
                setSpeedRatio(value) {
                    let _convertedValue = TcHmi.ValueConverter.toNumber(value);
                    if (_convertedValue == null) {
                        return;
                    }
                    ;
                    if (this.__speedRatio != _convertedValue) {
                        if (_convertedValue > 0.1) {
                            _convertedValue = 0.1;
                        }
                        ;
                        if (_convertedValue < 0.0) {
                            _convertedValue = 0.0;
                        }
                        ;
                        this.__speedRatio = _convertedValue;
                        TcHmi.EventProvider.raise(this.getId() + '.onFunctionResultChanged', ['getSpeedRatio']);
                        this.__processSpeed();
                    }
                }
                ;
                getSpeedRatio() {
                    return this.__speedRatio;
                }
                ;
                __processSpeed() {
                    this.__speed = this.__totalOutput * this.__speedRatio;
                    if (!this.__animRedrawId && this.callRender) {
                        this.callRender();
                    }
                }
                ;
                setTotalBars(value) {
                    let _convertedValue = TcHmi.ValueConverter.toNumber(value);
                    if (_convertedValue == null) {
                        return;
                    }
                    let _safeConvertedValue = Math.abs(_convertedValue);
                    if (this.__bars != _safeConvertedValue) {
                        if (_safeConvertedValue > 20) {
                            _safeConvertedValue = 20;
                        }
                        ;
                        if (!_safeConvertedValue) {
                            _safeConvertedValue = 1;
                        }
                        ;
                        this.__bars = _safeConvertedValue;
                        this.__processBarsWidth();
                        TcHmi.EventProvider.raise(this.getId() + '.onFunctionResultChanged', ['getTotalBars']);
                    }
                }
                ;
                getTotalBars() {
                    return this.__bars;
                }
                __processBarsWidth() {
                    this.__barsWidth = Math.ceil(this.__canvasWidth / this.__bars);
                    if (!this.__animRedrawId && this.__isAttached) {
                        this.callRender();
                    }
                }
                ;
                setShine(value) {
                    this.__shine = value;
                    TcHmi.EventProvider.raise(this.getId() + '.onFunctionResultChanged', ['getShine']);
                    if (!this.__animRedrawId && this.__isAttached) {
                        this.callRender();
                    }
                }
                ;
                getShine() {
                    return this.__shine;
                }
                setBarAngle(value) {
                    this.__barAngle = value;
                    TcHmi.EventProvider.raise(this.getId() + '.onFunctionResultChanged', ['getBarAngle']);
                    if (!this.__animRedrawId && this.__isAttached) {
                        this.callRender();
                    }
                }
                ;
                getBarAngle() {
                    return this.__barAngle;
                }
                ;
                setColor1(value) {
                    this.__color1 = value.color;
                    TcHmi.EventProvider.raise(this.getId() + '.onFunctionResultChanged', ['getColor1']);
                    if (!this.__animRedrawId && this.__isAttached) {
                        this.callRender();
                    }
                }
                ;
                getColor1() {
                    return this.__color1;
                }
                ;
                setColor2(value) {
                    this.__color2 = value.color;
                    TcHmi.EventProvider.raise(this.getId() + '.onFunctionResultChanged', ['getColor2']);
                    if (!this.__animRedrawId && this.__isAttached) {
                        this.callRender();
                    }
                }
                ;
                getColor2() {
                    return this.__color2;
                }
                ;
                setShineOrientation(value) {
                    // TODO: Add in null checker
                    let _convertedValue = TcHmi.ValueConverter.toString(value);
                    if (_convertedValue == null) {
                        return;
                    }
                    this.__shineOrientation = _convertedValue;
                    TcHmi.EventProvider.raise(this.getId() + '.onFunctionResultChanged', ['getShineOrientation']);
                    if (!this.__animRedrawId && this.__isAttached) {
                        this.callRender();
                    }
                }
                ;
                getShineOrientation() {
                    return this.__shineOrientation;
                }
                render() {
                    var _this = this;
                    return function () {
                        var i;
                        _this.__ctx.clearRect(0, 0, _this.__canvasWidth, _this.__canvasHeight);
                        var __centerWidth = _this.__canvasWidth / 2;
                        var __centerHeight = _this.__canvasHeight / 2;
                        _this.__ctx.translate(__centerWidth, __centerHeight);
                        _this.__ctx.rotate(_this.__barAngle * Math.PI / 180);
                        if (Math.sign(_this.__speed) === 1) {
                            if (_this.__scrollVal >= _this.__canvasWidth * 2) {
                                _this.__scrollVal = _this.__scrollVal - _this.__barsWidth * (2 * Math.round(_this.__bars / 2));
                            }
                            _this.__scrollVal += _this.__speed;
                            for (i = -(_this.__bars * 4); i <= _this.__bars * 4; i++) {
                                _this.__ctx.beginPath();
                                _this.__ctx.strokeStyle = Math.floor(Math.abs(i) % 2) ? _this.__color1 : _this.__color2;
                                _this.__ctx.lineWidth = _this.__barsWidth;
                                _this.__ctx.lineCap = 'square';
                                _this.__ctx.moveTo(_this.__scrollVal + i * _this.__barsWidth + _this.__barsWidth / 2, -250);
                                _this.__ctx.lineTo(_this.__scrollVal + i * _this.__barsWidth + _this.__barsWidth / 2, _this.__canvasHeight);
                                _this.__ctx.stroke();
                            }
                        }
                        else if (Math.sign(_this.__speed) === -1) {
                            if (_this.__scrollVal < -(_this.__canvasWidth * 2)) {
                                _this.__scrollVal = _this.__scrollVal + _this.__barsWidth * (2 * Math.round(_this.__bars / 2));
                            }
                            _this.__scrollVal += _this.__speed;
                            for (i = -(_this.__bars * 4); i < _this.__bars * 4; i++) {
                                _this.__ctx.beginPath();
                                _this.__ctx.strokeStyle = Math.floor(Math.abs(i) % 2) ? _this.__color1 : _this.__color2;
                                _this.__ctx.lineWidth = _this.__barsWidth;
                                _this.__ctx.lineCap = 'square';
                                _this.__ctx.moveTo(_this.__scrollVal + i * _this.__barsWidth + _this.__barsWidth / 2, -250);
                                _this.__ctx.lineTo(_this.__scrollVal + i * _this.__barsWidth + _this.__barsWidth / 2, _this.__canvasHeight);
                                _this.__ctx.stroke();
                            }
                        }
                        else {
                            for (i = -(_this.__bars * 4); i < _this.__bars * 4; i++) {
                                _this.__ctx.beginPath();
                                _this.__ctx.strokeStyle = Math.floor(Math.abs(i) % 2) ? _this.__color1 : _this.__color2;
                                _this.__ctx.lineWidth = _this.__barsWidth;
                                _this.__ctx.lineCap = 'square';
                                _this.__ctx.moveTo(_this.__scrollVal + i * _this.__barsWidth + _this.__barsWidth / 2, -250);
                                _this.__ctx.lineTo(_this.__scrollVal + i * _this.__barsWidth + _this.__barsWidth / 2, _this.__canvasHeight);
                                _this.__ctx.stroke();
                            }
                        }
                        _this.__ctx.resetTransform();
                        if (_this.__shine) {
                            var grd;
                            switch (_this.__shineOrientation) {
                                case 'Vertical':
                                    grd = _this.__ctx.createLinearGradient(0, 0, _this.__canvasWidth, 0);
                                    break;
                                case 'Horizontal':
                                    grd = _this.__ctx.createLinearGradient(0, 0, 0, _this.__canvasHeight);
                                    break;
                                default:
                                    grd = _this.__ctx.createLinearGradient(0, 0, _this.__canvasWidth, 0);
                            }
                            grd.addColorStop(0, "rgba(0, 0, 0, 1)");
                            grd.addColorStop(0.3, "rgba(255, 255, 255, 0)");
                            grd.addColorStop(0.4, "rgba(255, 255, 255, 0.8)");
                            grd.addColorStop(0.6, "rgba(255, 255, 255, 0)");
                            grd.addColorStop(1, "rgba(0, 0, 0, 1)");
                            // Fill with gradient
                            _this.__ctx.fillStyle = grd;
                            _this.__ctx.fillRect(0, 0, _this.__canvasWidth, _this.__canvasHeight);
                        }
                        if (_this.__prevScrollVal !== _this.__scrollVal) {
                            _this.__animRedrawId = window.requestAnimationFrame(_this.callRender);
                        }
                        else {
                            window.cancelAnimationFrame(_this.__animRedrawId);
                            _this.__animRedrawId = undefined;
                        }
                        _this.__prevScrollVal = _this.__scrollVal;
                    };
                }
            }
            MotionIndicator.MotionIndicatorControl = MotionIndicatorControl;
        })(MotionIndicator = Controls.MotionIndicator || (Controls.MotionIndicator = {}));
        Controls.registerEx('MotionIndicatorControl', 'TcHmi.Controls.MotionIndicator', MotionIndicator.MotionIndicatorControl);
    })(Controls = TcHmi.Controls || (TcHmi.Controls = {}));
})(TcHmi || (TcHmi = {}));
//# sourceMappingURL=MotionIndicatorControl.js.map