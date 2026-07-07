'use client';

import { useEffect, useMemo, useState } from 'react';

type OnboardingStep = {
  id: string;
  role: string;
  title: string;
  body: string;
  order: number;
  completed: boolean;
  completedAt: string | null;
};

type OnboardingProgress = {
  completed: number;
  total: number;
  percentage: number;
};

type OnboardingData = {
  onboardingMySteps: OnboardingStep[];
  onboardingMyProgress: OnboardingProgress;
};

type TeamProgress = {
  userId: string;
  name: string;
  role: string | null;
  completed: number;
  total: number;
  percentage: number;
  enrolled: boolean;
};

type TeamProgressData = {
  onboardingTeamProgress: TeamProgress[];
};

type AssignRoleData = {
  onboardingAssignRole: TeamProgress;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/graphql';

const EMPLOYEE_USER_ID = 'employee-1';
const MANAGER_USER_ID = 'manager-1';

async function graphQLRequest<T>(
  userId: string,
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const result = (await response.json()) as {
    data?: T;
    errors?: Array<{ message: string }>;
  };

  if (!response.ok || result.errors?.length) {
    throw new Error(
      result.errors?.[0]?.message ?? 'Failed to load onboarding data',
    );
  }

  if (!result.data) {
    throw new Error('No onboarding data was returned');
  }

  return result.data;
}

const ONBOARDING_QUERY = `
  query OnboardingPage {
    onboardingMySteps {
      id
      role
      title
      body
      order
      completed
      completedAt
    }

    onboardingMyProgress {
      completed
      total
      percentage
    }
  }
`;

const TEAM_PROGRESS_QUERY = `
  query ManagerTeamProgress {
    onboardingTeamProgress {
      userId
      name
      role
      completed
      total
      percentage
      enrolled
    }
  }
`;

const COMPLETE_STEP_MUTATION = `
  mutation CompleteStep($stepId: ID!) {
    onboardingSetStepComplete(stepId: $stepId) {
      id
      completed
      completedAt
    }
  }
`;

const INCOMPLETE_STEP_MUTATION = `
  mutation IncompleteStep($stepId: ID!) {
    onboardingSetStepIncomplete(stepId: $stepId) {
      id
      completed
      completedAt
    }
  }
`;

const ASSIGN_ROLE_MUTATION = `
  mutation AssignRole($input: AssignOnboardingRoleInput!) {
    onboardingAssignRole(input: $input) {
      userId
      name
      role
      completed
      total
      percentage
      enrolled
    }
  }
`;

export default function OnboardingPage() {
  const [demoUserId, setDemoUserId] = useState(EMPLOYEE_USER_ID);
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [progress, setProgress] = useState<OnboardingProgress>({
    completed: 0,
    total: 0,
    percentage: 0,
  });
  const [teamProgress, setTeamProgress] = useState<TeamProgress[]>([]);
  const [assignUserId, setAssignUserId] = useState('employee-2');
  const [assignRole, setAssignRole] = useState('product-manager');
  const [isLoading, setIsLoading] = useState(true);
  const [isTeamLoading, setIsTeamLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [updatingStepId, setUpdatingStepId] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [teamError, setTeamError] = useState<string | null>(null);

  const isManagerView = demoUserId === MANAGER_USER_ID;

  const sortedSteps = useMemo(
    () => [...steps].sort((a, b) => a.order - b.order),
    [steps],
  );

  async function loadOnboardingData(userId = demoUserId) {
    setError(null);

    try {
      const data = await graphQLRequest<OnboardingData>(
        userId,
        ONBOARDING_QUERY,
      );

      setSteps(data.onboardingMySteps);
      setProgress(data.onboardingMyProgress);
    } catch (caughtError) {
      setSteps([]);
      setProgress({
        completed: 0,
        total: 0,
        percentage: 0,
      });
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Failed to load onboarding data',
      );
    }
  }

  async function loadTeamProgress(userId = demoUserId) {
    if (userId !== MANAGER_USER_ID) {
      setTeamProgress([]);
      setTeamError(null);
      return;
    }

    setIsTeamLoading(true);
    setTeamError(null);

    try {
      const data = await graphQLRequest<TeamProgressData>(
        userId,
        TEAM_PROGRESS_QUERY,
      );

      setTeamProgress(data.onboardingTeamProgress);
    } catch (caughtError) {
      setTeamProgress([]);
      setTeamError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Failed to load team progress',
      );
    } finally {
      setIsTeamLoading(false);
    }
  }

  useEffect(() => {
    async function loadInitialData() {
      try {
        setIsLoading(true);
        await loadOnboardingData(demoUserId);
        await loadTeamProgress(demoUserId);
      } finally {
        setIsLoading(false);
      }
    }

    void loadInitialData();
  }, [demoUserId]);

  async function toggleStep(step: OnboardingStep) {
    try {
      setUpdatingStepId(step.id);
      setError(null);

      await graphQLRequest(
        demoUserId,
        step.completed
          ? INCOMPLETE_STEP_MUTATION
          : COMPLETE_STEP_MUTATION,
        {
          stepId: step.id,
        },
      );

      await loadOnboardingData();
      await loadTeamProgress();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Failed to update onboarding step',
      );
    } finally {
      setUpdatingStepId(null);
    }
  }

  async function assignOnboardingRole() {
    try {
      setIsAssigning(true);
      setTeamError(null);

      await graphQLRequest<AssignRoleData>(
        demoUserId,
        ASSIGN_ROLE_MUTATION,
        {
          input: {
            userId: assignUserId,
            role: assignRole,
          },
        },
      );

      await loadTeamProgress();
    } catch (caughtError) {
      setTeamError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Failed to assign onboarding role',
      );
    } finally {
      setIsAssigning(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <section className="mx-auto flex max-w-5xl flex-col gap-8">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
            Employee onboarding
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">
            Your onboarding checklist
          </h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            Complete each step to track onboarding progress. Use the
            demo switch below to test the employee and manager
            experiences.
          </p>
        </div>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm font-medium text-slate-300">
            Demo user
          </p>

          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setDemoUserId(EMPLOYEE_USER_ID)}
              className={`rounded-full border px-5 py-2 text-sm font-semibold transition ${
                demoUserId === EMPLOYEE_USER_ID
                  ? 'border-slate-100 bg-slate-100 text-slate-950'
                  : 'border-slate-700 text-slate-100 hover:bg-slate-800'
              }`}
            >
              Employee view
            </button>

            <button
              type="button"
              onClick={() => setDemoUserId(MANAGER_USER_ID)}
              className={`rounded-full border px-5 py-2 text-sm font-semibold transition ${
                demoUserId === MANAGER_USER_ID
                  ? 'border-slate-100 bg-slate-100 text-slate-950'
                  : 'border-slate-700 text-slate-100 hover:bg-slate-800'
              }`}
            >
              Manager view
            </button>
          </div>

          <p className="mt-3 text-sm text-slate-400">
            Current fake user:{' '}
            <span className="font-semibold text-slate-100">
              {demoUserId}
            </span>
          </p>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                Personal progress
              </h2>
              <p className="mt-1 text-slate-400">
                {progress.completed} of {progress.total} steps completed
              </p>
            </div>

            <p className="text-3xl font-bold">
              {progress.percentage.toFixed(0)}%
            </p>
          </div>

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-slate-100 transition-all"
              style={{
                width: `${progress.percentage}%`,
              }}
            />
          </div>
        </section>

        {error ? (
          <div className="rounded-xl border border-amber-800 bg-amber-950/60 p-4 text-amber-100">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-slate-300">
            Loading onboarding steps...
          </div>
        ) : sortedSteps.length > 0 ? (
          <section className="space-y-4">
            {sortedSteps.map((step) => {
              const isUpdating = updatingStepId === step.id;

              return (
                <article
                  key={step.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm text-slate-400">
                        Step {step.order} · {step.role}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold">
                        {step.title}
                      </h3>
                      <p className="mt-3 text-slate-300">
                        {step.body}
                      </p>

                      {step.completedAt ? (
                        <p className="mt-3 text-sm text-slate-400">
                          Completed on{' '}
                          {new Date(
                            step.completedAt,
                          ).toLocaleDateString()}
                        </p>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      onClick={() => void toggleStep(step)}
                      disabled={isUpdating}
                      className="rounded-full border border-slate-700 px-5 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isUpdating
                        ? 'Updating...'
                        : step.completed
                          ? 'Mark incomplete'
                          : 'Mark complete'}
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        ) : (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-slate-300">
            No personal onboarding steps are available for this demo
            user.
          </div>
        )}

        {isManagerView ? (
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
                  Manager section
                </p>
                <h2 className="mt-2 text-2xl font-bold">
                  Team onboarding progress
                </h2>
                <p className="mt-2 text-slate-300">
                  Track team members and assign onboarding roles.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <label className="flex flex-col gap-2 text-sm text-slate-300">
                Team member
                <select
                  value={assignUserId}
                  onChange={(event) =>
                    setAssignUserId(event.target.value)
                  }
                  className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
                >
                  <option value="employee-1">employee-1</option>
                  <option value="employee-2">employee-2</option>
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-300">
                Onboarding role
                <select
                  value={assignRole}
                  onChange={(event) =>
                    setAssignRole(event.target.value)
                  }
                  className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
                >
                  <option value="software-engineer">
                    software-engineer
                  </option>
                  <option value="product-manager">
                    product-manager
                  </option>
                </select>
              </label>

              <button
                type="button"
                onClick={() => void assignOnboardingRole()}
                disabled={isAssigning}
                className="self-end rounded-lg border border-slate-700 px-5 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isAssigning ? 'Assigning...' : 'Assign role'}
              </button>
            </div>

            {teamError ? (
              <div className="mt-5 rounded-xl border border-red-800 bg-red-950/60 p-4 text-red-200">
                {teamError}
              </div>
            ) : null}

            <div className="mt-6 overflow-hidden rounded-xl border border-slate-800">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-slate-950 text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Employee</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Progress</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {isTeamLoading ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-4 text-slate-300"
                      >
                        Loading team progress...
                      </td>
                    </tr>
                  ) : (
                    teamProgress.map((member) => (
                      <tr
                        key={member.userId}
                        className="border-t border-slate-800"
                      >
                        <td className="px-4 py-4">
                          <p className="font-semibold text-slate-100">
                            {member.name}
                          </p>
                          <p className="text-slate-400">
                            {member.userId}
                          </p>
                        </td>

                        <td className="px-4 py-4 text-slate-300">
                          {member.role ?? 'Not assigned'}
                        </td>

                        <td className="px-4 py-4">
                          <p className="text-slate-300">
                            {member.completed} of {member.total} ·{' '}
                            {member.percentage.toFixed(0)}%
                          </p>
                          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                            <div
                              className="h-full rounded-full bg-slate-100"
                              style={{
                                width: `${member.percentage}%`,
                              }}
                            />
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-200">
                            {member.enrolled
                              ? 'Enrolled'
                              : 'Not enrolled'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}