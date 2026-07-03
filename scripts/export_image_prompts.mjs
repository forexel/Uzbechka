import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const wordsSource = readFileSync(resolve(root, "src/app/words.ts"), "utf8");
const match = wordsSource.match(/export const WORDS: Word\[] = (\[[\s\S]*?\]);/);

if (!match) {
  throw new Error("Could not find WORDS array in src/app/words.ts");
}

const words = JSON.parse(match[1]);
const rows = [
  ["id", "type", "uz", "ru", "prompt"],
  ...words.map((word) => [
    word.id,
    word.type,
    word.uz,
    word.ru,
    `Create a square 1024x1024 educational flashcard illustration for the Uzbek word "${word.uz}" meaning "${word.ru}". Style: clean soft 3D clay/vector illustration, warm off-white background, centered subject, friendly but not childish, no text, no letters, no numbers, no watermark. Make the meaning visually obvious for a beginner language learner. Use one clear object or simple everyday scene.`,
  ]),
];

const csv = rows
  .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
  .join("\n");

const out = resolve(root, "docs/generated/word-image-prompts.csv");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, csv);
console.log(`Wrote ${words.length} prompts to ${out}`);
