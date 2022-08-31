/* @flow */
/** @jsx h */

import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import cardValidator from 'card-validator';
import RestrictedInput from 'restricted-input';

import {
    defaultNavigation,
    defaultInputState,
    navigateOnKeyDown,
    exportMethods
} from '../lib';
import type { CardExpiryChangeEvent, CardNavigation, FieldValidity, InputState, InputEvent } from '../types';

type CardExpiryProps = {|
    name : string,
    autocomplete? : string,
    type : string,
    state? : InputState,
    placeholder : string,
    style : Object,
    maxLength : string,
    navigation : CardNavigation,
    allowNavigation : boolean,
    onChange : (expiryEvent : CardExpiryChangeEvent) => void,
    onFocus? : (event : InputEvent) => void,
    onBlur? : (event : InputEvent) => void,
    onValidityChange? : (numberValidity : FieldValidity) => void
|};


export function CardExpiry(
    {
        name = 'expiry',
        autocomplete = 'cc-exp',
        navigation = defaultNavigation,
        state,
        type,
        placeholder,
        style,
        maxLength,
        onChange,
        onFocus,
        onBlur,
        onValidityChange,
        allowNavigation = false
    } : CardExpiryProps
) : mixed {
    const [ attributes, setAttributes ] : [ Object, (Object) => Object ] = useState({ placeholder });
    const [ inputState, setInputState ] : [ InputState, (InputState | (InputState) => InputState) => InputState ] = useState({ ...defaultInputState, ...state });
    const { inputValue, maskedInputValue, isValid, isPotentiallyValid } = inputState;

    const expiryRef = useRef()

    useEffect(() => {
        if (!allowNavigation) {
            exportMethods(expiryRef, setAttributes);
        }
        const element = expiryRef?.current;
        if (element) {
            // eslint-disable-next-line no-unused-vars
            const restrictedInput = new RestrictedInput({
                element,
                pattern: "{{99}} / {{99}}",
            });
            element.addEventListener('input', (event) => {
                const { value } = event.target;
                setInputState({
                    ...inputState,
                    inputValue: value
                });
                onChange({ event, date: value, maskedDate: value });
            });
        }
    }, []);

    useEffect(() => {
        const validity = cardValidator.expirationDate(inputValue);
        setInputState(newState => ({ ...newState, ...validity }));
    }, [ inputValue, maskedInputValue ]);

    useEffect(() => {
        if (typeof onValidityChange === 'function') {
            onValidityChange({ isValid, isPotentiallyValid });
        }

        if (allowNavigation && maskedInputValue && isValid) {
            navigation.next();
        }
    }, [ isValid, isPotentiallyValid ]);

    const onKeyDownEvent : (InputEvent) => void = (event : InputEvent) : void => {
        if (allowNavigation) {
            navigateOnKeyDown(event, navigation);
        }
    };

    const onFocusEvent : (InputEvent) => void = (event : InputEvent) : void => {
        if (typeof onFocus === 'function') {
            onFocus(event);
        }
        if (!isValid) {
            setInputState((newState) => ({ ...newState, isPotentiallyValid: true }));
        }
    };

    const onBlurEvent : (InputEvent) => void = (event : InputEvent) : void => {
        if (typeof onBlur === 'function') {
            onBlur(event);
        }
        if (!isValid) {
            setInputState((newState) => ({ ...newState, isPotentiallyValid: false, contentPasted: false }));
        }
    };

    const onPasteEvent : (InputEvent) => void = () : void => {
        setInputState((newState) => ({ ...newState,  contentPasted: true }));
    };

    return (
        <input
            name={ name }
            autocomplete={ autocomplete }
            inputmode='numeric'
            ref={ expiryRef }
            type={ type }
            className='card-field-expiry'
            value={ inputValue }
            style={ style }
            maxLength={ maxLength }
            onKeyDown={ onKeyDownEvent }
            onFocus={ onFocusEvent }
            onBlur={ onBlurEvent }
            onPaste={ onPasteEvent }
            { ...attributes }
        />
    );
}
