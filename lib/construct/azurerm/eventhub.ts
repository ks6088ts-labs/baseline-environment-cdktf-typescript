import { Construct } from 'constructs';
import { eventhub } from '@cdktf/provider-azurerm';

interface EventhubProps {
  name: string;
  namespaceId: string;
  messageRetention: number;
  partitionCount: number;
}

export class Eventhub extends Construct {
  public readonly Eventhub: eventhub.Eventhub;
  constructor(scope: Construct, id: string, props: EventhubProps) {
    super(scope, id);

    // Resources
    this.Eventhub = new eventhub.Eventhub(this, 'eventhub_namespace', {
      name: props.name,
      namespaceId: props.namespaceId,
      messageRetention: props.messageRetention,
      partitionCount: props.partitionCount,
    });
  }
}
