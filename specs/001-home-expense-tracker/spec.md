# Feature Specification: Home Expense Tracker

**Feature Branch**: `001-home-expense-tracker`  
**Created**: 2026-02-25  
**Status**: Draft  
**Input**: User description: "build a web-based application that allows me and my wife to record home expenses. We can input expense records with unit price, category, payee, date, description. Records are able to edit or delete. There is a list to view records by month, with monthly total and pie chart by category. There is also a split-even calculator which calculates when clicked to split evenly by family members monthly. The app also allows setup of categories (color, icon) and family members. Total 2 pages: Expense page (default, current month) and Setup page."

## Clarifications

### Session 2026-02-25

- Q: How do you and your wife use the app — shared device, each on own device, or one person enters everything? → A: Single shared device (MVP); one person manually logs expenses for both household members, tagging who paid each expense.
- Q: Should the field identifying who paid an expense be labelled "Payee", "Paid by", or something else? → A: "Paid by" — rename the field everywhere to "Paid by".
- Q: Where does the pie chart appear on the Expense page — same scrollable page, a toggle/tab, or above the list? → A: Toggle / tab within the Expense page — "List" and "Chart" views switchable via a tab/toggle; both reflect the same displayed month.

### Session 2026-03-04

- Q: Should cross-device sync be required? → A: No — descoped for MVP. Single-device, local-first storage (IndexedDB via Dexie.js). No backend server, no authentication, no network required.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Record a New Expense (Priority: P1)

A family member opens the app and sees this month's expenses. They tap the floating "+" button in the bottom-right corner. A popup form appears where they fill in the amount, category (chosen from a list), Paid by (the family member who covered this expense), date, and an optional description. They submit the form and the new expense immediately appears in the list for the current month.

**Why this priority**: Recording expenses is the single most-used action in the app and is the foundation for everything else. Without it, no other story has any data to work with.

**Independent Test**: Open the app, tap the new-record button, fill in the required fields (amount, category, Paid by, date), submit. The expense record appears in the current-month list with the correct category icon and amount. Data persists after refreshing the browser.

**Acceptance Scenarios**:

1. **Given** the Expense page is open, **When** the user taps the "+" floating button, **Then** a form popup appears with fields: amount (required), category (required, dropdown), Paid by (required, dropdown of configured family members), date (required, defaults to today), and description (optional free text).
2. **Given** the new-record form is open, **When** the user submits a valid record, **Then** the popup closes, the record appears at the correct position in the month list showing the category colour icon and amount, and the monthly total updates immediately.
3. **Given** the new-record form is open, **When** the user submits without filling required fields (amount, category, Paid by, or date), **Then** validation messages are shown and the form is not submitted.

---

### User Story 2 - View and Navigate Monthly Expenses (Priority: P2)

A family member opens the app and sees a scrollable list of all expenses in the current calendar month. Each row shows the category's colour icon and the amount — no other text is shown on the row itself. They swipe right to view the previous month and left to return to the current month. At the bottom (or top) of the list they can see the total spent this month.

**Why this priority**: Reviewing recorded expenses by month is the app's primary read flow — it gives the couple immediate visibility into spending without any extra action.

**Independent Test**: With at least two expenses recorded in different months, the current month list shows only current-month records with the correct total; each row shows only the category icon and amount; swiping changes the month and shows the corresponding records and total.

**Acceptance Scenarios**:

1. **Given** the app launches, **When** the Expense page loads, **Then** only expenses for the current calendar month are displayed, sorted by date (most recent first), each row showing only the category colour icon and the amount.
2. **Given** the Expense page is showing the current month, **When** the user swipes right (or taps the left arrow), **Then** the previous month's expenses and total are shown.
3. **Given** the Expense page is showing a past month, **When** the user swipes left (or taps the right arrow), **Then** the next month's expenses are shown.
4. **Given** expenses exist for the displayed month, **When** the page loads, **Then** the monthly total is prominently displayed.
5. **Given** no expenses exist for a navigated month, **When** that month is shown, **Then** an empty-state message is shown and the total is 0.

---

### User Story 3 - View Expense Details, Edit and Delete (Priority: P3)

A family member taps on an expense row. A details popup appears showing all fields — amount, category, Paid by, date, and description (if one was entered). The popup has an "Edit" button and a "Delete" button. Tapping "Edit" lets them modify any field and save. Tapping "Delete" prompts a confirmation, then removes the record.

**Why this priority**: Mistakes happen. This story ensures data accuracy without requiring re-entry from scratch.

**Independent Test**: With one expense recorded (with a description), tap its row, confirm all fields including the description appear in the popup. Tap Edit, change the amount, save — the list row reflects the new amount. Tap the row again, tap Delete, confirm — the record disappears and the monthly total updates.

