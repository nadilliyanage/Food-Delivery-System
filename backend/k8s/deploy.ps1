# Start Minikube if not running
$minikubeStatus = minikube status
if (-not ($minikubeStatus -match "Running")) {
    Write-Host "Starting Minikube..."
    minikube start
}

# Set Docker environment to use Minikube's Docker daemon
minikube docker-env | Invoke-Expression

# Build Docker images
Write-Host "Building Docker images..."
docker build -t food-delivery-api-gateway:latest ../api-gateway
docker build -t food-delivery-auth-service:latest ../authentication-service
docker build -t food-delivery-order-service:latest ../order-service
docker build -t food-delivery-payment-service:latest ../payment-service
docker build -t food-delivery-delivery-service:latest ../delivery-service
docker build -t food-delivery-restaurant-service:latest ../restaurant-service
docker build -t food-delivery-notification-service:latest ../notification-service

# Apply Kubernetes configurations
Write-Host "Applying Kubernetes configurations..."
kubectl apply -f mongodb-deployment.yaml
kubectl apply -f auth-service-deployment.yaml
kubectl apply -f order-service-deployment.yaml
kubectl apply -f payment-service-deployment.yaml
kubectl apply -f delivery-service-deployment.yaml
kubectl apply -f restaurant-service-deployment.yaml
kubectl apply -f notification-service-deployment.yaml
kubectl apply -f api-gateway-deployment.yaml

# Wait for services to be ready
Write-Host "Waiting for services to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/mongodb
kubectl wait --for=condition=available --timeout=300s deployment/auth-service
kubectl wait --for=condition=available --timeout=300s deployment/order-service
kubectl wait --for=condition=available --timeout=300s deployment/payment-service
kubectl wait --for=condition=available --timeout=300s deployment/delivery-service
kubectl wait --for=condition=available --timeout=300s deployment/restaurant-service
kubectl wait --for=condition=available --timeout=300s deployment/notification-service
kubectl wait --for=condition=available --timeout=300s deployment/api-gateway

# Get the API Gateway URL
Write-Host "Getting API Gateway URL..."
minikube service api-gateway --url

Write-Host "Deployment completed!" 