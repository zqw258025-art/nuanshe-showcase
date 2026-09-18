export const GENERATION_STAGES = [
  { id: "analyze", label: "Analyzing image...", detail: "读取构图与画面结构" },
  { id: "understand", label: "Understanding space...", detail: "理解空间用途与视线关系" },
  { id: "style", label: "Applying visual style...", detail: "组合设计、摄影与材质语言" },
  { id: "generate", label: "Generating result...", detail: "整理真实历史输出" },
  { id: "complete", label: "Complete", detail: "Demo 结果已就绪" },
];

export const INPUT_TYPES = [
  { id: "white-model", label: "白模渲染", prompt: "以白模为基础，完整推演真实材质、光影与软装。" },
  { id: "refine", label: "效果图精修", prompt: "保持现有构图与设计，精修画质、光影、材质与氛围。" },
];

export const SPACES = [
  { id: "living_room", label: "客厅" },
  { id: "dining_room", label: "餐厅" },
  { id: "bedroom", label: "卧室" },
  { id: "hotel", label: "酒店空间" },
  { id: "exhibition", label: "展厅" },
  { id: "commercial", label: "商业空间" },
];

export const PHOTOGRAPHIC_STYLES = [
  { id: "architectural_digest", label: "杂志级建筑摄影", prompt: "杂志级建筑摄影，准确透视与克制色彩。" },
  { id: "luxury_realestate", label: "高端地产样板间", prompt: "高端地产摄影，整洁构图与精致材质表现。" },
  { id: "cinematic", label: "电影感", prompt: "电影感光线，柔和层次与明确视觉重心。" },
  { id: "natural_daylight", label: "自然光通透", prompt: "自然日光，真实阴影与通透空间感。" },
];

export const DESIGN_STYLES = [
  { id: "modern", label: "现代简约", prompt: "黑白灰基调配少量点缀色，利落线条与通透光线。" },
  { id: "cream", label: "奶油风", prompt: "奶油白、燕麦色、微水泥与柔和漫射光。" },
  { id: "neo-chinese", label: "新中式", prompt: "胡桃木、留白、格栅与素雅低饱和配色。" },
  { id: "wabi-sabi", label: "侘寂", prompt: "微水泥、黏土肌理、大地色与静谧光影。" },
  { id: "nordic", label: "北欧", prompt: "原木、白墙、棉麻布艺与明亮自然光。" },
  { id: "industrial", label: "工业风", prompt: "混凝土、深色金属、皮革与暖黄灯光。" },
  { id: "italian-minimal", label: "意式极简", prompt: "大理石、胡桃木、暖灰调与克制的奢华感。" },
  { id: "korean-ins", label: "韩系 ins", prompt: "奶油白、浅原木、圆润细节与柔和自然光。" },
  { id: "mid-century", label: "中古风", prompt: "柚木、弧形家具、暖橙与橄榄绿点缀。" },
  { id: "french", label: "法式", prompt: "石膏线、拱形元素、柔白米色与黄铜细节。" },
  { id: "wood", label: "原木风", prompt: "大面积原木、白墙、棉麻布艺与绿植。" },
  { id: "light-luxury", label: "轻奢", prompt: "大理石、金属线条、丝绒与精致暖光。" },
  { id: "american", label: "美式", prompt: "实木家具、皮革、米色织物与稳重层次。" },
];

export const LIGHTING_TIMES = [
  { id: "morning", label: "上午", prompt: "清透晨光" },
  { id: "noon", label: "正午", prompt: "明亮自然光" },
  { id: "afternoon", label: "下午", prompt: "暖调午后光线" },
  { id: "dusk", label: "黄昏", prompt: "低角度金色光线" },
  { id: "overcast", label: "阴天", prompt: "均匀柔和的漫射光" },
  { id: "night", label: "夜晚", prompt: "室内灯具为主的暖光" },
];

export const RESULT_OPTIONS = [
  {
    id: "afternoon",
    title: "暖光午后",
    tag: "光影氛围",
    src: "images/result-afternoon.jpg",
    alt: "暖舍真实生成的餐厅暖光午后效果",
  },
  {
    id: "final",
    title: "精修基准",
    tag: "材质细节",
    src: "images/result-final.jpg",
    alt: "暖舍真实生成的餐厅精修效果",
  },
  {
    id: "people",
    title: "人物生活版",
    tag: "人物融入",
    src: "images/result-people.jpg",
    alt: "暖舍真实生成的人物生活版餐厅效果",
  },
];

export const CASES = [
  {
    id: "case-01",
    index: "01",
    title: "餐厅暖光精修",
    meta: "Original → AI Enhanced",
    before: "images/sample-input.jpg",
    after: "images/result-afternoon.jpg",
  },
  {
    id: "case-02",
    index: "02",
    title: "居住空间氛围",
    meta: "Real archived pair",
    before: "images/case-02-input.jpg",
    after: "images/case-02-result.jpg",
  },
  {
    id: "case-03",
    index: "03",
    title: "低饱和材质表达",
    meta: "Real archived pair",
    before: "images/case-03-input.jpg",
    after: "images/case-03-result.jpg",
  },
  {
    id: "case-04",
    index: "04",
    title: "空间光影重建",
    meta: "Real archived pair",
    before: "images/case-04-input.jpg",
    after: "images/case-04-result.jpg",
  },
];

export const DEFAULT_STATE = Object.freeze({
  inputType: "refine",
  space: "dining_room",
  photography: "architectural_digest",
  style: "italian-minimal",
  material: "胡桃木、天然石材、亚麻布艺",
  lighting: "afternoon",
  includePeople: false,
  peopleScene: "reading",
  resolution: "2K",
  selectedResult: "afternoon",
});

export function labelFor(items, id) {
  return items.find((item) => item.id === id)?.label || id;
}

export function promptFor(state) {
  const inputType = INPUT_TYPES.find((item) => item.id === state.inputType);
  const space = labelFor(SPACES, state.space);
  const photography = PHOTOGRAPHIC_STYLES.find((item) => item.id === state.photography);
  const style = DESIGN_STYLES.find((item) => item.id === state.style);
  const lighting = LIGHTING_TIMES.find((item) => item.id === state.lighting);

  return [
    `空间：${space}。`,
    inputType?.prompt,
    style ? `设计风格：${style.label}。${style.prompt}` : "",
    photography?.prompt,
    lighting ? `光线：${lighting.prompt}。` : "",
    state.material ? `材质偏好：${state.material}。` : "",
    state.includePeople ? "在真实输出中提供人物生活版本，人物光影与空间一致。" : "基础版本不添加人物。",
    `输出：${state.resolution}，保持透视、结构与空间比例一致。`,
    "Demo 提示：本段仅用于展示暖舍 V2 的参数组合思路，不会发送给任何模型。",
  ]
    .filter(Boolean)
    .join("\n");
}
