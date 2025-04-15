[![test](https://github.com/ks6088ts-labs/baseline-environment-on-azure-cdktf-typescript/actions/workflows/test.yaml/badge.svg?branch=main)](https://github.com/ks6088ts-labs/baseline-environment-on-azure-cdktf-typescript/actions/workflows/test.yaml?query=branch%3Amain)

# baseline-environment-on-azure-cdktf-typescript

Baseline Environment on Azure in CDK for Terraform in TypeScript

## Prerequisites

- [Terraform](https://developer.hashicorp.com/terraform/install)
- [CDK for Terraform](https://developer.hashicorp.com/terraform/cdktf)
- [Node.js](https://nodejs.org/en/download/)
- [pnpm](https://pnpm.io/installation)
- [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli)
- [Azure Subscription](https://azure.microsoft.com/en-us)

## How to use

```shell
# Set the Azure subscription ID
export ARM_SUBSCRIPTION_ID=$(az account show --query id --output tsv)

# Perform a diff to see what will be deployed
cdktf diff Dev-BackendStack

# Deploy the stack
cdktf deploy --auto-approve Dev-BackendStack

# Destroy the stack
cdktf destroy --auto-approve Dev-BackendStack
```

## Tips

### Use remote backend

To use a remote backend, you need to set up a storage account and a container in Azure. You can do this using the Azure CLI or the Azure portal.

```shell
RESOURCE_GROUP_NAME=rg-tfstate
STORAGE_ACCOUNT_NAME=ks6088tstfstate
CONTAINER_NAME=dev
LOCATION=japaneast

# Login to Azure
az login

# Set the subscription
az account set --subscription <your-subscription-id>

# Create a resource group
az group create \
    --name $RESOURCE_GROUP_NAME \
    --location $LOCATION

# Create a storage account
az storage account create \
    --name $STORAGE_ACCOUNT_NAME \
    --resource-group $RESOURCE_GROUP_NAME \
    --location $LOCATION \
    --sku Standard_LRS

# Create a container
az storage container create \
    --name $CONTAINER_NAME \
    --account-name $STORAGE_ACCOUNT_NAME
```

Then, you can set the backend configuration in the [lib/utils.ts](./lib/utils.ts) file.

```typescript
export function createBackend(stack: TerraformStack, key: string) {
  const useRemoteBackend = false; // When set to true, it will use the remote backend

  if (useRemoteBackend) {
    new AzurermBackend(stack, {
      resourceGroupName: 'rg-tfstate',
      storageAccountName: 'ks6088tstfstate',
      containerName: 'dev',
      key: `${key}.tfstate`,
    });
  }
}
```
