from typing import Any
from sqlalchemy.ext.declarative import declarative_base, declared_attr

class CustomBase:
    # Generate __tablename__ automatically
    @declared_attr
    def __tablename__(cls) -> str:
        return cls.__name__.lower()

    # To allow having the same behavior as with Pydantic models
    def dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

Base = declarative_base(cls=CustomBase)
