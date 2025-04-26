import { Construct } from 'constructs';
import { iothub } from '@cdktf/provider-azurerm';

export interface iothubProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroupName: string;
  skuName: string;
  capacity: number;
}

export class Iothub extends Construct {
  public readonly iothub: iothub.Iothub;

  constructor(scope: Construct, id: string, props: iothubProps) {
    super(scope, id);

    // Resources
    this.iothub = new iothub.Iothub(this, 'iothub', {
      name: props.name,
      location: props.location,
      tags: props.tags,
      resourceGroupName: props.resourceGroupName,
      sku: {
        name: props.skuName,
        capacity: props.capacity,
      },
      identity: {
        type: 'SystemAssigned',
      },
    });
  }
}
