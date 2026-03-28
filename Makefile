# Variables
COMPOSER := composer
dc := docker compose
de := docker compose exec

.DEFAULT_GOAL := help

.PHONY: help
help: ## Display this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

.PHONY: setup
setup: ## Initial project setup (install deps, keys, assets)
	$(COMPOSER) run setup

## --- Utility ---

.PHONY: clean
clean: ## Clear all logs and Laravel caches
	rm -rf storage/logs/*.log
	php artisan config:clear
	php artisan cache:clear
	echo "Project cleaned."

.PHONY: test
test: ## Run backend tests
	$(COMPOSER) run test

.PHONY: dm
dm: ## Drop merged git branches
	git checkout master && git branch --merged | grep -v \* | xargs git branch -D

.PHONY: build
build: ## Build & Start application
	$(dc) up --build -d

.PHONY: up
up: ## Start application
	$(dc) up -d

.PHONY: down
down: ## Stop application
	$(dc) down

.PHONY: restart
restart: ## Restart application
	$(dc) down && $(dc) up -d

.PHONY: php
php: ## Go into php console
	$(de) php /bin/bash

.PHONY: web
web: ## Go into web console
	$(de) web /bin/bash

.PHONY: db
db: ## Go into db console
	$(de) db /bin/bash
