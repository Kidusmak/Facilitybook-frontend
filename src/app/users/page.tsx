"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import axios from "axios";
import { AppShell } from "@/components/layout/app-shell";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import api from "@/services/api";

import {
  addUser,
  removeUser,
  setUsers,
  updateUser,
} from "@/features/users/userSlice";

import type {
  FacilityUser,
  UserRole,
} from "@/features/users/userSlice";

import {
  UserPageHeader,
} from "@/components/users/user-page-header";

import {
  UserStats,
} from "@/components/users/user-stats";

import {
  UserAccountSummary,
} from "@/components/users/user-account-summary";

import {
  UserRoleInformation,
} from "@/components/users/user-role-information";

import {
  UserFilters,
} from "@/components/users/user-filters";

import {
  UserTable,
} from "@/components/users/user-table";

import {
  UserFormDialog,
  type UserFormData,
} from "@/components/users/user-form-dialog";
import { RemoveUserDialog } from "@/components/users/remove-user-dialog";

const emptyForm: UserFormData = {
  name: "",
  email: "",
  department: "",
  role: "EMPLOYEE",
  password: "",
};

interface ApiUser {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  departmentId: number | null;
  departmentName: string | null;
  active: boolean;
}

interface ApiDepartment {
  id: number;
  name: string;
}

interface ApiRole {
  id: number;
  name: UserRole;
}

interface PageResponse<T> {
  content: T[];
  totalPages: number;
}

interface ApiError {
  message?: string;
}

function toFacilityUser(user: ApiUser): FacilityUser {
  return {
    id: user.id,
    name: user.fullName,
    email: user.email,
    department: user.departmentName ?? "Unassigned",
    role: user.role,
    status: user.active ? "Active" : "Inactive",
  };
}

function requestErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiError>(error)) {
    if (!error.response) {
      return "Cannot connect to the backend. Check that the server is running.";
    }

    return error.response.data?.message ?? `${fallback} (HTTP ${error.response.status}).`;
  }

  return fallback;
}

