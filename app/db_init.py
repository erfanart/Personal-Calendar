from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from models import CalendarDay, TimeSlot, Month
from jalali import Jalali

def initialize_calendar(db: Session):
    # Define Persian months
    # persian_months = [
    #     "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
    #     "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
    # ]
    
    # Insert Persian months if not exists

    # for name in persian_months:
    #     existing_month = db.query(Month).filter(Month.name == name).first()

            # existing_month[i] = new_month.name
    # Define start and end dates
    first_day = datetime(2025, 3, 21)  # معادل اول فروردین ۱۴۰۴
    last_day = datetime(2026, 3, 20)   # معادل آخر اسفند ۱۴۰۴

    while first_day <= last_day:
        jalali = Jalali(first_day)
        existing_day = db.query(CalendarDay).filter_by(jalali_date=jalali.date).first()
        existing_month = db.query(Month).filter(Month.name == jalali.month).first()
        if not existing_month:
            new_month = Month(name=jalali.month,season=jalali.season)
            db.add(new_month)
            db.commit()
            db.refresh(new_month)
        if not existing_day:
            new_day = CalendarDay(jalali_date=jalali.date, day_name=jalali.day,month=new_month.id)
            db.add(new_day)
            db.commit()
            db.refresh(new_day)

            # Add 24 one-hour slots
            for hour in range(24):
                new_slot = TimeSlot(day_id=new_day.id, hour=hour)
                db.add(new_slot)
            db.commit()

        first_day += timedelta(days=1)


