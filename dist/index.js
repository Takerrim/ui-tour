import { createPopper } from '@popperjs/core';
import { BoxOverlay } from '@spbweb/box-overlay';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

const defaultRender = ({ root, next, prev, stop, isFirst, isLast, isFirstRender, data, }) => {
    if (!isFirstRender) {
        const nextButton = root.querySelector('.tour-next-button');
        const prevButton = root.querySelector('.tour-prev-button');
        const content = root.querySelector('.tour-content-text');
        if (prevButton instanceof HTMLElement) {
            prevButton.onclick = prev;
            if (isFirst) {
                prevButton.setAttribute('disabled', 'disabled');
            }
            else {
                prevButton.removeAttribute('disabled');
            }
        }
        if (nextButton instanceof HTMLElement) {
            nextButton.onclick = next;
            if (isLast) {
                nextButton.setAttribute('disabled', 'disabled');
            }
            else {
                nextButton.removeAttribute('disabled');
            }
        }
        if (content instanceof HTMLElement) {
            content.innerHTML = data.toString();
        }
        return;
    }
    const nextButton = document.createElement('button');
    nextButton.innerText = 'Next';
    nextButton.classList.add('tour-next-button');
    if (isLast) {
        nextButton.setAttribute('disabled', 'disabled');
    }
    else {
        nextButton.onclick = () => next();
    }
    const prevButton = document.createElement('button');
    prevButton.innerText = 'Prev';
    prevButton.classList.add('tour-prev-button');
    if (isFirst) {
        prevButton.setAttribute('disabled', 'disabled');
    }
    else {
        prevButton.onclick = () => prev();
    }
    const stopButton = document.createElement('button');
    stopButton.innerText = 'stop';
    stopButton.onclick = stop;
    const content = document.createElement('div');
    content.classList.add('tour-content-text');
    content.innerText = data.toString();
    root.appendChild(content);
    root.appendChild(stopButton);
    root.appendChild(nextButton);
    root.appendChild(prevButton);
};

class Tour {
    constructor() {
        this.steps = [];
        this.currentStepIndex = 0;
        this.popperElement = document.createElement('div');
        this.popperInstance = null;
        this.isFirstRender = true;
        this.goToStepPromise = Promise.resolve();
        this.started = false;
        this.handleUpdateRect = () => {
            if (!this.popperInstance) {
                throw new Error('popperInstance is nil');
            }
            this.popperInstance.forceUpdate();
        };
        this.box = new BoxOverlay(this.handleUpdateRect);
    }
    isStarted() {
        return this.started;
    }
    add(step) {
        this.steps.push(step);
    }
    remove(step) {
        this.steps.push(step);
    }
    clear() {
        this.steps = [];
    }
    start(stepIndex = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.started) {
                console.warn('[UiTour]: tour already started');
                return;
            }
            this.isFirstRender = true;
            this.started = true;
            this.appendPopper();
            this.box.start();
            yield this.goToStep(stepIndex);
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.started) {
                console.warn('[UiTour]: tour already stoped');
                return;
            }
            this.started = false;
            yield this.goToStepPromise;
            this.popperElement.innerHTML = '';
            this.removePopper();
            this.box.stop();
            this.box.clear();
        });
    }
    appendPopper() {
        const { overlay } = this.box;
        this.popperInstance = createPopper(overlay.getElement(), this.popperElement, {
            modifiers: [
                {
                    name: 'addZIndex',
                    enabled: true,
                    phase: 'write',
                    fn({ state }) {
                        state.elements.popper.style.setProperty('z-index', `${overlay.zIndex + 2}`);
                    },
                }
            ]
        });
        document.body.appendChild(this.popperElement);
    }
    removePopper() {
        const { popperInstance, popperElement } = this;
        const { body } = document;
        if (popperInstance) {
            popperInstance.destroy();
        }
        if (popperElement.parentElement === body) {
            body.removeChild(popperElement);
        }
    }
    getPopperOptions(step) {
        return Object.assign({}, step.popperOptions || {});
    }
    goToStep(stepIndex) {
        const { steps } = this;
        const { length } = steps;
        // Check step index [BEGIN]
        if (stepIndex < 0 || stepIndex >= length) {
            throw new Error('[UiTour]: stepIndex go outside the range of the steps array'
                + `\n steps length is ${length}; stepIndex is ${stepIndex}`);
        }
        // Check step index [END]
        this.goToStepPromise = (() => __awaiter(this, void 0, void 0, function* () {
            try {
                // Waiting for the previous step to complete
                yield this.goToStepPromise;
                this.currentStepIndex = stepIndex;
                const step = steps[stepIndex];
                const { popperInstance: popper } = this;
                if (!popper) {
                    throw new Error('this.popperInstance is nil');
                }
                // Call steps middleware
                if (step.before) {
                    yield step.before({
                        step,
                        popper
                    });
                }
                const render = step.render ? step.render : defaultRender;
                popper.setOptions(this.getPopperOptions(step));
                // Render popup content
                render({
                    root: this.popperElement,
                    isFirst: stepIndex === 0,
                    isLast: stepIndex === this.steps.length - 1,
                    isFirstRender: this.isFirstRender,
                    data: step.data,
                    steps,
                    stepIndex,
                    next: () => __awaiter(this, void 0, void 0, function* () {
                        this.currentStepIndex = stepIndex + 1;
                        yield this.goToStep(this.currentStepIndex);
                    }),
                    prev: () => __awaiter(this, void 0, void 0, function* () {
                        this.currentStepIndex = stepIndex - 1;
                        yield this.goToStep(this.currentStepIndex);
                    }),
                    stop: () => this.stop(),
                });
                this.isFirstRender = false;
                popper.forceUpdate();
                this.box.clear();
                step.elements.forEach(element => this.box.add(element));
            }
            catch (error) {
                console.error(error);
            }
        }))();
        return this.goToStepPromise;
    }
}

export { Tour };