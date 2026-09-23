"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getModuleIcon, isCustomIconUrl, MODULE_ICONS } from "../module-icons";
import { ModalPortal } from "../modal-portal";
import { handleIconFileSelect } from "@/lib/icon-upload";
import { PasswordInput } from "../password-input";

const ICON_OPTIONS = Object.keys(MODULE_ICONS);

export type Role = { id: string; name: string };

export type UserRow = {
  id: string;
  name: string;
  email: string;
  status: "ACTIVE" | "INACTIVE" | "INVITED";
  roleId: string;
  role: Role;
};

export type LinkRow = {
  id: string;
  title: string;
  url: string;
  description: string | null;
  icon: string | null;
  password: string | null;
  order: number;
  moduleId: string;
};

export type ModuleRow = {
  id: string;
  key: string;
  label: string;
  icon: string;
  route: string;
  order: number;
  isActive: boolean;
  permissionKey: string;
  links: LinkRow[];
};

export type AuditLogRow = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata: unknown;
  createdAt: string;
  actor: { id: string; name: string; email: string } | null;
};

export type PermissionGrant = { roleId: string; moduleId: string };

export type ModuleAdminRow = {
  id: string;
  user: { id: string; name: string; email: string };
  module: { id: string; key: string; label: string; icon: string };
};

export type AccessRequestRow = {
  id: string;
  name: string;
  reason: string;
  referredBy: string;
  createdAt: string;
};

export type AdminData = {
  users: UserRow[];
  roles: Role[];
  modules: ModuleRow[];
  auditLogs: AuditLogRow[];
  auditLogsTotal: number;
  canManageUsers: boolean;
  canManageLinks: boolean;
  canManageModules: boolean;
  permissionGrants: PermissionGrant[];
  moduleAdmins: ModuleAdminRow[];
  accessRequests: AccessRequestRow[];
};

const cardClass =
  "rounded-2xl border border-[#3a3335] bg-[#211d1f]/85 p-5 backdrop-blur-xl";
const inputClass =
  "w-full rounded-lg border border-[#3a3335] bg-[#181516] px-3 py-2 text-sm text-white outline-none transition-all focus:border-[#ca2027] focus:shadow-[0_0_0_3px_rgba(202,32,39,0.15)]";
const buttonClass =
  "rounded-lg bg-gradient-to-r from-[#ca2027] to-[#a8181e] px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(202,32,39,0.4)] transition-transform hover:scale-[1.015] disabled:opacity-60";
const dangerButtonClass =
  "rounded-lg border border-red-800 bg-red-950/40 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-900/50";
const ghostButtonClass =
  "rounded-lg border border-[#3a3335] bg-[#181516] px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-[#2a2426]";


function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function LinkChainIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    </svg>
  );
}

function GridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
}

function ClockListIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
      />
    </svg>
  );
}

function KeyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
      />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
      />
    </svg>
  );
}

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.166L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

function CrownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l3.5 4L12 4l5.5 8L21 8l-2 10H5L3 8z" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243L9.88 9.88" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
      />
    </svg>
  );
}

function DotIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

function RoleBadge({ roleName }: { roleName: string }) {
  const name = roleName?.toLowerCase?.() ?? "";
  if (name === "admin") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-[#ca2027]/40 bg-[#ca2027]/15 px-2 py-0.5 text-xs font-medium text-[#ff8a8d]">
        <CrownIcon className="h-3 w-3" /> {roleName}
      </span>
    );
  }
  if (name === "editor") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-300">
        <PencilIcon className="h-3 w-3" /> {roleName}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-zinc-500/30 bg-zinc-500/15 px-2 py-0.5 text-xs font-medium text-zinc-300">
      <EyeIcon className="h-3 w-3" /> {roleName}
    </span>
  );
}

const STATUS_LABELS: Record<UserRow["status"], string> = {
  ACTIVE: "Ativo",
  INACTIVE: "Inativo",
  INVITED: "Convidado",
};

const STATUS_CLASSES: Record<UserRow["status"], string> = {
  ACTIVE: "border-emerald-500/30 bg-emerald-500/15 text-emerald-300",
  INACTIVE: "border-zinc-500/30 bg-zinc-500/15 text-zinc-400",
  INVITED: "border-sky-500/30 bg-sky-500/15 text-sky-300",
};

