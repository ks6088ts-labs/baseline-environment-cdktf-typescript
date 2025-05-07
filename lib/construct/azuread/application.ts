import { Construct } from 'constructs';
import { application } from '@cdktf/provider-azuread';

export interface ApplicationProps {
  name: string;
}

export class Application extends Construct {
  public readonly application: application.Application;
  constructor(scope: Construct, id: string, props: ApplicationProps) {
    super(scope, id);

    // Resources
    this.application = new application.Application(this, 'application', {
      displayName: props.name,
    });
  }
}
