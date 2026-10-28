import {
  Braces,
  Crop,
  Eraser,
  EyeOff,
  FileImage,
  Minimize2,
  Pipette,
  QrCode,
  Repeat,
  Sparkles,
  type LucideIcon,
} from "lucide-react"

/**
 * The single list of Moss tools. The home page, the /tools directory, navigation and the
 * sitemap all read from here, so adding a tool means adding one entry.
 */
export type ToolCategory = "image" | "convert" | "text"

export type Tool = {
  slug: string
  name: string
  /** One line, shown in the index. */
  description: string
  /** Verb phrase for the drop suggestions: "Remove background". */
  action: string
  category: ToolCategory
  icon: LucideIcon
  /** MIME types ("image/png", "image/*") and extensions (".heic") the tool opens. */
  accepts: string[]
  /** Short format list for the index, e.g. "PNG · JPG · WEBP". */
  formats: string
  /** Extra words people might search for. */
  keywords: string[]
  status: "live" | "soon"
  /** Only the background remover sends files to the server (services/ai). */
  runsOn: "browser" | "server"
}

export const categories: { id: ToolCategory; label: string }[] = [
  { id: "image", label: "Image" },
  { id: "convert", label: "Convert" },
  { id: "text", label: "Text & code" },
]

const rasterImages = ["image/png", "image/jpeg", "image/webp"]

export const tools: Tool[] = [
  {
    slug: "background-remover",
    name: "Background remover",
    description: "Cut the subject out and get a transparent PNG.",
    action: "Remove background",
    category: "image",
    icon: Eraser,
    accepts: rasterImages,
    formats: "PNG · JPG · WEBP",
    keywords: ["cutout", "transparent", "remove bg", "erase"],
    status: "live",
    runsOn: "server",
  },
  {
    slug: "image-editor",
    name: "Image editor",
    description: "Crop, rotate, flip and resize.",
    action: "Crop or resize",
    category: "image",
    icon: Crop,
    accepts: rasterImages,
    formats: "PNG · JPG · WEBP",
    keywords: ["crop", "rotate", "resize", "flip"],
    status: "live",
    runsOn: "browser",
  },
  {
    slug: "image-compressor",
    name: "Image compressor",
    description: "Make images smaller without visible loss.",
    action: "Compress",
    category: "image",
    icon: Minimize2,
    accepts: rasterImages,
    formats: "PNG · JPG · WEBP",
    keywords: ["shrink", "optimize", "reduce size", "smaller"],
    status: "live",
    runsOn: "browser",
  },
  {
    slug: "image-enhancer",
    name: "Image enhancer",
    description: "Sharpen and upscale low-resolution photos.",
    action: "Enhance",
    category: "image",
    icon: Sparkles,
    accepts: rasterImages,
    formats: "PNG · JPG · WEBP",
    keywords: ["upscale", "sharpen", "improve", "quality"],
    status: "soon",
    runsOn: "server",
  },
  {
    slug: "color-picker",
    name: "Colour picker",
    description: "Pick colours and pull a palette from any image.",
    action: "Pick colours",
    category: "image",
    icon: Pipette,
    accepts: rasterImages,
    formats: "PNG · JPG · WEBP",
    keywords: ["color", "eyedropper", "hex", "palette", "swatch"],
    status: "soon",
    runsOn: "browser",
  },
  {
    slug: "metadata-remover",
    name: "Metadata remover",
    description: "Strip location, camera and other EXIF data before sharing.",
    action: "Remove metadata",
    category: "image",
    icon: EyeOff,
    accepts: ["image/jpeg", "image/png", "image/webp", ".heic", ".heif"],
    formats: "JPG · PNG · WEBP · HEIC",
    keywords: ["exif", "gps", "location", "privacy", "strip"],
    status: "soon",
    runsOn: "browser",
  },
  {
    slug: "format-converter",
    name: "Format converter",
    description: "Turn images into PNG, JPG, WEBP or AVIF.",
    action: "Convert format",
    category: "convert",
    icon: Repeat,
    accepts: ["image/*", ".heic", ".heif"],
    formats: "PNG · JPG · WEBP · AVIF · HEIC",
    keywords: ["heic to jpg", "png to jpg", "webp", "avif", "change format"],
    status: "live",
    runsOn: "browser",
  },
  {
    slug: "pdf-to-images",
    name: "PDF to images",
    description: "Save each PDF page as a PNG or JPG.",
    action: "Turn pages into images",
    category: "convert",
    icon: FileImage,
    accepts: ["application/pdf", ".pdf"],
    formats: "PDF → PNG · JPG",
    keywords: ["pdf to png", "pdf to jpg", "pages", "extract"],
    status: "soon",
    runsOn: "browser",
  },
  {
    slug: "json-formatter",
    name: "JSON formatter",
    description: "Pretty-print, validate and minify JSON.",
    action: "Format JSON",
    category: "text",
    icon: Braces,
    accepts: ["application/json", ".json"],
    formats: "JSON",
    keywords: ["beautify", "validate", "minify", "prettify"],
    status: "soon",
    runsOn: "browser",
  },
  {
    slug: "qr-code-maker",
    name: "QR code maker",
    description: "Turn a link or text into a QR code you can download.",
    action: "Make a QR code",
    category: "text",
    icon: QrCode,
    // Starts from typed text, not a file, so it never appears in drop suggestions.
    accepts: [],
    formats: "PNG · SVG",
    keywords: ["qr", "barcode", "link", "url"],
    status: "soon",
    runsOn: "browser",
  },
]

export function toolHref(tool: Tool) {
  return `/tools/${tool.slug}`
}

/** Lower-case extension with the dot, or "" when the name has none. */
export function fileExtension(name: string) {
  const dot = name.lastIndexOf(".")
  return dot > 0 ? name.slice(dot).toLowerCase() : ""
}

function accepts(tool: Tool, file: Pick<File, "name" | "type">) {
  const ext = fileExtension(file.name)
  const type = file.type.toLowerCase()
  return tool.accepts.some((pattern) => {
    if (pattern.startsWith(".")) return pattern === ext
    if (pattern.endsWith("/*")) return type.startsWith(pattern.slice(0, -1))
    return pattern === type
  })
}

/** Tools that can open this file, live ones first. */
export function toolsForFile(file: Pick<File, "name" | "type">) {
  return tools
    .filter((tool) => accepts(tool, file))
    .sort((a, b) => Number(a.status === "soon") - Number(b.status === "soon"))
}

/** Tools matching a search, best matches first. An empty query returns every tool. */
export function searchTools(query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return tools

  const score = (tool: Tool) => {
    const name = tool.name.toLowerCase()
    if (name.startsWith(q)) return 3
    if (name.includes(q) || tool.action.toLowerCase().includes(q)) return 2
    const haystack = [tool.description, tool.formats, ...tool.keywords].join(" ").toLowerCase()
    return haystack.includes(q) ? 1 : 0
  }

  return tools
    .map((tool) => ({ tool, score: score(tool) }))
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((match) => match.tool)
}
