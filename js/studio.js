/* =========================================================
   studio.js：提示词工作台、修改指令卡、能力盘点提示词
   ========================================================= */

/* ---------- 提示词工作台 ---------- */
const form = $("#studioForm");
const TODO = "【待填写】";

function buildPrompt(v) {
  const f = (x) => (x && x.trim()) ? `⟦${x.trim()}⟧` : TODO;     // ⟦⟧ 标记学生填写的内容，显示时高亮
  const idea = v.idea && v.idea.trim()
    ? `\n   我想要的特别形式：${f(v.idea)}。请在保证访客能找到我的姓名、专业年级和邮箱的前提下实现它。`
    : "";
  return `你是一名网页设计师和前端开发助手。请根据我提供的真实信息，帮我生成一个个人网站的单页 HTML 初稿。网站不是简历的复制，而是我的个人数字形象展示。

一、关于我
- 昵称 / 姓名：${f(v.name)}
- 专业年级：${f(v.major)}
- 一句话定位：${f(v.slogan)}
- 能力标签：${f(v.skills)}
- 邮箱：${f(v.email)}

二、我的项目（请做成项目卡片：标题、配图、2–3 句说明、标签）
1. ${f(v.p1)}
2. ${f(v.p2)}
3. ${f(v.p3)}

三、设计要求
1. 视觉定位：${v.style && v.style.trim() ? f(v.style) : "整体风格要符合我的个人定位，气质统一。"}
2. 信息层级：3 秒内让访客知道这是一个什么样的网站、该往哪里看；重要信息更大、更醒目，标题、正文、说明文字层级分明。
3. 用户路径：按照「认识我 → 了解能力 → 查看项目 → 联系我」的顺序组织页面。${idea}
4. 视觉统一：使用 60-30-10 配色法则，颜色不超过 3 种，字体不超过 2 种。
5. 留白对齐：模块之间留白充足，间距尽量使用 8px 的倍数，元素对齐。
6. 内容网页化：用标题、标签、卡片和图片重新组织内容，不要大段堆砌文字。
7. 图片交互：${f(v.interact)}。

四、真实性要求
- 只使用我提供的信息，不要编造任何经历、奖项和数据。
- 信息不够的地方，用【待补充】标出来，不要自己填。

五、技术要求
1. 输出一个完整的 index.html 文件，HTML、CSS、JavaScript 都写在这一个文件里，不使用复杂框架。
2. 图片使用相对路径：头像用 images/avatar.png（我的 IP 形象），项目图用 images/project1.jpg、images/project2.jpg、images/project3.jpg。
3. 页面在手机上也能正常显示。
4. 浏览器标签页标题使用我的名字。
5. 页脚加一句：本网站在 AI 辅助下完成，内容均为本人真实经历。
6. 代码之后，告诉我如何保存为 index.html 并在浏览器中打开预览。`;
}

function renderPrompt() {
  const v = Object.fromEntries(new FormData(form).entries());
  const raw = buildPrompt(v);
  const html = esc(raw)
    .replace(/⟦([\s\S]*?)⟧/g, "<mark>$1</mark>")
    .replace(/【待填写】/g, '<mark style="background:rgba(196,88,58,.2)">【待填写】</mark>');
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
