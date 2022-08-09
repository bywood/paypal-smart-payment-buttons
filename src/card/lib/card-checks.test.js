/* @flow */

import { checkCardNumber, checkName, checkPostalCode } from "./card-checks";

describe("card-checks", () => {
  describe("checkCardNumber", () => {
    it("returns true for isValid if card number passes luhn validation", () => {
      const cardNumber = "4111 1111 1111 1111";

      expect(checkCardNumber(cardNumber).isValid).toBe(true);
    });

    it("returns false for isValid if card number does not pass luhn validation", () => {
      const cardNumber = "4111 1111";

      expect(checkCardNumber(cardNumber).isValid).toBe(false);
    });

    it("returns false for isPotentiallyValid is a non-numeric character is entered", () => {
      const cardNumber = "411x";

      expect(checkCardNumber(cardNumber).isPotentiallyValid).toBe(false);
    });
  });

  describe("checkName", () => {
    it("returns true for isValid for a name less than 255 characters and is not comprised of only numbers, hyphens and spaces", () => {
      const name = "Test Name";

      expect(checkName(name).isValid).toBe(true);
    });

    it("returns false for isValid, and isPotentiallyValid for a name longer than 255 characters", () => {
      const name =
        "Ekjgfsekldjghdsfkghdksgdfkgksafghefsgkvshdbbfkshdfkbdsfgkbdskfbndfskljbndfakljvbnadflkvbadlkfvnsljkdfvhnkldsfzvnlkdsfvnladkfjvnldkfsjvnsdlkjfvnakljdfvaasdkfjgvbefskldjvblsjkdfvnbaljkdfnvkdadfjvnklsdjfnvdksdjfvnksdfvnfdjdavnkddsafvnkadljfvwertydhfjdksjdddas";

      const validity = checkName(name);

      expect(validity.isValid).toBe(false);
      expect(validity.isPotentiallyValid).toBe(false);
    });

    it("returns false for isValid for a name comprised of only numbers", () => {
      const name = "4111111111111111";

      expect(checkName(name).isValid).toBe(false);
    });

    it("returns false for isValid for a name comprised of only hyphens", () => {
      const name = "-----";

      expect(checkName(name).isValid).toBe(false);
    });

    it("returns false for isValid for a name comprised of only spaces", () => {
      const name = "   ";

      expect(checkName(name).isValid).toBe(false);
    });
  });

  describe("checkPostalCode", () => {
    it("returns true for isValid for a 5-digit postal code", () => {
      const postalCode = "12345";

      expect(checkPostalCode(postalCode).isValid).toBe(true);
    });

    it("returns false for isValid for a postal code < 5 digits", () => {
      const postalCode = "1234";

      expect(checkPostalCode(postalCode, 5).isValid).toBe(false);
    });

    it("retusn false for isValid for a postal code that is not a string", () => {
      const postalCode = 12345;

      // $FlowFixMe
      expect(checkPostalCode(postalCode).isValid).toBe(false);
    });
  });
});
