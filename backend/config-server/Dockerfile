# --- Builder stage ---
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Step 1: Cache dependencies for config-server
COPY config-server/pom.xml config-server/
RUN mvn -f config-server/pom.xml dependency:go-offline -B

# Step 2: Copy code and build
COPY config-server/src config-server/src
RUN mvn -f config-server/pom.xml clean package -DskipTests

# --- Runtime stage ---
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

COPY --from=build /app/config-server/target/config-server-*.jar app.jar

EXPOSE 8888
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:8888/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]