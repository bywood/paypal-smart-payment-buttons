/* @flow */

import { DATA_ATTRIBUTES } from '../constants';

import { getActiveElement, getNonce } from './dom';

describe('dom utils', () => {
    describe('getNonce', () => {
        it('defaults to empty string', () => {
            expect(getNonce()).toBe('');
        });
        it('reads the nonce from the DOM', () => {
            // $FlowIssue - we know body exists as this runs in jsdom
            document.body.setAttribute(DATA_ATTRIBUTES.NONCE, 'abc123');
            expect(getNonce()).toBe('abc123');
        });
        it('handles bodyless documents', () => {
            const body = document.body;
            // $FlowFixMe
            Object.defineProperty(document, 'body', {value: false, writable: true});
            expect(getNonce()).toBe('');
            Object.defineProperty(document, 'body', {value: body});
        });
    });
    describe('getActiveElement', () => {
        it('returns the active element', () => {
            const input1 = document.createElement('input');
            const input2 = document.createElement('input');

            // $FlowIssue - we know body exists as this runs in jsdom
            document.body.appendChild(input1);
            // $FlowIssue - we know body exists as this runs in jsdom
            document.body.appendChild(input2);

            input1.focus();

            expect(getActiveElement()).toBe(input1);

            input2.focus();

            expect(getActiveElement()).toBe(input2);
        });
    });
});
