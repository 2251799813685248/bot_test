# ベースイメージとしてBunの公式イメージを使用
FROM oven/bun:1

# 作業ディレクトリを指定
WORKDIR /app

# パッケージの依存関係ファイルをコピーしてインストール
COPY package.json bun.lock ./
RUN bun install

# プロジェクトのソースコードをすべてコピー
COPY . .

# アプリケーションの起動コマンド
CMD ["./run.sh"]