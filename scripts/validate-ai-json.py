"""Validate every JSON block in the AI docs against the real library metadata.

Sources of truth extracted at runtime from the ngx-view-builder source:
  - element type -> allowed property keys   (builder/datasets/properties/*.property.ts + properties.service.ts registry)
  - canonical element types                 (shared/enums/element-types.enum.ts + palette + lazy loader + container map)
  - table column keys                       (table-column.property.ts + table.interface.ts)
  - action config keys                      (element-action.interface.ts)
  - element data source keys                (structure.interface.ts IElementDataSource)
  - layout object keys                      (structure.interface.ts IPage/IRow/IColumn)
"""
import json
import os
import re
import sys

# Paths are resolved from this script's location: the docs project and the library
# project sit side by side in the workspace root, matching retrieval-map.json's roots.
HERE = os.path.dirname(os.path.abspath(__file__))
DOCS_PROJECT = os.path.dirname(HERE)
WORKSPACE = os.path.dirname(DOCS_PROJECT)
LIB = os.environ.get(
    "NVB_LIB",
    os.path.join(WORKSPACE, "ngx-view-builder", "projects", "ngx-view-builder", "src", "lib"),
)
DOCS = os.path.join(DOCS_PROJECT, "docs", "ai")

read = lambda p: open(p, encoding="utf-8").read()


def record_keys(text):
    m = re.search(r"= \{(.*)\n\};", text, re.S)
    if not m:
        return []
    return re.findall(r"^  ([A-Za-z_$][\w$]*)\s*:", m.group(1), re.M)


def build_type_props():
    svc = read(os.path.join(LIB, "core/builder/services/properties.service.ts"))
    imports = {}
    for m in re.finditer(r"import \{\s*([^}]+?)\s*\} from '\.\./datasets/properties/([\w.-]+)'", svc, re.S):
        for n in m.group(1).split(","):
            n = n.strip().split(" as ")[-1].strip()
            if n:
                imports[n] = m.group(2) + ".ts"
    reg = re.search(r"const DEFAULT_PROPERTY_REGISTRY[^=]*= \{(.*?)\n\};", svc, re.S).group(1)
    out = {}
    for line in reg.splitlines():
        line = line.strip().rstrip(",")
        if not line:
            continue
        k, v = line.split(":", 1) if ":" in line else (line, line)
        f = imports.get(v.strip())
        if not f:
            continue
        p = os.path.join(LIB, "core/builder/datasets/properties", f)
        if os.path.exists(p):
            out[k.strip()] = set(record_keys(read(p)))
    return out


def enum_values(path):
    return set(re.findall(r"^\s+\w+ = '([^']+)',?", read(os.path.join(LIB, path)), re.M))


def interface_keys(path, name):
    t = read(os.path.join(LIB, path))
    m = re.search(r"export interface " + name + r"[^{]*\{(.*?)\n\}", t, re.S)
    return set(re.findall(r"^\s+(\w+)\??\s*:", m.group(1), re.M)) if m else set()


TYPE_PROPS = build_type_props()
ALL_TYPES = enum_values("core/shared/enums/element-types.enum.ts")

# Types that can actually be rendered: palette + lazy-loaded leaves + container map.
palette_src = read(os.path.join(LIB, "core/shared/datasets/elements.ts"))
enum_map = dict(
    re.findall(r"^\s+(\w+) = '([^']+)',?", read(os.path.join(LIB, "core/shared/enums/element-types.enum.ts")), re.M)
)
body = palette_src.split("export const elements: IElementRef[] = [", 1)[1]
RENDERABLE = {enum_map.get(a, b) for a, b in re.findall(r"type:\s*(?:ElementTypesEnum\.(\w+)|'([^']+)')", body)}
lazy = read(os.path.join(LIB, "core/runtime/services/runtime-lazy-element-loader.service.ts"))
RENDERABLE |= {enum_map[k] for k in re.findall(r"\[ElementTypesEnum\.(\w+)\]:", lazy) if k in enum_map}
container_src = read(os.path.join(LIB, "core/runtime/components/runtime-container-outlet/runtime-container-outlet.ts"))
cm = re.search(r"EAGER_CONTAINER_COMPONENTS[^=]*= \{(.*?)\n\};", container_src, re.S).group(1)
CONTAINERS = set(re.findall(r"^\s+(\w+):", cm, re.M))
RENDERABLE |= CONTAINERS
RENDERABLE |= {"page"}

TAB_CONTAINERS = {"tabs", "tabsPro", "accordion", "splitter", "progressFlow"}
ROW_CONTAINERS = {"page", "panel", "dynamicPanel", "dialog", "emptyBlock"}

