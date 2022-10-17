/* @flow */

import { isAndroid, isIos } from '@krakenjs/belter/src';
import { ZalgoPromise } from '@krakenjs/zalgo-promise/src';

import { getLogger, setupLogger, enableAmplitude  } from './logger';

jest.mock('@krakenjs/belter/src', () => ({
    ...jest.requireActual('@krakenjs/belter/src'),
    isIos: jest.fn(),
    isAndroid: jest.fn()
}));

const loggerProps = {
    env: 'test',
    locale: {
        lang: 'en',
        country: 'US'
    },
    buyerCountry: 'US',
    clientID: '',
    sdkVersion: '',
    sessionID: '',
    fundingSource: 'venmo',
    sdkCorrelationID: ''
};

describe('setupLogger()', () => {
    it('can enable amplitude', () => {
        expect(() => enableAmplitude({env: 'test'})).not.toThrowError();
    });
    it('supports sdk mobile environments', () => {
        // $FlowFixMe
        isIos.mockImplementationOnce(() => true);
        getLogger().track({tracking: true});
        setupLogger(loggerProps);
        // $FlowFixMe
        isAndroid.mockImplementationOnce(() => true);
        getLogger().info('info about android os');
        setupLogger(loggerProps);
    });
    it('logs unhandled errors', () => {
        jest.spyOn(ZalgoPromise, 'onPossiblyUnhandledException').mockImplementationOnce((d) => d());
        const mockError = jest.fn();
        jest.spyOn(getLogger(), 'error').mockImplementationOnce(mockError);
        setupLogger(loggerProps);
        expect(mockError).toHaveBeenCalledWith('unhandled_error', expect.any(Object));
    });
});
