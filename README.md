
## Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- Docker Desktop
- Kubernetes (Minikube)
- Git
- MongoDB Atlas account (for cloud database)
- Stripe account (for payments)
- Twilio account (for notifications)
- Gmail account (for email notifications)

## 1. Clone and Setup
```bash
git clone https://github.com/nadilliyanage/Food-Delivery-System.git
cd Food-Delivery-System
```

## 2. Local Development Deployment

### Backend Services
Open separate terminals for each service

#### Terminal 1 - API Gateway
```bash
cd backend/api-gateway
npm install
npm start
```

#### Terminal 2 - Authentication Service
```bash
cd backend/authentication-service
npm install
npm start
```

#### Terminal 3 - Restaurant Service
```bash
cd backend/restaurant-service
npm install
npm start
```

#### Terminal 4 - Order Service
```bash
cd backend/order-service
npm install
npm start
```

#### Terminal 5 - Payment Service
```bash
cd backend/payment-service
npm install
npm start
```

#### Terminal 6 - Delivery Service
```bash
cd backend/delivery-service
npm install
npm start
```

#### Terminal 7 - Notification Service
```bash
cd backend/notification-service
npm install
npm start
```

### Environment Configuration
For local development, update the .env files in each service with the following URLs:

#### api-gateway/.env
```
PORT=3000
AUTH_SERVICE_URL=http://localhost:3001
ORDER_SERVICE_URL=http://localhost:3002
RESTAURANT_SERVICE_URL=http://localhost:3003
DELIVERY_SERVICE_URL=http://localhost:3004
PAYMENT_SERVICE_URL=http://localhost:3005
NOTIFICATION_SERVICE_URL=http://localhost:3006
```

#### authentication-service/.env
```
PORT=3001
MONGO_URI=mongodb+srv://Nadil:Nadil111@cluster.tejhn.mongodb.net/Authentication?retryWrites=true&w=majority&appName=Cluster
JWT_SECRET=HGFHGEAD%D^ghggjhd%dsgj
```

#### order-service/.env
```
PORT=3002
MONGO_URI=mongodb+srv://Nadil:Nadil111@cluster.tejhn.mongodb.net/Order?retryWrites=true&w=majority&appName=Cluster
JWT_SECRET=HGFHGEAD%D^ghggjhd%dsgj
RESTAURANT_SERVICE_URL=http://localhost:3003
DELIVERY_SERVICE_URL=http://localhost:3004
NOTIFICATION_SERVICE_URL=http://localhost:3006
AUTH_SERVICE_URL=http://localhost:3001
PAYMENT_SERVICE_URL=http://localhost:3005
```

#### restaurant-service/.env
```
PORT=3003
MONGO_URI=mongodb+srv://Nadil:Nadil111@cluster.tejhn.mongodb.net/Restaurant?retryWrites=true&w=majority&appName=Cluster
JWT_SECRET=HGFHGEAD%D^ghggjhd%dsgj
```

#### delivery-service/.env
```
PORT=3004
MONGO_URI=mongodb+srv://Nadil:Nadil111@cluster.tejhn.mongodb.net/Delivery?retryWrites=true&w=majority&appName=Cluster
JWT_SECRET=HGFHGEAD%D^ghggjhd%dsgj
ORDER_SERVICE_URL=http://localhost:3002
AUTH_SERVICE_URL=http://localhost:3001
```

#### payment-service/.env
```
PORT=3005
MONGO_URI=mongodb+srv://Nadil:Nadil111@cluster.tejhn.mongodb.net/Payment?retryWrites=true&w=majority&appName=Cluster
JWT_SECRET=HGFHGEAD%D^ghggjhd%dsgj
ORDER_SERVICE_URL=http://localhost:3002
DELIVERY_SERVICE_URL=http://localhost:3004
STRIPE_SECRET_KEY=sk_test_51RGXpNPsJKAfjT1p5U66HxUeNUZMLmChoERLW9fF7U89LwPjK4ne9LCnPIqPdQQw7d5jOwRzI8c3G9UKoE4McA5g00qZjW7cnp
FRONTEND_URL=http://localhost:5173
```

#### notification-service/.env
```
PORT=3006
MONGO_URI=mongodb+srv://Nadil:Nadil111@cluster.tejhn.mongodb.net/Notification?retryWrites=true&w=majority&appName=Cluster
JWT_SECRET=HGFHGEAD%D^ghggjhd%dsgj
# Email Configurations
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=eatease.online@gmail.com
EMAIL_PASS=nutzgvmbmfbuuexe
# Twilio Configurations (For SMS & WhatsApp)
TWILIO_ACCOUNT_SID=AC9f4d7b04168f4407f1986917e63ff45d
TWILIO_AUTH_TOKEN=eddc82dbacdf5b2d687e6a37825ca743
TWILIO_PHONE_NUMBER=+17756183906
TWILIO_WHATSAPP_NUMBER=+14155238886
TWILIO_WHATSAPP_SANDBOX_NUMBER=+14155238886
```

## 3. Docker Deployment

### Start Docker Desktop
1. Open Docker Desktop
2. Wait for Docker to fully start
3. Verify Docker is running:
```bash
docker info
```

### Build and Run Services
```bash
# Build and run all services using Docker Compose
docker-compose up --build
```

## 4. Kubernetes Deployment

### Start Minikube
```bash
# Start Minikube
minikube start

# Verify Minikube status
minikube status

# Enable required addons
minikube addons enable ingress
minikube addons enable dashboard
```

### Build Docker Images
```bash
# Build images for each service
docker build -t api-gateway:latest ./backend/api-gateway
docker build -t auth-service:latest ./backend/authentication-service
docker build -t restaurant-service:latest ./backend/restaurant-service
docker build -t order-service:latest ./backend/order-service
docker build -t payment-service:latest ./backend/payment-service
docker build -t delivery-service:latest ./backend/delivery-service
docker build -t notification-service:latest ./backend/notification-service
```

### Deploy to Kubernetes
```bash
# Navigate to k8s directory
cd backend/k8s

# Deploy all services
./deploy.ps1

# Check deployment status
kubectl get pods
kubectl get services
```

### Access Services
```bash
# Get Minikube IP
minikube ip

# Get service URLs
kubectl get services
```

## 5. Frontend Deployment

### Local Development
```bash
cd frontend
npm install
npm run dev
```

### Production Build
```bash
cd frontend
npm install
npm run build
```

## 6. Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Stripe Documentation](https://stripe.com/docs)
- [Twilio Documentation](https://www.twilio.com/docs)

kubectl get pods
kubectl get services


5. Frontend Deployment

cd frontend
npm install
npm run dev
