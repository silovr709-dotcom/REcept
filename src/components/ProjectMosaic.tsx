'use client';

import { useEffect, useRef } from 'react';
import atlas from '@/data/project-atlas.json';

const WORDMARK = 'РЕцепт';
const FULL_MONTAGE_MS = 3600;
const FULL_ASSEMBLY_END_MS = 6250;
const FULL_ANIMATION_END_MS = 6700;
const SHORT_MONTAGE_MS = 2150;
const SHORT_ASSEMBLY_END_MS = 3850;
const SHORT_ANIMATION_END_MS = 4250;
const FLIP_MS = 720;
const FLIP_STAGGER_MS = 500;

type SourceRect = { x: number; y: number; width: number; height: number };

type Tile = {
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  targetX: number;
  targetY: number;
  sourceRect: SourceRect;
  rotation: number;
};

type Scene = {
  width: number;
  height: number;
  dpr: number;
  cellSize: number;
  fontSize: number;
  textWidth: number;
  textY: number;
  tiles: Tile[];
};

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function easeInOutQuint(value: number) {
  const t = clamp(value);
  return t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2;
}

function atlasCellCrop(imageIndex: number, targetAspect: number): SourceRect {
  const { columns, tileWidth, tileHeight } = atlas;
  const cellX = (imageIndex % columns) * tileWidth;
  const cellY = Math.floor(imageIndex / columns) * tileHeight;
  let x = cellX;
  let y = cellY;
  let width = tileWidth;
  let height = tileHeight;

  if (width / height > targetAspect) {
    width = height * targetAspect;
    x += (tileWidth - width) / 2;
  } else {
    height = width / targetAspect;
    y += (tileHeight - height) / 2;
  }

  return { x, y, width, height };
}

function cropRectToAspect(rect: SourceRect, targetAspect: number): SourceRect {
  let { x, y, width, height } = rect;
  if (width / height > targetAspect) {
    const croppedWidth = height * targetAspect;
    x += (width - croppedWidth) / 2;
    width = croppedWidth;
  } else {
    const croppedHeight = width / targetAspect;
    y += (height - croppedHeight) / 2;
    height = croppedHeight;
  }
  return { x, y, width, height };
}

function drawAtlasTile(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  imageIndex: number,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const source = atlasCellCrop(imageIndex, width / height);
  context.drawImage(
    image,
    source.x,
    source.y,
    source.width,
    source.height,
    x,
    y,
    width,
    height,
  );
}

function drawAtlasFragment(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  sourceRect: SourceRect,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const source = cropRectToAspect(sourceRect, width / height);
  context.drawImage(
    image,
    source.x,
    source.y,
    source.width,
    source.height,
    x,
    y,
    width,
    height,
  );
}

function contactSheetGeometry(width: number, height: number) {
  const columns = width < height ? Math.max(3, Math.round(atlas.columns * (2 / 3))) : atlas.columns;
  const rows = Math.ceil(atlas.count / columns);
  return {
    columns,
    rows,
    frameWidth: width / columns,
    frameHeight: height / rows,
  };
}

function drawContactSheet(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
  elapsed: number,
  opacity: number,
  montageEnd: number,
) {
  if (opacity <= 0) return;
  const { columns, rows, frameWidth, frameHeight } = contactSheetGeometry(width, height);
  const frozen = elapsed >= montageEnd;

  for (let index = 0; index < atlas.count; index += 1) {
    const delay = (index * 47) % FLIP_STAGGER_MS;
    const frameTime = (frozen ? montageEnd : elapsed) + delay;
    const frameNumber = Math.floor(frameTime / FLIP_MS);
    const transition = frozen ? 1 : easeInOutQuint((frameTime % FLIP_MS) / FLIP_MS);
    const currentImage = (index + frameNumber * 11) % atlas.count;
    const nextImage = (currentImage + 11) % atlas.count;
    const x = (index % columns) * frameWidth;
    const y = Math.floor(index / columns) * frameHeight;

    context.save();
    context.translate(x, y);
    context.globalAlpha = opacity * (1 - transition);
    drawAtlasTile(context, image, currentImage, 0, 0, frameWidth, frameHeight);
    if (transition > 0) {
      context.globalAlpha = opacity * transition;
      drawAtlasTile(context, image, nextImage, 0, 0, frameWidth, frameHeight);
    }
    context.globalAlpha = opacity;
    context.fillStyle = 'rgba(33, 27, 22, 0.09)';
    context.fillRect(0, 0, frameWidth, frameHeight);
    context.strokeStyle = 'rgba(252, 249, 243, 0.14)';
    context.lineWidth = 0.8;
    context.strokeRect(0, 0, frameWidth, frameHeight);
    context.restore();
  }
}

