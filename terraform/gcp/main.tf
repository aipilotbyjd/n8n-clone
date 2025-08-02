# N8N Clone - GCP Infrastructure
# This Terraform configuration provisions GCP resources for the N8N Clone

terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
}

provider "google" {
  credentials = file(var.credentials_file_path)
  project     = var.project_id
  region      = var.region
}

# VPC
resource "google_compute_network" "n8n_clone_vpc" {
  name                    = "n8n-clone-vpc"
  auto_create_subnetworks = false
}

# Subnet
resource "google_compute_subnetwork" "n8n_clone_subnet" {
  name          = "n8n-clone-subnet"
  ip_cidr_range = "10.0.0.0/16"
  region        = var.region
  network       = google_compute_network.n8n_clone_vpc.id
}

# PostgreSQL Database
resource "google_sql_database_instance" "n8n_clone_postgres" {
  name             = "n8n-clone-postgres"
  database_version = "POSTGRES_13"
  region           = var.region

  settings {
    tier = "db-custom-1-3840"
    ip_configuration {
      ipv4_enabled = true
    }
  }

  deletion_protection = false
}

resource "google_sql_database" "n8n_clone_database" {
  name     = "n8n_clone_db"
  instance = google_sql_database_instance.n8n_clone_postgres.name
}

resource "google_sql_user" "n8n_clone_user" {
  name     = var.postgres_user
  instance = google_sql_database_instance.n8n_clone_postgres.name
  password = var.postgres_password
}

# Redis Instance
resource "google_redis_instance" "n8n_clone_redis" {
  name           = "n8n-clone-redis"
  tier           = "BASIC"
  memory_size_gb = 1
  region         = var.region
}

# Kubernetes
resource "google_container_cluster" "n8n_clone_gke" {
  name     = "n8n-clone-gke"
  location = var.region

  initial_node_count = var.node_count

  node_config {
    machine_type = "e2-medium"
  }

autoscaling {
    max_node_count = 5
    min_node_count = 1
  }

}

