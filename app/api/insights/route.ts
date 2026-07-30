import { getTenantContext } from "@/lib/auth";
import { getOrgDatasetSummary } from "@/lib/data";
import { openai, buildInsightsPrompt } from "@/lib/openai";
import { getPlanLimits } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const tenant = await getTenantContext();
  if (!tenant) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!getPlanLimits(tenant.plan).aiInsights) {
    return new Response("AI insights require a Pro plan.", { status: 403 });
  }

  const summary = await getOrgDatasetSummary(tenant.organisationId);
  if (summary.rowCount === 0) {
    return new Response("No data available to analyze.", { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return new Response("OpenAI is not configured.", { status: 500 });
  }

  const encoder = new TextEncoder();

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o",
      stream: true,
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content:
            "You are a concise analytics assistant. Respond with plain-text bullet points only.",
        },
        { role: "user", content: buildInsightsPrompt(summary) },
      ],
    });

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const text = chunk.choices[0]?.delta?.content ?? "";
            if (text) controller.enqueue(encoder.encode(text));
          }
        } catch (err) {
          controller.enqueue(
            encoder.encode(
              `\n\n[Insight generation interrupted: ${
                err instanceof Error ? err.message : "unknown error"
              }]`
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (err) {
    return new Response(
      err instanceof Error ? err.message : "Failed to generate insights.",
      { status: 500 }
    );
  }
}