function createScene(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  montageMs: number,
): Scene {
  const bounds = canvas.getBoundingClientRect();
  const width = Math.max(1, bounds.width);
  const height = Math.max(1, bounds.height);
  // Фото-мозаика — намеренно крупнопиксельная: DPR 1.5 сохраняет чёткость,
  // не заставляя телефон перерисовывать лишние миллионы пикселей.
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  context.setTransform(dpr, 0, 0, dpr, 0, 0);

  const cellSize = Math.max(6, Math.min(15, Math.round(width / 96)));
  const mask = document.createElement('canvas');
  mask.width = canvas.width;
  mask.height = canvas.height;
  const maskContext = mask.getContext('2d', { willReadFrequently: true });
  if (!maskContext) {
    return {
      width,
      height,
      dpr,
      cellSize,
      fontSize: Math.min(width * 0.18, height * 0.3),
      textWidth: width * 0.7,
      textY: height * 0.43,
      tiles: [],
    };
  }

  maskContext.setTransform(dpr, 0, 0, dpr, 0, 0);
  let fontSize = Math.min(width * 0.34, height * 0.48, 420);
  maskContext.font = `400 ${fontSize}px "Cormorant Garamond", Georgia, serif`;
  const maxTextWidth = Math.min(width * 0.82, 1180);
  const initialTextWidth = maskContext.measureText(WORDMARK).width;
  if (initialTextWidth > maxTextWidth) {
    fontSize *= maxTextWidth / initialTextWidth;
    maskContext.font = `400 ${fontSize}px "Cormorant Garamond", Georgia, serif`;
  }

  const textWidth = maskContext.measureText(WORDMARK).width;
  const textY = height * 0.43;
  maskContext.clearRect(0, 0, width, height);
  maskContext.fillStyle = '#fff';
  maskContext.textAlign = 'center';
  maskContext.textBaseline = 'middle';
  maskContext.fillText(WORDMARK, width / 2, textY);

  const maskPixels = maskContext.getImageData(0, 0, canvas.width, canvas.height).data;
  const targets: { x: number; y: number }[] = [];
  const sampleOffsets = [0.2, 0.5, 0.8];
  for (let y = 0; y < height; y += cellSize) {
    for (let x = 0; x < width; x += cellSize) {
      let coverage = 0;
      for (const offsetY of sampleOffsets) {
        for (const offsetX of sampleOffsets) {
          const sampleX = Math.min(canvas.width - 1, Math.floor((x + cellSize * offsetX) * dpr));
          const sampleY = Math.min(canvas.height - 1, Math.floor((y + cellSize * offsetY) * dpr));
          const alpha = maskPixels[(sampleY * canvas.width + sampleX) * 4 + 3];
          coverage = Math.max(coverage, alpha);
        }
      }
      if (coverage > 72) {
        targets.push({ x: x + cellSize / 2, y: y + cellSize / 2 });
      }
    }
  }

  // Each film frame fractures into crops of its own image. The fragments
  // start inside that frame, then travel to the wordmark's photo mask.
  const sheet = contactSheetGeometry(width, height);
  const frameAspect = sheet.frameWidth / sheet.frameHeight;
  const groupCounts = Array.from({ length: atlas.count }, () => 0);
  for (let index = 0; index < targets.length; index += 1) {
    groupCounts[index % atlas.count] += 1;
  }
  const groupOffsets = Array.from({ length: atlas.count }, () => 0);
  const tiles: Tile[] = [];

  for (let index = 0; index < targets.length; index += 1) {
    const target = targets[index];
    if (!target) continue;

    const panelIndex = index % atlas.count;
    const localIndex = groupOffsets[panelIndex]++;
    const partCount = groupCounts[panelIndex];
    const partColumns = Math.max(1, Math.ceil(Math.sqrt(partCount * frameAspect)));
    const partRows = Math.ceil(partCount / partColumns);
    const localColumn = localIndex % partColumns;
    const localRow = Math.floor(localIndex / partColumns);
    const frameX = (panelIndex % sheet.columns) * sheet.frameWidth;
    const frameY = Math.floor(panelIndex / sheet.columns) * sheet.frameHeight;
    const startWidth = sheet.frameWidth / partColumns;
    const startHeight = sheet.frameHeight / partRows;
    const flipDelay = (panelIndex * 47) % FLIP_STAGGER_MS;
    const freezeFrame = Math.floor((montageMs + flipDelay) / FLIP_MS) + 1;
    const imageIndex = (panelIndex + freezeFrame * 11) % atlas.count;
    const imageCrop = atlasCellCrop(imageIndex, frameAspect);

    tiles.push({
      startX: frameX + (localColumn + 0.5) * startWidth,
      startY: frameY + (localRow + 0.5) * startHeight,
      startWidth,
      startHeight,
      targetX: target.x,
      targetY: target.y,
      sourceRect: {
        x: imageCrop.x + (localColumn * imageCrop.width) / partColumns,
        y: imageCrop.y + (localRow * imageCrop.height) / partRows,
        width: imageCrop.width / partColumns,
        height: imageCrop.height / partRows,
      },
      rotation: ((index % 5) - 2) * 0.005,
    });
  }

  return { width, height, dpr, cellSize, fontSize, textWidth, textY, tiles };
}

