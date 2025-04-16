# Tapqyr Analytics Service

A Java Spring Boot microservice for user analytics that integrates with the main Tapqyr backend.

## Overview

This service provides analytics and insights into user behavior in the Tapqyr application. It uses the same SQLite database as the main Node.js backend but focuses exclusively on analytics functionality to avoid duplicating business logic.

## Features

- User growth metrics (daily, weekly, monthly)
- Todo completion rate analysis
- User activity patterns and engagement metrics
- Weekly user reports
- Similar user identification
- Todo analytics by time period

## Tech Stack

- Java 17
- Spring Boot 3.2
- Hibernate/JPA for ORM
- SQLite database (shared with main backend)
- Swagger/OpenAPI for API documentation

## Getting Started

### Prerequisites

- Java 17 or higher
- Maven
- Main Tapqyr backend running (for database access)

### Running the Service

1. Clone the repository
2. Build the project: `mvn clean package`
3. Run the application: `java -jar target/analytics-service-0.0.1-SNAPSHOT.jar`

The service will start on port 3002 by default.

## API Documentation

Once the service is running, you can access the Swagger UI at:

```
http://localhost:3002/swagger-ui.html
```

## Endpoints

- GET `/api/analytics/growth` - User growth metrics
- GET `/api/analytics/todo/completion-rates` - Todo completion rates by user
- GET `/api/analytics/user/{userId}/activity-patterns` - User activity patterns
- GET `/api/analytics/user/{userId}/engagement` - User engagement metrics
- GET `/api/analytics/todo/analytics?startDate={date}&endDate={date}` - Todo analytics by date range
- GET `/api/analytics/user/{userId}/weekly-report` - Weekly user report
- GET `/api/analytics/user/{userId}/similar-users` - Find similar users

## Integration with Main Backend

This service connects to the same SQLite database used by the main Tapqyr backend. It provides read-only access to the data, focusing on analytics rather than business logic.

The database path is configured in the `application.properties` file and points to the SQLite database in the main backend's Prisma directory.

## Development

### Project Structure

- `src/main/java/com/tapqyr/analytics/model` - Entity models mapping to database tables
- `src/main/java/com/tapqyr/analytics/repository` - JPA repositories for data access
- `src/main/java/com/tapqyr/analytics/service` - Business logic and analytics services
- `src/main/java/com/tapqyr/analytics/controller` - REST API controllers
- `src/main/java/com/tapqyr/analytics/config` - Configuration classes

### Building from Source

```bash
mvn clean install
```

### Running Tests

```bash
mvn test
``` 