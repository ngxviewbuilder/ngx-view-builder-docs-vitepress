---
title: Expression cheat sheet
description: The most common expression patterns, copy-paste ready.
---

# Cheat sheet

## Tokens

```text
{country}                     field value
{row.status}                  current table row
{panel.index}                 current dynamic-panel entry index
{parentIndex}                 index in the surrounding repeater
{__variables.route.id}        variable (route param)
{__external.userRole}         host-app context
{myTabs.selectedTab}          active tab name
{flow.selectedStepIndex}      active step index
```

## Quick patterns

```text
{country} == "US"
isEmpty({companyCode})
notEmpty({email}) && notEmpty({phone})
contains({roles}, "admin")
containsAny({roles}, ["admin", "manager"])
{price} * {quantity}
len({selectedItems}) > 0
inRange({age}, 18, 65)
```

## If / else (ternary)

```text
{isCompany} ? {companyCode} : {personalCode}
{country} == "US" ? "Domestic" : "International"
{quantity} > 0 ? {sum} / {quantity} : 0
```

Nested:

```text
{status} == "approved" ? ({isVip} ? "Priority" : "Standard") : "Draft"
contains({roles}, "admin") ? "Full access"
  : (contains({roles}, "editor") ? "Editing" : "Read only")
```

## Arrays & aggregation

```text
sumInArray({orderLines}, "amount")
countInArray({employees}, "id")
contains(collectValuesFrom({employees}, "role", true), "manager")
joinInArray({tags}, "name", ", ")
sumArray({el1}, el5[].column3)               through a dynamic panel
flattenArray(collectValuesFrom({el1}, el5[]))  all rows in one list
```

## Writing a value

```text
{variable1} = {price} * {quantity}           set
{variable1} += {row.column3}                 add, use from an action
setValue({variable1}, sumArray({el1}, el5[].column3))
pushValue({variable1}, {row})
{el4.column1-total}                          published column total
```

## Dates

```text
=today()                                     default value: today
addDays(today(), 14)                         two weeks from now
dateDiffDays({startDate}, {endDate}) >= 1    end after start
isWeekend({deliveryDate})                    weekend check
```

## Row & panel context

```text
row.status == "active"
panel.amount > 1000
{el1[parentIndex].country} == "US"
```

## Template placeholders

Inside option templates, card templates, and dynamic text (double braces):

```text
{{label}}   {{value}}   {{index}}   {{selected}}
{{ item.name }}   {{ item.status }}
@if (item.status == "Active") {<span>{{ item.status }}</span>}
```

## Debug

```text
dbg({clientType}, "clientType")     log to console, value passes through
```
