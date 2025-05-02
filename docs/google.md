# Logs

## Get started with Google Cloud

- [Getting Started with the Google Cloud provider](https://registry.terraform.io/providers/hashicorp/google/latest/docs/guides/getting_started#configuring-the-provider)
- [Terraform/GCP Error: project: required field is not set](https://stackoverflow.com/questions/70674928/terraform-gcp-error-project-required-field-is-not-set)

```shell
# Configure the Google Cloud provider
gcloud auth application-default login

# FIXME: Not sure if these are needed
export GOOGLE_APPLICATION_CREDENTIALS=~/.config/gcloud/application_default_credentials.json
export GOOGLE_PROJECT=$(cat ~/.config/gcloud/application_default_credentials.json | jq -r .quota_project_id)

# Deploy the stack
make deploy STACKS=Dev-GooglePlaygroundStack TF_BACKEND=azurerm
```

## OpenID Connect (OIDC) authentication

- [GCPとGitHub ActionsでOIDC認証しgithub actionsでterraform planを実施する](https://qiita.com/zukizukizukizuki/items/95a89a04cfb5d0f3bfe2)
- [デプロイメント パイプラインとの Workload Identity 連携を構成する](https://cloud.google.com/iam/docs/workload-identity-federation-with-deployment-pipelines?hl=ja#github-actions_1)
- [Example Usage - Iam Workload Identity Pool Provider Github Actions](https://registry.terraform.io/providers/hashicorp/google/6.31.1/docs/resources/iam_workload_identity_pool_provider#example-usage---iam-workload-identity-pool-provider-github-actions)
