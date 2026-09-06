import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Table, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

# Association table for User <-> Role
user_roles = Table(
    'user_roles',
    Base.metadata,
    Column('user_id', String(36), ForeignKey('users.id', ondelete='CASCADE'), primary_key=True),
    Column('role_id', String(36), ForeignKey('roles.id', ondelete='CASCADE'), primary_key=True)
)

# Association table for Role <-> Permission
role_permissions = Table(
    'role_permissions',
    Base.metadata,
    Column('role_id', String(36), ForeignKey('roles.id', ondelete='CASCADE'), primary_key=True),
    Column('permission_id', String(36), ForeignKey('permissions.id', ondelete='CASCADE'), primary_key=True)
)

class User(Base):
    __tablename__ = 'users'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(50), nullable=False, unique=True, index=True)
    email = Column(String(100), nullable=False, unique=True, index=True)
    full_name = Column(String(100), nullable=False)
    department = Column(String(100), default='R&D Governance')
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    roles = relationship('Role', secondary=user_roles, back_populates='users', lazy='joined')

class Role(Base):
    __tablename__ = 'roles'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(50), nullable=False, unique=True)
    description = Column(String(255), nullable=True)

    # Relationships
    users = relationship('User', secondary=user_roles, back_populates='roles')
    permissions = relationship('Permission', secondary=role_permissions, back_populates='roles', lazy='joined')

class Permission(Base):
    __tablename__ = 'permissions'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code = Column(String(50), nullable=False, unique=True, index=True)
    description = Column(String(255), nullable=True)

    # Relationships
    roles = relationship('Role', secondary=role_permissions, back_populates='permissions')
