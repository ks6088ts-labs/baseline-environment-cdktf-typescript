import { Construct } from 'constructs';
import { iamOpenidConnectProvider } from '@cdktf/provider-aws';

export interface IamOpenidConnectProviderProps {
  url: string;
  clientIdList: string[];
}

export class IamOpenidConnectProvider extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: IamOpenidConnectProviderProps,
  ) {
    super(scope, id);

    // Resources
    new iamOpenidConnectProvider.IamOpenidConnectProvider(
      this,
      'iam_openid_connect_provider',
      {
        url: props.url,
        clientIdList: props.clientIdList,
      },
    );
  }
}
