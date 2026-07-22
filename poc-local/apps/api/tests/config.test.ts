import { afterEach, describe, expect, it } from "vitest";
import { getRuntimeConfig } from "../src/config.js";

const originalHost = process.env.POC_API_HOST;

afterEach(() => {
  if (originalHost === undefined) {
    delete process.env.POC_API_HOST;
  } else {
    process.env.POC_API_HOST = originalHost;
  }
});

describe("runtime API host configuration", () => {
  it("defaults to all interfaces for the physical-iPhone PoC", () => {
    delete process.env.POC_API_HOST;

    expect(getRuntimeConfig().host).toBe("0.0.0.0");
  });

  it("supports a loopback-only override", () => {
    process.env.POC_API_HOST = "127.0.0.1";

    expect(getRuntimeConfig().host).toBe("127.0.0.1");
  });

  it("rejects an arbitrary bind host", () => {
    process.env.POC_API_HOST = "public.example.test";

    expect(() => getRuntimeConfig()).toThrow();
  });
});
