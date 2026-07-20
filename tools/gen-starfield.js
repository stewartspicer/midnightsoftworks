// Seeded LCG so the scatter is reproducible
let s = 20260720;
const rnd = () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
const W = 913, H = 701, N = 78;
const stars = [];
for (let i = 0; i < N; i++) {
  // mild clustering: 30% of stars spawn near a previous star
  let x, y;
  if (i > 4 && rnd() < 0.3) {
    const p = stars[Math.floor(rnd() * stars.length)];
    x = Math.max(2, Math.min(W - 2, p.x + (rnd() - 0.5) * 160));
    y = Math.max(2, Math.min(H - 2, p.y + (rnd() - 0.5) * 160));
  } else { x = 2 + rnd() * (W - 4); y = 2 + rnd() * (H - 4); }
  const t = rnd();
  let r, o; // radius, opacity
  if (t < 0.6)      { r = 0.7, o = 0.2 + rnd() * 0.25; }
  else if (t < 0.9) { r = 0.9, o = 0.45 + rnd() * 0.2; }
  else              { r = 1.35, o = 0.7 + rnd() * 0.2; }
  const violet = rnd() < 0.25;
  stars.push({ x: +x.toFixed(1), y: +y.toFixed(1), r, o: +o.toFixed(2), violet });
}
const circles = stars.map(st =>
  `<circle cx='${st.x}' cy='${st.y}' r='${st.r}' fill='${st.violet ? "%23c8aaff" : "%23ffffff"}' fill-opacity='${st.o}'/>`
).join("");
const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${W}' height='${H}'>${circles}</svg>`;
const uri = `url("data:image/svg+xml,${svg.replace(/</g, "%3C").replace(/>/g, "%3E").replace(/#/g, "%23")}")`;
console.log(uri.length + " chars");
require("fs").writeFileSync("stars-uri.txt", uri);
