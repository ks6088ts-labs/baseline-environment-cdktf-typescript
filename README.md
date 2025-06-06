[![test](https://github.com/ks6088ts-labs/baseline-environment-cdktf-typescript/actions/workflows/test.yaml/badge.svg?branch=main)](https://github.com/ks6088ts-labs/baseline-environment-cdktf-typescript/actions/workflows/test.yaml?query=branch%3Amain)
[![release](https://github.com/ks6088ts-labs/baseline-environment-cdktf-typescript/actions/workflows/release.yaml/badge.svg)](https://github.com/ks6088ts-labs/baseline-environment-cdktf-typescript/actions/workflows/release.yaml)

# baseline-environment-cdktf-typescript

Baseline Environment in CDK for Terraform using TypeScript

## Prerequisites

- [Terraform](https://developer.hashicorp.com/terraform/install)
- [CDK for Terraform](https://developer.hashicorp.com/terraform/cdktf)
- [Node.js](https://nodejs.org/en/download/)
- [pnpm](https://pnpm.io/installation)
- [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli)
- [Azure Subscription](https://azure.microsoft.com/en-us)

## How to use

```shell
STACKS="Azurerm-Ai-Stack Azurerm-App-Stack Azurerm-Data-Stack Azurerm-Iot-Stack Azurerm-Monitoring-Stack Azurerm-Security-Stack"

# Set the Azure subscription ID
export ARM_SUBSCRIPTION_ID=$(az account show --query id --output tsv)

# Perform a diff to see what will be deployed
cdktf diff Azurerm-Ai-Stack

# Deploy the stack
cdktf deploy --auto-approve Azurerm-Ai-Stack

# Destroy the stack
cdktf destroy --auto-approve Azurerm-Ai-Stack
```

## Tips

### Use remote backend

To use a remote backend, you need to set up a storage account and a container in Azure.
Then, you can select the backend configurations by setting the `TF_BACKEND` environment variable such as `azurerm` or `local`. The actual implementation of the backend is in the [lib/utils.ts](./lib/utils.ts) file.

For example, to use the remote backend, you can run the following command:

```shell
# Deploy all the stacks with remote backend
make deploy TF_BACKEND=azurerm
```