export function ProjectMosaic({ src }: { src: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d', { alpha: false });
    if (!canvas || !context) return;

    let active = true;
    let imageReady = false;
    let animationFrame = 0;
    let lastFrameAt = 0;
    let startedAt = 0;
    let scene: Scene | null = null;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const shortVisit = document.documentElement.dataset.loader === 'short';
    const montageMs = shortVisit ? SHORT_MONTAGE_MS : FULL_MONTAGE_MS;
    const assemblyEndMs = shortVisit ? SHORT_ASSEMBLY_END_MS : FULL_ASSEMBLY_END_MS;
    const animationEndMs = shortVisit ? SHORT_ANIMATION_END_MS : FULL_ANIMATION_END_MS;
    const atlasImage = new Image();
    atlasImage.decoding = 'async';
    let activePhase: 'montage' | 'assembly' | 'logo' | 'fallback' | null = null;

    const setPhase = (phase: 'montage' | 'assembly' | 'logo' | 'fallback') => {
      if (activePhase === phase) return;
      activePhase = phase;
      document.documentElement.dataset.mosaicPhase = phase;
    };

    const draw = (elapsed: number) => {
      if (!scene || !imageReady || !active) return;
      const { width, height, cellSize, tiles } = scene;
      const phase = reducedMotion
        ? 'logo'
        : elapsed < montageMs
          ? 'montage'
          : elapsed < assemblyEndMs
            ? 'assembly'
            : 'logo';
      setPhase(phase);
      const assemble = reducedMotion
        ? 1
        : easeInOutQuint((elapsed - montageMs) / (assemblyEndMs - montageMs));
      const inMontage = !reducedMotion && elapsed < montageMs;

      context.setTransform(scene.dpr, 0, 0, scene.dpr, 0, 0);
      context.fillStyle = '#211b16';
      context.fillRect(0, 0, width, height);

      const glow = context.createRadialGradient(
        width / 2,
        height * 0.43,
        0,
        width / 2,
        height * 0.43,
        Math.max(width, height) * 0.72,
      );
      glow.addColorStop(0, `rgba(182, 155, 104, ${0.025 + assemble * 0.11})`);
      glow.addColorStop(1, 'rgba(33, 27, 22, 0)');
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);

      if (inMontage) {
        // A restrained camera push gives the rapid project edits a composed,
        // film-like progression instead of a static contact sheet.
        const push = 1.012 + clamp(elapsed / montageMs) * 0.028;
        context.save();
        context.translate(width / 2, height / 2);
        context.scale(push, push);
        context.translate(-width / 2, -height / 2);
        drawContactSheet(context, atlasImage, width, height, elapsed, 1, montageMs);
        context.restore();
        return;
      }

      const pieceReveal = reducedMotion
        ? 1
        : easeInOutQuint((elapsed - montageMs) / 240);
      const sheetOpacity = 1 - pieceReveal + 0.06 * (1 - assemble);
      drawContactSheet(context, atlasImage, width, height, elapsed, sheetOpacity, montageMs);

      for (let index = 0; index < tiles.length; index += 1) {
        const tile = tiles[index];
        const x = tile.startX + (tile.targetX - tile.startX) * assemble;
        const y = tile.startY + (tile.targetY - tile.startY) * assemble;
        const tileWidth = tile.startWidth + (cellSize * 1.08 - tile.startWidth) * assemble;
        const tileHeight = tile.startHeight + (cellSize * 1.08 - tile.startHeight) * assemble;

        context.save();
        context.globalAlpha = pieceReveal;
        context.translate(x, y);
        context.rotate(tile.rotation * (1 - assemble));
        drawAtlasFragment(
          context,
          atlasImage,
          tile.sourceRect,
          -tileWidth / 2,
          -tileHeight / 2,
          tileWidth,
          tileHeight,
        );
        context.fillStyle = `rgba(33, 27, 22, ${0.08 + assemble * 0.07})`;
        context.fillRect(-tileWidth / 2, -tileHeight / 2, tileWidth, tileHeight);
        if (assemble < 0.28) {
          context.strokeStyle = `rgba(252, 249, 243, ${(1 - assemble / 0.28) * 0.18})`;
          context.lineWidth = 0.7;
          context.strokeRect(-tileWidth / 2, -tileHeight / 2, tileWidth, tileHeight);
        }
        context.restore();
      }

      if (assemble > 0.8) {
        const outlineAlpha = ((assemble - 0.8) / 0.2) * 0.42;
        context.save();
        context.font = `400 ${scene.fontSize}px "Cormorant Garamond", Georgia, serif`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.lineWidth = Math.max(0.7, cellSize * 0.055);
        context.strokeStyle = `rgba(214, 193, 150, ${outlineAlpha})`;
        context.strokeText(WORDMARK, width / 2, scene.textY);
        context.restore();
      }
    };

    const resize = () => {
      if (!active) return;
      scene = createScene(canvas, context, montageMs);
      if (imageReady) {
        const elapsed = Date.now() - startedAt;
        draw(reducedMotion ? animationEndMs : elapsed);
      }
    };

    const animate = () => {
      if (!active) return;
      const elapsed = Date.now() - startedAt;
      const frameTime = performance.now();
      // 30 fps достаточно для короткой кинозаставки и бережёт мобильные GPU.
      if (frameTime - lastFrameAt >= 32 || elapsed >= animationEndMs) {
        draw(elapsed);
        lastFrameAt = frameTime;
      }
      if (!reducedMotion && elapsed < animationEndMs) {
        animationFrame = window.requestAnimationFrame(animate);
      }
    };

    const onImageReady = () => {
      if (!active) return;
      startedAt = Date.now();
      imageReady = true;
      document.documentElement.dataset.mosaicReady = 'true';
      resize();
      if (reducedMotion) {
        draw(animationEndMs);
      } else {
        animationFrame = window.requestAnimationFrame(animate);
      }
    };

    atlasImage.onload = onImageReady;
    atlasImage.onerror = () => {
      // Keep the crisp HTML wordmark visible if the atlas cannot be loaded.
      document.documentElement.dataset.mosaicReady = 'error';
      setPhase('fallback');
    };
    atlasImage.src = src;

    window.addEventListener('resize', resize, { passive: true });
    void document.fonts?.ready.then(resize);

    return () => {
      active = false;
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
      delete document.documentElement.dataset.mosaicReady;
      delete document.documentElement.dataset.mosaicPhase;
      atlasImage.onload = null;
      atlasImage.onerror = null;
    };
  }, [src]);

  return <canvas ref={canvasRef} className="loader-mosaic" aria-hidden="true" />;
}
