# OpenID Connect with AWS

## AWS

```shell
# create OpenID Connect Provider resource
aws iam create-open-id-connect-provider \
    --url https://token.actions.githubusercontent.com \
    --client-id-list sts.amazonaws.com \
    --thumbprint-list 1234567890123456789012345678901234567890

# set environment variables
export GITHUB_REPOSITORY="ks6088ts-labs/baseline-environment-on-azure-cdktf-typescript"
export PROVIDER_URL=token.actions.githubusercontent.com
export AWS_ID=$(aws sts get-caller-identity --query Account --output text)
export AWS_ROLE_NAME=github-actions

cat <<EOF > assume_role_policy.json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Principal": {
        "Federated": "arn:aws:iam::${AWS_ID}:oidc-provider/${PROVIDER_URL}"
      },
      "Condition": {
        "StringLike": {
          "${PROVIDER_URL}:sub": "repo:${GITHUB_REPOSITORY}:*"
        }
      }
    }
  ]
}
EOF

# create IAM role
aws iam create-role \
    --role-name $AWS_ROLE_NAME \
    --assume-role-policy-document file://assume_role_policy.json

# attach policies to the role
aws iam attach-role-policy \
    --role-name $AWS_ROLE_NAME \
    --policy-arn arn:aws:iam::aws:policy/IAMReadOnlyAccess
```

## GitHub

```shell
gh secret set --env dev AWS_ID --body $AWS_ID
gh secret set --env dev AWS_ROLE_NAME --body $AWS_ROLE_NAME
```
