import { HttpError } from "../../lib/errors.js";
import type { PropertyRepository } from "./repository.js";
import type {
  CreatePropertyInput,
  UtilityRateInput,
} from "./schema.js";

export class PropertyService {
  constructor(private readonly repository: PropertyRepository) {}

  list(landlordId: string) {
    return this.repository.listOwned(landlordId);
  }

  create(landlordId: string, input: CreatePropertyInput) {
    return this.repository.create(landlordId, input);
  }

  async detail(id: string, landlordId: string) {
    const property = await this.repository.findOwned(id, landlordId);
    if (!property) {
      throw new HttpError(404, "PROPERTY_NOT_FOUND", "Property not found");
    }
    return property;
  }

  async updateUtilityRates(
    id: string,
    landlordId: string,
    input: UtilityRateInput,
  ) {
    await this.detail(id, landlordId);
    await this.repository.upsertUtilityRates(id, input);
    return this.detail(id, landlordId);
  }
}
