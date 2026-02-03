import React from "react";
import Button from "./Button";

export default function Table({ columns, rows, rowKey = "id", actions }) {
  const getRowKey = (row) => (typeof rowKey === "function" ? rowKey(row) : row[rowKey]);

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key}>{c.header}</th>
            ))}
            {actions && actions.length > 0 && <th>Akcije</th>}
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={getRowKey(row)}>
              {columns.map((c) => (
                <td key={c.key}>
                  {c.render ? c.render(row) : String(row[c.key] ?? "-")}
                </td>
              ))}

              {actions && actions.length > 0 && (
                <td>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {actions
                      .filter((a) => (a.show ? a.show(row) : true))
                      .map((a, idx) => (
                        <Button
                          key={idx}
                          variant={a.variant || "ghost"}
                          type="button"
                          onClick={() => a.onClick(row)}
                          disabled={a.disabled ? a.disabled(row) : false}
                        >
                          {a.label}
                        </Button>
                      ))}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
