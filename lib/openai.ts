import OpenAI from "openai";
import type { DatasetSummary } from "@/types";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? "",
});

export function buildInsightsPrompt(summary: DatasetSummary): string {
  return `You are an analytics expert for a SaaS product called Pulse.
Analyze the following dataset summary and return exactly 3 bullet-point insights about anomalies, trends, or actionable observations.
Be concise (one sentence each). Do not include a preamble.

Dataset summary (JSON):
${JSON.stringify(summary, null, 2)}`;
}
