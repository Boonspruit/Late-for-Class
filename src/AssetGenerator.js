/**
 * Generates programmatic pixel-art game assets.
 * Buttons use flat colors with 1px pixel-art borders matching the retro style.
 * Floor uses a brick/concrete texture.
 */
export class AssetGenerator {
  static generateAll(scene) {
    if (scene.textures.exists('btn-left')) scene.textures.remove('btn-left');
    if (scene.textures.exists('btn-right')) scene.textures.remove('btn-right');
    if (scene.textures.exists('btn-left-pressed')) scene.textures.remove('btn-left-pressed');
    if (scene.textures.exists('btn-right-pressed')) scene.textures.remove('btn-right-pressed');
    if (scene.textures.exists('timer-frame')) scene.textures.remove('timer-frame');
    if (scene.textures.exists('timer-fill')) scene.textures.remove('timer-fill');
    if (scene.textures.exists('ground-tex')) scene.textures.remove('ground-tex');

    AssetGenerator.generateButtons(scene);
    AssetGenerator.generateTimerBar(scene);
    AssetGenerator.generateGround(scene);
  }

  // ─── PIXEL-ART BUTTONS ───
  static generateButtons(scene) {
    const s = 80;

    // Colors: warm pixel-art palette
    const FACE = '#E8A030';
    const FACE_PRESSED = '#C88020';
    const LIGHT = '#F0C060';
    const SHADOW = '#8A5010';
    const DARK = '#5A3008';
    const ICON = '#FFFFF0';
    const ICON_SHADOW = '#C88020';

    // Helper: draw a pixel-art circle button
    function drawButton(ctx, faceColor, lightColor, shadowColor, darkColor) {
      // Outer dark border
      ctx.fillStyle = darkColor;
      ctx.beginPath(); ctx.arc(40, 40, 37, 0, Math.PI * 2); ctx.fill();
      // Shadow edge (bottom-right)
      ctx.fillStyle = shadowColor;
      ctx.beginPath(); ctx.arc(40, 41, 35, 0, Math.PI * 2); ctx.fill();
      // Main face
      ctx.fillStyle = faceColor;
      ctx.beginPath(); ctx.arc(40, 39, 34, 0, Math.PI * 2); ctx.fill();
      // Highlight edge (top)
      ctx.fillStyle = lightColor;
      ctx.beginPath(); ctx.arc(40, 37, 30, Math.PI * 1.15, Math.PI * 1.85); ctx.fill();
      // Inner face (clip to circle)
      ctx.fillStyle = faceColor;
      ctx.beginPath(); ctx.arc(40, 39, 29, 0, Math.PI * 2); ctx.fill();
      // Top shine pixels
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.fillRect(28, 20, 24, 3);
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fillRect(30, 23, 20, 2);
    }

    // === FLIP BUTTON (left) — normal ===
    const cl = scene.textures.createCanvas('btn-left', s, s);
    const ctxL = cl.getContext();
    drawButton(ctxL, FACE, LIGHT, SHADOW, DARK);
    // Flip icon: circular arrow
    ctxL.strokeStyle = ICON_SHADOW; ctxL.lineWidth = 4; ctxL.lineCap = 'round';
    ctxL.beginPath(); ctxL.arc(40, 41, 13, -0.3, Math.PI + 0.3); ctxL.stroke();
    ctxL.strokeStyle = ICON; ctxL.lineWidth = 3;
    ctxL.beginPath(); ctxL.arc(40, 40, 13, -0.3, Math.PI + 0.3); ctxL.stroke();
    // Arrow head
    ctxL.fillStyle = ICON;
    ctxL.beginPath(); ctxL.moveTo(26, 33); ctxL.lineTo(21, 43); ctxL.lineTo(31, 41); ctxL.closePath(); ctxL.fill();
    cl.refresh();

    // === FLIP BUTTON — pressed ===
    const clP = scene.textures.createCanvas('btn-left-pressed', s, s);
    const ctxLP = clP.getContext();
    drawButton(ctxLP, FACE_PRESSED, SHADOW, DARK, DARK);
    ctxLP.strokeStyle = ICON; ctxLP.lineWidth = 3; ctxLP.lineCap = 'round';
    ctxLP.beginPath(); ctxLP.arc(40, 42, 13, -0.3, Math.PI + 0.3); ctxLP.stroke();
    ctxLP.fillStyle = ICON;
    ctxLP.beginPath(); ctxLP.moveTo(26, 35); ctxLP.lineTo(21, 45); ctxLP.lineTo(31, 43); ctxLP.closePath(); ctxLP.fill();
    clP.refresh();

    // === STEP BUTTON (right) — normal ===
    const cr = scene.textures.createCanvas('btn-right', s, s);
    const ctxR = cr.getContext();
    drawButton(ctxR, FACE, LIGHT, SHADOW, DARK);
    // Step icon: up arrow
    ctxR.fillStyle = ICON_SHADOW;
    ctxR.beginPath();
    ctxR.moveTo(40, 17); ctxR.lineTo(57, 41); ctxR.lineTo(49, 41);
    ctxR.lineTo(49, 61); ctxR.lineTo(31, 61); ctxR.lineTo(31, 41);
    ctxR.lineTo(23, 41); ctxR.closePath(); ctxR.fill();
    ctxR.fillStyle = ICON;
    ctxR.beginPath();
    ctxR.moveTo(40, 15); ctxR.lineTo(56, 39); ctxR.lineTo(48, 39);
    ctxR.lineTo(48, 59); ctxR.lineTo(32, 59); ctxR.lineTo(32, 39);
    ctxR.lineTo(24, 39); ctxR.closePath(); ctxR.fill();
    cr.refresh();

    // === STEP BUTTON — pressed ===
    const crP = scene.textures.createCanvas('btn-right-pressed', s, s);
    const ctxRP = crP.getContext();
    drawButton(ctxRP, FACE_PRESSED, SHADOW, DARK, DARK);
    ctxRP.fillStyle = ICON;
    ctxRP.beginPath();
    ctxRP.moveTo(40, 19); ctxRP.lineTo(56, 42); ctxRP.lineTo(48, 42);
    ctxRP.lineTo(48, 62); ctxRP.lineTo(32, 62); ctxRP.lineTo(32, 42);
    ctxRP.lineTo(24, 42); ctxRP.closePath(); ctxRP.fill();
    crP.refresh();
  }

