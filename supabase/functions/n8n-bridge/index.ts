import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

type JsonRecord = Record<string, unknown>;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const asString = (value: unknown) => (typeof value === "string" ? value.trim() : "");
const asNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};
const digitsOnly = (value: unknown) => asString(value).replace(/\D/g, "");

const normalizePhone = (value: unknown) => {
  const digits = digitsOnly(value);
  if (!digits) return "";
  if (digits.startsWith("55")) return digits;
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  return digits;
};

const today = () => new Date().toISOString().slice(0, 10);

const getEnv = (name: string) => {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`${name} is not configured`);
  return value;
};

const createAdminClient = () =>
  createClient(getEnv("SUPABASE_URL"), getEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false },
  });

const createUserClient = (authHeader: string) =>
  createClient(getEnv("SUPABASE_URL"), getEnv("SUPABASE_ANON_KEY"), {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });

const requireServiceCaller = (req: Request) => {
  const expected = getEnv("SUPABASE_SERVICE_ROLE_KEY");
  const authHeader = req.headers.get("Authorization") ?? "";
  if (authHeader !== `Bearer ${expected}`) {
    throw new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

const getAuthenticatedUserId = async (req: Request) => {
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader) return "";

  const userClient = createUserClient(authHeader);
  const { data, error } = await userClient.auth.getUser();
  if (error || !data.user) return "";
  return data.user.id;
};

const handleTriggerOnboarding = async (req: Request, body: JsonRecord) => {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return json({ error: "Unauthorized" }, 401);

  const phone = normalizePhone(body.phone);
  if (!phone) return json({ error: "phone is required" }, 400);

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({
      phone,
      whatsapp_bot_enabled: true,
      whatsapp_connected_at: new Date().toISOString(),
      whatsapp_onboarding_pending: true,
    })
    .eq("user_id", userId);

  if (error) throw error;

  const webhookUrl =
    Deno.env.get("N8N_ONBOARDING_WEBHOOK_URL") ??
    "https://rafamitt.app.n8n.cloud/webhook/conta-ai/zapi/onboarding";
  if (webhookUrl) {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, phone, source: body.source ?? "edge-function" }),
    });

    if (!response.ok) {
      await admin.from("error_logs").insert({
        source: "edge_function",
        severity: "warning",
        message: "Failed to trigger n8n onboarding webhook",
        context: { status: response.status, userId },
        user_id: userId,
      });
    }
  }

  return json({ ok: true, userId, phone });
};

const handleLookupProfileByPhone = async (body: JsonRecord) => {
  const phone = normalizePhone(body.phone);
  if (!phone) return json({ error: "phone is required" }, 400);

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("user_id, phone, full_name, business_name, whatsapp_bot_enabled")
    .eq("phone", phone)
    .maybeSingle();

  if (error) throw error;
  return json({ profile: data, found: Boolean(data) });
};

const handleGetOnboardingProfile = async (body: JsonRecord) => {
  const userId = asString(body.userId ?? body.user_id);
  if (!userId) return json({ error: "userId is required" }, 400);

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("user_id, phone, whatsapp_onboarding_pending")
    .eq("user_id", userId)
    .eq("whatsapp_onboarding_pending", true)
    .maybeSingle();

  if (error) throw error;
  return json({ profile: data, found: Boolean(data) });
};

