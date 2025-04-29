# 📖 Food Delivery System Deployment Guide

## 🛠️ Prerequisites

Before you begin, ensure you have the following tools installed:

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | v14+ | Runtime environment |
| npm | v6+ | Package manager |
| Docker Desktop | Latest | Containerization |
| Kubernetes (Minikube) | Latest | Container orchestration |
| Git | Latest | Version control |
| MongoDB Atlas | - | Cloud database |
| Stripe | - | Payment processing |
| Twilio | - | Notifications |
| Gmail | - | Email notifications |

## 📥 Initial Setup

```bash
# Clone the repository
git clone https://github.com/nadilliyanage/Food-Delivery-System.git

# Navigate to project directory
cd Food-Delivery-System
```

## 🏗️ Local Development

### Backend Services Setup

Each service runs on its own port. Open separate terminals for each service:

| Service | Port | Command |
|---------|------|---------|
| API Gateway | 3000 | `cd backend/api-gateway && npm install && npm start` |
| Authentication | 3001 | `cd backend/authentication-service && npm install && npm start` |
| Restaurant | 3003 | `cd backend/restaurant-service && npm install && npm start` |
| Order | 3002 | `cd backend/order-service && npm install && npm start` |
| Payment | 3005 | `cd backend/payment-service && npm install && npm start` |
| Delivery | 3004 | `cd backend/delivery-service && npm install && npm start` |
| Notification | 3006 | `cd backend/notification-service && npm install && npm start` |

### Environment Configuration

Create `.env` files in each service directory with the following configurations:

#### 🔑 API Gateway (.env)
```env
PORT=3000
AUTH_SERVICE_URL=http://localhost:3001
ORDER_SERVICE_URL=http://localhost:3002
RESTAURANT_SERVICE_URL=http://localhost:3003
DELIVERY_SERVICE_URL=http://localhost:3004
PAYMENT_SERVICE_URL=http://localhost:3005
NOTIFICATION_SERVICE_URL=http://localhost:3006
```

#### 🔐 Authentication Service (.env)
```env
PORT=3001
MONGO_URI=mongodb+srv://Nadil:Nadil111@cluster.tejhn.mongodb.net/Authentication?retryWrites=true&w=majority&appName=Cluster
JWT_SECRET=HGFHGEAD%D^ghggjhd%dsgj
```

#### 🍽️ Restaurant Service (.env)
```env
PORT=3003
MONGO_URI=mongodb+srv://Nadil:Nadil111@cluster.tejhn.mongodb.net/Restaurant?retryWrites=true&w=majority&appName=Cluster
JWT_SECRET=HGFHGEAD%D^ghggjhd%dsgj
```

#### 📦 Order Service (.env)
```env
PORT=3002
MONGO_URI=mongodb+srv://Nadil:Nadil111@cluster.tejhn.mongodb.net/Order?retryWrites=true&w=majority&appName=Cluster
JWT_SECRET=HGFHGEAD%D^ghggjhd%dsgj
RESTAURANT_SERVICE_URL=http://localhost:3003
DELIVERY_SERVICE_URL=http://localhost:3004
NOTIFICATION_SERVICE_URL=http://localhost:3006
AUTH_SERVICE_URL=http://localhost:3001
PAYMENT_SERVICE_URL=http://localhost:3005
```

#### 💳 Payment Service (.env)
```env
PORT=3005
MONGO_URI=mongodb+srv://Nadil:Nadil111@cluster.tejhn.mongodb.net/Payment?retryWrites=true&w=majority&appName=Cluster
JWT_SECRET=HGFHGEAD%D^ghggjhd%dsgj
ORDER_SERVICE_URL=http://localhost:3002
DELIVERY_SERVICE_URL=http://localhost:3004
STRIPE_SECRET_KEY=sk_test_51RGXpNPsJKAfjT1p5U66HxUeNUZMLmChoERLW9fF7U89LwPjK4ne9LCnPIqPdQQw7d5jOwRzI8c3G9UKoE4McA5g00qZjW7cnp
FRONTEND_URL=http://localhost:5173
```

