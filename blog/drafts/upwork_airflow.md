---
title: 'Upwork airflow project'
date: '2026-10-28'
description: 'Documenting my upwork data engineering project'
tags:
  - upwork
  - airflow
  - python
draft: true
---
## Init
Here, I will document how I made my first dag & folders before writing the actual logic and make sure it's reproducible.

Make sure docker is installed in you device, and gui is open if using gui, else docker daemon should be running.
`mkdir upwork_airflow_proj && cd upwork_airflow_proj` to create a folder and get into it.

`curl -LfO 'https://airflow.apache.org/docs/apache-airflow/stable/docker-compose.yaml'` downloads the official docker compose config files
Here L is for following through all the redirects until a final destination is reached, f is for failing silently on server errors 4xx and 5xx without downloading the error.html file & O is for downloading the file with same filename.

`mkdir -p ./dags ./logs ./plugins ./config ./include` for all folders required for airflow project.
Here since the official docker compose doesn't recognise ./include we need to update the docker-compose.yaml file as follows
find the volumes section in docker-compose.yaml which looks like
```
volumes:
  - ${AIRFLOW_PROJ_DIR:-}/dags:/opt/airflow/dags
  - ${AIRFLOW_PROJ_DIR:-}/logs:/opt/airflow/logs
  - ${AIRFLOW_PROJ_DIR:-}/plugins:/opt/airflow/plugins
```
Add to that
`- ${AIRFLOW_PROJ_DIR:-}/include:/opt/airflow/include`
This will make sure your include folder is recognised.
This also requires `PTYHONPATH: /opt/airflow` with `__init__.py` files in include folder to make sure your python scripts inside the include folder or subfolder can be imported i.e. when python searches directories listed in its module search path, called `sys.path`  this docker env variables with init file helps it.
This should be in the `environment:` section of docker-compose.yaml file.

Run `docker compose up airflow-init` to initialise airflow environment, including database initialization/migrations and user setup as defined in compose config.

Now `docker compose up -d` with start those airflow services like scheduler, DAG processor, web server/API server, and other configured services.
At `localhost:8080` airflow will be running use `airflow` for username and `airflow` for password and signing.

This conclude the initialisation phase.

## Logics

## A working example

```python:title=example.py
def transform(records):
    return [record for record in records if record.get("active")]
```

| Stage     | Purpose                |
| --------- | ---------------------- |
| Read      | Understand the input   |
| Transform | Make one useful change |
| Check     | Verify the result      |

## A checklist

- [ ] Write the article
- [ ] Preview it locally
- [ ] Set `draft: false` and deploy
