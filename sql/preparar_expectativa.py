#Executa DuckDB e gera os CSVs usados nos dois redesigns do caso 3 em D3.js.

from pathlib import Path
import os
import duckdb

raiz = Path(__file__).resolve().parent.parent
origem = raiz / "dados" / "life_expectancy_2025.csv"
consulta = raiz / "sql" / "preparar_expectativa.sql"
saida_a = raiz / "dados" / "expectativa-ranking.csv"
saida_b = raiz / "dados" / "expectativa-distribuicao.csv"

if not origem.is_file():
    raise FileNotFoundError(f"CSV original não encontrado: {origem}")
if not consulta.is_file():
    raise FileNotFoundError(f"Arquivo SQL não encontrado: {consulta}")

os.chdir(raiz)

with duckdb.connect(":memory:") as banco:
    banco.execute(consulta.read_text(encoding="utf-8"))

    total, minimo, maximo, media, distintos = banco.execute("""
        SELECT COUNT(*), MIN(expectativa), MAX(expectativa),
               AVG(expectativa), COUNT(DISTINCT codigo)
        FROM expectativa_validada
    """).fetchone()

    quantidade_a = banco.execute("SELECT COUNT(*) FROM expectativa_ranking").fetchone()[0]
    quantidade_b, soma_b = banco.execute("""
        SELECT COUNT(*), SUM(quantidade) FROM expectativa_distribuicao
    """).fetchone()

    if total == 0:
        raise ValueError("Nenhum registro válido encontrado no CSV original.")
    if quantidade_a != 20:
        raise ValueError(f"Ranking deveria ter 20 registros, mas tem {quantidade_a}.")
    if soma_b != total:
        raise ValueError(f"Histograma somou {soma_b}, mas há {total} registros.")
    if not saida_a.is_file() or not saida_b.is_file():
        raise RuntimeError("O DuckDB não gerou os dois arquivos de saída.")

    print(f"Registros válidos: {total}")
    print(f"Expectativa mínima: {minimo:g} anos | máxima: {maximo:g} anos")
    print(f"Média simples dos registros: {media:.2f} anos")
    print(f"Design A: {quantidade_a} registros (10 maiores e 10 menores)")
    print(f"Design B: {quantidade_b} faixas, {soma_b} registros no total")
    if distintos != total:
        print(f"Aviso: {distintos} códigos ISO distintos em {total} registros; não usamos ISO como chave única.")
    if total != 238:
        print("Aviso: o conjunto que analisamos originalmente tinha 238 registros.")
    print(f"CSV gerado: {saida_a.relative_to(raiz)}")
    print(f"CSV gerado: {saida_b.relative_to(raiz)}")