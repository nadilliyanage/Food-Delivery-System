#!/bin/bash

# Start Minikube if not running
if ! minikube status | grep -q "Running"; then
    echo "Starting Minikube..."
    minikube start
fi

# Set Docker environment to use Minikube's Docker daemon
eval $(minikube docker-env)

# Build Docker images
echo "Building Docker images..."
docker build -t food-delivery-api-gateway:latest ./api-gateway
docker build -t food-delivery-auth-service:latest ./authentication-service
docker build -t food-delivery-order-service:latest ./order-service
docker build -t food-delivery-payment-service:latest ./payment-service
docker build -t food-delivery-delivery-service:latest ./delivery-service
docker build -t food-delivery-restaurant-service:latest ./restaurant-service
docker build -t food-delivery-notification-service:latest ./notification-service

# Apply Kubernetes configurations
echo "Applying Kubernetes configurations..."
kubectl apply -f mongodb-deployment.yaml
kubectl apply -f auth-service-deployment.yaml
kubectl apply -f api-gateway-deployment.yaml

# Wait for services to be ready
echo "Waiting for services to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/mongodb
kubectl wait --for=condition=available --timeout=300s deployment/auth-service
kubectl wait --for=condition=available --timeout=300s deployment/api-gateway

# Get the API Gateway URL
echo "Getting API Gateway URL..."
minikube service api-gateway --url

echo "Deployment completed!" 