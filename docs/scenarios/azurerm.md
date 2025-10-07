# Deploy resources via azurerm

```shell
# Login to Azure
az login

# Set your subscription ID
export ARM_SUBSCRIPTION_ID=$(az account show --query id --output tsv)

# Deploy resources
STACKS="Azurerm-App-Stack"
make deploy \
    TF_BACKEND=azurerm \
    STACKS=$STACKS
```
