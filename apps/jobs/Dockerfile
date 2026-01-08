FROM node:22-slim as builder

WORKDIR /workspace

RUN apt-get update && apt-get install -y openssl

COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./
COPY jest.config.ts ./
COPY jest.preset.js ./
COPY .eslintrc.json ./
COPY webpack.*.config.js ./
COPY prisma.*.ts ./

COPY apps/jobs ./apps/jobs
COPY libs/graphql ./libs/graphql
COPY libs/grpc ./libs/grpc
COPY libs/nestjs ./libs/nestjs
COPY libs/pulsar ./libs/pulsar
COPY libs/prisma ./libs/prisma

RUN npm install

RUN npm i @as-integrations/fastify
RUN npm i @apollo/gateway

RUN apt-get update && apt-get install -y protobuf-compiler

# RUN npx nx build auth --verbose
ENV NX_VERBOSE_LOGGING=true
ARG DATABASE_URL="postgresql://user:pass@localhost:5432/db"
ENV DATABASE_URL=$DATABASE_URL

# Generate Prisma client
RUN cd apps/jobs && npx prisma generate

RUN npx nx build jobs

FROM node:22-slim as runner

RUN apt-get update && apt-get install -y openssl

WORKDIR /app

COPY --from=builder /workspace/package.json ./
COPY --from=builder /workspace/apps/jobs/package.json ./apps/jobs/package.json
COPY --from=builder /workspace/libs/graphql/package.json ./libs/graphql/package.json
COPY --from=builder /workspace/libs/grpc/package.json ./libs/grpc/package.json
COPY --from=builder /workspace/libs/pulsar/package.json ./libs/pulsar/package.json
COPY --from=builder /workspace/libs/prisma/package.json ./libs/prisma/package.json
COPY --from=builder /workspace/apps/jobs/prisma ./apps/jobs/prisma
COPY --from=builder /workspace/apps/jobs/prisma.config.ts ./apps/jobs/prisma.config.ts
COPY --from=builder /workspace/package-lock.json ./

# only install dependencies and not devDependencies
ENV NODE_ENV=production
RUN npm ci

COPY --from=builder /workspace/node_modules/@prisma-clients/jobs ./node_modules/@prisma-clients/jobs
COPY --from=builder /workspace/dist ./dist

CMD ["node", "dist/apps/jobs/main"]
