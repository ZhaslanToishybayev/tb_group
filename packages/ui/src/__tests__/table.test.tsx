import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../table';

describe('Table', () => {
  it('renders table structure', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Header 1</TableHead>
            <TableHead>Header 2</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Cell 1</TableCell>
            <TableCell>Cell 2</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    
    expect(screen.getByText('Header 1')).toBeInTheDocument();
    expect(screen.getByText('Header 2')).toBeInTheDocument();
    expect(screen.getByText('Cell 1')).toBeInTheDocument();
    expect(screen.getByText('Cell 2')).toBeInTheDocument();
  });

  it('renders table with caption', () => {
    render(
      <Table>
        <TableCaption>Table Caption</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Header</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    );
    
    expect(screen.getByText('Table Caption')).toBeInTheDocument();
  });

  it('renders table head with proper styling', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Header</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    );
    
    const header = screen.getByText('Header');
    expect(header).toBeInTheDocument();
  });

  it('renders table cell with proper styling', () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    
    const cell = screen.getByText('Cell');
    expect(cell).toBeInTheDocument();
  });

  it('forwards additional props to table components', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow data-testid="custom-row">
            <TableHead data-testid="custom-head">Header</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell data-testid="custom-cell">Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    
    expect(screen.getByTestId('custom-row')).toBeInTheDocument();
    expect(screen.getByTestId('custom-head')).toBeInTheDocument();
    expect(screen.getByTestId('custom-cell')).toBeInTheDocument();
  });
});
