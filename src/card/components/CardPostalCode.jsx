/* @flow */
/** @jsx h */

import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { defaultNavigation } from '../lib';

// import { checkName, defaultNavigation, defaultInputState, navigateOnKeyDown } from '../lib';
// import type { CardNameChangeEvent, CardNavigation, FieldValidity, InputState, InputEvent } from '../types';

// type CardPostalCodeProps = {|
//     name : string,
//     ref : () => void,
//     type : string,
//     state? : InputState,
//     className : string,
//     placeholder : string,
//     style : Object,
//     maxLength : string,
//     navigation : CardNavigation,
//     onChange : (nameEvent : CardNameChangeEvent) => void,
//     onFocus : (event : InputEvent) => void,
//     onBlur : (event : InputEvent) => void,
//     allowNavigation : boolean,
//     onValidityChange? : (numberValidity : FieldValidity) => void
// |};

export function CardPostalCode() : mixed {
    return (
    <input type="text" /> 
    )
}