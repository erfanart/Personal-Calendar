from persiantools.jdatetime import JalaliDateTime
from persiantools import characters, digits
from datetime import datetime, timedelta

persian_days = {
    "Shanbeh": "شنبه",
    "Yekshanbeh": "یکشنبه",
    "Doshanbeh": "دوشنبه",
    "Seshanbeh": "سه‌شنبه",
    "Chaharshanbeh": "چهارشنبه",
    "Panjshanbeh": "پنج‌شنبه",
    "Jomeh": "جمعه"
}
persian_months = {    
    "Farvardin":["فروردین","بهار"], 
    "Ordibehesht":["اردیبهشت", "بهار"],
    "Khordad":["خرداد", "بهار"], 
    "Tir":["تیر", "تابستان"], 
    "Mordad":["مرداد", "تابستان"], 
    "Shahrivar":["شهریور", "تابستان"],
    "Mehr":["مهر", "پاییز"], 
    "Aban":["آبان", "پاییز"], 
    "Azar":["آذر", "پاییز"],
    "Dey":["دی", "زمستان"], 
    "Bahman":["بهمن", "زمستان"], 
    "Esfand":["اسفند", "زمستان"]
}


class Jalali:
    def __init__(self,input_date):
        self.input_date = JalaliDateTime.to_jalali(input_date)
    @property
    def day(self):
        """برمی‌گرداند نام روز به فارسی"""
        day_name_en = self.input_date.strftime('%A')  # روز به انگلیسی
        return persian_days.get(day_name_en, day_name_en)
        # return day_name_en
    
    @property
    def date(self):
        """برمی‌گرداند نام روز به انگلیسی"""
        return self.input_date.strftime('%Y-%m-%d')
    
    @property
    def month(self):
        """برمی‌گرداند نام روز به انگلیسی"""
        month_name_en = self.input_date.strftime('%B')
        return persian_months.get(month_name_en,month_name_en)[0]
    
    @property
    def season(self):
        """برمی‌گرداند نام روز به انگلیسی"""
        month_name_en = self.input_date.strftime('%B')
        return persian_months.get(month_name_en,month_name_en)[1]


# first_day = datetime(2025, 2, 25)
# print(Jalali(first_day).season)