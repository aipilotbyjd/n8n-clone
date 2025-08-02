# Azure Outputs

output "resource_group_name" {
  description = "Name of the resource group"
  value       = azurerm_resource_group.n8n_clone_rg.name
}

output "aks_cluster_name" {
  description = "Name of the AKS cluster"
  value       = azurerm_kubernetes_cluster.n8n_clone_aks.name
}

output "aks_cluster_endpoint" {
  description = "Endpoint for the AKS cluster"
  value       = azurerm_kubernetes_cluster.n8n_clone_aks.kube_config[0].host
  sensitive   = true
}

output "postgres_server_name" {
  description = "Name of the PostgreSQL server"
  value       = azurerm_postgresql_flexible_server.n8n_clone_postgres.name
}

output "postgres_connection_string" {
  description = "PostgreSQL connection string"
  value       = "postgresql://${var.postgres_admin_username}@${azurerm_postgresql_flexible_server.n8n_clone_postgres.name}:${var.postgres_admin_password}@${azurerm_postgresql_flexible_server.n8n_clone_postgres.fqdn}:5432/n8n_clone"
  sensitive   = true
}

output "redis_hostname" {
  description = "Redis cache hostname"
  value       = azurerm_redis_cache.n8n_clone_redis.hostname
}

output "redis_port" {
  description = "Redis cache port"
  value       = azurerm_redis_cache.n8n_clone_redis.ssl_port
}

output "redis_access_key" {
  description = "Redis cache primary access key"
  value       = azurerm_redis_cache.n8n_clone_redis.primary_access_key
  sensitive   = true
}
