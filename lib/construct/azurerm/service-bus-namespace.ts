import { Construct } from 'constructs';
import { servicebusNamespace } from '@cdktf/provider-azurerm';

interface ServiceBusNamespaceProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroupName: string;
  sku: string;
}

export class ServiceBusNamespace extends Construct {
  public readonly serviceBusNamespace: servicebusNamespace.ServicebusNamespace;
  constructor(scope: Construct, id: string, props: ServiceBusNamespaceProps) {
    super(scope, id);

    // Resources
    this.serviceBusNamespace = new servicebusNamespace.ServicebusNamespace(
      this,
      'azurerm_servicebus_namespace',
      {
        name: props.name,
        location: props.location,
        tags: props.tags,
        resourceGroupName: props.resourceGroupName,
        sku: props.sku,
      },
    );
  }
}
