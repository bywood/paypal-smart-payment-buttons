/* @flow */
/** @jsx h */

import { h, Fragment } from 'preact';
import { noop } from '@krakenjs/belter';
import { useState, useEffect, useRef } from 'preact/hooks';

import {
    setErrors,
    getCvvLength,
    initFieldValidity,
    goToNextField,
    goToPreviousField,
    convertDateFormat,
    getCSSText
} from '../lib';
import type {
    CardStyle,
    Card,
    CardNumberChangeEvent,
    CardExpiryChangeEvent,
    CardCvvChangeEvent,
    CardNameChangeEvent,
    FieldValidity,
    CardNavigation,
    CardType
} from '../types';
import {
    CARD_ERRORS,
    DEFAULT_STYLE,
    DEFAULT_CARD_TYPE,
    DEFAULT_PLACEHOLDERS,
    CARD_FIELD_TYPE
} from '../constants';

import { CardNumber } from './CardNumber';
import { CardExpiry } from './CardExpiry';
import { CardCVV } from './CardCVV';
import { CardName } from './CardName';


type CardFieldProps = {|
    cspNonce : string,
    onChange : ({| value : Card, valid : boolean, errors : [$Values<typeof CARD_ERRORS>] | [] |}) => void,
    styleObject : CardStyle,
    placeholder : {| number? : string, expiry? : string, cvv? : string  |},
    autocomplete? : string,
    gqlErrorsObject : {| field : string, errors : [] |}
|};

export function CardField({ cspNonce, onChange, styleObject = {}, placeholder = {}, gqlErrorsObject = {}, autocomplete } : CardFieldProps) : mixed {
    const [ cssText, setCSSText ] : [ string, (string) => string ] = useState('');
    const [ number, setNumber ] : [ string, (string) => string ] = useState('');
    const [ cvv, setCvv ] : [ string, (string) => string ] = useState('');
    const [ expiry, setExpiry ] : [ string, (string) => string ] = useState('');
    const [ isValid, setIsValid ] : [ boolean, (boolean) => boolean ] = useState(true);
    const [ validationMessage, setValidationMessage ] : [ string, (string) => string ] = useState('');
    const [ numberValidity, setNumberValidity ] : [ FieldValidity, (FieldValidity) => FieldValidity ] = useState(initFieldValidity);
    const [ expiryValidity, setExpiryValidity ] : [ FieldValidity, (FieldValidity) => FieldValidity ] = useState(initFieldValidity);
    const [ cvvValidity, setCvvValidity ] : [ FieldValidity, (FieldValidity) => FieldValidity ] = useState(initFieldValidity);
    const [ cardType, setCardType ] : [ CardType, (CardType) => CardType ] = useState(DEFAULT_CARD_TYPE);
    const numberRef = useRef();
    const expiryRef = useRef();
    const cvvRef = useRef();

    const cardNumberNavivation : CardNavigation = { next: goToNextField(expiryRef), previous: () => noop };
    const cardExpiryNavivation : CardNavigation = { next: goToNextField(cvvRef), previous: goToPreviousField(numberRef) };
    const cardCvvNavivation : CardNavigation = { next:     () =>  noop, previous: goToPreviousField(expiryRef) };

    function getValidationMessage() : string {
        if (!numberValidity.isPotentiallyValid && !numberValidity.isValid) {
            return 'This card number is not valid.';
        }
        if (!expiryValidity.isPotentiallyValid && !expiryValidity.isValid) {
            return 'This expiration date is not valid.';
        }
        if (!cvvValidity.isPotentiallyValid && !cvvValidity.isValid) {
            return 'This security code is not valid.';
        }
        return '';
    }

    useEffect(() => {
        setCSSText(getCSSText(DEFAULT_STYLE, styleObject));
    }, [ styleObject ]);

    useEffect(() => {
        const { field, errors } = gqlErrorsObject;

        if (field === CARD_FIELD_TYPE.NUMBER) {
            const hasGQLErrors = errors.length > 0;
            if (hasGQLErrors) {
                setNumberValidity({ isPotentiallyValid: false, isValid: false });
            }
        }

        if (field === CARD_FIELD_TYPE.EXPIRY) {
            const hasGQLErrors = errors.length > 0;
            if (hasGQLErrors) {
                setExpiryValidity({ isPotentiallyValid: false, isValid: false });
            }
        }

        if (field === CARD_FIELD_TYPE.CVV) {
            const hasGQLErrors = errors.length > 0;
            if (hasGQLErrors) {
                setCvvValidity({ isPotentiallyValid: false, isValid: false });
            }
        }
    }, [ gqlErrorsObject ]);
   
    useEffect(() => {

        setValidationMessage(getValidationMessage());

        const valid = Boolean(numberValidity.isValid && cvvValidity.isValid && expiryValidity.isValid);

        setIsValid(valid);

        const errors = setErrors({ isNumberValid: numberValidity.isValid, isCvvValid: cvvValidity.isValid, isExpiryValid: expiryValidity.isValid, gqlErrorsObject });

        onChange({ value: { number, cvv, expiry }, valid, errors });

    }, [
        number,
        cvv,
        expiry,
        isValid,
        numberValidity,
        cvvValidity,
        expiryValidity,
        cardType
    ]);

    const onChangeNumber : (CardNumberChangeEvent) => void = ({ cardNumber, cardType : type } : CardNumberChangeEvent) : void => {
        setNumber(cardNumber);
        setCardType({ ...type });
    };

    return (
        <Fragment>
            <style nonce={ cspNonce }>
                { cssText }
            </style>
            <div className={ `card-field ${ !validationMessage.length ? '' : 'invalid' }` }>
                <CardNumber
                    ref={ numberRef }
                    autocomplete={ autocomplete }
                    navigation={ cardNumberNavivation }
                    type='text'
                    // eslint-disable-next-line react/forbid-component-props
                    className={ `number ${ numberValidity.isPotentiallyValid || numberValidity.isValid ? 'valid' : 'invalid' }` }
                    allowNavigation={ true }
                    placeholder={ placeholder.number ?? DEFAULT_PLACEHOLDERS.number }
                    maxLength='24'
                    onChange={ onChangeNumber }
                    onValidityChange={ (validity : FieldValidity) => setNumberValidity({ ...validity }) }
                />
                <CardExpiry
                    ref={ expiryRef }
                    autocomplete={ autocomplete }
                    navigation={ cardExpiryNavivation }
                    type='text'
                    // eslint-disable-next-line react/forbid-component-props
                    className={ `expiry ${ expiryValidity.isPotentiallyValid || expiryValidity.isValid ? 'valid' : 'invalid' }` }
                    allowNavigation={ true }
                    placeholder={ placeholder.expiry ?? DEFAULT_PLACEHOLDERS.expiry }
                    maxLength='7'
                    onChange={ ({ maskedDate } : CardExpiryChangeEvent) => setExpiry(convertDateFormat(maskedDate)) }
                    onValidityChange={ (validity : FieldValidity) => setExpiryValidity({ ...validity }) }
                />
                <CardCVV
                    ref={ cvvRef }
                    autocomplete={ autocomplete }
                    navigation={ cardCvvNavivation }
                    type='text'
                    cardType={ cardType }
                    // eslint-disable-next-line react/forbid-component-props
                    className={ `cvv ${ cvvValidity.isPotentiallyValid || cvvValidity.isValid ? 'valid' : 'invalid' }` }
                    allowNavigation={ true }
                    placeholder={ placeholder.cvv ?? DEFAULT_PLACEHOLDERS.cvv }
                    maxLength={ getCvvLength(cardType) }
                    onChange={ ({ cardCvv } : CardCvvChangeEvent) => setCvv(cardCvv) }
                    onValidityChange={ (validity : FieldValidity) => setCvvValidity({ ...validity }) }
                />
            </div>
            <ValidationMessage message={ validationMessage } />
        </Fragment>
    );
}

