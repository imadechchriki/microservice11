📡 API Gateway – Formation Evaluation System
This project serves as the entry point (API Gateway) for the microservices architecture of the Formation Evaluation System. It uses YARP (Yet Another Reverse Proxy) to route external traffic to internal services such as:

Catalog Service
Questionnaire (Evaluation) Service
Statistics Service

🚀 Prerequisites
.NET 9 SDK
Docker & Docker Compose
Git

🧱 Build & Run (Docker)
1-Clone the repo:
#bash
git clone https://github.com/your-org/evaluation_formation.git
cd evaluation_formation
2-Run the full microservice architecture:
#bash
docker compose up --build
3-The API Gateway will be available at: http://localhost:5000

🔀 Routing Table
| Public URL (via Gateway)                  | Target Service          | Description                     |
| ----------------------------------------- | ----------------------- | ------------------------------- |
| `http://localhost:5000/catalog/...`       | `catalog-service`       | Manages formations & modules    |
| `http://localhost:5000/questionnaire/...` | `questionnaire-service` | Handles questionnaire logic     |
| `http://localhost:5000/statistics/...`    | `statistics-service`    | Provides statistics and exports |


✅ Example Requests
Formation List (via Catalog)
GET http://localhost:5000/catalog/api/Formation

Submit Questionnaire (via Questionnaire)
POST http://localhost:5000/questionnaire/api/professional/questionnaires/submit/{templateCode}

