
import pandas as pd
import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

def get_sales_data_from_db(host, database, user, password):
    conn = None
    try:
        conn = mysql.connector.connect(
            host=host,
            database=database,
            user=user,
            password=password
        )
        if conn.is_connected():
            print('Conectado ao banco de dados MySQL com sucesso!')
            cursor = conn.cursor(dictionary=True)
            query = """
            SELECT
                v.data AS ds,
                ip.quantidade AS y,
                p.nome AS item_name
            FROM
                Venda v
            JOIN
                Pedido pe ON v.id_pedido = pe.id_pedido
            JOIN
                item_pedido ip ON pe.id_pedido = ip.id_pedido
            JOIN
                produto p ON ip.id_produto = p.id_produto
            ORDER BY
                v.data
            """
            cursor.execute(query)
            records = cursor.fetchall()
            return pd.DataFrame(records)

    except Error as e:
        print(f"Erro ao conectar ou buscar dados do MySQL: {e}")
        return pd.DataFrame()
    finally:
        if conn is not None and conn.is_connected():
            conn.close()
            print('Conexo MySQL fechada.')

def preprocess_data(df):
    if df.empty:
        return pd.DataFrame()

    df['ds'] = pd.to_datetime(df['ds'])

    df_processed = df.groupby(['ds', 'item_name'])['y'].sum().reset_index()

    return df_processed

if __name__ == '__main__':
    load_dotenv()

    db_host = os.getenv('DB_HOST', 'localhost')
    db_database = os.getenv('DB_DATABASE', 'synvia_platform')
    db_user = os.getenv('DB_USER', 'root')
    db_password = os.getenv('DB_PASSWORD')

    if not db_password:
        print("ERRO CRTICO: A varivel de ambiente DB_PASSWORD no est definida.")
        print("Crie um arquivo .env no diretrio 'ai_module' e adicione a linha: DB_PASSWORD='sua_senha'")
        exit(1)

    sales_df = get_sales_data_from_db(
        host=db_host,
        database=db_database,
        user=db_user,
        password=db_password
    )

    if not sales_df.empty:
        print(f"Sucesso! {len(sales_df)} registros de vendas brutos obtidos do banco de dados.")
        processed_df = preprocess_data(sales_df)
        if not processed_df.empty:
            print("Dados pr-processados para o Prophet:")
            print(processed_df.head())
            processed_df.to_csv('processed_sales_data.csv', index=False)
            print(f"Dados processados salvos em 'processed_sales_data.csv'. Total de {len(processed_df)} linhas.")
        else:
            print("AVISO: Os dados de vendas foram obtidos, mas resultaram em um conjunto vazio aps o processamento.")
    else:
        print("ERRO CRTICO: No foi possvel obter dados de vendas do banco de dados.")
        print("Verifique a conexo, as credenciais e se a query no script retorna algum dado.")
        exit(1)
