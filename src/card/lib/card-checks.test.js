/* @flow */

import { DEFAULT_CARD_TYPE } from "../constants";

import { detectCardType } from "./card-checks";

describe("card-checks", () => {

  describe("detectCardType", () => {
    it("returns the default card type if the number length is 0", () => {
      const number = "";

      const cardType = detectCardType(number);

      expect(cardType).toBe(DEFAULT_CARD_TYPE);
    });

    it("returns the default card type if the number length is greater than 0 but the card validator module does not return any potential card type", () => {
      // the card-validator module will return an empty array for this card number
      const number = "123";

      const cardType = detectCardType(number);

      expect(cardType).toBe(DEFAULT_CARD_TYPE);
    });

    it("returns a card type when the card validator module is able to detect a card type", () => {
      const number = "411";

      const cardType = detectCardType(number);

      expect(cardType).toStrictEqual({
        niceType: "Visa",
        type: "visa",
        patterns: [4],
        matchStrength: 1,
        gaps: [4, 8, 12],
        lengths: [16, 18, 19],
        code: {
          name: "CVV",
          size: 3,
        },
      });
    });
  });
});
