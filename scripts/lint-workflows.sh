#!/usr/bin/env bash
set -euo pipefail

# Validate every workflow in the repository, including the reusable workflows
# under examples/, which actionlint does not discover on its own because they
# live outside the repository's own .github/workflows directory.
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd)"

if command -v actionlint >/dev/null 2>&1; then
  actionlint_bin="$(command -v actionlint)"
else
  actionlint_bin="${ACTIONLINT_INSTALL_DIR:-$REPO_ROOT/.ballast/bin}/actionlint"
  if [[ ! -x "$actionlint_bin" ]]; then
    bash "$SCRIPT_DIR/install-actionlint.sh"
  fi
fi

mapfile -t workflows < <(
  find "$REPO_ROOT/.github/workflows" "$REPO_ROOT/examples" \
    -type f \( -name '*.yml' -o -name '*.yaml' \) \
    -path '*/workflows/*' | sort
)
if [[ ${#workflows[@]} -eq 0 ]]; then
  echo "ERROR: No workflow files found to lint." >&2
  exit 1
fi

echo "Linting ${#workflows[@]} workflow files with actionlint."
"$actionlint_bin" -color "${workflows[@]}"