export function ValidationMessage({ message } : Object) : mixed {
    return (
        <div className={ `card-field-validation-error ${ message.length ? '' : 'hidden' }` }>
            <svg width="21" height="18" viewBox="0 0 21 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.1399 14.3401L12.5499 1.20007C11.6299 -0.389932 9.32989 -0.389932 8.40989 1.20007L0.81989 14.3401C-0.10011 15.9301 1.04989 17.9301 2.88989 17.9301H18.0699C19.9099 17.9301 21.0599 15.9301 20.1399 14.3401ZM9.75989 4.91007H11.2099C11.4699 4.91007 11.6799 5.16007 11.6599 5.44007L11.1599 10.9701C11.1499 11.1201 11.0299 11.2401 10.8899 11.2401H10.1099C9.96989 11.2401 9.84989 11.1201 9.83989 10.9701L9.30989 5.45007C9.28989 5.16007 9.48989 4.91007 9.75989 4.91007ZM10.4899 15.1001C9.84989 15.1001 9.31989 14.5801 9.31989 13.9301C9.31989 13.2901 9.84989 12.7601 10.4899 12.7601C11.1399 12.7601 11.6599 13.2901 11.6599 13.9301C11.6599 14.5801 11.1399 15.1001 10.4899 15.1001Z" fill="#515354"/>
            </svg>
            { message }
        </div>
    );
}

type CardNumberFieldProps = {|
    cspNonce : string,
    onChange : ({| value : string, valid : boolean, errors : [$Values<typeof CARD_ERRORS>] | [] |}) => void,
    styleObject : CardStyle,
    placeholder : {| number? : string, expiry? : string, cvv? : string, name? : string  |},
    autoFocusRef : (mixed) => void,
    autocomplete? : string,
    gqlErrors : []
|};