function StatusBadge({ status }: { status: UserRow["status"] }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_CLASSES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export default function AdminPanel({
  initialUsers,
  roles,
  initialModules,
  initialAuditLogs,
  initialAuditLogsTotal,
  canManageUsers,
  canManageLinks,
  canManageModules,
  initialPermissionGrants,
  initialModuleAdmins,
  initialAccessRequests,
}: {
  initialUsers: UserRow[];
  roles: Role[];
  initialModules: ModuleRow[];
  initialAuditLogs: AuditLogRow[];
  initialAuditLogsTotal: number;
  canManageUsers: boolean;
  canManageLinks: boolean;
  canManageModules: boolean;
  initialPermissionGrants: PermissionGrant[];
  initialModuleAdmins: ModuleAdminRow[];
  initialAccessRequests: AccessRequestRow[];
}) {
  const [users, setUsers] = useState(initialUsers);
  const [modules, setModules] = useState(initialModules);
  const [auditTotal, setAuditTotal] = useState(initialAuditLogsTotal);
  const [moduleAdmins, setModuleAdmins] = useState(initialModuleAdmins);
  const [accessRequests, setAccessRequests] = useState(initialAccessRequests);
  const router = useRouter();

  function refresh() {
    router.refresh();
  }

  const activeUsers = users.filter((u) => u.status === "ACTIVE").length;
  const invitedUsers = users.filter((u) => u.status === "INVITED").length;
  const totalLinks = modules.reduce((acc, m) => acc + m.links.length, 0);
  const activeModules = modules.filter((m) => m.isActive).length;

  const ALL_TABS = [
    { key: "users", label: "Usuários", show: canManageUsers },
    { key: "links", label: "Links", show: canManageLinks },
    { key: "modules", label: "Módulos", show: canManageModules },
    { key: "module-access", label: "Acesso módulo", show: canManageUsers },
    { key: "access-requests", label: "Solicitações", show: canManageUsers },
    { key: "permissions", label: "Permissões", show: canManageUsers },
    { key: "audit", label: "Auditoria", show: canManageUsers },
  ] as const;
  const TABS = ALL_TABS.filter((t) => t.show);
  const [tab, setTab] = useState<(typeof ALL_TABS)[number]["key"]>(TABS[0]?.key ?? "users");

  if (TABS.length === 0) {
    return (
      <p className="text-sm text-zinc-400">
        Seu papel não tem permissão de gestão em nenhuma seção do Admin.
      </p>
    );
  }

  return (
    <div>
      <div className="fade-in-up mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {canManageUsers && (
          <StatCard
            label="Usuários"
            value={users.length}
            hint={`${activeUsers} ativos · ${invitedUsers} convidados`}
            icon={<UsersIcon className="h-4 w-4" />}
            accentClass="bg-sky-400/10 text-sky-400"
          />
        )}
        <StatCard
          label="Links"
          value={totalLinks}
          hint={`em ${modules.length} módulos`}
          icon={<LinkChainIcon className="h-4 w-4" />}
          accentClass="bg-emerald-400/10 text-emerald-400"
        />
        <StatCard
          label="Módulos ativos"
          value={activeModules}
          hint={`de ${modules.length} cadastrados`}
          icon={<GridIcon className="h-4 w-4" />}
          accentClass="bg-green-400/10 text-green-400"
        />
        {canManageUsers && (
          <StatCard
            label="Ações registradas"
            value={auditTotal}
            hint="no log de auditoria"
            icon={<ClockListIcon className="h-4 w-4" />}
            accentClass="bg-amber-400/10 text-amber-400"
          />
        )}
      </div>

      <div className="fade-in-up mb-6 flex gap-1 overflow-x-auto rounded-full border border-[#3a3335] bg-[#181516]/90 p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300 ${
              tab === t.key
                ? "bg-gradient-to-r from-[#ca2027] to-[#a8181e] text-white shadow-[0_0_14px_rgba(202,32,39,0.45)]"
                : "text-zinc-400 hover:bg-[#2a2426] hover:text-white"
            }`}
          >
            {t.key === "users" && <UsersIcon className="h-4 w-4" />}
            {t.key === "links" && <LinkChainIcon className="h-4 w-4" />}
            {t.key === "modules" && <GridIcon className="h-4 w-4" />}
            {t.key === "module-access" && <KeyIcon className="h-4 w-4" />}
            {t.key === "access-requests" && <MailIcon className="h-4 w-4" />}
            {t.key === "permissions" && <ShieldIcon className="h-4 w-4" />}
            {t.key === "audit" && <ClockListIcon className="h-4 w-4" />}
            {t.label}
            {t.key === "access-requests" && accessRequests.length > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-white/20 px-1 text-[10px] font-bold">
                {accessRequests.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "users" && canManageUsers && (
        <UsersSection users={users} setUsers={setUsers} roles={roles} modules={modules} onChange={refresh} />
      )}
      {tab === "links" && canManageLinks && (
        <LinksSection modules={modules} setModules={setModules} onChange={refresh} />
      )}
      {tab === "modules" && canManageModules && (
        <ModulesSection modules={modules} setModules={setModules} roles={roles} onChange={refresh} />
      )}
      {tab === "module-access" && canManageUsers && (
        <ModuleAccessSection
          modules={modules}
          users={users}
          moduleAdmins={moduleAdmins}
          setModuleAdmins={setModuleAdmins}
        />
      )}
      {tab === "access-requests" && canManageUsers && (
        <AccessRequestsSection requests={accessRequests} setRequests={setAccessRequests} />
      )}
      {tab === "permissions" && canManageUsers && (
        <PermissionsSection modules={modules} roles={roles} initialGrants={initialPermissionGrants} />
      )}
      {tab === "audit" && canManageUsers && (
        <AuditLogSection
          initialLogs={initialAuditLogs}
          initialTotal={initialAuditLogsTotal}
          onTotalChange={setAuditTotal}
        />
      )}
    </div>
  );
}

function CollapsibleForm({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mb-6 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#3a3335] py-3 text-sm font-medium text-zinc-400 transition-colors hover:border-[#ca2027]/60 hover:text-white"
      >
        <span className="text-lg leading-none">+</span> {label}
      </button>
    );
  }

  return (
    <div className="mb-6 rounded-xl border border-[#ca2027]/40 bg-[#181516]/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-zinc-200">{label}</span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-zinc-500 hover:text-zinc-300"
        >
          Fechar
        </button>
      </div>
      {children}
    </div>
  );
}

function Modal({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <ModalPortal onClose={onClose}>
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">{children}</div>
    </ModalPortal>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon,
  accentClass,
}: {
  label: string;
  value: number;
  hint: string;
  icon: React.ReactNode;
  accentClass: string;
}) {
  return (
    <div className={`${cardClass} !p-4`}>
      <div className="mb-2 flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</p>
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${accentClass}`}>
          {icon}
        </span>
      </div>
      <p className="mt-1 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-2xl font-bold text-transparent">
        {value}
      </p>
      <p className="mt-1 text-xs text-zinc-500">{hint}</p>
    </div>
  );
}

function UsersSection({
  users,
  setUsers,
  roles,
  modules,
  onChange,
}: {
  users: UserRow[];
  setUsers: (u: UserRow[]) => void;
  roles: Role[];
  modules: ModuleRow[];
  onChange: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    roleId: roles[0]?.id ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ q: "", role: "", status: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleFilter() {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.role) params.set("role", filters.role);
    if (filters.status) params.set("status", filters.status);
    const res = await fetch(`/api/users?${params.toString()}`);
    if (res.ok) {
      setUsers(await res.json());
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) {
      const created = await res.json();
      setUsers([created, ...users]);
      setForm({ name: "", email: "", password: "", roleId: roles[0]?.id ?? "" });
      onChange();
    } else {
      const data = await res.json();
      setError(typeof data.error === "string" ? data.error : "Erro ao criar usuário");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este usuário?")) return;
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    if (res.ok) {
      setUsers(users.filter((u) => u.id !== id));
      onChange();
    }
  }

  async function handleToggleStatus(user: UserRow) {
    const status = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const res = await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setUsers(users.map((u) => (u.id === user.id ? { ...u, status } : u)));
      onChange();
    }
  }

  async function handleSaveEdit(
    user: UserRow,
    patch: { roleId: string; status: UserRow["status"]; password?: string }
  ) {
    const res = await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      const updated: UserRow = await res.json();
      setUsers(users.map((u) => (u.id === user.id ? updated : u)));
      setEditingId(null);
      onChange();
      return true;
    }
    return false;
  }

  return (
    <section className={`${cardClass} mb-8`}>
      <h2 className="mb-4 text-lg font-semibold text-white">Usuários</h2>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
        <input
          className={inputClass}
          placeholder="Buscar por nome ou email"
          value={filters.q}
          onChange={(e) => setFilters({ ...filters, q: e.target.value })}
        />
        <select
          className={inputClass}
          value={filters.role}
          onChange={(e) => setFilters({ ...filters, role: e.target.value })}
        >
          <option value="">Todos os papéis</option>
          {roles.map((r) => (
            <option key={r.id} value={r.name}>
              {r.name}
            </option>
          ))}
        </select>
        <select
          className={inputClass}
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">Todos os status</option>
          <option value="ACTIVE">Ativo</option>
          <option value="INACTIVE">Inativo</option>
          <option value="INVITED">Convidado</option>
        </select>
        <button type="button" onClick={handleFilter} className={ghostButtonClass}>
          Filtrar
        </button>
      </div>

      {error && <p className="mb-4 text-sm text-[#ff6b70]">{error}</p>}

      <CollapsibleForm label="Novo usuário">
        <form onSubmit={handleCreate} className="grid grid-cols-1 gap-3 sm:grid-cols-5">
          <input
            className={inputClass}
            placeholder="Nome"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            className={inputClass}
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            className={inputClass}
            placeholder="Senha"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <select
            className={inputClass}
            value={form.roleId}
            onChange={(e) => setForm({ ...form, roleId: e.target.value })}
          >
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={loading}
            className={buttonClass}
            title="Cria um novo usuário com a senha definida acima"
          >
            {loading ? "Criando..." : "Adicionar"}
          </button>
        </form>
      </CollapsibleForm>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-zinc-400">
              <th className="pb-2">Nome</th>
              <th className="pb-2">Email</th>
              <th className="pb-2">Papel</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) =>
              editingId === u.id ? (
                <UserEditRow
                  key={u.id}
                  user={u}
                  roles={roles}
                  modules={modules}
                  onCancel={() => setEditingId(null)}
                  onSave={(patch) => handleSaveEdit(u, patch)}
                />
              ) : (
                <tr key={u.id} className="border-t border-[#3a3335]">
                  <td className="py-2 text-zinc-100">{u.name}</td>
                  <td className="py-2 text-zinc-400">{u.email}</td>
                  <td className="py-2">
                    <RoleBadge roleName={u.role.name} />
                  </td>
                  <td className="py-2">
                    <StatusBadge status={u.status} />
                  </td>
                  <td className="py-2">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setEditingId(u.id)}
                        className={`inline-flex items-center gap-1 ${ghostButtonClass}`}
                        title="Editar informações"
                      >
                        <PencilIcon className="h-3.5 w-3.5" /> Editar
                      </button>
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={ghostButtonClass}
                        title="Alterna o acesso do usuário ao painel"
                      >
                        {u.status === "ACTIVE" ? "Desativar" : "Ativar"}
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        className={`inline-flex items-center gap-1 ${dangerButtonClass}`}
                        title="Ação permanente — não pode ser desfeita"
                      >
                        <TrashIcon className="h-3.5 w-3.5" /> Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

