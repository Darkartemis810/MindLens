import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { latestJournal, latestMood, latestBurnout, latestQuestionnaire } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("API key not configured");

    const context = [];
    if (latestJournal) context.push(`Journal: sentiment=${latestJournal.sentiment}, emotion=${latestJournal.emotion}, mood=${latestJournal.mood_score}/10`);
    if (latestMood) context.push(`Camera emotion: ${latestMood.emotion}`);
    if (latestBurnout) context.push(`Burnout risk: ${latestBurnout.risk_level}, sleep=${latestBurnout.sleep_hours}h, study=${latestBurnout.study_hours}h`);
    if (latestQuestionnaire) context.push(`Questionnaire: total=${latestQuestionnaire.total_score}/24, anxiety=${latestQuestionnaire.anxiety_score}, stress=${latestQuestionnaire.stress_score}`);

    if (context.length === 0) {
      return new Response(JSON.stringify({ suggestions: [] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a student wellbeing advisor. Generate 3-5 actionable, supportive suggestions based on the student's data. Be specific and practical." },
          { role: "user", content: `Student data:\n${context.join("\n")}` }
        ],
        tools: [{
          type: "function",
          function: {
            name: "provide_suggestions",
            description: "Return wellbeing suggestions",
            parameters: {
              type: "object",
              properties: {
                suggestions: { type: "array", items: { type: "string" } }
              },
              required: ["suggestions"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "provide_suggestions" } }
      }),
    });

    if (!response.ok) throw new Error("AI gateway error");

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-suggestions error:", e);
    return new Response(JSON.stringify({ suggestions: ["Take short breaks between study sessions", "Aim for 7-8 hours of sleep", "Stay connected with friends and family"] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
