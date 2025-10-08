# Configure AKS Cluster

```shell
# Retrieve outputs
make output STACKS=Azurerm-App-Stack TF_BACKEND=azurerm

RESOURCE_GROUP_NAME=rg-AzurermAppStack-xxxx
AKS_CLUSTER_NAME=k8szurermpptackxxxx

az aks get-credentials \
  --resource-group $RESOURCE_GROUP_NAME \
  --name $AKS_CLUSTER_NAME \
  --verbose

kubectl get nodes
```
