SHELL := /bin/bash
.DEFAULT_GOAL := help

IMAGE_TAG ?= local
IMAGE_REGISTRY ?= local
ECR_REPOSITORY ?= ministry-of-justice-developer-portal
IMAGE_URI ?= $(IMAGE_REGISTRY)/$(ECR_REPOSITORY):$(IMAGE_TAG)
KUBE_NAMESPACE_DEV ?= developer-portal-dev
KUBE_NAMESPACE_PROD ?= developer-portal-prod
DEV_URL ?= https://dev.developer-portal.service.justice.gov.uk/healthz
PROD_URL ?= https://developer-portal.service.justice.gov.uk/healthz

.PHONY: help install ingest ingest-dry-run build validate docker-build docker-run k8s-apply-dev k8s-apply-prod smoke-dev smoke-prod

help:
	@echo "Common tasks:"
	@echo "  make install           - Install dependencies"
	@echo "  make ingest            - Ingest all sources"
	@echo "  make ingest-dry-run    - Preview ingestion changes"
	@echo "  make build             - Build static site + pagefind"
	@echo "  make validate          - Run markdown/yaml/typescript validation"
	@echo "  make docker-build      - Build container image (IMAGE_URI=...)"
	@echo "  make docker-run        - Run container locally on :8080"
	@echo "  make k8s-apply-dev     - Apply dev manifests with IMAGE_URI"
	@echo "  make k8s-apply-prod    - Apply prod manifests with IMAGE_URI"
	@echo "  make smoke-dev         - Smoke test dev health endpoint"
	@echo "  make smoke-prod        - Smoke test prod health endpoint"

install:
	npm ci

ingest:
	node scripts/ingest.mjs

ingest-dry-run:
	node scripts/ingest.mjs --dry-run

build:
	npm run build

validate:
	npm run validate:all

docker-build:
	docker build -t "$(IMAGE_URI)" .

docker-run:
	docker run --rm -p 8080:8080 "$(IMAGE_URI)"

k8s-apply-dev:
	sed -e "s|IMAGE_PLACEHOLDER|$(IMAGE_URI)|g" -e "s|^\([[:space:]]*namespace:\)[[:space:]]*.*$|\1 $(KUBE_NAMESPACE_DEV)|" k8s/dev/deployment.yaml | kubectl apply -f -
	kubectl rollout status deployment/developer-portal --namespace "$(KUBE_NAMESPACE_DEV)" --timeout=180s

k8s-apply-prod:
	sed -e "s|IMAGE_PLACEHOLDER|$(IMAGE_URI)|g" -e "s|^\([[:space:]]*namespace:\)[[:space:]]*.*$|\1 $(KUBE_NAMESPACE_PROD)|" k8s/prod/deployment.yaml | kubectl apply -f -
	kubectl rollout status deployment/developer-portal --namespace "$(KUBE_NAMESPACE_PROD)" --timeout=180s

smoke-dev:
	@HTTP_CODE=$$(curl -sS -o /tmp/dev-smoke.out -w "%{http_code}" "$(DEV_URL)"); \
	if [ "$$HTTP_CODE" != "200" ]; then \
		echo "Expected HTTP 200 from dev smoke test, got $$HTTP_CODE"; \
		cat /tmp/dev-smoke.out; \
		exit 1; \
	fi
	@grep -Eq '^ok$$' /tmp/dev-smoke.out

smoke-prod:
	@HTTP_CODE=$$(curl -sS -o /tmp/prod-smoke.out -w "%{http_code}" "$(PROD_URL)"); \
	if [ "$$HTTP_CODE" != "200" ]; then \
		echo "Expected HTTP 200 from prod smoke test, got $$HTTP_CODE"; \
		cat /tmp/prod-smoke.out; \
		exit 1; \
	fi
	@grep -Eq '^ok$$' /tmp/prod-smoke.out
