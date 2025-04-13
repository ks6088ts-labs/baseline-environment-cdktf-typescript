import { Construct } from 'constructs';
import { TerraformStack } from 'cdktf';
import { provider } from '@cdktf/provider-github';
import { Repository } from '../construct/github/repository';
import { RepositoryEnvironment } from '../construct/github/repositoryEnvironment';
import { getRandomIdentifier } from '../utils';

export interface GithubStackProps {
  repositoryName: string;
  visibility?: string;
  environment: string;
}

export const devGithubStackProps: GithubStackProps = {
  repositoryName: `Dev-GithubStack-${getRandomIdentifier('Dev-GithubStack')}`,
  visibility: 'public',
  environment: 'ci',
};

export const prodGithubStackProps: GithubStackProps = {
  repositoryName: `Prod-GithubStack-${getRandomIdentifier('Prod-GithubStack')}`,
  environment: 'ci',
};

export class GithubStack extends TerraformStack {
  constructor(scope: Construct, id: string, props: GithubStackProps) {
    super(scope, id);

    // Providers
    new provider.GithubProvider(this, 'Github', {});

    // Resources
    new Repository(this, 'Repository', {
      name: props.repositoryName,
      visibility: props.visibility,
    });

    new RepositoryEnvironment(this, 'RepositoryEnvironment', {
      environment: props.environment,
      repository: props.repositoryName,
    });
  }
}
