---
title: 'Docker, Git CI/CD & Nginx'
date: '2026-10-19'
description: 'Deploying an application to a server'
tags:
  - Drafts
  - Docker
  - Git Action
  - CI/CD
  - Nginx
  - Airflow
draft: true
---

Gen AI has raised the floor and the ceiling. It is more productive to write the code than it has ever been before. The ones who understand i.e. experts can just go with the flow and easily steer it in the right directions and validate if it did the right thing. But for someone who is learning can get overwhelmed by the amount of information to the point that if it's working, the button just gets hit and no learnings happen. In order to slow down to learn & understand what has been done, article like these are there for it.

In this article, how docker, git CI/CD & nginx has been used to deploy an airflow application to an ec2 Instance will be discussed. This method should be able to be implemented to any kind of applications with necessary changes.

## The Airflow application

`airflow standalone` on the terminal should get Apache Airflow running. It requires airflow to be installed on your machine. If it hasn't been installed, install it via `pip install "apache-airflow[celery]==3.3.2" --constraint "https://raw.githubusercontent.com/apache/airflow/constraints-3.3.2/constraints-3.13.txt"` which can also be found at [quick start guide](https://airflow.apache.org/docs/apache-airflow/stable/start.html). Change the versions for airflow & python to match your environment and/or project requirements. Here 3.3.2 is airflow version, and 3.13 is version number for python installed on your machine. It uses an environment variable called `AIRFLOW_HOME=~/airflow` by default.

`mkdir -p ~/airflow` create a root folder for all of you runtime files if it doesn't exist already.

If you have a multiple airflow projects I recommend you to use [Astro CLI](https://www.astronomer.io/docs/cli/v1.44/get-started-cli) to manage you project which is relatively easy if not the easiest. If you choose to use _Astro CLI_ for this project you can skip all the steps below.

If you choose to use the raw method, and still want multiple airflow projects in your machine then there are two important environment variables to consider `AIRFLOW_HOME` & `AIRFLOW__CORE__DAGS_FOLDER`. The latter ones let the airflow know where the actual DAG files are located.

For instance, If your runtime and dag files are both located in your desktop folder named _specific_airflow_project_ then both env variables should point to it as `AIRFLOW_HOME="$HOME/Desktop/specific_airflow_project"` & `AIRFLOW_CORE_DAGS_FOLDER="$HOME/Desktop/specific_airflow_project/dags"`, by default both points to _~/airflow/_. You can export it as your variable needs changing. These are useful for isolated application, but for getting started we will keep the default configurations.

The default value for `AIRFLOW_HOME=~/airflow` can also be kept for shared configuration & use separate dags folder. With default _AIRFLOW_HOME_, the value for `dags_folder=` can be provided inside _airflow.cfg_ config file located at `~/airflow/config/`, but keep in mind that airflow gives environment variable higher priority. Run `airflow config get-value core dags_folder` which should print your dags_folder location.

`cd ~/airflow` & `mkdir -p dags include tests` will create all necessary folders.

Then inside _dags_ folder create a dags file as _test_dag.py_ and paste these code which uses TaskFlow API.

```python:title=test_dag.py
from datetime import datetime
from airflow.sdk import dag, task


@dag(
    dag_id="harvester_test",
    start_date=datetime(2026, 10, 1),
    schedule=None,
    catchup=False,
    tags=["harvester"],
)
def harvester_test():

    @task
    def hello():
        print("Hello from Harvester!")

    hello()


harvester_test()
```

Stop existing standalone process with `Ctrl + C`, then run `airflow standalone`.

In another terminal, run `airflow dags list` to check that DAG with file name test_dag was discovered.

There is also the Airflow UI at [http://localhost:8080](http://localhost:8080) where _test_dag_ can be manually triggered.

Next we'll see how to containarize our airflow application using docker.

## Containarization of the application

## Automating Deployment

## Serving application securely

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

If you find a typo, or anything that requires changing you can [Send an Email](mailto:roshanrays236@gmail.com?subject=Deployment%20blog%20requires%20changing&body=Hi,).
