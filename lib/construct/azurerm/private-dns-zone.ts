import { Construct } from 'constructs';
import {
  privateDnsZone,
  privateDnsZoneVirtualNetworkLink,
} from '@cdktf/provider-azurerm';

interface PrivateDnsZoneProps {
  name: string;
  tags?: { [key: string]: string };
  resourceGroupName: string;
  virtualNetworkId: string;
}

export class PrivateDnsZone extends Construct {
  public readonly privateDnsZone: privateDnsZone.PrivateDnsZone;
  constructor(scope: Construct, id: string, props: PrivateDnsZoneProps) {
    super(scope, id);

    // Resources
    this.privateDnsZone = new privateDnsZone.PrivateDnsZone(
      this,
      'private_dns_zone',
      {
        name: props.name,
        resourceGroupName: props.resourceGroupName,
        tags: props.tags,
      },
    );

    new privateDnsZoneVirtualNetworkLink.PrivateDnsZoneVirtualNetworkLink(
      this,
      'private_dns_zone_virtual_network_link',
      {
        name: `${props.name}-link`,
        resourceGroupName: props.resourceGroupName,
        privateDnsZoneName: this.privateDnsZone.name,
        virtualNetworkId: props.virtualNetworkId,
      },
    );
  }
}