export function CardNumberField({ cspNonce, onChange, styleObject = {}, placeholder = {}, autoFocusRef, autocomplete, gqlErrors = [] } : CardNumberFieldProps) : mixed {
    const [ cssText, setCSSText ] : [ string, (string) => string ] = useState('');
    const [ number, setNumber ] : [ string, (string) => string ] = useState('');
    const [ numberValidity, setNumberValidity ] : [ FieldValidity, (FieldValidity) => FieldValidity ] = useState(initFieldValidity);
    const numberRef = useRef();

    const { isValid, isPotentiallyValid } = numberValidity;

    useEffect(() => {
        autoFocusRef(numberRef);
    }, []);

    useEffect(() => {
        setCSSText(getCSSText(DEFAULT_STYLE, styleObject));
    }, [ styleObject ]);

    useEffect(() => {
        const hasGQLErrors = gqlErrors.length > 0;
        if (hasGQLErrors) {
            setNumberValidity({ isPotentiallyValid: false, isValid: false });
        }
    }, [ gqlErrors ]);

    useEffect(() => {
        const errors = setErrors({ isNumberValid: numberValidity.isValid, gqlErrorsObject: { field: CARD_FIELD_TYPE.NUMBER, errors: gqlErrors } });
        onChange({ value: number, valid: numberValidity.isValid, errors });
    }, [ number, isValid, isPotentiallyValid ]);

    return (
        <Fragment>
            <script nonce={ cspNonce }>
                { cssText }
            </script>
            <CardNumber
                ref={ numberRef }
                type='text'
                autocomplete={ autocomplete }
                // eslint-disable-next-line react/forbid-component-props
                className={ `number ${ numberValidity.isPotentiallyValid || numberValidity.isValid ? 'valid' : 'invalid' }` }
                placeholder={ placeholder.number ?? DEFAULT_PLACEHOLDERS.number }
                maxLength='24'
                onChange={ ({ cardNumber } : CardNumberChangeEvent) => setNumber(cardNumber) }
                onValidityChange={ (validity : FieldValidity) => setNumberValidity(validity) }
            />
        </Fragment>
    );
}

type CardExpiryFieldProps = {|
    cspNonce : string,
    onChange : ({| value : string, valid : boolean, errors : [$Values<typeof CARD_ERRORS>] | [] |}) => void,
    styleObject : CardStyle,
    placeholder : {| number? : string, expiry? : string, cvv? : string, name? : string  |},
    autoFocusRef : (mixed) => void,
    autocomplete? : string,
    gqlErrors : []
|};

export function CardExpiryField({ cspNonce, onChange, styleObject = {}, placeholder = {}, autoFocusRef, autocomplete, gqlErrors = [] } : CardExpiryFieldProps) : mixed {
    const [ cssText, setCSSText ] : [ string, (string) => string ] = useState('');
    const [ expiry, setExpiry ] : [ string, (string) => string ] = useState('');
    const [ expiryValidity, setExpiryValidity ] : [ FieldValidity, (FieldValidity) => FieldValidity ] = useState(initFieldValidity);
    const expiryRef = useRef();

    const { isValid, isPotentiallyValid } = expiryValidity;

    useEffect(() => {
        autoFocusRef(expiryRef);
    }, []);

    useEffect(() => {
        setCSSText(getCSSText(DEFAULT_STYLE, styleObject));
    }, [ styleObject ]);

    useEffect(() => {
        const hasGQLErrors = gqlErrors.length > 0;
        if (hasGQLErrors) {
            setExpiryValidity({ isPotentiallyValid: false, isValid: false });
        }
    }, [ gqlErrors ]);
    
    useEffect(() => {
        const errors = setErrors({ isExpiryValid: expiryValidity.isValid });

        onChange({ value: expiry, valid: expiryValidity.isValid, errors });
    }, [ expiry, isValid, isPotentiallyValid ]);

    return (
        <Fragment>
            <script nonce={ cspNonce }>
                { cssText }
            </script>
            <CardExpiry
                ref={ expiryRef }
                type='text'
                autocomplete={ autocomplete }
                // eslint-disable-next-line react/forbid-component-props
                className={ `expiry ${ expiryValidity.isPotentiallyValid || expiryValidity.isValid ? 'valid' : 'invalid' }` }
                placeholder={ placeholder.expiry ?? DEFAULT_PLACEHOLDERS.expiry }
                maxLength='7'
                onChange={ ({ maskedDate } : CardExpiryChangeEvent) => setExpiry(convertDateFormat(maskedDate)) }
                onValidityChange={ (validity : FieldValidity) => setExpiryValidity(validity) }
            />
        </Fragment>
    );
}
type CardCvvFieldProps = {|
    cspNonce : string,
    onChange : ({| value : string, valid : boolean, errors : [$Values<typeof CARD_ERRORS>] | [] |}) => void,
    styleObject : CardStyle,
    placeholder : {| number? : string, expiry? : string, cvv? : string, name? : string  |},
    autoFocusRef : (mixed) => void,
    autocomplete? : string,
    gqlErrors : []
|};

