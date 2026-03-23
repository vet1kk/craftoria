# Variables
PHP_BIN := php
COMPOSER := composer
NPM_DIR := public
RUN_SCRIPT := .config/php/run.sh

.DEFAULT_GOAL := help

.PHONY: help
help: ## Display this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

.PHONY: setup
setup: ## Initial project setup (install deps, keys, assets)
	$(COMPOSER) run setup

.PHONY: serve
serve: ## Start the full stack (Nginx, PHP-FPM, Angular)
	$(COMPOSER) run serve

.PHONY: check
check: ## Validate configuration files syntax
	@$(RUN_SCRIPT) check

.PHONY: build
build: ## Create production frontend build
	npm -C $(NPM_DIR) run build:prod

## --- Utility ---

.PHONY: clean
clean: ## Clear all logs and Laravel caches
	@rm -rf storage/logs/*.log
	@$(PHP_BIN) artisan config:clear
	@$(PHP_BIN) artisan cache:clear
	@echo "Project cleaned."

.PHONY: test
test: ## Run backend tests
	$(COMPOSER) run test

.PHONY: dm
dm: ## Drop merged git branches
	git checkout master && git branch --merged | grep -v \* | xargs git branch -D

.PHONY: logs
logs: ## Tail the frontend logs
	tail -f storage/logs/frontend.log
