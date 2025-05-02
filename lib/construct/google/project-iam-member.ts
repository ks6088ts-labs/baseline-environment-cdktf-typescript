import { Construct } from 'constructs';
import { projectIamMember } from '@cdktf/provider-google';

export interface projectIamMemberProps {
  role: string;
  project: string;
  member: string;
}

export class ProjectIamMember extends Construct {
  public readonly projectIamMember: projectIamMember.ProjectIamMember;
  constructor(scope: Construct, id: string, props: projectIamMemberProps) {
    super(scope, id);

    // Resources
    this.projectIamMember = new projectIamMember.ProjectIamMember(
      this,
      'project_iam_member',
      {
        role: props.role,
        project: props.project,
        member: props.member,
      },
    );
  }
}
