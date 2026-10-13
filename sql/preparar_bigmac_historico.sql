-- Design B - Serie historica do Big Mac Index.
-- Seleciona os atributos usados no grafico e converte as datas e percentuais.
-- Mantem todos os paises para que o grafico possa ser atualizado depois.

CREATE OR REPLACE TEMP VIEW bigmac_historico AS
SELECT
    TRY_STRPTIME(date, '%m/%d/%Y')::DATE AS data_referencia,
    name AS pais,
    iso_a3 AS codigo,
    ROUND(TRY_CAST(USD_raw AS DOUBLE) * 100, 2) AS indice_percentual
FROM read_csv_auto('dados/big-mac-full-index.csv', all_varchar = true)
WHERE iso_a3 NOT IN ('USA', 'EUZ');

-- Exporta os registros validos para uso no D3.js.
COPY (
    SELECT data_referencia, pais, codigo, indice_percentual
    FROM bigmac_historico
    WHERE data_referencia IS NOT NULL
      AND indice_percentual IS NOT NULL
    ORDER BY codigo, data_referencia
) TO 'dados/bigmac-historico.csv' (HEADER, DELIMITER ',');
