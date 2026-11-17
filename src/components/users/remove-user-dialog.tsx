import { Trash2, X } from "lucide-react";
import type { FormEvent } from "react";
import type { FacilityUser } from "@/features/users/userSlice";

interface RemoveUserDialogProps {
  open: boolean;
  users: FacilityUser[];
  currentUserId: number | null;
  selectedUserId: number | null;
  removing: boolean;
  error: string;
  onClose: () => void;
  onSelect: (userId: number | null) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function RemoveUserDialog({
  open,
  users,
  currentUserId,
  selectedUserId,
  removing,
  error,
  onClose,
  onSelect,
  onSubmit,
}: RemoveUserDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !removing) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="remove-user-title"
        className="my-auto w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 id="remove-user-title" className="text-lg font-bold text-slate-950">
              Remove user
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Select the account you want to permanently remove.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={removing}
            aria-label="Close dialog"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5 p-6">
          <div>
            <label
              htmlFor="remove-user-select"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              User account
            </label>
            <select
              id="remove-user-select"
              required
              value={selectedUserId ?? ""}
              onChange={(event) =>
                onSelect(event.target.value ? Number(event.target.value) : null)
              }
              disabled={removing || users.length === 0}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 disabled:bg-slate-50"
            >
              <option value="">Select a user</option>
              {users.map((user) => (
                <option
                  key={user.id}
                  value={user.id}
                  disabled={user.id === currentUserId}
                >
                  {user.name} — {user.email}
                  {user.id === currentUserId ? " (current account)" : ""}
                </option>
              ))}
            </select>
          </div>

          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm leading-5 text-amber-800">
            Accounts with reservation, approval, or maintenance history cannot
            be removed. Deactivate those accounts instead.
          </p>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={removing}
              className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={removing || selectedUserId === null}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-700 px-5 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 size={16} />
              {removing ? "Removing..." : "Remove user"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
