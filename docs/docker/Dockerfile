FROM debian:13

ARG DEBIAN_FRONTEND=noninteractive

# System packages — dev essentials + nginx
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    git \
    jq \
    nginx \
    python3 \
    python3-pip \
    python3-venv \
    ripgrep \
    unzip \
    xz-utils \
    && rm -rf /var/lib/apt/lists/*

# Node.js 24.x
RUN curl -fsSL https://deb.nodesource.com/setup_24.x | bash - && \
    apt-get install -y --no-install-recommends nodejs && \
    rm -rf /var/lib/apt/lists/*

# OpenCode (multi-arch)
ARG OPENCODE_VERSION=v1.17.11
ARG TARGETARCH
RUN arch="${TARGETARCH:-$(uname -m)}" && \
    case "$arch" in \
      x86_64|amd64) binary="opencode-linux-x64.tar.gz" ;; \
      aarch64|arm64) binary="opencode-linux-arm64.tar.gz" ;; \
      *) echo "Unsupported arch: $arch"; exit 1 ;; \
    esac && \
    curl -fsSL "https://github.com/anomalyco/opencode/releases/download/${OPENCODE_VERSION}/${binary}" \
    | tar -xzf - -C /usr/local/bin

# Verify installs
RUN opencode --version && python3 --version && node --version && nginx -v

# Nginx config — serve /var/www/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
