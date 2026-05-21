import { describe, it, expect } from "vitest";
import { splitPhoneDialCode } from "../../src/parser/stages/phoneDialCode.js";

describe("splitPhoneDialCode", () => {
  describe("phone starts with + — split into dialCode + local number", () => {
    it("splits +1 prefix from US-style number", () => {
      const out = splitPhoneDialCode({ country: "US", phone: "+1 (786) 227-2101" });
      expect(out.phoneDialCode).toBe("+1");
      expect(out.phone).toBe("(786) 227-2101");
    });

    it("splits +1 (570) style number", () => {
      const out = splitPhoneDialCode({ phone: "+1 (570) 470-2313" });
      expect(out.phoneDialCode).toBe("+1");
      expect(out.phone).toBe("(570) 470-2313");
    });

    it("longest match wins — +1268 beats +1", () => {
      const out = splitPhoneDialCode({ phone: "+1268 555 0123" });
      expect(out.phoneDialCode).toBe("+1268");
      expect(out.phone).toBe("555 0123");
    });

    it("splits +380 UA prefix", () => {
      const out = splitPhoneDialCode({ country: "UA", phone: "+380 67 123 45 67" });
      expect(out.phoneDialCode).toBe("+380");
      expect(out.phone).toBe("67 123 45 67");
    });

    it("trims leading space from local part", () => {
      const out = splitPhoneDialCode({ phone: "+44 20 7946 0958" });
      expect(out.phoneDialCode).toBe("+44");
      expect(out.phone).toBe("20 7946 0958");
    });

    it("returns phone unchanged when no dial code matches", () => {
      const out = splitPhoneDialCode({ phone: "+999 123 4567" });
      expect(out.phoneDialCode).toBeUndefined();
      expect(out.phone).toBe("+999 123 4567");
    });
  });

  describe("phone has no + — dial code from country map", () => {
    it("populates phoneDialCode from country, phone unchanged", () => {
      const out = splitPhoneDialCode({ country: "US", phone: "(309) 555-1234" });
      expect(out.phoneDialCode).toBe("+1");
      expect(out.phone).toBe("(309) 555-1234");
    });

    it("populates +380 for UA", () => {
      const out = splitPhoneDialCode({ country: "UA", phone: "67 123 45 67" });
      expect(out.phoneDialCode).toBe("+380");
      expect(out.phone).toBe("67 123 45 67");
    });

    it("leaves phone unchanged when country is unknown", () => {
      const out = splitPhoneDialCode({ phone: "309-555-1234" });
      expect(out.phoneDialCode).toBeUndefined();
      expect(out.phone).toBe("309-555-1234");
    });
  });

  describe("edge cases", () => {
    it("returns unchanged when no phone", () => {
      const out = splitPhoneDialCode({ country: "US" });
      expect(out.phone).toBeUndefined();
      expect(out.phoneDialCode).toBeUndefined();
    });
  });
});
