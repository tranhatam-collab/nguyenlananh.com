import {
  updateAdminUserResponse,
  deleteAdminUserResponse,
} from "../../../../_lib/admin_auth.js";

export const onRequestPatch = updateAdminUserResponse;
export const onRequestDelete = deleteAdminUserResponse;
