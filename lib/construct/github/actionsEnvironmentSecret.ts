import { Construct } from 'constructs';
import { actionsEnvironmentSecret } from '@cdktf/provider-github';

export interface ActionsEnvironmentSecretProps {
  environment: string;
  repository: string;
  secrets?: { [key: string]: string };
}

export class ActionsEnvironmentSecret extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: ActionsEnvironmentSecretProps,
  ) {
    super(scope, id);

    // Resources
    for (const [key, value] of Object.entries(props.secrets || {})) {
      new actionsEnvironmentSecret.ActionsEnvironmentSecret(
        this,
        `ActionsEnvironmentSecret-${key}`,
        {
          environment: props.environment,
          repository: props.repository,
          secretName: key,
          plaintextValue: value,
        },
      );
    }
  }
}
