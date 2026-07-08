"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CreateStepDocument,
  DeleteStepDocument,
  OnboardingAdminStepsDocument,
  OnboardingRolesDocument,
  ReorderStepsDocument,
  UpdateStepDocument,
  type OnboardingAdminStepsQuery,
} from "../../../../gql/graphql";
import { graphQLRequest } from "../../../../lib/graphql-client";

type OnboardingStep = OnboardingAdminStepsQuery["onboardingAdminSteps"][number];

type StepForm = {
  title: string;
  body: string;
  order: string;
};

const MANAGER_USER_ID = "manager-1";
const EMPLOYEE_USER_ID = "employee-1";

const emptyForm: StepForm = {
  title: "",
  body: "",
  order: "",
};

export default function OnboardingManagePage() {
  const [demoUserId, setDemoUserId] = useState(MANAGER_USER_ID);
  const [roles, setRoles] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState("software-engineer");
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [form, setForm] = useState<StepForm>(emptyForm);
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [movingStepId, setMovingStepId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sortedSteps = useMemo(
    () => [...steps].sort((a, b) => a.order - b.order),
    [steps],
  );

  const isManager = demoUserId === MANAGER_USER_ID;

  async function loadRoles(userId = demoUserId) {
    const data = await graphQLRequest(userId, OnboardingRolesDocument);

    setRoles(data.onboardingRoles);

    if (
      data.onboardingRoles.length > 0 &&
      !data.onboardingRoles.includes(selectedRole)
    ) {
      setSelectedRole(data.onboardingRoles[0]);
    }
  }

  async function loadSteps(role = selectedRole, userId = demoUserId) {
    const data = await graphQLRequest(userId, OnboardingAdminStepsDocument, {
      role,
    });

    setSteps(data.onboardingAdminSteps);
  }

  async function loadPageData(role = selectedRole, userId = demoUserId) {
    setError(null);

    try {
      setIsLoading(true);
      await loadRoles(userId);
      await loadSteps(role, userId);
    } catch (caughtError) {
      setRoles([]);
      setSteps([]);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to load admin onboarding data",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadPageData(selectedRole, demoUserId);
  }, [demoUserId, selectedRole]);

  function resetForm() {
    setForm(emptyForm);
    setEditingStepId(null);
  }

  function startEditing(step: OnboardingStep) {
    setEditingStepId(step.id);
    setForm({
      title: step.title,
      body: step.body,
      order: String(step.order),
    });
  }

  async function saveStep() {
    const parsedOrder = Number(form.order);

    if (!form.title.trim() || !form.body.trim() || !parsedOrder) {
      setError("Title, body and order are required.");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      if (editingStepId) {
        await graphQLRequest(demoUserId, UpdateStepDocument, {
          input: {
            id: editingStepId,
            role: selectedRole,
            title: form.title.trim(),
            body: form.body.trim(),
            order: parsedOrder,
          },
        });
      } else {
        await graphQLRequest(demoUserId, CreateStepDocument, {
          input: {
            role: selectedRole,
            title: form.title.trim(),
            body: form.body.trim(),
            order: parsedOrder,
          },
        });
      }

      resetForm();
      await loadRoles();
      await loadSteps();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to save onboarding step",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteStep(stepId: string) {
    const confirmed = window.confirm("Delete this onboarding step?");

    if (!confirmed) {
      return;
    }

    try {
      setError(null);

      await graphQLRequest(demoUserId, DeleteStepDocument, {
        id: stepId,
      });

      await loadRoles();
      await loadSteps();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to delete onboarding step",
      );
    }
  }

  async function moveStep(stepId: string, direction: "up" | "down") {
    const currentIndex = sortedSteps.findIndex((step) => step.id === stepId);

    if (currentIndex === -1) {
      return;
    }

    const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (nextIndex < 0 || nextIndex >= sortedSteps.length) {
      return;
    }

    const reorderedSteps = [...sortedSteps];
    const [movedStep] = reorderedSteps.splice(currentIndex, 1);
    reorderedSteps.splice(nextIndex, 0, movedStep);

    try {
      setMovingStepId(stepId);
      setError(null);

      const data = await graphQLRequest(demoUserId, ReorderStepsDocument, {
        input: {
          role: selectedRole,
          steps: reorderedSteps.map((step, index) => ({
            id: step.id,
            order: index + 1,
          })),
        },
      });

      setSteps(data.onboardingReorderSteps);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to reorder onboarding steps",
      );
    } finally {
      setMovingStepId(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <section className="mx-auto flex max-w-6xl flex-col gap-8">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
            Onboarding admin
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">
            Manage onboarding steps
          </h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            Create, edit, delete and reorder onboarding steps for each role.
            This page uses the manager fake user by default.
          </p>
        </div>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm font-medium text-slate-300">Demo access</p>

          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setDemoUserId(MANAGER_USER_ID)}
              className={`rounded-full border px-5 py-2 text-sm font-semibold transition ${
                demoUserId === MANAGER_USER_ID
                  ? "border-slate-100 bg-slate-100 text-slate-950"
                  : "border-slate-700 text-slate-100 hover:bg-slate-800"
              }`}
            >
              Manager access
            </button>

            <button
              type="button"
              onClick={() => setDemoUserId(EMPLOYEE_USER_ID)}
              className={`rounded-full border px-5 py-2 text-sm font-semibold transition ${
                demoUserId === EMPLOYEE_USER_ID
                  ? "border-slate-100 bg-slate-100 text-slate-950"
                  : "border-slate-700 text-slate-100 hover:bg-slate-800"
              }`}
            >
              Employee access test
            </button>
          </div>

          <p className="mt-3 text-sm text-slate-400">
            Current fake user:{" "}
            <span className="font-semibold text-slate-100">{demoUserId}</span>
          </p>
        </section>

        {error ? (
          <div className="rounded-xl border border-red-800 bg-red-950/60 p-4 text-red-200">
            {error}
          </div>
        ) : null}

        {!isManager ? (
          <section className="rounded-2xl border border-amber-800 bg-amber-950/40 p-6 text-amber-100">
            <h2 className="text-xl font-semibold">Access blocked</h2>
            <p className="mt-2">
              This management page is only available to users with the
              onboarding management permission.
            </p>
          </section>
        ) : null}

        {isManager ? (
          <>
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Select role</h2>
                  <p className="mt-1 text-slate-400">
                    Manage steps for one onboarding role at a time.
                  </p>
                </div>

                <select
                  value={selectedRole}
                  onChange={(event) => {
                    setSelectedRole(event.target.value);
                    resetForm();
                  }}
                  className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
                >
                  {roles.length > 0 ? (
                    roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))
                  ) : (
                    <option value={selectedRole}>{selectedRole}</option>
                  )}
                </select>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
              <h2 className="text-xl font-semibold">
                {editingStepId ? "Edit step" : "Create step"}
              </h2>

              <div className="mt-5 grid gap-4 md:grid-cols-[1fr_120px]">
                <label className="flex flex-col gap-2 text-sm text-slate-300">
                  Title
                  <input
                    value={form.title}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
                    placeholder="Step title"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm text-slate-300">
                  Order
                  <input
                    value={form.order}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        order: event.target.value,
                      }))
                    }
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
                    placeholder="1"
                    type="number"
                    min="1"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm text-slate-300 md:col-span-2">
                  Body
                  <textarea
                    value={form.body}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        body: event.target.value,
                      }))
                    }
                    className="min-h-28 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
                    placeholder="Step details"
                  />
                </label>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void saveStep()}
                  disabled={isSaving}
                  className="rounded-lg border border-slate-100 bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving
                    ? "Saving..."
                    : editingStepId
                      ? "Save changes"
                      : "Create step"}
                </button>

                {editingStepId ? (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-lg border border-slate-700 px-5 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
                  >
                    Cancel edit
                  </button>
                ) : null}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">
                    Steps for {selectedRole}
                  </h2>
                  <p className="mt-1 text-slate-400">
                    Use Move up and Move down to reorder the current role&apos;s
                    steps.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void loadPageData()}
                  className="rounded-lg border border-slate-700 px-5 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
                >
                  Refresh
                </button>
              </div>

              <div className="mt-6 overflow-hidden rounded-xl border border-slate-800">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-slate-950 text-slate-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">Order</th>
                      <th className="px-4 py-3 font-medium">Step</th>
                      <th className="px-4 py-3 font-medium">Updated</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-5 text-slate-300">
                          Loading steps...
                        </td>
                      </tr>
                    ) : sortedSteps.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-5 text-slate-300">
                          No steps found for this role.
                        </td>
                      </tr>
                    ) : (
                      sortedSteps.map((step, index) => (
                        <tr
                          key={step.id}
                          className="border-t border-slate-800 align-top"
                        >
                          <td className="px-4 py-4 text-slate-300">
                            {step.order}
                          </td>

                          <td className="px-4 py-4">
                            <p className="font-semibold text-slate-100">
                              {step.title}
                            </p>
                            <p className="mt-1 max-w-2xl text-slate-400">
                              {step.body}
                            </p>
                          </td>

                          <td className="px-4 py-4 text-slate-400">
                            {new Date(step.updatedAt).toLocaleDateString()}
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => void moveStep(step.id, "up")}
                                disabled={
                                  index === 0 || movingStepId === step.id
                                }
                                className="rounded-lg border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-100 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                Up
                              </button>

                              <button
                                type="button"
                                onClick={() => void moveStep(step.id, "down")}
                                disabled={
                                  index === sortedSteps.length - 1 ||
                                  movingStepId === step.id
                                }
                                className="rounded-lg border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-100 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                Down
                              </button>

                              <button
                                type="button"
                                onClick={() => startEditing(step)}
                                className="rounded-lg border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-100 transition hover:bg-slate-800"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => void deleteStep(step.id)}
                                className="rounded-lg border border-red-800 px-3 py-1 text-xs font-semibold text-red-200 transition hover:bg-red-950"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : null}
      </section>
    </main>
  );
}
