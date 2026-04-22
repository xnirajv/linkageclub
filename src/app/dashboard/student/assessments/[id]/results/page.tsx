'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAssessment } from '@/hooks/useAssessments';

export default function AssessmentResultsPage() {
  const params = useParams();
  const assessmentId = params?.id as string;
  const { getResults } = useAssessment(assessmentId);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getResults().then(setData).catch(console.error).finally(() => setLoading(false));
  }, [getResults]);

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (!data) return <div className="p-6 text-center">No data</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Results</h1>
      <p>Score: {data.results?.score}%</p>
      <p>Passed: {data.results?.passed ? 'Yes' : 'No'}</p>
      <p>Questions: {data.results?.questions?.length || 0}</p>
      <pre className="mt-4 text-xs bg-gray-100 p-4 rounded overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}