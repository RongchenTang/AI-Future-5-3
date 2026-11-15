/* =========================================================
   lab.js：交互实验室（03）和五条设计原则（04）
   全部围绕同一个示例网站「小林的个人网站」
   ========================================================= */
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const colorTags = (s) => esc(s).replace(/(&lt;\/?)([a-z0-9]+)/g, '$1<span class="tag">$2</span>');

/* ---------- 实验 ① 开关 ---------- */
$$("#s-lab1 .sw").forEach((sw) => sw.addEventListener("click", () => {
  sw.classList.toggle("on");
  const on = sw.classList.contains("on");
  if (sw.dataset.layer === "css") $("#lab1Demo").classList.toggle("styled", on);
  if (sw.dataset.layer === "html") $("#lab1Browser").classList.toggle("no-html", !on);
}));
$("#lab1Btn").addEventListener("click", (e) => {
  const btn = e.currentTarget;
  const old = btn.parentNode.querySelector(".hello");
  if (old) { old.remove(); return; }
  if (!$('#s-lab1 [data-layer="js"]').classList.contains("on")) return;   // 关掉 JS：点了没反应
  const s = document.createElement("span");
  s.className = "hello";
  s.textContent = "你好！这是 JavaScript 在工作 👋";
  btn.after(s);
});

/* ---------- 实验 ② 点哪里看代码 ---------- */
const LAB2_HTML = [
  ['<div class="hero">', "hero"],
  ['  <img class="avatar" src="images/avatar.png">', "avatar"],
  ["  <h1>小林</h1>", "name"],
  ["  <p>数据分析方向 · 喜欢把复杂的事情讲清楚</p>", "tagline"],
  ["</div>", "hero"],
  ['<ul class="tags">', "tags"],
  ["  <li>Excel</li> <li>Python</li> <li>调研</li>", "tags"],
  ["</ul>", "tags"],
  ['<div class="card">', "card"],
  ['  <img src="images/project1.jpg">', "img"],
  ["  <h3>校园外卖数据分析</h3>", "card"],
  ["</div>", "card"],
  ["<button>给我写信</button>", "btn"]
];
const LAB2_CSS = [
  [".hero { display: flex; gap: 16px; }", "hero"],
  [".avatar { width: 64px; border-radius: 50%; }", "avatar"],
  ["h1 { font-size: 36px; color: #c4583a; }", "name"],
  ["p { color: #666666; }", "tagline"],
  [".tags li { border: 1.5px solid #c4583a;\n           border-radius: 12px; }", "tags"],
  [".card { border-radius: 12px;\n        box-shadow: 0 6px 16px #0001; }", "card"],
  [".card img { width: 84px; height: 64px; }", "img"],
  ["button { background: #c4583a; color: white; }", "btn"]
];
const PART_NAME = { hero: "顶部区域", avatar: "头像", name: "标题", tagline: "介绍文字", tags: "能力标签", card: "项目卡片", img: "项目图片", btn: "按钮" };

$("#lab2Html").innerHTML = LAB2_HTML.map(([l, p]) => `<span class="ln" data-p="${p}">${colorTags(l)}</span>`).join("");
$("#lab2Css").innerHTML = LAB2_CSS.map(([l, p]) => `<span class="ln" data-p="${p}">${esc(l)}</span>`).join("");

function lab2Hot(part) {
  $$("#lab2Site [data-part]").forEach((el) => el.classList.toggle("hot", el.dataset.part === part));
  $$("#s-lab2 .ln").forEach((ln) => ln.classList.toggle("hot", ln.dataset.p === part));
  $("#lab2Hint").textContent = part ? `这是「${PART_NAME[part]}」：HTML 决定它在不在，CSS 决定它长什么样。` : "指向左边网页的任意部分 ←";
}
$("#lab2Site").addEventListener("mouseover", (e) => { const t = e.target.closest("[data-part]"); if (t) lab2Hot(t.dataset.part); });
$("#lab2Site").addEventListener("click", (e) => { const t = e.target.closest("[data-part]"); if (t) lab2Hot(t.dataset.part); });
$("#lab2Site").addEventListener("mouseleave", () => lab2Hot(null));

/* ---------- 实验 ③ 动手改一改 ---------- */
const COLORS = ["#c4583a", "#2f6fe0", "#4f8a5b", "#7a5ac8", "#26221e"];
const FONTS = { serif: ['"Noto Serif SC", "Songti SC", serif', "宋体"], hand: ['"LXGW WenKai", "KaiTi", serif', "楷体"], sans: ['-apple-system, "PingFang SC", "Microsoft YaHei", sans-serif', "黑体"] };
const live = { color: COLORS[0], size: 36, radius: 12, gap: 24, font: "serif" };
let lastChanged = null;

