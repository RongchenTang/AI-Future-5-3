// 显示网感昵称：改成 false 就只显示霍兰德原名
const SHOW_NICKNAME = true;

const $ = (id) => document.getElementById(id);
const scenes = { cover: $("scene-cover"), book: $("scene-book"), result: $("scene-result") };
const FLIP_MS = 850;

let current = 0;
let answers = new Array(QUESTIONS.length).fill(null);
let busy = false;

// 左页的小涂鸦和便利贴
const DOODLES = [
  '<path d="M70 15 L78 52 L115 60 L78 68 L70 105 L62 68 L25 60 L62 52 Z"/>',
  '<circle cx="70" cy="60" r="34"/><path d="M70 10v14M70 96v14M20 60h14M106 60h14M35 25l10 10M95 85l10 10M35 95l10-10M95 35l10-10"/>',
  '<path d="M20 100 C 40 40, 90 40, 110 20"/><path d="M96 16 l15 3 -4 15"/><circle cx="20" cy="100" r="5"/>',
  '<path d="M70 108 C 20 70, 30 25, 70 45 C 110 25, 120 70, 70 108 Z"/>',
  '<path d="M90 25 A 40 40 0 1 0 100 90 A 32 32 0 1 1 90 25 Z"/>',
  '<path d="M25 95 L70 20 L115 95 Z"/><path d="M50 95 L70 60 L90 95"/>',
  '<path d="M70 110 V45"/><path d="M70 70 C 40 65, 35 40, 40 30 C 60 35, 70 50, 70 70"/><path d="M70 55 C 95 50, 105 30, 100 20 C 80 22, 70 38, 70 55"/>',
  '<rect x="30" y="30" width="80" height="60" rx="4"/><path d="M30 34 L70 66 L110 34"/>',
  '<path d="M20 60 Q 45 20, 70 60 T 120 60"/><path d="M20 85 Q 45 45, 70 85 T 120 85"/>'
];

const NOTES = [
  "凭第一反应选，别想太久。",
  "没有对错，只有像不像你。",
  "想想你真实的样子，而不是“应该”的样子。",
  "如果都像你，选最常发生的那个。",
  "慢慢来，这本书不赶时间。",
  "选你会做的，不是你觉得好的。"
];

const RING = '<svg class="ring" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M10 24 C 4 10, 36 3, 60 4 S 99 11, 96 23 S 70 39, 44 38 S 2 32, 6 19 S 22 6, 34 5"/></svg>';

const pad = (n) => String(n).padStart(2, "0");

function leftHTML(i) {
  return `
    <p class="lp-label type">QUESTION</p>
    <p class="lp-num"><small>No.</small>${pad(i + 1)}</p>
    <svg class="lp-doodle" viewBox="0 0 140 120" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${DOODLES[i % DOODLES.length]}</svg>
    <p class="lp-note">${NOTES[i % NOTES.length]}</p>
    <p class="page-num">— ${pad(i * 2 + 2)} —</p>`;
}

function rightHTML(i) {
  const item = QUESTIONS[i];
  const opts = item.options.map(([text, type], k) => `
    <button class="opt${answers[i] === type ? " is-picked" : ""}" type="button" data-type="${type}">
      ${RING}<i>${"abcd"[k]}.</i><span>${text}</span>
    </button>`).join("");
  return `
    <div class="rp-head">
      <span class="rp-mobile-num">No.${pad(i + 1)}</span>
      <span class="washi">Q.${pad(i + 1)} / ${QUESTIONS.length}</span>
    </div>
    <h2 class="rp-q">${item.q}</h2>
    <div class="opts">${opts}</div>
    <p class="page-num">— ${pad(i * 2 + 3)} —</p>`;
}

function renderDots() {
  $("dots").innerHTML = QUESTIONS.map((_, k) =>
    `<i class="${k === current ? "now" : answers[k] ? "done" : ""}"></i>`).join("");
  $("prevBtn").disabled = current === 0;
}

function paint(i) {
  $("pageLeft").innerHTML = leftHTML(i);
  $("pageRight").innerHTML = rightHTML(i);
  renderDots();
}

function makeLeaf(frontHTML, backHTML, dir) {
  const leaf = document.createElement("div");
  leaf.className = `leaf ${dir}`;
  leaf.innerHTML = `<div class="page page-right">${frontHTML}</div><div class="page page-left leaf-back">${backHTML}</div>`;
  document.querySelector(".book-open").appendChild(leaf);
  return leaf;
}

function flipTo(next) {
  if (busy || next === current) return;
  busy = true;
  const prev = current;
  const forward = next > prev;
  let leaf;

  if (forward) {
    leaf = makeLeaf(rightHTML(prev), leftHTML(next), "forward");
    $("pageRight").innerHTML = rightHTML(next);
  } else {
    leaf = makeLeaf(rightHTML(next), leftHTML(prev), "backward");
    $("pageLeft").innerHTML = leftHTML(next);
  }
  current = next;
  renderDots();

  setTimeout(() => {
    paint(current);
    leaf.remove();
    busy = false;
  }, FLIP_MS);
}

