import { Construct } from 'constructs';
import { TerraformStack, TerraformOutput } from 'cdktf';
import { provider } from '@cdktf/provider-azurerm';
import { getRandomIdentifier, createBackend } from '../utils';
import { ResourceGroup } from '../construct/azurerm/resource-group';
import { Iothub } from '../construct/azurerm/iothub';
import { EventgridNamespace } from '../construct/azurerm/eventgrid-namespace';
import { EventgridDomain } from '../construct/azurerm/eventgrid-domain';
import { EventgridDomainTopic } from '../construct/azurerm/eventgrid-domain-topic';
import { EventgridTopic } from '../construct/azurerm/eventgrid-topic';
import { EventgridEventSubscription } from '../construct/azurerm/eventgrid-event-subscription';
import { EventhubNamespace } from '../construct/azurerm/eventhub-namespace';
import { Eventhub } from '../construct/azurerm/eventhub';
import { StorageAccount } from '../construct/azurerm/storage-account';

export interface AzurermIotStackProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroup: {};
  iothub?: {
    location: string;
    skuName: string;
    capacity: number;
  };
  eventgridNamespace?: {};
  eventgridDomain?: {
    inputSchema: string;
  };
  eventgridDomainTopic?: {};
  eventgridEventSubscription?: {
    eventDeliverySchema: string;
  };
  eventgridTopic?: {
    inputSchema: string;
  };
  eventhubNamespace?: {
    sku: string;
  };
  eventhub?: {
    messageRetention: number;
    partitionCount: number;
  };
}

export const azurermIotStackProps: AzurermIotStackProps = {
  name: `AzurermIotStack-${getRandomIdentifier('AzurermIotStack')}`,
  location: 'japaneast',
  tags: {
    owner: 'ks6088ts',
    SecurityControl: 'Ignore',
    CostControl: 'Ignore',
  },
  resourceGroup: {},
  iothub: {
    location: 'japaneast',
    skuName: 'S1',
    capacity: 1,
  },
  eventgridNamespace: {},
  eventgridDomain: {
    inputSchema: 'CloudEventSchemaV1_0',
  },
  eventgridDomainTopic: {},
  eventgridEventSubscription: {
    eventDeliverySchema: 'CloudEventSchemaV1_0',
  },
  eventgridTopic: {
    inputSchema: 'EventGridSchema',
  },
  eventhubNamespace: {
    sku: 'Standard',
  },
  eventhub: {
    messageRetention: 1,
    partitionCount: 2,
  },
};

export class AzurermIotStack extends TerraformStack {
  constructor(
    scope: Construct,
    id: string,
    props: AzurermIotStackProps,
    storageAccount?: StorageAccount,
  ) {
    super(scope, id);

    // Backend
    createBackend(this, id);

    // Providers
    new provider.AzurermProvider(this, 'azurerm', {
      features: [
        {
          resourceGroup: [
            {
              preventDeletionIfContainsResources: false,
            },
          ],
        },
      ],
    });

    // Resources
    const resourceGroup = new ResourceGroup(this, `ResourceGroup`, {
      name: `rg-${props.name}`,
      location: props.location,
      tags: props.tags,
    });
    new TerraformOutput(this, 'resource_group_name', {
      value: resourceGroup.resourceGroup.name,
    });

    if (props.iothub) {
      new Iothub(this, `Iothub`, {
        name: `iothub-${props.name}`,
        location: props.iothub.location,
        tags: props.tags,
        resourceGroupName: resourceGroup.resourceGroup.name,
        skuName: props.iothub.skuName,
        capacity: props.iothub.capacity,
      });
    }

    if (props.eventgridNamespace) {
      new EventgridNamespace(this, `EventgridNamespace`, {
        name: `eg-${props.name}`,
        location: props.location,
        tags: props.tags,
        resourceGroupName: resourceGroup.resourceGroup.name,
        sku: 'Standard',
      });
    }

    if (props.eventgridDomain) {
      const eventgridDomain = new EventgridDomain(this, `EventgridDomain`, {
        name: `eg-domain-${props.name}`,
        location: props.location,
        tags: props.tags,
        resourceGroupName: resourceGroup.resourceGroup.name,
        inputSchema: props.eventgridDomain.inputSchema,
      });

      if (props.eventgridDomainTopic) {
        const eventgridDomainTopic = new EventgridDomainTopic(
          this,
          `EventgridDomainTopic`,
          {
            name: `eg-domain-topic-${props.name}`,
            domainName: eventgridDomain.eventgridDomain.name,
            resourceGroupName: resourceGroup.resourceGroup.name,
          },
        );
        if (props.eventgridEventSubscription && storageAccount) {
          new EventgridEventSubscription(this, `EventgridEventSubscription`, {
            name: `eg-domain-topic-subscription-${props.name}`,
            scope: eventgridDomainTopic.eventgridDomainTopic.id,
            eventDeliverySchema:
              props.eventgridEventSubscription.eventDeliverySchema,
            storageQueueEndpoint: {
              queueName: storageAccount.storageQueue.name,
              storageAccountId: storageAccount.storageAccount.id,
            },
          });
        }
      }
    }

    if (props.eventgridTopic) {
      new EventgridTopic(this, `EventgridTopic`, {
        name: `eg-topic-${props.name}`,
        location: props.location,
        tags: props.tags,
        resourceGroupName: resourceGroup.resourceGroup.name,
        inputSchema: props.eventgridTopic.inputSchema,
      });
    }

    if (props.eventhubNamespace) {
      const eventhubNamespace = new EventhubNamespace(
        this,
        `EventhubNamespace`,
        {
          name: `ehn-${props.name}`,
          location: props.location,
          tags: props.tags,
          resourceGroupName: resourceGroup.resourceGroup.name,
          sku: props.eventhubNamespace.sku,
        },
      );

      if (props.eventhub) {
        new Eventhub(this, `Eventhub`, {
          name: `eh-${props.name}`,
          namespaceId: eventhubNamespace.eventhubNamespace.id,
          messageRetention: props.eventhub.messageRetention,
          partitionCount: props.eventhub.partitionCount,
        });
      }
    }
  }
}
