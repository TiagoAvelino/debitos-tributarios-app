# OpenShift Pipeline

This pipeline builds the React/Vite frontend image and hands deployment to Argo CD
by updating the Helm image values in Git:

1. Clone the Git repository.
2. Install frontend dependencies with `npm ci`.
3. Run `npm audit`.
4. Lint the Dockerfile with Hadolint.
5. Build the frontend with Vite.
6. Optionally scan the project with SonarQube.
7. Build and push the image with Buildah.
8. Commit and push the new image `repository` and `tag` to the Helm values file.
9. Refresh, sync, and wait for the Argo CD application.

Argo CD should watch the same Git repository and deploy the Helm chart after this
pipeline pushes the image update.

Apply the pipeline resources:

```sh
oc apply -f openshift/pipeline.yaml
```

Install SonarQube in the same namespace:

```sh
oc -n debitos-tributarios create secret docker-registry dockerhub-pull-secret \
  --docker-server=docker.io \
  --docker-username=YOUR_DOCKERHUB_USERNAME \
  --docker-password=YOUR_DOCKERHUB_TOKEN_OR_PASSWORD \
  --docker-email=YOUR_EMAIL
oc apply -f openshift/sonarqube.yaml
oc -n debitos-tributarios rollout status deployment/sonarqube-postgresql
oc -n debitos-tributarios rollout status deployment/sonarqube
```

The Docker Hub pull secret is needed because the official SonarQube server image
and some CI helper images are published from Docker Hub and anonymous cluster
pulls can hit rate limits. The application Dockerfile itself uses OpenShift
internal base images so Buildah can push to the internal registry with the
pipeline service account.

The repository is public, so cloning does not require credentials. The final
GitOps task still needs GitHub write credentials because it commits and pushes
the new Helm image tag back to the repository:

```sh
oc -n debitos-tributarios create secret generic github-credentials \
  --from-literal=username=YOUR_GITHUB_USERNAME \
  --from-literal=token=YOUR_GITHUB_TOKEN
```

Create the Argo CD token secret used by the sync task:

```sh
oc -n debitos-tributarios create secret generic argocd-token \
  --from-literal=token=YOUR_ARGOCD_AUTH_TOKEN
```

Start a pipeline run:

```sh
oc create -f openshift/pipelinerun.yaml
```

The default Git repository is:

```text
https://github.com/TiagoAvelino/debitos-tributarios-app.git
```

That repository keeps the app at the repository root, so the default
`app-subdir` is `.`.

SonarQube is enabled by default and the pipeline uses the in-namespace service:

```yaml
- name: sonar-host-url
  value: http://sonarqube:9000
```

Create a SonarQube token from the SonarQube UI, then store it for the scanner:

The default first login for this SonarQube container is `admin` / `admin`.
SonarQube will ask you to change the password before you generate a token.

```sh
oc -n debitos-tributarios create secret generic sonarqube-token --from-literal=token=your-token
```

The SonarQube route for setup is:

```sh
oc -n debitos-tributarios get route sonarqube
```

To disable SonarQube for a run, set this `PipelineRun` param:

```yaml
- name: enable-sonarqube
  value: "false"
```

After the run succeeds, the Helm values file in Git will point to the new image:

```yaml
image:
  repository: image-registry.openshift-image-registry.svc:5000/debitos-tributarios/debitos-tributarios
  tag: "<commit-sha>"
```

Then the pipeline asks Argo CD to sync the `debitos-tributarios` application at
that new Git commit.
