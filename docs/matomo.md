# Matomo
Matomo (formerly Piwik) is the analytics software we use for psc-verification-web. For documentation on using Matomo to view analytics, see [this Confluence section](https://companieshouse.atlassian.net/wiki/spaces/S5/pages/1929183485/Piwik+Matomo#Using-Piwik%2FMatomo).

This document covers how we use Matomo in psc-verification-web specifically.

## Background
As a short background, Matomo tracks four main things:

* **Events** – actions performed by a user on a page, such as "contact-us-link" and "more-info-dropdown".
* **Event categories** – named sets of events.
* **Goals** – predefined milestones, such as "start" and "end".
* **Visits** – a user loading a service page.

## Usage

> [!NOTE]  
> Our codebase references Piwik extensively. For example, `PIWIK_SITE_ID`, `PIWIK_URL`, etc. Piwik is synonymous with Matomo.

### Firing events
To fire events, the `data-event-id` HTML attribute must be added to the element you want to track. Typically, that looks like the following:

```html
<a href="example.com" data-event-id="example-link">Click me</a>
```

However, since we use [Nunjucks](https://mozilla.github.io/nunjucks/) and [govuk-frontend](https://github.com/alphagov/govuk-frontend) for templating, it's not always possible to directly add the `data-event-id` attribute. Instead, use the following as a reference:

```html
{{ govukDetails({
    summaryText: i18n.summary_text,
    text: i18n.details_text,
    attributes: {
        "data-event-id": "example-dropdown"
    }
}) }}
```

### Event categories
Event categories are used to group together a set of events. For psc-verification-web, we typically use the template name or URL path.

> [!IMPORTANT]  
> You **must** provide a `templateName` as view data. If a screen doesn't have a Matomo category, events won't fire at all!

The following is a snippet taken from `src/routers/handlers/start/startHandler.ts` showing how event categories are defined, with the important part being `templateName`:

```ts
public async getViewData (req: Request, res: Response): Promise<StartViewData> {
    // ...
    return {
        // ...
        templateName: Urls.START
    };
}
```

### Tracking goals

#### IDs
Goals work slightly differently from events. Instead of being defined at the code level, they are defined in Matomo itself by the Performance team. Each goal has an ID, which we reference in psc-verification-web. The goal IDs vary by environment, so we use an environment variable such as `PIWIK_START_GOAL_ID`. A table of goal IDs per environment can be seen below:

| Goal | Local Docker | CIDEV | Staging/Live |
|:----|:------------:|:-----:|:------------:|
| PSC IDV – Start now button             | 24 | 45  | 46  |
| PSC IDV – Provide verification details | 98 | 119 | 119 |
| PSC IDV – Request extension            | 99 | 120 | 120 |

#### Triggering a goal
Goals are triggered explicitly via JavaScript like so:

```html
attributes: {
    "onclick": "_paq.push(['trackGoal', '" + PIWIK_START_GOAL_ID + "'])"
}
```

`'trackGoal'` must be present.

### Visits
Visits are tracked automatically, with no developer action needed.

## Matomo setup
This section covers how Matomo itself is set up within psc-verification-web.

### Environment
See [Configuration](/README.md#configuration) for the required Matomo environment variables. They all start with `PIWIK_`.

### Scripts
Matomo scripts are sourced in `src/views/partials/__meta_footer.njk`, which in turn is sourced by `src/views/layouts/default.njk` (applied to every page).

## Privacy
Matomo events, visits, etc., should **never** contain PII (Personally Identifiable Information) or other sensitive information. In fact, Matomo events should always be static, since if they contain dynamic strings they won't group together properly on the Matomo dashboard.

Our use of Matomo is strictly for gauging the performance of this service.

## Troubleshooting

### Events not appearing in the Matomo dashboard
0. Double-check that you've filtered for the correct environment, date range, segment, etc., on the Matomo site.
1. Ensure that you've accepted cookies for psc-verification-web. If you're unsure, reset your browser's cookie storage for the site and refresh; you should be prompted for analytics cookies.
2. Open the browser Developer Tools > Network tab and interact with the element that *should* be firing an event.
    - If you see an entry that starts with `piwik.php?`, then the issue is somewhere between psc-verification-web and Matomo.
    - If you **do not** see such an entry, then the issue is somewhere within the code.
3. If the issue is within psc-verification-web: ensure that you've correctly supplied `templateName` to the screen via view data or `res.locals`, as the event will not fire without this.
