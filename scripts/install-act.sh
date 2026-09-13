#!/usr/bin/env bash
set -euo pipefail

ACT_VERSION="0.2.89"
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
platform="$(uname -s)"
architecture="$(uname -m)"
case "$architecture" in
  aarch64) architecture=arm64 ;;
  armv6l) architecture=armv6 ;;
  armv7l) architecture=armv7 ;;
  i686) architecture=i386 ;;
esac
case "$platform" in
  Linux|Darwin) ;;
  *) echo "ERROR: Unsupported ACT platform: $platform" >&2; exit 1 ;;
esac

archive="act_${platform}_${architecture}.tar.gz"
checksum="$(awk -v archive="$archive" '$2 == archive { print $1 }' "$SCRIPT_DIR/act-v${ACT_VERSION}-checksums.txt")"
if [[ -z "$checksum" ]]; then
  echo "ERROR: Unsupported ACT architecture: $architecture" >&2
  exit 1
fi
for dependency in curl tar sudo; do
  if ! command -v "$dependency" >/dev/null 2>&1; then
    echo "ERROR: Install $dependency before running make deps." >&2
    exit 1
  fi
done
if command -v sha256sum >/dev/null 2>&1; then
  checksum_command=(sha256sum -c -)
elif command -v shasum >/dev/null 2>&1; then
  checksum_command=(shasum -a 256 -c -)
else
  echo "ERROR: Install sha256sum or shasum before running make deps." >&2
  exit 1
fi

download_dir="$(mktemp -d)"
trap 'rm -rf -- "$download_dir"' EXIT
curl --fail --silent --show-error --location \
  "https://github.com/nektos/act/releases/download/v${ACT_VERSION}/${archive}" \
  --output "$download_dir/$archive"
(
  cd "$download_dir"
  printf '%s  %s\n' "$checksum" "$archive" | "${checksum_command[@]}"
)
tar -xzf "$download_dir/$archive" -C "$download_dir" act
sudo install -m 0755 "$download_dir/act" /usr/local/bin/act
echo "Installed ACT v${ACT_VERSION} to /usr/local/bin/act."
