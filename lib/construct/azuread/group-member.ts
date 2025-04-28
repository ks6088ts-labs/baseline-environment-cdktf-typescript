import { Construct } from 'constructs';
import { groupMember } from '@cdktf/provider-azuread';

export interface GroupMemberProps {
  groupObjectId: string;
  memberObjectId: string;
}

export class GroupMember extends Construct {
  public readonly groupMember: groupMember.GroupMember;
  constructor(scope: Construct, id: string, props: GroupMemberProps) {
    super(scope, id);

    // Resources
    this.groupMember = new groupMember.GroupMember(this, 'group_member', {
      groupObjectId: props.groupObjectId,
      memberObjectId: props.memberObjectId,
    });
  }
}
