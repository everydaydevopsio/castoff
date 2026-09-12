SHELL := /bin/bash

ACTION_DIR := castoff

.PHONY: deps install build test test-coverage lint lint-fix e2e-act e2e-act-live

deps:
	@if command -v act >/dev/null 2>&1; then \
		echo "act already installed: $$(act --version)"; \
	elif [ "$$(uname)" = "Darwin" ]; then \
		brew install act; \
	else \
		curl -s https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash -s -- -b /usr/local/bin; \
	fi

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
