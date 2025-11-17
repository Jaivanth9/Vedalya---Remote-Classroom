// src/pages/TeacherQueriesSafe.tsx
import React, { useEffect, useState } from "react";
import { queriesAPI } from "@/lib/api";
import { QueriesList } from "@/components/QueriesList";

/**
 * Use this temporary safe page if your normal teacher queries route still blanks.
 * You can wire your router to this component while we debug the original.
 */
class ErrorBoundary extends React.Component<any, { hasError: boolean; error?: any }> {
  constructor(props: any) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  componentDidCatch(error: any, info: any) { console.error("TeacherQueriesSafe caught:", error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20 }}>
          <h2>Something went wrong</h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>{String(this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function TeacherQueriesSafe() {
  const [queries, setQueries] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const data = await queriesAPI.getAll();
      setQueries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("TeacherQueriesSafe fetch error", err);
      setQueries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  return (
    <ErrorBoundary>
      <div style={{ padding: 20 }}>
        <h1>Student Queries (teacher view)</h1>
        {loading && <div>Loading...</div>}
        {!loading && <QueriesList queries={queries ?? []} onRefetch={fetchAll} />}
      </div>
    </ErrorBoundary>
  );
}
