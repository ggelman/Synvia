import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Card } from './Card';

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled(Card)`
  text-align: center;
  padding: 20px;
  .stat-value { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
  .stat-label { color: #6c757d; font-weight: 500; }
  &.receita .stat-value { color: #28a745; }
  &.despesa .stat-value { color: #dc3545; }
  &.lucro .stat-value { color: #007bff; }
  &.vendas .stat-value { color: #17a2b8; }
`;

const formatCurrency = (value) => `R$ ${value.toFixed(2)}`;

export const StatsCards = ({ dados }) => {
    return (
        <StatsGrid>
            <StatCard className="receita">
                <div className="stat-value">{formatCurrency(dados.receita)}</div>
                <div className="stat-label">Receita Total</div>
            </StatCard>
            <StatCard className="despesa">
                <div className="stat-value">{formatCurrency(dados.despesas)}</div>
                <div className="stat-label">Despesas Total</div>
            </StatCard>
            <StatCard className="lucro">
                <div className="stat-value">{formatCurrency(dados.lucro)}</div>
                <div className="stat-label">Lucro Líquido</div>
            </StatCard>
            <StatCard className="vendas">
                <div className="stat-value">{dados.totalVendas}</div>
                <div className="stat-label">Total de Vendas</div>
            </StatCard>
        </StatsGrid>
    );
};