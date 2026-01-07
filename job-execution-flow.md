# Job Execution Flow Diagram

## Complete End-to-End Flow

```mermaid
sequenceDiagram
    participant Client as Client/UI
    participant GraphQL as GraphQL API<br/>(Jobs Service)<br/>Port 3000
    participant JobService as JobsService
    participant AbstractJob as AbstractJob
    participant Producer as Pulsar Producer
    participant Pulsar as Apache Pulsar<br/>Message Broker
    participant Consumer as Pulsar Consumer<br/>(Executor Service)<br/>Port 3001
    participant JobImpl as Job Implementation<br/>(FibonacciConsumer/<br/>LoadProductsConsumer)
    participant gRPC as Products Service<br/>(gRPC)
    participant DB as PostgreSQL

    rect rgb(230, 240, 255)
        Note over Client,GraphQL: 1. JOB CREATION & SUBMISSION
        Client->>GraphQL: GraphQL Mutation:<br/>executeJob(name, data)
        GraphQL->>JobService: executeJob(name, data)

        alt File Upload
            Client->>GraphQL: Upload JSON file<br/>/api/uploads/upload
            GraphQL-->>Client: fileName
            Client->>GraphQL: executeJob(name, {fileName})
            JobService->>JobService: readFile(fileName)
        end
    end

    rect rgb(255, 240, 230)
        Note over JobService,AbstractJob: 2. JOB VALIDATION & QUEUING
        JobService->>JobService: Find job by name<br/>from discovered classes
        JobService->>AbstractJob: job.execute(data, jobName)
        AbstractJob->>AbstractJob: validate(data)<br/>using class-validator

        alt Batch Processing
            AbstractJob->>AbstractJob: Check if Array
            loop For each item
                AbstractJob->>AbstractJob: validateData(item)
                AbstractJob->>AbstractJob: send(item)
            end
        else Single Item
            AbstractJob->>AbstractJob: validateData(data)
            AbstractJob->>AbstractJob: send(data)
        end
    end

    rect rgb(240, 255, 240)
        Note over AbstractJob,Pulsar: 3. MESSAGE SERIALIZATION & QUEUEING
        AbstractJob->>Producer: Lazy init producer<br/>(if not exists)
        Producer-->>AbstractJob: Producer instance
        AbstractJob->>AbstractJob: serialize(data)<br/>→ Buffer
        AbstractJob->>Producer: send({data: Buffer})
        Producer->>Pulsar: Publish to topic<br/>Topic: [JobName]<br/>Subscription: "jobber"
        Pulsar-->>GraphQL: Message queued
        GraphQL-->>Client: Job submitted successfully
    end

    rect rgb(255, 245, 230)
        Note over Pulsar,Consumer: 4. MESSAGE CONSUMPTION
        Consumer->>Pulsar: Subscribe to topic<br/>(OnModuleInit)
        Pulsar->>Consumer: listener(message)
        Consumer->>Consumer: deserialize(Buffer)<br/>→ TypeScript object
        Consumer->>Consumer: Log message received
    end

    rect rgb(240, 230, 255)
        Note over Consumer,DB: 5. JOB EXECUTION
        Consumer->>JobImpl: onMessage(data)

        alt Fibonacci Job
            JobImpl->>JobImpl: iterate(iterations)
            JobImpl->>JobImpl: Log Fibonacci result
        else LoadProducts Job
            JobImpl->>gRPC: createProduct(data)<br/>(gRPC call)
            gRPC->>DB: INSERT product
            DB-->>gRPC: Success
            gRPC-->>JobImpl: Product created
        end
    end

    rect rgb(255, 230, 230)
        Note over JobImpl,Pulsar: 6. POST-EXECUTION & ACKNOWLEDGMENT

        alt Success
            JobImpl-->>Consumer: Execution complete
            Consumer->>Pulsar: acknowledge(message)
            Pulsar-->>Consumer: Message removed
        else Error
            JobImpl--xConsumer: Error thrown
            Consumer->>Consumer: Log error
            Consumer->>Pulsar: acknowledge(message)<br/>(still ack'd!)
            Note over Consumer,Pulsar: ⚠️ No retry mechanism
        end
    end
```

## System Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer"
        A[Client/UI]
        B[GraphQL Queries/Mutations]
    end

    subgraph "Jobs Service (Port 3000)"
        C[GraphQL Resolver]
        D[JobsService]
        E[AbstractJob]
        F[FibonacciJob]
        G[LoadProductsJob]
        H[UploadsModule]
        I[Job Discovery Service]
    end

    subgraph "Message Broker"
        J[Apache Pulsar]
        K[Topic: FibonacciJob]
        L[Topic: LoadProducts]
    end

    subgraph "Executor Service (Port 3001)"
        M[FibonacciConsumer]
        N[LoadProductsConsumer]
        O[PulsarConsumer Base]
    end

    subgraph "Other Services"
        P[Products Service<br/>gRPC]
        Q[PostgreSQL DB]
    end

    A -->|HTTP POST| B
    B --> C
    C --> D
    D --> I
    I -.discovers.-> F
    I -.discovers.-> G
    D --> E
    E --> F
    E --> G
    F -->|serialize & send| K
    G -->|serialize & send| L
    K --> J
    L --> J

    J -->|subscribe & consume| M
    J -->|subscribe & consume| N
    M --> O
    N --> O

    N -->|gRPC call| P
    P --> Q

    A -.upload files.-> H
    H -.stored files.-> D

    style J fill:#f9f,stroke:#333,stroke-width:4px
    style C fill:#bbf,stroke:#333,stroke-width:2px
    style M fill:#bfb,stroke:#333,stroke-width:2px
    style N fill:#bfb,stroke:#333,stroke-width:2px
    style P fill:#fbb,stroke:#333,stroke-width:2px