$("#ctlColor").innerHTML = COLORS.map((c, i) => `<button type="button" style="background:${c}" data-c="${c}" class="${i ? "" : "on"}" aria-label="颜色 ${c}"></button>`).join("");

function renderLive() {
  const site = $("#lab3Site");
  site.style.setProperty("--c", live.color);
  site.style.setProperty("--hs", live.size + "px");
  site.style.setProperty("--r", live.radius + "px");
  site.style.setProperty("--g", live.gap + "px");
  site.style.setProperty("--hf", FONTS[live.font][0]);
  $("#outSize").textContent = live.size + "px";
  $("#outRadius").textContent = live.radius + "px";
  $("#outGap").textContent = live.gap + "px";
  const v = (k, text) => `<span class="val${lastChanged === k ? " flash" : ""}">${text}</span>`;
  $("#lab3Css").innerHTML =
`<span class="tag">h1</span> {
  font-size: ${v("size", live.size + "px")};
  font-family: ${v("font", FONTS[live.font][1])};
  color: ${v("color", live.color)};
}

<span class="tag">.page</span> {
  gap: ${v("gap", live.gap + "px")};   /* 留白 */
}

<span class="tag">.card, button, .tags li</span> {
  border-radius: ${v("radius", live.radius + "px")};
}

<span class="tag">.avatar, button</span> {
  background: ${v("color", live.color)};
}`;
}
$("#ctlColor").addEventListener("click", (e) => {
  const b = e.target.closest("button"); if (!b) return;
  $$("#ctlColor button").forEach((x) => x.classList.toggle("on", x === b));
  live.color = b.dataset.c; lastChanged = "color"; renderLive();
});
[["#ctlSize", "size"], ["#ctlRadius", "radius"], ["#ctlGap", "gap"]].forEach(([sel, k]) =>
  $(sel).addEventListener("input", (e) => { live[k] = Number(e.target.value); lastChanged = k; renderLive(); }));
$("#ctlFont").addEventListener("click", (e) => {
  const b = e.target.closest("button"); if (!b) return;
  $$("#ctlFont button").forEach((x) => x.classList.toggle("on", x === b));
  live.font = b.dataset.font; lastChanged = "font"; renderLive();
});
renderLive();

/* ---------- 实验 ④ 小测：猜猜是哪一层 ---------- */
const QUIZ = [
  ["按钮从黑色变成了蓝色", "CSS", "颜色、大小、字体这些「长什么样」的事，都归 CSS 管。"],
  ["页面上多了一段「关于我」", "HTML", "页面里「有什么内容」，是 HTML 决定的。"],
  ["点一下按钮，弹出一句「谢谢关注」", "JS", "「点了之后发生什么」，是 JavaScript 的工作。"],
  ["整个页面换成了暖色调", "CSS", "换配色只改 CSS，内容一个字都不用动。"],
  ["项目区新加了一张作品图片", "HTML", "多一张图片 = 多一个 <img>，属于 HTML。"],
  ["鼠标放到图片上，图片轻轻放大", "CSS", "有点意外？简单的动效 CSS 也能做（:hover）。更复杂的交互才需要 JS。"]
];
let quizRight = 0, quizDone = 0;
$("#quiz").innerHTML = QUIZ.map(([q], i) => `
  <div class="q" data-i="${i}">
    <span class="q-no">${pad(i + 1)}</span>
    <h3>${q}</h3>
    <div class="q-opts"><button type="button">HTML</button><button type="button">CSS</button><button type="button">JS</button></div>
    <p class="q-why"></p>
  </div>`).join("");
$("#quiz").addEventListener("click", (e) => {
  const b = e.target.closest(".q-opts button"); if (!b || b.disabled) return;
  const card = b.closest(".q"), [, ans, why] = QUIZ[Number(card.dataset.i)];
  const ok = b.textContent === ans;
  $$("button", card).forEach((x) => { x.disabled = true; if (x.textContent === ans) x.classList.add("right"); });
  if (!ok) b.classList.add("wrong");
  $(".q-why", card).textContent = (ok ? "✓ 答对了！" : `✗ 是 ${ans}。`) + why;
  quizDone += 1; quizRight += ok ? 1 : 0;
  $("#quizScore").textContent = quizDone === QUIZ.length ? `全部完成：答对 ${quizRight} / ${QUIZ.length} 题 🎉` : `已答 ${quizDone} / ${QUIZ.length}`;
});

