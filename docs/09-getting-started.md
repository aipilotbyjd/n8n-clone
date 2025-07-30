# 🚀 Getting Started

This guide will walk you through the process of setting up your development environment and running the n8n clone for the first time.

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later)
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Git](https://git-scm.com/)

## 🛠️ Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-org/n8n-clone.git
cd n8n-clone
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root of the project and add the following environment variables:

```env
# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=n8n_clone

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Kafka
KAFKA_BROKERS=localhost:9092

# JWT
JWT_SECRET=your-secret-key
```

4. **Start the development environment**

This will start all the required services, including PostgreSQL, Redis, and Kafka, in Docker containers.

```bash
docker-compose -f docker-compose.dev.yml up -d
```

5. **Run database migrations**

```bash
npm run typeorm:migration:run
```

## ▶️ Running the Application

To start the application in development mode, run:

```bash
npm run dev
```

This will start all the microservices with hot-reloading enabled. You can access the application at `http://localhost:3000`.

## 🧪 Running Tests

To run the test suite, use the following command:

```bash
npm run test
```

This will run all the unit and integration tests for the project.

## 📦 Building for Production

To create a production-ready build of the application, run:

```bash
npm run build
```

This will create a `dist` directory with the compiled code for all the microservices.

## 🐳 Running with Docker

To run the application with Docker, you can use the production Docker Compose file:

```bash
docker-compose -f docker-compose.yml up -d
```

This will build the Docker images for all the microservices and start them in containers.

---

**Next**: [API Documentation](./10-api-documentation.md)

