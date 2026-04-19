from passlib.context import CryptContext

# Настройка механизма шифрования bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str):
    """Превращает пароль в нечитаемый хэш"""
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    """Проверяет, совпадает ли введенный пароль с хэшем в базе"""
    return pwd_context.verify(plain_password, hashed_password)