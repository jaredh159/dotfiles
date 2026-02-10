export function parseBranchFromDir(dirname: string): string | null {
  const doubleMatch = dirname.match(/^(.+?)--/);
  if (doubleMatch) {
    return doubleMatch[1];
  }

  const singleMatch = dirname.match(/^(.+)-\d{6}$/);
  if (singleMatch) {
    return singleMatch[1];
  }

  return null;
}

export function makeDatestamp(): string {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const yy = String(now.getFullYear()).slice(-2);
  return `${mm}${dd}${yy}`;
}

export function makeTargetDir(slug: string): string {
  return `${slug}-${makeDatestamp()}`;
}

export function dbNameFromDir(dirname: string): string {
  return `g_${dirname.replace(/-/g, "_")}`;
}
