export const MAX_LOGO_BYTES = 4 * 1024 * 1024;
const OUTPUT_SIZE = 128;

export const ACCEPTED_LOGO_TYPES = "image/png,image/jpeg,image/webp,image/svg+xml";

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("That file isn't a readable image."));
    image.src = src;
  });
}

/**
 * Downscales an uploaded logo to a small square data URL.
 *
 * Logos live in localStorage alongside the company, and writeStorage swallows
 * quota errors — an oversized original would look saved and silently vanish on
 * reload. Re-encoding to 128px keeps each logo a few KB instead of megabytes.
 */
export async function fileToLogoDataUrl(file: File): Promise<string> {
  if (file.size > MAX_LOGO_BYTES) {
    throw new Error("Pick an image under 4 MB.");
  }

  const original = await readAsDataUrl(file);

  // SVG is already tiny and vector — re-encoding would only lose quality.
  if (file.type === "image/svg+xml") return original;

  const image = await loadImage(original);
  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not process that image.");

  // Cover-fit the largest centred square so logos aren't distorted.
  const side = Math.min(image.width, image.height);
  const offsetX = (image.width - side) / 2;
  const offsetY = (image.height - side) / 2;
  context.drawImage(image, offsetX, offsetY, side, side, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

  return canvas.toDataURL("image/webp", 0.9);
}
