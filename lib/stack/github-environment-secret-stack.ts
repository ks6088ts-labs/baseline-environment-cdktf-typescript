import { Construct } from 'constructs';
import { TerraformStack } from 'cdktf';
import { provider } from '@cdktf/provider-github';
import { Repository } from '../construct/github/repository';
import { RepositoryEnvironment } from '../construct/github/repositoryEnvironment';
import { ActionsEnvironmentSecret } from '../construct/github/actionsEnvironmentSecret';
import { createBackend } from '../utils';

export interface GithubEnvironmentSecretStackProps {
  createRepository: boolean;
  repositoryName: string;
  visibility?: string;
  environment: string;
  organization: string;
  secrets?: { [key: string]: string };
}

export class GithubEnvironmentSecretStack extends TerraformStack {
  constructor(
    scope: Construct,
    id: string,
    props: GithubEnvironmentSecretStackProps,
  ) {
    super(scope, id);

    // Backend
    createBackend(this, id);

    // Providers
    new provider.GithubProvider(this, 'Github', {
      owner: props.organization,
    });

    // Resources
    if (props.createRepository) {
      new Repository(this, 'Repository', {
        name: props.repositoryName,
        visibility: props.visibility,
      });
    }

    new RepositoryEnvironment(this, 'RepositoryEnvironment', {
      environment: props.environment,
      repository: props.repositoryName,
    });

    new ActionsEnvironmentSecret(this, 'ActionsEnvironmentSecret', {
      environment: props.environment,
      repository: props.repositoryName,
      secrets: props.secrets,
    });
  }
}
