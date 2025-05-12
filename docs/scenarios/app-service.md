# Azure App Service

## Deploy Azure App Service from local

**Docs**

- [Getting started with Azure App Service](https://learn.microsoft.com/en-us/azure/app-service/getting-started?pivots=stack-python)
- [Deploy a Node.js web app in Azure](https://learn.microsoft.com/en-us/azure/app-service/quickstart-nodejs?tabs=windows&pivots=development-environment-cli)
- [Quickstart: Deploy a Python (Django, Flask, or FastAPI) web app to Azure App Service](https://learn.microsoft.com/en-us/azure/app-service/quickstart-python?tabs=fastapi%2Cwindows%2Cazure-cli%2Cvscode-deploy%2Cdeploy-instructions-azportal%2Cterminal-bash%2Cdeploy-instructions-zip-azcli)
- [az webapp deploy](https://learn.microsoft.com/cli/azure/webapp?view=azure-cli-latest#az-webapp-deploy)

**Codes**

- [Azure-Samples/msdocs-python-fastapi-webapp-quickstart](https://github.com/Azure-Samples/msdocs-python-fastapi-webapp-quickstart)
- [Azure App Service にファイルをデプロイする](https://learn.microsoft.com/ja-jp/azure/app-service/deploy-zip?tabs=cli)

```shell
# Clone the repository
git clone git@github.com:Azure-Samples/msdocs-python-fastapi-webapp-quickstart.git
cd msdocs-python-fastapi-webapp-quickstart

# Set up the environment
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Run the web app locally
uvicorn main:app --reload

# Create a zip file for deployment under the current directory
zip -r app.zip . -x ".venv/*" ".git/*" ".github/*" "app.zip" "infra/*" "*.pyc"

# Deploy to Azure
RESOURCE_GROUP_NAME=your-resource-group
APP_SERVICE_NAME=your-app-service-name
ZIP_FILE_PATH=app.zip

az webapp deploy \
    --resource-group $RESOURCE_GROUP_NAME \
    --name $APP_SERVICE_NAME \
    --src-path $ZIP_FILE_PATH
```
