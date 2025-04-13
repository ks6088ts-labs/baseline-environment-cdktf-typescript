import { Testing } from 'cdktf';
import {
  PlaygroundStack,
  devPlaygroundStackProps,
} from '../lib/stack/playground-stack';
import { BackendStack, devBackendStackProps } from '../lib/stack/backend-stack';
import { AzureadStack, devAzureadStackProps } from '../lib/stack/azuread-stack';

describe('Unit testing using assertions', () => {
  it('Test PlaygroundStack', () => {
    const app = Testing.app();
    const stack = new PlaygroundStack(
      app,
      'playgroundStack',
      devPlaygroundStackProps,
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
  it('Test AzureadStack', () => {
    const app = Testing.app();
    const stack = new AzureadStack(app, 'azureadStack', devAzureadStackProps);
    const synthesized = Testing.synth(stack);

    // FIXME: TORIAEZU
    expect(synthesized).toMatch(/"azuread"/);
    console.log(synthesized);
  });
});
