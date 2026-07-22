import { randomUUID } from "node:crypto";
import { and, desc, eq, sql } from "drizzle-orm";
import type { AppDrizzle } from "../../db/client.js";
import { properties, utilityRates } from "../../db/schema.js";
import type {
  CreatePropertyInput,
  UtilityRateInput,
} from "./schema.js";

export interface PropertyView {
  address: string;
  createdAt: string;
  id: string;
  name: string;
  updatedAt: string;
  utilityRates: {
    electricityRate: number;
    updatedAt: string;
    waterRate: number;
  } | null;
}

const propertySelection = {
  address: properties.address,
  createdAt: properties.createdAt,
  electricityRate: utilityRates.electricityRate,
  id: properties.id,
  name: properties.name,
  propertyUpdatedAt: properties.updatedAt,
  rateUpdatedAt: utilityRates.updatedAt,
  waterRate: utilityRates.waterRate,
};

function toPropertyView(
  row: Awaited<ReturnType<PropertyRepository["selectOwned"]>>[number],
): PropertyView {
  return {
    address: row.address,
    createdAt: row.createdAt,
    id: row.id,
    name: row.name,
    updatedAt: row.propertyUpdatedAt,
    utilityRates:
      row.electricityRate === null ||
      row.waterRate === null ||
      row.rateUpdatedAt === null
        ? null
        : {
            electricityRate: row.electricityRate,
            updatedAt: row.rateUpdatedAt,
            waterRate: row.waterRate,
          },
  };
}

export class PropertyRepository {
  constructor(private readonly db: AppDrizzle) {}

  selectOwned(landlordId: string) {
    return this.db
      .select(propertySelection)
      .from(properties)
      .leftJoin(utilityRates, eq(utilityRates.propertyId, properties.id))
      .where(eq(properties.landlordId, landlordId));
  }

  async listOwned(landlordId: string): Promise<PropertyView[]> {
    const rows = await this.selectOwned(landlordId).orderBy(
      desc(properties.createdAt),
    );
    return rows.map(toPropertyView);
  }

  async findOwned(id: string, landlordId: string): Promise<PropertyView | null> {
    const rows = await this.db
      .select(propertySelection)
      .from(properties)
      .leftJoin(utilityRates, eq(utilityRates.propertyId, properties.id))
      .where(and(eq(properties.id, id), eq(properties.landlordId, landlordId)))
      .limit(1);
    const row = rows[0];
    return row ? toPropertyView(row) : null;
  }

  async create(
    landlordId: string,
    input: CreatePropertyInput,
  ): Promise<PropertyView> {
    const id = randomUUID();
    await this.db.insert(properties).values({
      id,
      landlordId,
      name: input.name,
      address: input.address,
    });
    const property = await this.findOwned(id, landlordId);
    if (!property) {
      throw new Error("Created property could not be loaded");
    }
    return property;
  }

  async upsertUtilityRates(
    propertyId: string,
    input: UtilityRateInput,
  ): Promise<void> {
    await this.db
      .insert(utilityRates)
      .values({ propertyId, ...input })
      .onConflictDoUpdate({
        target: utilityRates.propertyId,
        set: {
          electricityRate: input.electricityRate,
          updatedAt: sql`now()`,
          waterRate: input.waterRate,
        },
      });
  }
}