type OverrideState = "inherit" | "allow" | "block";

function UserEditRow({
  user,
  roles,
  modules,
  onCancel,
  onSave,
}: {
  user: UserRow;
  roles: Role[];
  modules: ModuleRow[];
  onCancel: () => void;
  onSave: (patch: { roleId: string; status: UserRow["status"]; password?: string }) => Promise<boolean>;
}) {
  const [roleId, setRoleId] = useState(user.roleId);
  const [status, setStatus] = useState<UserRow["status"]>(user.status);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [overrides, setOverrides] = useState<Record<string, OverrideState>>({});
  const [overridesLoading, setOverridesLoading] = useState(true);
  const [pendingModuleId, setPendingModuleId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/users/${user.id}/module-overrides`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: { moduleId: string; granted: boolean }[]) => {
        if (cancelled) return;
        const map: Record<string, OverrideState> = {};
        for (const o of data) map[o.moduleId] = o.granted ? "allow" : "block";
        setOverrides(map);
      })
      .finally(() => {
        if (!cancelled) setOverridesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  async function handleOverrideChange(moduleId: string, state: OverrideState) {
    setPendingModuleId(moduleId);
    const prev = overrides[moduleId] ?? "inherit";
    setOverrides((o) => ({ ...o, [moduleId]: state }));
    const res = await fetch(`/api/users/${user.id}/module-overrides`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moduleId, state }),
    });
    setPendingModuleId(null);
    if (!res.ok) {
      setOverrides((o) => ({ ...o, [moduleId]: prev }));
    }
  }

  async function handleSave() {
    if (newPassword && newPassword.length < 6) {
      setError("A nova senha precisa ter no mínimo 6 caracteres.");
      return;
    }
    setSaving(true);
    setError("");
    const ok = await onSave({ roleId, status, password: newPassword || undefined });
    setSaving(false);
    if (!ok) setError("Erro ao salvar alterações.");
  }

  const overrideOptions: {
    key: OverrideState;
    label: string;
    shortLabel: string;
    icon: (props: { className?: string }) => React.ReactNode;
    activeClass: string;
  }[] = [
    {
      key: "inherit",
      label: "Padrão (papel)",
      shortLabel: "Padrão",
      icon: DotIcon,
      activeClass: "border-zinc-400 bg-zinc-400/15 text-zinc-200",
    },
    {
      key: "allow",
      label: "Sempre mostrar",
      shortLabel: "Mostrar",
      icon: EyeIcon,
      activeClass: "border-emerald-500 bg-emerald-500/15 text-emerald-300",
    },
    {
      key: "block",
      label: "Sempre ocultar",
      shortLabel: "Ocultar",
      icon: EyeOffIcon,
      activeClass: "border-[#ca2027] bg-[#ca2027]/15 text-[#ff8a8d]",
    },
  ];

  const overrideBadge: Record<OverrideState, { label: string; className: string }> = {
    inherit: { label: "Padrão do papel", className: "border-zinc-500/30 bg-zinc-500/10 text-zinc-400" },
    allow: { label: "Sempre visível", className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" },
    block: { label: "Sempre oculto", className: "border-[#ca2027]/30 bg-[#ca2027]/10 text-[#ff8a8d]" },
  };

  const selectedRole = roles.find((r) => r.id === roleId);
  const passwordTooShort = newPassword.length > 0 && newPassword.length < 6;

  return (
    <>
      <tr className="border-t border-[#ca2027]/40 bg-[#181516]">
        <td className="py-4" colSpan={5}>
          <div className="rounded-xl border border-[#ca2027]/30 bg-[#141112] p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <p className="font-medium text-zinc-100">{user.name}</p>
                <span className="text-xs text-zinc-500">{user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                {selectedRole && <RoleBadge roleName={selectedRole.name} />}
                <StatusBadge status={status} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr_1.4fr]">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-400">Papel</label>
                <select className={inputClass} value={roleId} onChange={(e) => setRoleId(e.target.value)}>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-400">Status</label>
                <select
                  className={inputClass}
                  value={status}
                  onChange={(e) => setStatus(e.target.value as UserRow["status"])}
                >
                  <option value="ACTIVE">Ativo</option>
                  <option value="INACTIVE">Inativo</option>
                  <option value="INVITED">Convidado</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-400">
                  Redefinir senha <span className="font-normal text-zinc-500">(opcional)</span>
                </label>
                <div className="relative">
                  <input
                    className={`${inputClass} pr-10`}
                    type={showPassword ? "text" : "password"}
                    placeholder="Deixe em branco para manter a atual"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-500 transition-colors hover:text-zinc-200"
                    title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </button>
                </div>
                <p className={`mt-1 text-[11px] ${passwordTooShort ? "text-[#ff6b70]" : "text-zinc-500"}`}>
                  {newPassword ? "Mínimo 6 caracteres." : "O usuário mantém a senha atual se este campo ficar vazio."}
                </p>
              </div>
            </div>

            {error && <p className="mt-3 text-xs text-[#ff6b70]">{error}</p>}

            <div className="mt-4 flex justify-end gap-2 border-t border-[#3a3335] pt-3">
              <button type="button" onClick={onCancel} className={ghostButtonClass}>
                Cancelar
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className={buttonClass}
                title="Salvar alterações"
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </td>
      </tr>
      <tr className="border-t border-[#ca2027]/20 bg-[#181516]">
        <td className="py-4" colSpan={5}>
          <div className="rounded-xl border border-[#3a3335] bg-[#141112] p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#ca2027]/10 text-[#ff8a8d]">
                <ShieldIcon className="h-3.5 w-3.5" />
              </span>
              <p className="text-sm font-semibold text-zinc-200">Visibilidade de módulos</p>
            </div>
            <p className="mb-3 text-[11px] text-zinc-500">
              Por padrão, o acesso segue o papel ({" "}
              <span className="text-zinc-400">Padrão</span> ). Um override individual pode forçar
              mostrar ou ocultar um módulo só pra este usuário.
            </p>
            {overridesLoading ? (
              <p className="text-xs text-zinc-500">Carregando...</p>
            ) : (
              <ul className="space-y-2">
                {modules.map((m) => {
                  const currentState = overrides[m.id] ?? "inherit";
                  const badge = overrideBadge[currentState];
                  return (
                    <li
                      key={m.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#3a3335] bg-[#1c1719] px-3 py-2.5 transition-colors hover:border-[#3a3335]/80"
                    >
                      <div className="flex min-w-[160px] items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#ca2027]/10 text-[#ff8a8d]">
                          <span className="h-4 w-4 overflow-hidden rounded">{getModuleIcon(m.icon)}</span>
                        </span>
                        <div>
                          <p className="text-sm font-medium text-zinc-100">{m.label}</p>
                          <span
                            className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                        </div>
                      </div>
                      <div className="inline-flex overflow-hidden rounded-lg border border-[#3a3335]">
                        {overrideOptions.map((opt, i) => {
                          const Icon = opt.icon;
                          const isActive = currentState === opt.key;
                          return (
                            <button
                              key={opt.key}
                              type="button"
                              disabled={pendingModuleId === m.id}
                              onClick={() => handleOverrideChange(m.id, opt.key)}
                              title={opt.label}
                              className={`inline-flex items-center gap-1.5 border-l px-2.5 py-1.5 text-[11px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                                i === 0 ? "border-l-0" : "border-[#3a3335]"
                              } ${
                                isActive
                                  ? opt.activeClass
                                  : "bg-[#181516] text-zinc-500 hover:bg-[#211d1f] hover:text-zinc-300"
                              }`}
                            >
                              <Icon className="h-3 w-3" />
                              <span className="hidden sm:inline">{opt.shortLabel}</span>
                            </button>
                          );
                        })}
                      </div>
                    </li>
                  );
                })}
                {modules.length === 0 && (
                  <li className="text-xs text-zinc-500">Nenhum módulo cadastrado ainda.</li>
                )}
              </ul>
            )}
          </div>
        </td>
      </tr>
    </>
  );
}

function LinksSection({
  modules,
  setModules,
  onChange,
}: {
  modules: ModuleRow[];
  setModules: (m: ModuleRow[]) => void;
  onChange: () => void;
}) {
  const [form, setForm] = useState({
    title: "",
    url: "",
    description: "",
    password: "",
    icon: "default",
    moduleId: modules[0]?.id ?? "",
  });
  const [error, setError] = useState("");
  const [editingLink, setEditingLink] = useState<LinkRow | null>(null);
  const [editError, setEditError] = useState("");
  const [customIconUrl, setCustomIconUrl] = useState("");
  const [iconFileError, setIconFileError] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const created: LinkRow = await res.json();
      setModules(
        modules.map((m) =>
          m.id === created.moduleId ? { ...m, links: [...m.links, created] } : m
        )
      );
      setForm({ title: "", url: "", description: "", password: "", icon: "default", moduleId: modules[0]?.id ?? "" });
      setCustomIconUrl("");
      onChange();
    } else {
      const data = await res.json();
      setError(typeof data.error === "string" ? data.error : "Erro ao criar link");
    }
  }

  async function handleDelete(link: LinkRow) {
    if (!confirm("Excluir este link?")) return;
    const res = await fetch(`/api/links/${link.id}`, { method: "DELETE" });
    if (res.ok) {
      setModules(
        modules.map((m) =>
          m.id === link.moduleId ? { ...m, links: m.links.filter((l) => l.id !== link.id) } : m
        )
      );
      onChange();
    }
  }

  async function handleSaveEdit(link: LinkRow, patch: Partial<LinkRow>) {
    setEditError("");
    const res = await fetch(`/api/links/${link.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      const updated: LinkRow = await res.json();
      setModules(
        modules.map((m) => {
          if (m.id !== link.moduleId && m.id !== updated.moduleId) return m;
          const withoutOld = m.links.filter((l) => l.id !== updated.id);
          return m.id === updated.moduleId ? { ...m, links: [...withoutOld, updated] } : { ...m, links: withoutOld };
        })
      );
      setEditingLink(null);
      onChange();
    } else {
      const data = await res.json();
      setEditError(typeof data.error === "string" ? data.error : "Erro ao salvar link");
    }
  }

  return (
    <section className={`${cardClass} mb-8`}>
      <h2 className="mb-4 text-lg font-semibold text-white">Links</h2>
      <p className="mb-4 text-xs text-zinc-500">
        Cada link vira um botão clicável na aba do módulo escolhido — ao clicar, o usuário é direcionado direto para a URL.
      </p>

      {error && <p className="mb-4 text-sm text-[#ff6b70]">{error}</p>}

      <CollapsibleForm label="Novo botão/link">
        <form onSubmit={handleCreate} className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_220px]">
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Título do botão</label>
              <input
                className={inputClass}
                placeholder="Ex: Pack de Transições"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">URL de destino</label>
              <input
                className={inputClass}
                placeholder="https://..."
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Descrição (opcional)</label>
              <input
                className={inputClass}
                placeholder="Uma linha explicando o que é"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Senha do arquivo (opcional)</label>
              <PasswordInput
                inputClassName={inputClass}
                value={form.password}
                onChange={(password) => setForm({ ...form, password })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Categoria / aba</label>
              <select
                className={inputClass}
                value={form.moduleId}
                onChange={(e) => setForm({ ...form, moduleId: e.target.value })}
              >
                {modules.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs text-zinc-500">Ícone</label>
              <div className="flex flex-wrap gap-2">
                {ICON_OPTIONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => {
                      setCustomIconUrl("");
                      setForm({ ...form, icon });
                    }}
                    title={icon}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-all ${
                      form.icon === icon
                        ? "border-[#ca2027] bg-[#ca2027]/15 text-[#ff8a8d] shadow-[0_0_0_3px_rgba(202,32,39,0.15)]"
                        : "border-[#3a3335] bg-[#181516] text-zinc-400 hover:border-[#ca2027]/50 hover:text-zinc-200"
                    }`}
                  >
                    <span className="h-4 w-4">{getModuleIcon(icon)}</span>
                  </button>
                ))}
                {isCustomIconUrl(form.icon) && (
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#ca2027] bg-[#ca2027]/15 shadow-[0_0_0_3px_rgba(202,32,39,0.15)]">
                    <span className="h-5 w-5 overflow-hidden rounded">{getModuleIcon(form.icon)}</span>
                  </span>
                )}
              </div>
              <input
                className={`${inputClass} mt-2`}
                placeholder="Ou cole a URL de uma imagem (ex: um link de imagem do Google Imagens)"
                value={customIconUrl}
                onChange={(e) => {
                  const url = e.target.value;
                  setCustomIconUrl(url);
                  if (url.trim()) setForm({ ...form, icon: url.trim() });
                  else setForm({ ...form, icon: "default" });
                }}
              />
              <div className="mt-2 flex items-center gap-2">
                <label className={`${ghostButtonClass} cursor-pointer`}>
                  Enviar imagem do computador
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      setIconFileError("");
                      handleIconFileSelect(
                        e.target.files?.[0],
                        (dataUrl) => {
                          setCustomIconUrl(dataUrl);
                          setForm((f) => ({ ...f, icon: dataUrl }));
                        },
                        setIconFileError
                      );
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
              {iconFileError && <p className="mt-1 text-[11px] text-[#ff6b70]">{iconFileError}</p>}
            </div>
            <button type="submit" className={buttonClass} title="Cria um novo botão de link">
              Adicionar botão
            </button>
          </div>

          <div>
            <label className="mb-2 block text-xs text-zinc-500">Pré-visualização</label>
            <div className="animated-border rounded-2xl p-[1px]" style={{ animationPlayState: "paused" }}>
              <div className="flex h-full flex-col justify-between rounded-2xl border border-[#3a3335] bg-[#211d1f]/85 p-4 backdrop-blur-xl">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="h-4 w-4 text-[#ca2027]">{getModuleIcon(form.icon)}</span>
                    <span className="font-semibold text-zinc-50">
                      {form.title || "Título do botão"}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400">
                    {form.description || "A descrição aparece aqui."}
                  </p>
                </div>
                <span className="pressable-btn mt-4 w-fit">
                  Acessar
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </span>
              </div>
            </div>
            <p className="mt-2 text-xs text-zinc-500">
              É assim que o botão vai aparecer na aba{" "}
              <span className="text-zinc-300">
                {modules.find((m) => m.id === form.moduleId)?.label ?? ""}
              </span>
              .
            </p>
          </div>
        </form>
      </CollapsibleForm>

      <div className="space-y-8">
        {modules.map((m) => (
          <div key={m.id}>
            <h3 className="mb-3 flex items-center gap-2 rounded-r border-l-2 border-[#ca2027]/40 bg-[#ca2027]/5 px-3 py-1.5 text-sm font-semibold text-zinc-300">
              <span className="h-4 w-4 text-[#ca2027]">{getModuleIcon(m.icon)}</span>
              {m.label}
            </h3>
            {m.links.length === 0 ? (
              <p className="text-xs text-zinc-500">Nenhum link cadastrado.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {m.links.map((link) => (
                  <div
                    key={link.id}
                    className="group animated-border rounded-2xl p-[1px]"
                    style={{ animationPlayState: "paused" }}
                  >
                    <div className="flex h-full flex-col justify-between rounded-2xl border border-[#3a3335] bg-[#211d1f]/85 p-4 backdrop-blur-xl transition-colors group-hover:border-[#ca2027]/60">
                      <div>
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="h-4 w-4 shrink-0 text-[#ca2027]">
                              {getModuleIcon(link.icon ?? "default")}
                            </span>
                            <span className="truncate font-semibold text-zinc-50">{link.title}</span>
                          </div>
                          <div className="flex shrink-0 gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditError("");
                                setEditingLink(link);
                              }}
                              className="rounded-md border border-[#3a3335] bg-[#181516] p-1.5 text-zinc-400 transition-colors hover:border-[#ca2027]/50 hover:text-[#ff8a8d]"
                              title="Editar link"
                            >
                              <PencilIcon className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(link)}
                              className="rounded-md border border-red-800 bg-red-950/40 p-1.5 text-red-400 transition-colors hover:bg-red-900/50"
                              title="Excluir link"
                            >
                              <TrashIcon className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-zinc-400">{link.description}</p>
                      </div>
                      <div className="mt-4 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditError("");
                            setEditingLink(link);
                          }}
                          className="pressable-btn w-fit"
                          title="Clique para editar o link"
                        >
                          Editar link
                          <PencilIcon className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="mt-2 truncate text-[11px] text-zinc-600" title={link.url}>
                        {link.url}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {editingLink && (
        <Modal onClose={() => setEditingLink(null)}>
          <LinkEditRow
            link={editingLink}
            modules={modules}
            error={editError}
            onCancel={() => setEditingLink(null)}
            onSave={(patch) => handleSaveEdit(editingLink, patch)}
          />
        </Modal>
      )}
    </section>
  );
}

function LinkEditRow({
  link,
  modules,
  error,
  onCancel,
  onSave,
}: {
  link: LinkRow;
  modules: ModuleRow[];
  error?: string;
  onCancel: () => void;
  onSave: (patch: Partial<LinkRow>) => void;
}) {
  const [title, setTitle] = useState(link.title);
  const [url, setUrl] = useState(link.url);
  const [description, setDescription] = useState(link.description ?? "");
  const [password, setPassword] = useState(link.password ?? "");
  const [icon, setIcon] = useState(link.icon ?? "default");
  const [moduleId, setModuleId] = useState(link.moduleId);
  const [customIconUrl, setCustomIconUrl] = useState(isCustomIconUrl(link.icon ?? "") ? link.icon ?? "" : "");
  const [iconFileError, setIconFileError] = useState("");

  return (
    <div className="rounded-xl border border-[#ca2027]/40 bg-[#141112] p-4 text-sm shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#ca2027]/10 text-[#ff8a8d]">
            <PencilIcon className="h-3.5 w-3.5" />
          </span>
          <p className="text-sm font-semibold text-zinc-200">Editar link</p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md p-1 text-zinc-500 transition-colors hover:bg-[#2a2426] hover:text-zinc-200"
          title="Fechar"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {error && <p className="mb-3 text-xs text-[#ff6b70]">{error}</p>}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Título do botão</label>
            <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">URL de destino</label>
            <input className={inputClass} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Descrição</label>
            <input
              className={inputClass}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Senha do arquivo (opcional)</label>
            <PasswordInput inputClassName={inputClass} value={password} onChange={setPassword} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Categoria / aba</label>
            <select className={inputClass} value={moduleId} onChange={(e) => setModuleId(e.target.value)}>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium text-zinc-400">Ícone</label>
          <div className="flex flex-wrap gap-2">
            {ICON_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  setCustomIconUrl("");
                  setIcon(opt);
                }}
                title={opt}
                className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-all ${
                  icon === opt
                    ? "border-[#ca2027] bg-[#ca2027]/15 text-[#ff8a8d] shadow-[0_0_0_3px_rgba(202,32,39,0.15)]"
                    : "border-[#3a3335] bg-[#181516] text-zinc-400 hover:border-[#ca2027]/50 hover:text-zinc-200"
                }`}
              >
                <span className="h-4 w-4">{getModuleIcon(opt)}</span>
              </button>
            ))}
            {isCustomIconUrl(icon) && (
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#ca2027] bg-[#ca2027]/15 shadow-[0_0_0_3px_rgba(202,32,39,0.15)]">
                <span className="h-5 w-5 overflow-hidden rounded">{getModuleIcon(icon)}</span>
              </span>
            )}
          </div>
          <input
            className={`${inputClass} mt-2`}
            placeholder="Ou cole a URL de uma imagem"
            value={customIconUrl}
            onChange={(e) => {
              const value = e.target.value;
              setCustomIconUrl(value);
              setIcon(value.trim() ? value.trim() : "default");
            }}
          />
          <div className="mt-2">
            <label className={`${ghostButtonClass} inline-flex cursor-pointer`}>
              Enviar imagem do computador
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  setIconFileError("");
                  handleIconFileSelect(
                    e.target.files?.[0],
                    (dataUrl) => {
                      setCustomIconUrl(dataUrl);
                      setIcon(dataUrl);
                    },
                    setIconFileError
                  );
                  e.target.value = "";
                }}
              />
            </label>
          </div>
          {iconFileError && <p className="mt-1 text-[11px] text-[#ff6b70]">{iconFileError}</p>}
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2 border-t border-[#3a3335] pt-3">
        <button type="button" className={ghostButtonClass} onClick={onCancel}>
          Cancelar
        </button>
        <button
          type="button"
          className={buttonClass}
          onClick={() => onSave({ title, url, description, password, icon, moduleId })}
          title="Salvar alterações"
        >
          Salvar
        </button>
      </div>
    </div>
  );
}

