import { Construct } from 'constructs';
import { user } from '@cdktf/provider-azuread';

export interface UserProps {
  name: string;
  userPrincipalName: string;
  password: string;
}

export class User extends Construct {
  public readonly user: user.User;
  constructor(scope: Construct, id: string, props: UserProps) {
    super(scope, id);

    // Resources
    this.user = new user.User(this, 'user', {
      displayName: props.name,
      userPrincipalName: props.userPrincipalName,
      password: props.password,
      forcePasswordChange: true,
    });
  }
}
