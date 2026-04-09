import crypto from 'node:crypto';
import {
  resolveEventActions,
  resolveLocale,
  buildEmailJob
} from './event-router-skeleton.mjs';

function nowIso() {
  return new Date().toISOString();
}

function sha256(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

function assertRequired(value, field) {
  if (value === undefined || value === null || value === '') {
    const err = new Error(`Missing required field: ${field}`);
    err.code = 'VALIDATION_ERROR';
    throw err;
  }
}

function planAmount(planCode) {
  if (planCode === 'year1') return 3;
  if (planCode === 'year2') return 60;
  if (planCode === 'year3') return 99;
  const err = new Error('Invalid plan_code');
  err.code = 'VALIDATION_ERROR';
  throw err;
}

function expiresAtByPlan(planCode) {
  const ms = 365 * 24 * 60 * 60 * 1000;
  return new Date(Date.now() + ms).toISOString();
}

function parseOrderIdFromEvent(event) {
  return (
    event?.resource?.supplementary_data?.related_ids?.order_id ||
    event?.resource?.id ||
    null
  );
}

function parseCaptureIdFromEvent(event) {
  return event?.resource?.id || null;
}

/**
 * Adapter contract (replace in real backend):
 * - paypal.createOrder(payload)
 * - paypal.captureOrder(paypalOrderId)
 * - paypal.verifyWebhookSignature(headers, payload)
 * - db.findIdempotency(route, key)
 * - db.insertIdempotency(...)
 * - db.findOrderByInternalOrderId(id)
 * - db.findOrderByPayPalOrderId(id)
 * - db.createOrder(...)
 * - db.updateOrder(...)
 * - db.upsertUserByEmail(...)
 * - db.createPayment(...)
 * - db.insertWebhookEvent(...)
 * - db.isWebhookEventProcessed(eventId)
 * - db.markWebhookProcessed(eventId)
 * - db.insertEmailJob(emailJob)
 * - db.scheduleInternalEvent(...)
 */
export class MembershipPaymentService {
  constructor(adapters) {
    this.paypal = adapters.paypal;
    this.db = adapters.db;
  }

  async createOrder(req) {
    const idempotencyKey = req.headers['x-idempotency-key'];
    assertRequired(idempotencyKey, 'X-Idempotency-Key');

    const body = req.body || {};
    assertRequired(body.email, 'email');
    assertRequired(body.plan_code, 'plan_code');
    assertRequired(body.locale, 'locale');

    const route = '/api/paypal/create-order';
    const payloadHash = sha256(JSON.stringify(body));
    const existing = await this.db.findIdempotency(route, idempotencyKey);

    if (existing) {
      if (existing.request_hash !== payloadHash) {
        return { status: 409, body: { code: 'IDEMPOTENCY_CONFLICT', message: 'Key already used with different payload.' } };
      }
      return { status: existing.status_code, body: existing.response_json };
    }

    const amount = planAmount(body.plan_code);
    const internalOrderId = `ord_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;

    const paypalOrder = await this.paypal.createOrder({
      amount,
      currency: 'USD',
      internalOrderId,
      email: body.email,
      planCode: body.plan_code,
      successUrl: body.success_url,
      cancelUrl: body.cancel_url
    });

    await this.db.createOrder({
      internal_order_id: internalOrderId,
      email: body.email,
      plan_code: body.plan_code,
      amount,
      currency: 'USD',
      paypal_order_id: paypalOrder.id,
      payment_status: 'created',
      fulfillment_status: 'not_fulfilled',
      created_at: nowIso(),
      updated_at: nowIso()
    });

    const response = {
      internal_order_id: internalOrderId,
      paypal_order_id: paypalOrder.id,
      status: 'PAYER_ACTION_REQUIRED',
      approve_url: paypalOrder.approve_url,
      amount,
      currency: 'USD'
    };

    await this.db.insertIdempotency({
      route,
      idempotency_key: idempotencyKey,
      request_hash: payloadHash,
      status_code: 201,
      response_json: response,
      created_at: nowIso()
    });

    return { status: 201, body: response };
  }

  async captureOrder(req) {
    const idempotencyKey = req.headers['x-idempotency-key'];
    assertRequired(idempotencyKey, 'X-Idempotency-Key');

    const body = req.body || {};
    assertRequired(body.internal_order_id, 'internal_order_id');
    assertRequired(body.paypal_order_id, 'paypal_order_id');

    const route = '/api/paypal/capture-order';
    const payloadHash = sha256(JSON.stringify(body));
    const existing = await this.db.findIdempotency(route, idempotencyKey);

    if (existing) {
      if (existing.request_hash !== payloadHash) {
        return { status: 409, body: { code: 'IDEMPOTENCY_CONFLICT', message: 'Key already used with different payload.' } };
      }
      return { status: existing.status_code, body: existing.response_json };
    }

    const order = await this.db.findOrderByInternalOrderId(body.internal_order_id);
    if (!order) {
      return { status: 404, body: { code: 'ORDER_NOT_FOUND', message: 'Order not found.' } };
    }

    const capture = await this.paypal.captureOrder(body.paypal_order_id);

    let response;
    if (capture.status === 'COMPLETED') {
      const user = await this.db.upsertUserByEmail({
        email: order.email,
        membership_type: order.plan_code,
        expires_at: expiresAtByPlan(order.plan_code),
        updated_at: nowIso()
      });

      await this.db.createPayment({
        user_id: user.id,
        amount: order.amount,
        plan: order.plan_code,
        provider: 'paypal',
        provider_ref: capture.capture_id,
        status: 'paid',
        created_at: nowIso()
      });

      await this.db.updateOrder(order.internal_order_id, {
        payment_status: 'captured',
        fulfillment_status: 'fulfilled',
        paypal_capture_id: capture.capture_id,
        captured_at: nowIso(),
        updated_at: nowIso()
      });

      const locale = resolveLocale({ preferredLanguage: user.preferred_language, acceptLanguage: req.headers['accept-language'] });

      await this.db.insertEmailJob(buildEmailJob({
        templateId: 'T03_PAYMENT_RECEIPT',
        recipientEmail: user.email,
        locale,
        payload: {
          order_id: order.internal_order_id,
          capture_id: capture.capture_id,
          amount: order.amount,
          currency: order.currency,
          plan_name: order.plan_code
        }
      }));

      await this.db.insertEmailJob(buildEmailJob({
        templateId: 'T01_WELCOME_MAGIC_LINK',
        recipientEmail: user.email,
        locale,
        payload: {
          order_id: order.internal_order_id,
          capture_id: capture.capture_id,
          plan_name: order.plan_code
        }
      }));

      await this.db.scheduleInternalEvent({ event_type: 'MEMBERSHIP_DAY1', user_id: user.id, run_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString() });
      await this.db.scheduleInternalEvent({ event_type: 'MEMBERSHIP_DAY3', user_id: user.id, run_at: new Date(Date.now() + 72 * 3600 * 1000).toISOString() });

      response = {
        internal_order_id: order.internal_order_id,
        paypal_order_id: body.paypal_order_id,
        capture_id: capture.capture_id,
        capture_status: 'COMPLETED',
        fulfillment_status: 'FULFILLED',
        user_id: user.id,
        membership_type: order.plan_code,
        expires_at: user.expires_at,
        queued_email_templates: ['T03_PAYMENT_RECEIPT', 'T01_WELCOME_MAGIC_LINK']
      };
    } else {
      const status = capture.status === 'DENIED' ? 'DENIED' : 'PENDING';
      await this.db.updateOrder(order.internal_order_id, {
        payment_status: status.toLowerCase(),
        updated_at: nowIso()
      });

      if (status === 'DENIED') {
        const locale = resolveLocale({ acceptLanguage: req.headers['accept-language'] });
        await this.db.insertEmailJob(buildEmailJob({
          templateId: 'T04_PAYMENT_FAILED',
          recipientEmail: order.email,
          locale,
          payload: {
            order_id: order.internal_order_id
          }
        }));
      }

      response = {
        internal_order_id: order.internal_order_id,
        paypal_order_id: body.paypal_order_id,
        capture_id: capture.capture_id || null,
        capture_status: status,
        fulfillment_status: 'NOT_FULFILLED'
      };
    }

    await this.db.insertIdempotency({
      route,
      idempotency_key: idempotencyKey,
      request_hash: payloadHash,
      status_code: 200,
      response_json: response,
      created_at: nowIso()
    });

    return { status: 200, body: response };
  }

  async handleWebhook(req) {
    const headers = req.headers || {};
    const event = req.body || {};

    const eventId = event.id;
    const eventType = event.event_type;
    if (!eventId || !eventType) {
      return { status: 400, body: { code: 'INVALID_EVENT', message: 'Missing event id/type.' } };
    }

    if (await this.db.isWebhookEventProcessed(eventId)) {
      return { status: 202, body: { accepted: true, event_id: eventId } };
    }

    const signatureValid = await this.paypal.verifyWebhookSignature(headers, event);

    await this.db.insertWebhookEvent({
      id: `whe_${crypto.randomUUID().replace(/-/g, '')}`,
      event_id: eventId,
      event_type: eventType,
      transmission_id: headers['paypal-transmission-id'] || null,
      signature_valid: signatureValid ? 1 : 0,
      processed: 0,
      payload_json: JSON.stringify(event),
      received_at: nowIso()
    });

    if (!signatureValid) {
      await this.db.insertEmailJob(buildEmailJob({
        templateId: 'T14_INTERNAL_WEBHOOK_SECURITY',
        recipientEmail: 'dev-ops@internal',
        locale: 'vi',
        payload: { event_id: eventId, event_type: eventType }
      }));
      return { status: 401, body: { code: 'WEBHOOK_SIGNATURE_INVALID', message: 'Invalid signature.' } };
    }

    const actions = resolveEventActions({ source: 'paypal', eventType });
    const orderIdFromEvent = parseOrderIdFromEvent(event);
    const captureId = parseCaptureIdFromEvent(event);

    for (const action of actions) {
      if (action.type === 'STATE_UPDATE' && orderIdFromEvent) {
        const order = await this.db.findOrderByPayPalOrderId(orderIdFromEvent);
        if (order) {
          await this.db.updateOrder(order.internal_order_id, {
            ...action.set,
            paypal_capture_id: captureId || order.paypal_capture_id || null,
            updated_at: nowIso()
          });
        }
      }

      if (action.type === 'QUEUE_EMAIL') {
        const order = orderIdFromEvent ? await this.db.findOrderByPayPalOrderId(orderIdFromEvent) : null;
        const recipient = action.recipient === 'payer_email' ? order?.email : 'ops@internal';
        if (!recipient) continue;

        const locale = resolveLocale({ acceptLanguage: req.headers['accept-language'] });
        await this.db.insertEmailJob(buildEmailJob({
          templateId: action.template_id,
          recipientEmail: recipient,
          locale,
          payload: {
            order_id: order?.internal_order_id || null,
            capture_id: captureId,
            event_id: eventId,
            event_type: eventType
          }
        }));
      }

      if (action.type === 'SCHEDULE_INTERNAL_EVENT') {
        const delayMs = (action.delay_minutes || 0) * 60 * 1000 + (action.delay_hours || 0) * 60 * 60 * 1000;
        await this.db.scheduleInternalEvent({
          event_type: action.internal_event,
          order_id: orderIdFromEvent,
          run_at: new Date(Date.now() + delayMs).toISOString()
        });
      }
    }

    await this.db.markWebhookProcessed(eventId, nowIso());
    return { status: 202, body: { accepted: true, event_id: eventId } };
  }

  async resendMagicLink(req) {
    const body = req.body || {};
    assertRequired(body.email, 'email');

    const user = await this.db.findUserByEmail(body.email);
    if (!user) {
      // Keep response generic for privacy
      return { status: 202, body: { queued: true, template_id: 'T02_MAGIC_LINK_RESEND', expires_in_minutes: 15 } };
    }

    const magicLink = await this.db.createMagicLink({
      email: user.email,
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      created_at: nowIso()
    });

    const locale = resolveLocale({ preferredLanguage: body.locale || user.preferred_language, acceptLanguage: req.headers['accept-language'] });
    await this.db.insertEmailJob(buildEmailJob({
      templateId: 'T02_MAGIC_LINK_RESEND',
      recipientEmail: user.email,
      locale,
      payload: {
        magic_link: magicLink.url,
        magic_link_expire_minutes: 15,
        email: user.email
      }
    }));

    return {
      status: 202,
      body: {
        queued: true,
        template_id: 'T02_MAGIC_LINK_RESEND',
        expires_in_minutes: 15
      }
    };
  }
}
