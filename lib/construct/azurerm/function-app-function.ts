import { Construct } from 'constructs';
import { functionAppFunction } from '@cdktf/provider-azurerm';

export interface FunctionAppFunctionProps {
  name: string;
  functionAppId: string;
  language: string;
  file: functionAppFunction.FunctionAppFunctionFile[];
  testData: string;
  configJson: string;
}

export class FunctionAppFunction extends Construct {
  constructor(scope: Construct, id: string, props: FunctionAppFunctionProps) {
    super(scope, id);

    // Resources
    new functionAppFunction.FunctionAppFunction(this, 'function_app_function', {
      name: props.name,
      functionAppId: props.functionAppId,
      language: props.language,
      file: props.file,
      testData: props.testData,
      configJson: props.configJson,
    });
  }
}