export default function UsersPage() {
  // Redux state and dispatch
  const dispatch = useAppDispatch();

  const users = useAppSelector((state) => state.users.items);
  const currentUserId = useAppSelector(
    (state) => state.auth.user?.id ?? null
  );

  // Local UI state
  const [departments, setDepartments] = useState<ApiDepartment[]>([]);
  const [roleOptions, setRoleOptions] = useState<ApiRole[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [savingUser, setSavingUser] = useState(false);
  const [pageError, setPageError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All roles");
  const [statusFilter, setStatusFilter] = useState("All statuses");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<FacilityUser | null>(null);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [selectedRemoveUserId, setSelectedRemoveUserId] = useState<number | null>(null);
  const [removingUser, setRemovingUser] = useState(false);
  const [removeError, setRemoveError] = useState("");

  const [form, setForm] = useState<UserFormData>(emptyForm);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadUsers() {
      try {
        const [firstUsersPage, departmentResponse, rolesResponse] =
          await Promise.all([
            api.get<PageResponse<ApiUser>>("/users", {
              params: { page: 0, size: 100 },
            }),
            api.get<PageResponse<ApiDepartment>>("/departments", {
              params: { page: 0, size: 100 },
            }),
            api.get<ApiRole[]>("/users/roles"),
          ]);

        const remainingUserPages = await Promise.all(
          Array.from(
            { length: Math.max(0, firstUsersPage.data.totalPages - 1) },
            (_, index) =>
              api.get<PageResponse<ApiUser>>("/users", {
                params: { page: index + 1, size: 100 },
              })
          )
        );

        if (!active) return;

        const apiUsers = [
          ...firstUsersPage.data.content,
          ...remainingUserPages.flatMap((response) => response.data.content),
        ];

        dispatch(setUsers(apiUsers.map(toFacilityUser)));
        setDepartments(departmentResponse.data.content);
        setRoleOptions(rolesResponse.data);
      } catch (error: unknown) {
        if (active) {
          setPageError(requestErrorMessage(error, "Could not load users."));
        }
      } finally {
        if (active) setLoadingUsers(false);
      }
    }

    void loadUsers();

    return () => {
      active = false;
    };
  }, [dispatch]);

  // User statistics
  const activeCount = users.filter(
    (user) => user.status === "Active"
  ).length;

  const inactiveCount = users.filter(
    (user) => user.status === "Inactive"
  ).length;

  const employeeCount = users.filter(
    (user) => user.role === "EMPLOYEE"
  ).length;

  const managerCount = users.filter((user) =>
    [
      "FACILITY_MANAGER",
      "DEPARTMENT_MANAGER",
      "RESOURCE_OPERATOR",
    ].includes(user.role)
  ).length;

  const adminCount = users.filter(
    (user) => user.role === "ADMIN"
  ).length;

  // Search and filter users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchTerm = search.toLowerCase();

      const searchMatch =
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.department.toLowerCase().includes(searchTerm);

      const roleMatch =
        roleFilter === "All roles" || user.role === roleFilter;

      const statusMatch =
        statusFilter === "All statuses" ||
        user.status === statusFilter;

      return searchMatch && roleMatch && statusMatch;
    });
  }, [users, search, roleFilter, statusFilter]);

  // Open the add-user dialog
  function openAddDialog() {
    setEditingUser(null);
    setForm({ ...emptyForm });
    setFormError("");
    setDialogOpen(true);
  }

  function openRemoveDialog() {
    setSelectedRemoveUserId(null);
    setRemoveError("");
    setRemoveDialogOpen(true);
  }

  function closeRemoveDialog() {
    if (removingUser) return;
    setRemoveDialogOpen(false);
    setSelectedRemoveUserId(null);
    setRemoveError("");
  }

  // Open the edit-user dialog
  function openEditDialog(user: FacilityUser) {
    setEditingUser(user);

    setForm({
      name: user.name,
      email: user.email,
      department: user.department === "Unassigned" ? "" : user.department,
      role: user.role,
      password: "",
    });

    setFormError("");
    setDialogOpen(true);
  }

  // Close and reset the dialog
  function closeDialog() {
    setDialogOpen(false);
    setEditingUser(null);
    setFormError("");
  }

  // Update form fields
  function handleFormChange(
    field: keyof UserFormData,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: field === "role" ? value as UserRole : value,
    }));
  }

  // Validate and save a user through the backend.
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const cleanName = form.name.trim();
    const cleanEmail = form.email.trim().toLowerCase();

    if (
      !cleanName ||
      !cleanEmail ||
      !form.role
    ) {
      setFormError("Please complete all required fields.");
      return;
    }

    if (!editingUser && form.password.length < 8) {
      setFormError("The initial password must be at least 8 characters.");
      return;
    }

    const duplicateEmail = users.some(
      (user) =>
        user.email.toLowerCase() === cleanEmail &&
        user.id !== editingUser?.id
    );

    if (duplicateEmail) {
      setFormError(
        "A user with this email address already exists."
      );
      return;
    }

    if (editingUser?.department !== "Unassigned" && editingUser && !form.department) {
      setFormError("Choose a department to keep the existing assignment.");
      return;
    }

    const role = roleOptions.find((option) => option.name === form.role);
    if (!role) {
      setFormError("The selected role is unavailable. Reload the page and try again.");
      return;
    }

    const department = departments.find(
      (option) => option.name === form.department
    );
    if (form.department && !department) {
      setFormError("The selected department is unavailable. Reload the page and try again.");
      return;
    }

    setSavingUser(true);
    try {
      if (editingUser) {
        const updateRequest: {
          fullName: string;
          roleId: number;
          departmentId?: number;
        } = {
          fullName: cleanName,
          roleId: role.id,
        };
        if (department) updateRequest.departmentId = department.id;

        const response = await api.put<ApiUser>(
          `/users/${editingUser.id}`,
          updateRequest
        );
        dispatch(updateUser(toFacilityUser(response.data)));
      } else {
        const response = await api.post<ApiUser>("/users", {
          fullName: cleanName,
          email: cleanEmail,
          password: form.password,
          roleId: role.id,
          departmentId: department?.id ?? null,
          active: true,
        });
        dispatch(addUser(toFacilityUser(response.data)));
      }

      setPageError("");
      closeDialog();
    } catch (error: unknown) {
      setFormError(requestErrorMessage(error, "Could not save this user."));
    } finally {
      setSavingUser(false);
    }
  }

  // Activate or deactivate a user through the backend.
  async function handleToggleStatus(userId: number) {
    const user = users.find((item) => item.id === userId);
    if (!user) return;

    setPageError("");
    try {
      const response = await api.put<ApiUser>(`/users/${userId}`, {
        active: user.status !== "Active",
      });
      dispatch(updateUser(toFacilityUser(response.data)));
    } catch (error: unknown) {
      setPageError(requestErrorMessage(error, "Could not update account status."));
    }
  }

  async function handleRemoveUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRemoveError("");

    if (selectedRemoveUserId === null) {
      setRemoveError("Select a user to remove.");
      return;
    }

    if (selectedRemoveUserId === currentUserId) {
      setRemoveError("You cannot remove your own account.");
      return;
    }

    setRemovingUser(true);
    try {
      await api.delete(`/users/${selectedRemoveUserId}`);
      dispatch(removeUser(selectedRemoveUserId));
      setPageError("");
      setRemoveDialogOpen(false);
      setSelectedRemoveUserId(null);
    } catch (error: unknown) {
      setRemoveError(requestErrorMessage(error, "Could not remove this user."));
    } finally {
      setRemovingUser(false);
    }
  }

  return (
    <AppShell>
      <main className="min-w-0 space-y-6 pb-8">

        {/* Page heading */}
        <UserPageHeader onAdd={openAddDialog} onRemove={openRemoveDialog} />

        {/* User statistics */}
        <UserStats
          total={users.length}
          employees={employeeCount}
          managers={managerCount}
          administrators={adminCount}
        />

        {/* Active and inactive account summaries */}
        <UserAccountSummary
          active={activeCount}
          inactive={inactiveCount}
        />

        {/* Information about platform roles */}
        <UserRoleInformation />

        {/* Users table and filters */}
        {pageError && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {pageError}
          </div>
        )}

        {loadingUsers ? (
          <p className="py-8 text-center text-sm text-slate-500">
            Loading users from the database...
          </p>
        ) : (
          <UserTable
            users={filteredUsers}
            totalUsers={users.length}
            filters={
              <UserFilters
                search={search}
                roleFilter={roleFilter}
                statusFilter={statusFilter}
                onSearchChange={setSearch}
                onRoleChange={setRoleFilter}
                onStatusChange={setStatusFilter}
              />
            }
            onEdit={openEditDialog}
            onToggleStatus={handleToggleStatus}
          />
        )}

        {/* Add and edit user dialog */}
        <UserFormDialog
          open={dialogOpen}
          editing={editingUser !== null}
          saving={savingUser}
          departments={departments}
          form={form}
          error={formError}
          onClose={closeDialog}
          onSubmit={handleSubmit}
          onChange={handleFormChange}
        />

        <RemoveUserDialog
          open={removeDialogOpen}
          users={users}
          currentUserId={currentUserId}
          selectedUserId={selectedRemoveUserId}
          removing={removingUser}
          error={removeError}
          onClose={closeRemoveDialog}
          onSelect={setSelectedRemoveUserId}
          onSubmit={handleRemoveUser}
        />

      </main>
    </AppShell>
  );
}
