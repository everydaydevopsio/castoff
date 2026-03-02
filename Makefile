SHELL := /bin/bash

.PHONY: e2e-act e2e-act-live

e2e-act:
	./scripts/e2e-act.sh

e2e-act-live:
	./scripts/e2e-act.sh --live
