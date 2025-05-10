import { Construct } from 'constructs';
import { eventhubNamespace } from '@cdktf/provider-azurerm';

interface EventhubNamespaceProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroupName: string;
  sku: string;
}

export class EventhubNamespace extends Construct {
  public readonly eventhubNamespace: eventhubNamespace.EventhubNamespace;
  constructor(scope: Construct, id: string, props: EventhubNamespaceProps) {
    super(scope, id);

    // Resources
    this.eventhubNamespace = new eventhubNamespace.EventhubNamespace(
      this,
      'eventhub_namespace',
      {
        name: props.name,
        location: props.location,
        tags: props.tags,
        resourceGroupName: props.resourceGroupName,
        sku: props.sku,
        identity: {
          type: 'SystemAssigned',
        },
      },
    );
  }
}
