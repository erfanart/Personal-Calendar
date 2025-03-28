import { GET_MONTHS } from '@/lib/graphql/queries';
import client from '@/lib/graphql/client';
import MonthCalendar from '@/components/Month';

export default async function Home() {
  const { data } = await client.query({
    query: GET_MONTHS,
  });

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6 text-center">تقویم اجرایی</h1>
      <MonthCalendar months={data.getMonths} />
    </main>
  );
}