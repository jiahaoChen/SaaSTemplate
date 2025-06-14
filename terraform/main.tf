provider "google" {
  project = var.project_id
  region  = var.region
}

resource "google_project_service" "container" {
  service = "container.googleapis.com"
}

resource "google_project_service" "containerregistry" {
  service = "containerregistry.googleapis.com"
}

resource "google_project_service" "cloudbuild" {
  service = "cloudbuild.googleapis.com"
}

# Create GKE cluster
resource "google_container_cluster" "primary" {
  name     = var.cluster_name
  location = var.zone
  
  # We can't create a cluster with no node pool defined, but we want to only use
  # separately managed node pools. So we create the smallest possible default
  # node pool and immediately delete it.
  remove_default_node_pool = true
  initial_node_count       = 1

  depends_on = [
    google_project_service.container
  ]
}

resource "google_container_node_pool" "primary_nodes" {
  name       = "${var.cluster_name}-node-pool"
  location   = var.zone
  cluster    = google_container_cluster.primary.name
  node_count = var.node_count

  node_config {
    machine_type = var.machine_type
    oauth_scopes = [
      "https://www.googleapis.com/auth/logging.write",
      "https://www.googleapis.com/auth/monitoring",
      "https://www.googleapis.com/auth/devstorage.read_only",
    ]

    labels = {
      env = var.environment
    }
  }
}

# Create static IP address
resource "google_compute_global_address" "default" {
  name = "app-static-ip"
}

# Create service account for GitHub Actions
resource "google_service_account" "github_actions" {
  account_id   = "github-actions-deployer"
  display_name = "GitHub Actions Deployer"
}

# Assign roles to the service account
resource "google_project_iam_binding" "container_developer" {
  project = var.project_id
  role    = "roles/container.developer"
  members = [
    "serviceAccount:${google_service_account.github_actions.email}"
  ]
}

resource "google_project_iam_binding" "storage_admin" {
  project = var.project_id
  role    = "roles/storage.admin"
  members = [
    "serviceAccount:${google_service_account.github_actions.email}"
  ]
}

# Generate a key for the service account
resource "google_service_account_key" "github_actions_key" {
  service_account_id = google_service_account.github_actions.name
}

# Output the key for use in GitHub Actions
output "github_actions_key" {
  value     = google_service_account_key.github_actions_key.private_key
  sensitive = true
}

# Output the static IP for DNS configuration
output "static_ip" {
  value = google_compute_global_address.default.address
} 