import { Button, Card, Tag, Rate, Avatar } from 'antd';

interface ReviewCardProps {
  supplier: {
    id: string;
    companyName: string;
    description: string;
    avatar: string;
    services: string[];
    hasReview: boolean;
    eventId: string;
  };
  onReview: (supplierId: string, eventId: string) => void;
}

export function ReviewCard({ supplier, onReview }: ReviewCardProps) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar size={64} src={supplier.avatar} />
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {supplier.companyName}
            </h3>
            <p className="text-gray-600">{supplier.description}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {supplier.services.slice(0, 3).map((service) => (
                <Tag key={service} color="blue">
                  {service}
                </Tag>
              ))}
            </div>
          </div>
        </div>

        <div>
          {supplier.hasReview ? (
            <div className="text-center">
              <Rate disabled defaultValue={5} />
              <p className="text-sm text-green-600 font-medium mt-2">
                Avaliado
              </p>
            </div>
          ) : (
            <Button
              type="primary"
              size="large"
              onClick={() => onReview(supplier.id, supplier.eventId)}
            >
              Avaliar
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