const handleMarkOnboardingSent = async (body: JsonRecord) => {
  const userId = asString(body.userId ?? body.user_id);
  if (!userId) return json({ error: "userId is required" }, 400);

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .update({
      whatsapp_onboarding_pending: false,
      whatsapp_onboarding_sent_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .select("user_id, whatsapp_onboarding_sent_at")
    .maybeSingle();

  if (error) throw error;
  return json({ profile: data, ok: true });
};

const handleEnsureCustomer = async (body: JsonRecord) => {
  const userId = asString(body.userId ?? body.user_id);
  const phone = normalizePhone(body.phone);
  const name = asString(body.name) || "Cliente WhatsApp";
  if (!userId || !phone) return json({ error: "userId and phone are required" }, 400);

  const admin = createAdminClient();
  const { data: existing, error: lookupError } = await admin
    .from("customers")
    .select("*")
    .eq("user_id", userId)
    .eq("phone", phone)
    .maybeSingle();

  if (lookupError) throw lookupError;
  if (existing) return json({ customer: existing, created: false });

  const { data, error } = await admin
    .from("customers")
    .insert({ user_id: userId, phone, name })
    .select("*")
    .single();

  if (error) throw error;
  return json({ customer: data, created: true });
};

const handleCheckMessage = async (body: JsonRecord) => {
  const messageId = asString(body.messageId ?? body.whatsapp_message_id);
  if (!messageId) return json({ exists: false });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("whatsapp_messages")
    .select("id")
    .eq("whatsapp_message_id", messageId)
    .maybeSingle();

  if (error) throw error;
  return json({ exists: Boolean(data), message: data });
};

const handleLogWhatsappMessage = async (body: JsonRecord) => {
  const userId = asString(body.userId ?? body.user_id);
  const phone = normalizePhone(body.phone ?? body.phoneNumber ?? body.phone_number);
  const direction = asString(body.direction);
  if (!userId || !phone || !direction) {
    return json({ error: "userId, phone and direction are required" }, 400);
  }

  const row = {
    user_id: userId,
    customer_id: asString(body.customerId ?? body.customer_id) || null,
    phone_number: phone,
    whatsapp_message_id: asString(body.messageId ?? body.whatsapp_message_id) || null,
    direction,
    message_type: asString(body.messageType ?? body.message_type) || "text",
    body: asString(body.body) || null,
    media_url: asString(body.mediaUrl ?? body.media_url) || null,
    ai_intent: asString(body.aiIntent ?? body.ai_intent) || null,
    ai_payload: (body.aiPayload ?? body.ai_payload ?? {}) as JsonRecord,
    raw_payload: (body.rawPayload ?? body.raw_payload ?? {}) as JsonRecord,
    status: asString(body.status) || (direction === "inbound" ? "received" : "sent"),
  };

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("whatsapp_messages")
    .upsert(row, { onConflict: "whatsapp_message_id", ignoreDuplicates: false })
    .select("*")
    .maybeSingle();

  if (error) throw error;
  return json({ message: data, ok: true });
};

const handleRecentMessages = async (body: JsonRecord) => {
  const userId = asString(body.userId ?? body.user_id);
  const phone = normalizePhone(body.phone ?? body.phoneNumber ?? body.phone_number);
  const seconds = Math.max(1, asNumber(body.seconds, 45));
  if (!userId || !phone) return json({ error: "userId and phone are required" }, 400);

  const since = new Date(Date.now() - seconds * 1000).toISOString();
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("whatsapp_messages")
    .select("id, body, created_at")
    .eq("user_id", userId)
    .eq("phone_number", phone)
    .eq("direction", "inbound")
    .gte("created_at", since)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return json({
    messages: data ?? [],
    conversationText: (data ?? []).map((item) => item.body).filter(Boolean).join("\n"),
  });
};

const handleRegisterAction = async (body: JsonRecord) => {
  const actionType = asString(body.actionType);
  const actionData = ((body.actionData ?? {}) as JsonRecord) || {};
  const userId = asString(body.userId ?? body.user_id);
  const customerId = asString(body.customerId ?? body.customer_id) || null;
  if (!userId) return json({ error: "userId is required" }, 400);

  const admin = createAdminClient();
  let data: unknown = null;
  let error: unknown = null;

  if (actionType === "create_sale") {
    ({ data, error } = await admin
      .from("sales")
      .insert({
        user_id: userId,
        customer_id: customerId,
        total: asNumber(actionData.total ?? actionData.amount),
        payment_method: asString(actionData.payment_method) || null,
        sold_at: asString(actionData.sold_at) || new Date().toISOString(),
        notes: asString(actionData.notes ?? body.conversationText) || null,
      })
      .select("*")
      .single());
  } else if (actionType === "create_expense") {
    ({ data, error } = await admin
      .from("expenses")
      .insert({
        user_id: userId,
        description: asString(actionData.description) || "Despesa via WhatsApp",
        amount: asNumber(actionData.amount ?? actionData.total),
        category: asString(actionData.category) || null,
        payment_method: asString(actionData.payment_method) || null,
        expense_date: asString(actionData.expense_date) || today(),
        notes: asString(actionData.notes ?? body.conversationText) || null,
      })
      .select("*")
      .single());
  } else if (actionType === "create_appointment") {
    ({ data, error } = await admin
      .from("appointments")
      .insert({
        user_id: userId,
        customer_id: customerId,
        service_name: asString(actionData.service_name ?? actionData.title) || "Atendimento",
        scheduled_at: asString(actionData.scheduled_at) || new Date().toISOString(),
        duration_minutes: asNumber(actionData.duration_minutes, 60),
        price: asNumber(actionData.price),
        notes: asString(actionData.notes ?? body.conversationText) || null,
      })
      .select("*")
      .single());
  } else if (actionType === "create_product") {
    ({ data, error } = await admin
      .from("products")
      .insert({
        user_id: userId,
        name: asString(actionData.name) || "Item via WhatsApp",
        price: asNumber(actionData.price),
        cost: asNumber(actionData.cost),
        category: asString(actionData.category) || null,
        is_service: Boolean(actionData.is_service ?? false),
        description: asString(actionData.description ?? body.conversationText) || null,
      })
      .select("*")
      .single());
  } else if (actionType === "upsert_tax") {
    const monthReference = asString(actionData.month_reference ?? actionData.month);
    if (!monthReference) return json({ error: "month_reference is required for upsert_tax" }, 400);
    ({ data, error } = await admin
      .from("taxes")
      .upsert(
        {
          user_id: userId,
          month_reference: monthReference,
          amount: asNumber(actionData.amount),
          due_date: asString(actionData.due_date) || null,
          pix_code: asString(actionData.pix_code) || null,
          status: asString(actionData.status) || "pending",
        },
        { onConflict: "user_id,month_reference" },
      )
      .select("*")
      .single());
  } else {
    return json({ skipped: true, actionType });
  }

  if (error) throw error;
  return json({ ok: true, actionType, data });
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = (await req.json().catch(() => ({}))) as JsonRecord;
    const action = asString(body.action);

    if (action === "trigger_onboarding") return await handleTriggerOnboarding(req, body);

    try {
      requireServiceCaller(req);
    } catch (response) {
      if (response instanceof Response) return response;
      throw response;
    }

    switch (action) {
      case "lookup_profile_by_phone":
        return await handleLookupProfileByPhone(body);
      case "get_onboarding_profile":
        return await handleGetOnboardingProfile(body);
      case "mark_onboarding_sent":
        return await handleMarkOnboardingSent(body);
      case "ensure_customer":
        return await handleEnsureCustomer(body);
      case "check_message":
        return await handleCheckMessage(body);
      case "log_whatsapp_message":
        return await handleLogWhatsappMessage(body);
      case "recent_messages":
        return await handleRecentMessages(body);
      case "register_action":
        return await handleRegisterAction(body);
      default:
        return json({ error: "Unknown action" }, 400);
    }
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : String(error) }, 500);
  }
});
