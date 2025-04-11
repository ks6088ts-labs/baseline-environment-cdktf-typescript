# Git
GIT_REVISION ?= $(shell git rev-parse --short HEAD)
GIT_TAG ?= $(shell git describe --tags --abbrev=0 --always | sed -e s/v//g)

# Azure CLI
SUBSCRIPTION_ID ?= $(shell az account show --query id --output tsv)
SUBSCRIPTION_NAME ?= $(shell az account show --query name --output tsv)
TENANT_ID ?= $(shell az account show --query tenantId --output tsv)

STACKS ?= ResourceGroupStack StorageAccountStack AiServicesStack ApiManagementStack ContainerAppEnvironmentStack ContainerAppStack
CDKTF_ENVIRONMENT ?= dev

.PHONY: help
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
.DEFAULT_GOAL := help

.PHONY: info
info: ## show information
	@echo "GIT_REVISION: $(GIT_REVISION)"
	@echo "GIT_TAG: $(GIT_TAG)"
	@echo "SUBSCRIPTION_ID: $(SUBSCRIPTION_ID)"
	@echo "SUBSCRIPTION_NAME: $(SUBSCRIPTION_NAME)"
	@echo "TENANT_ID: $(TENANT_ID)"

.PHONY: install-deps-dev
install-deps-dev: ## install dependencies for development
	@# https://pnpm.io/installation
	@which pnpm || npm install -g pnpm
	@# https://developer.hashicorp.com/terraform/tutorials/cdktf/cdktf-install
	@which cdktf || npm install -g cdktf-cli
	pnpm install
	pnpm run get

.PHONY: fix
fix: ## fix code style
	pnpm run fix:prettier

.PHONY: lint
lint: ## lint
	pnpm run lint:prettier

.PHONY: lint-hcl
lint-hcl: ## run static analysis on HCL files
	trivy config ./cdktf.out/stacks
	tflint --init
	tflint \
		--chdir ./cdktf.out/stacks/ \
		--disable-rule=terraform_deprecated_interpolation \
		--disable-rule=terraform_required_version \
		--recursive

.PHONY: test
test: ## run tests
	pnpm run test

.PHONY: build
build: ## build applications
	pnpm run build

.PHONY: clean
clean: ## clean up the project
	rm -rf cdktf.out

.PHONY: synth
synth: clean ## synthesize the given stacks
	CDKTF_ENVIRONMENT=$(CDKTF_ENVIRONMENT) cdktf synth --hcl

.PHONY: ci-test
ci-test: install-deps-dev lint build synth lint-hcl test ## run CI test

.PHONY: plan
plan: ## perform a diff (terraform plan) for the given stack
	CDKTF_ENVIRONMENT=$(CDKTF_ENVIRONMENT) cdktf diff

.PHONY: deploy
deploy: clean ## create or update the given stacks
	CDKTF_ENVIRONMENT=$(CDKTF_ENVIRONMENT) cdktf deploy --auto-approve $(STACKS)

.PHONY: destroy
destroy: clean ## destroy the given stacks
	CDKTF_ENVIRONMENT=$(CDKTF_ENVIRONMENT) cdktf destroy --auto-approve $(STACKS)

.PHONY: update
update: ## update dependencies
	pnpm update
