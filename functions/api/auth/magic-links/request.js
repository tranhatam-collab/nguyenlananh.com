import { signupMagicLinkResponse } from "../../../_lib/auth.js";

// POST /api/auth/magic-links/request
// Sends a magic-link to the given email (creates account if first time)
export const onRequestPost = signupMagicLinkResponse;
