"use client";

import { GET_MONTHS } from "@/lib/graphql/queries";
import client from "@/lib/graphql/client";
import MonthCalendar from "@/components/Month";
import { useEffect, useState } from "react";
import { ApolloError } from "@apollo/client";
import type { Month } from "@/types";

export default function Home() {
  const [months, setMonths] = useState<Month[]>([]); // Replace 'any' with your proper month type if available
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApolloError | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await client.query({
          query: GET_MONTHS,
        });
        setMonths(data.getMonths);
      } catch (err) {
        setError(err as ApolloError);
        console.error("Error fetching months:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading data: {error.message}</div>;

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6 text-center">تقویم اجرایی</h1>
      <MonthCalendar months={months} />
    </main>
  );
}
