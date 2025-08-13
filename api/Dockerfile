FROM eclipse-temurin:21-jdk-alpine as builder

WORKDIR /app
COPY build.gradle settings.gradle gradle.properties ./
COPY gradle/ gradle/
COPY gradlew ./
RUN chmod +x gradlew

COPY src/ src/
RUN ./gradlew clean build -x test

FROM eclipse-temurin:21-jre-alpine

WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar"]