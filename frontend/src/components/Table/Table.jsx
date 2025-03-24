// Reusable Table Component: Table.jsx
import React from "react";

const Table = ({ columns, data, renderRowActions }) => {
  return (
    <div className="overflow-x-auto">
      <div className="flex flex-col">
        <div className="inline-block min-w-full py-2 sm:px-6 lg:px-3">
          <div className="overflow-hidden">
            {data.length === 0 ? (
              <p className="text-center text-gray-500">No data found.</p>
            ) : (
              <table className="min-w-full text-left text-sm font-light">
                <thead className="border-b font-medium hidden md:table-header-group">
                  <tr>
                    {columns.map((header) => (
                      <th key={header.accessor} className="px-4 py-4">
                        {header.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr key={index} className="border-b transition duration-300 ease-in-out hover:bg-neutral-100">
                      {columns.map((column) => (
                        <td key={column.accessor} className="whitespace-nowrap px-4 py-4">
                          {column.cell(item)}
                        </td>
                      ))}
                      {renderRowActions && (
                        <td className="whitespace-nowrap px-4 py-4">
                          {renderRowActions(item)}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Table;
