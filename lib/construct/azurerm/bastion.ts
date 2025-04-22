import { Construct } from 'constructs';
import { publicIp, bastionHost } from '@cdktf/provider-azurerm';

interface BastionHostProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroupName: string;
  subnetId: string;
}

export class BastionHost extends Construct {
  constructor(scope: Construct, id: string, props: BastionHostProps) {
    super(scope, id);

    // Resources
    const publicIpAddress = new publicIp.PublicIp(this, 'public_ip', {
      name: `${props.name}-public-ip`,
      location: props.location,
      tags: props.tags,
      resourceGroupName: props.resourceGroupName,
      allocationMethod: 'Static',
      sku: 'Standard',
    });

    new bastionHost.BastionHost(this, 'bastion_host', {
      name: props.name,
      location: props.location,
      tags: props.tags,
      resourceGroupName: props.resourceGroupName,
      ipConfiguration: {
        name: `${props.name}-ip-config`,
        subnetId: props.subnetId,
        publicIpAddressId: publicIpAddress.id,
      },
    });
  }
}
