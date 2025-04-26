# User assigned managed identity

## Connect to VM with Bastion

From Azure Portal, go to VM on Prod-PlaygroundStack and connect via Bastion with user name `azureuser` and password `P@ssw0rd1234`. (see [virtual-machine.ts](../lib/construct/azurerm/virtual-machine.ts))

## Call Azure OpenAI API from virtual machine with user-assigned managed identity

To set up Python runtime on a virtual machine, run the following commands in the terminal.

```shell
sudo apt update
sudo apt install -y python3-pip python3-venv net-tools

# (Optional) Install the Azure CLI: https://learn.microsoft.com/en-us/cli/azure/install-azure-cli-linux?pivots=apt
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# (Optional) Print the private IP address of the VM
ifconfig

# (Optional) Get the private IP address of the Azure OpenAI resource
nslookup ai-services-prod-playgroundstack-pw9gp-0.openai.azure.com

# Set up a Python virtual environment
python3 -m venv .venv
source .venv/bin/activate
pip install openai azure-identity
```

To configure DefaultAzureCredential to authenticate a user-assigned managed identity, you can set the `AZURE_CLIENT_ID` environment variable to the client ID of the user-assigned managed identity.

Or you can specify a user-assigned managed identity with DefaultAzureCredential by using the `managed_identity_client_id` keyword argument like `DefaultAzureCredential(managed_identity_client_id=client_id)`.

For more information, see the following links:

- [Specify a user-assigned managed identity with DefaultAzureCredential](https://learn.microsoft.com/en-us/python/api/overview/azure/identity-readme?view=azure-python#specify-a-user-assigned-managed-identity-with-defaultazurecredential)
- [How to configure Azure OpenAI Service with Microsoft Entra ID authentication](https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/managed-identity)
- [ユーザー割り当てマネージドIDが設定されたApp ServiceでDefaultAzureCredentialを使用する際の注意](https://zenn.dev/headwaters/articles/62ce9887a37b68)

```shell
# Set the environment variable for the Azure OpenAI resource
export AZURE_OPENAI_ENDPOINT="https://ai-services-prod-playgroundstack-pw9gp-0.openai.azure.com/"
export AZURE_CLIENT_ID="40ef8b37-85e4-45ae-a1a7-54ee36fe30e4"

# Start the Python interpreter
python3
```

```python
from azure.identity import DefaultAzureCredential, get_bearer_token_provider
from openai import AzureOpenAI
from os import getenv

# Case1. Set the `AZURE_CLIENT_ID` environment variable to the client ID of the user-assigned managed identity
credential = DefaultAzureCredential()

# Case2. Specify a user-assigned managed identity with DefaultAzureCredential
# Does not work so far
credential = DefaultAzureCredential(managed_identity_client_id="40ef8b37-85e4-45ae-a1a7-54ee36fe30e4")

token_provider = get_bearer_token_provider(
    credential, "https://cognitiveservices.azure.com/.default"
)

client = AzureOpenAI(
    api_version="2024-02-15-preview",
    azure_endpoint=getenv("AZURE_OPENAI_ENDPOINT"),
    azure_ad_token_provider=token_provider
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "user", "content": "Hello"},
    ]
)

print(response.choices[0].message.content)
```