/* ---------- 04 五条设计原则 ---------- */
const siteHTML = () => `
  <div class="xl" id="rx">
    <div class="xl-hero"><i class="path-no">1</i><div class="xl-avatar">林</div><div><h4>小林</h4><p>数据分析方向 · 喜欢把复杂的事情讲清楚</p></div></div>
    <div class="xl-tags"><i class="path-no">2</i><span>Excel</span><span>Python</span><span>调研</span></div>
    <div class="xl-card"><i class="path-no">3</i><div class="xl-img">图片</div><div><b>校园外卖数据分析</b><small>课程项目 · 用 Python 分析 2000 条订单</small></div></div>
    <button type="button" class="xl-btn"><i class="path-no">4</i>给我写信</button>
  </div>`;
const seg = (opts, on = 0, id = "rseg") => `<div class="seg" id="${id}">${opts.map((o, i) => `<button type="button" class="${i === on ? "on" : ""}" data-v="${i}">${o}</button>`).join("")}</div>`;

const THEMES = [
  { name: "理性", bg: "#f7f9fc", c: "#1f3a5f", hf: '-apple-system, "PingFang SC", "Microsoft YaHei", sans-serif', r: "4px", text: "#2b2b2b", muted: "#5a6b80" },
  { name: "亲和", bg: "#fff8f2", c: "#d9614c", hf: '"LXGW WenKai", "KaiTi", serif', r: "18px", text: "#3d3833", muted: "#8a776c" },
  { name: "创意", bg: "#1f1c19", c: "#f4bd3b", hf: '"Noto Serif SC", "Songti SC", serif', r: "0px", text: "#f4ead8", muted: "#bfb3a0" }
];

