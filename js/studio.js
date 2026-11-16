/* =========================================================
   studio.js：提示词工作台、修改指令卡、能力盘点提示词
   ========================================================= */

/* ---------- 第 0 步：隐喻卡 ---------- */
const METAPHORS = [
  ["🌿", "一座花园", "每个项目是一株植物，边走边看，尽头遇见主人"],
  ["🚇", "一条地铁线路", "每段经历是一站，沿着时间往前开"],
  ["🎮", "一份游戏存档", "能力是角色属性，项目是已解锁的成就"],
  ["🖼", "一场展览", "一个展厅一件作品，配上展签和导览"],
  ["💻", "一台电脑桌面", "图标就是作品，点开是窗口"],
  ["📒", "一本手账", "一页一个故事，贴纸、胶带、手写批注"],
  ["🎵", "一张歌单", "每个项目是一首歌，有曲名、时长和歌词"],
  ["🗺", "一张旅行地图", "每段经历是地图上的一个地点"]
];
const concept = { meta: null, desc: "", ip: true, three: true };

$("#metaCards").innerHTML = METAPHORS.map(([e, n, d], i) =>
  `<button type="button" class="meta" data-i="${i}"><span class="emo">${e}</span><b>${n}</b><small>${d}</small></button>`).join("");

function pickMeta(i) {
  $$("#metaCards .meta").forEach((m, k) => m.classList.toggle("on", k === i));
  if (i === null) return;
  const [e, n, d] = METAPHORS[i];
  concept.meta = n; concept.desc = d;
  $("#ownMeta").value = "";
  $("#pickedMeta").innerHTML = `${e} 我的网站是<b>${n}</b>：${d}`;
  renderPrompt();
}
$("#metaCards").addEventListener("click", (e) => { const b = e.target.closest(".meta"); if (b) pickMeta(Number(b.dataset.i)); });
$("#drawBtn").addEventListener("click", () => {
  const cards = $$("#metaCards .meta");
  let n = 0, i = 0;
  const spin = setInterval(() => {
    i = Math.floor(Math.random() * cards.length);
    cards.forEach((c, k) => c.classList.toggle("flicker", k === i));
    if (++n > 9) { clearInterval(spin); cards.forEach((c) => c.classList.remove("flicker")); pickMeta(i); }
  }, 90);
});
$("#ownMeta").addEventListener("input", (e) => {
  const v = e.target.value.trim();
  pickMeta(null);
  concept.meta = v || null; concept.desc = "";
  $("#pickedMeta").innerHTML = v ? `✏️ 我的网站是<b>${esc(v)}</b>` : "还没选：基础模式也完全可以。";
  renderPrompt();
});
$("#optIp").addEventListener("change", (e) => { concept.ip = e.target.checked; renderPrompt(); });
$("#optThree").addEventListener("change", (e) => { concept.three = e.target.checked; renderPrompt(); });

/* ---------- 提示词工作台 ---------- */
const form = $("#studioForm");
const TODO = "【待填写】";
let mode = "basic";

$("#modeSeg").addEventListener("click", (e) => {
  const b = e.target.closest("button"); if (!b) return;
  $$("#modeSeg button").forEach((x) => x.classList.toggle("on", x === b));
  mode = b.dataset.mode;
  renderPrompt();
});

function buildPrompt(v) {
  const f = (x) => (x && x.trim()) ? `⟦${x.trim()}⟧` : TODO;     // ⟦⟧ 标记学生填写的内容，显示时高亮
  const custom = mode === "custom";
  const meta = concept.meta ? `⟦${concept.meta}${concept.desc ? "：" + concept.desc : ""}⟧` : "【待选择：回上一页选一个隐喻】";
  const idea = v.idea && v.idea.trim() ? `\n   我还有一个特别的想法：${f(v.idea)}。` : "";

  const design = custom ? `0. 网站概念：我的网站是${meta}。请让布局、导航、交互和文案语气都围绕这个隐喻展开，不要套用普通的个人主页模板。${idea}
1. 视觉定位：${concept.ip ? "我会同时发给你我的 IP 形象图，请从图中提取 3 种主色作为网站配色（按 60-30-10 分配），网站气质要和 IP 形象一致。" : ""}${v.style && v.style.trim() ? f(v.style) : (concept.ip ? "" : "整体风格要符合我的个人定位，气质统一。")}
2. 信息层级：3 秒内让访客知道这是一个什么样的网站、该往哪里看；重要信息更醒目，层级分明。
3. 用户路径：推荐「认识我 → 了解能力 → 查看项目 → 联系我」的顺序，但可以按隐喻重新设计路线；无论怎么设计，都要保证访客能找到我的姓名、专业年级和邮箱。
4. 视觉统一：颜色不超过 3 种，字体不超过 2 种。
5. 留白对齐：模块之间留白充足，元素对齐。
6. 项目呈现：形式可以随隐喻变化（不一定是卡片），但每个项目都要有标题、图片和 2–3 句说明。
7. 图片交互：${f(v.interact)}。
8. 避免 AI 模板感：不要紫蓝渐变、不要千篇一律的居中大标题加三张卡片、不要所有元素都是圆角阴影。`
  : `1. 视觉定位：${v.style && v.style.trim() ? f(v.style) : "整体风格要符合我的个人定位，气质统一。"}
2. 信息层级：3 秒内让访客知道这是一个什么样的网站、该往哪里看；重要信息更大、更醒目，标题、正文、说明文字层级分明。
3. 用户路径：推荐按照「认识我 → 了解能力 → 查看项目 → 联系我」的顺序组织页面，也可以根据我的内容调整。${idea}
4. 视觉统一：使用 60-30-10 配色法则，颜色不超过 3 种，字体不超过 2 种。
5. 留白对齐：模块之间留白充足，间距尽量使用 8px 的倍数，元素对齐。
6. 内容网页化：用标题、标签、卡片和图片重新组织内容，不要大段堆砌文字。
7. 图片交互：${f(v.interact)}。
8. 避免 AI 模板感：不要紫蓝渐变、不要千篇一律的居中大标题加三张卡片。`;

  const steps = custom && concept.three
    ? `\n\n六、请分两步完成
第一步：先不要写代码。根据以上信息，给我 3 个完全不同的设计方向，每个方向说明：整体概念、布局方式、配色、一个让人记住的交互。
第二步：等我选择或组合方向后，再生成完整代码。`
    : "";

  return `你是一名网页设计师和前端开发助手。请根据我提供的真实信息，帮我生成一个个人网站的单页 HTML 初稿。网站不是简历的复制，而是我的个人数字形象展示。

一、关于我
- 昵称 / 姓名：${f(v.name)}
- 专业年级：${f(v.major)}
- 一句话定位：${f(v.slogan)}
- 能力标签：${f(v.skills)}
- 邮箱：${f(v.email)}

二、我的项目（每个都要有标题、配图、2–3 句说明、标签）
1. ${f(v.p1)}
2. ${f(v.p2)}
3. ${f(v.p3)}

三、设计要求
${design}

四、真实性要求
- 只使用我提供的信息，不要编造任何经历、奖项和数据。
- 信息不够的地方，用【待补充】标出来，不要自己填。

五、技术要求
1. 输出一个完整的 index.html 文件，HTML、CSS、JavaScript 都写在这一个文件里，不使用复杂框架。
2. 图片使用相对路径：头像用 images/avatar.png（我的 IP 形象），项目图用 images/project1.jpg、images/project2.jpg、images/project3.jpg。
3. 页面在手机上也能正常显示。
4. 浏览器标签页标题使用我的名字。
5. 页脚加一句：本网站在 AI 辅助下完成，内容均为本人真实经历。
6. 代码之后，告诉我如何保存为 index.html 并在浏览器中打开预览。${steps}`;
}

