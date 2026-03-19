## ADDED Requirements

### Requirement: Expense row shows description as primary label
Each expense row SHALL display the expense's `description` field as the primary text label. When `description` is empty, the row SHALL fall back to the associated category name.

#### Scenario: Description is present
- **WHEN** an expense has a non-empty `description`
- **THEN** the row displays the description as the primary label

#### Scenario: Description is empty
- **WHEN** an expense has an empty `description`
- **THEN** the row displays the category name as the primary label

### Requirement: Expense row shows payer name
Each expense row SHALL display the name of the member who paid (`paidBy`) as a secondary line beneath the primary label.

#### Scenario: Member exists
- **WHEN** the `paidBy` member ID resolves to a known member
- **THEN** the row displays that member's name as the secondary line

#### Scenario: Member not found
- **WHEN** the `paidBy` member ID does not resolve to a known member
- **THEN** the row displays an empty secondary line (no crash, no error)

### Requirement: Expense row shows amount right-aligned
Each expense row SHALL display the formatted amount right-aligned on the same row as the primary label.

#### Scenario: Amount displayed
- **WHEN** an expense row is rendered
- **THEN** the formatted amount (e.g. `$42.00`) appears right-aligned

### Requirement: Expense list grouped by date with smart headers
The expense list SHALL group expenses by their `date` field and render a date header above each group. Headers SHALL use smart labels: `Today` for the current date, `Yesterday` for one day prior, and a short date format (e.g. `Mar 5`) for all other dates. Groups SHALL be ordered with the most recent date first.

#### Scenario: Expense on today's date
- **WHEN** an expense's date equals today's local date
- **THEN** its group header reads `Today`

#### Scenario: Expense on yesterday's date
- **WHEN** an expense's date equals yesterday's local date
- **THEN** its group header reads `Yesterday`

#### Scenario: Expense on an older date
- **WHEN** an expense's date is earlier than yesterday
- **THEN** its group header shows the date in short format (e.g. `Mar 5`)

#### Scenario: Multiple expenses on the same date
- **WHEN** two or more expenses share the same `date`
- **THEN** they appear under a single date header for that date

#### Scenario: Groups ordered most-recent first
- **WHEN** expenses span multiple dates
- **THEN** the most recent date group appears at the top of the list
