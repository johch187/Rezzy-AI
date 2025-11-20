# Deployment Guide

This guide outlines the process for deploying the Keju frontend application to **Google Cloud Run** using the provided **GitHub Actions** workflow. This setup enables Continuous Integration and Continuous Deployment (CI/CD).

## 1. Prerequisites

Before you begin, you will need:
-   A [Google Cloud Platform (GCP) account](https://cloud.google.com/) with billing enabled.
-   A [GitHub account](https://github.com/) and a repository containing the Keju application code.
-   [gcloud CLI](https://cloud.google.com/sdk/docs/install) installed on your local machine (for initial setup).
-   [Docker](https://www.docker.com/products/docker-desktop/) installed on your local machine (for testing).

## 2. Google Cloud Platform Setup

Follow these steps to prepare your GCP environment.

### Step 2.1: Create a Project
If you don't have one already, create a new GCP project. Note your **Project ID**.

### Step 2.2: Enable APIs
You need to enable a few services for your project. You can do this via the GCP Console or the gcloud CLI.

```bash
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable iam.googleapis.com
```

### Step 2.3: Create an Artifact Registry Repository
This is where your Docker images will be stored.

```bash
gcloud artifacts repositories create your-repo-name \
    --repository-format=docker \
    --location=your-region # e.g., us-central1
```
-   Replace `your-repo-name` with a name for your repository (e.g., `keju-images`).
-   Replace `your-region` with a region like `us-central1`.

Your repository path will look like this: `your-region-docker.pkg.dev/your-project-id/your-repo-name`.

### Step 2.4: Create a Service Account
Create a dedicated service account for GitHub Actions to use for deployment.

1.  **Create the account:**
    ```bash
    gcloud iam service-accounts create github-deployer \
        --display-name="GitHub Actions Deployer"
    ```
2.  **Grant permissions:** Assign the necessary roles to the service account.
    ```bash
    # Allows deploying to Cloud Run
    gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
        --member="serviceAccount:github-deployer@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
        --role="roles/run.admin"

    # Allows pushing images to Artifact Registry
    gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
        --member="serviceAccount:github-deployer@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
        --role="roles/artifactregistry.writer"

    # Allows the service account to be impersonated by other services (like Cloud Build)
    gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
        --member="serviceAccount:github-deployer@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
        --role="roles/iam.serviceAccountUser"
    ```
    Replace `YOUR_PROJECT_ID` with your actual project ID.

3.  **Create and download a JSON key:** This key will be used by GitHub Actions to authenticate.
    ```bash
    gcloud iam service-accounts keys create github-key.json \
        --iam-account="github-deployer@YOUR_PROJECT_ID.iam.gserviceaccount.com"
    ```
    This will download a file named `github-key.json`. **Keep this file secure.**

## 3. GitHub Repository Setup

Navigate to your GitHub repository and go to `Settings` > `Secrets and variables` > `Actions`.

### Step 3.1: Add Repository Secrets
Create the following repository secrets. These values correspond to the placeholders in the `.github/workflows/deploy.yml` file.

-   `GCP_PROJECT_ID`:
    -   Your Google Cloud Project ID.

-   `GCP_SERVICE_ACCOUNT_KEY`:
    -   Open the `github-key.json` file you downloaded. Copy the **entire contents** of the file and paste it as the value for this secret.

-   `AR_REPOSITORY`:
    -   The full path to your Artifact Registry repository from Step 2.3.
    -   Example: `us-central1-docker.pkg.dev/my-gcp-project-123/keju-images`

-   `CLOUD_RUN_SERVICE_NAME`:
    -   The name you want for your Cloud Run service.
    -   Example: `keju-frontend`

-   `CLOUD_RUN_REGION`:
    -   The GCP region where your service will be deployed. This should match the region of your Artifact Registry.
    -   Example: `us-central1`

## 4. How the Deployment Works

With the setup complete, the CI/CD pipeline is ready.

1.  **Trigger:** When you push new code to the `main` branch of your repository, the GitHub Actions workflow defined in `.github/workflows/deploy.yml` will automatically start.
2.  **Authentication:** The workflow authenticates with Google Cloud using the service account key you provided.
3.  **Build:** It builds a Docker image of your React application using the `Dockerfile` in the repository. This image contains your compiled static files and an Nginx web server.
4.  **Push:** The newly built Docker image is tagged with the commit SHA and pushed to your Artifact Registry repository.
5.  **Deploy:** The workflow instructs Google Cloud Run to deploy a new revision of your service using the image that was just pushed. The `--allow-unauthenticated` flag makes the service publicly accessible.

After a few minutes, your application will be live at the URL provided by Cloud Run. You can find this URL in the GitHub Actions logs or in the GCP Console under Cloud Run.
