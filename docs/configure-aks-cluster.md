# Configure AKS Cluster

```shell
# Retrieve outputs
make output STACKS=Dev-PlaygroundStack TF_BACKEND=azurerm
#   Dev-PlaygroundStack
#   aks_cluster_name = k8s-Dev-PlaygroundStack-rwk5
#   resource_group_name = rg-Dev-PlaygroundStack-rwk5

RESOURCE_GROUP_NAME=rg-Dev-PlaygroundStack-rwk5
AKS_CLUSTER_NAME=k8s-Dev-PlaygroundStack-rwk5

az aks get-credentials \
  --resource-group $RESOURCE_GROUP_NAME \
  --name $AKS_CLUSTER_NAME \
  --verbose

kubectl get nodes
```
