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

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/graphql';

const DEMO_USER_ID = 'employee-1';

async function graphQLRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': DEMO_USER_ID,
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

export default function OnboardingPage() {
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [progress, setProgress] = useState<OnboardingProgress>({
    completed: 0,
    total: 0,
    percentage: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [updatingStepId, setUpdatingStepId] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const sortedSteps = useMemo(
    () => [...steps].sort((a, b) => a.order - b.order),
    [steps],
  );

  async function loadOnboardingData() {
    setError(null);

    const data =
      await graphQLRequest<OnboardingData>(ONBOARDING_QUERY);

    setSteps(data.onboardingMySteps);
    setProgress(data.onboardingMyProgress);
  }

  useEffect(() => {
    async function loadInitialData() {
      try {
        setIsLoading(true);
        await loadOnboardingData();
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Failed to load onboarding data',
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadInitialData();
  }, []);

  async function toggleStep(step: OnboardingStep) {
    try {
      setUpdatingStepId(step.id);
      setError(null);

      await graphQLRequest(
        step.completed
          ? INCOMPLETE_STEP_MUTATION
          : COMPLETE_STEP_MUTATION,
        {
          stepId: step.id,
        },
      );

      await loadOnboardingData();
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

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <section className="mx-auto flex max-w-4xl flex-col gap-8">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
            Employee onboarding
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">
            Your onboarding checklist
          </h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            Complete each step to track your onboarding progress.
            This demo page is currently using the fake employee user{' '}
            <span className="font-semibold text-slate-100">
              {DEMO_USER_ID}
            </span>
            .
          </p>
        </div>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Progress</h2>
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
          <div className="rounded-xl border border-red-800 bg-red-950/60 p-4 text-red-200">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-slate-300">
            Loading onboarding steps...
          </div>
        ) : (
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
        )}
      </section>
    </main>
  );
}