**Acceptance Scenarios**:

1. **Given** an expense exists in the list, **When** the user taps its row, **Then** a popup shows amount, category, Paid by, date, and description (the description field is hidden if it was left empty).
2. **Given** the details popup is open, **When** the user taps "Edit", **Then** the fields become editable in the same or a new form popup.
3. **Given** the edit form is open, **When** the user changes a field and saves, **Then** the popup closes, the list row reflects the change, and the monthly total updates.
4. **Given** the details popup is open, **When** the user taps "Delete", **Then** a confirmation prompt appears.
5. **Given** the confirmation prompt is shown, **When** the user confirms deletion, **Then** the record is removed from the list, the monthly total updates, and the popup closes.
6. **Given** the confirmation prompt is shown, **When** the user cancels, **Then** the record is unchanged and the details popup remains open.

---

### User Story 4 - View Pie Chart by Category (Priority: P4)

On the Expense page, the user taps the "Chart" tab or toggle (alongside the "List" tab). The view switches to show a pie chart of spending broken down by category for the currently displayed month. Each slice is coloured with the corresponding category's colour. The month navigation controls and floating action buttons remain accessible in both views. Tapping "List" switches back to the expense list.

**Why this priority**: Visual spending breakdown by category helps the couple identify where most of their money is going each month, adding analytical value to raw records.

**Independent Test**: With expenses in at least two different categories for one month, switch to the Chart view — a pie chart renders with slices whose proportions and colours correspond to the spending breakdown. Switch back to List view — the expense list is shown again. Navigate to a different month while in Chart view — the chart updates to that month.

**Acceptance Scenarios**:

1. **Given** the Expense page is showing the List view, **When** the user taps the "Chart" tab/toggle, **Then** the list is hidden and a pie chart for the displayed month is shown with one slice per category that has expenses, each slice sized proportionally to its share of the total.
2. **Given** the Chart view is active, **When** the user taps the "List" tab/toggle, **Then** the pie chart is hidden and the expense list is shown.
3. **Given** the Chart view is active, **When** the user navigates to a different month, **Then** the pie chart updates to reflect that month's category breakdown.
4. **Given** only one category has expenses in the displayed month, **When** the Chart view is shown, **Then** the pie chart shows a single full-circle slice.
5. **Given** no expenses exist for the displayed month, **When** the Chart view is shown, **Then** an empty-state placeholder is displayed rather than an empty chart.
6. **Given** the Chart view is active, **When** the user taps the "+" or "Split" floating buttons, **Then** those actions work identically to how they work in List view.

---

### User Story 5 - Split-Even Calculator (Priority: P5)

On the Expense page, the user taps the "Split" floating button in the bottom-left corner. A popup appears showing:

- Each family member's name, how much they have already paid (sum of expenses where they are recorded as Paid by), and their equal fair share of the month's total.
- A clear net-settlement line stating who needs to pay whom and how much (e.g., "MM pays Hugo $50") so the couple can settle up instantly.

The fair share is calculated as the month's total ÷ number of members. The net settlement is determined by comparing each member's actual payments against their fair share; the member who underpaid transfers the difference to the member who overpaid.

**Why this priority**: The couple needs an instant, no-friction way to see how much each person owes for the month, which is the main operational outcome of tracking shared expenses.

**Independent Test**: Record three expenses — Hugo pays $200, MM pays $100 (monthly total $300 with 2 members, fair share $150 each). Tap Split — the popup must show Hugo paid $200 (overpaid by $50), MM paid $100 (underpaid by $50), settlement: "MM pays Hugo $50".

**Acceptance Scenarios**:

1. **Given** a month where Member A paid $200 and Member B paid $100 (total $300, 2 members), **When** the user taps the "Split" button, **Then** the popup shows fair share $150 each, A's paid amount $200, B's paid amount $100, and settlement "B pays A $50".
2. **Given** a month where both members have paid exactly their fair share, **When** the split popup is opened, **Then** the settlement line shows "All settled — no payment needed".
3. **Given** the split popup is open, **When** the user closes it and navigates to a different month, **Then** re-opening the split popup shows figures for the newly displayed month.
4. **Given** only one family member is configured, **When** the split popup is opened, **Then** one member is listed with the full total as their fair share and no settlement line is shown.
5. **Given** no expenses exist for the month, **When** the split popup is opened, **Then** all amounts show 0 and the settlement line shows "All settled — no payment needed".
6. **Given** more than two family members are configured, **When** the split popup is opened, **Then** each member's paid amount and net balance (paid minus fair share) is shown; members with a negative balance are listed as owing the net amount to members with a positive balance.

