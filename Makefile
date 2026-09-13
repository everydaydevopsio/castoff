SHELL := /bin/bash

ACTION_DIR := castoff

.PHONY: setup deps install build test test-coverage lint lint-fix e2e-act e2e-act-live

deps:
	@if command -v act >/dev/null 2>&1; then \
		echo "act already installed: $$(act --version)"; \
	elif [ "$$(uname)" = "Darwin" ]; then \
		brew install act; \
	else \
		curl -s https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash -s -- -b /usr/local/bin; \
	fi

setup: deps
	@set -e; \
	export NVM_DIR="$${NVM_DIR:-$${XDG_CONFIG_HOME:+$$XDG_CONFIG_HOME/nvm}}"; \
	export NVM_DIR="$${NVM_DIR:-$$HOME/.nvm}"; \
	nvm_script="$$NVM_DIR/nvm.sh"; \
	if [ ! -s "$$nvm_script" ] && command -v brew >/dev/null 2>&1; then \
		nvm_script="$$(brew --prefix nvm)/nvm.sh"; \
	fi; \
	if [ ! -s "$$nvm_script" ]; then \
		echo "nvm not found. Install nvm or set NVM_DIR, then rerun make setup." >&2; \
		exit 1; \
	fi; \
	. "$$nvm_script" --no-use; \
	nvm install; \
	if [ ! -x "$$NVM_BIN/corepack" ]; then npm install --global corepack; fi; \
	"$$NVM_BIN/corepack" enable pnpm; \
	"$$NVM_BIN/corepack" install --global pnpm@9; \
	(cd "$(ACTION_DIR)" && COREPACK_ENABLE_AUTO_PIN=0 pnpm install --frozen-lockfile); \
	echo "Setup complete. Activate Node in your current terminal, then run make test:"; \
	printf 'export NVM_DIR=%q; . %q; nvm use\n' "$$NVM_DIR" "$$nvm_script"

install:
	cd $(ACTION_DIR) && pnpm install

build:
	cd $(ACTION_DIR) && pnpm build

test:
	cd $(ACTION_DIR) && pnpm test

test-coverage:
	cd $(ACTION_DIR) && pnpm test:coverage

lint:
	cd $(ACTION_DIR) && pnpm lint

lint-fix:
	cd $(ACTION_DIR) && pnpm lint:fix

e2e-act:
	./scripts/e2e-act.sh

e2e-act-live:
	./scripts/e2e-act.sh --live
