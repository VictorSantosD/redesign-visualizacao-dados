"""Executa o SQL DuckDB e gera o CSV tratado para o Design A."""

from pathlib import Path
import os
import duckdb

# Caminhos calculados a partir da pasta do proprio projeto.
raiz = Path(__file__).resolve().parent.parent
arquivo_original = raiz / "dados" / "big-mac-full-index.csv"
arquivo_sql = raiz / "sql" / "preparar_bigmac.sql"
arquivo_saida = raiz / "dados" / "bigmac-tratado.csv"

if not arquivo_original.is_file():
    raise FileNotFoundError(f"Arquivo CSV nao encontrado: {arquivo_original}")

# O SQL referencia caminhos relativos a raiz do repositorio.
os.chdir(raiz)

with duckdb.connect(":memory:") as conexao:
    conexao.execute(arquivo_sql.read_text(encoding="utf-8"))
    data, quantidade = conexao.execute(
        "SELECT MAX(data_referencia), COUNT(*) FROM bigmac_atual"
    ).fetchone()

if not quantidade:
    raise ValueError("Nenhum registro valido encontrado no CSV para a data mais recente.")

print(f"Data mais recente encontrada: {data:%d/%m/%Y}")
print(f"Paises exportados: {quantidade}")
print(f"CSV tratado: {arquivo_saida}")