const RULES = [
  {
    t: "视觉定位",
    text: `<h3>① 视觉定位</h3><p class="motto">风格不是装饰，是第一印象。</p>
      <p>动手之前先想三个问题：这个网站给谁看？我希望别人记住什么？它应该是什么气质？</p>
      <p>你的职业之书票根，已经帮你想好了一个答案。</p>`,
    say: "整体风格为【理性清晰风】，符合我【数据分析】的个人定位。",
    controls: () => `<span>同样的内容，换一种气质：</span>${seg(THEMES.map((t) => t.name))}`,
    setup: () => {
      const apply = (i) => {
        const t = THEMES[i], s = $("#rx");
        s.style.background = t.bg; s.style.color = t.text;
        s.style.setProperty("--c", t.c); s.style.setProperty("--hf", t.hf); s.style.setProperty("--r", t.r);
        $$(".xl-hero p, .xl-card small", s).forEach((x) => { x.style.color = t.muted; });
        $(".xl-card", s).style.background = i === 2 ? "#2b2723" : "#fff";
        $(".xl-btn", s).style.color = i === 2 ? "#1f1c19" : "#fff";
        s.style.setProperty("--hs", i === 2 ? "46px" : "36px");
      };
      $("#rseg").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; segOn(b); apply(Number(b.dataset.v)); });
      apply(0);
    }
  },
  {
    t: "信息层级",
    text: `<h3>② 信息层级</h3><p class="motto">3 秒内，让人知道这是一个什么样的网站、该往哪里看。</p>
      <p>重要的更大、更靠前、更醒目，不要让所有内容一样重要。</p>
      <p class="aside-note">想把名字藏到最后、做成一座花园？完全可以——但首屏要给访客一个「往哪走」的提示。</p>`,
    say: "首屏突出【一句宣言】，重要信息更醒目，标题、正文、说明文字层级分明。",
    controls: () => `${seg(["改前", "改后"], 0)}<button type="button" class="ghost-btn" id="r3s">⏱ 3 秒测试</button><span id="r3c" class="type"></span>`,
    setup: () => {
      const s = $("#rx");
      s.classList.add("flat");
      $("#rseg").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; segOn(b); s.classList.toggle("flat", b.dataset.v === "0"); hideCover(); });
      $("#r3s").addEventListener("click", () => {
        hideCover();
        let n = 3; $("#r3c").textContent = `${n}…`;
        clearInterval(RULES.timer);
        RULES.timer = setInterval(() => {
          n -= 1;
          if (n > 0) { $("#r3c").textContent = `${n}…`; return; }
          clearInterval(RULES.timer); $("#r3c").textContent = "";
          const c = document.createElement("div");
          c.className = "cover3";
          c.innerHTML = `<b>?</b><p>你记住了什么？</p><button type="button" class="ghost-btn">再看一眼</button>`;
          $("button", c).onclick = hideCover;
          $("#ruleStage").appendChild(c);
        }, 1000);
      });
    }
  },
  {
    t: "用户路径",
    text: `<h3>③ 用户路径</h3><p class="motto">顺序决定别人怎么理解你。</p>
      <p>好的页面有一条看不见的路线：吸引注意 → 建立理解 → 展示证据 → 引导行动。</p>
      <p>放到个人网站上：<b>我是谁 → 我擅长什么 → 我做过什么 → 怎么找到我</b>。</p>`,
    say: "按照「认识我 → 了解能力 → 查看项目 → 联系我」的顺序组织页面。",
    controls: () => seg(["改前：随便摆", "改后：有路线"], 0),
    setup: () => {
      const s = $("#rx");
      const order = (shuffled) => {
        const [hero, tags, card, btn] = [".xl-hero", ".xl-tags", ".xl-card", ".xl-btn"].map((q) => $(q, s));
        hero.style.order = shuffled ? 4 : 0; btn.style.order = shuffled ? 0 : 4; card.style.order = shuffled ? 1 : 3; tags.style.order = shuffled ? 3 : 2;
        s.classList.toggle("pathed", !shuffled);
      };
      $("#rseg").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; segOn(b); order(b.dataset.v === "0"); });
      order(true);
    }
  },
  {
    t: "视觉统一",
    text: `<h3>④ 视觉统一</h3><p class="motto">颜色不超过 3 种，字体不超过 2 种。</p>
      <p><b>60-30-10 配色法</b>：60% 背景色、30% 辅助色、10% 强调色。</p>
      <p>图片和图标的风格，也要像一家人。</p>`,
    say: "使用 60-30-10 配色法则，颜色不超过 3 种，字体不超过 2 种，图片比例统一、不变形。",
    controls: () => `${seg(["改前：6 种颜色", "改后：60-30-10"], 0)}`,
    after: `<div class="ratio" id="ratio" hidden><i style="width:60%;background:#fffdf8;box-shadow:inset 0 0 0 1px #ddd"></i><i style="width:30%;background:#f3e3cf"></i><i style="width:10%;background:#c4583a"></i></div>
      <div class="ratio-legend" id="ratioLegend" hidden><span>60% 背景 #FFFDF8</span><span>30% 辅助 #F3E3CF</span><span>10% 强调 #C4583A</span></div>`,
    setup: () => {
      const s = $("#rx");
      const set = (before) => {
        s.classList.toggle("rainbow", before);
        $(".xl-card", s).style.background = before ? "" : "#f3e3cf";
        $("#ratio").hidden = before; $("#ratioLegend").hidden = before;
      };
      $("#rseg").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; segOn(b); set(b.dataset.v === "0"); });
      set(true);
    }
  },
  {
    t: "留白对齐",
    text: `<h3>⑤ 留白与对齐</h3><p class="motto">页面越复杂，越需要留白；<br>信息越多，越需要对齐。</p>
      <p>留白不是浪费，是帮眼睛分组：靠近的属于一组，拉开的是另一个话题。</p>
      <p>打开对齐线看看：好看的页面背后，都有一张看不见的网格。</p>`,
    say: "模块之间留白充足，间距使用 8px 的倍数，所有元素左对齐、边缘整齐。",
    controls: () => `${seg(["改前", "改后"], 0)}<label>留白 <input type="range" id="rgap" min="4" max="40" value="6"></label><label><input type="checkbox" id="rgrid"> 对齐线</label>`,
    setup: () => {
      const s = $("#rx");
      const set = (before) => { s.classList.toggle("messy", before); const g = before ? 6 : 24; $("#rgap").value = g; s.style.setProperty("--g", g + "px"); };
      $("#rseg").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; segOn(b); set(b.dataset.v === "0"); });
      $("#rgap").addEventListener("input", (e) => s.style.setProperty("--g", e.target.value + "px"));
      $("#rgrid").addEventListener("change", (e) => s.classList.toggle("grid-on", e.target.checked));
      set(true);
    }
  }
];

function segOn(b) { $$("button", b.parentNode).forEach((x) => x.classList.toggle("on", x === b)); }
function hideCover() { clearInterval(RULES.timer); $("#r3c") && ($("#r3c").textContent = ""); const c = $("#ruleStage .cover3"); if (c) c.remove(); }

function showRule(i) {
  hideCover();
  const r = RULES[i];
  $$("#ruleTabs button").forEach((b, k) => { b.classList.toggle("on", k === i); b.setAttribute("aria-selected", k === i); });
  $("#ruleText").innerHTML = `${r.text}<div class="say"><span>写进提示词，就这么说</span>${r.say}</div>`;
  $("#ruleControls").innerHTML = r.controls();
  $("#ruleStage").innerHTML = siteHTML() + (r.after || "");
  r.setup();
}
$("#ruleTabs").innerHTML = RULES.map((r, i) => `<button type="button" role="tab" data-i="${i}"><i>${["i", "ii", "iii", "iv", "v"][i]}.</i>${r.t}</button>`).join("");
$("#ruleTabs").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) showRule(Number(b.dataset.i)); });
showRule(0);
