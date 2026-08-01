---
title: Expression functions
description: All built-in expression functions with examples.
---

# Function reference

All functions available in expressions, grouped by purpose. Your project may add [custom functions](../developers/custom-functions) on top; check the expression editor's help panel for the live list.

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

## Searching and filtering arrays

The functions above work on a field name. These ones take a **condition** instead, written the same way you write any other expression, and evaluate it once per entry.

| Function | Returns | Example |
| --- | --- | --- |
| `filterArray(source, condition)` | the matching entries | `filterArray({users}, role == "ADMIN")` |
| `findInArray(source, condition)` | the first matching entry, or nothing | `findInArray({products}, id == {selectedId})` |
| `existsInArray(source, condition)` | true if at least one entry matches | `existsInArray({items}, status == "ACTIVE")` |
| `countInArray(source, condition)` | how many entries match | `countInArray({tasks}, status == "OPEN")` |
| `getFirst(source, condition?)` | first entry, optionally the first match | `getFirst({tasks}, status == "OPEN")` |
| `getLast(source, condition?)` | last entry, optionally the last match | `getLast({history})` |
| `sumArray(source, selector)` | sum of a field | `sumArray({orderItems}, price)` |
| `avgArray(source, selector)` | average of a field | `avgArray({grades}, score)` |
| `mapArray(source, selector)` | one value per entry | `mapArray({users}, name)` |

Inside a condition you write the entry's own field names directly, with no braces. Everything else in the view stays visible, so you can compare against another element or a variable:

```text
countInArray({tasks}, status == {statusFilter})
filterArray({orders}, status == {el5} && total > {minTotal})
filterArray({users}, role == {__variables.requiredRole})
```

Calls nest, which is how you go from a filtered set to a single text:

```text
joinInArray(mapArray(filterArray({tasks}, status == "OPEN"), title), "", ", ")
```

`countInArray` also still accepts a plain field name, so older views keep working. Anything containing a comparison is treated as a condition.

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

Advanced. These reach outside the current field:

| Function | Does | Example |
| --- | --- | --- |
| `getVal(path)` | reads any value by data path | `getVal("addresses[0].city")` |
| `setElementProperty(name, key, value)` | sets another element's property | `setElementProperty("step2", "disabled", true)` |
| `getElementProperty(name, key)` | reads another element's property | `getElementProperty("sel1", "label")` |
| `getProp(name, key)` | alias of `getElementProperty` | `getProp({sel1}, "placeholder")` |
| `runDataSource(name)` | reloads a data source, returns its result | `runDataSource("loadUsers")` |
| `reloadDataSource(name)` | alias of `runDataSource` | |

`getVal` also answers for a field the user has not touched yet, reading the value straight off the element, so `{price} * 2` no longer collapses the moment one side is still empty.

`getElementProperty` reaches any configured property, not just the value, and nested keys work:

```text
getProp("sel1", "placeholder")
getProp("sel1", "options[0].label")
getProp("orders", "dataSource.name")
```

## Labels of choice elements

A Select, Radio, or Checkbox group stores a code and shows a label. Only the element knows the pairing, so these two functions ask it directly:

| Function | Returns | Example |
| --- | --- | --- |
| `getValue(element)` | the stored value | `getValue({status})` gives `OPEN` |
| `getLabel(element, value?)` | the displayed label | `getLabel({status})` gives `Open issue` |

Name the element either way you prefer, `getLabel({status})` or `getLabel("status")`. The token is treated as the element's name here, not as its value. Pass a second argument to translate some other value through the same option list: `getLabel("status", "CLOSED")`. For a multi select you get one label per selected value.

## Translating dynamic values

Values coming from an API never pass through the Translations tab, because that tab only knows the texts written into the view. `translate()` opens the same per-language dictionary to any key:

| Function | Returns | Example |
| --- | --- | --- |
| `translate(value, fallback?)` | the translated text | `translate({row.status})` |
| `t(value, fallback?)` | alias of `translate` | `t({row.status}, "Unknown")` |
| `currentLanguage()` | active language code | `currentLanguage() == "lt"` |

See [Translations](./translations#translating-values-that-come-from-data) for where the keys live.

## Debugging

| Function | Does | Example |
| --- | --- | --- |
| `dbg(value, label?)` | logs to console, returns the value | `dbg({el2.selectedStep}, "step")` |
| `clog(value, label?)` | alias of `dbg` | `clog({price}, "price")` |
