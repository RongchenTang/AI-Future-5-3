const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const screens = $$(".screen");
const pad = (n) => String(n).padStart(2, "0");
const isPhone = () => matchMedia("(max-width: 760px)").matches;

/* ---------- 侧边导航 ---------- */
$("#sideNav").innerHTML = screens.map((s, i) =>
  `<a href="#${s.id}" data-i="${i}">${pad(i)}　${s.dataset.title}</a>`).join("");

/* ---------- 现在在哪一屏 ---------- */
function currentIndex() {
  const y = scrollY + innerHeight * 0.35;
  let idx = 0;
  screens.forEach((s, i) => { if (s.offsetTop <= y) idx = i; });
  return idx;
}

function updateUI() {
  const i = currentIndex();
  $$("#sideNav a").forEach((a) => a.classList.toggle("on", Number(a.dataset.i) === i));
  const txt = `${pad(i + 1)} / ${pad(screens.length)}`;
  $("#pagerPos").textContent = txt;
  $("#topPos").textContent = txt;
  $("#prevBtn").disabled = i === 0 && scrollY < 10;
  $("#nextBtn").disabled = i === screens.length - 1 && scrollY + innerHeight >= document.body.scrollHeight - 4;
}
addEventListener("scroll", updateUI, { passive: true });
addEventListener("resize", updateUI);

/* ---------- 翻页 ---------- */
let turning = false;
function goTo(i, back = false) {
  if (turning || i < 0 || i >= screens.length) return;
  const target = screens[i];
  if (isPhone() || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    target.scrollIntoView({ behavior: "smooth" });
    return;
  }
  turning = true;
  const turn = $("#turn");
  $("#turnNo").textContent = `No.${pad(i)}`;
  $("#turnTitle").textContent = target.dataset.title;
  turn.style.visibility = "visible";
  turn.classList.toggle("back", back);
  turn.classList.add("go");
  setTimeout(() => scrollTo({ top: target.offsetTop, behavior: "instant" }), 430);
  setTimeout(() => {
    turn.classList.remove("go", "back");
    turn.style.visibility = "hidden";
    turning = false;
    updateUI();
  }, 1000);
}

// 下一步：如果这一屏还没看完，先往下滚；看完了再翻到下一屏
function next() {
  const i = currentIndex();
  const s = screens[i];
  const bottom = s.offsetTop + s.offsetHeight;
  if (bottom > scrollY + innerHeight + 24) {
    scrollBy({ top: Math.min(innerHeight * 0.75, bottom - scrollY - innerHeight), behavior: "smooth" });
  } else {
    goTo(i + 1);
  }
}
// 上一步：如果这一屏已经往下滚过，先回到这一屏顶部；否则翻回上一屏
function prev() {
  const i = currentIndex();
  if (scrollY > screens[i].offsetTop + 24) scrollTo({ top: screens[i].offsetTop, behavior: "smooth" });
  else goTo(i - 1, true);
}

$("#nextBtn").addEventListener("click", next);
$("#prevBtn").addEventListener("click", prev);
addEventListener("keydown", (e) => {
  if (e.target.closest("input, textarea")) return;
  if (["ArrowRight", "PageDown"].includes(e.key) || (e.key === " " && !e.target.closest("button"))) { e.preventDefault(); next(); }
  if (["ArrowLeft", "PageUp"].includes(e.key)) { e.preventDefault(); prev(); }
});

// 侧栏、按钮跳转
document.addEventListener("click", (e) => {
  const a = e.target.closest("#sideNav a, [data-jump]");
  if (a) { e.preventDefault(); const t = screens.findIndex((s) => "#" + s.id === a.getAttribute("href")); goTo(t, t < currentIndex()); return; }
  const g = e.target.closest("[data-goto]");
  if (g) { const t = screens.findIndex((s) => s.id === g.dataset.goto); goTo(t, t < currentIndex()); return; }
  if (e.target.closest("[data-next]")) next();
});

/* ---------- 文件夹目录 ---------- */
const FOLDER = [
  { tab: "职业之书", en: "The Book of Paths", c: "var(--kraft)", to: "s-book" },
  { tab: "网站案例", en: "Why a Website", c: "var(--sage)", to: "s-cases" },
  { tab: "三件套", en: "HTML · CSS · JS", c: "var(--dusty)", to: "s-basics" },
  { tab: "设计原则", en: "Five Rules", c: "var(--rose)" },
  { tab: "提示词", en: "Prompt Studio", c: "var(--stone)" },
  { tab: "动手实践", en: "Make It", c: "#f2d58a" },
  { tab: "总结", en: "See You", c: "#e7b19f" }
];
const N = FOLDER.length;
const rig = $("#rig");
rig.innerHTML = FOLDER.map((f, i) => `
  <div class="sheet${f.to ? "" : " soon"}" data-to="${f.to || ""}" style="--d:${N - 1 - i};--n:${N - 1};--c:${f.c}">
    <span class="tab" style="left:calc(${i} * 13.4% + 1%)">${f.tab}</span>
    <div class="face"><h3>${f.en}</h3><span class="num">${pad(i + 1)} · ${f.tab}</span><div class="peek"><i></i><i></i><i></i></div></div>
  </div>`).reverse().join("") + `
  <div class="pocket"><div class="front"><span class="clasp"></span><div>
    <p class="type">AI · FUTURE · 5-3</p><h3>Today's <i>Folder</i></h3><small>点我打开</small></div></div></div>`;

const scene = $("#folderScene");
let moved = false, dragging = false, sx = 0, sy = 0, rx0 = 0, ry0 = 0;
const num = (v, d) => parseFloat(getComputedStyle(rig).getPropertyValue(v)) || d;

rig.addEventListener("click", (e) => {
  if (moved) return;
  if (!rig.classList.contains("open")) { rig.classList.add("open"); return; }
  const sh = e.target.closest(".sheet");
  if (sh && sh.dataset.to) goTo(screens.findIndex((s) => s.id === sh.dataset.to));
});
scene.addEventListener("pointerdown", (e) => { dragging = true; moved = false; sx = e.clientX; sy = e.clientY; rx0 = num("--rx", -8); ry0 = num("--ry", -16); });
addEventListener("pointermove", (e) => {
  if (!dragging) return;
  const dx = e.clientX - sx, dy = e.clientY - sy;
  if (Math.abs(dx) + Math.abs(dy) > 6) { moved = true; rig.classList.add("dragging"); }
  if (!moved) return;
  rig.style.setProperty("--ry", Math.max(-60, Math.min(60, ry0 + dx * 0.25)) + "deg");
  rig.style.setProperty("--rx", Math.max(-60, Math.min(15, rx0 - dy * 0.2)) + "deg");
});
addEventListener("pointerup", () => { dragging = false; rig.classList.remove("dragging"); setTimeout(() => { moved = false; }, 0); });

/* ---------- 三件套开关 ---------- */
$$(".sw").forEach((sw) => sw.addEventListener("click", () => {
  sw.classList.toggle("on");
  const on = sw.classList.contains("on");
  if (sw.dataset.layer === "css") $("#demo").classList.toggle("styled", on);
  if (sw.dataset.layer === "html") $(".browser").classList.toggle("no-html", !on);
}));
$("#demoBtn").addEventListener("click", (e) => {
  if (!$('[data-layer="js"]').classList.contains("on")) return;
  e.currentTarget.textContent = e.currentTarget.textContent === "了解更多" ? "你好！这是 JavaScript 在工作 👋" : "了解更多";
});

updateUI();
