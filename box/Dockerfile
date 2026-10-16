# Garageband factory box: one Linux container that runs the T3 Code server and
# every agent tool (Claude Code, Codex, OpenCode, Hermes), so a sprint can run
# unattended without touching your Windows setup. Your T3 desktop app connects to it.
#
# Build and start:  docker compose -f box/compose.yaml up -d --build
# Then:             docker compose -f box/compose.yaml exec box first-run
FROM ubuntu:24.04
# Fail a RUN step when any command in a pipe fails (curl | bash must not hide a failed download).
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

ARG NODE_MAJOR=24
ARG WITH_RUST=1
ENV DEBIAN_FRONTEND=noninteractive \
    LANG=C.UTF-8 \
    TZ=Asia/Kolkata

# System packages: git and build tools for node-gyp, Python for Hermes, browser
# libraries for Playwright, tini as PID 1 so agent processes are reaped.
RUN apt-get update && apt-get install -y --no-install-recommends \
      ca-certificates curl wget gnupg git git-lfs openssh-client sudo tini tzdata \
      build-essential python3 python3-venv python3-pip pkg-config \
      jq ripgrep fd-find unzip xz-utils zip less nano procps lsof iproute2 \
      libatomic1 libsecret-1-0 \
 && ln -sf /usr/bin/fdfind /usr/local/bin/fd \
 && rm -rf /var/lib/apt/lists/*

# Node.js (T3 Code needs Node 24)
RUN curl -fsSL https://deb.nodesource.com/setup_${NODE_MAJOR}.x | bash - \
 && apt-get install -y --no-install-recommends nodejs \
 && rm -rf /var/lib/apt/lists/* \
 && corepack enable

# GitHub CLI
RUN install -d -m 0755 /etc/apt/keyrings \
 && curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg -o /etc/apt/keyrings/githubcli-archive-keyring.gpg \
 && chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
 && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" > /etc/apt/sources.list.d/github-cli.list \
 && apt-get update && apt-get install -y --no-install-recommends gh \
 && rm -rf /var/lib/apt/lists/*

# Browser libraries for Playwright (browser-qa) and T3's own headless browser tabs.
RUN npx --yes playwright@1.56.1 install-deps chromium && rm -rf /root/.npm

# Non-root user that every agent runs as. Passwordless sudo lets agents install
# packages inside the box; the container itself is the boundary.
RUN userdel -r ubuntu 2>/dev/null || true \
 && useradd -m -u 1000 -s /bin/bash factory \
 && echo 'factory ALL=(ALL) NOPASSWD:ALL' > /etc/sudoers.d/factory \
 && chmod 0440 /etc/sudoers.d/factory \
 && install -d -o factory -g factory /opt/npm-global /workspace

# Agent CLIs, installed outside the home volume so rebuilding the image updates them.
ENV NPM_CONFIG_PREFIX=/opt/npm-global \
    PATH=/home/factory/.local/bin:/opt/npm-global/bin:/home/factory/.cargo/bin:/home/factory/.local/share/vite-plus/bin:$PATH
USER factory
RUN npm install -g @anthropic-ai/claude-code @openai/codex opencode-ai \
 && npm cache clean --force

# Rust (only Track B needs it, for T3's resource monitor build and tests)
RUN if [ "$WITH_RUST" = "1" ]; then \
      curl -fsSL https://sh.rustup.rs | sh -s -- -y --profile minimal --default-toolchain stable; \
    fi

USER root
COPY scripts/ /opt/factory/scripts/
COPY githooks/ /opt/factory/githooks/
RUN chmod +x /opt/factory/scripts/* /opt/factory/githooks/* \
 && install -d /opt/factory/bin && mv /opt/factory/scripts/git /opt/factory/bin/git \
 && ln -sf /opt/factory/scripts/first-run.sh /usr/local/bin/first-run \
 && ln -sf /opt/factory/scripts/smoke.sh /usr/local/bin/box-smoke \
 && ln -sf /opt/factory/scripts/box-status.sh /usr/local/bin/box-status \
 && git config --system init.defaultBranch main \
 && git config --system pull.rebase true \
 && git config --system core.autocrlf input

USER factory
WORKDIR /workspace
# /opt/factory/bin first: its git wrapper makes the push guard unskippable.
ENV PATH=/opt/factory/bin:$PATH \
    T3CODE_HOST=0.0.0.0 \
    T3CODE_PORT=3773 \
    T3CODE_NO_BROWSER=1 \
    T3CODE_CHANNEL=nightly
EXPOSE 3773
ENTRYPOINT ["/usr/bin/tini", "--", "/opt/factory/scripts/entrypoint.sh"]
