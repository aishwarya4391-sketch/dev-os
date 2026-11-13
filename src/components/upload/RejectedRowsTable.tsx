import type { UploadResult } from '@/types/api'

const MAX_SHOWN = 50

export function RejectedRowsTable({ rows }: { rows: UploadResult['rejected_rows'] }) {
  const shown = rows.slice(0, MAX_SHOWN)
  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-x-auto rounded-lg border border-border-default bg-bg-primary">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border-default bg-bg-surface">
              <th scope="col" className="px-4 py-2 text-caption text-text-secondary">
                Row
              </th>
              <th scope="col" className="px-4 py-2 text-caption text-text-secondary">
                Reason
              </th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.row} className="border-b border-border-default last:border-b-0">
                <td className="px-4 py-2 text-caption text-text-primary">{r.row}</td>
                <td className="px-4 py-2 text-caption text-text-primary">{r.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > MAX_SHOWN && (
        <p className="text-caption text-text-secondary">
          Showing {MAX_SHOWN} of {rows.length}. Download the CSV for all rows.
        </p>
      )}
    </div>
  )
}
