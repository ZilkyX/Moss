export type CompressOptions = {
  type: string;
  quality: number;
};

export async function compressImage(
  file: File,
  { type, quality }: CompressOptions,
): Promise<Blob> {
  // 1. Decode the file into pixels. Swap the browser's technical error for one a person can act on.
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error(
      "Moss couldn't read this image. It may be damaged or in a format the browser can't open.",
    );
  }

  // 2. Make a canvas the same size as the image.
  const { width, height } = bitmap;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("This image is too large for the browser to process.");
  }

  // JPEG has no transparency, so paint white first or transparent areas turn black.
  if (type === "image/jpeg") {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
  }

  // 3. Draw the pixels, then free the bitmap's memory.
  context.drawImage(bitmap, 0, 0);
  bitmap.close();

  // 4. Encode. toBlob uses a callback, so wrap it in a Promise to use it with await.
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob)
          reject(
            new Error("This image is too large for the browser to process."),
          );
        else if (blob.type !== type)
          reject(
            new Error(
              `This browser can't save ${type.replace("image/", "").toUpperCase()} files.`,
            ),
          );
        else resolve(blob);
      },
      type,
      quality,
    );
  });
}

export function percentSaved(before: number, after: number) {
  return Math.round((1 - after / before) * 100);
}

export function describeChange(before: number, after: number) {
  const saved = percentSaved(before, after);
  if (saved > 0) return `${saved}% smaller`;
  if (saved < 0) return `${-saved}% larger`;
  return "same size";
}

const extensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function outputName(name: string, type: string) {
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  return `${base}-compressed.${extensions[type] ?? "img"}`;
}
