import { Construct } from 'constructs';
import { iamRolePolicyAttachment } from '@cdktf/provider-aws';

export interface iamRolePolicyAttachmentProps {
  role: string;
  policyArn: string;
}

export class IamRolePolicyAttachment extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: iamRolePolicyAttachmentProps,
  ) {
    super(scope, id);

    // Resources
    new iamRolePolicyAttachment.IamRolePolicyAttachment(
      this,
      'iam_role_policy_attachment',
      {
        role: props.role,
        policyArn: props.policyArn,
      },
    );
  }
}
