import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { journalsData, moodsData, burnoutData, questionnaireData } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const context = [];
    if (journalsData && journalsData.length > 0) {
      context.push("Recent Journals:");
      journalsData.forEach((j: any, i: number) => {
        context.push(`- Day ${i}: mood=${j.mood_score}/10, emotion=${j.emotion}, sentiment=${j.sentiment}`);
      });
    }
    if (moodsData && moodsData.length > 0) {
      context.push("Recent Camera Emotions:");
      moodsData.forEach((m: any, i: number) => context.push(`- Scan ${i}: ${m.emotion} (${m.confidence}% confidence)`));
    }
    if (burnoutData && burnoutData.length > 0) {
      context.push("Burnout Risk History:");
      burnoutData.forEach((b: any, i: number) => context.push(`- Assessment ${i}: Risk=${b.risk_level}, Sleep=${b.sleep_hours}h, Study=${b.study_hours}h`));
    }
    if (questionnaireData && questionnaireData.length > 0) {
      context.push("Questionnaire History:");
      questionnaireData.forEach((q: any, i: number) => context.push(`- Score ${i}: Total=${q.total_score}/24, Anxiety=${q.anxiety_score}, Stress=${q.stress_score}, Fatigue=${q.fatigue_score}`));
    }

    if (context.length === 0) {
      return new Response(JSON.stringify({ suggestions: ["Complete assessments to generate a holistic report."] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const payloadContext = context.join("\n");
    const prompt = `You are an expert student wellbeing AI. Analyze the following combined historical data (up to 30 days of journals, moods, burnout risks, and questionnaires). Provide exactly 3 to 5 highly actionable, insightful, and supportive suggestions based on the trends you see across the different metrics.\n\nStudent Data:\n${payloadContext}`;

    // Fix for Gemini API format. 
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        systemInstruction: {
          parts: [{ text: "Return only a JSON object strictly matching this format: { \"suggestions\": [\"suggestion 1\", \"suggestion 2\", \"suggestion 3\"] }. No surrounding markdown." }]
        },
        generationConfig: {
          responseMimeType: "application/json",
        }
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API Error:", errText);
      throw new Error("Gemini API error");
    }

    const data = await response.json();
    let textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "{\"suggestions\": []}";

    // Safety parsing
    try {
      const parsed = JSON.parse(textResponse);
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (parseError) {
      return new Response(JSON.stringify({ suggestions: ["Unable to parse AI response. Keep logging your data!"] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

  } catch (e) {
    console.error("ai-suggestions error:", e);
    return new Response(JSON.stringify({ suggestions: ["Configure the GEMINI_API_KEY on the server to enable comprehensive AI reports."] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
