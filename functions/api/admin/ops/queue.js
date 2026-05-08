import {
  clearAdminOpsQueueResponse,
  listAdminOpsQueueResponse,
  upsertAdminOpsQueueResponse
} from "../../../_lib/admin_ops.js";

export const onRequestGet = listAdminOpsQueueResponse;
export const onRequestPost = upsertAdminOpsQueueResponse;
export const onRequestDelete = clearAdminOpsQueueResponse;
