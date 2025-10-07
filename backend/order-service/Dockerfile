# --- Builder stage ---
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Step 1: Build and cache common-service (rarely changes)
COPY common-service/pom.xml common-service/
RUN mvn -f common-service/pom.xml dependency:go-offline -B
COPY common-service/src common-service/src
RUN mvn -f common-service/pom.xml clean install -DskipTests

# Step 2: Cache dependencies for order-service
COPY order-service/pom.xml order-service/
RUN mvn -f order-service/pom.xml dependency:go-offline -B

# Step 3: Copy code and build
COPY order-service/src order-service/src
RUN mvn -f order-service/pom.xml clean package -DskipTests

# --- Runtime stage ---
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

COPY --from=build /app/order-service/target/order-service-*.jar app.jar

EXPOSE 8085
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:8085/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]