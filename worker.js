export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/contact") {
      if (request.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders() });
      }

      if (request.method === "GET") {
        const scriptUrl = env.GOOGLE_SCRIPT_URL || env.VITE_GOOGLE_SCRIPT_URL;
        if (!scriptUrl) {
          return Response.json(
            {
              success: false,
              error: "Contact form is not configured. Set GOOGLE_SCRIPT_URL as a Worker secret.",
            },
            { status: 503, headers: corsHeaders() }
          );
        }

        const target = new URL(scriptUrl);
        url.searchParams.forEach((value, key) => target.searchParams.set(key, value));

        const upstream = await fetch(target.toString());
        const text = await upstream.text();

        return new Response(text, {
          status: upstream.status,
          headers: { ...corsHeaders(), "Content-Type": "application/json" },
        });
      }
    }

    return env.ASSETS.fetch(request);
  },
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
