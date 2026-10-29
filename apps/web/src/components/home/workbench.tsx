"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Search, Upload, X } from "lucide-react";
import { ToolGrid } from "@/components/home/tool-grid";
import { Button } from "@/components/ui/button";
import { setPendingFile } from "@/lib/pending-file";
import {
  categories,
  fileExtension,
  searchTools,
  toolHref,
  tools,
  toolsForFile,
  type Tool,
  type ToolCategory,
} from "@/lib/tools";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/format";

/**
 * The home page's working surface: drop, paste or pick a file to see the tools that can
 * open it, or search the index. Choosing a tool hands the file over via pending-file.
 */
export function Workbench() {
  const router = useRouter();
  const searchId = useId();
  const fileInput = useRef<HTMLInputElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ToolCategory | null>(null);
  const isMac = useIsMac();

  const searched = searchTools(query);
  const matches = category
    ? searched.filter((tool) => tool.category === category)
    : searched;
  const suggestions = file ? toolsForFile(file) : [];

  useEffect(() => {
    // Paste a file anywhere on the page; ⌘K / Ctrl+K jumps to search.
    function onPaste(event: ClipboardEvent) {
      const pasted = event.clipboardData?.files[0];
      if (pasted) {
        event.preventDefault();
        setFile(pasted);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        searchInput.current?.focus();
      }
    }
    // Stop the browser opening a file that misses the drop zone.
    function onWindowDrop(event: DragEvent) {
      event.preventDefault();
    }
    window.addEventListener("paste", onPaste);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("dragover", onWindowDrop);
    window.addEventListener("drop", onWindowDrop);
    return () => {
      window.removeEventListener("paste", onPaste);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("dragover", onWindowDrop);
      window.removeEventListener("drop", onWindowDrop);
    };
  }, []);

  function openTool(tool: Tool) {
    if (file) setPendingFile(file);
    router.push(toolHref(tool));
  }

  function onSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      const top = matches.find((tool) => tool.status === "live");
      if (top) openTool(top);
    } else if (event.key === "Escape") {
      setQuery("");
    }
  }

  return (
    <div className="flex flex-col gap-16">
      <div
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null))
            setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          const dropped = event.dataTransfer.files[0];
          if (dropped) setFile(dropped);
        }}
        className={cn(
          "rounded-2xl border transition-colors duration-200",
          dragging
            ? "border-solid border-primary bg-primary/10"
            : "border-dashed border-foreground/50 bg-card/40 dark:border-foreground/35",
        )}
      >
        <div className="flex min-h-56 flex-col justify-center gap-6 p-6 sm:p-10">
          {file ? (
            <FileSuggestions
              file={file}
              tools={suggestions}
              onOpen={openTool}
              onClear={() => setFile(null)}
            />
          ) : (
            <div className="flex flex-col items-start gap-4">
              <span
                className={cn(
                  "grid size-11 place-items-center rounded-full border transition-colors duration-200",
                  dragging
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-secondary text-muted-foreground",
                )}
              >
                <Upload aria-hidden className="size-5" />
              </span>
              <p
                className="text-2xl font-medium tracking-tight sm:text-3xl"
                aria-live="polite"
              >
                {dragging ? "Let go to open it." : "Drop a file, or paste one."}
              </p>
              <p className="text-muted-foreground">
                Moss shows you the tools that can work with it.
              </p>
              <Button
                variant="outline"
                size="lg"
                onClick={() => fileInput.current?.click()}
              >
                Choose a file
              </Button>
              <input
                ref={fileInput}
                type="file"
                className="sr-only"
                tabIndex={-1}
                aria-hidden
                onChange={(event) => {
                  const picked = event.target.files?.[0];
                  if (picked) setFile(picked);
                  event.target.value = "";
                }}
              />
            </div>
          )}
        </div>
      </div>

      <section
        id="tools"
        aria-labelledby="tools-heading"
        className="flex scroll-mt-24 flex-col gap-5"
      >
        <h2 id="tools-heading" className="text-xl font-medium tracking-tight">
          All tools
        </h2>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CategoryChips
            tools={searched}
            selected={category}
            onSelect={setCategory}
          />
          <div className="flex h-9 items-center gap-2 rounded-full border border-border px-3.5 transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-primary md:w-72">
            <Search
              aria-hidden
              className="size-4 shrink-0 text-muted-foreground"
            />
            <label htmlFor={searchId} className="sr-only">
              Search tools
            </label>
            <input
              id={searchId}
              ref={searchInput}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={onSearchKeyDown}
              placeholder={`Search ${tools.length} tools`}
              autoComplete="off"
              className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
            />
            <kbd className="hidden shrink-0 rounded border border-border px-1.5 py-0.5 font-mono text-xs text-muted-foreground sm:block">
              {isMac ? "⌘K" : "Ctrl K"}
            </kbd>
          </div>
        </div>

        {matches.length > 0 ? (
          <ToolGrid tools={matches} />
        ) : (
          <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-border p-8">
            <p className="text-muted-foreground">
              No tool matches
              {query.trim() && <> “{query.trim()}”</>}
              {category && (
                <> in {categories.find((c) => c.id === category)?.label}</>
              )}
              .
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setQuery("");
                setCategory(null);
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}

/** Single-select category filter. Counts reflect the current search. */
function CategoryChips({
  tools,
  selected,
  onSelect,
}: {
  tools: Tool[];
  selected: ToolCategory | null;
  onSelect: (category: ToolCategory | null) => void;
}) {
  const chips = [
    { id: null, label: "All", count: tools.length },
    ...categories.map((c) => ({
      ...c,
      count: tools.filter((tool) => tool.category === c.id).length,
    })),
  ];

  return (
    <div
      role="group"
      aria-label="Filter by category"
      className="flex flex-wrap gap-2"
    >
      {chips.map((chip) => {
        const active = chip.id === selected;
        return (
          <button
            key={chip.label}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(chip.id)}
            className={cn(
              "flex h-9 shrink-0 items-center gap-2 rounded-full border px-3.5 text-sm outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              active
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
            )}
          >
            {chip.label}
            <span
              className={cn(
                "font-mono text-xs",
                active ? "text-background/70" : "text-muted-foreground/70",
              )}
            >
              {chip.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function FileSuggestions({
  file,
  tools,
  onOpen,
  onClear,
}: {
  file: File;
  tools: Tool[];
  onOpen: (tool: Tool) => void;
  onClear: () => void;
}) {
  const ext = fileExtension(file.name) || file.type || "this kind of";

  return (
    <div className="flex flex-col gap-5 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200">
      <div className="flex items-center gap-3">
        <p className="min-w-0 truncate font-mono text-sm">
          {file.name}
          <span className="text-muted-foreground">
            {" "}
            · {formatBytes(file.size)}
          </span>
        </p>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClear}
          aria-label="Clear file"
        >
          <X />
        </Button>
      </div>

      {tools.length > 0 ? (
        <>
          <p className="text-2xl font-medium tracking-tight sm:text-3xl">
            What should Moss do with it?
          </p>
          <ul className="flex flex-col gap-1 sm:grid sm:grid-cols-2 sm:gap-x-6">
            {tools.map((tool) => (
              <li key={tool.slug}>
                {tool.status === "live" ? (
                  <Link
                    href={toolHref(tool)}
                    onClick={(event) => {
                      event.preventDefault();
                      onOpen(tool);
                    }}
                    className="group flex items-center gap-2 rounded-sm py-1.5 text-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <ArrowRight
                      aria-hidden
                      className="size-4 text-primary transition-transform group-hover:translate-x-0.5"
                    />
                    <span className="underline-offset-4 group-hover:underline">
                      {tool.action}
                    </span>
                  </Link>
                ) : (
                  <span className="flex items-center gap-2 py-1.5 text-lg text-muted-foreground">
                    <ArrowRight aria-hidden className="size-4" />
                    {tool.action}
                    <span className="text-xs">soon</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="text-2xl font-medium tracking-tight sm:text-3xl">
          Moss can’t open {ext} files yet.
        </p>
      )}
    </div>
  );
}

const noSubscribe = () => () => {};

/** Shows ⌘K on Apple devices and Ctrl K elsewhere, without a hydration mismatch. */
function useIsMac() {
  return useSyncExternalStore(
    noSubscribe,
    () => /mac|iphone|ipad/i.test(navigator.userAgent),
    () => true,
  );
}