function ModulesSection({
  modules,
  setModules,
  roles,
  onChange,
}: {
  modules: ModuleRow[];
  setModules: (m: ModuleRow[]) => void;
  roles: Role[];
  onChange: () => void;
}) {
  const [form, setForm] = useState({
    key: "",
    label: "",
    icon: "default",
    route: "",
    permissionKey: "",
  });
  const [routeTouched, setRouteTouched] = useState(false);
  const [permissionTouched, setPermissionTouched] = useState(false);
  const [customIconUrl, setCustomIconUrl] = useState("");
  const [iconFileError, setIconFileError] = useState("");
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>(
    () => roles.find((r) => r.name === "Admin")?.id ? [roles.find((r) => r.name === "Admin")!.id] : []
  );
  const [error, setError] = useState("");

  function slugify(value: string) {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function handleLabelChange(label: string) {
    const key = slugify(label);
    setForm((f) => ({
      ...f,
      label,
      key,
      route: routeTouched ? f.route : key ? `/${key}` : "",
      permissionKey: permissionTouched ? f.permissionKey : key ? `module.${key}.view` : "",
    }));
  }

  function resetForm() {
    setForm({ key: "", label: "", icon: "default", route: "", permissionKey: "" });
    setRouteTouched(false);
    setPermissionTouched(false);
    setCustomIconUrl("");
    const adminId = roles.find((r) => r.name === "Admin")?.id;
    setSelectedRoleIds(adminId ? [adminId] : []);
  }

  function toggleRole(roleId: string) {
    // Admin sempre enxerga todos os módulos, então não dá pra desmarcá-lo aqui.
    if (roles.find((r) => r.id === roleId)?.name === "Admin") return;
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/modules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, order: modules.length, roleIds: selectedRoleIds }),
    });
    if (res.ok) {
      const created: ModuleRow = await res.json();
      setModules([...modules, { ...created, links: [] }]);
      resetForm();
      onChange();
    } else {
      const data = await res.json();
      setError(typeof data.error === "string" ? data.error : "Erro ao criar módulo");
    }
  }

  const [deleteError, setDeleteError] = useState("");

  async function handleDelete(module: ModuleRow) {
    if (!confirm(`Excluir o módulo "${module.label}"? Os links dele também serão apagados.`)) return;
    setDeleteError("");
    const res = await fetch(`/api/modules/${module.id}`, { method: "DELETE" });
    if (res.ok) {
      setModules(modules.filter((m) => m.id !== module.id));
      onChange();
    } else {
      const data = await res.json();
      setDeleteError(typeof data.error === "string" ? data.error : "Erro ao excluir módulo");
    }
  }

  async function handleToggleActive(module: ModuleRow) {
    const res = await fetch(`/api/modules/${module.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !module.isActive }),
    });
    if (res.ok) {
      setModules(
        modules.map((m) => (m.id === module.id ? { ...m, isActive: !m.isActive } : m))
      );
      onChange();
    }
  }

  return (
    <section className={cardClass}>
      <h2 className="mb-4 text-lg font-semibold text-white">Módulos</h2>
      <p className="mb-4 text-xs text-zinc-500">
        Cada módulo vira uma aba no menu principal — só aparece pra quem tiver a permissão indicada.
      </p>

      {error && <p className="mb-4 text-sm text-[#ff6b70]">{error}</p>}

      <CollapsibleForm label="Novo módulo">
        <form onSubmit={handleCreate} className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_220px]">
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Nome da aba</label>
              <input
                className={inputClass}
                placeholder="Ex: Tutoriais"
                value={form.label}
                onChange={(e) => handleLabelChange(e.target.value)}
                required
              />
              <p className="mt-1 text-[11px] text-zinc-500">
                É o texto que aparece no menu. A key e a permissão abaixo são geradas automaticamente, mas você pode ajustar.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-xs text-zinc-500">Ícone</label>
              <div className="flex flex-wrap gap-2">
                {ICON_OPTIONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => {
                      setCustomIconUrl("");
                      setForm({ ...form, icon });
                    }}
                    title={icon}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-all ${
                      form.icon === icon
                        ? "border-[#ca2027] bg-[#ca2027]/15 text-[#ff8a8d] shadow-[0_0_0_3px_rgba(202,32,39,0.15)]"
                        : "border-[#3a3335] bg-[#181516] text-zinc-400 hover:border-[#ca2027]/50 hover:text-zinc-200"
                    }`}
                  >
                    <span className="h-4 w-4">{getModuleIcon(icon)}</span>
                  </button>
                ))}
                {isCustomIconUrl(form.icon) && (
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#ca2027] bg-[#ca2027]/15 shadow-[0_0_0_3px_rgba(202,32,39,0.15)]">
                    <span className="h-5 w-5 overflow-hidden rounded">{getModuleIcon(form.icon)}</span>
                  </span>
                )}
              </div>
              <div className="mt-2">
                <input
                  className={inputClass}
                  placeholder="Ou cole a URL de uma imagem (ex: um link de imagem do Google Imagens)"
                  value={customIconUrl}
                  onChange={(e) => {
                    const url = e.target.value;
                    setCustomIconUrl(url);
                    if (url.trim()) setForm({ ...form, icon: url.trim() });
                    else setForm({ ...form, icon: "default" });
                  }}
                />
                <p className="mt-1 text-[11px] text-zinc-500">
                  No Google Imagens, clique com o botão direito na imagem → &quot;Copiar endereço da imagem&quot; e cole aqui.
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <label className={`${ghostButtonClass} cursor-pointer`}>
                    Enviar imagem do computador
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        setIconFileError("");
                        handleIconFileSelect(
                          e.target.files?.[0],
                          (dataUrl) => {
                            setCustomIconUrl(dataUrl);
                            setForm((f) => ({ ...f, icon: dataUrl }));
                          },
                          setIconFileError
                        );
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
                {iconFileError && <p className="mt-1 text-[11px] text-[#ff6b70]">{iconFileError}</p>}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs text-zinc-500">Quem pode ver esse módulo</label>
              <div className="flex flex-wrap gap-2">
                {roles.map((r) => {
                  const isAdmin = r.name === "Admin";
                  return (
                    <button
                      key={r.id}
                      type="button"
                      disabled={isAdmin}
                      onClick={() => toggleRole(r.id)}
                      title={isAdmin ? "Admin sempre tem acesso a todos os módulos" : undefined}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all disabled:cursor-not-allowed ${
                        selectedRoleIds.includes(r.id)
                          ? "border-[#ca2027] bg-[#ca2027]/15 text-[#ff8a8d]"
                          : "border-[#3a3335] bg-[#181516] text-zinc-400 hover:border-[#ca2027]/40 hover:text-zinc-200"
                      } ${isAdmin ? "opacity-80" : ""}`}
                    >
                      <span
                        className={`h-3.5 w-3.5 rounded-sm border ${
                          selectedRoleIds.includes(r.id) ? "border-[#ca2027] bg-[#ca2027]" : "border-zinc-500"
                        }`}
                      />
                      {r.name}
                      {isAdmin && <LockIcon className="h-3 w-3" />}
                    </button>
                  );
                })}
              </div>
              <p className="mt-1 text-[11px] text-zinc-500">
                Só quem tiver um desses papéis vai ver essa aba no menu (Admin sempre vê tudo). Dá pra mudar depois em Auditoria/permissões.
              </p>
            </div>

            <details className="rounded-lg border border-[#3a3335] bg-[#181516]/60 p-3 text-xs open:pb-3">
              <summary className="cursor-pointer select-none font-medium text-zinc-300">
                Configurações avançadas (key, rota, permission key)
              </summary>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-zinc-500">Key (identificador único)</label>
                  <input
                    className={inputClass}
                    placeholder="tutoriais"
                    value={form.key}
                    onChange={(e) => setForm({ ...form, key: slugify(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-zinc-500">Rota</label>
                  <input
                    className={inputClass}
                    placeholder="/tutoriais"
                    value={form.route}
                    onChange={(e) => {
                      setRouteTouched(true);
                      setForm({ ...form, route: e.target.value });
                    }}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-zinc-500">Permission key</label>
                  <input
                    className={inputClass}
                    placeholder="module.tutoriais.view"
                    value={form.permissionKey}
                    onChange={(e) => {
                      setPermissionTouched(true);
                      setForm({ ...form, permissionKey: e.target.value });
                    }}
                    required
                  />
                </div>
              </div>
              <p className="mt-2 text-zinc-500">
                Normalmente não precisa mexer aqui — a permissão já é criada e vinculada automaticamente aos papéis marcados acima.
              </p>
            </details>

            <button type="submit" className={buttonClass} title="Cria um novo módulo/aba no menu">
              Adicionar módulo
            </button>
          </div>

          <div>
            <label className="mb-2 block text-xs text-zinc-500">Pré-visualização</label>
            <div className="animated-border w-fit rounded-full p-[1.5px] shadow-[0_0_20px_rgba(202,32,39,0.25)]">
              <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ca2027] to-[#a8181e] px-4 py-2 text-sm font-medium text-white shadow-[0_0_18px_rgba(202,32,39,0.55)]">
                <span className="h-4 w-4">{getModuleIcon(form.icon)}</span>
                {form.label || "Nome da aba"}
              </div>
            </div>
            <p className="mt-2 text-xs text-zinc-500">É assim que a aba vai aparecer no menu, já selecionada.</p>
            <div className="mt-4 space-y-1 text-xs text-zinc-500">
              <p>
                Key: <span className="text-zinc-300">{form.key || "—"}</span>
              </p>
              <p>
                Rota: <span className="text-zinc-300">{form.route || "—"}</span>
              </p>
              <p>
                Permissão: <span className="text-zinc-300">{form.permissionKey || "—"}</span>
              </p>
            </div>
          </div>
        </form>
      </CollapsibleForm>

      {deleteError && <p className="mb-4 text-sm text-[#ff6b70]">{deleteError}</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-zinc-400">
              <th className="pb-2">Módulo</th>
              <th className="pb-2">Rota</th>
              <th className="pb-2">Permission</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {modules.map((m) => (
              <tr key={m.id} className="border-t border-[#3a3335]">
                <td className="py-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ca2027]/10 text-[#ff8a8d]">
                      <span className="h-4 w-4">{getModuleIcon(m.icon)}</span>
                    </span>
                    <div>
                      <p className="font-medium text-zinc-100">{m.label}</p>
                      <p className="text-xs text-zinc-500">{m.key}</p>
                    </div>
                  </div>
                </td>
                <td className="py-2 text-zinc-400">{m.route}</td>
                <td className="py-2 text-zinc-400">{m.permissionKey}</td>
                <td className="py-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${
                      m.isActive
                        ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
                        : "border-zinc-500/30 bg-zinc-500/15 text-zinc-400"
                    }`}
                  >
                    {m.isActive ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="py-2">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleToggleActive(m)}
                      className={ghostButtonClass}
                      title="Controla se o módulo aparece no menu"
                    >
                      {m.isActive ? "Desativar" : "Ativar"}
                    </button>
                    {!m.isActive && (
                      <button
                        onClick={() => handleDelete(m)}
                        className={`inline-flex items-center gap-1 ${dangerButtonClass}`}
                        title="Ação permanente — apaga o módulo e seus links"
                      >
                        <TrashIcon className="h-3.5 w-3.5" /> Excluir
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ModuleAccessSection({
  modules,
  users,
  moduleAdmins,
  setModuleAdmins,
}: {
  modules: ModuleRow[];
  users: UserRow[];
  moduleAdmins: ModuleAdminRow[];
  setModuleAdmins: (m: ModuleAdminRow[]) => void;
}) {
  const [selectedModuleId, setSelectedModuleId] = useState(modules[0]?.id ?? "");
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!selectedModuleId || !selectedUser) return;
    setLoading(true);
    const res = await fetch("/api/module-admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: selectedUser.id, moduleId: selectedModuleId }),
    });
    setLoading(false);
    if (res.ok) {
      const created: ModuleAdminRow = await res.json();
      setModuleAdmins([created, ...moduleAdmins]);
      setSelectedUser(null);
    } else {
      const data = await res.json();
      setError(typeof data.error === "string" ? data.error : "Erro ao conceder acesso");
    }
  }

  async function handleRevoke(assignment: ModuleAdminRow) {
    if (!confirm(`Remover ${assignment.user.name} como admin de "${assignment.module.label}"?`)) return;
    const res = await fetch(`/api/module-admins/${assignment.id}`, { method: "DELETE" });
    if (res.ok) {
      setModuleAdmins(moduleAdmins.filter((ma) => ma.id !== assignment.id));
    }
  }

  const byModule = modules.map((m) => ({
    module: m,
    admins: moduleAdmins.filter((ma) => ma.module.id === m.id),
  }));

  return (
    <section className={cardClass}>
      <h2 className="mb-1 text-lg font-semibold text-white">Acesso módulo</h2>
      <p className="mb-4 text-xs text-zinc-500">
        Dê a alguém acesso de admin sobre um módulo específico: essa pessoa passa a poder
        adicionar/editar/excluir os links daquele módulo e decidir quem pode vê-lo, direto pela
        própria aba do módulo — sem precisar de acesso ao restante do Admin. Você (Admin) continua
        podendo gerenciar todos os módulos normalmente.
      </p>

      <form onSubmit={handleAssign} className="mb-6 rounded-xl border border-[#3a3335] bg-[#181516] p-4">
        {error && <p className="mb-3 text-sm text-[#ff6b70]">{error}</p>}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-medium text-zinc-400">Módulo</label>
            <div className="flex flex-wrap gap-2">
              {modules.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedModuleId(m.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                    selectedModuleId === m.id
                      ? "border-[#ca2027] bg-[#ca2027]/15 text-[#ff8a8d]"
                      : "border-[#3a3335] bg-[#181516] text-zinc-400 hover:border-[#ca2027]/40 hover:text-zinc-200"
                  }`}
                >
                  <span className="h-3.5 w-3.5">{getModuleIcon(m.icon)}</span>
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium text-zinc-400">Pessoa</label>
            <UserSearchPicker users={users} selected={selectedUser} onSelect={setSelectedUser} />
          </div>
        </div>
        <div className="mt-4 flex justify-end border-t border-[#3a3335] pt-3">
          <button type="submit" disabled={loading || !selectedUser} className={buttonClass}>
            {loading ? "Adicionando..." : "Dar acesso"}
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {byModule.map(({ module, admins }) => (
          <div key={module.id} className="rounded-xl border border-[#3a3335] bg-[#181516] p-3">
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ca2027]/10 text-[#ff8a8d]">
                <span className="h-4 w-4">{getModuleIcon(module.icon)}</span>
              </span>
              <p className="text-sm font-medium text-zinc-100">{module.label}</p>
            </div>
            {admins.length === 0 ? (
              <p className="pl-9 text-xs text-zinc-500">Nenhum admin delegado.</p>
            ) : (
              <ul className="space-y-1.5 pl-9">
                {admins.map((ma) => (
                  <li
                    key={ma.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#3a3335] bg-[#1c1719] px-3 py-1.5"
                  >
                    <div>
                      <span className="text-sm text-zinc-100">{ma.user.name}</span>
                      <span className="ml-2 text-xs text-zinc-500">{ma.user.email}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRevoke(ma)}
                      className={`inline-flex items-center gap-1 ${dangerButtonClass}`}
                      title="Remover acesso de admin desse módulo"
                    >
                      <TrashIcon className="h-3.5 w-3.5" /> Remover
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
        {modules.length === 0 && <p className="text-sm text-zinc-500">Nenhum módulo cadastrado ainda.</p>}
      </div>
    </section>
  );
}

function AccessRequestsSection({
  requests,
  setRequests,
}: {
  requests: AccessRequestRow[];
  setRequests: (r: AccessRequestRow[]) => void;
}) {
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleDismiss(request: AccessRequestRow) {
    setPendingId(request.id);
    const res = await fetch(`/api/access-requests/${request.id}`, { method: "DELETE" });
    setPendingId(null);
    if (res.ok) {
      setRequests(requests.filter((r) => r.id !== request.id));
    }
  }

  return (
    <section className={cardClass}>
      <h2 className="mb-1 text-lg font-semibold text-white">Solicitações de acesso</h2>
      <p className="mb-4 text-xs text-zinc-500">
        Pedidos enviados pela tela de login por quem ainda não tem conta.
      </p>

      {requests.length === 0 ? (
        <p className="text-sm text-zinc-500">Nenhuma solicitação pendente.</p>
      ) : (
        <ul className="space-y-3">
          {requests.map((r) => (
            <li key={r.id} className="rounded-xl border border-[#3a3335] bg-[#181516] p-4">
              <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-zinc-100">{r.name}</p>
                  <p className="text-[11px] text-zinc-500">
                    {new Date(r.createdAt).toLocaleString("pt-BR")}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={pendingId === r.id}
                  onClick={() => handleDismiss(r)}
                  className={`inline-flex items-center gap-1 ${ghostButtonClass}`}
                  title="Marcar como resolvido e remover da lista"
                >
                  <TrashIcon className="h-3.5 w-3.5" /> Descartar
                </button>
              </div>
              <p className="mb-1 text-xs text-zinc-400">
                <span className="font-medium text-zinc-300">Motivo: </span>
                {r.reason}
              </p>
              <p className="text-xs text-zinc-400">
                <span className="font-medium text-zinc-300">Quem passou o link: </span>
                {r.referredBy}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

// Combobox com busca por nome/email — em vez de um <select> gigante quando
// tem muito usuário cadastrado.
function UserSearchPicker({
  users,
  selected,
  onSelect,
}: {
  users: UserRow[];
  selected: UserRow | null;
  onSelect: (user: UserRow | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = users.filter((u) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  if (selected) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-lg border border-[#ca2027]/40 bg-[#ca2027]/10 px-3 py-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-zinc-100">{selected.name}</p>
          <p className="truncate text-xs text-zinc-500">{selected.email}</p>
        </div>
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="shrink-0 rounded-md p-1 text-zinc-400 transition-colors hover:bg-[#2a2426] hover:text-zinc-200"
          title="Trocar pessoa"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          className={`${inputClass} pl-9`}
          placeholder="Buscar por nome ou email..."
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
        />
      </div>
      {open && (
        <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-[#3a3335] bg-[#181516] shadow-lg">
          {filtered.length === 0 && (
            <li className="px-3 py-2 text-xs text-zinc-500">Nenhum usuário encontrado.</li>
          )}
          {filtered.map((u) => (
            <li key={u.id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onSelect(u);
                  setQuery("");
                  setOpen(false);
                }}
                className="flex w-full flex-col items-start px-3 py-2 text-left text-sm text-zinc-200 transition-colors hover:bg-[#2a2426]"
              >
                <span className="font-medium">{u.name}</span>
                <span className="text-xs text-zinc-500">{u.email}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PermissionsSection({
  modules,
  roles,
  initialGrants,
}: {
  modules: ModuleRow[];
  roles: Role[];
  initialGrants: PermissionGrant[];
}) {
  const [grants, setGrants] = useState<Set<string>>(
    () => new Set(initialGrants.map((g) => `${g.roleId}:${g.moduleId}`))
  );
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState("");

  function isGranted(roleId: string, moduleId: string) {
    return grants.has(`${roleId}:${moduleId}`);
  }

  async function handleToggle(roleId: string, moduleId: string) {
    const key = `${roleId}:${moduleId}`;
    setPending(key);
    setError("");
    const wasGranted = grants.has(key);

    setGrants((prev) => {
      const next = new Set(prev);
      if (wasGranted) next.delete(key);
      else next.add(key);
      return next;
    });

    const res = await fetch("/api/permissions/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roleId, moduleId }),
    });
    setPending(null);

    if (!res.ok) {
      // reverte se a chamada falhar
      setGrants((prev) => {
        const next = new Set(prev);
        if (wasGranted) next.add(key);
        else next.delete(key);
        return next;
      });
      setError("Não foi possível salvar essa alteração.");
    }
  }

  return (
    <section className={cardClass}>
      <h2 className="mb-1 text-lg font-semibold text-white">Permissões</h2>
      <p className="mb-4 text-xs text-zinc-500">
        Marque quais papéis enxergam cada módulo no menu. Módulos novos aparecem aqui automaticamente — é só marcar quem pode ver.
      </p>

      {error && <p className="mb-4 text-sm text-[#ff6b70]">{error}</p>}

      {modules.length === 0 ? (
        <p className="text-sm text-zinc-500">Nenhum módulo cadastrado ainda.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-zinc-400">
                <th className="pb-3 pr-4">Módulo</th>
                {roles.map((r) => (
                  <th key={r.id} className="pb-3 text-center">
                    <RoleBadge roleName={r.name} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modules.map((m) => (
                <tr key={m.id} className="border-t border-[#3a3335]">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ca2027]/10 text-[#ff8a8d]">
                        <span className="h-4 w-4">{getModuleIcon(m.icon)}</span>
                      </span>
                      <div>
                        <p className="font-medium text-zinc-100">{m.label}</p>
                        {!m.isActive && (
                          <p className="text-[11px] text-zinc-500">módulo inativo</p>
                        )}
                      </div>
                    </div>
                  </td>
                  {roles.map((r) => {
                    const key = `${r.id}:${m.id}`;
                    const isAdmin = r.name === "Admin";
                    const granted = isAdmin || isGranted(r.id, m.id);
                    return (
                      <td key={r.id} className="py-3 text-center">
                        <button
                          type="button"
                          disabled={pending === key || isAdmin}
                          onClick={() => handleToggle(r.id, m.id)}
                          title={
                            isAdmin
                              ? "Admin sempre tem acesso a todos os módulos"
                              : granted
                              ? `${r.name} pode ver "${m.label}" — clique pra revogar`
                              : `${r.name} não vê "${m.label}" — clique pra liberar`
                          }
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-md border transition-all disabled:cursor-not-allowed disabled:opacity-80 ${
                            granted
                              ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                              : "border-[#3a3335] bg-[#181516] text-transparent hover:border-zinc-500"
                          }`}
                        >
                          {isAdmin ? (
                            <LockIcon className="h-3.5 w-3.5" />
                          ) : (
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

const AUDIT_PAGE_SIZE = 20;

function AuditLogSection({
  initialLogs,
  initialTotal,
  onTotalChange,
}: {
  initialLogs: AuditLogRow[];
  initialTotal: number;
  onTotalChange?: (total: number) => void;
}) {
  const [logs, setLogs] = useState(initialLogs);
  const [total, setTotal] = useState(initialTotal);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);

  async function loadPage(newOffset: number) {
    setLoading(true);
    const res = await fetch(`/api/audit-logs?offset=${newOffset}`);
    setLoading(false);
    if (res.ok) {
      const data = await res.json();
      setLogs(data.logs);
      setTotal(data.total);
      setOffset(newOffset);
      onTotalChange?.(data.total);
    }
  }

  const hasPrev = offset > 0;
  const hasNext = offset + AUDIT_PAGE_SIZE < total;

  return (
    <section className={`${cardClass} mt-8`}>
      <h2 className="mb-4 text-lg font-semibold text-white">Log de Auditoria</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-zinc-400">
              <th className="pb-2">Data</th>
              <th className="pb-2">Ação</th>
              <th className="pb-2">Entidade</th>
              <th className="pb-2">Responsável</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t border-[#3a3335]">
                <td className="py-2 text-zinc-400">
                  {new Date(log.createdAt).toLocaleString("pt-BR")}
                </td>
                <td className="py-2 text-zinc-100">{log.action}</td>
                <td className="py-2 text-zinc-400">
                  {log.entityType} · {log.entityId}
                </td>
                <td className="py-2 text-zinc-400">
                  {log.actor ? `${log.actor.name} (${log.actor.email})` : "Sistema"}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td className="py-4 text-xs text-zinc-500" colSpan={4}>
                  Nenhum registro de auditoria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-zinc-500">
          {total === 0 ? "0" : `${offset + 1}-${Math.min(offset + AUDIT_PAGE_SIZE, total)}`} de {total}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={!hasPrev || loading}
            onClick={() => loadPage(offset - AUDIT_PAGE_SIZE)}
            className={ghostButtonClass}
          >
            Anterior
          </button>
          <button
            type="button"
            disabled={!hasNext || loading}
            onClick={() => loadPage(offset + AUDIT_PAGE_SIZE)}
            className={ghostButtonClass}
          >
            Próximo
          </button>
        </div>
      </div>
    </section>
  );
}
