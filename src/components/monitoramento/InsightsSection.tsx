import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Eye, Users } from "lucide-react";

interface InsightValue {
  value: number;
  end_time: string;
}

interface Insight {
  name: string;
  period: string;
  values: InsightValue[];
  title: string;
  description: string;
  id: string;
}

interface Props {
  accountId: string;
  period: "7days" | "30days";
  insights: Insight[] | undefined;
  loading: boolean;
}

export default function InsightsSection({ insights, loading }: Props) {
  if (loading) {
    return <Card className="p-8 text-center">Carregando insights...</Card>;
  }

  if (!insights || insights.length === 0) {
    return <Card className="p-8 text-center text-muted-foreground">Sem dados de insights</Card>;
  }

  // Transforma dados do Instagram Graph API para formato gráfico
  const transformedData =
    insights[0]?.values?.map((v) => ({
      date: new Date(v.end_time).toLocaleDateString("pt-BR"),
      reach: v.value,
    })) || [];

  const reachMetric = insights.find((m) => m.name === "reach");
  const totals = {
    reach: reachMetric?.values.reduce((sum, v) => sum + v.value, 0) || 0,
    impressions: 0,
    profile_views: 0,
  };

  return (
    <div className="space-y-6">
      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-200 dark:border-blue-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Alcance Total</p>
              <p className="text-2xl font-bold">{totals.reach.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-200 dark:border-green-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Dias Monitorados</p>
              <p className="text-2xl font-bold">{transformedData.length}</p>
            </div>
            <Users className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-200 dark:border-purple-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Média por Dia</p>
              <p className="text-2xl font-bold">
                {transformedData.length > 0
                  ? Math.round(totals.reach / transformedData.length).toLocaleString()
                  : 0}
              </p>
            </div>
            <Eye className="w-8 h-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Gráfico */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Evolução Diária de Alcance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={transformedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="reach" fill="#10b981" name="Alcance" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Tabela detalhada */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Dados Diários</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="text-left py-2 px-2">Data</th>
                <th className="text-right py-2 px-2">Alcance</th>
              </tr>
            </thead>
            <tbody>
              {transformedData.map((row) => (
                <tr key={row.date} className="border-b hover:bg-muted/50">
                  <td className="py-2 px-2">{row.date}</td>
                  <td className="text-right py-2 px-2">{row.reach.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
