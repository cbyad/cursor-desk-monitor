# Cursor Metrics — Desktop app

Local service that fetches **Cursor usage** from the API and publishes a normalized payload on a schedule.

Built with **Bun**, **Effect**, and a strict **Collector → Processor → Transport** layout.

## Prerequisites

- [Bun](https://bun.sh/) (latest)
- Node.js 20+ (for `sync:serial` scripts — USB serial on macOS)

## Setup

```bash
cp .env.example .env
bun install
```

| Variable | Description |
|----------|-------------|
| `CURSOR_SESSION_TOKEN` | `WorkosCursorSessionToken` cookie from cursor.com (DevTools → Application → Cookies) |
| `SYNC_INTERVAL` | e.g. `10 minutes`, `30 seconds`, `1 hour` |
| `TRANSPORT` | `log` \| `serial` \| `mqtt` (mqtt is a stub) |
| `SERIAL_PORT` | Required when `TRANSPORT=serial` — e.g. `/dev/cu.usbmodem101` |
| `SERIAL_BAUD_RATE` | Default `115200` |
| `PAID_LIMIT_USD` | Optional fallback when API omits paid limit |

## Scripts

| Command | Purpose |
|---------|---------|
| `bun run sync:once` | Single fetch + publish (`TRANSPORT=log`) |
| `bun run sync:serial` | Scheduled sync over USB serial (Node) |
| `bun run sync:once:serial` | One-shot serial publish (Node) |
| `bun run dev` | Watch mode (Bun) |
| `bun run build` | Compile binary to `dist/cursor-metrics` |
| `bun run check` | Biome lint + format |

## Architecture

```text
main.ts
  └─ SyncJob: collect → process → publish
       ├─ CursorCollectorLive   GET /api/usage-summary
       ├─ UsageSummaryProcessorLive   RawUsage → UsageSummary
       └─ Transport (config)   LogTransportLive | SerialTransportLive | MqttTransportLive
```

Transport is selected from `TRANSPORT` in [`src/layers/AppLayer.ts`](src/layers/AppLayer.ts) — business logic stays unchanged when switching transports.

## Wire format (serial)

One JSON object per line (NDJSON), schema version `1`. See [`src/domain/models/UsageSummary.ts`](src/domain/models/UsageSummary.ts) and [field mapping](docs/field-mapping.md).

## Troubleshooting

- **401 / auth errors:** refresh `CURSOR_SESSION_TOKEN` from DevTools.
- **Serial `Cannot lock port`:** close `pio device monitor` or any other tool on the same port.
- **Bun serial crashes:** use `bun run sync:serial` (Node runtime).
