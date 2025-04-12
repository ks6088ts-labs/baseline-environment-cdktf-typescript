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

Add the following to `cdktf.json` to [parameter.ts](./parameter.ts) to use a remote backend. If not specified, the default backend is local.

```typescript
export const devPlaygroundStackProps: PlaygroundStackProps = {
  name: `Dev-PlaygroundStack-${getRandomIdentifier('Dev-PlaygroundStack')}`,
  location: 'swedencentral',
  tags: {
    owner: 'ks6088ts',
  },
+  backend: {
+    resourceGroupName: 'rg-your-backend',
+    storageAccountName: 'yourstorageaccount',
+    containerName: 'tfstate',
+    key: 'prod.terraform.tfstate',
+  },
  ...
};
```
