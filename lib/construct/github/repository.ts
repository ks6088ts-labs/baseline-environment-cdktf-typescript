import { Construct } from 'constructs';
import { repository } from '@cdktf/provider-github';

export interface RepositoryProps {
  name: string;
  visibility?: string;
}

export class Repository extends Construct {
  public readonly repository: repository.Repository;
  constructor(scope: Construct, id: string, props: RepositoryProps) {
    super(scope, id);

    // Resources
    this.repository = new repository.Repository(this, 'repository', {
      name: props.name,
      visibility: props.visibility || 'private',
    });
  }
}
