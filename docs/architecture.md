# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Implement the data and logic contracts first, then connect the presentation tier to the completed API. Keep request handling in routes, business rules in service functions, and persistence/field validation in Mongoose models. Do not add authentication.

- Presentation tier decision: Keep React routes and capability components focused on rendering. Use the shared API client for relative `/api` requests and provide accessible loading, empty, success, and error states for each capability.
- Logic tier decision: Keep `/api` route handlers thin; delegate validation, persistence, and capability behavior to explicit service functions. Return deliberate 4xx responses for invalid input and missing records rather than allowing cast errors to become 500 responses.
- Data tier decision: Put required fields, types, and sensible defaults in Mongoose schemas. Preserve the seed script's idempotent upserts and existing application data; do not clear collections.
- Activity tracking approach: Validate the request fields and both ObjectId formats, confirm the referenced user and team exist, then create the activity with those references, the submitted type and minutes, points computed from minutes, and the current time as `occurredAt`.
- Team management approach: Require a non-empty name and mascot, create teams through the service, and preserve the submitted team fields and member references in list/create responses. Reject invalid member references with a 4xx response.
- Leaderboard approach: Aggregate activity points by team, include teams with no activity at zero, sort totals descending, and assign 1-based ranks in the returned entries.
- Workout suggestions approach: Find the user by email, use their goal and recent activity to select matching workouts, and include a short reason for the leading suggestion. Return a deliberate 4xx response when the email does not identify a user.

## Test plan

Run the focused contracts before the full builds. A failing assertion indicates a mismatch in the tier named by that test; a build failure indicates a TypeScript or bundling issue that the behavior tests may not catch.

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend` — verifies model requirements and seed completeness, idempotency, and preservation of unrelated records.
- API command: `npm run test:api --prefix octofit-tracker/backend` — verifies request validation, activity/team writes and reads, leaderboard ordering/ranks, and personalized workout suggestions including unknown-user errors.
- Frontend command: `npm test --prefix octofit-tracker/frontend` — verifies API-backed content, the user-specific workout request, and accessible loading, empty, and error states.
- Backend build command: `npm run build --prefix octofit-tracker/backend` — verifies backend TypeScript compilation.
- Frontend build command: `npm run build --prefix octofit-tracker/frontend` — verifies frontend TypeScript compilation and Vite production bundling.

Baseline captured before implementation: backend tests had 8 failures and 1 pass across the data and API contract files; the passing test was seed idempotency/preservation. Frontend tests had 15 failures, covering API-backed content and loading, empty, and error states. Re-run the commands above after the corresponding tier changes and update this baseline with the resulting status.
