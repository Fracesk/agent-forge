import { createOpenAI } from "@ai-sdk/openai"
import { createAnthropic } from "@ai-sdk/anthropic"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { createGroq } from "@ai-sdk/groq"
import type { LanguageModel } from "ai"

// Qwen (Alibaba Cloud DashScope) - OpenAI compatible
const qwen = createOpenAI({
  name: "qwen",
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  apiKey: process.env.QWEN_API_KEY ?? "",
})

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? "",
})

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN || "",
  baseURL: process.env.ANTHROPIC_BASE_URL || undefined,
})

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? "",
})

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY ?? "",
})

const providerRegistry: Record<string, { create: (modelId: string) => LanguageModel }> = {
  qwen: {
    create: (modelId: string) => qwen.chat(modelId),
  },
  openai: {
    create: (modelId: string) => openai.chat(modelId),
  },
  anthropic: {
    create: (modelId: string) => anthropic(modelId),
  },
  deepseek: {
    create: (modelId: string) => anthropic(modelId),
  },
  google: {
    create: (modelId: string) => google(modelId),
  },
  groq: {
    create: (modelId: string) => groq(modelId),
  },
}

export type ProviderName = keyof typeof providerRegistry

export function getModel(modelString: string): LanguageModel {
  const [providerName, ...modelIdParts] = modelString.split(":")
  const modelId = modelIdParts.join(":") || providerName

  const provider = providerRegistry[providerName]
  if (!provider) {
    throw new Error(
      `Unknown provider: "${providerName}". Available providers: ${Object.keys(providerRegistry).join(", ")}`
    )
  }

  try {
    return provider.create(modelId)
  } catch (error) {
    throw new Error(
      `Failed to create model "${modelString}": ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

export function getDefaultModel(): LanguageModel {
  return getModel(process.env.DEFAULT_MODEL || "qwen:qwen3.7-max")
}

export const SUPPORTED_PROVIDERS = [
  { value: "qwen", label: "Qwen (Alibaba Cloud)", models: ["qwen3.7-max", "qwen3.7-max-preview", "qwen3-max"] },
  { value: "deepseek", label: "DeepSeek (via Anthropic)", models: ["deepseek-v4-flash", "deepseek-v4-flash[1M]"] },
  { value: "openai", label: "OpenAI", models: ["gpt-4o", "gpt-4o-mini", "o3-mini"] },
  { value: "anthropic", label: "Anthropic", models: ["claude-sonnet-4-20250514", "claude-haiku-4-20250514"] },
  { value: "google", label: "Google", models: ["gemini-2.0-flash", "gemini-2.0-flash-lite"] },
  { value: "groq", label: "Groq", models: ["llama-3.3-70b-versatile", "mixtral-8x7b-32768"] },
]
