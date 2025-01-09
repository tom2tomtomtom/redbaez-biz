import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const getLikelihoodColor = (likelihood: number | null) => {
  const score = likelihood || 0;
  if (score >= 75) return 'bg-green-100 text-green-800';
  if (score >= 50) return 'bg-yellow-100 text-yellow-800';
  if (score >= 25) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
};

const getTypeColor = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'product development':
      return 'bg-blue-100 text-blue-800';
    case 'marketing':
      return 'bg-purple-100 text-purple-800';
    case 'partnerships':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-orange-100 text-orange-800';
  }
};

interface ClientsTableProps {
  clients: any[];
}

export const ClientsTable = ({ clients }: ClientsTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Client Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Likelihood</TableHead>
          <TableHead>Industry</TableHead>
          <TableHead>Type</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((client) => (
          <TableRow key={client.id}>
            <TableCell className="font-medium">{client.name}</TableCell>
            <TableCell>{client.status || 'N/A'}</TableCell>
            <TableCell>
              <span className={`px-2 py-1 rounded-full text-sm ${getLikelihoodColor(client.likelihood)}`}>
                {client.likelihood || '0'}%
              </span>
            </TableCell>
            <TableCell>{client.industry || 'N/A'}</TableCell>
            <TableCell>
              <span className={`px-2 py-1 rounded-full text-sm ${getTypeColor(client.type)}`}>
                {client.type}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};