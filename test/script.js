// 显示网感昵称：改成 false 就只显示霍兰德原名
const SHOW_NICKNAME = true;

const screens = {
  intro: document.getElementById("screen-intro"),
  quiz: document.getElementById("screen-quiz"),
  result: document.getElementById("screen-result")
};
const $ = (id) => document.getElementById(id);

let current = 0;
let answers = new Array(QUESTIONS.length).fill(null);

function show(name) {
  Object.values(screens).forEach((s) => s.classList.remove("is-active"));
  screens[name].classList.add("is-active");
  window.scrollTo(0, 0);
}

function renderQuestion() {
  const item = QUESTIONS[current];
  $("progressText").textContent = `${current + 1} / ${QUESTIONS.length}`;
  $("progressBar").style.width = `${(current / QUESTIONS.length) * 100}%`;
  $("prevBtn").style.visibility = current === 0 ? "hidden" : "visible";
  $("questionText").textContent = item.q;

  const box = $("options");
  box.innerHTML = "";
  item.options.forEach(([text, type], i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "option" + (answers[current] === type ? " is-picked" : "");
    btn.innerHTML = `<span>${"ABCD"[i]}</span>${text}`;
    btn.addEventListener("click", () => pick(type, btn));
    box.appendChild(btn);
  });
}

function pick(type, btn) {
  answers[current] = type;
  btn.classList.add("is-picked");
  setTimeout(() => {
    if (current < QUESTIONS.length - 1) {
      current += 1;
      renderQuestion();
    } else {
      showResult();
    }
  }, 220);
}

function typeLabel(key) {
  return TYPES[key].name;
}

function showResult() {
  const scores = Object.fromEntries(TYPE_ORDER.map((k) => [k, 0]));
  answers.forEach((t) => { if (t) scores[t] += 1; });
  const ranked = [...TYPE_ORDER].sort((a, b) => scores[b] - scores[a]);
  const [main, sub, third] = ranked;
  const M = TYPES[main];
  const S = TYPES[sub];

  $("mainName").textContent = M.name;
  $("subName").textContent = S.name;
  $("mainNick").textContent = SHOW_NICKNAME ? M.nick : "";
  $("subNick").textContent = SHOW_NICKNAME ? S.nick : "";
  $("mainDesc").textContent = M.desc;
  $("subDesc").textContent = `同时，你也带有${S.name}的特点：${S.desc}`;

  const tie = $("tieNote");
  if (scores[third] === scores[sub]) {
    tie.hidden = false;
    tie.textContent = `你的${TYPES[third].name}得分和${S.name}一样高，也可以看看下方得分条，选一个更像你的。`;
  } else {
    tie.hidden = true;
  }

  const strengths = [...M.strengths, S.strengths[0]];
  $("strengths").innerHTML = strengths.map((s) => `<span>${s}</span>`).join("");

  $("directions").innerHTML = [...M.directions, ...S.directions.slice(0, 2)]
    .map(([field, jobs]) => `<li><b>${field}</b>${jobs}</li>`).join("");

  $("siteStyle").textContent = M.site.style;
  $("palette").innerHTML = M.site.palette.map(([hex, role]) =>
    `<div><i style="background:${hex}"></i><small>${role}</small><code>${hex}</code></div>`).join("");
  $("siteHero").textContent = M.site.hero;
  $("siteStructure").textContent = M.site.structure;

  $("positionPrompt").textContent =
    `我的职业倾向主类型是「${M.name}」，副类型是「${S.name}」，我的优势关键词是：${strengths.join("、")}。` +
    `请根据这个个人定位设计网页：${M.site.prompt}。同时适当体现${S.name}的特点。`;

  const max = Math.max(...Object.values(scores), 1);
  $("scoreBars").innerHTML = TYPE_ORDER.map((k) => `
    <div class="bar-row${k === main ? " is-main" : ""}">
      <span>${TYPES[k].name}</span>
      <div class="bar"><i style="width:${(scores[k] / max) * 100}%"></i></div>
      <b>${scores[k]}</b>
    </div>`).join("");

  show("result");
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

$("startBtn").addEventListener("click", () => {
  current = 0;
  answers = new Array(QUESTIONS.length).fill(null);
  renderQuestion();
  show("quiz");
});
$("prevBtn").addEventListener("click", () => {
  if (current > 0) { current -= 1; renderQuestion(); }
});
$("copyBtn").addEventListener("click", (e) => copyText($("positionPrompt").textContent, e.currentTarget));
$("restartBtn").addEventListener("click", () => show("intro"));
