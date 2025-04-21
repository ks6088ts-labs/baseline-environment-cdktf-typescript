import { Construct } from 'constructs';
import { virtualNetwork } from '@cdktf/provider-azurerm';

interface VirtualNetworkProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroupName: string;
  addressSpace: string[];
}

export class VirtualNetwork extends Construct {
  constructor(scope: Construct, id: string, props: VirtualNetworkProps) {
    super(scope, id);

    // Resources
    new virtualNetwork.VirtualNetwork(this, 'virtual_network', {
      name: props.name,
      location: props.location,
      resourceGroupName: props.resourceGroupName,
      tags: props.tags,
      addressSpace: props.addressSpace,
    });
  }
}
