# FlowPilot: AI Workspace for Project Teams

A UX case study and coded interactive prototype for an AI-powered SaaS product. FlowPilot helps small teams turn meetings, messages and documents into organized projects, tasks, deadlines and progress updates.

> **Core UX challenge:** How might we reduce the time project teams spend manually turning conversations and meetings into actionable work?

## What's here

| File | What it is |
|---|---|
| [`index.html`](index.html) | The case study: problem → competitor research → personas → journey map → information architecture → user flow → low-fi wireframes → usability decisions → design system → prototype → success metrics |
| [`prototype.html`](prototype.html) | Interactive prototype covering all ten product areas, with shared state across screens |

Both are plain HTML, CSS and vanilla JavaScript. There is no build step and nothing to install. Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

To publish with GitHub Pages, enable Pages on this branch with the repository root as the source.

## The key flow

**Meeting ends → AI generates summary → detects action items → user reviews them → tasks are created → owners and deadlines assigned → project dashboard updates.**

Open `prototype.html#meeting` to jump straight in:

1. FlowPilot processes the "Sprint 14 planning" meeting and shows a summary with timestamped decisions, risks and open questions.
2. Six action items appear, each with an owner, due date, project, priority, a confidence label and the quote it came from.
3. Items that sound like ideas start unchecked. Inferred owners and dates are highlighted. Create stays disabled until every selected item has an owner and a date, and the footer says why.
4. "Create tasks" adds them to the right project boards, notifies owners and offers Undo.
5. Home, project boards, My tasks, notifications and analytics all reflect the new tasks.

## Prototype coverage

| Area | Where | Interactions |
|---|---|---|
| Onboarding | `prototype.html` | Workspace name and size, role selection (changes Home layout), connect tools, invite teammates |
| Dashboard | `#dashboard` | Needs-attention card, KPIs, priorities, project progress, deadlines, activity |
| AI assistant | `#assistant` | Suggested questions, free text, draft-then-confirm task creation |
| Projects | `#projects` | List/board toggle, project detail, drag-and-drop board |
| Task management | `#tasks` | Filters, complete, task drawer to edit owner/priority/date, new-task modal |
| AI meeting notes | `#meeting` | Processing → summary → review → tasks created → undo |
| Documents | `#documents` | Search with highlighted matches and cited AI answers |
| Notifications | `#notifications` | Important vs. everything else, mark all read, delivery settings |
| Analytics | `#analytics` | Weekly throughput chart with tooltips, workload vs. capacity, project health |
| Settings | `#settings` | Members and roles, permission matrix, AI and privacy, workspace |

The prototype is pinned to Thursday, October 1, 2026 so relative dates stay consistent. It supports light and dark mode (follows the OS setting), keyboard focus states, reduced motion, and phone widths.

## Notes on research

This is a concept project. Research figures in the case study are labelled as assumptions to validate, and the competitor comparison reflects public product information as of Q3 2026, so re-check it before quoting. The company, people and data in the prototype are fictional.
