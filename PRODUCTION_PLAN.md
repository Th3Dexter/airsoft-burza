# Plán pro observabilitu, load testy a CI/CD

## Observabilita a logování
- **Centralizované logování:** nasadit např. ELK/EFK stack nebo hosted službu (Datadog, Logtail). Aplikace by měla zapisovat strukturované JSON logy (úroveň info/warn/error) – doplnit middleware pro logování requestů a chyb.
- **APM/Tracing:** zvážit použití OpenTelemetry SDK s exportem do Promethea, Jaeger nebo komerční APM. Zachytávat klíčové metriky (latence API, chybovost, spotřeba DB poolu).
- **Metriky:** nasadit Prometheus/Grafana, sledovat CPU/RAM instancí, počet aktivních spojení do DB, využití Redis cache, délky front (pokud budou background joby).
- **Alerting:** definovat prahové hodnoty (latence API > 1 s, chybovost > 1 %, neúspěšné cron joby) a napojit na Slack/Email.

## Load testy
- **Scénáře:** nejdůležitější jsou registrace/přihlášení, procházení listingu s filtry, vytváření inzerátu, messaging. Připravit skripty v k6 (doporučené) nebo JMeter.
- **Data set:** připravit seed databáze s realistickým množstvím záznamů (desítky tisíc produktů, tisíce uživatelů). V load testech simulovat 1k paralelních uživatelů s ramp-up obdobími.
- **Metodika:** spustit testy před každým releasem nebo větší změnou schématu. Sledovat metriky z observability stacku a DB (slow queries, locky).
- **Automatizace:** začlenit smoke-load test (např. 5 min) do CI pipeline, plný test (30–60 min) spouštět on-demand nebo před produkčním nasazením.

## CI/CD a infra
- **CI pipeline:** GitHub Actions (nebo GitLab CI) s kroky lint → type-check → testy → build → (volitelné) smoke load test. Ukládat artefakty (Next.js build, Docker image).
- **CD pipeline:** nasazení přes container registry + orchestrátor (např. Kubernetes, ECS, Render). Minimálně dvě prostředí (staging, production). Umožnit rolling deploy s health-checky.
- **Infrastructure as Code:** Terraform/Helm skripty pro infrastrukturu (DB instance, Redis, object storage, monitoring stack).
- **Secrets management:** přes Vault/SM/Parameter Store – žádné tajné klíče v repo ani v plain env.
- **Rollback strategie:** automatické monitorování po nasazení; pokud se metriky zhorší, rollback nebo traffic shift.

## Doporučené další kroky
1. Vybrat konkrétní stack (např. Redis Cloud + AWS S3 + Grafana Cloud) a doplnit konfiguraci do `.env`.
2. Integrovat OpenTelemetry/structured logging do Next.js middleware a API.
3. Připravit k6 load testy (skripty + instructions) a napojit je do CI.
4. Vytvořit Terraform/Helm šablony pro základní infrastrukturu, včetně Redis a S3.
5. Nastavit GitHub Actions (build → test → deploy) s automatickým invalidováním cache/CDN po release.


