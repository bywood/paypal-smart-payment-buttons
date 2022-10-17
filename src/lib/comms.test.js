/* @flow */

import { FRAME_NAME } from '../constants';

import { getSmartFieldsByFundingSource  } from './comms';

describe('getSmartFieldsByFundingSource()', () => {
   it('gets smart fields from the correct window', () => {
        window.exports = {fundingSource: 'venmo', name: FRAME_NAME.SMART_FIELDS};
        expect(getSmartFieldsByFundingSource('venmo')).toEqual(window.exports);
   });
   it('gracefully degrades if funding source not present', () => {
      window.exports = {};
      expect(() => getSmartFieldsByFundingSource('')).not.toThrowError();
   });
});
