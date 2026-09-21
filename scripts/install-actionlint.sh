#!/usr/bin/env bash
set -euo pipefail

# Mirrors scripts/install-act.sh: pinned version, checked-in checksums, no
# third-party action in CI. Installs beside the repository rather than into
# /usr/local/bin, so workflow linting needs no sudo.
ACTIONLINT_VERSION="1.7.12"
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
INSTALL_DIR="${ACTIONLINT_INSTALL_DIR:-$SCRIPT_DIR/../.ballast/bin}"

platform="$(uname -s | tr '[:upper:]' '[:lower:]')"
architecture="$(uname -m)"
case "$architecture" in
  x86_64) architecture=amd64 ;;
  aarch64) architecture=arm64 ;;
  armv6l | armv7l) architecture=armv6 ;;
  i686) architecture=386 ;;
esac
case "$platform" in
  linux | darwin) ;;
  *) echo "ERROR: Unsupported actionlint platform: $platform" >&2; exit 1 ;;
esac

archive="actionlint_${ACTIONLINT_VERSION}_${platform}_${architecture}.tar.gz"
checksums="$SCRIPT_DIR/actionlint-v${ACTIONLINT_VERSION}-checksums.txt"
checksum="$(awk -v archive="$archive" '$2 == archive { print $1 }' "$checksums")"
if [[ -z "$checksum" ]]; then
  echo "ERROR: Unsupported actionlint architecture: $architecture" >&2
  exit 1
fi
for dependency in curl tar; do
  if ! command -v "$dependency" >/dev/null 2>&1; then
    echo "ERROR: Install $dependency before linting workflows." >&2
    exit 1
  fi
done
if command -v sha256sum >/dev/null 2>&1; then
  checksum_command=(sha256sum -c -)
elif command -v shasum >/dev/null 2>&1; then
  checksum_command=(shasum -a 256 -c -)
else
  echo "ERROR: Install sha256sum or shasum before linting workflows." >&2
  exit 1
fi

download_dir="$(mktemp -d)"
trap 'rm -rf -- "$download_dir"' EXIT
curl --fail --silent --show-error --location \
  "https://github.com/rhysd/actionlint/releases/download/v${ACTIONLINT_VERSION}/${archive}" \
  --output "$download_dir/$archive"
(
  cd "$download_dir"
  printf '%s  %s\n' "$checksum" "$archive" | "${checksum_command[@]}"
)
tar -xzf "$download_dir/$archive" -C "$download_dir" actionlint
mkdir -p "$INSTALL_DIR"
install -m 0755 "$download_dir/actionlint" "$INSTALL_DIR/actionlint"
echo "Installed actionlint v${ACTIONLINT_VERSION} to $INSTALL_DIR/actionlint."
