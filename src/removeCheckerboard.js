/**
 * A perfect, bulletproof chroma-key (green screen) remover for the new AI sprites.
 * Removes all pixels that are #00FF00 (pure green).
 */
export function removeCheckerboard(scene, textureKey, outputKey, frameConfig = null) {
  if (scene.textures.exists(outputKey)) {
    scene.textures.remove(outputKey);
  }

  const source = scene.textures.get(textureKey).getSourceImage();
  const w = source.width;
  const h = source.height;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(source, 0, 0);

  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  // Advanced chroma key with green de-spill for perfect edges
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Calculate how 'green' the pixel is compared to red/blue
    const maxRB = Math.max(r, b);
    
    // If it's strongly green, it's the pure background
    if (g > 150 && maxRB < 90) {
      data[i + 3] = 0; // Set alpha to 0 (fully transparent)
    } 
    // If it's somewhat green, it's likely an edge pixel (anti-aliasing artifact)
    else if (g > maxRB) {
      // De-spill: clamp the green channel so it stops glowing green
      data[i + 1] = maxRB; 
      
      // Feather the transparency based on how 'green' the pixel was mixed
      const greenness = g - maxRB;
      const currentAlpha = data[i + 3];
      // Reduce alpha proportionally: a greenness of 30 might reduce alpha by 90
      const newAlpha = Math.max(0, currentAlpha - (greenness * 3)); 
      data[i + 3] = newAlpha;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  if (frameConfig) {
    scene.textures.addSpriteSheet(outputKey, canvas, frameConfig);
  } else {
    scene.textures.addCanvas(outputKey, canvas);
  }
}