COLUMN_KEYS = interface_keys("core/shared/interfaces/structure.interface.ts", "IColumn")
ROW_KEYS = interface_keys("core/shared/interfaces/structure.interface.ts", "IRow")
PAGE_KEYS = interface_keys("core/shared/interfaces/structure.interface.ts", "IPage")
ELEMENT_DS_KEYS = interface_keys("core/shared/interfaces/structure.interface.ts", "IElementDataSource")
ACTION_KEYS = interface_keys("core/shared/interfaces/element/element-action.interface.ts", "IElementActionConfig") | {"icon"}
TABLE_COL_KEYS = interface_keys("core/shared/interfaces/element/table.interface.ts", "ITableColumnConfig")
TABLE_COL_KEYS |= set(record_keys(read(os.path.join(LIB, "core/builder/datasets/properties/table-column.property.ts"))))
STATUS_RULE_KEYS = interface_keys("core/shared/interfaces/element/table.interface.ts", "ITableStatusRule")
VALIDATOR_KEYS = interface_keys("core/shared/interfaces/validator.interface.ts", "IValidator")
SETTINGS_KEYS = interface_keys("core/shared/interfaces/structure.interface.ts", "ISettings")
VARIABLE_KEYS = interface_keys("core/shared/interfaces/structure.interface.ts", "IRuntimeVariableDefinition")
DS_KEYS = interface_keys("core/shared/interfaces/structure.interface.ts", "IDataSource")

# Structural keys every element definition may carry regardless of its property dataset.
# Properties the component reads from the model but that are not exposed in the
# builder sidebar dataset. Verified by grepping the element component source.
EXTRA_PROPS = {
    "datepicker": {"includeSeconds"},
    "dateRange": {"includeSeconds"},
    "select": {"placeholder"},
    "multiSelect": {"placeholder"},
}

BASE_KEYS = {
    "name", "label", "type", "value", "hidden", "description", "labelTooltip",
    "width", "tabletWidth", "mobileWidth", "fitContent", "dependsOn", "path",
    "logicExecutionMode", "validationExecutionMode", "status", "parentName",
    "resetOnHide", "resetChildrenOnHide", "ignoreParentState", "inheritParentState",
    "validators", "events", "template",
}
# dynamicTable columns are element definitions plus the column-only extras.
DT_COL_EXTRA = set(record_keys(read(os.path.join(LIB, "core/builder/datasets/properties/dynamic-table-column.property.ts"))))

errors = []


def err(where, msg):
    errors.append(f"{where}: {msg}")


def check_element(name, el, where):
    t = el.get("type")
    if t is None:
        return  # partial snippets in docs may omit type on purpose; caller decides
    if t not in RENDERABLE:
        err(where, f"element '{name}' has unknown type '{t}'")
        return
    allowed = TYPE_PROPS.get(t)
    if allowed is None:
        return
    allowed = allowed | BASE_KEYS | EXTRA_PROPS.get(t, set())
    for k in el:
        if k not in allowed:
            err(where, f"element '{name}' ({t}): unknown property '{k}'")
    for k in ("rows", "children", "items", "fields"):
        if t in ROW_CONTAINERS and k in el:
            err(where, f"element '{name}' ({t}) must not carry '{k}'")
    for v in el.get("validators", []) or []:
        for k in v:
            if k not in VALIDATOR_KEYS:
                err(where, f"element '{name}' validator: unknown field '{k}'")
    for a in el.get("events", []) or []:
        check_action(a, f"{where} element '{name}'.events")
    for a in el.get("menuActions", []) or []:
        check_action(a, f"{where} element '{name}'.menuActions")
    ds = el.get("dataSource")
    if isinstance(ds, dict):
        for k in ds:
            if k not in ELEMENT_DS_KEYS:
                err(where, f"element '{name}'.dataSource: unknown field '{k}'")
        check_params(ds.get("params"), f"{where} element '{name}'.dataSource.params")
    if t == "table":
        for key in ("rowActions", "headerActions", "selectionActions", "rowClickActions",
                    "rowExpandActions", "expandedRowActions", "headerMenuActions"):
            for a in el.get(key, []) or []:
                check_action(a, f"{where} element '{name}'.{key}")
        for cfg_key in ("columnsConfig", "expandedColumnsConfig"):
            for c in el.get(cfg_key, []) or []:
                check_table_column(c, f"{where} element '{name}'.{cfg_key}")
        for p in el.get("params", []) or []:
            for k in p:
                if k not in {"paramName", "paramValue", "name", "value"}:
                    err(where, f"element '{name}'.params: unknown field '{k}'")
    if t == "dynamicTable":
        for c in el.get("columns", []) or []:
            check_dt_column(c, f"{where} element '{name}'.columns")


