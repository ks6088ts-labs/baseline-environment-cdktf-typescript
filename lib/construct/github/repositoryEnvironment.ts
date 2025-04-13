import { Construct } from 'constructs';
import { repositoryEnvironment } from '@cdktf/provider-github';

export interface RepositoryEnvironmentProps {
  environment: string;
  repository: string;
}

export class RepositoryEnvironment extends Construct {
  public readonly repositoryEnvironment: repositoryEnvironment.RepositoryEnvironment;

  constructor(scope: Construct, id: string, props: RepositoryEnvironmentProps) {
    super(scope, id);

    // Resources
    this.repositoryEnvironment =
      new repositoryEnvironment.RepositoryEnvironment(
        this,
        'RepositoryEnvironment',
        {
          environment: props.environment,
          repository: props.repository,
          preventSelfReview: true,
          deploymentBranchPolicy: {
            protectedBranches: true,
            customBranchPolicies: false,
          },
        },
      );
  }
}
