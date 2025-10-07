# Azure

## Deployment

```shell
# Login to Azure
az login

# Set your subscription ID
export ARM_SUBSCRIPTION_ID=$(az account show --query id --output tsv)

# Set backend (azurerm or local)
TF_BACKEND=azurerm

# Set stacks to deploy (To see available stacks, run `make list`)
STACKS="Azapi-Ai-Foundry-Stack Azurerm-App-Stack Azurerm-Data-Stack Azurerm-Network-Stack Azurerm-Security-Stack"

# Deploy resources
make deploy \
    TF_BACKEND=$TF_BACKEND \
    STACKS=$STACKS

# Destroy resources
make destroy \
    TF_BACKEND=$TF_BACKEND \
    STACKS=$STACKS
```

## References

- [Use Terraform to create Azure AI Foundry resource](https://learn.microsoft.com/en-us/azure/ai-foundry/how-to/create-resource-terraform)
- [Model summary table and region availability](https://learn.microsoft.com/en-us/azure/ai-foundry/foundry-models/concepts/models-sold-directly-by-azure?pivots=azure-openai&tabs=global-standard-aoai%2Cstandard-chat-completions%2Cglobal-standard#model-summary-table-and-region-availability)
