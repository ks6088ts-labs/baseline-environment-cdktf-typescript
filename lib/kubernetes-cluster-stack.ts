import { Construct } from 'constructs';
import { TerraformStack } from 'cdktf';
import { provider, kubernetesCluster } from '@cdktf/provider-azurerm';

export interface KubernetesClusterStackProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroupName: string;
  nodeCount: number;
  vmSize: string;
}

export class KubernetesClusterStack extends TerraformStack {
  constructor(
    scope: Construct,
    id: string,
    props: KubernetesClusterStackProps,
  ) {
    super(scope, id);

    // Providers
    new provider.AzurermProvider(this, 'azurerm', {
      features: [{}],
    });

    // Resources
    new kubernetesCluster.KubernetesCluster(this, 'kubernetes_cluster', {
      name: props.name,
      location: props.location,
      tags: props.tags,
      resourceGroupName: props.resourceGroupName,
      dnsPrefix: props.name,
      defaultNodePool: {
        name: 'default',
        nodeCount: props.nodeCount,
        vmSize: props.vmSize,
      },
      identity: {
        type: 'SystemAssigned',
      },
      networkProfile: {
        networkPlugin: 'azure',
      },
    });
  }
}
