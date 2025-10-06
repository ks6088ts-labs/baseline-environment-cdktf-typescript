# Azure AI Foundry Stack

```shell
# Login to Azure
az login

# Set your subscription ID
export ARM_SUBSCRIPTION_ID=$(az account show --query id --output tsv)

# Deploy resources
TF_BACKEND=azurerm STACKS="Azapi-Ai-Foundry-Stack" make deploy

# Destroy resources
TF_BACKEND=azurerm STACKS="Azapi-Ai-Foundry-Stack" make destroy
```

## References

- [Use Terraform to create Azure AI Foundry resource](https://learn.microsoft.com/en-us/azure/ai-foundry/how-to/create-resource-terraform)