  // ─── TIMER BAR ───
  static generateTimerBar(scene) {
    const fw = 220, fh = 22;
    const cf = scene.textures.createCanvas('timer-frame', fw, fh);
    const ctxF = cf.getContext();
    ctxF.fillStyle = '#2A1A0E'; ctxF.fillRect(0, 0, fw, fh);
    ctxF.fillStyle = '#5A4A3E'; ctxF.fillRect(1, 1, fw - 2, 2);
    ctxF.fillStyle = '#1A0E04'; ctxF.fillRect(3, 3, fw - 6, fh - 6);
    ctxF.fillStyle = '#3A2A1E'; ctxF.fillRect(1, fh - 3, fw - 2, 2);
    cf.refresh();

    const flW = 214, flH = 16;
    const cfl = scene.textures.createCanvas('timer-fill', flW, flH);
    const ctxFl = cfl.getContext();
    const g = ctxFl.createLinearGradient(0, 0, 0, flH);
    g.addColorStop(0, '#66BBFF'); g.addColorStop(0.2, '#4499EE');
    g.addColorStop(0.5, '#3377DD'); g.addColorStop(0.8, '#2266CC');
    g.addColorStop(1, '#1155BB');
    ctxFl.fillStyle = g; ctxFl.fillRect(0, 0, flW, flH);
    ctxFl.fillStyle = 'rgba(255,255,255,0.4)'; ctxFl.fillRect(0, 0, flW, 4);
    ctxFl.fillStyle = 'rgba(255,255,255,0.15)'; ctxFl.fillRect(0, 4, flW, 3);
    cfl.refresh();
  }

  // ─── PIXEL-ART GROUND — matches the school gate stone pathway ───
  static generateGround(scene) {
    const w = 400, h = 200;
    const ct = scene.textures.createCanvas('ground-tex', w, h);
    const ctx = ct.getContext();

    // Base: warm stone matching the school gate entrance
    ctx.fillStyle = '#78685A';
    ctx.fillRect(0, 0, w, h);

    // Cobblestone / brick pattern
    const brickW = 32, brickH = 16;
    for (let row = 0; row < Math.ceil(h / brickH); row++) {
      const offset = (row % 2) * (brickW / 2);
      for (let col = -1; col < Math.ceil(w / brickW) + 1; col++) {
        const bx = col * brickW + offset;
        const by = row * brickH;

        // Slight color variation per brick
        const r = 100 + Math.floor(Math.random() * 25);
        const g = 85 + Math.floor(Math.random() * 20);
        const b = 70 + Math.floor(Math.random() * 18);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(bx + 1, by + 1, brickW - 2, brickH - 2);

        // Brick highlight (top-left)
        ctx.fillStyle = `rgba(255,235,200,0.12)`;
        ctx.fillRect(bx + 1, by + 1, brickW - 2, 2);
        ctx.fillRect(bx + 1, by + 1, 2, brickH - 2);

        // Brick shadow (bottom-right)
        ctx.fillStyle = `rgba(0,0,0,0.12)`;
        ctx.fillRect(bx + 1, by + brickH - 3, brickW - 2, 2);
        ctx.fillRect(bx + brickW - 3, by + 1, 2, brickH - 2);
      }

      // Mortar lines (horizontal)
      ctx.fillStyle = '#5A4A3E';
      ctx.fillRect(0, row * brickH, w, 1);
    }

    // Top edge: curb highlight
    ctx.fillStyle = '#9A8A78';
    ctx.fillRect(0, 0, w, 3);
    ctx.fillStyle = '#B0A090';
    ctx.fillRect(0, 0, w, 1);

    // Bottom: darker edge
    ctx.fillStyle = '#4A3A2E';
    ctx.fillRect(0, h - 3, w, 3);

    // Scattered pixel dirt/moss spots for character
    for (let i = 0; i < 80; i++) {
      const x = Math.floor(Math.random() * w);
      const y = Math.floor(Math.random() * h);
      if (Math.random() > 0.5) {
        ctx.fillStyle = `rgba(60,80,40,${0.1 + Math.random() * 0.1})`; // moss
      } else {
        ctx.fillStyle = `rgba(50,35,25,${0.08 + Math.random() * 0.08})`; // dirt
      }
      ctx.fillRect(x, y, 2 + Math.floor(Math.random() * 3), 2);
    }

    ct.refresh();
  }
}
