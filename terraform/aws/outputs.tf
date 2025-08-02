# AWS Outputs

output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.n8n_clone_vpc.id
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = aws_subnet.public_subnets[*].id
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = aws_subnet.private_subnets[*].id
}

output "eks_cluster_name" {
  description = "Name of the EKS cluster"
  value       = aws_eks_cluster.n8n_clone_cluster.name
}

output "eks_cluster_endpoint" {
  description = "Endpoint for the EKS cluster"
  value       = aws_eks_cluster.n8n_clone_cluster.endpoint
  sensitive   = true
}

output "eks_cluster_security_group_id" {
  description = "Security group ID attached to the EKS cluster"
  value       = aws_eks_cluster.n8n_clone_cluster.vpc_config[0].cluster_security_group_id
}

output "postgres_endpoint" {
  description = "RDS PostgreSQL endpoint"
  value       = aws_db_instance.n8n_clone_postgres.endpoint
}

output "postgres_port" {
  description = "RDS PostgreSQL port"
  value       = aws_db_instance.n8n_clone_postgres.port
}

output "postgres_connection_string" {
  description = "PostgreSQL connection string"
  value       = "postgresql://${var.postgres_username}:${var.postgres_password}@${aws_db_instance.n8n_clone_postgres.endpoint}:${aws_db_instance.n8n_clone_postgres.port}/${var.postgres_db_name}"
  sensitive   = true
}

output "redis_endpoint" {
  description = "ElastiCache Redis endpoint"
  value       = aws_elasticache_replication_group.n8n_clone_redis.primary_endpoint_address
}

output "redis_port" {
  description = "ElastiCache Redis port"
  value       = aws_elasticache_replication_group.n8n_clone_redis.port
}
