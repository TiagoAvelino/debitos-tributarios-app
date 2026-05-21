# OpenShift Pipeline

This pipeline builds and deploys the React/Vite frontend with a small CI/CD gate:

1. Clone the Git repository.
2. Install frontend dependencies with `npm ci`.
3. Run `npm audit`.
4. Lint the Dockerfile with Hadolint.
5. Build the frontend with Vite.
6. Optionally scan the project with SonarQube.
7. Build and push the image with Buildah.
8. Deploy the existing Helm chart with an OpenShift Route enabled.
9. Verify the rollout and print the route URL.

Apply the pipeline resources:

```sh
oc apply -f openshift/pipeline.yaml
```

Start a deployment from a Git repository:

```sh
oc create -f openshift/pipelinerun.yaml
```

Before creating the `PipelineRun`, replace `spec.params.git-url` in
`openshift/pipelinerun.yaml` with the real Git URL for the repository that
contains this directory.

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

After the run succeeds, get the frontend URL:

```sh
oc get route debitos-tributarios -n debitos-tributarios
```
