import { Construct } from 'constructs';
import { serviceAccount } from '@cdktf/provider-google';

export interface serviceAccountProps {
  name: string;
}

export class ServiceAccount extends Construct {
  public readonly serviceAccount: serviceAccount.ServiceAccount;
  constructor(scope: Construct, id: string, props: serviceAccountProps) {
    super(scope, id);

    // Resources
    this.serviceAccount = new serviceAccount.ServiceAccount(
      this,
      'service_account',
      {
        accountId: props.name,
        displayName: props.name,
      },
    );
  }
}
