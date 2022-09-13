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
    exportMethods,
    shouldUseZeroPaddedExpiryPattern
} from '../lib';
import type { CardExpiryChangeEvent, CardNavigation, FieldValidity, InputState, InputEvent } from '../types';
import { DEFAULT_EXPIRY_PATTERN, ZERO_PADDED_EXPIRY_PATTERN } from '../constants';

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
    const [restrictedInput, setRestrictedInput] : [Object, (Object) => Object] = useState({})

    const expiryRef = useRef()

    useEffect(() => {
        if (!allowNavigation) {
            exportMethods(expiryRef, setAttributes);
        }
        const element = expiryRef?.current
        if (element) {
           const restrictedInput = new RestrictedInput({
            element,
            pattern: DEFAULT_EXPIRY_PATTERN
           }) ;
           setRestrictedInput(restrictedInput)
        }
    }, []);
            
    useEffect(() => {
        const validity = cardValidator.expirationDate(maskedInputValue);
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

    const formatExpiryDate : (InputEvent) => void = (event: InputEvent) : void => {
        const value = event.target.value
        console.log('Value from event target', value)
        console.log("Input value before padding check: ", expiryRef.current.value)
        if(!value.includes("/")) {
            if (shouldUseZeroPaddedExpiryPattern(value, event.key)) {
                restrictedInput.setPattern(ZERO_PADDED_EXPIRY_PATTERN)
            } else {
                restrictedInput.setPattern(DEFAULT_EXPIRY_PATTERN)
            }
        }
        console.log("Input value after padding check: ", expiryRef.current.value)
        setInputState({
            ...inputState,
            inputValue: restrictedInput.getUnformattedValue(),
            maskedInputValue: expiryRef.current.value
        });
        console.log("--------------------")
        // onChange({event, date: expiryRef.current.value, maskedDate: expiryRef.current.value});
    }

    const onKeyDownEvent : (InputEvent) => void = (event : InputEvent) : void => {
        if (allowNavigation) {
            navigateOnKeyDown(event, navigation);
        }
        // formatExpiryDate(event)
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
            // value={ inputState.maskedInputValue }
            style={ style }
            maxLength= { maxLength }
            onKeyUp= { formatExpiryDate }
            onKeyDown={ onKeyDownEvent }
            onFocus={ onFocusEvent }
            onBlur={ onBlurEvent }
            onPaste={ onPasteEvent }
            { ...attributes }
        />
    );
}
