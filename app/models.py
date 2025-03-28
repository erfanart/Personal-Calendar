from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Month(Base):
    __tablename__ = "months"
    id = Column(Integer, primary_key=True,index=True)  # 1-12
    name = Column(String, unique=True)  # "فروردین", "اردیبهشت", ...
    season = Column(String)  # "بهار", "تابستان", ...
    calendar_days = relationship("CalendarDay", back_populates="month_rel")



class CalendarDay(Base):
    __tablename__ = "calendar_days"
    id = Column(Integer, primary_key=True, index=True)
    jalali_date = Column(String, unique=True)  # تاریخ شمسی به‌صورت متن
    day_name = Column(String)
    time_slots = relationship("TimeSlot", back_populates="day")
    month = Column(String, ForeignKey("months.id"))
    month_rel = relationship("Month", back_populates="calendar_days")

class TimeSlot(Base):
    __tablename__ = "time_slots"
    id = Column(Integer, primary_key=True)
    day_id = Column(Integer, ForeignKey("calendar_days.id"))
    hour = Column(Integer)  # ساعت (۰ تا ۲۳)
    day = relationship("CalendarDay", back_populates="time_slots")
    note = relationship("Note", back_populates="time_slot" ,uselist=False)
    tags = relationship("Tag", back_populates="time_slot")

class Note(Base):
    __tablename__ = "notes"
    id = Column(Integer, primary_key=True)
    text = Column(String, nullable=True)
    time_slot_id = Column(Integer, ForeignKey("time_slots.id"))
    time_slot = relationship("TimeSlot", back_populates="note")

class Tag(Base):
    __tablename__ = "tags"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    time_slot_id = Column(Integer, ForeignKey("time_slots.id"))
    time_slot = relationship("TimeSlot", back_populates="tags")
