import { Construct } from 'constructs';
import {
  cosmosdbAccount,
  cosmosdbSqlDatabase,
  cosmosdbSqlContainer,
} from '@cdktf/provider-azurerm';

export interface CosmosdbProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroupName: string;
  partitionKeyPaths: string[];
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

    const cosmosdbSqlDatabaseResource =
      new cosmosdbSqlDatabase.CosmosdbSqlDatabase(this, 'cosmosdbSqlDatabase', {
        name: `${props.name}sqldb`,
        resourceGroupName: props.resourceGroupName,
        accountName: this.cosmosdbAccount.name,
      });

    new cosmosdbSqlContainer.CosmosdbSqlContainer(
      this,
      'cosmosdbSqlContainer',
      {
        name: `${props.name}sqlcontainer`,
        resourceGroupName: props.resourceGroupName,
        accountName: this.cosmosdbAccount.name,
        databaseName: cosmosdbSqlDatabaseResource.name,
        partitionKeyPaths: props.partitionKeyPaths,
      },
    );
  }
}
