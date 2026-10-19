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

Gen AI has raised the floor and the ceiling. It is more productive to write the code than it has ever been before. The ones who understand i.e. experts can just go with the flow and easily steer it in the right directions and validate if it did the right thing. But for someone who is learning can get overwhelmed by the amount of information to the point that if it's working, the button just gets hit and no learnings happen. In order to slow down to learn & understand what has been done, this article is there for it.

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
