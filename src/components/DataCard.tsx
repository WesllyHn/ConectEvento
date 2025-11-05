import { Card, Tag } from 'antd';
import { ReactNode } from 'react';

interface DataCardProps {
  title?: string;
  children: ReactNode;
  extra?: ReactNode;
  status?: {
    text: string;
    color: string;
  };
}

export function DataCard({ title, children, extra, status }: DataCardProps) {
  return (
    <Card
      title={title}
      extra={
        <div className="flex items-center gap-2">
          {status && <Tag color={status.color}>{status.text}</Tag>}
          {extra}
        </div>
      }
    >
      {children}
    </Card>
  );
}
