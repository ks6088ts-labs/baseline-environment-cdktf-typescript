# Deployment of Web Server on a Virtual Machine

## Pre-requisites

- `Azurerm-Network-Stack` deployed

## Deploying web servers on a Virtual Machine

Azurerm-Network-Stack で事前構成済のネットワークに仮想マシンをデプロイし、Webサーバーを構築します。
検証用に作成したリソースのみ削除しやすいように、リソースグループを分けてデプロイします。

```shell
# SSH into the VM
USER_NAME=your-username
PUBLIC_IP=xxx.xxx.xxx.xxx

ssh $USER_NAME@$PUBLIC_IP -v

# Launch HTTP server
python3 -m http.server 8080
# http://<PUBLIC_IP>:8080 にアクセスして、PythonのデフォルトのHTTPサーバーが立ち上がっていることを確認
# 疎通しない場合は、NSGの設定を見直すこと
```

### Docker Installation on Ubuntu VM

```shell
# 0) 前提パッケージ

sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# 1) 公式GPG鍵＆APTレポ登録

sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
 | sudo tee /etc/apt/keyrings/docker.asc >/dev/null
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
https://download.docker.com/linux/ubuntu \
$(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
| sudo tee /etc/apt/sources.list.d/docker.list >/dev/null

sudo apt-get update

# 2) Docker本体＋Compose v2（plugin）をインストール

sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 3) 起動＆docker自動起動ON、権限

sudo systemctl enable --now docker
sudo usermod -aG docker $USER
newgrp docker

# 4) 動作確認

# 下記二つはバージョン表示されればOK

docker --version
docker compose version

docker run --rm hello-world
# 中段に、下記メッセージが表示されればOK。
# Hello from Docker!

# 5) nginxコンテナ起動
docker run --name nginx-test -d -p 8080:80 nginx
# http://<PUBLIC_IP>:8080 にアクセスして、nginxのデフォルトページが表示されればOK
```

### References

- [Azureの仮想マシンにLangfuseをセルフホストしてみる](https://qiita.com/yoku8983/items/f43465aa1c8de8ae76cd)
- [DifyをAzure仮想マシンにインストールする手順](https://blog.jbs.co.jp/entry/2024/10/02/114102)
- [DifyをAzure仮想マシンにインストールする手順（HTTPS対応）](https://blog.jbs.co.jp/entry/2024/10/02/155409)