export function CardCVVField({ cspNonce, onChange, styleObject = {}, placeholder = {}, autoFocusRef, autocomplete, gqlErrors = [] } : CardCvvFieldProps) : mixed {
    const [ cssText, setCSSText ] : [ string, (string) => string ] = useState('');
    const [ cvv, setCvv ] : [ string, (string) => string ] = useState('');
    const [ cvvValidity, setCvvValidity ] : [ FieldValidity, (FieldValidity) => FieldValidity ] = useState(initFieldValidity);
    const cvvRef = useRef();
    
    const { isValid, isPotentiallyValid } = cvvValidity;

    useEffect(() => {
        autoFocusRef(cvvRef);
    }, []);

    useEffect(() => {
        setCSSText(getCSSText(DEFAULT_STYLE, styleObject));
    }, [ styleObject ]);

    useEffect(() => {
        const hasGQLErrors = gqlErrors.length > 0;
        if (hasGQLErrors) {
            setCvvValidity({ isPotentiallyValid: false, isValid: false });
        }
    }, [ gqlErrors ]);

    useEffect(() => {
        const errors = setErrors({ isCvvValid: cvvValidity.isValid });

        onChange({ value: cvv, valid: cvvValidity.isValid, errors });
    }, [ cvv, isValid, isPotentiallyValid  ]);

    return (
        <Fragment>
            <script nonce={ cspNonce }>
                { cssText }
            </script>
            <CardCVV
                ref={ cvvRef }
                type='text'
                autocomplete={ autocomplete }
                // eslint-disable-next-line react/forbid-component-props
                className={ `cvv ${ cvvValidity.isPotentiallyValid || cvvValidity.isValid ? 'valid' : 'invalid' }` }
                placeholder={ placeholder.cvv ?? DEFAULT_PLACEHOLDERS.cvv }
                maxLength='4'
                onChange={ ({ cardCvv } : CardCvvChangeEvent) => setCvv(cardCvv) }
                onValidityChange={ (validity : FieldValidity) => setCvvValidity(validity) }
            />
        </Fragment>
    );
}

type CardNameFieldProps = {|
    cspNonce : string,
    onChange : ({| value : string, valid : boolean, errors : [$Values<typeof CARD_ERRORS>] | [] |}) => void,
    styleObject : CardStyle,
    placeholder : {| number? : string, expiry? : string, cvv? : string, name? : string  |},
    autoFocusRef : (mixed) => void,
    gqlErrors : []
|};

export function CardNameField({ cspNonce, onChange, styleObject = {}, placeholder = {}, autoFocusRef, gqlErrors = [] } : CardNameFieldProps) : mixed {
    const [ cssText, setCSSText ] : [ string, (string) => string ] = useState('');
    const [ name, setName ] : [ string, (string) => string ] = useState('');
    const [ nameValidity, setNameValidity ] : [ FieldValidity, (FieldValidity) => FieldValidity ] = useState(initFieldValidity);
    const nameRef = useRef();
    
    const { isValid, isPotentiallyValid } = nameValidity;

    useEffect(() => {
        autoFocusRef(nameRef);
    }, []);

    useEffect(() => {
        setCSSText(getCSSText(DEFAULT_STYLE, styleObject));
    }, [ styleObject ]);

    useEffect(() => {
        const hasGQLErrors = gqlErrors.length > 0;
        if (hasGQLErrors) {
            setNameValidity({ isPotentiallyValid: false, isValid: false });
        }
    }, [ gqlErrors ]);

    useEffect(() => {
        const errors = setErrors({ isNameValid: nameValidity.isValid });

        onChange({ value: name, valid: nameValidity.isValid, errors });
    }, [ name, isValid, isPotentiallyValid  ]);

    return (
        <Fragment>
            <script nonce={ cspNonce }>
                { cssText }
            </script>
            <CardName
                ref={ nameRef }
                type='text'
                // eslint-disable-next-line react/forbid-component-props
                className={ `name ${ nameValidity.isPotentiallyValid || nameValidity.isValid ? 'valid' : 'invalid' }` }
                placeholder={ placeholder.name ?? DEFAULT_PLACEHOLDERS.name }
                maxLength='255'
                onChange={ ({ cardName } : CardNameChangeEvent) => setName(cardName) }
                onValidityChange={ (validity : FieldValidity) => setNameValidity(validity) }
            />
        </Fragment>
    );
}
