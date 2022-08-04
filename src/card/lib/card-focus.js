/* @flow */

import { noop } from '@krakenjs/belter';

import type { CardNavigation, InputEvent } from '../types';

export const defaultNavigation : CardNavigation = {
    next:     () => noop,
    previous: () => noop
};

// Move cursor within a field
export function moveCursor(element : HTMLInputElement, start : number, end? : number) : void {
    window.requestAnimationFrame(() => {
        element.selectionStart = start;
        element.selectionEnd = end ?? start;
    });
}

// Navigation helper to go to the next field putting the cursor at the start
export function goToNextField(ref : {| current : {| base : HTMLInputElement |} |}) : () => void {
    return () => {
        moveCursor(ref.current.base, 0);
        setTimeout(() => ref.current.base.focus());
    };
}

// Navigation helper to go to the previous field putting the curser at the end
export function goToPreviousField(ref : {| current : {| base : HTMLInputElement |} |}) : () => void {
    return () => {
        const { value } = ref.current.base;

        if (value) {
            const valueLength = value.length;
            moveCursor(ref.current.base, valueLength);
        }
        setTimeout(() => ref.current.base.focus());
    };
}

// Navigate between fields using the arrow keys and/or the backspace
export function navigateOnKeyDown(event : InputEvent, navigation : CardNavigation) : void {
    const { target: { value, selectionStart, selectionEnd }, key } = event;

    if (selectionStart === 0 && (value.length === 0 || value.length !== selectionEnd)  && [ 'Backspace', 'ArrowLeft' ].includes(key)) {
        navigation.previous();
    }

    if (selectionStart === value.length && [ 'ArrowRight' ].includes(key)) {
        navigation.next();
    }
}

// Safari (both iOS and Desktop) has an unconvential behavior,
// where it won't let an iframe that includes an input get
// focus programatically from outisde of the input.
// Big props to the devs at Stripe that figured out
// you run this selection range hack to force the focus back
// onto the input.
function applyFocusWorkaroundForSafari (input : HTMLInputElement) {
    const inputIsEmptyInitially = input.value === '';

    // Safari can't set selection if the input is empty
    if (inputIsEmptyInitially) {
        input.value = ' ';
    }

    const start = input.selectionStart;
    const end = input.selectionEnd;

    input.setSelectionRange(0, 0);
    input.setSelectionRange(start, end);

    if (inputIsEmptyInitially) {
        input.value = '';
    }
}

export function autoFocusOnFirstInput(input? : HTMLInputElement) {
    if (!input) {
        return;
    }

    let timeoutID = null;

    window.addEventListener('focus', () => {
        // the set timeout is required here, because in some browsers (Firefox, for instance)
        // when tabbing backward into the iframe, it will have the html element focussed
        // initially, but then passes focus to the input
        timeoutID = setTimeout(() => {
            timeoutID = null;

            applyFocusWorkaroundForSafari(input);

            // for Safari, setting the selection range is enough to give
            // it focus, but Firefox requires an explicit focus call.
            // Also, just calling `focus` on Safari does not work at all
            input.focus();
        }, 1);
    });

    window.addEventListener('focusin', (event) => {
        if (timeoutID && event.target instanceof HTMLInputElement) {
            clearTimeout(timeoutID);
            timeoutID = null;
        }
    });
}
