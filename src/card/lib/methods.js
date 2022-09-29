/* @flow */

import { isValidAttribute } from './card-utils';

export function exportMethods(ref : Object, setAttributes : Function, setInputState? : Function, ariaMessageRef: Object) : void {
    window.xprops.export({
        setAttribute: (name, value) => {
            if (isValidAttribute(name)) {
                setAttributes((currentAttributes) => {
                    return {
                        ...currentAttributes,
                        [name]: value
                    }
                });
            }
        },
        removeAttribute: (name) => {
            if (isValidAttribute(name)) {
                setAttributes((currentAttributes) => {
                    return {
                        ...currentAttributes,
                        [name]: ''
                    }
                });
            }
        },
        addClass: (name) => {
            ref?.current?.classList.add(name);
        },
        removeClass: (name) => {
            ref?.current?.classList.remove(name);
        },
        clear: () => {
            if (ref && ref.current && typeof setInputState === 'function') {
                setInputState((currentInputState) => {
                    return {
                        ...currentInputState,
                        inputValue: ''
                    }
                })
            }
        },
        focus: () => {
            ref?.current?.focus();
        },
        setMessage: (message) => {
            ariaMessageRef.current.innerText = message
        }
    });
};
