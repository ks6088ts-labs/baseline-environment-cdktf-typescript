import { Construct } from 'constructs';
import { cosmosdbAccount } from '@cdktf/provider-azurerm';

export interface CosmosdbProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroupName: string;
}

export class Cosmosdb extends Construct {
  public readonly cosmosdbAccount: cosmosdbAccount.CosmosdbAccount;

  constructor(scope: Construct, id: string, props: CosmosdbProps) {
    super(scope, id);

    // Resources
    this.cosmosdbAccount = new cosmosdbAccount.CosmosdbAccount(
      this,
      'cosmosdbAccount',
      {
        name: props.name,
        location: props.location,
        tags: props.tags,
        resourceGroupName: props.resourceGroupName,
        offerType: 'Standard',
        kind: 'GlobalDocumentDB',
        consistencyPolicy: {
          consistencyLevel: 'BoundedStaleness',
        },
        geoLocation: [
          {
            location: props.location,
            failoverPriority: 0,
          },
        ],
        capabilities: [
          {
            name: 'EnableNoSQLVectorSearch',
          },
          {
            name: 'EnableServerless',
          },
        ],
      },
    );
  }
}
