/* @flow */

import { ZalgoPromise } from '@krakenjs/zalgo-promise/src';

import { getPayPal, getPostRobot, getSDKVersion, toProxyWindow, postRobotOnceProxy } from './sdk';

describe('sdk', () => {
    describe('getPayPal()', () => {
        it('throws if not defined', () => {
            expect(() => getPayPal()).toThrowError();
            window.paypal = {}
            expect(() => getPayPal()).not.toThrowError();
        });
    });
    describe('getPostRobot()', () => {
        it('throws if not defined', () => {
            expect(() => getPostRobot()).toThrowError();
            expect(() => {
                window.paypal = {postRobot: {}};
                getPostRobot();
            }).not.toThrowError();
        });
    });
    describe('toProxyWindow()', () => {
        it('invokes .toProxyWindow()', () => {
            const mockToProxyWindow = jest.fn();
            window.paypal = {postRobot: {toProxyWindow: mockToProxyWindow}};
            toProxyWindow(window);
            expect(mockToProxyWindow).toHaveBeenCalled();
        });
    });
    describe('postRobotOnceProxy', () => {
        it('is cancelable', () => {
            const proxyWin = {awaitWindow: () => ZalgoPromise.resolve('k'), domain: 'op'};
            // $FlowFixMe
            const {cancel} = postRobotOnceProxy('', {proxyWin}, jest.fn());
            expect(cancel).not.toThrowError();
        });
    });
    describe('getSDKVersion', () => {
        it('returns the version', () => {
            window.paypal = {version: '123'};
            expect(getSDKVersion()).toBe('123');
        });
    });
});