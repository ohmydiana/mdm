const btnNo = document.getElementById("btnNo");
const btnYes = document.getElementById("btnYes");
const zone = document.querySelector(".buttons");

window.addEventListener("load", () => {
  // na mobiloch utekací mód neriešime
  if (window.innerWidth <= 500) return;

  const SAFE_DIST = 60;  // keď si bližšie než toto, začne utekať
  const MAX_STEP = 40;   // max posun v jednom kroku – menšie, plynulejšie

  let initialLeft;
  let initialTop;
  let isHidden = false;

  // centrovanie buttonov pod otázkou
  function initPosition() {
    const zoneRect = zone.getBoundingClientRect();
    const yesWidth = btnYes.offsetWidth;
    const noWidth = btnNo.offsetWidth;
    const btnHeight = btnYes.offsetHeight;
    const gap = 20;

    const totalWidth = yesWidth + gap + noWidth;
    const startX = (zoneRect.width - totalWidth) / 2;
    const top = (zoneRect.height - btnHeight) / 2;

    // Veľmi doľava od stredu
    btnYes.style.left = startX + "px";
    btnYes.style.top = top + "px";

    // Trochu doprava od stredu
    const noLeft = startX + yesWidth + gap;
    btnNo.style.left = noLeft + "px";
    btnNo.style.top = top + "px";

    initialLeft = noLeft;
    initialTop = top;
  }

  initPosition();

  function hideButton() {
    const zoneRect = zone.getBoundingClientRect();
    btnNo.style.left = zoneRect.width + 200 + "px"; // mimo box
    btnNo.style.top = "-120px";
    btnNo.style.opacity = "0";
    btnNo.style.pointerEvents = "none";
    isHidden = true;
  }

  function resetButton() {
    btnNo.style.left = initialLeft + "px";
    btnNo.style.top = initialTop + "px";
    btnNo.style.opacity = "1";
    btnNo.style.pointerEvents = "auto";
    isHidden = false;
  }

  // plynulé utekajúce správanie
  zone.addEventListener("mousemove", (e) => {
    if (isHidden) return;

    const rect = btnNo.getBoundingClientRect();
    const zoneRect = zone.getBoundingClientRect();

    const btnCenterX = rect.left + rect.width / 2;
    const btnCenterY = rect.top + rect.height / 2;

    const dx = e.clientX - btnCenterX;
    const dy = e.clientY - btnCenterY;
    const dist = Math.hypot(dx, dy);

    if (dist < SAFE_DIST && dist > 0) {
      const dirX = -dx / dist; // opačný smer
      const dirY = -dy / dist;

      // čím bližšie, tým väčší krok – ale max MAX_STEP
      const factor = (SAFE_DIST - dist) / SAFE_DIST; // 0..1
      const step = MAX_STEP * factor;

      let currentLeft = parseFloat(btnNo.style.left || (rect.left - zoneRect.left));
      let currentTop = parseFloat(btnNo.style.top || (rect.top - zoneRect.top));

      let newLeft = currentLeft + dirX * step;
      let newTop = currentTop + dirY * step;

      const maxX = zoneRect.width - rect.width;
      const maxY = zoneRect.height - rect.height;

      const clampedLeft = Math.max(0, Math.min(newLeft, maxX));
      const clampedTop = Math.max(0, Math.min(newTop, maxY));

      const hitEdge =
        clampedLeft === 0 ||
        clampedLeft === maxX ||
        clampedTop === 0 ||
        clampedTop === maxY;

      if (hitEdge) {
        hideButton(); // na kraji zmizne
        return;
      }

      btnNo.style.left = clampedLeft + "px";
      btnNo.style.top = clampedTop + "px";
    }
  });

  // zakážeme klik na "Trochu"
  btnNo.addEventListener("mousedown", (e) => e.preventDefault());

  // hover na "Veľmi" vráti "Trochu" späť na pôvodnú pozíciu
  btnYes.addEventListener("mouseenter", resetButton);
});
