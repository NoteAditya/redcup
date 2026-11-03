import { describe, expect, it } from "vitest";
import {
  emailOk,
  passwordOk,
  requiredText,
  handleOk,
  panOk,
  upiOk,
  gstinOptional,
  urlOptional,
  positiveRupees,
} from "@/lib/validate";

describe("validate", () => {
  it("requiredText", () => {
    expect(requiredText("", "Title")).toMatch(/required/i);
    expect(requiredText(" ok ", "Title")).toBeNull();
  });
  it("emailOk", () => {
    expect(emailOk("x")).toMatch(/valid email/i);
    expect(emailOk("a@b.co")).toBeNull();
  });
  it("passwordOk", () => {
    expect(passwordOk("123")).toMatch(/6/);
    expect(passwordOk("123456")).toBeNull();
  });
  it("handleOk", () => {
    expect(handleOk("bad handle")).toMatch(/Handle/i);
    expect(handleOk("ok.handle_1")).toBeNull();
  });
  it("panOk / upiOk / gstin / url / rupees", () => {
    expect(panOk("ABCDE1234F")).toBeNull();
    expect(panOk("nope")).toMatch(/PAN/);
    expect(upiOk("you@upi")).toBeNull();
    expect(gstinOptional("27AABCU9603R1ZM")).toBeNull();
    expect(urlOptional("https://x.com")).toBeNull();
    expect(positiveRupees(100, "Budget", 5000)).toMatch(/5000/);
  });
});
