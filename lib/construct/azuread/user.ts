import { Construct } from 'constructs';
import { user, dataAzureadDomains } from '@cdktf/provider-azuread';

export interface UserProps {
  name: string;
}

export class User extends Construct {
  public readonly user: user.User;
  constructor(scope: Construct, id: string, props: UserProps) {
    super(scope, id);

    // Datasources
    const domains = new dataAzureadDomains.DataAzureadDomains(this, 'domains', {
      onlyInitial: true,
    });

    // Resources
    this.user = new user.User(this, 'user', {
      displayName: props.name,
      userPrincipalName: `${props.name}@${domains.domains.get(0).domainName}`,
      password: 'P@ssw0rd!',
      forcePasswordChange: true,
    });
  }
}
