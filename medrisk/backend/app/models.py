from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Index, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base


class Device(Base):
    __tablename__ = "devices"
    id: Mapped[str] = mapped_column(String(120), primary_key=True)
    product_name: Mapped[str] = mapped_column(String(500))
    catalog_json: Mapped[str] = mapped_column(Text)
    rag_version: Mapped[int] = mapped_column(Integer, default=1)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    passages: Mapped[list["Passage"]] = relationship(cascade="all, delete-orphan")
    sources: Mapped[list["Source"]] = relationship(cascade="all, delete-orphan")


class Passage(Base):
    __tablename__ = "passages"
    __table_args__ = (
        UniqueConstraint("device_id", "position"),
        Index("ix_passages_device", "device_id"),
    )
    id: Mapped[int] = mapped_column(primary_key=True)
    device_id: Mapped[str] = mapped_column(ForeignKey("devices.id", ondelete="CASCADE"))
    position: Mapped[int] = mapped_column(Integer)
    tag: Mapped[str] = mapped_column(String(80))
    content: Mapped[str] = mapped_column(Text)


class Source(Base):
    __tablename__ = "sources"
    __table_args__ = (Index("ix_sources_device", "device_id"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    device_id: Mapped[str] = mapped_column(ForeignKey("devices.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(300))
    content: Mapped[str] = mapped_column(Text)
    checksum: Mapped[str] = mapped_column(String(64))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class RefreshRun(Base):
    __tablename__ = "refresh_runs"
    id: Mapped[int] = mapped_column(primary_key=True)
    status: Mapped[str] = mapped_column(String(30))
    trigger: Mapped[str] = mapped_column(String(30))
    details: Mapped[str] = mapped_column(Text, default="")
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
