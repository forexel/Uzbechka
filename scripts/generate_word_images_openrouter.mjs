import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const defaultEnvPath = "/Users/d.yudin/apps/Kindlysupport_posting/.env";
const envPath = process.env.OPENROUTER_ENV || defaultEnvPath;
const outDir = resolve(root, "public/word-images");
const limit = Number(process.env.LIMIT || "5");
const offset = Number(process.env.OFFSET || "0");
const onlyMissing = process.env.OVERWRITE !== "1";
const requestedModel = process.env.OPENROUTER_IMAGE_MODEL || "";

function parseEnv(path) {
  const env = {};
  if (!existsSync(path)) return env;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function parseWords() {
  const wordsSource = readFileSync(resolve(root, "src/app/words.ts"), "utf8");
  const match = wordsSource.match(/export const WORDS: Word\[] = (\[[\s\S]*?\]);/);
  if (!match) throw new Error("Could not find WORDS array in src/app/words.ts");
  return JSON.parse(match[1]);
}

function promptFor(word) {
  return [
    `Create an educational flashcard illustration for the concept: "${word.ru}".`,
    `Internal metadata, do not draw it: Uzbek vocabulary item is "${word.uz}".`,
    "Style: clean soft 3D clay/vector illustration, warm off-white background, centered subject, friendly but not childish.",
    "Absolutely no text anywhere in the image. No labels, no captions, no words, no letters, no written numbers, no watermark, no signs with writing.",
    "The output must be a square 1:1 image. Keep the important subject centered with safe margins.",
    "Make the meaning visually obvious for a beginner language learner.",
    word.type === "verb"
      ? "Show a simple everyday action scene with one person doing the action."
      : word.type === "number"
        ? "Show the quantity using countable objects, but do not write the numeral."
        : word.type === "question"
          ? "Show a simple situation where this question word is naturally asked."
          : "Use one clear object or simple everyday scene.",
  ].join(" ");
}

function extractImagePayload(raw) {
  const msg = raw?.choices?.[0]?.message || {};
  const content = msg.content;
  const candidates = [];
  if (Array.isArray(content)) candidates.push(...content);
  if (Array.isArray(msg.images)) candidates.push(...msg.images);
  if (Array.isArray(raw.data)) candidates.push(...raw.data);

  for (const item of candidates) {
    if (!item || typeof item !== "object") continue;
    const url = item.url || item?.image_url?.url || item?.image_url;
    if (typeof url === "string" && url) return { url };
    const b64 = item.b64_json || item.base64 || item.data;
    if (typeof b64 === "string" && b64) return { b64 };
  }

  if (typeof content === "string") {
    const dataMatch = content.match(/data:image\/(png|jpeg|jpg|webp);base64,([A-Za-z0-9+/=]+)/);
    if (dataMatch) return { b64: dataMatch[2] };
    const urlMatch = content.match(/https?:\/\/[^\s)>"]+/);
    if (urlMatch) return { url: urlMatch[0] };
  }

  const topUrl = raw.image_url || raw?.output?.image_url;
  if (typeof topUrl === "string" && topUrl) return { url: topUrl };
  return null;
}

async function downloadImage(payload) {
  if (payload.b64) {
    const data = payload.b64.includes(",") ? payload.b64.split(",").pop() : payload.b64;
    return Buffer.from(data, "base64");
  }
  const response = await fetch(payload.url);
  if (!response.ok) throw new Error(`Image download failed: HTTP ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

async function generate(word, apiKey, model) {
  const isFluxLike = model.toLowerCase().includes("flux") || model.toLowerCase().startsWith("black-forest-labs/");
  const body = {
    model,
    messages: [{ role: "user", content: promptFor(word) }],
    usage: { include: true },
    modalities: isFluxLike ? ["image"] : ["image", "text"],
    aspect_ratio: "1:1",
    size: "1024x1024",
    image: {
      size: "1024x1024",
      aspect_ratio: "1:1",
      output_format: "png",
      quality: "medium",
    },
  };

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:5175",
      "X-Title": "Uzbechka word image generator",
    },
    body: JSON.stringify(body),
  });

  const rawText = await response.text();
  let raw;
  try {
    raw = JSON.parse(rawText);
  } catch {
    throw new Error(`OpenRouter returned non-JSON response: ${rawText.slice(0, 400)}`);
  }
  if (!response.ok) {
    throw new Error(`OpenRouter HTTP ${response.status}: ${rawText.slice(0, 800)}`);
  }
  const payload = extractImagePayload(raw);
  if (!payload) {
    throw new Error(`No image in OpenRouter response for ${word.id}`);
  }
  return downloadImage(payload);
}

const env = parseEnv(envPath);
const apiKey = process.env.OPENROUTER_API_KEY || env.OPENROUTER_API_KEY || "";
const model = requestedModel || env.OPENROUTER_IMAGE_MODEL || env.LOCKED_OPENROUTER_IMAGE_MODEL || "black-forest-labs/flux.2-pro";

if (!apiKey) {
  throw new Error(`OPENROUTER_API_KEY not found. Checked OPENROUTER_API_KEY and ${envPath}`);
}

mkdirSync(outDir, { recursive: true });
const words = parseWords();
const batch = words.slice(offset, Number.isFinite(limit) && limit > 0 ? offset + limit : undefined);

console.log(`Generating ${batch.length} word images using ${model}`);
for (const word of batch) {
  const target = resolve(outDir, `${word.id}.png`);
  if (onlyMissing && existsSync(target)) {
    console.log(`skip ${word.id} ${word.uz}`);
    continue;
  }
  console.log(`generate ${word.id} ${word.uz}`);
  const imageBytes = await generate(word, apiKey, model);
  writeFileSync(target, imageBytes);
}
console.log(`Done. Images saved to ${outDir}`);
