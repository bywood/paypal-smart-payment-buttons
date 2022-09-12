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

    useEffect(() => {
        const element = expiryRef?.current;
        if (element.value) {
            const value = element.value 
            console.log('expiryRef value 1: ', expiryRef.current.value)
            if ((value.length > 0 && value[0] != "0" && value[0] != "1") || value[1] === "/"){
                console.log('setting pattern to 0 padded')
                restrictedInput.setPattern(ZERO_PADDED_EXPIRY_PATTERN)
                console.log("value", value)
            } else {
                console.log('setting pattern to default')
                restrictedInput.setPattern(DEFAULT_EXPIRY_PATTERN)
                console.log("value", value)
            }
            console.log('expiryRef value 2: ', expiryRef.current.value)
            setInputState({
                ...inputState,
                inputValue: restrictedInput.getUnformattedValue(),
                maskedInputValue: expiryRef.current.value
            });
            console.log('expiryRef value 3: ', expiryRef.current.value)
            console.log("maskedInputValue: ", maskedInputValue)
            // onChange({event, date: value, maskedDate: value});
        }
    }, [inputValue]);

   

    const formatExpiryDate : (InputEvent) => void = (event: InputEvent) : void => {
    }

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
            value={ maskedInputValue }
            style={ style }
            maxLength= { maxLength }
            // onInput= { formatExpiryDate }
            onKeyDown={ onKeyDownEvent }
            onFocus={ onFocusEvent }
            onBlur={ onBlurEvent }
            onPaste={ onPasteEvent }
            { ...attributes }
        />
    );
}
