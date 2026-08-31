# Overview

## The idea

Earthquakes are one of the few natural hazards with an authoritative, real-time,
globally-consistent open data feed. The **USGS Earthquake Hazards Program**
publishes every detected event as GeoJSON, refreshed roughly once a minute, with
no API key required.

**MapTracker** builds a complete product around that feed:

- a **public** live map anyone can explore,
- a **personal** layer where signed-in users define the regions they care about
  and are alerted to activity there, and
- an **admin** backoffice to run the platform.

It's designed to show the full slice of a modern web app — real third-party data,
authentication and roles, geospatial features, CRUD, analytics, and a considered
UI — rather than a single toy screen.

## Who it's for

- **Curious visitors** who want to see what's shaking right now.
- **People near fault lines** who want to monitor specific areas (their city,
  family's region, a fault they follow) and be notified of significant events.
- **Operators/admins** who need visibility into usage and control over content.

## What "done" looks like

| Surface | Anyone can… |
| ------- | ----------- |
| Public  | Browse a live global map, filter by time/magnitude, inspect any event |
| Member  | Create watch zones, get a personalized in-zone feed, bookmark events with notes, review alerts |
| Admin   | See platform analytics, manage users, moderate content, run a data sync |

## Data source

Everything on the map is real. The seed and the live map read the actual USGS
feeds; the only synthetic data is the set of demo **users** (names/emails) and the
derived watch zones/bookmarks/alerts that reference real events. See
[USGS integration](./03-usgs-integration.md).
