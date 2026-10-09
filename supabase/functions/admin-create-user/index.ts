import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

function response(status: number, body: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

Deno.serve(async request => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return response(405, { error: "Only POST is supported." });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    console.error("Admin invite function is missing Supabase environment variables.");
    return response(500, { error: "Account invitations are not configured on the server." });
  }

  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return response(401, { error: "Sign in before inviting an account." });

  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const { data: callerData, error: callerError } = await callerClient.auth.getUser(authorization.slice(7));
  if (callerError || !callerData.user) return response(401, { error: "Your session is invalid or expired." });

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const { data: profile, error: profileError } = await adminClient
    .from("campus_profiles")
    .select("role,active")
    .eq("id", callerData.user.id)
    .maybeSingle();
  if (profileError) {
    console.error("Admin invite function could not verify the caller's role.", profileError);
    return response(500, { error: "Administrator access could not be verified." });
  }
  if (!profile || !profile.active || profile.role !== "admin") {
    return response(403, { error: "Administrator access required." });
  }

  let body: { name?: unknown; email?: unknown; redirectTo?: unknown };
  try {
    body = await request.json();
  } catch {
    return response(400, { error: "Request body must be valid JSON." });
  }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (name.length < 2 || name.length > 100) return response(400, { error: "Name must be between 2 and 100 characters." });
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return response(400, { error: "Enter a valid email address." });
  }
  let redirectTo: string | undefined;
  if (typeof body.redirectTo === "string") {
    try {
      const requestedRedirect = new URL(body.redirectTo);
      const origin = request.headers.get("Origin");
      if (!origin || requestedRedirect.origin !== origin || !["https:", "http:"].includes(requestedRedirect.protocol)) {
        return response(400, { error: "The invitation redirect must use this website's origin." });
      }
      redirectTo = requestedRedirect.href;
    } catch {
      return response(400, { error: "The invitation redirect URL is invalid." });
    }
  }

  const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
    data: { full_name: name },
    redirectTo
  });
  if (error) {
    console.error("Admin invite function could not send an account invitation.", error);
    return response(400, { error: error.message });
  }
  return response(200, { id: data.user.id, email: data.user.email || email });
});
