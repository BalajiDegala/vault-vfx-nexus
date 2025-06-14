
import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis
} from "@/components/ui/pagination";

interface ProjectsPaginationProps {
  pageCount: number;
  currentPage: number;
  goToPage: (n: number) => void;
  pageNumbers: number[];
}

const ProjectsPagination: React.FC<ProjectsPaginationProps> = ({
  pageCount, currentPage, goToPage, pageNumbers
}) => {
  if (pageCount <= 1) return null;
  return (
    <Pagination className="mt-4">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => goToPage(currentPage - 1)}
            tabIndex={0}
            style={{ cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
            aria-disabled={currentPage === 1}
          />
        </PaginationItem>
        {pageNumbers[0] > 1 && (
          <PaginationItem>
            <PaginationLink onClick={() => goToPage(1)}>{1}</PaginationLink>
            {pageNumbers[0] > 2 && <PaginationEllipsis />}
          </PaginationItem>
        )}
        {pageNumbers.map((num) => (
          <PaginationItem key={num}>
            <PaginationLink
              isActive={num === currentPage}
              onClick={() => goToPage(num)}
            >
              {num}
            </PaginationLink>
          </PaginationItem>
        ))}
        {pageNumbers[pageNumbers.length - 1] < pageCount && (
          <PaginationItem>
            {pageNumbers[pageNumbers.length - 1] < pageCount - 1 && <PaginationEllipsis />}
            <PaginationLink onClick={() => goToPage(pageCount)}>{pageCount}</PaginationLink>
          </PaginationItem>
        )}
        <PaginationItem>
          <PaginationNext
            onClick={() => goToPage(currentPage + 1)}
            tabIndex={0}
            style={{ cursor: currentPage === pageCount ? "not-allowed" : "pointer" }}
            aria-disabled={currentPage === pageCount}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default ProjectsPagination;