---

### User Story 6 - Manage Categories (Priority: P6)

On the Setup page, under the "Categories" sub-tab, the user can see all existing categories, add a new one (with a name, colour, and icon), edit an existing category, or delete a category that has no associated expense records.

**Why this priority**: Categories must be configured before they can be selected when recording expenses. Good category setup leads to meaningful pie charts and organised records.

**Independent Test**: Open Setup → Categories, add a new category with a name, colour, and icon. Navigate to the Expense page, tap the new-record button, and confirm the new category appears in the category dropdown.

**Acceptance Scenarios**:

1. **Given** the Setup page is open and the "Categories" sub-tab is selected, **When** the tab loads, **Then** all existing categories are listed with their name, colour swatch, and icon.
2. **Given** the Categories list, **When** the user adds a new category with a name, colour, and icon, **Then** the category is immediately available for selection in the expense form.
3. **Given** an existing category, **When** the user edits its colour or icon, **Then** all expense rows using that category immediately reflect the updated colour/icon.
4. **Given** a category with no associated expense records, **When** the user deletes it, **Then** it is removed from the category list and from the expense form dropdown.
5. **Given** a category that has associated expense records, **When** the user attempts to delete it, **Then** the deletion is blocked and an explanatory message is shown.

---

### User Story 7 - Manage Family Members (Priority: P7)

On the Setup page, under the "Family Members" sub-tab, the user can see all configured members, add a new member (name only), rename a member, or remove a member who has no associated expense records as Paid by.

**Why this priority**: Family members must be configured to enable the split-even calculation and to assign a payee to expense records.

**Independent Test**: Open Setup → Family Members, add a new member. Navigate to the Expense page, tap the new-record button, and confirm the new member appears in the payee dropdown. Return to Setup, delete the member, and confirm they no longer appear.

**Acceptance Scenarios**:

1. **Given** the Setup page is open and the "Family Members" sub-tab is selected, **When** the tab loads, **Then** all configured members are listed by name.
2. **Given** the Family Members list, **When** the user adds a new member with a non-empty name, **Then** the member immediately appears in the Paid by dropdown of the expense form and is included in the split-even calculation.
3. **Given** an existing member, **When** the user renames them, **Then** all expense records that reference them as Paid by reflect the updated name.
4. **Given** a member with no associated expense records, **When** the user removes them, **Then** they are removed from the list and from all dropdowns.
5. **Given** a member referenced as Paid by in one or more expense records, **When** the user attempts to remove them, **Then** the removal is blocked and an explanatory message is shown.

---

### Edge Cases

- What happens when the user attempts to save an expense with a negative or zero amount? → Validation must reject it with a clear message.
- What happens in the split calculator if no member has been assigned as payee for any expense? → Each member shows a paid amount of $0; the member(s) with the smallest index are credited as the settlement target, or more practically the popup shows the full total as owed by all members proportionally.
- What happens when all categories are deleted? → The expense form's category field should prompt the user to set up a category first; existing records are unaffected.
- What happens when the user swipes past the earliest month with any data? → Navigation continues into months with no data, showing the empty-state message.
- What happens if the amount has more than two decimal places? → The app rounds to two decimal places before saving and shows a warning.
- What happens on a very small screen (320 px viewport)? → All primary interactions remain accessible; no content is clipped without a way to access it.

## Requirements *(mandatory)*

### Functional Requirements

**Expense Recording**
- **FR-001**: Users MUST be able to create an expense record containing: amount (required, positive number), category (required, chosen from configured list), Paid by (required, chosen from configured family members — the person who covered this expense), date (required, defaults to today), and description (optional free text). Item name is not a required field.
- **FR-002**: Users MUST be able to edit any field of an existing expense record.
- **FR-003**: Users MUST be able to delete an existing expense record after a confirmation step.
- **FR-004**: All expense data MUST be stored locally in the browser using IndexedDB so that records persist across sessions on the same device and browser.

**Expense List & Navigation**
- **FR-005**: The Expense page MUST default to the current calendar month on every launch.
- **FR-006**: Expenses MUST be displayed in a scrollable list sorted by date, most recent first; each row MUST show only the category colour icon and the amount — no other text is displayed on the row.
- **FR-007**: Tapping an expense row MUST open a details popup showing all fields (amount, category, Paid by, date, and description if present) along with Edit and Delete actions.
- **FR-008**: Users MUST be able to navigate to the previous or next month by swiping left/right on the expense list or by tapping navigation controls.
- **FR-009**: The monthly total for all expenses in the displayed month MUST be visible on the Expense page at all times.

