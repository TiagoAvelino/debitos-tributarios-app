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

Create the GitHub credentials secret used by the final task to push the Helm
values update:

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

To enable SonarQube, set these `PipelineRun` params:

```yaml
- name: enable-sonarqube
  value: "true"
- name: sonar-host-url
  value: https://sonarqube.example.com
- name: sonar-project-key
  value: debitos-tributarios
- name: sonar-token-secret-name
  value: sonarqube-token
- name: sonar-token-secret-key
  value: token
```

The token should exist as a secret in the `debitos-tributarios` namespace:

```sh
oc -n debitos-tributarios create secret generic sonarqube-token --from-literal=token=your-token
```

After the run succeeds, the Helm values file in Git will point to the new image:

```yaml
image:
  repository: image-registry.openshift-image-registry.svc:5000/debitos-tributarios/debitos-tributarios
  tag: "<commit-sha>"
```

Then the pipeline asks Argo CD to sync the `debitos-tributarios` application at
that new Git commit.
