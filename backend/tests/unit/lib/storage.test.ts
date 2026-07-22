import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  deleteMaintenancePhoto,
  uploadMaintenancePhoto,
} from "../../../src/lib/storage.js";

describe("private maintenance photo storage", () => {
  beforeEach(() => {
    vi.stubEnv("SUPABASE_URL", "https://project.supabase.co/");
    vi.stubEnv("SUPABASE_SERVICE_KEY", "service-secret");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("uploads to the private maintenance-photos bucket and stores only a path", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", fetchMock);

    const result = await uploadMaintenancePhoto({
      objectPath: "tenant id/request/photo.png",
      buffer: Buffer.from("png"),
      contentType: "image/png",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://project.supabase.co/storage/v1/object/maintenance-photos/tenant%20id/request/photo.png",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          apikey: "service-secret",
          Authorization: "Bearer service-secret",
          "Content-Type": "image/png",
          "x-upsert": "false",
        }),
      }),
    );
    expect(result).toEqual({
      objectPath: "tenant id/request/photo.png",
      fileUrl: "maintenance-photos/tenant id/request/photo.png",
    });
  });

  it("does not hide an upload failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 503 }),
    );

    await expect(
      uploadMaintenancePhoto({
        objectPath: "tenant/request/photo.jpg",
        buffer: Buffer.from("jpg"),
        contentType: "image/jpeg",
      }),
    ).rejects.toThrow("storage status 503");
  });

  it("rejects missing storage URL configuration before making a request", async () => {
    vi.stubEnv("SUPABASE_URL", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      uploadMaintenancePhoto({
        objectPath: "tenant/request/photo.jpg",
        buffer: Buffer.from("jpg"),
        contentType: "image/jpeg",
      }),
    ).rejects.toThrow("storage is not configured");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects a missing service key before making a request", async () => {
    vi.stubEnv("SUPABASE_SERVICE_KEY", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      deleteMaintenancePhoto("tenant/request/photo.png"),
    ).rejects.toThrow("storage is not configured");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("deletes a compensation object and treats an already-absent object as success", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 404 });
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      deleteMaintenancePhoto("tenant/request/photo.png"),
    ).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(
      "https://project.supabase.co/storage/v1/object/maintenance-photos/tenant/request/photo.png",
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("reports a non-404 compensation deletion failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    );

    await expect(
      deleteMaintenancePhoto("tenant/request/photo.png"),
    ).rejects.toThrow("storage status 500");
  });
});
