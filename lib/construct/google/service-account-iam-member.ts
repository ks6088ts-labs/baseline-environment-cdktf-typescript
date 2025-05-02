import { Construct } from 'constructs';
import { serviceAccountIamMember } from '@cdktf/provider-google';

export interface ServiceAccountIamMemberProps {
  serviceAccountId: string;
  role: string;
  member: string;
}

export class ServiceAccountIamMember extends Construct {
  public readonly serviceAccountIamMember: serviceAccountIamMember.ServiceAccountIamMember;
  constructor(
    scope: Construct,
    id: string,
    props: ServiceAccountIamMemberProps,
  ) {
    super(scope, id);

    // Resources
    this.serviceAccountIamMember =
      new serviceAccountIamMember.ServiceAccountIamMember(
        this,
        'service_account_iam_member',
        {
          serviceAccountId: props.serviceAccountId,
          role: props.role,
          member: props.member,
        },
      );
  }
}
