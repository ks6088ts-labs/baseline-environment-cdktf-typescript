import { Construct } from 'constructs';
import { servicebusQueue } from '@cdktf/provider-azurerm';

interface ServiceBusQueueProps {
  name: string;
  namespaceId: string;
}

export class ServiceBusQueue extends Construct {
  constructor(scope: Construct, id: string, props: ServiceBusQueueProps) {
    super(scope, id);

    // Resources
    new servicebusQueue.ServicebusQueue(this, 'azurerm_servicebus_queue', {
      name: props.name,
      namespaceId: props.namespaceId,
      partitioningEnabled: true,
    });
  }
}
