import { Construct } from 'constructs';
import { kubernetesCluster } from '@cdktf/provider-azurerm';

export interface KubernetesClusterProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroupName: string;
  nodeCount: number;
  vmSize: string;
}

export class KubernetesCluster extends Construct {
  readonly kubernetesCluster: kubernetesCluster.KubernetesCluster;
  constructor(scope: Construct, id: string, props: KubernetesClusterProps) {
    super(scope, id);

    // Resources
    this.kubernetesCluster = new kubernetesCluster.KubernetesCluster(
      this,
      'kubernetes_cluster',
      {
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
      },
    );
  }
}
