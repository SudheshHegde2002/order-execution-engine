# Order Execution Engine (Mock DEX)

This repository contains a backend order execution engine designed to demonstrate routing logic, asynchronous execution, queue management, WebSocket lifecycle handling, retries, and persistence in a clean and realistic way.

- **Order type implemented:** Market Order  
  - Chosen because it executes immediately at the best available price  
  - Ideal for demonstrating routing, execution flow, retries, and WebSocket updates  
  - The same engine can be extended to:
    - **Limit Orders** by adding price-condition checks before execution
    - **Sniper Orders** by introducing event-based triggers such as token launches or liquidity migrations

- **Order execution flow:**  
  - User submits an order via `POST /api/orders/execute`  
  - API validates input, creates an `orderId`, and persists the initial order  
  - Client opens a WebSocket connection on the same endpoint using the `orderId`  
  - Order is pushed to a BullMQ queue backed by Redis  
  - A background worker consumes the job and processes it asynchronously  
  - The worker simulates DEX routing by querying mocked Raydium and Meteora pools with realistic 2–5% price variance and artificial 2–3 second delays  
  - Best-priced DEX is selected automatically  
  - Execution is simulated and status updates are streamed live to the client  

- **Order status lifecycle (WebSocket):**  
  - connected → pending → routing → building → submitted → confirmed | failed  

- **DEX routing (mocked):**  
  - Raydium and Meteora quotes are simulated  
  - Prices vary slightly to mimic real market conditions  
  - Routing decisions are logged and included in status updates  

- **Failure handling and retries:**  
  - Random execution failures are simulated  
  - BullMQ retries failed jobs using exponential backoff  
  - Maximum of 3 attempts per order  
  - Only after retries are exhausted is a `failed` status emitted  
  - Failure reasons are persisted for post-mortem analysis  

- **Data persistence:**  
  - PostgreSQL (Supabase) stores:
    - orderId
    - current status
    - selected DEX
    - quoted price
    - executed price (if successful)
    - transaction hash (mocked)
    - failure reason (if failed)  
  - Updates are applied incrementally to avoid overwriting previously known values  

- **Redis usage:**  
  - Used as the BullMQ backend for queueing and concurrency control  
  - Used as a Pub/Sub mechanism to propagate order status events from worker to API  
  - A single Redis instance safely supports both use cases  

- **Tech stack:**  
  - Node.js + TypeScript  
  - Fastify (HTTP + WebSocket)  
  - BullMQ + Redis (queue, retries, concurrency)  
  - PostgreSQL (Supabase)  
  - Jest (testing)  

- **Testing:**  
  - A Postman collection is included for manual API testing
  - WebSocket usage
        ```
        brew install websocat(mac)/sudo apt install websocat(WSL/LINUX)
        websocat "wss://order-execution-engine-production-745b.up.railway.app/api/orders/execute?orderId={paste order id}"
        ```
  - The project includes **10 unit/integration-style tests** covering:
    - DEX routing decisions
    - Queue behavior and retry semantics
    - WebSocket lifecycle (attach, detach, status streaming)  
  - Tests can be run locally using:
    ```
    npm test
    ```
  - External dependencies such as Redis and WebSockets are mocked in tests  

- **Setup instructions (local development):**  
  - Clone the repository  
  - Install dependencies:
    ```
    npm install
    ```
  - Start Redis locally (via Docker) (required for queue and pub/sub):
    ```
    docker run -p 6379:6379 redis
    ```
  - Create a `.env` file with:
    ```
    DATABASE_URL=postgresql://postgres.vgjwjkzbtwjffdpywsha:order-status123@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true 
    REDIS_URL=redis://127.0.0.1:6379
    ```
  - Start the API service:
    ```
    npm run start:api
    ```
  - In a separate terminal, start the worker:
    ```
    npm run start:worker
    ```

- **Deployment:**  
  - Deployed on Railway using three services in a single project:
    - Public API service
    - Background worker service
    - Managed Redis service  
  - PostgreSQL is hosted on Supabase  
  - The public Railway URL supports both HTTP and WebSocket connections  

Public URL:  
https://order-execution-engine-production-745b.up.railway.app
