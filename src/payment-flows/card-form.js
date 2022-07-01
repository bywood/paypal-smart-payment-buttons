/* @flow */

import { ZalgoPromise } from '@krakenjs/zalgo-promise/src';
import { ENV, FUNDING, CARD, FPTI_KEY } from '@paypal/sdk-constants/src';
import { createExperiment } from '@paypal/sdk-client/src';
import { memoize, querySelectorAll, debounce, noop } from '@krakenjs/belter/src';
import { EXPERIENCE } from '@paypal/checkout-components/src/constants/button';

import { DATA_ATTRIBUTES } from '../constants';
import { unresolvedPromise, promiseNoop, getLogger } from '../lib';

import type { PaymentFlow, PaymentFlowInstance, IsEligibleOptions, IsPaymentEligibleOptions, InitOptions } from './types';
import { checkout } from './checkout';

function setupCardForm() {
    // pass
}

let cardFormOpen = false;

function isCardFormEligible({ props, serviceData } : IsEligibleOptions) : boolean {
    const { vault, onShippingChange, experience, env } = props;
    const { eligibility } = serviceData;

    if (experience === EXPERIENCE.INLINE) {
        if (env !== ENV.PRODUCTION) {
            return false;
        }
        
        const inlinexoExperiment = createExperiment('inlinexo', 50, getLogger());
        const treatment = inlinexoExperiment.getTreatment();

        getLogger()
            .info(treatment)
            .track({
                [FPTI_KEY.EXPERIMENT_NAME]: 'inlinexo',
                [FPTI_KEY.TREATMENT_NAME]:  treatment,
                [FPTI_KEY.TRANSITION]:      'process_pxp_check',
                [FPTI_KEY.STATE]:           'pxp_check'
            }).flush();

        return inlinexoExperiment.isEnabled() ? false : true;
    }

    if (vault) {
        return false;
    }

    if (onShippingChange) {
        return false;
    }

    return eligibility.cardForm;
}

function isCardFormPaymentEligible({ payment } : IsPaymentEligibleOptions) : boolean {
    const { win, fundingSource } = payment || {};

    if (win) {
        return false;
    }

    if (fundingSource && fundingSource !== FUNDING.CARD) {
        return false;
    }

    return true;
}

function highlightCard(card : ?$Values<typeof CARD>) {
    if (!card) {
        return;
    }
    querySelectorAll(`[${ DATA_ATTRIBUTES.CARD }]`).forEach(el => {
        el.style.opacity = (el.getAttribute(DATA_ATTRIBUTES.CARD) === card) ? '1' : '0.1';
    });
}

function unhighlightCards() {
    querySelectorAll(`[${ DATA_ATTRIBUTES.CARD }]`).forEach(el => {
        el.style.opacity = '1';
    });
}

const getElements = () : {| buttonsContainer : HTMLElement, cardButtonsContainer : HTMLElement, cardFormContainer : HTMLElement |} => {
    const buttonsContainer = document.querySelector('#buttons-container');
    const cardButtonsContainer = document.querySelector(`[${ DATA_ATTRIBUTES.FUNDING_SOURCE }="${ FUNDING.CARD }"]`);
    const cardFormContainer = document.querySelector('#card-fields-container');

    if (!buttonsContainer || !cardButtonsContainer || !cardFormContainer) {
        throw new Error(`Did not find card fields elements`);
    }

    return { buttonsContainer, cardButtonsContainer, cardFormContainer };
};

let resizeListener;

const slideUpButtons = () => {
    const { buttonsContainer, cardButtonsContainer, cardFormContainer } = getElements();

    if (!buttonsContainer || !cardButtonsContainer || !cardFormContainer) {
        throw new Error(`Required elements not found`);
    }

    cardFormContainer.style.minHeight = '0px';
    cardFormContainer.style.display = 'block';

    const recalculateMargin = () => {
        buttonsContainer.style.marginTop = `${ buttonsContainer.offsetTop - cardButtonsContainer.offsetTop }px`;
    };

    resizeListener = debounce(() => {
        buttonsContainer.style.transitionDuration = '0s';
        recalculateMargin();
    });
    window.addEventListener('resize', resizeListener);

    recalculateMargin();
};

const slideDownButtons = () => {
    const { buttonsContainer } = getElements();

    unhighlightCards();
    window.removeEventListener('resize', resizeListener);
    buttonsContainer.style.removeProperty('transition-duration');
    buttonsContainer.style.removeProperty('margin-top');
};

function initCardForm({ props, components, payment, serviceData, config } : InitOptions) : PaymentFlowInstance {
    const { createOrder, onApprove, onCancel,
        locale, commit, onError, sessionID, buttonSessionID, onAuth } = props;
    const { CardForm } = components;
    const { fundingSource, card } = payment;
    const { cspNonce } = config;
    const { buyerCountry } = serviceData;

    if (cardFormOpen) {
        highlightCard(card);
        return {
            start: promiseNoop,
            close: promiseNoop
        };
    }

    const restart = memoize(() : ZalgoPromise<void> =>
        checkout.init({ props, components, payment: { ...payment, isClick: false }, serviceData, config, restart })
            .start().finally(unresolvedPromise));

    const onClose = () => {
        cardFormOpen = false;
    };

    const onCardTypeChange = ({ card: cardType }) => {
        highlightCard(cardType);
    };

    let buyerAccessToken;

    const { render, close: closeCardForm } = CardForm({
        createOrder,

        fundingSource,
        card,

        onApprove: ({ payerID, paymentID, billingToken }) => {
            // eslint-disable-next-line no-use-before-define
            return close().then(() => {
                return onApprove({ payerID, paymentID, billingToken, buyerAccessToken }, { restart }).catch(noop);
            });
        },

        onAuth: ({ accessToken }) => {
            const access_token = accessToken ? accessToken : buyerAccessToken;

            return onAuth({ accessToken: access_token }).then(token => {
                buyerAccessToken = token;
            });
        },

        onCancel: () => {
            // eslint-disable-next-line no-use-before-define
            return close().then(() => {
                return onCancel();
            });
        },

        onError,
        onClose,
        onCardTypeChange,

        sessionID,
        buttonSessionID,
        buyerCountry,
        locale,
        commit,
        cspNonce
    });

    const start = () => {
        cardFormOpen = true;
        const renderPromise = render('#card-fields-container');
        slideUpButtons();
        highlightCard(card);
        return renderPromise;
    };

    const close = () => {
        slideDownButtons();
        return closeCardForm().then(() => {
            cardFormOpen = false;
        });
    };

    return { start, close };
}

export const cardForm : PaymentFlow = {
    name:              'card_form',
    setup:             setupCardForm,
    isEligible:        isCardFormEligible,
    isPaymentEligible: isCardFormPaymentEligible,
    init:              initCardForm,
    inline:            true
};
