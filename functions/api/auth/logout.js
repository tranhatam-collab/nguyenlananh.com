import { json } from "../../_lib/utils.js";

export async function onRequestPost() {
  return json({ ok: true }, {
    headers: {
      "Set-Cookie": "__nla_session=; HttpOnly; Secure; Path=/; Max-Age=0; SameSite=Lax"
    }
  });
}
