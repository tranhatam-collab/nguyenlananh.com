import {
  PRODUCT_FAMILIES,
  MEMBERSHIP_PLANS,
  MICRO_PRODUCTS,
  ASSESSMENTS,
  GUIDED_PROGRAMS,
  CERTIFICATIONS,
  PLANS
} from "../../../_lib/constants.js";
import { requireAdminPermission } from "../../../_lib/admin_auth.js";
import { json, errorResponse } from "../../../_lib/utils.js";

// GET /api/admin/inventory
// Returns product taxonomy and inventory counts.
export async function onRequestGet(context) {
  try {
    await requireAdminPermission(context, "audit.view");

    const countByFamily = {};
    for (const family of PRODUCT_FAMILIES) {
      countByFamily[family.slug] = family.offers.length;
    }

    return json({
      ok: true,
      inventory: {
        product_families: PRODUCT_FAMILIES,
        family_offer_counts: countByFamily,
        counts: {
          membership_plans: Object.keys(MEMBERSHIP_PLANS).length,
          micro_products: Object.keys(MICRO_PRODUCTS).length,
          assessments: Object.keys(ASSESSMENTS).length,
          guided_programs: Object.keys(GUIDED_PROGRAMS).length,
          certifications: Object.keys(CERTIFICATIONS).length,
          total_plans: Object.keys(PLANS).length
        },
        membership_plans: Object.keys(MEMBERSHIP_PLANS),
        micro_products: Object.keys(MICRO_PRODUCTS),
        assessments: Object.keys(ASSESSMENTS),
        guided_programs: Object.keys(GUIDED_PROGRAMS),
        certifications: Object.keys(CERTIFICATIONS)
      }
    });
  } catch (err) {
    return errorResponse(err.status || 500, err.code || "ERROR", err.message || "Failed to load inventory data.");
  }
}
