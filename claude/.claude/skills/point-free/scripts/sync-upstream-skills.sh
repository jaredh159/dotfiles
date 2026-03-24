#!/usr/bin/env bash

set -euo pipefail

repo_root="$(cd "$(dirname "$0")/../../../../.." && pwd)"
source_skills_dir="${PFW_SOURCE_SKILLS_DIR:-$HOME/.pfw/skills}"
claude_skills_dir="$repo_root/claude/.claude/skills"
codex_repo_skills_dir="$repo_root/codex/.codex/skills"
point_free_dir="$claude_skills_dir/point-free"
upstream_dir="$point_free_dir/references/upstream"
catalog_file="$point_free_dir/references/catalog.md"
codex_live_skills_dir="${CODEX_SKILLS_DIR:-$HOME/.codex/skills}"
codex_repo_point_free_link="../../../claude/.claude/skills/point-free"
codex_live_point_free_link="../../.dotfiles/codex/.codex/skills/point-free"

if [[ ! -d "$source_skills_dir" ]]; then
  echo "Missing upstream Point-Free skills at $source_skills_dir" >&2
  echo "Run 'pfw install --tool codex' first, then rerun this script." >&2
  exit 1
fi

mkdir -p "$upstream_dir"

find "$upstream_dir" -mindepth 1 -maxdepth 1 ! -name '.gitignore' -exec rm -rf {} +

skill_dirs=()
while IFS= read -r skill_dir; do
  skill_dirs+=("$skill_dir")
done < <(find "$source_skills_dir" -mindepth 1 -maxdepth 1 -type d | sort)

for skill_dir in "${skill_dirs[@]}"; do
  skill_name="$(basename "$skill_dir")"
  ln -s "$skill_dir" "$upstream_dir/$skill_name"
done

tmp_catalog="$(mktemp)"
{
  echo "# Point-Free Catalog"
  echo
  printf 'Generated from `%s` by `scripts/sync-upstream-skills.sh`.\n' "$source_skills_dir"
  echo
  echo 'Read `references/upstream/pfw/SKILL.md` whenever you use one of the nested Point-Free skills below.'
  echo
  for skill_dir in "${skill_dirs[@]}"; do
    skill_name="$(basename "$skill_dir")"
    skill_file="$skill_dir/SKILL.md"
    trigger_name="$(
      awk '
        /^---$/ { frontmatter = !frontmatter; next }
        frontmatter && /^name:[[:space:]]*/ {
          sub(/^name:[[:space:]]*/, "")
          print
          exit
        }
      ' "$skill_file"
    )"
    printf -- '- `%s` (`references/upstream/%s/SKILL.md`)\n' \
      "$trigger_name" \
      "$skill_name"
  done
} > "$tmp_catalog"
mv "$tmp_catalog" "$catalog_file"

find "$claude_skills_dir" -mindepth 1 -maxdepth 1 \( -name 'pfw-*' -o -name 'the-point-free-way' \) -exec rm -rf {} +
find "$codex_repo_skills_dir" -mindepth 1 -maxdepth 1 \( -name 'pfw-*' -o -name 'the-point-free-way' \) -exec rm -rf {} +

ln -sfn "$codex_repo_point_free_link" "$codex_repo_skills_dir/point-free"

if [[ -d "$codex_live_skills_dir" ]]; then
  find "$codex_live_skills_dir" -mindepth 1 -maxdepth 1 \( -name 'pfw-*' -o -name 'the-point-free-way' \) -exec rm -rf {} +
  ln -sfn "$codex_live_point_free_link" "$codex_live_skills_dir/point-free"
fi

echo "Synced Point-Free meta-skill."
echo "Upstream source: $source_skills_dir"
echo "Meta-skill: $point_free_dir"