**Visualisation**
- **FR-010**: The Expense page MUST provide a "Chart" view, switchable from the "List" view via a tab or toggle control. The Chart view MUST display a pie chart showing spending broken down by category for the currently displayed month; switching back to "List" restores the expense list. The default view on launch is the List view.
- **FR-011**: Each pie chart slice MUST be coloured with the corresponding category's colour.

**Split-Even Calculator**
- **FR-012**: A floating "Split" button MUST always be visible on the Expense page (bottom-left overlay).
- **FR-013**: Tapping the Split button MUST open a popup displaying: (a) each configured family member's name, their actual paid amount for the month (sum of expenses where they are recorded as Paid by), and their fair share (total ÷ number of members); (b) a net-settlement result stating which member owes how much to which other member, or "All settled" if no transfer is needed. All amounts MUST be displayed as `$X.XX` (fixed `$` prefix, two decimal places, e.g. `$12.50`).

**New Record Entry**
- **FR-014**: A floating new-record "+" button MUST always be visible on the Expense page (bottom-right overlay).
- **FR-015**: Tapping the new-record button MUST open a form popup for entering a new expense record.

**Category Setup**
- **FR-016**: Users MUST be able to create a category with a name, a colour (chosen from a predefined palette or colour picker), and an icon (chosen from a predefined icon set).
- **FR-017**: Users MUST be able to edit the name, colour, and icon of an existing category.
- **FR-018**: Users MUST be able to delete a category that has no associated expense records; deletion of categories with associated records MUST be blocked with an explanatory message.

**Family Member Setup**
- **FR-019**: Users MUST be able to add a family member by name.
- **FR-020**: Users MUST be able to rename an existing family member.
- **FR-021**: Users MUST be able to remove a family member who is not referenced as Paid by in any expense record; removal of members referenced in existing records MUST be blocked with an explanatory message.

**Navigation & Layout**
- **FR-022**: The application MUST have exactly two pages: Expense and Setup.
- **FR-023**: The Setup page MUST contain two sub-tabs: "Family Members" and "Categories".
- **FR-024**: The application MUST be designed for and function correctly on a mobile-sized viewport (320 px – 480 px wide).
- **FR-025**: All data reads MUST be served from local IndexedDB. No network requests are made for data; the app works fully offline after initial load.

### Key Entities

- **Expense Record**: A single spending event — amount, category (linked), Paid by (linked to family member — the person who covered the expense), date, description (optional free text), created/updated timestamps. Item name/label is optional and may be omitted.
- **Category**: A named grouping for expenses — name, colour value, icon identifier; referenced by expense records.
- **Family Member**: A person who shares household expenses — name; referenced by expense records as Paid by and included in split-even calculations.

## Assumptions

- **Data storage**: All data is stored locally in the browser's IndexedDB (via Dexie.js). No backend server, no authentication, and no network connectivity are required for the app to function. Data is scoped to the origin and browser; it is not shared across devices or browsers. Cross-device sync is out of scope for this MVP version.
- **Family members**: Two family members ("Hugo" and "MM") are pre-seeded as defaults on first launch. The user can rename or replace them.
- **Split-even logic**: The split is always equal — each configured member's fair share is (total ÷ count). The calculator also computes net settlement by comparing each member's actual payments (as payee) against their fair share, then produces a single transfer instruction (or "All settled") to resolve any imbalance. Weighted or custom splits are out of scope. For more than two members the popup shows each member's net balance; full multi-way optimised settlement (minimising number of transfers) is out of scope for this version.
- **Currency**: A single currency is used throughout; all monetary amounts are displayed with a `$` prefix and two decimal places, e.g. `$12.50`. The `$` symbol is fixed — currency symbol configuration is out of scope for this version.
- **Amount field**: "Unit price" is interpreted as the total expense amount for the record (not a per-unit price multiplied by a quantity). This simplifies the input form.
- **Default categories**: Seven starter categories (Food, Transport, Utilities, Shopping, Health, Entertainment, Other) are pre-seeded on first launch so the app is immediately usable.
- **Sync strategy**: Not applicable for MVP. All data is local. A future version may add cloud sync; the data model is designed to accommodate this without schema changes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can record a new expense from opening the form to seeing the record in the list in under 30 seconds.
- **SC-002**: The monthly expense list and pie chart for any month load and render within 1 second of navigating to that month.
- **SC-003**: The split-even result updates and is visible within 1 second of tapping the Split button.
- **SC-004**: All entered data is present and correct after closing and reopening the browser — 100 % local persistence reliability.
- **SC-005**: All primary actions (record, view, edit, delete, split, setup) are reachable without horizontal scrolling on a 375 px wide mobile viewport.
- **SC-006**: A first-time user can locate and use the new-record button and the split button without any onboarding instructions, based on visual affordance alone.
