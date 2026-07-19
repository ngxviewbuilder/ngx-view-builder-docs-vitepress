---
title: Function reference
description: All built-in expression functions with examples.
---

# Function reference

All functions available in expressions, grouped by purpose. Your project may add [custom functions](../developers/custom-functions) on top — check the expression editor's help panel for the live list.

## Emptiness & text

| Function | Returns | Example |
| --- | --- | --- |
| `isEmpty(value)` | true if empty (`null`, `""`, `[]`) | `isEmpty({companyCode})` |
| `notEmpty(value)` | true if not empty | `notEmpty({email})` |
| `len(value)` | length of text or array | `len({items}) >= 3` |
| `startsWithAny(text, prefix)` | true if text starts with prefix | `startsWithAny({iban}, "LT")` |
| `endsWithAny(text, suffix)` | true if text ends with suffix | `endsWithAny({code}, "99")` |

## Collections

| Function | Returns | Example |
| --- | --- | --- |
| `contains(collection, value)` | true if array/text contains value | `contains({roles}, "admin")` |
| `includesAny(collection, value)` | alias of `contains` | `includesAny({tags}, "vip")` |
| `containsAny(collection, values)` | true if any of the values present | `containsAny({roles}, ["admin","editor"])` |
| `containsAll(collection, values)` | true if all values present | `containsAll({perms}, ["read","write"])` |
| `inArray(value, collection)` | true if value is in collection | `inArray({el2}, {el1})` |

## Numbers

| Function | Returns | Example |
| --- | --- | --- |
| `toNumber(value)` | value as number (invalid → 0) | `toNumber({price}) > 10` |
| `inRange(value, min, max)` | true if min ≤ value ≤ max | `inRange({age}, 18, 65)` |

## Array aggregation

For dynamic panel / dynamic table values (arrays of objects). `selector` is the field name inside each entry.

| Function | Returns | Example |
| --- | --- | --- |
| `sumInArray(source, selector)` | sum | `sumInArray({orderLines}, "amount")` |
| `avgInArray(source, selector)` | average | `avgInArray({grades}, "score")` |
| `minInArray(source, selector)` | minimum | `minInArray({offers}, "price")` |
| `maxInArray(source, selector)` | maximum | `maxInArray({offers}, "price")` |
| `countInArray(source, selector)` | count | `countInArray({employees}, "id")` |
| `firstInArray(source, selector)` | first value | `firstInArray({history}, "status")` |
| `lastInArray(source, selector)` | last value | `lastInArray({history}, "status")` |
| `joinInArray(source, selector, separator)` | joined text | `joinInArray({tags}, "name", ", ")` |
| `collectValuesFrom(source, selector, unique)` | array of values | `collectValuesFrom({orders}, "id", true)` |

## Dates

| Function | Returns | Example |
| --- | --- | --- |
| `today()` | today, `YYYY-MM-DD` | `Default value: =today()` |
| `now()` | current date-time (ISO) | timestamp fields |
| `date(value, mode)` | normalised date (`iso`, `datetime`, `timestamp`) | `date({created}, "iso")` |
| `day(value)` / `month(value)` / `year(value)` | date parts | `year({birthDate}) < 2000` |
| `weekDay(value, locale, style)` | weekday name | `weekDay({date}, "en", "long")` |
| `weekDayIndex(value)` | Monday=1 … Sunday=7 | `weekDayIndex({date}) <= 5` |
| `isWeekend(value)` | true on Sat/Sun | `visibleIf: isWeekend({deliveryDate})` |
| `addDays(value, days)` | date + n days | `addDays(today(), 14)` |
| `dateDiffDays(from, to)` | day difference | `dateDiffDays({start}, {end}) >= 1` |
| `startOfWeek(value)` / `endOfWeek(value)` | week boundaries | report period defaults |

## Data & element control

Advanced — these reach outside the current field:

| Function | Does | Example |
| --- | --- | --- |
| `getVal(path)` | reads any value by data path | `getVal("addresses[0].city")` |
| `setElementProperty(name, key, value)` | sets another element's property | `setElementProperty("step2", "disabled", true)` |
| `runDataSource(name)` | reloads a data source, returns its result | `runDataSource("loadUsers")` |
| `reloadDataSource(name)` | alias of `runDataSource` | |

## Debugging

| Function | Does | Example |
| --- | --- | --- |
| `dbg(value, label?)` | logs to console, returns the value | `dbg({el2.selectedStep}, "step")` |
| `clog(value, label?)` | alias of `dbg` | `clog({price}, "price")` |
