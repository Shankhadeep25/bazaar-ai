// ─── Intent Detector ─────────────────────────────────────────────────────────
// Classifies user messages: new_search | follow_up | comparison | clarification
// Rule-based first pass, falls back to Gemini for ambiguous queries.

import { Intent, ChatMessage } from './types';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

// ─── Rule-Based Detection ────────────────────────────────────────────────────

const COMPARISON_PATTERNS = [
  /\b(compare|comparison|vs|versus|differ|difference|between)\b/i,
  /\bwhich\s+(is|one|should)\b/i,
  /\bbetter\s+(than|between|of)\b/i,
];

const FOLLOW_UP_PATTERNS = [
  /\b(does it|do they|is it|are they|what about|how about|tell me more)\b/i,
  /\b(thunderbolt|usb|port|screen|display|battery|camera|processor|ram|storage)\b/i,
  /\b(warranty|delivery|return|shipping)\b/i,
  /\bit\b/i, // pronoun reference to previous product
];

const CLARIFICATION_PATTERNS = [
  /\b(what do you mean|can you explain|clarify|elaborate|more details)\b/i,
  /\b(sorry|didn't understand|not clear|confused)\b/i,
];

const NEW_SEARCH_PATTERNS = [
  /\b(show me|find|search|looking for|suggest|recommend|best|top)\b/i,
  /\b(under|below|around|budget|₹|rs|inr)\b/i,
  /\b(laptop|phone|headphone|tablet|camera|tv|watch)\b/i,
];

export function detectIntentRuleBased(
  message: string,
  hasHistory: boolean
): Intent | null {
  // Comparison is most specific — check first
  if (COMPARISON_PATTERNS.some((p) => p.test(message))) {
    return 'comparison';
  }

  // If no history, it's always a new search
  if (!hasHistory) {
    return 'new_search';
  }

  // Clarification
  if (CLARIFICATION_PATTERNS.some((p) => p.test(message))) {
    return 'clarification';
  }

  // New search indicators (strong product/budget keywords)
  const hasNewSearchSignals = NEW_SEARCH_PATTERNS.filter((p) => p.test(message)).length;
  if (hasNewSearchSignals >= 2) {
    return 'new_search';
  }

  // Follow-up (references to specs, pronouns, etc.)
  if (FOLLOW_UP_PATTERNS.some((p) => p.test(message))) {
    return 'follow_up';
  }

  // Ambiguous — return null for LLM fallback
  return null;
}

// ─── LLM Fallback ────────────────────────────────────────────────────────────

let llm: ChatGoogleGenerativeAI | null = null;

function getLLM(): ChatGoogleGenerativeAI {
  if (!llm) {
    llm = new ChatGoogleGenerativeAI({
      model: 'gemini-2.0-flash',
      apiKey: process.env.GOOGLE_API_KEY,
      temperature: 0,
      maxOutputTokens: 20,
    });
  }
  return llm;
}

export async function detectIntent(
  message: string,
  history: ChatMessage[]
): Promise<Intent> {
  // Try rule-based first
  const ruleResult = detectIntentRuleBased(message, history.length > 0);
  if (ruleResult) return ruleResult;

  // LLM fallback for ambiguous queries
  try {
    const model = getLLM();
    const response = await model.invoke([
      {
        role: 'system',
        content:
          'Classify this user message as exactly one of: new_search, follow_up, comparison, clarification. Reply with ONLY the classification word.',
      },
      {
        role: 'user',
        content: `Previous conversation exists: ${history.length > 0 ? 'yes' : 'no'}\nMessage: "${message}"`,
      },
    ]);

    const classification = (typeof response.content === 'string' ? response.content : '')
      .trim()
      .toLowerCase() as Intent;

    if (['new_search', 'follow_up', 'comparison', 'clarification'].includes(classification)) {
      return classification;
    }
  } catch (err) {
    console.warn('[IntentDetector] LLM fallback failed:', err);
  }

  // Default: if history exists it's follow_up, otherwise new_search
  return history.length > 0 ? 'follow_up' : 'new_search';
}
