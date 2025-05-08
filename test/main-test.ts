import { Testing } from 'cdktf';
import {
  AzurermPlaygroundStack,
  devAzurermPlaygroundStackProps,
} from '../lib/stack/azurerm-playground-stack';
import { BackendStack, devBackendStackProps } from '../lib/stack/backend-stack';
import {
  AzureadPlaygroundStack,
  devAzureadPlaygroundStackProps,
} from '../lib/stack/azuread-playground-stack';
import { GithubEnvironmentSecretStack } from '../lib/stack/github-environment-secret-stack';
import {
  ServicePrincipalStack,
  devServicePrincipalStackProps,
} from '../lib/stack/service-principal-stack';
import {
  AwsPlaygroundStack,
  devAwsPlaygroundStackProps,
} from '../lib/stack/aws-playground-stack';
import {
  GooglePlaygroundStack,
  devGooglePlaygroundStackProps,
} from '../lib/stack/google-playground-stack';

describe('Unit testing using assertions', () => {
  it('Test AzurermPlaygroundStack', () => {
    const app = Testing.app();
    const stack = new AzurermPlaygroundStack(
      app,
      'azurermPlaygroundStack',
      devAzurermPlaygroundStackProps,
    );
    const synthesized = Testing.synth(stack);

    // FIXME: TORIAEZU
    expect(synthesized).toMatch(/"azurerm_resource_group"/);
    console.log(synthesized);
  });

  it('Test BackendStack', () => {
    const app = Testing.app();
    const stack = new BackendStack(app, 'backendStack', devBackendStackProps);
    const synthesized = Testing.synth(stack);

    // FIXME: TORIAEZU
    expect(synthesized).toMatch(/"azurerm_resource_group"/);
    console.log(synthesized);
  });

  it('Test AzureadPlaygroundStack', () => {
    const app = Testing.app();
    const stack = new AzureadPlaygroundStack(
      app,
      'azureadPlaygroundStack',
      devAzureadPlaygroundStackProps,
    );
    const synthesized = Testing.synth(stack);

    // FIXME: TORIAEZU
    expect(synthesized).toMatch(/"azuread"/);
    console.log(synthesized);
  });

  it('Test GithubEnvironmentSecretStack', () => {
    const app = Testing.app();
    const stack = new GithubEnvironmentSecretStack(
      app,
      'githubEnvironmentSecretStack',
      {
        createRepository: false,
        repositoryName: 'baseline-environment-cdktf-typescript',
        environment: 'prod',
        organization: 'ks6088ts-labs',
      },
    );
    const synthesized = Testing.synth(stack);

    // FIXME: TORIAEZU
    expect(synthesized).toMatch(/"github"/);
    console.log(synthesized);
  });

  it('Test ServicePrincipalStack', () => {
    const app = Testing.app();
    const stack = new ServicePrincipalStack(
      app,
      'servicePrincipalStack',
      devServicePrincipalStackProps,
    );
    const synthesized = Testing.synth(stack);

    // FIXME: TORIAEZU
    expect(synthesized).toMatch(/"subscription"/);
    console.log(synthesized);
  });

  it('Test AwsPlaygroundStack', () => {
    const app = Testing.app();
    const stack = new AwsPlaygroundStack(
      app,
      'awsPlaygroundStack',
      devAwsPlaygroundStackProps,
    );
    const synthesized = Testing.synth(stack);

    // FIXME: TORIAEZU
    expect(synthesized).toMatch(/"aws"/);
    console.log(synthesized);
  });

  it('Test GooglePlaygroundStack', () => {
    const app = Testing.app();
    const stack = new GooglePlaygroundStack(
      app,
      'googlePlaygroundStack',
      devGooglePlaygroundStackProps,
    );
    const synthesized = Testing.synth(stack);

    // FIXME: TORIAEZU
    expect(synthesized).toMatch(/"google"/);
    console.log(synthesized);
  });
});
