# 🚀 Deployment Guide

This guide provides instructions for deploying the n8n clone to various environments, including Docker, Kubernetes, and cloud providers.

## 🐳 Docker Deployment

### Prerequisites
- Docker
- Docker Compose

### Steps
1.  **Build Docker images:**

    ```bash
    docker-compose -f docker-compose.yml build
    ```

2.  **Start containers:**

    ```bash
    docker-compose -f docker-compose.yml up -d
    ```

## ☸️ Kubernetes Deployment

### Prerequisites
- Kubernetes cluster
- Helm

### Helm Chart

A Helm chart is provided for easy deployment to Kubernetes.

```bash
helm install n8n-clone ./k8s/helm
```

### Kubernetes Manifests

Alternatively, you can use the raw Kubernetes manifests.

```bash
kubectl apply -f ./k8s/manifests
```

## ☁️ Cloud Deployment

### AWS
- **Infrastructure as Code**: Terraform scripts are provided for provisioning the required AWS resources.
- **Deployment**: Use the provided deployment scripts to deploy the application to an EKS cluster.

### Google Cloud
- **Infrastructure as Code**: Terraform scripts are provided for provisioning the required Google Cloud resources.
- **Deployment**: Use the provided deployment scripts to deploy the application to a GKE cluster.

### Azure
- **Infrastructure as Code**: Terraform scripts are provided for provisioning the required Azure resources.
- **Deployment**: Use the provided deployment scripts to deploy the application to an AKS cluster.

---

**Next**: [Monitoring & Observability](./13-monitoring.md)

