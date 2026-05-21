# Débitos Tributários (demo)

Aplicação React de demonstração para **emissão** e **consulta** de débitos tributários, empacotada com Docker e implantável via **Helm** em Kubernetes/OpenShift.

## Funcionalidades

- **Emissão**: formulário para lançar débito (contribuinte, CPF/CNPJ, tributo, valor, vencimento).
- **Consulta**: filtros por número, documento, tributo e status; detalhe ao clicar na linha.
- Dados de exemplo pré-carregados; novos débitos ficam em memória no navegador (simulação).

## Desenvolvimento local

```bash
cd frontend
npm install
npm run dev
```

Acesse http://localhost:5173

## Build da imagem Docker

```bash
cd debitos-tributarios
docker build -t debitos-tributarios:1.0.0 .
```

## Deploy com Helm

```bash
# Instalar no namespace default (ajuste conforme seu cluster)
helm install debitos ./helm/debitos-tributarios

# Com port-forward para testar
kubectl port-forward svc/debitos-debitos-tributarios 8080:80
# http://localhost:8080
```

### Valores úteis

```bash
# Habilitar Ingress
helm install debitos ./helm/debitos-tributarios \
  --set ingress.enabled=true \
  --set ingress.className=nginx

# Imagem customizada (registry do cluster)
helm upgrade debitos ./helm/debitos-tributarios \
  --set image.repository=registry.example.com/debitos-tributarios \
  --set image.tag=1.0.0
```

## Estrutura

```
debitos-tributarios/
├── frontend/          # React + Vite
├── Dockerfile
├── nginx.conf
└── helm/debitos-tributarios/
```

## OpenShift

Após build e push da imagem para o ImageStream/registry do cluster:

```bash
helm install debitos ./helm/debitos-tributarios \
  --set image.repository=image-registry.openshift-image-registry.svc:5000/seu-projeto/debitos-tributarios \
  --set image.tag=latest
```
