SHELL := /bin/bash

.PHONY: setup deps install build typecheck test test-coverage lint lint-fix format e2e-act

deps:
	@if command -v act >/dev/null 2>&1; then \
		echo "act already installed: $$(act --version)"; \
	else \
		bash scripts/install-act.sh; \
	fi

setup: deps
	@set -e; \
	export NVM_DIR="$${NVM_DIR:-$${XDG_CONFIG_HOME:+$$XDG_CONFIG_HOME/nvm}}"; \
	export NVM_DIR="$${NVM_DIR:-$$HOME/.nvm}"; \
	nvm_script="$$NVM_DIR/nvm.sh"; \
	if [ ! -s "$$nvm_script" ] && command -v brew >/dev/null 2>&1; then \
		if nvm_prefix="$$(brew --prefix nvm 2>/dev/null)"; then \
			nvm_script="$$nvm_prefix/nvm.sh"; \
		fi; \
	fi; \
	if [ ! -s "$$nvm_script" ]; then \
		echo "nvm not found. Install nvm or set NVM_DIR, then rerun make setup." >&2; \
		exit 1; \
	fi; \
	. "$$nvm_script" --no-use; \
	nvm install; \
	if [ ! -x "$$NVM_BIN/corepack" ]; then npm install --global corepack; fi; \
	"$$NVM_BIN/corepack" enable pnpm; \
	COREPACK_ENABLE_DOWNLOAD_PROMPT=0 pnpm install --frozen-lockfile; \
	echo "Setup complete. Activate Node in your current terminal, then run make test:"; \
	printf 'export NVM_DIR=%q; . %q; nvm use\n' "$$NVM_DIR" "$$nvm_script"

install:
	pnpm install

build:
	pnpm --filter castoff build

typecheck:
	pnpm --filter castoff typecheck

test:
	pnpm --filter castoff test

test-coverage:
	pnpm --filter castoff test:coverage

lint:
	pnpm --filter castoff lint

lint-fix:
	pnpm --filter castoff lint:fix

format:
	pnpm prettier:fix

e2e-act: build
	./scripts/e2e-act.sh
