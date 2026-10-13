-- Caso 3 — Life Expectancy by Country in 2025
-- Aula 05: atributo quantitativo (expectativa) e categórico (país/território).
-- Aula 06: seleção, filtragem, ordenação, binning e agregação.
-- Execute com: py sql/preparar_expectativa.py (na raiz do repositório).

-- 1. Lê o CSV original, converte os campos e descarta valores inválidos.
-- Não usamos o código ISO como chave única: ele está duplicado no CSV.
CREATE OR REPLACE TEMP VIEW expectativa_validada AS
WITH leitura AS (
    SELECT
        TRY_CAST(rank AS INTEGER) AS posicao_original,
        TRIM(country) AS pais,
        UPPER(TRIM(iso_code)) AS codigo,
        TRY_CAST(life_expectancy_2025 AS DOUBLE) AS expectativa
    FROM read_csv_auto('dados/life_expectancy_2025.csv', all_varchar = true)
)
SELECT posicao_original, pais, codigo, expectativa
FROM leitura
WHERE pais IS NOT NULL AND pais <> ''
  AND expectativa IS NOT NULL
  AND expectativa BETWEEN 0 AND 120;

-- 2. Design A: dez maiores e dez menores expectativas.
-- Desempate por nome do país/território, em ordem alfabética.
-- A posição original NÃO é usada para desempatar valores arredondados.
CREATE OR REPLACE TEMP VIEW expectativa_ranking AS
WITH classificados AS (
    SELECT
        pais,
        codigo,
        expectativa,
        ROW_NUMBER() OVER (ORDER BY expectativa DESC, pais ASC) AS ordem_maiores,
        ROW_NUMBER() OVER (ORDER BY expectativa ASC, pais ASC) AS ordem_menores
    FROM expectativa_validada
)
SELECT pais, codigo, expectativa, 'maiores' AS grupo, ordem_maiores AS ordem
FROM classificados
WHERE ordem_maiores <= 10
UNION ALL
SELECT pais, codigo, expectativa, 'menores' AS grupo, ordem_menores AS ordem
FROM classificados
WHERE ordem_menores <= 10;

COPY (
    SELECT pais, codigo, expectativa, grupo, ordem
    FROM expectativa_ranking
    ORDER BY CASE grupo WHEN 'maiores' THEN 0 ELSE 1 END, ordem
) TO 'dados/expectativa-ranking.csv' (HEADER, DELIMITER ',');

-- 3. Design B: histogramas usam intervalos de mesma largura (5 anos).
-- Intervalos [55,60), [60,65), etc. Para números inteiros: 55–59, 60–64...
CREATE OR REPLACE TEMP VIEW expectativa_distribuicao AS
WITH faixas AS (
    SELECT CAST(FLOOR(expectativa / 5.0) * 5 AS INTEGER) AS faixa_inicio
    FROM expectativa_validada
)
SELECT
    faixa_inicio,
    faixa_inicio + 4 AS faixa_fim,
    COUNT(*) AS quantidade
FROM faixas
GROUP BY faixa_inicio;

COPY (
    SELECT faixa_inicio, faixa_fim, quantidade
    FROM expectativa_distribuicao
    ORDER BY faixa_inicio
) TO 'dados/expectativa-distribuicao.csv' (HEADER, DELIMITER ',');