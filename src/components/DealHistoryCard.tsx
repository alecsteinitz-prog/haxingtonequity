import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building, Calendar, DollarSign, MapPin, Edit, Trash2 } from 'lucide-react';

interface Deal {
  id: string;
  property_type: string;
  city: string;
  state?: string;
  deal_status: string;
  deal_value?: number;
  profit_amount?: number;
  close_date?: string;
  created_at: string;
}

interface DealHistoryCardProps {
  deal: Deal;
  onEdit?: (deal: Deal) => void;
  onDelete?: (dealId: string) => void;
}

export const DealHistoryCard = ({ deal, onEdit, onDelete }: DealHistoryCardProps) => {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'closed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'analysis':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date?: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-primary" />
              <CardTitle className="text-lg">{deal.property_type}</CardTitle>
              <Badge variant={getStatusBadgeVariant(deal.deal_status)}>
                {deal.deal_status.charAt(0).toUpperCase() + deal.deal_status.slice(1)}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {deal.city}{deal.state && `, ${deal.state}`}
              </div>
              {deal.close_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(deal.close_date)}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(deal)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(deal.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Deal Value:</span>
            <p className="font-medium text-foreground">{formatCurrency(deal.deal_value)}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Profit:</span>
            <p className={`font-medium ${
              deal.profit_amount && deal.profit_amount > 0 
                ? 'text-green-600' 
                : deal.profit_amount && deal.profit_amount < 0 
                ? 'text-red-600' 
                : 'text-foreground'
            }`}>
              {formatCurrency(deal.profit_amount)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};