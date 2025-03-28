from typing import List,Optional
import strawberry
from sqlalchemy.orm import Session,selectinload
from sqlalchemy import and_
from database import SessionLocal
from models import Month, CalendarDay, TimeSlot, Note, Tag
from schemas import MonthType, CalendarDayType, TimeSlotType, NoteType, TagType



def tagResolver(tag):
    return Tag(
        id=tag.id,
        name=tag.name
    )

def noteResolver(note):
    if note :
        return Note(
            id=note.id,
            text=note.text,
        )
    return None

def timeSlotResolver(slot):
     return TimeSlotType(
        id=slot.id, 
        hour=slot.hour,
        note= noteResolver(slot.note),
        tags=[ tagResolver(tag) for tag in slot.tags]
        )


def dayTimeSlotResolver(day):
    return CalendarDayType(
        id=day.id,
        jalali_date=day.jalali_date,
        day_name=day.day_name,
        time_slots=[ timeSlotResolver(slot) for slot in day.time_slots]
    )

# def monthDay(month):


@strawberry.type
class Query:


    @strawberry.field
    def get_calendar_days(self,id: int = None, dayName: str = None,jalaliDate: str = None) -> List[CalendarDayType]:
        with SessionLocal() as db:
            query = db.query(CalendarDay).options(
                selectinload(CalendarDay.time_slots).selectinload(TimeSlot.note),
                selectinload(CalendarDay.time_slots).selectinload(TimeSlot.tags))
            filters = []
            if id is not None:
                filters.append(CalendarDay.id == id)
            if dayName is not None:
                filters.append(CalendarDay.day_name == dayName)
            if jalaliDate is not None:
                filters.append(CalendarDay.jalali_date == jalaliDate)
            if filters:
                query = query.filter(and_(*filters))
            days = query.all()
        return [dayTimeSlotResolver(day) for day in days]



    @strawberry.field
    def get_months(self, id: Optional[int] = None, name: Optional[str] = None) -> List[MonthType]:
        with SessionLocal() as db:
        # db: Session = SessionLocal()
            query = db.query(Month).options(
                selectinload(Month.calendar_days).selectinload(CalendarDay.time_slots).selectinload(TimeSlot.note),
                selectinload(Month.calendar_days).selectinload(CalendarDay.time_slots).selectinload(TimeSlot.tags))
            filters = []
            if id is not None:
                filters.append(Month.id == id)
            if name is not None:
                filters.append(Month.name == name)
            if filters:
                query = query.filter(and_(*filters))
            months= query.all()
        # db.close()
        return [
            MonthType(
                id=month.id, 
                name=month.name, 
                season=month.season, 
                calendar_days=[dayTimeSlotResolver(day) for day in month.calendar_days],
            ) for month in months
        ]
    


    @strawberry.field
    def get_time_slots(self, id: int = None, hour: int = None) -> List[TimeSlotType]:
        with SessionLocal() as db:
            query = db.query(TimeSlot).options(
            selectinload(TimeSlot.note),  # Load note relationship
            selectinload(TimeSlot.tags)   # Load tags relationship
            )
            filters = []
            if id is not None:
                filters.append(TimeSlot.id == id)
            if hour is not None:
                filters.append(TimeSlot.hour == hour)
            if filters:
                query = query.filter(and_(*filters))           
        slots= query.all()
        return [timeSlotResolver(slot) for slot in slots]
    
    @strawberry.field
    def get_notes(self, time_slot_id: int) -> List[NoteType]:
        db: Session = SessionLocal()
        notes = db.query(Note).filter(Note.time_slot_id == time_slot_id).all()
        db.close()
        return [NoteType(id=note.id, text=note.text) for note in notes]

@strawberry.type
class Mutation:
    @strawberry.mutation
    def upsert_note(self, time_slot_id: int, text: str) -> NoteType:
        db = SessionLocal()
        try:
            # First try to find existing note for this time slot
            existing_note = db.query(Note).filter_by(time_slot_id=time_slot_id).first()
            
            if existing_note:
                # Update existing note
                existing_note.text = text
            else:
                # Create new note
                existing_note = Note(time_slot_id=time_slot_id, text=text)
                db.add(existing_note)
            
            db.commit()
            db.refresh(existing_note)
            return NoteType(id=existing_note.id, text=existing_note.text)
            
        except Exception as e:
            db.rollback()
            raise Exception(f"Failed to upsert note: {str(e)}")
        finally:
            db.close()

            
    @strawberry.mutation
    async def upsert_tags(
        self, 
        time_slot_id: int, 
        tag_names: list[str]
    ) -> list[TagType]:
        db = SessionLocal()
        try:
            # Get existing tags for this time slot
            existing_tags = (
                db.query(Tag)
                .filter_by(time_slot_id=time_slot_id)
                .all()
            )
            
            # Determine tags to add and remove
            existing_names = {t.name for t in existing_tags}
            new_names = set(tag_names)
            
            # Remove tags not in new set
            for tag in existing_tags:
                if tag.name not in new_names:
                    db.delete(tag)
            
            # Add new tags
            added_tags = []
            for name in new_names:
                if name not in existing_names:
                    new_tag = Tag(name=name, time_slot_id=time_slot_id)
                    db.add(new_tag)
                    added_tags.append(new_tag)
            
            db.commit()
            
            # Return all tags for this time slot
            updated_tags = (
                db.query(Tag)
                .filter_by(time_slot_id=time_slot_id)
                .all()
            )
            
            return [TagType(id=t.id, name=t.name) for t in updated_tags]
            
        except Exception as e:
            db.rollback()
            raise Exception(f"Failed to update tags: {str(e)}")
        finally:
            db.close()
