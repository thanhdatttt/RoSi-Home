import { beforeEach, describe, expect, it, vi } from "vitest";

const LANDLORD_ID = "11111111-1111-4111-8111-111111111111";
const PROPERTY_ID = "22222222-2222-4222-8222-222222222222";

const mocks = vi.hoisted(() => ({
  createProperty: vi.fn(),
  countPropertiesByLandlord: vi.fn(),
  findProperty: vi.fn(),
  listPropertiesByLandlord: vi.fn(),
  updateProperty: vi.fn(),
  writeAudit: vi.fn(),
  isUniqueViolation: vi.fn(),
}));

vi.mock("../../../src/modules/properties/repository.js", () => ({
  createProperty: mocks.createProperty,
  countPropertiesByLandlord: mocks.countPropertiesByLandlord,
  findProperty: mocks.findProperty,
  listPropertiesByLandlord: mocks.listPropertiesByLandlord,
  updateProperty: mocks.updateProperty,
}));

vi.mock("../../../src/db/audit.js", () => ({
  writeAudit: mocks.writeAudit,
}));

vi.mock("../../../src/lib/pgErrors.js", () => ({
  isUniqueViolation: mocks.isUniqueViolation,
}));

import {
  createPropertyService,
  getPropertyService,
  listPropertiesService,
  updatePropertyService,
} from "../../../src/modules/properties/service.js";

const now = new Date("2026-07-01T00:00:00.000Z");

const propertyRow = {
  id: PROPERTY_ID,
  landlordId: LANDLORD_ID,
  name: "Sunrise House",
  address: "1 Nguyen Van Cu",
  locality: "Ho Chi Minh City",
  createdAt: now,
  updatedAt: now,
  deletedAt: null,
  deletedBy: null,
};

describe("property service ownership and uniqueness rules", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createProperty.mockResolvedValue(propertyRow);
    mocks.countPropertiesByLandlord.mockResolvedValue(1);
    mocks.findProperty.mockResolvedValue(propertyRow);
    mocks.listPropertiesByLandlord.mockResolvedValue([propertyRow]);
    mocks.updateProperty.mockResolvedValue(propertyRow);
    mocks.writeAudit.mockResolvedValue(undefined);
    mocks.isUniqueViolation.mockReturnValue(false);
  });

  it("US-PROPERTY-01: associates creation and audit with the authenticated landlord", async () => {
    const input = {
      name: "Sunrise House",
      address: "1 Nguyen Van Cu",
      locality: "Ho Chi Minh City",
    };

    const result = await createPropertyService(LANDLORD_ID, input);

    expect(result.id).toBe(PROPERTY_ID);
    expect(mocks.createProperty).toHaveBeenCalledWith(LANDLORD_ID, input);
    expect(mocks.writeAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        actorUserId: LANDLORD_ID,
        action: "property.created",
        entityId: PROPERTY_ID,
      }),
    );
  });

  it("US-PROPERTY-02: scopes list and detail reads to the authenticated landlord", async () => {
    const list = await listPropertiesService(LANDLORD_ID, {
      page: 1,
      pageSize: 20,
    });
    const detail = await getPropertyService(LANDLORD_ID, PROPERTY_ID);

    expect(list.data).toHaveLength(1);
    expect(detail.id).toBe(PROPERTY_ID);
    expect(mocks.listPropertiesByLandlord).toHaveBeenCalledWith(
      LANDLORD_ID,
      { page: 1, pageSize: 20 },
    );
    expect(mocks.findProperty).toHaveBeenCalledWith(
      LANDLORD_ID,
      PROPERTY_ID,
    );
  });

  it("US-PROPERTY-02: returns scoped 404 when the property is not owned", async () => {
    mocks.findProperty.mockResolvedValue(null);

    await expect(
      getPropertyService(LANDLORD_ID, PROPERTY_ID),
    ).rejects.toMatchObject({ status: 404, code: "NOT_FOUND" });
  });

  it("US-PROPERTY-02: maps a uniqueness race during update to conflict", async () => {
    mocks.updateProperty.mockRejectedValue(new Error("duplicate"));
    mocks.isUniqueViolation.mockReturnValue(true);

    await expect(
      updatePropertyService(LANDLORD_ID, PROPERTY_ID, {
        name: "Existing name",
      }),
    ).rejects.toMatchObject({ status: 409, code: "CONFLICT" });

    expect(mocks.writeAudit).not.toHaveBeenCalled();
  });
});
