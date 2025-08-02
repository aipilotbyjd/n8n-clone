# GCP Variables

variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region where resources will be created"
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "GCP zone where resources will be created"
  type        = string
  default     = "us-central1-a"
}

variable "credentials_file_path" {
  description = "Path to the GCP service account credentials file"
  type        = string
  default     = "credentials.json"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "n8n-clone"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "development"
}

# PostgreSQL Configuration
variable "postgres_user" {
  description = "PostgreSQL username"
  type        = string
  default     = "n8n_user"
}

variable "postgres_password" {
  description = "PostgreSQL password"
  type        = string
  sensitive   = true
}

variable "postgres_version" {
  description = "PostgreSQL version"
  type        = string
  default     = "POSTGRES_13"
}

# GKE Configuration
variable "kubernetes_version" {
  description = "Kubernetes version for GKE cluster"
  type        = string
  default     = "1.26"
}

variable "node_count" {
  description = "Number of nodes in the GKE cluster"
  type        = number
  default     = 3
}

variable "machine_type" {
  description = "Machine type for GKE nodes"
  type        = string
  default     = "e2-medium"
}

# Redis Configuration
variable "redis_memory_size_gb" {
  description = "Redis memory size in GB"
  type        = number
  default     = 1
}

variable "redis_tier" {
  description = "Redis service tier"
  type        = string
  default     = "BASIC"
}
