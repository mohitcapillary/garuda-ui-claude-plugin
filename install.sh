#!/usr/bin/env bash
# ============================================================
# garuda-ui-claude-plugin — install.sh
#
# Installs the Claude agents, skills, commands, mapping tool,
# and example output into a target garuda-ui project.
#
# Usage:
#   # Mode 1: one-liner from your project root
#   curl -sSL https://raw.githubusercontent.com/<owner>/garuda-ui-claude-plugin/main/install.sh | bash
#
#   # Mode 2: clone then run
#   git clone https://github.com/<owner>/garuda-ui-claude-plugin
#   cd garuda-ui-claude-plugin
#   ./install.sh [TARGET_DIR]
#
# TARGET_DIR defaults to the current working directory ($PWD).
# ============================================================

set -euo pipefail

REPO_URL="https://github.com/<owner>/garuda-ui-claude-plugin"
BRANCH="main"
VERSION_FILE=".garuda-plugin-version"
TMP_DIR=""

# ── helpers ────────────────────────────────────────────────
info()  { printf '\033[0;34m[garuda-plugin]\033[0m %s\n' "$*"; }
ok()    { printf '\033[0;32m[garuda-plugin]\033[0m %s\n' "$*"; }
warn()  { printf '\033[0;33m[garuda-plugin]\033[0m %s\n' "$*"; }
die()   { printf '\033[0;31m[garuda-plugin] ERROR:\033[0m %s\n' "$*" >&2; exit 1; }

cleanup() {
  if [ -n "$TMP_DIR" ] && [ -d "$TMP_DIR" ]; then
    rm -rf "$TMP_DIR"
  fi
}
trap cleanup EXIT

# ── resolve source ──────────────────────────────────────────
# If BASH_SOURCE[0] is a real file on disk, we were cloned.
# If we're piped through bash, BASH_SOURCE[0] will be empty or
# the name of a temp file — we must clone to get the assets.

SCRIPT_DIR=""
if [ -n "${BASH_SOURCE[0]:-}" ] && [ -f "${BASH_SOURCE[0]}" ]; then
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
fi

if [ -n "$SCRIPT_DIR" ] && [ -d "$SCRIPT_DIR/.claude" ]; then
  SRC="$SCRIPT_DIR"
  info "Using local plugin source: $SRC"
else
  info "Cloning plugin from GitHub..."
  command -v git >/dev/null 2>&1 || die "git is required but not found"
  TMP_DIR="$(mktemp -d)"
  git clone --depth=1 --branch "$BRANCH" "$REPO_URL" "$TMP_DIR" \
    || die "Failed to clone $REPO_URL"
  SRC="$TMP_DIR"
fi

# ── resolve target ──────────────────────────────────────────
TARGET="${1:-$PWD}"
TARGET="$(cd "$TARGET" && pwd)"

info "Installing into: $TARGET"

# ── copy folders ────────────────────────────────────────────
copy_folder() {
  local name="$1"
  if [ -d "$TARGET/$name" ]; then
    warn "  $name/ already exists — merging (existing files will not be overwritten)"
    # cp -rn copies only files that don't already exist at destination
    cp -rn "$SRC/$name/." "$TARGET/$name/"
  else
    cp -r "$SRC/$name" "$TARGET/$name"
  fi
  ok "  $name/ installed"
}

copy_folder ".claude"
copy_folder "tools"
copy_folder "claudeOutput"

# ── write version marker ─────────────────────────────────────
COMMIT_SHA="unknown"
if command -v git >/dev/null 2>&1 && [ -d "$SRC/.git" ]; then
  COMMIT_SHA="$(git -C "$SRC" rev-parse --short HEAD 2>/dev/null || echo unknown)"
fi

printf '%s\n' "$COMMIT_SHA" > "$TARGET/$VERSION_FILE"
ok "  $VERSION_FILE written (commit: $COMMIT_SHA)"

# ── done ─────────────────────────────────────────────────────
echo ""
ok "Installation complete!"
echo ""
echo "  Next steps:"
echo "  1. Open $TARGET in VS Code with the Claude Code extension"
echo "  2. Run /architect-scan to generate your project architecture doc"
echo "  3. Run /generate-guidelines to generate UI development guidelines"
echo "  4. To uninstall, run: ./uninstall.sh $TARGET"
echo ""
