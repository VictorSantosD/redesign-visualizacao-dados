-- Prepara os dados para o Design A (Big Mac Index).
-- O arquivo original utiliza datas no formato M/D/AAAA.
-- Seleciona automaticamente a data mais recente presente no CSV.

CREATE OR REPLACE TEMP VIEW bigmac_atual AS
WITH origem AS (
    SELECT
        TRY_STRPTIME(date, '%m/%d/%Y')::DATE AS data_referencia,
        name AS pais,
        iso_a3 AS codigo,
        TRY_CAST(USD_raw AS DOUBLE) AS usd_raw,
        TRY_CAST(dollar_price AS DOUBLE) AS preco_dolar
    FROM read_csv_auto('dados/big-mac-full-index.csv', all_varchar = true)
),
ultimo_periodo AS (
    SELECT MAX(data_referencia) AS data_maxima
    FROM origem
)
SELECT
    origem.pais,
    origem.codigo,
    origem.data_referencia,
    ROUND(origem.usd_raw * 100, 2) AS indice_percentual,
    ROUND(origem.preco_dolar, 2) AS preco_dolar
FROM origem
CROSS JOIN ultimo_periodo
WHERE origem.data_referencia = ultimo_periodo.data_maxima
  AND origem.usd_raw IS NOT NULL
  -- Exclui Estados Unidos (referencia) e area do euro (agregado regional).
  AND origem.codigo NOT IN ('USA', 'EUZ');

-- CSV tratado para o D3.js (grafico de barras divergentes).
COPY (
    SELECT pais, codigo, data_referencia, indice_percentual, preco_dolar
    FROM bigmac_atual
    ORDER BY indice_percentual DESC
) TO 'dados/bigmac-tratado.csv' (HEADER, DELIMITER ',');
