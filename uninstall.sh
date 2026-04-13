#!/usr/bin/env bash
# ============================================================
# garuda-ui-claude-plugin — uninstall.sh
#
# Removes the plugin folders from a target project.
#
# Usage:
#   ./uninstall.sh [TARGET_DIR]
#
# TARGET_DIR defaults to the current working directory ($PWD).
# ============================================================

set -euo pipefail

VERSION_FILE=".garuda-plugin-version"

info() { printf '\033[0;34m[garuda-plugin]\033[0m %s\n' "$*"; }
ok()   { printf '\033[0;32m[garuda-plugin]\033[0m %s\n' "$*"; }
die()  { printf '\033[0;31m[garuda-plugin] ERROR:\033[0m %s\n' "$*" >&2; exit 1; }

TARGET="${1:-$PWD}"
TARGET="$(cd "$TARGET" && pwd)"

# Check if plugin is installed
if [ ! -f "$TARGET/$VERSION_FILE" ]; then
  die "No plugin version file found at $TARGET/$VERSION_FILE — is the plugin installed here?"
fi

INSTALLED_SHA="$(cat "$TARGET/$VERSION_FILE")"
echo ""
info "This will remove the following from: $TARGET"
echo "    .claude/"
echo "    tools/"
echo "    claudeOutput/"
echo "    $VERSION_FILE  (installed at commit: $INSTALLED_SHA)"
echo ""
printf 'Are you sure? [y/N] '
read -r CONFIRM

case "$CONFIRM" in
  [yY][eE][sS]|[yY])
    ;;
  *)
    info "Aborted."
    exit 0
    ;;
esac

remove_if_exists() {
  if [ -e "$TARGET/$1" ]; then
    rm -rf "$TARGET/$1"
    ok "  Removed $1"
  else
    info "  $1 not found, skipping"
  fi
}

remove_if_exists ".claude"
remove_if_exists "tools"
remove_if_exists "claudeOutput"
remove_if_exists "$VERSION_FILE"

echo ""
ok "Plugin uninstalled from $TARGET"
