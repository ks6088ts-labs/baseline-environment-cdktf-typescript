# Git
GIT_REVISION ?= $(shell git rev-parse --short HEAD)
GIT_TAG ?= $(shell git describe --tags --abbrev=0 --always | sed -e s/v//g)

# Azure CLI
SUBSCRIPTION_ID ?= $(shell az account show --query id --output tsv)
SUBSCRIPTION_NAME ?= $(shell az account show --query name --output tsv)
TENANT_ID ?= $(shell az account show --query tenantId --output tsv)

# AWS CLI
AWS_ID ?= $(shell aws sts get-caller-identity --query Account --output text)

# Google CLI
GOOGLE_PROJECT_ID ?= $(shell gcloud config get-value project)

# Backend: azurerm, local
OUTPUT_DIR ?= $(PWD)/cdktf.out
TF_BACKEND ?= local
STACKS ?= \
	Dev-ServicePrincipalStack \
	Dev-AzureadPlaygroundStack \
	Dev-AwsPlaygroundStack \
	Dev-GooglePlaygroundStack \
	Dev-GithubEnvironmentSecretStack-Azure \
	Dev-GithubEnvironmentSecretStack-Aws \
	Dev-GithubEnvironmentSecretStack-Google \

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
	@echo "AWS_ID: $(AWS_ID)"
	@echo "GOOGLE_PROJECT_ID: $(GOOGLE_PROJECT_ID)"

.PHONY: install-deps-dev
install-deps-dev: assets ## install dependencies for development
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
	trivy config $(OUTPUT_DIR)/tf
	tflint --init
	tflint \
		--chdir $(OUTPUT_DIR)/tf \
		--disable-rule=terraform_deprecated_interpolation \
		--disable-rule=terraform_required_version \
		--recursive

.PHONY: test
test: ## run tests
	pnpm run test

.PHONY: build
build: ## build applications
	pnpm run build

.PHONY: synth
synth: ## synthesize the given stacks
	mkdir -p $(OUTPUT_DIR)/tf
	cdktf synth \
		--hcl \
		--output $(OUTPUT_DIR)/tf

.PHONY: ci-test
ci-test: install-deps-dev lint build test synth lint-hcl diff ## run CI test

.PHONY: diff
diff: ## perform a diff (terraform plan) for the given stack
	TF_BACKEND=$(TF_BACKEND) cdktf diff \
		--output $(OUTPUT_DIR)/json \
		$(STACKS)

.PHONY: deploy
deploy: ## create or update the given stacks
	TF_BACKEND=$(TF_BACKEND) cdktf deploy \
		--output $(OUTPUT_DIR)/json \
		--auto-approve \
		$(STACKS)

.PHONY: destroy
destroy: ## destroy the given stacks
	TF_BACKEND=$(TF_BACKEND) cdktf destroy \
		--output $(OUTPUT_DIR)/json \
		--auto-approve \
		$(STACKS)

.PHONY: output
output: ## show the output of the given stacks
	TF_BACKEND=$(TF_BACKEND) cdktf output \
		--output $(OUTPUT_DIR)/json \
		$(STACKS)

.PHONY: update
update: ## update dependencies
	pnpm update --latest

.PHONY: assets
assets: ## update assets
	cd assets/aws_lambda_function \
		&& zip -r ../../lambda.zip . \
		&& mkdir -p $(OUTPUT_DIR)/json/stacks/Dev-AwsPlaygroundStack && cp ../../lambda.zip $(OUTPUT_DIR)/json/stacks/Dev-AwsPlaygroundStack/
