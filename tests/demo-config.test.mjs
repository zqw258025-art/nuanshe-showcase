import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  CASES,
  DEFAULT_STATE,
  DESIGN_STYLES,
  GENERATION_STAGES,
  RESULT_OPTIONS,
  promptFor,
} from "../src/demo-config.js";

test("使用 V2 的完整五阶段生成流程", () => {
  assert.deepEqual(
    GENERATION_STAGES.map((stage) => stage.label),
    [
      "Analyzing image...",
      "Understanding space...",
      "Applying visual style...",
      "Generating result...",
      "Complete",
    ],
  );
});

test("保留暖舍 V2 的 13 种真实设计风格", () => {
  assert.equal(DESIGN_STYLES.length, 13);
  assert.ok(DESIGN_STYLES.some((style) => style.label === "意式极简"));
  assert.ok(DESIGN_STYLES.some((style) => style.label === "奶油风"));
});

test("所有展示结果均指向本地真实素材", () => {
  for (const item of [...CASES, ...RESULT_OPTIONS]) {
    const paths = [item.before, item.after, item.src].filter(Boolean);
    for (const assetPath of paths) {
      assert.match(assetPath, /^images\/[\w.-]+\.jpg$/);
    }
  }
});

test("提示词明确标注这是静态 Demo", () => {
  const prompt = promptFor(DEFAULT_STATE);
  assert.match(prompt, /Demo 提示/);
  assert.match(prompt, /不会发送给任何模型/);
  assert.match(prompt, /餐厅/);
  assert.match(prompt, /意式极简/);
});

test("前端代码不包含后端请求或 API Key", async () => {
  const files = ["../src/app.js", "../src/demo-config.js"];
  for (const file of files) {
    const source = await readFile(new URL(file, import.meta.url), "utf8");
    assert.doesNotMatch(source, /\bfetch\s*\(/);
    assert.doesNotMatch(source, /XMLHttpRequest/);
    assert.doesNotMatch(source, /88api/i);
    assert.doesNotMatch(source, /api[-_ ]?key/i);
  }
});
