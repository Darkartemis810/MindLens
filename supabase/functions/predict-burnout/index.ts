import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { sleepHours, studyHours, screenTime, socialInteraction, stressLevel } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("API key not configured");

    const prompt = `A student has the following lifestyle data:
- Sleep: ${sleepHours} hours/day
- Study: ${studyHours} hours/day
- Screen time: ${screenTime} hours/day
- Social interaction: ${socialInteraction}/10
- Self-reported stress: ${stressLevel}/10

Predict their burnout risk level (Low, Medium, or High) and provide 3-4 personalized tips.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a student burnout predictor. Analyze lifestyle data and predict risk." },
          { role: "user", content: prompt }
        ],
        tools: [{
          type: "function",
          function: {
            name: "predict_burnout",
            description: "Return burnout prediction",
            parameters: {
              type: "object",
              properties: {
                risk_level: { type: "string", enum: ["Low", "Medium", "High"] },
                tips: { type: "array", items: { type: "string" } }
              },
              required: ["risk_level", "tips"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "predict_burnout" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits depleted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("predict-burnout error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
