# --- Builder stage ---
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Step 1: Cache dependencies for api-gateway
COPY api-gateway/pom.xml api-gateway/
RUN mvn -f api-gateway/pom.xml dependency:go-offline -B

# Step 2: Copy code and build
COPY api-gateway/src api-gateway/src
RUN mvn -f api-gateway/pom.xml clean package -DskipTests

# --- Runtime stage ---
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

COPY --from=build /app/api-gateway/target/api-gateway-*.jar app.jar

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]