FROM node:alpine as builder

RUN apk add curl tar file xz libc6-compat gcompat musl-dev wget

# Get the latest version of Zola
RUN curl -s https://api.github.com/repos/cestef/zola/releases/latest \
    | grep "browser_download_url.*x86_64-unknown-linux-musl.tar.xz" \
    | cut -d '"' -f 4 \
    | wget -q -i -
RUN sha256sum -c zola-x86_64-unknown-linux-musl.tar.xz.sha256 2>&1 | grep OK
RUN tar -xf zola-x86_64-unknown-linux-musl.tar.xz
RUN mv ./zola-x86_64-unknown-linux-musl/zola /usr/local/bin/zola
RUN zola --version
RUN rm zola-x86_64-unknown-linux-musl.tar.xz
RUN rm -rf zola-x86_64-unknown-linux-musl

RUN corepack enable
COPY . /app
WORKDIR /app

# Install dependencies
RUN --mount=type=cache,target=/root/.cache/pnpm \
    pnpm install --frozen-lockfile
RUN npm i -g svgo

RUN --mount=type=cache,target=/root/.cache/zola \
    pnpm build

FROM nginx:alpine as runner

COPY --from=builder /app/public /usr/share/nginx/html