def check_table_column(c, where):
    if "key" not in c:
        err(where, f"table column missing 'key': {json.dumps(c)[:70]}")
    if "name" in c:
        err(where, "table column uses 'name'; it must use 'key'")
    for k in c:
        if k not in TABLE_COL_KEYS:
            err(where, f"unknown table column property '{k}'")
    for r in c.get("statusRules", []) or []:
        for k in r:
            if k not in STATUS_RULE_KEYS:
                err(where, f"unknown statusRule field '{k}'")
    for a in c.get("cellActions", []) or []:
        check_action(a, where + ".cellActions")
    el = c.get("element")
    if isinstance(el, dict):
        et = c.get("elementType")
        if et and et not in RENDERABLE:
            err(where, f"unknown elementType '{et}'")
        allowed = (TYPE_PROPS.get(et) or set()) | BASE_KEYS
        if et and TYPE_PROPS.get(et):
            for k in el:
                if k not in allowed:
                    err(where, f"hosted element ({et}): unknown property '{k}'")
        for a in el.get("events", []) or []:
            check_action(a, where + ".element.events")


def check_dt_column(c, where):
    t = c.get("type")
    if t and t not in RENDERABLE:
        err(where, f"dynamicTable column unknown type '{t}'")
    if "key" in c:
        err(where, "dynamicTable column uses 'key'; it must use 'name'")
    allowed = (TYPE_PROPS.get(t) or set()) | BASE_KEYS | DT_COL_EXTRA
    if t and TYPE_PROPS.get(t):
        for k in c:
            if k not in allowed:
                err(where, f"dynamicTable column ({t}): unknown property '{k}'")


def check_action(a, where):
    for k in a:
        if k not in ACTION_KEYS:
            err(where, f"unknown action field '{k}'")
    check_params(a.get("params"), where + ".params")


def check_params(params, where):
    if params is None:
        return
    if not isinstance(params, list):
        err(where, "params must be an array")
        return
    for p in params:
        if not isinstance(p, dict):
            err(where, "params entries must be {name, value} objects, not arrays")
            continue
        for k in p:
            if k not in {"name", "value", "isPlainValue"}:
                err(where, f"unknown param field '{k}'")


def walk_rows(rows, elements, where, refs):
    for r in rows:
        for k in r:
            if k not in ROW_KEYS:
                err(where, f"row has unknown key '{k}'")
        for c in r.get("columns", []):
            for k in c:
                if k not in COLUMN_KEYS:
                    err(where, f"column has unknown key '{k}'")
            ref = c.get("elementRef")
            refs.add(ref)
            t = (elements.get(ref) or {}).get("type") if elements else None
            if "rows" in c:
                if t and t not in ROW_CONTAINERS:
                    err(where, f"column '{ref}' ({t}) carries rows but is not a rows-container")
                walk_rows(c["rows"], elements, where, refs)
            if "tabRows" in c:
                if t and t not in TAB_CONTAINERS:
                    err(where, f"column '{ref}' ({t}) carries tabRows but is not a tab-container")
                for rs in c["tabRows"].values():
                    walk_rows(rs, elements, where, refs)


def check_block(obj, where):
    elements = obj.get("elements") if isinstance(obj, dict) else None
    if isinstance(elements, dict):
        for n, el in elements.items():
            if not isinstance(el, dict):
                continue
            if el.get("name") and el["name"] != n:
                err(where, f"elements key '{n}' != element.name '{el['name']}'")
            check_element(n, el, where)
    if isinstance(obj.get("settings"), dict):
        for k in obj["settings"]:
            if k not in SETTINGS_KEYS:
                err(where, f"settings: unknown field '{k}'")
        for v in obj["settings"].get("variables", []) or []:
            for k in v:
                if k not in VARIABLE_KEYS:
                    err(where, f"settings.variables: unknown field '{k}'")
    for ds in obj.get("dataSources", []) or []:
        for k in ds:
            if k not in DS_KEYS:
                err(where, f"dataSources: unknown field '{k}'")
    refs = set()
    for p in obj.get("pages", []) or []:
        for k in p:
            if k not in PAGE_KEYS:
                err(where, f"page has unknown key '{k}'")
        refs.add(p.get("name"))
        walk_rows(p.get("rows", []), elements, where, refs)
    if elements and obj.get("pages"):
        for r in refs:
            if r not in elements:
                err(where, f"elementRef '{r}' has no elements entry")
        for n in elements:
            if n not in refs:
                err(where, f"element '{n}' is never referenced in pages")


def main(files):
    total = 0
    for f in files:
        path = os.path.join(DOCS, f)
        text = read(path)
        pattern = r"(<!-- deliberately incorrect.*?-->\s*)?```json\n(.*?)\n```"
        for i, (skip, block) in enumerate(re.findall(pattern, text, re.S)):
            if skip:
                continue
            try:
                obj = json.loads(block)
            except Exception as e:
                err(f"{f}#{i}", f"invalid JSON: {e}")
                continue
            if not isinstance(obj, dict):
                continue
            total += 1
            check_block(obj, f"{f}#{i}")
    print(f"checked {total} JSON blocks")
    if errors:
        print(f"{len(errors)} problems:")
        for e in errors:
            print("  -", e)
        sys.exit(1)
    print("all clean")


if __name__ == "__main__":
    main(sys.argv[1:] or sorted(f for f in os.listdir(DOCS) if f.endswith(".md")))
