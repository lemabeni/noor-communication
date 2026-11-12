import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: cors });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Méthode non autorisée." }, 405);

  const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "Connexion requise." }, 401);

  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anonKey || !serviceKey) {
    return json({ error: "Configuration serveur incomplète." }, 500);
  }

  const caller = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: userData, error: userError } = await caller.auth.getUser(token);
  if (userError || !userData.user) return json({ error: "Session invalide." }, 401);

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: roleRow, error: roleError } = await admin
    .from("noor_admin_users")
    .select("role")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  let body: { action?: string; email?: string } = {};
  try {
    body = await req.json();
  } catch {
    return json({ error: "Requête invalide." }, 400);
  }

  if (body.action === "check") {
    return json({ isAdmin: !!roleRow, role: roleRow?.role || null });
  }
  if (roleError || roleRow?.role !== "owner") {
    return json({ error: "Seul l’administrateur principal peut gérer les comptes." }, 403);
  }

  if (body.action === "list") {
    const { data: rows, error } = await admin
      .from("noor_admin_users")
      .select("user_id,role,created_at")
      .order("created_at", { ascending: true });
    if (error) return json({ error: "Impossible de lire les administrateurs." }, 500);

    const admins = await Promise.all((rows || []).map(async (a) => {
      const { data } = await admin.auth.admin.getUserById(a.user_id);
      return { ...a, email: data.user?.email || null };
    }));
    return json({ admins, limit: 3 });
  }

  if (body.action !== "invite") return json({ error: "Action inconnue." }, 400);
  const email = String(body.email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: "Adresse e-mail invalide." }, 400);
  }

  const { count, error: countError } = await admin
    .from("noor_admin_users")
    .select("user_id", { count: "exact", head: true });
  if (countError) return json({ error: "Impossible de vérifier le nombre d’administrateurs." }, 500);
  if ((count || 0) >= 3) return json({ error: "La limite de trois administrateurs est atteinte." }, 409);

  const { data: invitation, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email);
  if (inviteError || !invitation.user) {
    return json({ error: inviteError?.message || "Invitation impossible." }, 400);
  }

  const { error: insertError } = await admin
    .from("noor_admin_users")
    .insert({ user_id: invitation.user.id, role: "admin" });
  if (insertError) {
    await admin.auth.admin.deleteUser(invitation.user.id);
    return json({ error: "Invitation non enregistrée. Aucun accès administrateur n’a été accordé." }, 500);
  }

  return json({
    success: true,
    email,
    message: "Invitation envoyée. Le compte sera activable depuis le lien reçu par e-mail.",
  });
});
