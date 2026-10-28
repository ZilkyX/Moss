import { describe, expect, it } from "vitest"
import { fileExtension, searchTools, tools, toolsForFile } from "./tools"

const slugs = (list: { slug: string }[]) => list.map((tool) => tool.slug)

describe("toolsForFile", () => {
  it("offers the image tools for a PNG, live ones first", () => {
    const result = toolsForFile({ name: "photo.png", type: "image/png" })
    expect(slugs(result)).toEqual(
      expect.arrayContaining(["background-remover", "image-compressor", "format-converter", "image-enhancer"])
    )
    expect(result.at(-1)?.status).toBe("soon")
  })

  it("matches HEIC by extension when the browser reports no type", () => {
    expect(slugs(toolsForFile({ name: "IMG_0001.HEIC", type: "" }))).toEqual(["format-converter", "metadata-remover"])
  })

  it("offers PDF to images for PDFs", () => {
    expect(slugs(toolsForFile({ name: "scan.pdf", type: "application/pdf" }))).toEqual(["pdf-to-images"])
  })

  it("never suggests tools that start from text, not a file", () => {
    expect(slugs(toolsForFile({ name: "notes.txt", type: "text/plain" }))).not.toContain("qr-code-maker")
  })

  it("offers the JSON formatter for .json files", () => {
    expect(slugs(toolsForFile({ name: "data.json", type: "application/json" }))).toEqual(["json-formatter"])
  })

  it("returns nothing for unknown files", () => {
    expect(toolsForFile({ name: "archive.xyz", type: "application/octet-stream" })).toEqual([])
  })
})

describe("searchTools", () => {
  it("returns every tool for an empty query", () => {
    expect(searchTools("  ")).toHaveLength(tools.length)
  })

  it("ranks name matches above keyword matches", () => {
    expect(slugs(searchTools("comp"))[0]).toBe("image-compressor")
  })

  it("finds tools by keyword", () => {
    expect(slugs(searchTools("heic to jpg"))).toEqual(["format-converter"])
    expect(slugs(searchTools("exif"))).toEqual(["metadata-remover"])
    expect(slugs(searchTools("qr"))[0]).toBe("qr-code-maker")
  })
})

describe("fileExtension", () => {
  it("lower-cases and ignores dotfiles", () => {
    expect(fileExtension("A.PNG")).toBe(".png")
    expect(fileExtension(".env")).toBe("")
  })
})
