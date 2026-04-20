# Benefits Listing — Raw PRD

**Listing page** — Implement this design from Figma:
https://www.figma.com/design/Q3rZlYt8ZY6g0TuVg1TZzm/Mohit-list?node-id=123-5146&m=dev

On click filter icon from list page drawer opens — Implement this design from Figma:
https://www.figma.com/design/Q3rZlYt8ZY6g0TuVg1TZzm/Mohit-list?node-id=122-4327&m=dev

### Summary stats
- No of total benefits configured
- No of live benefits
- No of upcoming benefits
- No of ended benefits

### List of all benefits configured
- Benefit name, description, ID, External ID
- Category
- Status
- Tier/Subscription program
- Duration: start date time and end date time
- Last modified date time and last updated by

### List of benefits configured grouped by category
**Welcome gift**
- Benefit name, description, ID, External ID
- Category
- Status
- Tier/Subscription program
- Duration: start date time and end date time
- Last modified date time and last updated by

**Birthday Bonus**
- Benefit name, description, ID, External ID
- Category
- Status
- Tier/Subscription program
- Duration: start date time and end date time
- Last modified date time and last updated by

### List of benefits configured for tiers or subscription programs
**Tiers**
- Benefit name, description, ID, External ID
- Category
- Status
- Tier/Subscription program
- Duration: start date time and end date time
- Last modified date time and last updated by

**Subscription programs**
- Benefit name, description, ID, External ID
- Category
- Status
- Tier/Subscription program
- Duration: start date time and end date time
- Last modified date time and last updated by

### List of benefits configured for a specific tier or specific subscription program
**Gold tier**
- Benefit name, description, ID, External ID
- Category
- Status
- Tier/Subscription program
- Duration: start date time and end date time
- Last modified date time and last updated by

**VIP Subscription program**
- Benefit name, description, ID, External ID
- Category
- Status
- Tier/Subscription program
- Duration: start date time and end date time
- Last modified date time and last updated by

### Search
User should be able to search a particular benefit by its name, description, id, external id

### Filters (drawer)
User should be able to filter the list of benefits based on:
- Status (active, upcoming, ended)
- Category (e.g. Priority support, welcome gift, birthday bonus etc)
- Program
- Tier/Subscription program >> either just a filter on tiers or subscription programs as whole or it could be a filter on specific tier or specific subscription program
- Duration (start date and end date along with time)
- Last updated by
- Last updated at:
  - Today
  - Yesterday
  - Last 7 days
  - Last 30 days
  - Last 90 days
- Filter on whether tier upgrade event is set or downgrade or renew >> this will help in showing the tier summary with the linked benefits for individual events of upgrade, downgrade, renew

User should be able to select multiple values while filtering — e.g. give me all the benefits which are active and upcoming. Applicable for all filters supported.
