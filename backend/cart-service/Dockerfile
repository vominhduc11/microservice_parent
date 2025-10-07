# --- Builder stage ---
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Step 1: Build and cache common-service (rarely changes)
COPY common-service/pom.xml common-service/
RUN mvn -f common-service/pom.xml dependency:go-offline -B
COPY common-service/src common-service/src
RUN mvn -f common-service/pom.xml clean install -DskipTests

# Step 2: Cache dependencies for cart-service
COPY cart-service/pom.xml cart-service/
RUN mvn -f cart-service/pom.xml dependency:go-offline -B

# Step 3: Copy code and build
COPY cart-service/src cart-service/src
RUN mvn -f cart-service/pom.xml clean package -DskipTests

# --- Runtime stage ---
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

COPY --from=build /app/cart-service/target/cart-service-*.jar app.jar

EXPOSE 8084
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:8084/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]