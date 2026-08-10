import { db } from "./src/db/index.js";
import { utilityRateHistory, surcharges } from "./src/db/schema.js";
import { sql, isNull, and } from "drizzle-orm";
import { businessDate } from "./src/lib/businessDate.js";

async function run() {
  const today = businessDate();
  
  console.log("Cleaning future utility rates...");
  const futureRates = await db
    .select()
    .from(utilityRateHistory)
    .where(sql`${utilityRateHistory.effectiveFrom} > ${today}`);
    
  if (futureRates.length > 0) {
    const propertyMap = new Map<string, typeof futureRates>();
    for (const rate of futureRates) {
      if (!propertyMap.has(rate.propertyId)) {
        propertyMap.set(rate.propertyId, []);
      }
      propertyMap.get(rate.propertyId)!.push(rate);
    }
    
    let count = 0;
    for (const [_, rates] of propertyMap.entries()) {
      rates.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      const toDelete = rates.slice(1);
      for (const rate of toDelete) {
        await db.delete(utilityRateHistory).where(sql`${utilityRateHistory.id} = ${rate.id}`);
        count++;
      }
    }
    console.log(`Deleted ${count} duplicate future rates.`);
  }

  console.log("Cleaning future surcharges...");
  const futureSurcharges = await db
    .select()
    .from(surcharges)
    .where(
      and(
        sql`${surcharges.effectiveFrom} > ${today}`,
        isNull(surcharges.deletedAt),
        sql`${surcharges.active} = true`
      )
    );
    
  if (futureSurcharges.length > 0) {
    const groups = new Map<string, typeof futureSurcharges>();
    for (const surcharge of futureSurcharges) {
      const key = `${surcharge.propertyId}-${surcharge.name}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(surcharge);
    }
    
    let count = 0;
    for (const [_, items] of groups.entries()) {
      items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      const toDelete = items.slice(1);
      for (const surcharge of toDelete) {
        await db.update(surcharges)
          .set({ active: false, deletedAt: sql`now()` })
          .where(sql`${surcharges.id} = ${surcharge.id}`);
        count++;
      }
    }
    console.log(`Soft-deleted ${count} duplicate future surcharges.`);
  }
  
  process.exit(0);
}

run();
