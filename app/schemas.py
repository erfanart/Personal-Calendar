import strawberry
from typing import List,Optional

@strawberry.type
class TagType:
    id: int
    name: str

@strawberry.type
class NoteType:
    id: int
    text: str



@strawberry.type
class TimeSlotType:
    id: int
    hour: int
    note: Optional[NoteType]
    tags: List[TagType]



@strawberry.type
class CalendarDayType:
    id: int
    jalali_date: str
    day_name: str
    time_slots: List[TimeSlotType]

@strawberry.type
class MonthType:
    id: int
    name: str
    season: str
    calendar_days: List[CalendarDayType]