```

## Component Interaction Flow

```mermaid
flowchart TD
    Start([User Triggers Job]) --> A{Job Type?}

    A -->|API Call| B[GraphQL Mutation<br/>executeJob]
    A -->|File Upload| C[Upload JSON File]
    C --> B

    B --> D[JobsService.executeJob]
    D --> E{Job Exists?}
    E -->|No| F[Error: Job Not Found]
    E -->|Yes| G[Get Job Instance]

    G --> H{Data Valid?}
    H -->|No| I[Error: Validation Failed]
    H -->|Yes| J{Batch or Single?}

    J -->|Batch Array| K[Loop Each Item]
    K --> L[Validate Each]
    L --> M[Serialize to Buffer]

    J -->|Single Object| N[Validate Object]
    N --> M

    M --> O[Send to Pulsar Producer]
    O --> P[Pulsar Topic<br/>JobName]

    P --> Q{Executor Ready?}
    Q -->|Yes| R[PulsarConsumer Receives]
    Q -->|No| S[Message Queued<br/>Wait for Consumer]
    S --> Q

    R --> T[Deserialize Buffer]
    T --> U[Call onMessage handler]

    U --> V{Which Job?}
    V -->|Fibonacci| W[Calculate Fibonacci]
    W --> X[Log Result]

    V -->|LoadProducts| Y[Call Products Service<br/>via gRPC]
    Y --> Z[Insert to Database]
    Z --> AA[Return Success]

    X --> AB[Acknowledge Message]
    AA --> AB

    AB --> AC{More Messages?}
    AC -->|Yes| R
    AC -->|No| AD([Wait for Next Message])

    U -.Error.-> AE[Log Error]
    AE --> AB

    style P fill:#f9f,stroke:#333,stroke-width:3px
    style R fill:#bfb,stroke:#333,stroke-width:2px
    style AB fill:#bbf,stroke:#333,stroke-width:2px
    style AE fill:#fbb,stroke:#333,stroke-width:2px
```

## Data Flow Architecture

```mermaid
graph LR
    subgraph Input
        A1[Client Request]
        A2[JSON Data/<br/>File Upload]
    end

    subgraph "Jobs Service"
        B1[GraphQL Layer]
        B2[Validation Layer]
        B3[Serialization Layer]
    end

    subgraph "Message Queue"
        C1[Pulsar Producer]
        C2[Pulsar Broker<br/>Topics]
        C3[Pulsar Consumer]
    end

    subgraph "Executor Service"
        D1[Deserialization Layer]
        D2[Job Execution Layer]
        D3[Acknowledgment Layer]
    end

    subgraph Output
        E1[Database Updates]
        E2[Logs/Results]
        E3[gRPC Calls]
    end

    A1 --> B1
    A2 --> B1
    B1 --> B2
    B2 --> B3
    B3 --> C1
    C1 --> C2
    C2 --> C3
    C3 --> D1
    D1 --> D2
    D2 --> E1
    D2 --> E2
    D2 --> E3
    E1 -.ack.-> D3
    E2 -.ack.-> D3
    E3 -.ack.-> D3
    D3 -.confirm.-> C2

    style C2 fill:#f9f,stroke:#333,stroke-width:4px
    style B2 fill:#ff9,stroke:#333,stroke-width:2px
    style D2 fill:#9f9,stroke:#333,stroke-width:2px
```

## Technology Stack

```mermaid
mindmap
  root((Job Execution<br/>System))
    API Layer
      GraphQL Apollo
      NestJS Framework
      Port 3000
    Message Queue
      Apache Pulsar
      Shared Subscription
      Topic Based Routing
    Executor Layer
      NestJS Framework
      Port 3001
      Consumer Pattern
    Validation
      class-validator
      class-transformer
      TypeScript Types
    Communication
      gRPC Protocol
      protobuf
      Products Service
    Storage
      PostgreSQL
      Port 5433
    Discovery
      golevelup/nestjs-discovery
      Decorator Based
      Auto Registration
```

## Key Files Reference

| Component             | File Path                                                       | Line |
| --------------------- | --------------------------------------------------------------- | ---- |
| GraphQL Resolver      | `apps/jobs/src/app/jobs.resolver.ts`                            | 11   |
| Jobs Service          | `apps/jobs/src/app/jobs.service.ts`                             | -    |
| Abstract Job          | `apps/jobs/src/app/jobs/abstract.job.ts`                        | -    |
| Fibonacci Job         | `apps/jobs/src/app/jobs/fibonacci/fibonacci.job.ts`             | -    |
| LoadProducts Job      | `apps/jobs/src/app/jobs/products/load-products.job.ts`          | -    |
| Pulsar Client         | `libs/pulsar/src/lib/pulsar.client.ts`                          | -    |
| Pulsar Consumer       | `libs/pulsar/src/lib/pulsar.consumer.ts`                        | 27   |
| Fibonacci Consumer    | `apps/executor/src/app/jobs/fibonacci/fibonacci.consumer.ts`    | 14   |
| LoadProducts Consumer | `apps/executor/src/app/jobs/products/load-products.consumer.ts` | -    |
| Job Decorator         | `apps/jobs/src/app/decorators/job.decorator.ts`                 | -    |
| Jobs Enum             | `libs/nestjs/src/lib/jobs.ts`                                   | -    |

---

**Generated on**: 2026-01-07
**System**: Jobber - Distributed Job Processing System
