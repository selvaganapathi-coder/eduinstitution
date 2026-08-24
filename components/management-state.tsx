import { Alert, Button, Empty, Skeleton } from "antd";
import type { ReactNode } from "react";

type ManagementSkeletonProps = {
  rows?: number;
};

export function ManagementSkeleton({ rows = 4 }: ManagementSkeletonProps) {
  return (
    <div className="management-skeleton" aria-label="Loading content">
      {Array.from({ length: rows }, (_, index) => (
        <div className="management-skeleton-row" key={index}>
          <Skeleton active title={{ width: "28%" }} paragraph={{ rows: 1, width: ["60%"] }} />
        </div>
      ))}
    </div>
  );
}

type ManagementEmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function ManagementEmptyState({ title, description, action }: ManagementEmptyStateProps) {
  return (
    <div className="management-empty-state">
      <Empty description={null} />
      <h3>{title}</h3>
      <p>{description}</p>
      {action ? <div className="management-empty-action">{action}</div> : null}
    </div>
  );
}

type ManagementErrorStateProps = {
  description: string;
  onRetry?: () => void;
};

export function ManagementErrorState({ description, onRetry }: ManagementErrorStateProps) {
  return (
    <div className="management-error-state">
      <Alert type="error" showIcon message="We couldn't load this information." description={description} />
      {onRetry ? <Button onClick={onRetry}>Try again</Button> : null}
    </div>
  );
}