function renderPrompt() {
  const v = Object.fromEntries(new FormData(form).entries());
  $("#modeTip").textContent = mode === "custom"
    ? (concept.meta ? `隐喻：${concept.meta}` : "先回上一页选一个隐喻")
    : "稳稳做出一个及格的网站";
  const raw = buildPrompt(v);
  const html = esc(raw)
    .replace(/⟦([\s\S]*?)⟧/g, "<mark>$1</mark>")
    .replace(/(【待填写】|【待选择：回上一页选一个隐喻】)/g, '<mark style="background:rgba(196,88,58,.2)">$1</mark>');
  $("#promptOut").innerHTML = html;
  $("#promptOut").dataset.plain = raw.replace(/[⟦⟧]/g, "");
}
form.addEventListener("input", renderPrompt);
form.addEventListener("change", renderPrompt);
form.addEventListener("submit", (e) => e.preventDefault());
$("#copyPrompt").addEventListener("click", (e) => copyText($("#promptOut").dataset.plain, e.currentTarget));
renderPrompt();

/* ---------- 修改指令卡 ---------- */
const FIXES = [
  "标题再大一点，让首屏更醒目",
  "整体换成暖色调，但颜色不超过 3 种",
  "模块之间的留白再大一些，不要那么挤",
  "把项目做成统一比例的图片网格",
  "鼠标放到项目图片上时，图片轻轻放大",
  "点击项目图片，可以查看大图",
  "让网页在手机上也能正常显示",
  "检查所有图片是否都用 images/ 开头的相对路径",
  "把导航栏固定在顶部，点击可以跳到对应模块",
  "字体统一成两种：标题一种、正文一种",
  "删掉你编造的内容，没有依据的地方标成【待补充】",
  "加一个「回到顶部」按钮"
];
$("#fixList").innerHTML = FIXES.map((t) => `<button type="button">${t}</button>`).join("");
$("#fixList").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) copyText(b.textContent, b); });

/* ---------- 能力盘点提示词 ---------- */
$("#digPrompt").textContent = `你是一位耐心的「能力挖掘教练」，请帮我盘点个人经历，为我的个人网站找出至少 3 个真实的项目。

【我的背景】
专业年级：（填写，例如：软件工程 2024 级）
职业倾向测试结果：（可选，例如：研究型 × 艺术型）

【对话规则】
1. 一次只问我 1–2 个问题，等我回答后再继续，不要一次性列出所有问题。
2. 依次问这些方面，我说"没有"就换下一个：课程作业与课程项目、竞赛与获奖、社团与学生工作、志愿服务、实习兼职、个人作品（个人 IP 形象设计、摄影、视频、写作等）、自学的技能与工具、兴趣爱好里做出的成果。
3. 我提到一段经历时，用 STAR 追问细节：当时的情况、我负责什么、我具体做了什么、结果如何（有没有作品、照片、证书、数据可以证明）。
4. 绝对不要编造或夸大任何经历、奖项和数据。我没说的内容，一律用【待补充】标出。
5. 语气友好、鼓励。我说"不知道"时，换个角度提示我，或者举一个同龄人的例子。

【最后输出】
挖到足够的内容后，帮我挑出最值得展示的 3–5 个项目，每个按这个格式整理：
- 项目标题：
- 一句话亮点：
- 我做了什么：
- 用了什么工具 / 方法：
- 结果与证据：
- 标签（3 个）：
- 配图建议：
- 【待补充】：
最后再帮我提炼 3–5 个能力标签。

现在，请先问我第一个问题。`;

document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-copy]");
  if (b) copyText($("#" + b.dataset.copy).textContent, b);
});
