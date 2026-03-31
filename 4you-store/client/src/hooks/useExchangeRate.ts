import { trpc } from "@/lib/trpc";

export function useExchangeRate() {
  const { data } = trpc.settings.getExchangeRate.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });

  return {
    rate: data?.rate ?? 250,
    enabled: data?.enabled ?? false,
  };
}
