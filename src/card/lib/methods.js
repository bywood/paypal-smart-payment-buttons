/* @flow */

import { isValidAttribute } from './card-utils';

export function exportMethods(ref : Object) : void {
    window.xprops.export({
        setAttribute: (name, value) => {
            if (isValidAttribute(name)) {
                ref?.current?.setAttribute(name, value);
            }
        },
        removeAttribute: (name) => {
            if (isValidAttribute(name)) {
                ref?.current?.removeAttribute(name);
            }
        }
    });
};
