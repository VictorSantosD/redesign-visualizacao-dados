-- Consulta dos dados da pesquisa YouGov sobre Kidult Hobbies.
-- A planilha contém 20 hobbies e quatro faixas etárias.
SELECT *
FROM read_csv_auto(
    'dados/kidult.csv',
    delim = ';',
    header = true
);