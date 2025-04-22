import { Construct } from 'constructs';
import { privateEndpoint } from '@cdktf/provider-azurerm';

interface PrivateEndpointProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroupName: string;
  subnetId: string;
  privateConnectionResourceId: string;
  subresourceNames: string[];
  requestMessage?: string;
  privateDnsZoneIds: string[];
}

export class PrivateEndpoint extends Construct {
  constructor(scope: Construct, id: string, props: PrivateEndpointProps) {
    super(scope, id);

    // Resources
    new privateEndpoint.PrivateEndpoint(this, 'private_endpoint', {
      name: props.name,
      location: props.location,
      tags: props.tags,
      resourceGroupName: props.resourceGroupName,
      subnetId: props.subnetId,
      privateServiceConnection: {
        name: `${props.name}-connection`,
        privateConnectionResourceId: props.privateConnectionResourceId,
        isManualConnection: false,
        subresourceNames: props.subresourceNames,
        requestMessage: props.requestMessage,
      },
      privateDnsZoneGroup: {
        name: `${props.name}-dns-zone-group`,
        privateDnsZoneIds: props.privateDnsZoneIds,
      },
    });
  }
}
