FROM mcr.microsoft.com/playwright:v1.55.0-noble
WORKDIR /runner
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY runner.mjs ./
ENTRYPOINT ["node", "runner.mjs"]
