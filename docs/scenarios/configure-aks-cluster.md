# Configure AKS Cluster

```shell
# Retrieve outputs
make output STACKS=Dev-AzurermPlaygroundStack TF_BACKEND=azurerm
#   Dev-AzurermPlaygroundStack
#   aks_cluster_name = k8s-Dev-AzurermPlaygroundStack-rwk5
#   resource_group_name = rg-Dev-AzurermPlaygroundStack-rwk5

RESOURCE_GROUP_NAME=rg-Dev-AzurermPlaygroundStack-rwk5
AKS_CLUSTER_NAME=k8s-Dev-AzurermPlaygroundStack-rwk5

az aks get-credentials \
  --resource-group $RESOURCE_GROUP_NAME \
  --name $AKS_CLUSTER_NAME \
  --verbose

kubectl get nodes
```
