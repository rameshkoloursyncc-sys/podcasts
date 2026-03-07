# Backend JSON structure (handoff)

Frontend uses these shapes. Implement REST APIs that accept/return the same structure. All IDs are strings. Timestamps are ISO 8601.

## Store key (for reference)

- `tenants`, `users`, `pipelineStages`, `guests`, `episodes`, `bookings`, `notes`

## Entities

### Tenant
- `id`, `name`, `slug`, `createdAt`

### User
- `id`, `tenantId`, `email`, `displayName`, `role`, `createdAt`

### PipelineStage
- `id`, `tenantId`, `key`, `label`, `order`

### Guest
- `id`, `tenantId`, `stageId`, `name`, `email`, `bio`, `avatarUrl`, `createdAt`, `updatedAt`

### Episode
- `id`, `tenantId`, `guestId`, `title`, `status` (draft|scheduled|recorded|published), `recordedAt`, `publishedAt`, `createdAt`, `updatedAt`

### Booking
- `id`, `tenantId`, `guestId`, `episodeId`, `scheduledAt`, `durationMinutes`, `status` (scheduled|completed|cancelled), `createdAt`, `updatedAt`

### Note
- `id`, `tenantId`, `entityType`, `entityId`, `authorId`, `body`, `createdAt`

## API layer (services/api.js)

Replace the in-memory implementation with HTTP calls. Same function names and signatures:

- `getTenants()`, `getTenantById(id)`
- `getUsers(tenantId)`, `getUserById(id)`
- `getPipelineStages(tenantId)`
- `getGuests(tenantId)`, `getGuestById(id)`, `createGuest(tenantId, payload)`, `updateGuest(id, payload)`, `deleteGuest(id)`
- `getEpisodes(tenantId)`, `getEpisodeById(id)`, `createEpisode(tenantId, payload)`, `updateEpisode(id, payload)`, `deleteEpisode(id)`
- `getBookings(tenantId)`, `getBookingById(id)`, `createBooking(tenantId, payload)`, `updateBooking(id, payload)`, `deleteBooking(id)`
- `getNotes(tenantId, entityType?, entityId?)`, `createNote(tenantId, payload)`, `deleteNote(id)`

Auth: mock uses `userId`; backend can use JWT and resolve tenant from user.
