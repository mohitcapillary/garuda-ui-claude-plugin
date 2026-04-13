# Benefits Listing — Raw PRD

## Design reference
Figma: https://www.figma.com/design/Q3rZlYt8ZY6g0TuVg1TZzm/Mohit-list?node-id=3-1022&m=dev

## Requirements (verbatim)

For a given program, user wants to see:

- No of total benefits configured
- No of live benefits
- No of upcoming benefits
- No of ended benefits

**List of all benefits configured** with these columns:
- Benefit name, description, ID, External ID
- Category
- Status
- Tier/Subscription program
- Duration: start date time and end date time
- Last modified date time and last updated by

**List of benefits configured grouped by category:**
- Welcome gift (same columns as above)
- Birthday Bonus (same columns as above)

**List of benefits configured for tiers or subscription programs:**
- Tiers (same columns as above)
- Subscription programs (same columns as above)

**List of benefits configured for a specific tier or specific subscription program:**
- Gold tier (same columns as above)
- VIP Subscription program (same columns as above)

**Search**: User should be able to search a particular benefit by its name, description, id, external id.

**Filters**: User should be able to filter the list of benefits based on:
- Status (active, upcoming, ended)
- Category (e.g. Priority support, welcome gift, birthday bonus, etc.)
- Program
- Tier/Subscription program — either just a filter on tiers or subscription programs as a whole, or a filter on a specific tier or specific subscription program
- Duration — start date and end date along with time
- Last updated by
- Last updated at — Today, Yesterday, Last 7 days, Last 30 days, Last 90 days
- Filter on whether tier upgrade event is set, or downgrade, or renew — this will help in showing the tier summary with the linked benefits for individual events of upgrade, downgrade, renew

**Multi-select**: User should be able to select multiple values while filtering (e.g. "give me all the benefits which are active and upcoming"). Applicable for all filters supported.
