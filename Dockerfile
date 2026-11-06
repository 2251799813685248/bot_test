# ベースイメージとしてBunの公式イメージを使用
FROM oven/bun:1

# 作業ディレクトリを指定
WORKDIR /app

# パッケージの依存関係ファイルをコピーしてインストール
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# プロジェクトのソースコードをすべてコピー
COPY . .

# traq-bot-ts の WebSocket PING payload を Bun 互換の値に修正
RUN bun run patch:traq-bot-ts

# 未使用の言語モデルやHTML処理を実行時に読み込まないようバンドル
RUN bun run build

# アプリケーションの起動コマンド
CMD ["./run.sh"]
