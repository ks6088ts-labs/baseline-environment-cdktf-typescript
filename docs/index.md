# Logs

**Scaffolding the project**

```shell
❯ cdktf init --template=typescript --local
(node:27258) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
Note: By supplying '--local' option you have chosen local storage mode for storing the state of your stack.
This means that your Terraform state file will be stored locally on disk in a file 'terraform.<STACK NAME>.tfstate' in the root of your project.
? Project Name baseline-environment-on-azure-cdktf-typescript
? Project Description Baseline Environment on Azure in CDK for Terraform in TypeScript
? Do you want to start from an existing Terraform project? no
? Do you want to send crash reports to the CDKTF team? Refer to
https://developer.hashicorp.com/terraform/cdktf/create-and-deploy/configuration-file#enable-crash-reporting-for-the-cli for more
information no
Note: You can always add providers using 'cdktf provider add' later on
? What providers do you want to use? azuread, azurerm
```

**Deploy the stack**

```shell
# Login to Azure
az login

# Set the subscription
export ARM_SUBSCRIPTION_ID=$(az account show --query id --output tsv)

# Deploy the stack
make deploy
```

# References

- [Install CDK for Terraform and run a quick start demo](https://developer.hashicorp.com/terraform/tutorials/cdktf/cdktf-install)
- [Building Azure Resources with TypeScript Using the CDK for Terraform](https://www.hashicorp.com/ja/blog/building-azure-resources-with-typescript-using-the-cdk-for-terraform)
- [Developer/Terraform/CDK for Terraform/Unit Tests](https://developer.hashicorp.com/terraform/cdktf/test/unit-tests)
- [CDK for Terraform](https://github.com/hashicorp/terraform-cdk)
- [CDKTF prebuilt bindings for hashicorp/azurerm provider](https://github.com/cdktf/cdktf-provider-azurerm)
