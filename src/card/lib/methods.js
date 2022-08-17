/* @flow */

import { isValidAttribute } from './card-utils';

export function exportMethods(ref : Object, setAttributes : Function) : void {
    window.xprops.export({
        setAttribute: (key, value) => {
            if (isValidAttribute(key)) {
                setAttributes((currentAttributes) => {
                    return {
                        ...currentAttributes,
                        [key]: value
                    }
                });
            }
        },
        removeAttribute: (key) => {
            if (isValidAttribute(key)) {
                setAttributes((currentAttributes) => {
                    return {
                        ...currentAttributes,
                        [key]: ''
                    }
                });
            }
        },
        addClass: (name) => {
            ref?.current?.classList.add(name);
        },
        removeClass: (name) => {
            ref?.current?.classList.remove(name);
        }
    });
};
