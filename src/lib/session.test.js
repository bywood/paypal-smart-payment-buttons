/* @flow */

import {
    getBuyerAccessToken,
    setBuyerAccessToken,
    getSessionID,
    getSessionState,
    getStickinessID,
    getStorageState,
} from './session';

describe("getSessionId", () => {
    it("returns a session id", () => {
        expect(getSessionID()).toMatch(/uid_.*/);
    });
});

describe("getSessionState", () => {
    it("invokes the handler with a state object", () => {
        const mockFn = jest.fn();
        getSessionState(mockFn);
        expect(mockFn).toHaveBeenCalledWith({});
    });
});

describe("getStorageState", () => {
    it("invokes the handler with session info", () => {
        const mockFn = jest.fn()
        getStorageState(mockFn)
        expect(mockFn).toHaveBeenCalledWith(expect.objectContaining({
            "__session__": expect.any(Object)
        }));
    });
});

describe("getStickinessID", () => {
    it("returns a number in string form", () => {
        expect(getStickinessID()).toMatch(/\d+/);
    });
});

describe("getBuyerAccessToken", () => {
    it("is undefined by default", () => {
        expect(getBuyerAccessToken()).toBe(undefined);
    });
    it("setBuyerAccessToken() updates the access token", () => {
        const accessToken = new Date().toUTCString();
        setBuyerAccessToken(accessToken);
        expect(getBuyerAccessToken()).toBe(accessToken);
    });
});
