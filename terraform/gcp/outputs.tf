# GCP Outputs

output "gke_cluster_name" {
  description = "Name of the GKE cluster"
  value       = google_container_cluster.n8n_clone_gke.name
}

output "gke_cluster_endpoint" {
  description = "Endpoint for the GKE cluster"
  value       = google_container_cluster.n8n_clone_gke.endpoint
  sensitive   = true
}

output "postgres_instance_name" {
  description = "Name of the PostgreSQL instance"
  value       = google_sql_database_instance.n8n_clone_postgres.name
}

output "postgres_connection_name" {
  description = "PostgreSQL connection name"
  value       = google_sql_database_instance.n8n_clone_postgres.connection_name
}

output "postgres_ip_address" {
  description = "PostgreSQL instance IP address"
  value       = google_sql_database_instance.n8n_clone_postgres.ip_address[0].ip_address
}

output "postgres_connection_string" {
  description = "PostgreSQL connection string"
  value       = "postgresql://${var.postgres_user}:${var.postgres_password}@${google_sql_database_instance.n8n_clone_postgres.ip_address[0].ip_address}:5432/${google_sql_database.n8n_clone_database.name}"
  sensitive   = true
}

output "redis_host" {
  description = "Redis instance host"
  value       = google_redis_instance.n8n_clone_redis.host
}

output "redis_port" {
  description = "Redis instance port"
  value       = google_redis_instance.n8n_clone_redis.port
}

output "vpc_name" {
  description = "Name of the VPC"
  value       = google_compute_network.n8n_clone_vpc.name
}

output "subnet_name" {
  description = "Name of the subnet"
  value       = google_compute_subnetwork.n8n_clone_subnet.name
}
