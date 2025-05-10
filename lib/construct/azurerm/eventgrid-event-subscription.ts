import { Construct } from 'constructs';
import { eventgridEventSubscription } from '@cdktf/provider-azurerm';

interface EventgridEventSubscriptionProps {
  name: string;
  scope: string;
  eventDeliverySchema: string;
  azureFunctionEndpoint?: eventgridEventSubscription.EventgridEventSubscriptionAzureFunctionEndpoint;
  storageQueueEndpoint?: eventgridEventSubscription.EventgridEventSubscriptionStorageQueueEndpoint;
}

export class EventgridEventSubscription extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: EventgridEventSubscriptionProps,
  ) {
    super(scope, id);

    // Resources
    new eventgridEventSubscription.EventgridEventSubscription(
      this,
      'eventgrid_event_subscription',
      {
        name: props.name,
        scope: props.scope,
        eventDeliverySchema: props.eventDeliverySchema,
        azureFunctionEndpoint: props.azureFunctionEndpoint,
        storageQueueEndpoint: props.storageQueueEndpoint,
      },
    );
  }
}
