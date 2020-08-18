import { Instance as PopperInstance } from '@popperjs/core';
import { BoxOverlay } from '@spbweb/box-overlay';
export declare type TourStepRenderParams<D, T> = {
    root: Element;
    next: () => Promise<void>;
    prev: () => Promise<void>;
    stop: () => Promise<void>;
    isFirst: boolean;
    isLast: boolean;
    isFirstRender: boolean;
    data: D;
    steps: T;
    stepIndex: number;
};
export declare type TourStepBeforeParams<T> = {
    step: T;
    popper: PopperInstance;
};
export declare type TourStepBefore<T> = (params: TourStepBeforeParams<T>) => Promise<void>;
export declare type TourStepRender<D, T> = (params: TourStepRenderParams<D, T>) => void;
export interface TourStep<T> {
    render?: TourStepRender<this['data'], any[]>;
    before?: TourStepBefore<this>;
    elements: (string | Element)[];
    data: T;
    popperOptions?: Parameters<PopperInstance['setOptions']>[0];
}
export declare class Tour {
    box: BoxOverlay;
    private steps;
    private currentStepIndex;
    private popperElement;
    private popperInstance;
    private isFirstRender;
    private goToStepPromise;
    private started;
    constructor();
    isStarted(): boolean;
    add<T>(step: TourStep<T>): void;
    remove(step: TourStep<any>): void;
    clear(): void;
    start(stepIndex?: number): Promise<void>;
    stop(): Promise<void>;
    private appendPopper;
    private removePopper;
    private getPopperOptions;
    private goToStep;
    private handleUpdateRect;
}