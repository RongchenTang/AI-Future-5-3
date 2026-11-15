/* =========================================================
   deck.js：翻页、目录、文件夹，以及几个通用小工具
   ========================================================= */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const pad = (n) => String(n).padStart(2, "0");
const isPhone = () => matchMedia("(max-width: 760px)").matches;
const screens = $$(".screen");

/* ---------- 通用：复制 + 提示 ---------- */
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove("show"), 1600);
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
  if (btn && btn.classList.contains("ink-btn")) {
    const old = btn.textContent;
    btn.textContent = "已复制 ✓";
    setTimeout(() => { btn.textContent = old; }, 1500);
  } else {
    toast("已复制 ✓");
  }
}

/* ---------- 侧边目录 ---------- */
(function buildNav() {
  let html = "", lastGroup = null;
  screens.forEach((s, i) => {
    const g = s.dataset.group;
    if (g && g !== lastGroup) {
      html += `<a href="#${s.id}" data-i="${i}" class="grp">${s.dataset.no}　${g}</a>`;
    }
    if (g) {
      const sub = s.dataset.title.split("·").pop().trim();
      html += `<a href="#${s.id}" data-i="${i}" class="sub">${sub}</a>`;
    } else {
      html += `<a href="#${s.id}" data-i="${i}">${s.dataset.no ? s.dataset.no + "　" : ""}${s.dataset.title}</a>`;
    }
    lastGroup = g || null;
  });
  $("#sideNav").innerHTML = html;
})();

/* ---------- 现在在哪一屏 ---------- */
function currentIndex() {
  const y = scrollY + innerHeight * 0.35;
  let idx = 0;
  screens.forEach((s, i) => { if (s.offsetTop <= y) idx = i; });
  return idx;
}

function updateUI() {
  const i = currentIndex();
  $$("#sideNav a").forEach((a) => a.classList.toggle("on", Number(a.dataset.i) === i && !a.classList.contains("grp")));
  const txt = `${pad(i + 1)} / ${pad(screens.length)}`;
  $("#pagerPos").textContent = txt;
  $("#topPos").textContent = txt;
  $("#prevBtn").disabled = i === 0 && scrollY < 10;
  $("#nextBtn").disabled = i === screens.length - 1 && scrollY + innerHeight >= document.documentElement.scrollHeight - 4;
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
  $("#turnNo").textContent = target.dataset.no ? `No.${target.dataset.no}` : "";
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
const goToId = (id) => { const t = screens.findIndex((s) => s.id === id); goTo(t, t < currentIndex()); };

// 下一步：这一屏没看完就先往下滚，看完了再翻页
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
// 上一步：这一屏已经往下滚过，就先回到顶部；否则翻回上一屏
function prev() {
  const i = currentIndex();
  if (scrollY > screens[i].offsetTop + 24) scrollTo({ top: screens[i].offsetTop, behavior: "smooth" });
  else goTo(i - 1, true);
}

$("#nextBtn").addEventListener("click", next);
$("#prevBtn").addEventListener("click", prev);
addEventListener("keydown", (e) => {
  if (e.target.closest("input, textarea, select, [contenteditable]")) return;
  if (["ArrowRight", "PageDown"].includes(e.key) || (e.key === " " && !e.target.closest("button"))) { e.preventDefault(); next(); }
  if (["ArrowLeft", "PageUp"].includes(e.key)) { e.preventDefault(); prev(); }
});

document.addEventListener("click", (e) => {
  const a = e.target.closest("#sideNav a, .side-brand");
  if (a) { e.preventDefault(); goToId(a.getAttribute("href").slice(1)); return; }
  const g = e.target.closest("[data-goto]");
  if (g) { goToId(g.dataset.goto); return; }
  if (e.target.closest("[data-next]")) next();
});

/* ---------- 文件夹目录 ---------- */
const FOLDER = [
  { tab: "职业之书", en: "The Book of Paths", c: "var(--kraft)", to: "s-book" },
  { tab: "网站案例", en: "Why a Website", c: "var(--sage)", to: "s-cases" },
  { tab: "三件套", en: "HTML · CSS · JS", c: "var(--dusty)", to: "s-lab1" },
  { tab: "设计原则", en: "Five Rules", c: "var(--rose)", to: "s-rules" },
  { tab: "提示词", en: "Prompt Studio", c: "var(--stone)", to: "s-studio" },
  { tab: "动手实践", en: "Make It", c: "#f2d58a", to: "s-make" },
  { tab: "作业总结", en: "See You", c: "#e7b19f", to: "s-hw" }
];
const rig = $("#rig");
const N = FOLDER.length;
rig.innerHTML = FOLDER.map((f, i) => `
  <div class="sheet" data-to="${f.to}" style="--d:${N - 1 - i};--n:${N - 1};--c:${f.c}">
    <span class="tab" style="left:calc(${i} * 13.4% + 1%)">${f.tab}</span>
    <div class="face"><h3>${f.en}</h3><span class="num">${pad(i + 1)} · ${f.tab}</span><div class="peek"><i></i><i></i><i></i></div></div>
  </div>`).reverse().join("") + `
  <div class="pocket"><div class="front"><span class="clasp"></span><div>
    <p class="type">AI · FUTURE · 5-3</p><h3>Today's <i>Folder</i></h3><small>点我打开</small></div></div></div>`;

const scene = $("#folderScene");
let moved = false, dragging = false, sx = 0, sy = 0, rx0 = 0, ry0 = 0;
const cssNum = (v, d) => parseFloat(getComputedStyle(rig).getPropertyValue(v)) || d;

rig.addEventListener("click", (e) => {
  if (moved) return;
  if (!rig.classList.contains("open")) { rig.classList.add("open"); return; }
  const sh = e.target.closest(".sheet");
  if (sh) goToId(sh.dataset.to);
});
scene.addEventListener("pointerdown", (e) => { dragging = true; moved = false; sx = e.clientX; sy = e.clientY; rx0 = cssNum("--rx", -8); ry0 = cssNum("--ry", -16); });
addEventListener("pointermove", (e) => {
  if (!dragging) return;
  const dx = e.clientX - sx, dy = e.clientY - sy;
  if (Math.abs(dx) + Math.abs(dy) > 6) { moved = true; rig.classList.add("dragging"); }
  if (!moved) return;
  rig.style.setProperty("--ry", Math.max(-60, Math.min(60, ry0 + dx * 0.25)) + "deg");
  rig.style.setProperty("--rx", Math.max(-60, Math.min(15, rx0 - dy * 0.2)) + "deg");
});
addEventListener("pointerup", () => { dragging = false; rig.classList.remove("dragging"); setTimeout(() => { moved = false; }, 0); });

/* ---------- 可勾选清单的计数 ---------- */
$$("#selfList input").forEach((cb) => cb.addEventListener("change", () => {
  const all = $$("#selfList input");
  $("#selfCount").textContent = `${all.filter((c) => c.checked).length} / ${all.length}`;
}));

updateUI();
