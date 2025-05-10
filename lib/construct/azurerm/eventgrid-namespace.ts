import { Construct } from 'constructs';
import { eventgridNamespace } from '@cdktf/provider-azurerm';

interface EventgridNamespaceProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroupName: string;
  sku: string;
}

export class EventgridNamespace extends Construct {
  constructor(scope: Construct, id: string, props: EventgridNamespaceProps) {
    super(scope, id);

    // Resources
    new eventgridNamespace.EventgridNamespace(this, 'eventgrid_namespace', {
      name: props.name,
      location: props.location,
      tags: props.tags,
      resourceGroupName: props.resourceGroupName,
      sku: props.sku,
      identity: {
        type: 'SystemAssigned',
      },
    });
  }
}
