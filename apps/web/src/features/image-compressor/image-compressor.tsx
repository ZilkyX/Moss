"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { downloadBlob } from "@/lib/download";
import { formatBytes } from "@/lib/format";
import { clearPendingFile, peekPendingFile } from "@/lib/pending-file";
import { cn } from "@/lib/utils";
import { BlobPreview } from "./blob-preview";
import { compressImage, describeChange, outputName } from "./compress";

/** A finished attempt: which file and settings it was for, and whether it worked. */
type Result = { source: File; settings: string } & (
  | { status: "done"; blob: Blob; type: string }
  | { status: "failed"; message: string }
);

type Output = "original" | "image/webp" | "image/jpeg";

const outputs: { value: Output; label: string }[] = [
  { value: "original", label: "Same as original" },
  { value: "image/webp", label: "WebP" },
  { value: "image/jpeg", label: "JPEG" },
];

/**
 * Next keeps visited pages alive (hidden) and restores their state, so a second visit would
 * ignore a new file from home. Keying on bfcacheId starts fresh on each link click, while
 * back/forward still restores the previous work.
 */
export function ImageCompressor({ accepts }: { accepts: string[] }) {
  const { bfcacheId } = useRouter();
  return <Compressor key={bfcacheId} accepts={accepts} />;
}

function Compressor({ accepts }: { accepts: string[] }) {
  const [file, setFile] = useState<File | null>(() => peekPendingFile());
  const inputId = useId();
  const qualityId = useId();

  useEffect(() => {
    clearPendingFile();
  }, []);

  const [output, setOutput] = useState<Output>("original");
  const [quality, setQuality] = useState(75); // what the slider shows
  const [committedQuality, setCommittedQuality] = useState(75); // what compression uses
  const [result, setResult] = useState<Result | null>(null);

  // Everything that affects the result, as one string. If it changes, the result is outdated.
  const settings = `${output}|${committedQuality}`;

  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    const type = output === "original" ? file.type : output;
    compressImage(file, { type, quality: committedQuality / 100 })
      .then((blob) => {
        if (!cancelled)
          setResult({ source: file, settings, status: "done", blob, type });
      })
      .catch((error: unknown) => {
        if (!cancelled)
          setResult({
            source: file,
            settings,
            status: "failed",
            message:
              error instanceof Error ? error.message : "Something went wrong.",
          });
      });

    return () => {
      cancelled = true;
    };
  }, [file, settings, output, committedQuality]);

  const current = result?.source === file ? result : null;
  const working = !current || current.settings !== settings;

  // No file yet: show the picker.
  if (!file) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-2xl border border-dashed border-foreground/50 p-6 sm:p-10 dark:border-foreground/35">
        <label htmlFor={inputId} className="font-medium">
          Choose an image
        </label>
        <input
          id={inputId}
          type="file"
          accept={accepts.join(",")}
          onChange={(event) => {
            const picked = event.target.files?.[0];
            if (picked) setFile(picked);
          }}
        />
      </div>
    );
  }

  // PNG ignores quality, so the slider would do nothing.
  const outputType = output === "original" ? file.type : output;
  const lossless = outputType === "image/png";

  // A file is chosen: previews, settings and download.
  return (
    <div className="flex flex-col gap-6">
      <p className="font-mono text-sm">
        {file.name} · {formatBytes(file.size)}
      </p>

      {/* Previews */}
      <div
        className={cn(
          "grid gap-4 transition-opacity sm:grid-cols-2",
          working && "opacity-50",
        )}
      >
        <figure className="flex flex-col gap-2">
          <div className="aspect-square overflow-hidden rounded-xl border border-border bg-card">
            <BlobPreview blob={file} alt="Original" />
          </div>
          <figcaption className="text-sm text-muted-foreground">
            Original · {formatBytes(file.size)}
          </figcaption>
        </figure>
        <figure className="flex flex-col gap-2">
          <div className="aspect-square overflow-hidden rounded-xl border border-border bg-card">
            {current?.status === "done" && (
              <BlobPreview blob={current.blob} alt="Compressed" />
            )}
          </div>
          <figcaption className="text-sm text-muted-foreground">
            {current?.status === "done"
              ? `Compressed · ${formatBytes(current.blob.size)} (${describeChange(file.size, current.blob.size)})`
              : current?.status === "failed"
                ? "Couldn't compress"
                : "Compressing…"}
          </figcaption>
        </figure>
      </div>

      {current?.status === "failed" && (
        <p role="alert" className="text-sm text-destructive">
          {current.message}
        </p>
      )}
      {current?.status === "done" && current.blob.size >= file.size && (
        <p className="text-sm text-muted-foreground">
          This setting makes the file bigger. Try a lower quality or WebP.
        </p>
      )}

      {/* Format */}
      <div className="flex flex-col gap-3">
        <span className="text-sm">Format</span>
        <div className="flex flex-wrap gap-2">
          {outputs.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={output === option.value}
              onClick={() => setOutput(option.value)}
              className={cn(
                "h-9 rounded-full border px-3.5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                output === option.value
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quality */}
      <div className="flex max-w-sm flex-col gap-3">
        <div className="flex justify-between text-sm">
          <span id={qualityId}>Quality</span>
          <span className="font-mono">{quality}</span>
        </div>
        <Slider
          aria-labelledby={qualityId}
          value={[quality]}
          min={10}
          max={95}
          step={5}
          disabled={lossless}
          onValueChange={(value) => setQuality(firstValue(value))}
          onValueCommitted={(value) => setCommittedQuality(firstValue(value))}
        />
        {lossless && (
          <p className="text-sm text-muted-foreground">
            PNG is lossless, so quality has no effect. Choose WebP for a much
            smaller file.
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button
          disabled={working || current?.status !== "done"}
          onClick={() =>
            current?.status === "done" &&
            downloadBlob(current.blob, outputName(file.name, current.type))
          }
        >
          Download
        </Button>
        <Button variant="outline" onClick={() => setFile(null)}>
          Choose another image
        </Button>
      </div>
    </div>
  );
}

// Base UI reports one number or a list of them; this slider has one thumb.
function firstValue(value: number | readonly number[]) {
  return typeof value === "number" ? value : value[0];
}
