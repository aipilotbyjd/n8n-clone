# AWS Variables

variable "aws_region" {
  description = "AWS region where resources will be created"
  type        = string
  default     = "us-west-2"
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

# VPC Configuration
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.3.0/24", "10.0.4.0/24"]
}

# EKS Configuration
variable "kubernetes_version" {
  description = "Kubernetes version for EKS cluster"
  type        = string
  default     = "1.26"
}

variable "cluster_endpoint_public_access_cidrs" {
  description = "CIDR blocks that can access the Amazon EKS public API server endpoint"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "node_instance_types" {
  description = "Instance types for EKS node group"
  type        = list(string)
  default     = ["t3.medium"]
}

variable "node_capacity_type" {
  description = "Capacity type for EKS node group"
  type        = string
  default     = "ON_DEMAND"
}

variable "node_desired_size" {
  description = "Desired size of EKS node group"
  type        = number
  default     = 3
}

variable "node_max_size" {
  description = "Maximum size of EKS node group"
  type        = number
  default     = 5
}

variable "node_min_size" {
  description = "Minimum size of EKS node group"
  type        = number
  default     = 1
}

# PostgreSQL Configuration
variable "postgres_version" {
  description = "PostgreSQL version"
  type        = string
  default     = "13.11"
}

variable "postgres_instance_class" {
  description = "PostgreSQL instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "postgres_allocated_storage" {
  description = "PostgreSQL allocated storage in GB"
  type        = number
  default     = 20
}

variable "postgres_max_allocated_storage" {
  description = "PostgreSQL maximum allocated storage in GB"
  type        = number
  default     = 100
}

variable "postgres_db_name" {
  description = "PostgreSQL database name"
  type        = string
  default     = "n8n_clone"
}

variable "postgres_username" {
  description = "PostgreSQL username"
  type        = string
  default     = "n8n_user"
}

variable "postgres_password" {
  description = "PostgreSQL password"
  type        = string
  sensitive   = true
}

variable "postgres_backup_retention_period" {
  description = "PostgreSQL backup retention period in days"
  type        = number
  default     = 7
}

variable "postgres_backup_window" {
  description = "PostgreSQL backup window"
  type        = string
  default     = "03:00-04:00"
}

variable "postgres_maintenance_window" {
  description = "PostgreSQL maintenance window"
  type        = string
  default     = "sun:04:00-sun:05:00"
}

variable "postgres_skip_final_snapshot" {
  description = "Skip final snapshot when deleting PostgreSQL instance"
  type        = bool
  default     = true
}

variable "postgres_deletion_protection" {
  description = "Enable deletion protection for PostgreSQL instance"
  type        = bool
  default     = false
}

# Redis Configuration
variable "redis_node_type" {
  description = "Redis node type"
  type        = string
  default     = "cache.t3.micro"
}

variable "redis_num_cache_nodes" {
  description = "Number of Redis cache nodes"
  type        = number
  default     = 1
}
