/**
 * Hands a file from the home page workbench to a tool page. Client-side navigation keeps
 * this module alive, so the File object survives the route change without being uploaded
 * or serialised. A full page load clears it, and the tool falls back to its own uploader.
 */
let pending: File | null = null

export function setPendingFile(file: File) {
  pending = file
}

/** Returns the waiting file once, then clears it. */
export function takePendingFile() {
  const file = pending
  pending = null
  return file
}
