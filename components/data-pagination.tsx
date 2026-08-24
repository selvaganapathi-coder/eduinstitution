"use client";

import { Pagination, Select } from "antd";

type DataPaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number, pageSize: number) => void;
  loading?: boolean;
  pageSizeOptions?: number[];
};

export function DataPagination({
  page,
  pageSize,
  total,
  onChange,
  loading = false,
  pageSizeOptions = [25, 50, 100],
}: DataPaginationProps) {
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  return (
    <div className="data-pagination" aria-label="Pagination controls">
      <div className="data-pagination-summary">
        Showing {first}–{last} of {total.toLocaleString()}
      </div>
      <div className="data-pagination-controls">
        <Select
          aria-label="Rows per page"
          value={pageSize}
          disabled={loading}
          onChange={(nextPageSize) => onChange(1, nextPageSize)}
          options={pageSizeOptions.map((value) => ({ value, label: `${value} per page` }))}
          className="data-pagination-size"
        />
        <Pagination
          current={page}
          pageSize={pageSize}
          total={total}
          disabled={loading}
          showSizeChanger={false}
          responsive
          onChange={onChange}
          itemRender={(current, type, element) => {
            if (type === "prev") return <span aria-label="Previous page">Previous</span>;
            if (type === "next") return <span aria-label="Next page">Next</span>;
            return element;
          }}
        />
      </div>
    </div>
  );
}
