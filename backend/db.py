import os
import mysql.connector
from mysql.connector import pooling
from dotenv import load_dotenv

load_dotenv()

dbconfig = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": int(os.getenv("DB_PORT", "3306")),
    "user": os.getenv("DB_USER", "research_app"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "research_portal"),
}

pool = pooling.MySQLConnectionPool(
    pool_name="research_portal_pool",
    pool_size=5,
    **dbconfig
)


def get_connection():
    return pool.get_connection()
