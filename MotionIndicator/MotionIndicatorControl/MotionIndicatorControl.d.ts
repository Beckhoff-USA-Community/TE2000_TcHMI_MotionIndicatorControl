declare module TcHmi {
    module Controls {
        module MotionIndicator {
            class MotionIndicatorControl extends TcHmi.Controls.System.TcHmiControl {
                /**
                 * @description Constructor of the control
                 * @param {JQuery} element Element from HTML (internal, do not use)
                 * @param {JQuery} pcElement precompiled Element (internal, do not use)
                 * @param {TcHmi.Controls.ControlAttributeList} attrs Attributes defined in HTML in a special format (internal, do not use)
                 * @returns {void}
                 */
                constructor(element: JQuery, pcElement: JQuery, attrs: TcHmi.Controls.ControlAttributeList);
                protected __elementTemplateRoot: JQuery;
                protected __$Canvas: JQuery;
                protected __elCanvas: HTMLCanvasElement;
                private __canvasWidth;
                private __canvasHeight;
                private __scrollVal;
                private __prevScrollVal;
                private __barsWidth;
                private __animRedrawId;
                private __speedRatio;
                private __totalOutput;
                private __bars;
                private __shine;
                private __color1;
                private __color2;
                private __ctx;
                private __deviceDPI;
                private __shineOrientation;
                private __barAngle;
                private __speed;
                private __resizeEventDestroyEvent;
                private callRender;
                /**
                  * If raised, the control object exists in control cache and constructor of each inheritation level was called.
                  * Call attribute processor functions here to initialize default values!
                  */
                __previnit(): void;
                /**
                 * @description Is called during control initialize phase after attribute setter have been called based on it's default or initial html dom values.
                 * @returns {void}
                 */
                __init(): void;
                /**
                * @description Is called by tachcontrol() after the control instance gets part of the current DOM.
                * Is only allowed to be called from the framework itself!
                */
                __attach(): void;
                /**
                * @description Is called by tachcontrol() after the control instance is no longer part of the current DOM.
                * Is only allowed to be called from the framework itself!
                */
                __detach(): void;
                /**
                * @description Destroy the current control instance.
                * Will be called automatically if system destroys control!
                */
                destroy(): void;
                setTotalOutput(value: number): void;
                getTotalOutput(): number;
                setSpeedRatio(value: number): void;
                getSpeedRatio(): number;
                private __processSpeed;
                setTotalBars(value: number): void;
                getTotalBars(): number;
                private __processBarsWidth;
                setShine(value: string): void;
                getShine(): string;
                setBarAngle(value: number): void;
                getBarAngle(): number;
                setColor1(value: TcHmi.SolidColor): void;
                getColor1(): string;
                setColor2(value: TcHmi.SolidColor): void;
                getColor2(): string;
                setShineOrientation(value: string): void;
                getShineOrientation(): string;
                render(): () => void;
            }
        }
    }
}
