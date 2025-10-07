# Configure OIDC

## Deployment

### Azure

```shell
# Login to Azure
az login

# Set your subscription ID
export ARM_SUBSCRIPTION_ID=$(az account show --query id --output tsv)

# Deploy resources
make deploy \
    TF_BACKEND=azurerm \
    STACKS="Dev-ServicePrincipalStack Dev-GithubEnvironmentSecretStack-Azure"
```

### AWS

```shell
make deploy \
    TF_BACKEND=azurerm \
    STACKS="Dev-AwsPlaygroundStack Dev-GithubEnvironmentSecretStack-Aws"
```

### Google

```shell
make deploy \
    TF_BACKEND=azurerm \
    STACKS="Dev-GooglePlaygroundStack Dev-GithubEnvironmentSecretStack-Google"
```

## Tips

To check drift, run the following command:

```shell
STACKS=Dev-GithubEnvironmentSecretStack-Azure

make diff STACKS=$STACKS TF_BACKEND=azurerm
```
