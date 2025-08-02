# N8N Clone - Azure Infrastructure
# This Terraform configuration provisions Azure resources for the N8N Clone

terraform {
  required_version = ">= 1.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

# Resource Group
resource "azurerm_resource_group" "n8n_clone_rg" {
  name     = "n8n-clone-rg"
  location = var.location
}

# Virtual Network
resource "azurerm_virtual_network" "n8n_clone_vnet" {
  name                = "n8n-clone-vnet"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.n8n_clone_rg.location
  resource_group_name = azurerm_resource_group.n8n_clone_rg.name
}

# Subnets
resource "azurerm_subnet" "n8n_clone_subnet" {
  name                 = "n8n-clone-subnet"
  resource_group_name  = azurerm_resource_group.n8n_clone_rg.name
  virtual_network_name = azurerm_virtual_network.n8n_clone_vnet.name
  address_prefixes     = ["10.0.1.0/24"]
}

# PostgreSQL Database
resource "azurerm_postgresql_flexible_server" "n8n_clone_postgres" {
  name                   = "n8n-clone-postgres"
  resource_group_name    = azurerm_resource_group.n8n_clone_rg.name
  location               = azurerm_resource_group.n8n_clone_rg.location

  administrator_login          = var.postgres_admin_username
  administrator_login_password = var.postgres_admin_password

  sku_name = "GP_Gen5_2"
  version  = "13"

  storage_mb             = 32768
  backup_retention_days  = 7
  geo_redundant_backup_enabled = false

  delegated_subnet_id = azurerm_subnet.n8n_clone_subnet.id

  lifecycle {
    create_before_destroy = true
  }
}

# Redis Cache
resource "azurerm_redis_cache" "n8n_clone_redis" {
  name                = "n8n-clone-redis"
  location            = azurerm_resource_group.n8n_clone_rg.location
  resource_group_name = azurerm_resource_group.n8n_clone_rg.name

  capacity           = 1
  family             = "C"
  sku_name           = "Standard"

  enable_non_ssl_port = false
  minimum_tls_version = "1.2"
}

# Kubernetes Cluster
resource "azurerm_kubernetes_cluster" "n8n_clone_aks" {
  name                = "n8n-clone-aks"
  location            = azurerm_resource_group.n8n_clone_rg.location
  resource_group_name = azurerm_resource_group.n8n_clone_rg.name

  default_node_pool {
    name       = "default"
    node_count = 3
    vm_size    = "Standard_DS2_v2"
  }

  identity {
    type = "SystemAssigned"
  }

  network_profile {
    network_plugin     = "azure"
    load_balancer_sku  = "standard"
  }
}
