import sys
import os

# Добавляем текущую директорию в путь, чтобы Python видел папку database
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database.db_setup import engine, Base
from database.models import User, UserAchievement

def create_tables():
    print("Создание таблиц в базе данных...")
    # Эта команда берет все модели, которые наследуются от Base,
    # и создает их в файле базы данных
    Base.metadata.create_all(bind=engine)
    print("База данных успешно инициализирована!")

if __name__ == "__main__":
    create_tables()