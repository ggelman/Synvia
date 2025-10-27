import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Input } from './Input';
import { Button } from './Button';

const FilterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
  margin-bottom: 20px;
`;

export const FilterBar = ({ filtros, onFiltroChange, onAtualizar }) => {
    return (
        <FilterContainer>
            <div>
                <label htmlFor="periodo-select" style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                    Período
                </label>
                <select id="periodo-select" name="periodo" value={filtros.periodo} onChange={onFiltroChange} style={{ padding: "12px 16px", borderRadius: "8px", border: "1px solid #ccc" }}>
                    <option value="hoje">Hoje</option>
                    <option value="semana">Esta Semana</option>
                    <option value="mes">Este Mês</option>
                    <option value="personalizado">Personalizado</option>
                </select>
            </div>

            {filtros.periodo === 'personalizado' && (
                <>
                    <Input label="Data Início" type="date" name="dataInicio" value={filtros.dataInicio} onChange={onFiltroChange} />
                    <Input label="Data Fim" type="date" name="dataFim" value={filtros.dataFim} onChange={onFiltroChange} />
                </>
            )}

            <Button variant="primary" onClick={onAtualizar}>Atualizar</Button>
        </FilterContainer>
    );
};