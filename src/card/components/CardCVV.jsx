/* @flow */
/** @jsx h */

import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';

import { getPostRobot } from '../../lib';
import { DEFAULT_PLACEHOLDERS } from '../constants';
import { checkCVV, removeNonDigits, defaultNavigation, defaultInputState, navigateOnKeyDown, exportMethods, getContext } from '../lib';
import type { CardType, CardCvvChangeEvent, CardNavigation, FieldValidity, InputState, InputEvent } from '../types';

type CardCvvProps = {|
    name : string,
    autocomplete? : string,
    type : string,
    state? : InputState,
    placeholder : string,
    style : Object,
    maxLength : string,
    cardType : CardType,
    navigation : CardNavigation,
    onChange : (cvvEvent : CardCvvChangeEvent) => void,
    onFocus : (event : InputEvent) => void,
    onBlur : (event : InputEvent) => void,
    allowNavigation : boolean,
    onValidityChange? : (numberValidity : FieldValidity) => void
|};


export function CardCVV(
    {
        name = 'cvv',
        autocomplete = 'cc-csc',
        navigation = defaultNavigation,
        allowNavigation = false,
        state,
        type,
        placeholder,
        style,
        maxLength,
        onChange,
        onFocus,
        onBlur,
        onValidityChange,
        cardType
    } : CardCvvProps
) : mixed {
    const [ inputState, setInputState ] : [ InputState, (InputState | InputState => InputState) => InputState ] = useState({ ...defaultInputState, ...state });
    const [ cvvMaxLength, setCvvMaxLength ] = useState(maxLength);
    const [ cvvPlaceholder, setCvvPlaceholder ] = useState(placeholder);
    const { inputValue, keyStrokeCount, isValid, isPotentiallyValid } = inputState;

    const cvvRef = useRef()

    useEffect(() => {
        if (!allowNavigation) {
            exportMethods(cvvRef);
        }
        // listen for card type changes
        const postRobot = getPostRobot();
        if (postRobot) {
            const context = getContext(window);
            postRobot.on('cardTypeChange', (event) => {
                const messageContext = getContext(event.source);
                if (messageContext === context) {
                    if ((placeholder === undefined || placeholder === DEFAULT_PLACEHOLDERS.cvv) && event.data.code?.name) {
                        setCvvPlaceholder(event.data.code.name);
                    }
                    if (event.data.code?.size) {
                        setCvvMaxLength(event.data.code.size);
                    }
                }
            });
        }
    }, []);

    useEffect(() => {
        const validity = checkCVV(inputValue, cardType);
        setInputState(newState => ({ ...newState, ...validity }));
    }, [ inputValue ]);

    useEffect(() => {
        if (typeof onValidityChange === 'function') {
            onValidityChange({ isValid, isPotentiallyValid });
        }
        if (allowNavigation && inputValue && isValid) {
            navigation.next();
        }
    }, [ isValid, isPotentiallyValid ]);

    const setCvvValue : (InputEvent) => void = (event : InputEvent) : void => {
        const { value : rawValue } = event.target;
        const value = removeNonDigits(rawValue);

        setInputState({
            ...inputState,
            inputValue:       value,
            maskedInputValue: value,
            keyStrokeCount:   keyStrokeCount + 1
        });

        onChange({ event, cardCvv: value  });
    };

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
            setInputState(newState => ({ ...newState, isPotentiallyValid: true }));
        }
    };

    const onBlurEvent : (InputEvent) => void = (event : InputEvent) : void => {
        if (typeof onBlur === 'function') {
            onBlur(event);
        }
        if (!isValid) {
            setInputState(newState => ({ ...newState, isPotentiallyValid: false }));
        }
    };

    return (
        <input
            name={ name }
            autocomplete={ autocomplete }
            inputmode='numeric'
            ref={ cvvRef }
            type={ type }
            className='cvv'
            placeholder={ cvvPlaceholder }
            value={ inputValue }
            style={ style }
            maxLength={ cvvMaxLength }
            onKeyDown={ onKeyDownEvent }
            onInput={ setCvvValue }
            onFocus={ onFocusEvent }
            onBlur={ onBlurEvent }
        />
    );
}