#### 🚚 Delivery Service (.env)
```env
PORT=3004
MONGO_URI=mongodb+srv://Nadil:Nadil111@cluster.tejhn.mongodb.net/Delivery?retryWrites=true&w=majority&appName=Cluster
JWT_SECRET=HGFHGEAD%D^ghggjhd%dsgj
ORDER_SERVICE_URL=http://localhost:3002
AUTH_SERVICE_URL=http://localhost:3001
```

#### 📱 Notification Service (.env)
```env
PORT=3006
MONGO_URI=mongodb+srv://Nadil:Nadil111@cluster.tejhn.mongodb.net/Notification?retryWrites=true&w=majority&appName=Cluster
JWT_SECRET=HGFHGEAD%D^ghggjhd%dsgj
# Email Configurations
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=eatease.online@gmail.com
EMAIL_PASS=nutzgvmbmfbuuexe
# Twilio Configurations
TWILIO_ACCOUNT_SID=AC9f4d7b04168f4407f1986917e63ff45d
TWILIO_AUTH_TOKEN=eddc82dbacdf5b2d687e6a37825ca743
TWILIO_PHONE_NUMBER=+17756183906
TWILIO_WHATSAPP_NUMBER=+14155238886
TWILIO_WHATSAPP_SANDBOX_NUMBER=+14155238886
```

## 🐳 Docker Deployment

### 1. Start Docker Desktop
- Open Docker Desktop application
- Wait for the Docker engine to start
- Verify Docker is running:
```bash
docker info
```

### 2. Build and Run Services
```bash
# Build and run all services
docker-compose up --build
```

## ⚓ Kubernetes Deployment

### 1. Start Minikube
```bash
# Start Minikube cluster
minikube start

# Verify cluster status
minikube status

# Enable required addons
minikube addons enable ingress
minikube addons enable dashboard
```

### 2. Build Docker Images
```bash
# Build service images
docker build -t api-gateway:latest ./backend/api-gateway
docker build -t auth-service:latest ./backend/authentication-service
docker build -t restaurant-service:latest ./backend/restaurant-service
docker build -t order-service:latest ./backend/order-service
docker build -t payment-service:latest ./backend/payment-service
docker build -t delivery-service:latest ./backend/delivery-service
docker build -t notification-service:latest ./backend/notification-service
```

### 3. Deploy to Kubernetes
```bash
# Navigate to k8s directory
cd backend/k8s

# Deploy all services
./deploy.ps1

# Monitor deployment
kubectl get pods
kubectl get services
```

### 4. Access Services
```bash
# Get Minikube IP
minikube ip

# View service URLs
kubectl get services
```

## 🎨 Frontend Deployment

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

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Stripe Documentation](https://stripe.com/docs)
- [Twilio Documentation](https://www.twilio.com/docs)

## 🔍 Troubleshooting

### Common Issues

1. **Docker not starting**
   - Check if virtualization is enabled in BIOS
   - Ensure Docker Desktop is running
   - Restart Docker Desktop

2. **Minikube issues**
   - Run `minikube delete` and `minikube start` to reset
   - Check if Hyper-V is enabled
   - Verify system resources

3. **Service connection issues**
   - Check if all services are running
   - Verify environment variables
   - Check service logs

### Useful Commands

```bash
# Check service logs
kubectl logs <pod-name>

# Describe service
kubectl describe service <service-name>

# Get pod details
kubectl describe pod <pod-name>

# Check service status
kubectl get services
kubectl get pods
```

## 🎯 Best Practices

1. Always check service logs for errors
2. Keep environment variables secure
3. Regularly update dependencies
4. Monitor system resources
5. Backup database regularly
6. Test all services after deployment
7. Keep documentation updated
