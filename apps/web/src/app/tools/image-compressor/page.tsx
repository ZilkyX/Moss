import type { Metadata } from "next";
import { ImageCompressor } from "@/features/image-compressor/image-compressor";
import { getTool } from "@/lib/tools";

const tool = getTool("image-compressor");

export const metadata: Metadata = { title: tool.name };

export default function ImageCompressorPage() {
  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-medium tracking-tight">{tool.name}</h1>
        <p className="text-muted-foreground">{tool.description}</p>
      </div>
      <ImageCompressor accepts={tool.accepts} />
    </>
  );
}
