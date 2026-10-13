"""Executa as consultas DuckDB e cria o CSV historico do Design B."""

from pathlib import Path
import os
import duckdb

# Localiza os caminhos a partir da raiz do projeto.
raiz = Path(__file__).resolve().parent.parent
arquivo_original = raiz / "dados" / "big-mac-full-index.csv"
arquivo_sql = raiz / "sql" / "preparar_bigmac_historico.sql"
arquivo_saida = raiz / "dados" / "bigmac-historico.csv"

if not arquivo_original.is_file():
    raise FileNotFoundError(f"CSV original nao encontrado: {arquivo_original}")

# Caminhos relativos no SQL sao resolvidos a partir da raiz do projeto.
os.chdir(raiz)

with duckdb.connect(":memory:") as conexao:
    conexao.execute(arquivo_sql.read_text(encoding="utf-8"))
    quantidade, paises, primeira, ultima = conexao.execute("""
        SELECT COUNT(*), COUNT(DISTINCT codigo),
               MIN(data_referencia), MAX(data_referencia)
        FROM bigmac_historico
        WHERE data_referencia IS NOT NULL
          AND indice_percentual IS NOT NULL
    """).fetchone()

if not quantidade:
    raise ValueError("Nenhum registro historico valido encontrado.")

print(f"Periodo: {primeira:%m/%Y} a {ultima:%m/%Y}")
print(f"Registros validos: {quantidade} | Paises: {paises}")
print(f"CSV historico gerado: {arquivo_saida}")
