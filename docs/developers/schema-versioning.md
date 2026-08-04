---
title: Schema versioning
description: How stored views survive library upgrades, what schemaVersion means, and how to add your own migrations.
---

# Schema versioning

Views live in your database, sometimes for years. The library keeps evolving. `schemaVersion` is the contract that keeps those two facts from colliding: every structure records the format it was saved in, and the runtime upgrades anything older before it renders.

```json
{
  "schemaVersion": 1,
  "settings": { "language": "en" },
  "pages": [],
  "elements": {}
}
```

Nothing is required of you for this to work. Load an old view under a new library version and it renders correctly. The rest of this page is for the cases where you want control.

## What a version bump means

The number goes up by one when a change to the structure format is not backward compatible: a field is renamed or removed, a field changes type, a node is reshaped, or the meaning of an existing default changes.

Adding a new optional field or a whole new element type is not a bump. Old JSON keeps rendering under the new runtime, because nothing it relied on moved.

Structures saved before `schemaVersion` existed carry no version at all. Those are read as version 1, which is the oldest format the library still knows.

## What happens on load

Every entry point that accepts a structure runs the same chain, including the JSON editor and the AI panel:

1. Read the version the JSON declares.
2. Apply each migration in order until the structure reaches the version the runtime speaks.
3. Hand the result to the renderer.

The migration happens in memory. The library never writes to your storage. A migrated view stays migrated only for as long as it is open, unless you save it yourself.

```ts
const model = new BuilderModel(storedJson);
model.getJson();             // migrated, current format
model.getSourceJson();       // exactly what you passed in, or null when nothing was migrated
model.getMigrationResult();  // what the last load did, or null
```

That distinction matters when you audit or diff. Save `getJson()` when you want the upgrade persisted, and keep `getSourceJson()` if you need to prove what was stored before.

## In the builder

When a creator opens a view saved in an older format, the builder header shows an upgrade action with the two versions in its tooltip. The view is already migrated in memory, so the button is really a save prompt: pressing it emits `saveRequested` and rewrites the stored copy in the new format.

The runtime shows nothing. A person filling in a form has no decision to make about a schema.

## Configuring it

`provideNgxViewBuilderMigrations()` is optional. Reach for it to log upgrades, to register migrations for your own custom fields, or to opt out.

```ts
// app.config.ts
provideNgxViewBuilderMigrations({
  onMigrated: (result) =>
    logger.info(`view migrated v${result.fromVersion} to v${result.toVersion}`, {
      applied: result.appliedDescriptions,
      warnings: result.warnings,
    }),
});
```

| Option | What it does |
| --- | --- |
| `enabled` | Default `true`. Setting it to `false` hands the structure to the renderer untouched. Correct only when you run your own migration pipeline first. A stale structure rendered as-is means missing or misconfigured elements. |
| `onUnsupported` | What to do when the JSON declares a **newer** version than this runtime knows. `error` (default) refuses to render, `renderAsIs` tries anyway. Migrating forward is impossible, so both options are damage control. |
| `onMigrated` | Called once per migrated structure. Useful for audit logs. |
| `migrations` | Your own migrations, merged with the built-in ones. |

The provider writes module-level configuration rather than a DI token, because `BuilderModel` is constructed by hosts with `new BuilderModel()`, outside any injection context.

## Newer JSON than the runtime

This happens during a staged rollout: someone saves a view on the new version, then opens it on a server still running the old one. The old runtime cannot know what changed, so by default it refuses and reports the problem instead of rendering something subtly wrong.

If a partial render is better than none for your product, switch it:

```ts
provideNgxViewBuilderMigrations({ onUnsupported: 'renderAsIs' });
```

Deploying the library before the views that depend on it avoids the situation entirely.

## Writing your own migration

Custom elements and custom properties are yours, so their format changes are yours to handle. A migration reads one version and always produces the next one.

```ts
import { IStructureMigration } from 'ngx-view-builder';

const renameNoteText: IStructureMigration = {
  from: 1,
  description: 'sprCard.text -> sprCard.body',
  migrate: (structure) => {
    Object.values(structure.elements ?? {}).forEach((element: any) => {
      if (element?.type === 'sprCard' && element.text !== undefined) {
        element.body = element.text;
        delete element.text;
      }
    });
    return structure;
  },
};

provideNgxViewBuilderMigrations({ migrations: [renameNoteText] });
```

Return warnings when a change needs a human to look at it:

```ts
migrate: (structure) => ({
  structure,
  warnings: ['Two columns bound to the same key were merged, check the totals row.'],
});
```

Warnings reach you through `onMigrated` and through `StructureMigrationService.inspect()`.

## Inspecting without loading

`StructureMigrationService` answers questions about a structure without rendering it, which is what a migration script or a health check needs:

```ts
const migration = inject(StructureMigrationService);

migration.currentVersion;              // version this runtime speaks
migration.versionOf(storedJson);       // version that JSON declares
migration.needsMigration(storedJson);  // true when they differ
migration.inspect(storedJson);         // full result, no side effects
```

A batch upgrade of stored views is then a loop over your table: `inspect`, save the returned structure when `migrated` is true, and log `appliedDescriptions` as you go. Doing it once offline means no view pays the migration cost at request time.
