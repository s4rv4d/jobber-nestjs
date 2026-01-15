# Jobber - Distributed Job Processing Engine

A production-ready, cloud-native distributed job processing system built with a microservices architecture. Designed for horizontal scalability, reliability, and extensibility.

## Tech Stack

| Category           | Technologies                              |
| ------------------ | ----------------------------------------- |
| **Backend**        | NestJS, TypeScript, Node.js               |
| **API**            | GraphQL (Apollo), gRPC (Protocol Buffers) |
| **Message Queue**  | Apache Pulsar                             |
| **Database**       | PostgreSQL, Prisma ORM, Drizzle ORM       |
| **Infrastructure** | Kubernetes, Helm, Docker                  |
| **Monorepo**       | Nx                                        |
| **Auth**           | JWT, Passport.js, bcrypt                  |

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Client Applications                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Kubernetes Ingress (ALB)                          │
└─────────────────────────────────────────────────────────────────────────────┘
                          │                           │
                          ▼                           ▼
              ┌───────────────────┐       ┌───────────────────┐
              │   Auth Service    │       │   Jobs Service    │
              │   (GraphQL/gRPC)  │◄─────►│   (GraphQL/gRPC)  │
              │   Port: 3000/5000 │       │   Port: 3001/5002 │
              └───────────────────┘       └───────────────────┘
                                                   │
                                                   ▼
                                    ┌──────────────────────────┐
                                    │      Apache Pulsar       │
                                    │    (Message Broker)      │
                                    └──────────────────────────┘
                                                   │
                                                   ▼
              ┌───────────────────┐       ┌───────────────────┐
              │ Products Service  │◄──────│  Executor Service │
              │      (gRPC)       │ gRPC  │  (Pulsar Consumer)│
              │   Port: 3003/5001 │       │   Port: 3002      │
              └───────────────────┘       └───────────────────┘
                        │                          │
                        ▼                          ▼
              ┌─────────────────────────────────────────────────┐
              │                   PostgreSQL                    │
              └─────────────────────────────────────────────────┘
```

## Microservices

| Service      | Responsibility                                 | Communication                    |
| ------------ | ---------------------------------------------- | -------------------------------- |
| **Auth**     | User authentication, JWT token management      | GraphQL + gRPC                   |
| **Jobs**     | Job submission, validation, status tracking    | GraphQL + gRPC + Pulsar Producer |
| **Executor** | Async job processing, business logic execution | Pulsar Consumer + gRPC           |
| **Products** | Product CRUD operations                        | gRPC                             |

## Key Features

- **Event-Driven Architecture**: Decoupled services communicate via Apache Pulsar for reliability and scalability
- **Pluggable Job System**: Extensible job framework using decorators and auto-discovery
- **Type-Safe Communication**: gRPC with Protocol Buffers for inter-service calls
- **GraphQL API**: Modern, flexible API for client applications with authentication guards
- **Kubernetes-Native**: Production-ready Helm charts with configurable replicas, ingress, and secrets
- **Batch Processing**: Support for bulk operations via file uploads and array processing
- **Database Per Pattern**: Services use dedicated schemas with Prisma/Drizzle ORMs

## Job Processing Flow

```
1. Client → GraphQL Mutation (executeJob)
2. Jobs Service → Validates input, creates job record
3. Jobs Service → Serializes job, publishes to Pulsar topic
4. Apache Pulsar → Routes message to appropriate consumer
5. Executor Service → Deserializes message, executes job logic
6. Executor Service → Calls dependent services via gRPC (if needed)
7. Executor Service → Sends acknowledgment back via gRPC
8. Jobs Service → Updates job status to COMPLETED
```

## Project Structure

```
jobber/
├── apps/
│   ├── auth/           # Authentication microservice
│   ├── jobs/           # Job orchestration microservice
│   ├── executor/       # Job execution microservice
│   └── products/       # Product management microservice
├── libs/
│   ├── grpc/           # Protocol Buffer definitions
│   ├── graphql/        # Shared GraphQL utilities
│   ├── prisma/         # Database client configuration
│   ├── pulsar/         # Message queue client & consumers
│   └── nestjs/         # Common utilities
├── charts/
│   └── jobber/         # Helm chart for K8s deployment
└── docker-compose.yaml # Local development setup
```

## Getting Started

### Prerequisites

- Node.js 22+
- Docker & Docker Compose
- kubectl & Helm (for K8s deployment)

### Local Development

```bash
# Start infrastructure (PostgreSQL + Pulsar)
docker-compose up -d

# Install dependencies
npm install

# Run database migrations
npx prisma migrate deploy

# Start all services
npm start
```

### Kubernetes Deployment

```bash
# Add Helm dependencies
helm dependency update ./charts/jobber

# Deploy to cluster
helm install jobber ./charts/jobber -f ./charts/jobber/values.yaml
```

## API Examples

### Authentication

```graphql
mutation Login {
  login(input: { email: "user@example.com", password: "password" }) {
    token
  }
}
```

### Submit a Job

```graphql
mutation ExecuteJob {
  executeJob(input: { name: "LoadProducts", data: "[{\"name\": \"Product 1\", \"price\": 99.99}]" }) {
    id
    status
  }
}
```

## Environment Variables

| Variable                    | Description                    |
| --------------------------- | ------------------------------ |
| `DATABASE_URL`              | PostgreSQL connection string   |
| `PULSAR_SERVICE_URL`        | Apache Pulsar broker URL       |
| `JWT_SECRET`                | Secret key for JWT signing     |
| `AUTH_GRPC_SERVICE_URL`     | Auth service gRPC endpoint     |
| `JOBS_GRPC_SERVICE_URL`     | Jobs service gRPC endpoint     |
| `PRODUCTS_GRPC_SERVICE_URL` | Products service gRPC endpoint |
