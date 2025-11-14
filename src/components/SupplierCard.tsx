import { Star, MapPin, Users } from 'lucide-react';
import { Card, Tag } from 'antd';

interface SupplierCardProps {
  supplier: {
    id: string;
    name: string;
    description: string;
    image: string;
    rating: number;
    reviewCount: number;
    location: string;
    services: string[];
    startingPrice: string;
    completedEvents: number;
  };
  onClick: () => void;
}

export function SupplierCard({ supplier, onClick }: SupplierCardProps) {
  return (
    <Card
      hoverable
      onClick={onClick}
      cover={
        <img
          src={supplier.image}
          alt={supplier.name}
          className="w-full h-48 object-cover"
        />
      }
    >
      <div className="space-y-3">
        <h3 className="text-xl font-semibold text-gray-900">{supplier.name}</h3>
        <p className="text-gray-600 text-sm line-clamp-2">{supplier.description}</p>

        <div className="flex items-center space-x-2">
          <Star className="w-5 h-5 text-yellow-400 fill-current" />
          <span className="font-medium">{supplier.rating}</span>
          <span className="text-gray-500 text-sm">({supplier.reviewCount})</span>
        </div>

        <div className="flex items-center text-gray-600 text-sm">
          <MapPin className="w-4 h-4 mr-1" />
          <span>{supplier.location}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {supplier.services.slice(0, 3).map((service) => (
            <Tag key={service} color="blue">{service}</Tag>
          ))}
          {supplier.services.length > 3 && (
            <Tag>+{supplier.services.length - 3}</Tag>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-lg font-semibold text-green-600">
            R$ {supplier.startingPrice}
          </span>
          <div className="flex items-center text-gray-500 text-sm">
            <Users className="w-4 h-4 mr-1" />
            <span>{supplier.completedEvents}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
