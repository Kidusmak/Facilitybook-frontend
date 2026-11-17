import { Plus, Trash2, Users } from "lucide-react";

interface UserPageHeaderProps {
  onAdd: () => void;
  onRemove: () => void;
}

export function UserPageHeader({ onAdd, onRemove }: UserPageHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-700">
          <Users size={16} />
          Administration
          <span className="text-slate-400">/</span>
          <span className="text-slate-500">Users</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          User Management
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Manage employee accounts, departments, access roles and account
          status across your organization.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 text-sm font-semibold text-red-700 shadow-sm transition hover:bg-red-50"
        >
          <Trash2 size={17} />
          Remove user
        </button>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
        >
          <Plus size={18} />
          Add user
        </button>
      </div>
    </div>
  );
}
