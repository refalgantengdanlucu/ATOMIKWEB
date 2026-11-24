interface SkeletonBlockProps {
  className: string;
}

export function SkeletonBlock({ className }: SkeletonBlockProps) {
  return <span aria-hidden="true" className={`skeleton ${className}`} />;
}

interface SkeletonTableProps {
  columns: number;
  minWidthClassName: string;
}

export function SkeletonTable({ columns, minWidthClassName }: SkeletonTableProps) {
  const columnIndexes = Array.from({ length: columns }, (_, index) => index);
  const rowIndexes = Array.from({ length: 3 }, (_, index) => index);

  return (
    <div role="status" aria-busy="true" className="overflow-x-auto">
      <span className="sr-only">Memuat data...</span>
      <table aria-hidden="true" className={`w-full ${minWidthClassName} text-left`}>
        <thead>
          <tr className="border-b border-[#F1E5D8]">
            {columnIndexes.map((column) => (
              <th key={column} className="px-3 py-3">
                <SkeletonBlock className="h-3.5 w-3/4 rounded" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowIndexes.map((row) => (
            <tr key={row} className="border-b border-[#F1E5D8]/70">
              {columnIndexes.map((column) => (
                <td key={column} className="px-3 py-4">
                  <SkeletonBlock className={`h-3.5 rounded ${column === 0 ? 'w-3/4' : 'w-1/2'}`} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
