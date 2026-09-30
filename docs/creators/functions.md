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
| `substring(text, start, end?)` | part of the text from `start` up to, but not including, `end` (counting from 0) | `substring({personCode}, 0, 1)` |

Leave `end` out and `substring` returns everything from `start` to the end of the text. A number is treated as text, so `substring({personCode}, 1, 7)` works on a Number field too. An empty field gives an empty text.

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
| `toNumber(value)` | value as number (invalid → 0) | `toNumber({codeFromApi}) > 10` |
| `inRange(value, min, max)` | true if min ≤ value ≤ max | `inRange({age}, 18, 65)` |
| `roundNumber(value, digits?)` | the number rounded to `digits` decimals, 0 when left out | `roundNumber({price} * 1.21, 2)` |
| `min(a, b, ...)` | the smallest of the numbers given | `min({requested}, {limit}, 5000)` |
| `max(a, b, ...)` | the largest of the numbers given | `max({deposit}, 0)` |
| `sum(a, b, ...)` | the numbers added up | `sum({grant}, {loan}, {ownFunds})` |

`min`, `max` and `sum` take as many values as you like. Empty fields are skipped, so `sum` of three fields where one is still empty adds up the other two, and a form that is only half filled does not break the total. When every value is empty, `sum` gives `0` and `min` and `max` give nothing. An array passed in is opened up, so `max({scores})` works on a multi-select or a list of numbers. To total a column of a dynamic panel, use `sumArray` below, which knows how to pick the field out of each entry.

`roundNumber` also gives nothing for an empty field, instead of a misleading `0`.

::: tip When toNumber is actually needed
A Number field already stores a number, so `{price} * {quantity}` is correct as written and
wrapping both sides adds nothing. Use `toNumber` when the value really arrives as text: a
Text field, a value from a data source, a select whose options carry string values, or a
Number field switched to *Store value as: string*.

It has a second, deliberate use. `toNumber` turns anything invalid into `0`, so an empty
field becomes zero instead of leaving the whole calculation empty. If that is the behaviour
you want, keep it, and know that you kept it for the default and not for the conversion.
:::

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
| `minArray(source, selector?)` | smallest number over the entries | `minArray({orderItems}, price)` |
| `maxArray(source, selector?)` | largest number over the entries | `maxArray({orderItems}, price)` |
| `countArray(source, condition?)` | how many entries match, or the length without a condition | `countArray({tasks}, status == "OPEN")` |
| `joinArray(source, selector?, separator?)` | the projected values as text | `joinArray({users}, name, ", ")` |
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
| `age(birthDate)` | full years from that date until today | `age({birthDate}) >= 18` |

`age` counts a year only once the birthday has passed, so someone born on 30 June 2008 is still 17 on 29 June 2026. It gives nothing while the date is empty, which keeps a condition like `age({birthDate}) >= 18` false until the date is filled in.

## Data & element control

Advanced. These reach outside the current field:

| Function | Does | Example |
| --- | --- | --- |
| `getVal(path)` | reads any value by data path | `getVal("addresses[0].city")` |
| `setElementProperty(name, key, value)` | sets another element's property | `setElementProperty("step2", "disabled", true)` |
| `getElementProperty(name, key)` | reads another element's property | `getElementProperty("sel1", "label")` |
| `getProp(name, key)` | alias of `getElementProperty` | `getProp({sel1}, "placeholder")` |
| `setProp(name, key, value)` | alias of `setElementProperty` | `setProp({el1}, "label", "New label")` |
| `runDataSource(name)` | reloads a data source, returns its result | `runDataSource("loadUsers")` |
| `reloadDataSource(name)` | alias of `runDataSource` | |
| `dataSourceValue(name, contextElement?)` | the payload a data source loaded last, without waiting for a request | `len(dataSourceValue("loadUsers")) > 0` |

`getVal` also answers for a field the user has not touched yet, reading the value straight off the element, so `{price} * 2` no longer collapses the moment one side is still empty.

`getElementProperty` reaches any configured property, not just the value, and nested keys work:

```text
getProp("sel1", "placeholder")
getProp("sel1", "options[0].label")
getProp("orders", "dataSource.name")
```

## Writing values back

Everything above reads. These write, so a total or a collected list can be parked in a variable or in another field without leaving the expression language:

| Function | Does | Example |
| --- | --- | --- |
| `setValue(target, value)` | writes the value and returns it | `setValue({variable1}, sumArray({el1}, el5[].column3))` |
| `setVar(name, value)` | same, target always read as a variable name | `setVar({variable1}, {el2} + {el3})` |
| `sumValue(target, value)` | adds a number to what is already there, returns the new total | `sumValue({variable1}, {row.column3})` |
| `sumVar(name, value)` | same, for variables | `sumVar({variable1}, {row.column3} + 40)` |
| `addValue(target, value)` | alias of `sumValue` | `addValue({total}, {row.column3})` |
| `pushValue(target, value)` | appends to the target's array, returns it | `pushValue({variable1}, {row})` |
| `pushVar(name, value)` | same, for variables | `pushVar({selected}, {el2})` |
| `flattenArray(source)` | flattens nested arrays into one level | `flattenArray(collectValuesFrom({el1}, el5[]))` |

The target names a variable or an element, it is not replaced by its current value. If the name matches a declared variable the value goes to the variable, otherwise to that element's data path.

`sumValue` and `pushValue` change the result every time they run, so use them from an [action](./events-actions), not from a condition that recalculates on its own. `setValue` is safe anywhere: writing the value that is already there does nothing, which is what keeps an expression from looping on the change it caused itself.

An array argument is summed before it is added, so a whole column lands in one call:

```text
sumValue({variable1}, collectValuesFrom({el1}, el5[].column3))
```

### Assignment shorthand

The same two writers have a shorter form. Put the target on the left:

```text
{variable1} = {row.column3} + 40
{variable1} = ({variable1} + ({row.column3} + 40))
{variable1} += {row.column3}
```

`=` becomes `setValue`, `+=` becomes `sumValue`. Only the leftmost token is the target; on the right side `{variable1}` reads normally, which is how the second line adds to itself. Comparisons are untouched, `{el2} == 5` stays a condition.

### Totals across a dynamic panel

A table inside a dynamic panel exists once per panel entry, so its rows sit deeper in the data. The `[]` selector walks through every level:

```text
{variable1} = sumArray({el1}, el5[].column3)
{variable1} = flattenArray(collectValuesFrom({el1}, el5[]))
```

The first sums one column across all panels, the second gathers every row of every table into one list.

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
| `currentLanguage()` | active language code | `currentLanguage() == "en"` |

See [Translations](./translations#translating-values-that-come-from-data) for where the keys live.

## Debugging

| Function | Does | Example |
| --- | --- | --- |
| `dbg(value, label?)` | logs to console, returns the value | `dbg({el2.selectedStep}, "step")` |
| `clog(value, label?)` | alias of `dbg` | `clog({price}, "price")` |
