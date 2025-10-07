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
- [Model summary table and region availability](https://learn.microsoft.com/en-us/azure/ai-foundry/foundry-models/concepts/models-sold-directly-by-azure?pivots=azure-openai&tabs=global-standard-aoai%2Cstandard-chat-completions%2Cglobal-standard#model-summary-table-and-region-availability)
