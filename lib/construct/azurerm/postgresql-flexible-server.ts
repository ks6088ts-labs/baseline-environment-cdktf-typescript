import { Construct } from 'constructs';
import { postgresqlFlexibleServer } from '@cdktf/provider-azurerm';

export interface PostgresqlFlexibleServerProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroupName: string;
  skuName: string;
  administratorLogin: string;
  administratorPassword: string;
  version: string;
}

export class PostgresqlFlexibleServer extends Construct {
  public readonly postgresqlFlexibleServer: postgresqlFlexibleServer.PostgresqlFlexibleServer;
  constructor(
    scope: Construct,
    id: string,
    props: PostgresqlFlexibleServerProps,
  ) {
    super(scope, id);

    // Resources

    // PostgreSQL Flexible Server: https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/postgresql_flexible_server
    this.postgresqlFlexibleServer =
      new postgresqlFlexibleServer.PostgresqlFlexibleServer(
        this,
        'postgresql_flexible_server',
        {
          name: props.name,
          location: props.location,
          tags: props.tags,
          resourceGroupName: props.resourceGroupName,
          skuName: props.skuName,
          administratorLogin: props.administratorLogin,
          administratorPassword: props.administratorPassword,
          authentication: {
            activeDirectoryAuthEnabled: true,
            passwordAuthEnabled: true,
          },
          version: props.version,
          zone: '2',
        },
      );
  }
}
