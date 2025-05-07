import { Construct } from 'constructs';
import { servicePrincipal } from '@cdktf/provider-azuread';

export interface ServicePrincipalProps {
  clientId: string;
}

export class ServicePrincipal extends Construct {
  public readonly servicePrincipal: servicePrincipal.ServicePrincipal;
  constructor(scope: Construct, id: string, props: ServicePrincipalProps) {
    super(scope, id);

    // Resources
    this.servicePrincipal = new servicePrincipal.ServicePrincipal(
      this,
      'ServicePrincipal',
      {
        clientId: props.clientId,
      },
    );
  }
}