function show(name) {
  Object.values(scenes).forEach((s) => s.classList.remove("is-active"));
  scenes[name].classList.add("is-active");
  window.scrollTo(0, 0);
}

// 选择选项
$("pageRight").addEventListener("click", (e) => {
  const btn = e.target.closest(".opt");
  if (!btn || busy) return;
  $("pageRight").querySelectorAll(".opt").forEach((o) => o.classList.remove("is-picked"));
  btn.classList.add("is-picked");
  answers[current] = btn.dataset.type;
  busy = true;
  setTimeout(() => {
    busy = false;
    if (current < QUESTIONS.length - 1) flipTo(current + 1);
    else showResult();
  }, 520);
});

$("prevBtn").addEventListener("click", () => {
  if (current > 0) flipTo(current - 1);
});

// 翻开封面
function openBook() {
  const book = $("bookClosed");
  if (book.classList.contains("is-opening")) return;
  book.classList.add("is-opening");
  setTimeout(() => {
    current = 0;
    answers = new Array(QUESTIONS.length).fill(null);
    paint(0);
    show("book");
    book.classList.remove("is-opening");
  }, 1050);
}

$("bookClosed").addEventListener("click", openBook);
$("bookClosed").addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openBook(); }
});

// 结果
function showResult() {
  const scores = Object.fromEntries(TYPE_ORDER.map((k) => [k, 0]));
  answers.forEach((t) => { if (t) scores[t] += 1; });
  const ranked = [...TYPE_ORDER].sort((a, b) => scores[b] - scores[a]);
  const [main, sub, third] = ranked;
  const M = TYPES[main];
  const S = TYPES[sub];

  $("certNo").textContent = String(Math.floor(Math.random() * 900) + 100);
  $("mainName").textContent = M.name;
  $("mainNick").textContent = SHOW_NICKNAME ? `「${M.nick}」` : "";
  $("mainDesc").textContent = M.desc;
  $("subName").textContent = S.name;
  $("subNick").textContent = SHOW_NICKNAME ? `（${S.nick}）` : "";
  $("subDesc").textContent = S.desc;

  const tie = $("tieNote");
  tie.hidden = scores[third] !== scores[sub];
  tie.textContent = `另外，你的${TYPES[third].name}和${S.name}得分一样高，看看下面的分数，选一个更像你的。`;

  const strengths = [...M.strengths, S.strengths[0]];
  $("strengths").innerHTML = strengths.map((s) => `<span>${s}</span>`).join("");
  $("directions").innerHTML = [...M.directions, ...S.directions.slice(0, 2)]
    .map(([field, jobs]) => `<li><b>${field}</b><span>${jobs}</span></li>`).join("");

  const max = Math.max(...Object.values(scores), 1);
  $("scoreBars").innerHTML = TYPE_ORDER.map((k) => `
    <div class="tally-row${k === main ? " is-main" : ""}">
      <span>${TYPES[k].name}</span>
      <div class="hl"><i data-w="${(scores[k] / max) * 100}"></i></div>
      <b>${scores[k]}</b>
    </div>`).join("");

  $("siteStyle").textContent = M.site.style;
  $("palette").innerHTML = M.site.palette.map(([hex, role]) =>
    `<div><i style="background:${hex}"></i>${role}<br>${hex}</div>`).join("");
  $("siteHero").textContent = M.site.hero;
  $("siteStructure").textContent = M.site.structure;
  $("positionPrompt").textContent =
    `我的职业倾向主类型是「${M.name}」，副类型是「${S.name}」，我的优势关键词是：${strengths.join("、")}。` +
    `请根据这个个人定位设计网页：${M.site.prompt}。同时适当体现${S.name}的特点。`;

  // 逐行“写”出来
  document.querySelectorAll("#scene-result .reveal, #scene-result .reveal-late").forEach((el) => el.classList.remove("on"));
  $("seal").classList.remove("stamped");
  show("result");

  const lines = [...document.querySelectorAll("#scene-result .reveal")].filter((el) => !el.hidden);
  lines.forEach((el, k) => setTimeout(() => el.classList.add("on"), 300 + k * 170));
  const done = 300 + lines.length * 170;
  setTimeout(() => $("seal").classList.add("stamped"), 700);
  setTimeout(() => {
    document.querySelectorAll("#scoreBars .hl i").forEach((i) => { i.style.width = i.dataset.w + "%"; });
  }, done - 400);
  setTimeout(() => {
    document.querySelectorAll("#scene-result .reveal-late").forEach((el) => el.classList.add("on"));
  }, done + 200);
}

async function copyText(text, btn) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (e) {
    const t = document.createElement("textarea");
    t.value = text;
    t.style.position = "fixed";
    t.style.opacity = "0";
    document.body.appendChild(t);
    t.select();
    document.execCommand("copy");
    t.remove();
  }
  const old = btn.textContent;
  btn.textContent = "已复制 ✓";
  setTimeout(() => { btn.textContent = old; }, 1600);
}

$("copyBtn").addEventListener("click", (e) => copyText($("positionPrompt").textContent, e.currentTarget));
$("restartBtn").addEventListener("click", () => show("cover"));
