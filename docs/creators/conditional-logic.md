---
title: Conditional logic
description: Show, hide, require, disable, lock, and reset fields based on other answers.
---

# Conditional logic

Five properties in the **Logic** category control element state. Each takes a true/false [expression](./expressions) and re-evaluates automatically when referenced fields change.

| Property | While the expression is true… |
| --- | --- |
| **Visible if** | the element is shown (hidden otherwise) |
| **Disable if** | the element is visible but inactive |
| **Require if** | the element is required |
| **Read only if** | the value is visible but locked |
| **Reset if** | *the moment it becomes true*, the value is cleared/reset to default |

## Visible if

```text
{clientType} == "company"            show for companies only
!isEmpty({email})                    show once email is entered
contains({services}, "delivery")     show when "delivery" was picked
```

Put `visibleIf` on a **panel** to toggle a whole section at once. A hidden element keeps its configuration but is skipped in validation by default.

## Disable if

```text
{approvalStatus} == "approved"       lock after approval
{age} < 18                           inactive for minors
!containsAny({roles}, ["admin", "editor"])
```

Use *disable* when the user should see that the option exists; use *visible* when it's irrelevant.

## Require if

```text
{personType} == "company"            company code required for companies
{amount} > 10000                     justification required for large sums
{country} != "LT"                    tax ID required for foreign clients
```

## Read only if

```text
{status} == "submitted"              freeze after submission
notEmpty({externalReference})        imported values can't be edited
{__variables.mode} == "view"         whole form in view mode
```

## Reset if

Clears stale answers when their premise disappears:

```text
{personType} != "company"            clear companyCode when switching to person
!contains({supportTypes}, "training")   clear trainingDate if training unselected
```

Without a reset rule, a hidden field keeps its old value, and that value is still submitted.

## Logic inside repeaters

Inside a **Dynamic panel** or a **Dynamic table**, the same five properties are evaluated once per row, against that row's own values. Write the condition with the row context rather than a field name:

```text
panel.dpDriver > 10        dynamic panel: this entry's field
row.quantity > 0           dynamic table: this row's cell
```

Each row then decides for itself. In a panel of order lines, `visibleIf: panel.quantity > 0` hides the discount field only in the lines that have no quantity, and leaves the other lines untouched. The same goes for **Require if**, so a row can be mandatory while its neighbours are not.

Referring to a plain field name inside a repeater still points at the form-level field of that name, which is what you want for conditions like `visibleIf: {orderType} == "wholesale"` applied to every row at once.

## Several logic properties on one element

They are independent and all apply. An element can be visible, required, and read only at the same time, and the combination is resolved in one pass, so the field is correct on the first change rather than after a second edit.

```text
Visible if    {n1} > 10
Require if    {n1} > 10
Read only if  {approved} == true
```

## Complete example

Order form: *"Deliver to a different address?"* (single checkbox `otherAddress`) with a delivery panel:

| Element | Property | Expression |
| --- | --- | --- |
| Panel `deliveryPanel` | Visible if | `{otherAddress} == true` |
| Text `deliveryStreet` | Require if | `{otherAddress} == true` |
| Text `deliveryStreet` | Reset if | `{otherAddress} != true` |

Result: the section appears only when needed, is mandatory when shown, and cleans up after itself when hidden.
