import {
  listAdminUsersResponse,
  createAdminUserResponse,
} from "../../../_lib/admin_auth.js";

export const onRequestGet = listAdminUsersResponse;
export const onRequestPost = createAdminUserResponse;
